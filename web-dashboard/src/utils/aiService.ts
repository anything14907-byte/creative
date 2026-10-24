/**
 * AI Service for Optional "Smart Analysis" mode in PDF Notes Extractor.
 * 
 * SECURITY & PRIVACY PRINCIPLES:
 * 1. The API key is stored ONLY in a dedicated, isolated IndexedDB database ('PyqRankerCredentialsDB').
 * 2. It is NEVER stored in localStorage, never included in backups, and never transmitted to any PyqRanker server.
 * 3. Never prints or logs the user's API key anywhere.
 * 4. Dynamically discovers models using the ListModels endpoint; does NOT hardcode any single model name.
 * 5. Automatically selects the optimal working model (flash models newest first -> other text models -> first working).
 * 6. If a model fails with "not found" or "not supported", automatically refreshes models and retries once before fallback.
 */

import { PracticeQuestionItem, KeyTerm, FormulasAndAlgorithms } from './notesAnalyzer';

const CREDENTIALS_DB_NAME = 'PyqRankerCredentialsDB';
const CREDENTIALS_STORE_NAME = 'credentials';
const GEMINI_KEY_ID = 'gemini_api_key';
const GEMINI_MODEL_ID = 'gemini_selected_model';

// =========================================================================
// 1. ISOLATED INDEXEDDB CREDENTIALS STORAGE (Never exported in backups)
// =========================================================================

function openCredentialsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const request = indexedDB.open(CREDENTIALS_DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(CREDENTIALS_STORE_NAME)) {
        db.createObjectStore(CREDENTIALS_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function getSavedApiKey(): Promise<string | null> {
  try {
    const db = await openCredentialsDB();
    return new Promise((resolve) => {
      const tx = db.transaction(CREDENTIALS_STORE_NAME, 'readonly');
      const store = tx.objectStore(CREDENTIALS_STORE_NAME);
      const req = store.get(GEMINI_KEY_ID);
      req.onsuccess = () => {
        resolve(req.result ? req.result.value : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Error reading API key from IndexedDB:', err);
    return null;
  }
}

export async function saveApiKey(apiKey: string): Promise<void> {
  const db = await openCredentialsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CREDENTIALS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CREDENTIALS_STORE_NAME);
    const req = store.put({
      id: GEMINI_KEY_ID,
      value: apiKey.trim(),
      updatedAt: Date.now()
    });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteApiKey(): Promise<void> {
  const db = await openCredentialsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CREDENTIALS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CREDENTIALS_STORE_NAME);
    const req = store.delete(GEMINI_KEY_ID);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSavedModel(): Promise<string | null> {
  try {
    const db = await openCredentialsDB();
    return new Promise((resolve) => {
      const tx = db.transaction(CREDENTIALS_STORE_NAME, 'readonly');
      const store = tx.objectStore(CREDENTIALS_STORE_NAME);
      const req = store.get(GEMINI_MODEL_ID);
      req.onsuccess = () => {
        resolve(req.result?.value || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveModel(model: string): Promise<void> {
  if (!model || !model.trim()) return;
  const db = await openCredentialsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CREDENTIALS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CREDENTIALS_STORE_NAME);
    const req = store.put({
      id: GEMINI_MODEL_ID,
      value: model.trim().replace(/^models\//, ''),
      updatedAt: Date.now()
    });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// =========================================================================
// 2. DYNAMIC MODEL DISCOVERY & AUTOMATIC RANKING (NO HARDCODING)
// =========================================================================

/**
 * Calls the provider's ListModels endpoint and keeps only models supporting generateContent.
 */
export async function listSupportedModels(apiKey: string): Promise<string[]> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    throw new Error('API key cannot be empty.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(trimmedKey)}`;
  
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
  } catch {
    throw new Error('Could not reach any model, check your key or internet');
  }

  if (!response.ok) {
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key, please check your key from Google AI Studio');
    }
    throw new Error('Could not reach any model, check your key or internet');
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error('Could not reach any model, check your key or internet');
  }

  if (!data || !Array.isArray(data.models)) {
    throw new Error('Could not reach any model, check your key or internet');
  }

  // Keep only models that support generateContent
  const supported = data.models
    .filter((m: any) => m && Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
    .map((m: any) => String(m.name || '').replace(/^models\//, '').trim())
    .filter((name: string) => name.length > 0);

  if (supported.length === 0) {
    throw new Error('Could not reach any model, check your key or internet');
  }

  return supported;
}

/**
 * Extracts numeric version from model name (e.g. "gemini-2.5-flash" -> 2.5, "gemini-2.0" -> 2.0).
 */
function extractModelVersion(name: string): number {
  const match = name.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Checks if a model name contains excluded tags (preview, exp, image, tts, embedding, lite).
 */
function isExcludedModelName(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes('preview') ||
    lower.includes('exp') ||
    lower.includes('image') ||
    lower.includes('tts') ||
    lower.includes('embedding') ||
    lower.includes('lite')
  );
}

/**
 * Sorts available models by user priority:
 * 1. Models containing "flash" (newest version first, ignoring preview, exp, image, tts, embedding, lite).
 * 2. Any other text model (newest version first).
 * 3. Any remaining models.
 */
export function sortModelsByPreference(models: string[]): string[] {
  // 1. Flash models
  const flashCandidates = models.filter(m => {
    const lower = m.toLowerCase();
    return lower.includes('flash') && !isExcludedModelName(lower);
  }).sort((a, b) => {
    const diff = extractModelVersion(b) - extractModelVersion(a);
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  });

  // 2. Other text models (excluding image/tts/embedding)
  const otherTextCandidates = models.filter(m => {
    const lower = m.toLowerCase();
    const isExcluded = lower.includes('image') || lower.includes('tts') || lower.includes('embedding') || lower.includes('exp');
    return !lower.includes('flash') && !isExcluded;
  }).sort((a, b) => {
    const diff = extractModelVersion(b) - extractModelVersion(a);
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  });

  // 3. Remaining models
  const remaining = models.filter(m => !flashCandidates.includes(m) && !otherTextCandidates.includes(m));

  return [...flashCandidates, ...otherTextCandidates, ...remaining];
}

/**
 * Sends a tiny test request ("reply OK") to confirm a model responds without error.
 */
export async function testModelQuick(apiKey: string, model: string): Promise<boolean> {
  const cleanModel = model.replace(/^models\//, '');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'reply OK' }] }],
        generationConfig: { maxOutputTokens: 5, temperature: 0.1 }
      }),
      signal: controller.signal
    });

    clearTimeout(timer);
    if (!response.ok) return false;

    const data = await response.json();
    return !!(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch {
    return false;
  }
}

/**
 * Finds and tests the first working model in priority order and saves it.
 */
export async function pickWorkingModel(
  apiKey: string,
  candidateModels?: string[]
): Promise<string> {
  const models = candidateModels && candidateModels.length > 0 
    ? candidateModels 
    : await listSupportedModels(apiKey);

  const prioritized = sortModelsByPreference(models);

  for (const candidate of prioritized) {
    const ok = await testModelQuick(apiKey, candidate);
    if (ok) {
      await saveModel(candidate);
      return candidate;
    }
  }

  throw new Error('Could not reach any model, check your key or internet');
}

/**
 * Test key action for Settings: calls ListModels, verifies preferred or auto-detected model,
 * and returns plain, clean messages without ever exposing the key.
 */
export async function testApiKey(
  apiKey: string,
  preferredModel?: string
): Promise<{ success: boolean; message: string; workingModel?: string; models: string[] }> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return { success: false, message: 'API key cannot be empty.', models: [] };
  }

  try {
    const models = await listSupportedModels(trimmed);
    if (models.length === 0) {
      return { success: false, message: 'Could not reach any model, check your key or internet', models: [] };
    }

    // Try preferred model if provided
    if (preferredModel && models.includes(preferredModel)) {
      const preferredWorks = await testModelQuick(trimmed, preferredModel);
      if (preferredWorks) {
        await saveModel(preferredModel);
        return {
          success: true,
          message: `Your key is valid, using model ${preferredModel}`,
          workingModel: preferredModel,
          models
        };
      }
    }

    // Otherwise automatically pick the first working model by priority
    const workingModel = await pickWorkingModel(trimmed, models);
    return {
      success: true,
      message: `Your key is valid, using model ${workingModel}`,
      workingModel,
      models
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Could not reach any model, check your key or internet',
      models: []
    };
  }
}

// =========================================================================
// 3. SMART ANALYSIS WITH CHUNKING & STRICT JSON VALIDATION
// =========================================================================

export interface SmartAnalysisResult {
  summary: string[];
  keyTerms: KeyTerm[];
  formulasAndAlgorithms: FormulasAndAlgorithms;
  practiceQuestions: PracticeQuestionItem[];
  modelUsed?: string;
}

/**
 * Split long cleaned text into manageable chunks at paragraph boundaries.
 */
function splitIntoChunks(text: string, maxChunkLength: number = 18000): string[] {
  if (text.length <= maxChunkLength) {
    return [text];
  }

  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const p of paragraphs) {
    if (currentChunk.length + p.length > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = p;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + p;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Validate and clean JSON response from Gemini
 */
function validateAndParseAiJson(rawJsonText: string): any {
  let cleaned = rawJsonText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\s*\r?\n?/i, '').replace(/```\s*$/, '').trim();
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: any) {
    throw new Error(`Model did not return valid JSON: ${err.message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Model output is not a JSON object.');
  }

  return parsed;
}

/**
 * Send a single chunk to the chosen model and request strict structured JSON
 */
async function analyzeChunkWithGemini(
  chunkText: string,
  apiKey: string,
  model: string
): Promise<{
  summary: string[];
  keyTerms: Array<{ term: string; definition: string }>;
  formulas: string[];
  algorithms: string[];
  practiceQuestions: Array<{ question: string; type: string; suggestedMarks: number }>;
}> {
  const cleanModel = model.replace(/^models\//, '');
  const prompt = `You are an academic exam notes analyzer. Analyze the provided study notes text and return ONLY a valid JSON object. Do not include markdown formatting around the JSON, and do not include any preamble or extra text.

Return exactly this JSON structure:
{
  "summary": [
    "3 to 5 complete, informative sentences summarizing the core subject matter of the text."
  ],
  "keyTerms": [
    {
      "term": "Term Name",
      "definition": "Clear concise academic definition (1-2 sentences)."
    }
  ],
  "formulas": [
    "List of mathematical equations or formulas found in the text, e.g. E = mc^2 or Throughput = N / T."
  ],
  "algorithms": [
    "Step-by-step algorithms or procedural workflows, e.g. Step 1: Initialize ready queue, Step 2: ..."
  ],
  "practiceQuestions": [
    {
      "question": "A complete sentence question of at least 5 words, e.g. 'Define Virtual Memory and explain its paging mechanism.'",
      "type": "define" | "explain" | "derive" | "algorithm" | "differentiate",
      "suggestedMarks": 2 | 5 | 10
    }
  ]
}

Strict requirements:
1. "summary" must contain 3 to 5 grammatically complete sentences. No repeated sentences.
2. "keyTerms" must contain maximum 12 high-yield terms with distinct definitions.
3. Every question in "practiceQuestions" MUST be a complete sentence of at least 5 words ending with a question mark or period. Never return cut-off fragments.
4. "suggestedMarks" must be strictly 2 for definitions, 5 for explanations or differentiations, and 10 for derivations or algorithms.
5. "formulas" and "algorithms" must be clean single-line strings. If none found, return an empty array [].

Study notes text:
---
${chunkText}
---`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    let errMsg = `HTTP ${response.status}`;
    try {
      const errObj = await response.json();
      if (errObj.error?.message) {
        errMsg = errObj.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(`AI Provider error: ${errMsg}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('AI returned an empty response.');
  }

  const parsed = validateAndParseAiJson(rawText);

  return {
    summary: Array.isArray(parsed.summary)
      ? parsed.summary.filter((s: any) => typeof s === 'string' && s.trim().length >= 20)
      : [],
    keyTerms: Array.isArray(parsed.keyTerms)
      ? parsed.keyTerms.filter((k: any) => k && typeof k.term === 'string' && typeof k.definition === 'string')
      : [],
    formulas: Array.isArray(parsed.formulas)
      ? parsed.formulas.filter((f: any) => typeof f === 'string' && f.trim().length > 0)
      : [],
    algorithms: Array.isArray(parsed.algorithms)
      ? parsed.algorithms.filter((a: any) => typeof a === 'string' && a.trim().length > 0)
      : [],
    practiceQuestions: Array.isArray(parsed.practiceQuestions)
      ? parsed.practiceQuestions.filter((q: any) => {
          if (!q || typeof q.question !== 'string') return false;
          const words = q.question.trim().split(/\s+/).filter(Boolean);
          return words.length >= 5;
        })
      : []
  };
}

/**
 * Processes all chunks for a specific model
 */
async function analyzeAllChunks(
  chunks: string[],
  apiKey: string,
  model: string,
  onProgress?: (msg: string) => void
): Promise<SmartAnalysisResult> {
  const allSummaries: string[] = [];
  const keyTermsMap = new Map<string, KeyTerm>();
  const formulasSet = new Set<string>();
  const algorithmsSet = new Set<string>();
  const questionsList: PracticeQuestionItem[] = [];

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(`Analyzing chunk ${i + 1} of ${chunks.length} with ${model}...`);
    const chunkResult = await analyzeChunkWithGemini(chunks[i], apiKey, model);

    for (const s of chunkResult.summary) {
      if (!allSummaries.includes(s) && allSummaries.length < 5) {
        allSummaries.push(s);
      }
    }

    for (const kt of chunkResult.keyTerms) {
      const norm = kt.term.trim().toLowerCase();
      if (!keyTermsMap.has(norm) && keyTermsMap.size < 15) {
        keyTermsMap.set(norm, {
          term: kt.term.trim(),
          definition: kt.definition.trim()
        });
      }
    }

    for (const f of chunkResult.formulas) {
      formulasSet.add(f.trim());
    }

    for (const a of chunkResult.algorithms) {
      algorithmsSet.add(a.trim());
    }

    for (const pq of chunkResult.practiceQuestions) {
      const qText = pq.question.trim();
      const existing = questionsList.some(q => q.question.toLowerCase() === qText.toLowerCase());
      if (!existing) {
        const marks = pq.suggestedMarks === 2 || pq.suggestedMarks === 5 || pq.suggestedMarks === 10
          ? pq.suggestedMarks
          : 5;
        const validTypes = ['define', 'explain', 'derive', 'algorithm', 'differentiate'];
        const type = validTypes.includes(pq.type) ? (pq.type as PracticeQuestionItem['type']) : 'explain';

        questionsList.push({
          id: `ai-q-${Date.now().toString(36)}-${questionsList.length + 1}`,
          question: qText,
          marks,
          type,
          sourceSnippet: `Generated by Smart AI Analysis (${model})`
        });
      }
    }
  }

  return {
    summary: allSummaries.slice(0, 5),
    keyTerms: Array.from(keyTermsMap.values()),
    formulasAndAlgorithms: {
      formulas: Array.from(formulasSet),
      algorithms: Array.from(algorithmsSet)
    },
    practiceQuestions: questionsList,
    modelUsed: model
  };
}

/**
 * Executes Smart AI Analysis on cleaned notes text.
 * If a model returns "not found" or "not supported", automatically repeats model detection
 * and retries one time before falling back.
 */
export async function runSmartAnalysis(
  cleanedText: string,
  apiKey: string,
  preferredModel?: string,
  onProgress?: (step: string) => void,
  onModelResolved?: (workingModel: string) => void
): Promise<SmartAnalysisResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Missing API key. Please configure your key in Settings.');
  }

  let activeModel = preferredModel?.trim();
  if (!activeModel) {
    const saved = await getSavedModel();
    if (saved) activeModel = saved;
  }

  if (!activeModel) {
    onProgress?.('Detecting best available AI model...');
    activeModel = await pickWorkingModel(apiKey);
    onModelResolved?.(activeModel);
  }

  const chunks = splitIntoChunks(cleanedText);
  onProgress?.(`Sending notes to ${activeModel} (${chunks.length} chunk${chunks.length > 1 ? 's' : ''})...`);

  try {
    const result = await analyzeAllChunks(chunks, apiKey, activeModel, onProgress);
    onModelResolved?.(activeModel);
    return result;
  } catch (err: any) {
    const errStr = (err.message || '').toLowerCase();
    const isNotFoundOrUnsupported = (
      errStr.includes('not found') ||
      errStr.includes('not supported') ||
      errStr.includes('404')
    );

    if (isNotFoundOrUnsupported) {
      // REQUIREMENT 3: Repeat steps 1 and 2 automatically ONE TIME before falling back
      onProgress?.('Selected model is retired or not supported. Auto-detecting working model...');
      try {
        const newModel = await pickWorkingModel(apiKey);
        onModelResolved?.(newModel);
        onProgress?.(`Retrying analysis with ${newModel}...`);
        const retryResult = await analyzeAllChunks(chunks, apiKey, newModel, onProgress);
        return retryResult;
      } catch (retryErr: any) {
        throw new Error('Could not reach any model, check your key or internet');
      }
    }

    throw new Error('Could not reach any model, check your key or internet');
  }
}
