import { PYQQuestion, SubjectId } from '../types';

/**
 * Client-side PDF text extraction using PDF.js with graceful fallback
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Dynamic import to avoid SSR / bundler worker issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up standard worker via unpkg / cdnjs fallback
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += `\n--- Page ${pageNum} ---\n` + pageText;
    }

    return fullText;
  } catch (err) {
    console.warn('PDF.js client extraction notice (trying fallback text decoder):', err);
    // Fallback: Attempt plain text reading if it was a text/plain file renamed to .pdf
    return await file.text();
  }
}

/**
 * Intelligent regex and NLP heuristic parser that splits raw paper text into individual PYQs
 */
export function parseQuestionsFromText(
  rawText: string, 
  defaultSubjectId: SubjectId = 'os',
  defaultYear: number = 2025
): PYQQuestion[] {
  const extracted: PYQQuestion[] = [];
  
  // 1. Detect Year from header
  const yearMatch = rawText.match(/\b(202[0-6])\b/);
  const detectedYear = yearMatch ? parseInt(yearMatch[1], 10) : defaultYear;

  // 2. Normalize text lines
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // 3. Question boundary regex
  // Matches: "Q1.", "Q 2)", "Question 3:", "1.", "1(a)", "2(b)", "[Q1]"
  const questionStartRegex = /^(?:Q(?:uestion)?\.?\s*(\d+[a-z]?)|(\d+)\s*[\.)]\s*(?:\([a-z]\))?|\[\s*Q?(\d+)\s*\])/i;

  let currentBlock = '';
  const blocks: string[] = [];

  for (const line of lines) {
    if (questionStartRegex.test(line) && currentBlock.length > 30) {
      blocks.push(currentBlock);
      currentBlock = line;
    } else {
      currentBlock += (currentBlock ? ' ' : '') + line;
    }
  }
  if (currentBlock) blocks.push(currentBlock);

  // If blocks weren't split cleanly by question numbers, split by double newlines or punctuation
  const candidateBlocks = blocks.length > 1 ? blocks : rawText.split(/\n\s*\n/).filter(b => b.trim().length > 25);

  let counter = 1;
  for (const block of candidateBlocks) {
    const cleanBlock = block.replace(/\s+/g, ' ').trim();
    if (cleanBlock.length < 20) continue;

    // Detect Marks: [10M], [5 Marks], (10 marks), 10M, etc.
    let marks: 2 | 5 | 10 = 5;
    const marksMatch = cleanBlock.match(/(?:\[|\()?\s*(\d{1,2})\s*(?:M|Marks?|marks?)\s*(?:\]|\))?/i) ||
                       cleanBlock.match(/(?:Marks?|weightage)\s*[:=]\s*(\d{1,2})/i);
    if (marksMatch) {
      const val = parseInt(marksMatch[1], 10);
      if (val <= 3) marks = 2;
      else if (val <= 7) marks = 5;
      else marks = 10;
    } else {
      // Heuristic: short questions are 2M, long detailed are 10M
      marks = cleanBlock.length < 90 ? 2 : cleanBlock.length > 220 ? 10 : 5;
    }

    // Clean question text by stripping prefix number and marks suffix
    const cleanedQuestion = cleanBlock
      .replace(questionStartRegex, '')
      .replace(/(?:\[|\()?\s*\d{1,2}\s*(?:M|Marks?|marks?)\s*(?:\]|\))?$/i, '')
      .trim();

    if (cleanedQuestion.length < 15) continue;

    // Identify Subject and Unit based on keyword heuristics
    const { subjectId, subjectName, unit, unitTitle } = classifySubjectAndUnit(cleanedQuestion, defaultSubjectId);

    // Extract core keywords
    const keywords = extractKeywordsFromText(cleanedQuestion);

    extracted.push({
      id: `EXTRACT-${Date.now().toString(36)}-${counter++}`,
      subjectId,
      subjectName,
      unit,
      unitTitle,
      question: cleanedQuestion,
      marks,
      yearsAsked: [detectedYear],
      repeatCount: 1,
      isHighProbability: marks === 10,
      frequencyCategory: 'occasional',
      expectedKeywords: keywords.length >= 3 ? keywords : ['Core Concept', 'Technical Definition', 'Practical Example'],
      rubricGuide: {
        recommendedWordCount: {
          min: marks === 2 ? 30 : marks === 5 ? 80 : 180,
          max: marks === 2 ? 65 : marks === 5 ? 180 : 380
        },
        structureRequirements: [
          'Direct technical definition or thesis statement',
          'Point-by-point comparative breakdown or algorithm steps',
          'Formula, diagram reference, or illustrative case'
        ],
        keyConcepts: keywords.slice(0, 4)
      },
      modelAnswerSummary: `Provide a direct, high-scoring academic response focusing on: ${keywords.join(', ')}.`,
      userStatus: 'not-started',
      userNotes: 'Imported from university paper upload.'
    });
  }

  return extracted;
}

/**
 * Keyword classification engine to tag syllabus unit and subject
 */
