/**
 * AI Service for Optional "Smart Analysis" mode in PDF Notes Extractor.
 * 
 * SECURITY & PRIVACY PRINCIPLES:
 * 1. The API key is stored ONLY in a dedicated, isolated IndexedDB database ('PyqRankerCredentialsDB').
 * 2. It is NEVER stored in localStorage, never included in backups, and never transmitted to any PyqRanker server.
 * 3. Calling Google's Generative Language API directly from the browser is supported natively with CORS.
 * 4. If Smart Analysis fails for any reason (missing key, quota, invalid JSON), it falls back to the rule-based extractor.
 */

import { PracticeQuestionItem, KeyTerm, SectionHeading, FormulasAndAlgorithms } from './notesAnalyzer';

const CREDENTIALS_DB_NAME = 'PyqRankerCredentialsDB';
const CREDENTIALS_STORE_NAME = 'credentials';
const GEMINI_KEY_ID = 'gemini_api_key';
const GEMINI_MODEL_ID = 'gemini_selected_model';

export const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';

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

export async function getSavedModel(): Promise<string> {
  try {
    const db = await openCredentialsDB();
    return new Promise((resolve) => {
      const tx = db.transaction(CREDENTIALS_STORE_NAME, 'readonly');
      const store = tx.objectStore(CREDENTIALS_STORE_NAME);
      const req = store.get(GEMINI_MODEL_ID);
      req.onsuccess = () => {
        resolve(req.result?.value || DEFAULT_GEMINI_MODEL);
      };
      req.onerror = () => resolve(DEFAULT_GEMINI_MODEL);
    });
  } catch {
    return DEFAULT_GEMINI_MODEL;
  }
}

export async function saveModel(model: string): Promise<void> {
  const db = await openCredentialsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CREDENTIALS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CREDENTIALS_STORE_NAME);
    const req = store.put({
      id: GEMINI_MODEL_ID,
      value: model.trim() || DEFAULT_GEMINI_MODEL,
      updatedAt: Date.now()
    });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// =========================================================================
// 2. TEST API KEY DIRECTLY FROM BROWSER
// =========================================================================

export async function testApiKey(
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL
): Promise<{ success: boolean; message: string }> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return { success: false, message: 'API key cannot be empty.' };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(trimmed)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Respond with exactly the single word "OK" to test connectivity.' }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10
        }
      })
    });

    if (!response.ok) {
      let errMsg = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error?.message) {
          errMsg = errorJson.error.message;
        }
      } catch {
        // ignore json parse error
      }
      return { success: false, message: `Key verification failed: ${errMsg}` };
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (replyText) {
      return { success: true, message: `API Key verified successfully! Connected to ${model}.` };
    }

    return { success: true, message: `Connected to Google AI Studio successfully.` };
  } catch (err: any) {
    return {
      success: false,
      message: `Direct browser call error: ${err.message || 'Network error or connection blocked.'}`
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
}

/**
 * Split long cleaned text into manageable chunks at paragraph boundaries.
 * Chunks are sized around 15,000 to 20,000 characters to stay well within
 * model context and token generation boundaries.
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
  // Strip possible markdown code fence ```json ... ```
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
 * Send a single chunk to Gemini and request strict structured JSON
 */
async function analyzeChunkWithGemini(
  chunkText: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL
): Promise<{
  summary: string[];
  keyTerms: Array<{ term: string; definition: string }>;
  formulas: string[];
  algorithms: string[];
  practiceQuestions: Array<{ question: string; type: string; suggestedMarks: number }>;
}> {
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

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

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

  // Normalize structure
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
 * Executes Smart AI Analysis on cleaned notes text.
 * Falls back to throwing an error if the model fails or key is invalid,
 * allowing the caller to invoke the rule-based extractor.
 */
export async function runSmartAnalysis(
  cleanedText: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
  onProgress?: (step: string) => void
): Promise<SmartAnalysisResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Missing API key. Please configure your key in Settings.');
  }

  const chunks = splitIntoChunks(cleanedText);
  onProgress?.(`Sending notes to ${model} (${chunks.length} chunk${chunks.length > 1 ? 's' : ''})...`);

  const allSummaries: string[] = [];
  const keyTermsMap = new Map<string, KeyTerm>();
  const formulasSet = new Set<string>();
  const algorithmsSet = new Set<string>();
  const questionsList: PracticeQuestionItem[] = [];

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(`Analyzing chunk ${i + 1} of ${chunks.length} with AI...`);
    const chunkResult = await analyzeChunkWithGemini(chunks[i], apiKey, model);

    // Merge summary sentences
    for (const s of chunkResult.summary) {
      if (!allSummaries.includes(s) && allSummaries.length < 5) {
        allSummaries.push(s);
      }
    }

    // Merge key terms (deduplicate by term lowercase)
    for (const kt of chunkResult.keyTerms) {
      const norm = kt.term.trim().toLowerCase();
      if (!keyTermsMap.has(norm) && keyTermsMap.size < 15) {
        keyTermsMap.set(norm, {
          term: kt.term.trim(),
          definition: kt.definition.trim()
        });
      }
    }

    // Merge formulas
    for (const f of chunkResult.formulas) {
      formulasSet.add(f.trim());
    }

    // Merge algorithms
    for (const a of chunkResult.algorithms) {
      algorithmsSet.add(a.trim());
    }

    // Merge practice questions
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
          sourceSnippet: 'Generated by Smart AI Analysis'
        });
      }
    }
  }

  // Ensure 3 to 5 summary sentences
  const finalSummary = allSummaries.slice(0, 5);
  if (finalSummary.length < 3 && chunks.length > 0) {
    // If AI returned fewer than 3, we don't fail, but keep what we have
  }

  return {
    summary: finalSummary,
    keyTerms: Array.from(keyTermsMap.values()),
    formulasAndAlgorithms: {
      formulas: Array.from(formulasSet),
      algorithms: Array.from(algorithmsSet)
    },
    practiceQuestions: questionsList
  };
}