function classifySubjectAndUnit(text: string, fallbackSubject: SubjectId): {
  subjectId: SubjectId;
  subjectName: string;
  unit: number;
  unitTitle: string;
} {
  const lower = text.toLowerCase();

  // OS heuristics
  if (lower.includes('banker') || lower.includes('deadlock') || lower.includes('semaphore') || lower.includes('critical section')) {
    return { subjectId: 'os', subjectName: 'Operating Systems', unit: 2, unitTitle: 'Process Synchronization & Deadlocks' };
  }
  if (lower.includes('paging') || lower.includes('tlb') || lower.includes('belady') || lower.includes('virtual memory') || lower.includes('page fault')) {
    return { subjectId: 'os', subjectName: 'Operating Systems', unit: 3, unitTitle: 'Memory Management & Virtual Memory' };
  }
  if (lower.includes('scheduling') || lower.includes('round robin') || lower.includes('sjf') || lower.includes('pcb') || lower.includes('process state')) {
    return { subjectId: 'os', subjectName: 'Operating Systems', unit: 1, unitTitle: 'Process Management & CPU Scheduling' };
  }
  if (lower.includes('disk') || lower.includes('scan') || lower.includes('c-scan') || lower.includes('sstf') || lower.includes('inode')) {
    return { subjectId: 'os', subjectName: 'Operating Systems', unit: 4, unitTitle: 'Storage & Disk Scheduling' };
  }

  // DBMS heuristics
  if (lower.includes('normal') || lower.includes('bcnf') || lower.includes('1nf') || lower.includes('2nf') || lower.includes('3nf') || lower.includes('functional dependency')) {
    return { subjectId: 'dbms', subjectName: 'Database Management Systems', unit: 2, unitTitle: 'SQL & Relational Normalization' };
  }
  if (lower.includes('acid') || lower.includes('serializab') || lower.includes('2pl') || lower.includes('locking') || lower.includes('transaction')) {
    return { subjectId: 'dbms', subjectName: 'Database Management Systems', unit: 3, unitTitle: 'Transaction Processing & Concurrency' };
  }
  if (lower.includes('b+ tree') || lower.includes('b-tree') || lower.includes('index') || lower.includes('query execution')) {
    return { subjectId: 'dbms', subjectName: 'Database Management Systems', unit: 4, unitTitle: 'Indexing, B+ Trees & Query Optimization' };
  }
  if (lower.includes('relational algebra') || lower.includes('er diagram') || lower.includes('tuple')) {
    return { subjectId: 'dbms', subjectName: 'Database Management Systems', unit: 1, unitTitle: 'Relational Model & ER Architecture' };
  }

  // CN heuristics
  if (lower.includes('tcp') || lower.includes('congestion') || lower.includes('handshake') || lower.includes('udp') || lower.includes('aimd')) {
    return { subjectId: 'cn', subjectName: 'Computer Networks', unit: 4, unitTitle: 'Transport Layer Protocols' };
  }
  if (lower.includes('routing') || lower.includes('distance vector') || lower.includes('link state') || lower.includes('subnet') || lower.includes('cidr') || lower.includes('ip')) {
    return { subjectId: 'cn', subjectName: 'Computer Networks', unit: 3, unitTitle: 'Network Layer & Routing Algorithms' };
  }
  if (lower.includes('sliding window') || lower.includes('go-back-n') || lower.includes('selective repeat') || lower.includes('crc') || lower.includes('csma')) {
    return { subjectId: 'cn', subjectName: 'Computer Networks', unit: 2, unitTitle: 'Data Link Layer & MAC Protocols' };
  }

  // DSA heuristics
  if (lower.includes('avl') || lower.includes('rotation') || lower.includes('bst') || lower.includes('binary search tree')) {
    return { subjectId: 'dsa', subjectName: 'Data Structures & Algorithms', unit: 2, unitTitle: 'Trees & Balanced Search Trees' };
  }
  if (lower.includes('dijkstra') || lower.includes('graph') || lower.includes('shortest path') || lower.includes('bfs') || lower.includes('dfs')) {
    return { subjectId: 'dsa', subjectName: 'Data Structures & Algorithms', unit: 4, unitTitle: 'Graph Algorithms & Shortest Paths' };
  }
  if (lower.includes('knapsack') || lower.includes('dynamic programming') || lower.includes('recurrence') || lower.includes('greedy')) {
    return { subjectId: 'dsa', subjectName: 'Data Structures & Algorithms', unit: 5, unitTitle: 'Dynamic Programming & Greedy Algorithms' };
  }
  if (lower.includes('heap') || lower.includes('priority queue') || lower.includes('hashing') || lower.includes('heapsort')) {
    return { subjectId: 'dsa', subjectName: 'Data Structures & Algorithms', unit: 3, unitTitle: 'Priority Queues, Heaps & Hashing' };
  }

  // Default fallback
  const names: Record<SubjectId, string> = {
    os: 'Operating Systems',
    dbms: 'Database Management Systems',
    cn: 'Computer Networks',
    dsa: 'Data Structures & Algorithms'
  };

  return {
    subjectId: fallbackSubject,
    subjectName: names[fallbackSubject] || 'Computer Science',
    unit: 1,
    unitTitle: 'Foundations & Core Principles'
  };
}

/**
 * Extracts 4-7 salient technical keywords from question text
 */
function extractKeywordsFromText(text: string): string[] {
  const stopwords = new Set([
    'explain', 'describe', 'what', 'define', 'with', 'using', 'between', 'difference', 'compare',
    'example', 'examples', 'discuss', 'calculate', 'write', 'short', 'notes', 'following',
    'various', 'types', 'given', 'show', 'briefly', 'their', 'which', 'state', 'illustrate',
    'algorithm', 'from', 'each', 'that', 'this', 'have', 'more', 'also', 'such', 'into'
  ]);

  // Find capitalized sequences or technical tokens
  const words = text.replace(/[^a-zA-Z0-9\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const candidates: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (stopwords.has(word.toLowerCase())) continue;

    // Multi-word phrase check (e.g. "Bankers Algorithm", "Safe State")
    if (i + 1 < words.length && !stopwords.has(words[i + 1].toLowerCase())) {
      const phrase = `${word} ${words[i + 1]}`;
      if (!candidates.includes(phrase) && candidates.length < 6) {
        candidates.push(phrase);
      }
    }

    if (!candidates.includes(word) && candidates.length < 6) {
      candidates.push(word);
    }
  }

  return candidates.slice(0, 6);
}
