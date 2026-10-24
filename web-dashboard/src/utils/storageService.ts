import { 
  SubjectMeta, 
  SubjectUnit, 
  PYQQuestion, 
  StudyTask, 
  VideoResource, 
  PdfResource, 
  ExamUrgency, 
  CountdownTime 
} from '../types';
import { INITIAL_QUESTIONS } from '../data/pyqData';

// 10 Rich Card Accent Theme Colors
export const ACCENT_PALETTE = [
  { name: 'Ocean Cyan', hex: '#06B6D4' },
  { name: 'Royal Sapphire', hex: '#3B82F6' },
  { name: 'Emerald Mint', hex: '#10B981' },
  { name: 'Solar Gold', hex: '#EAB308' },
  { name: 'Sunset Orange', hex: '#F97316' },
  { name: 'Crimson Rose', hex: '#F43F5E' },
  { name: 'Neon Lime', hex: '#84CC16' },
  { name: 'Warm Copper', hex: '#D97706' },
  { name: 'Arctic Teal', hex: '#14B8A6' },
  { name: 'Titanium Silver', hex: '#64748B' },
];

// Helper to format ISO date string for datetime-local: YYYY-MM-DDTHH:mm
export function toDatetimeLocalString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const DD = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
}

// Generate realistic default exam dates based on current time
const now = Date.now();
const DEFAULT_OS_EXAM = toDatetimeLocalString(new Date(now + (3 * 24 + 8) * 3600 * 1000));   // ~3.3 days
const DEFAULT_DBMS_EXAM = toDatetimeLocalString(new Date(now + (7 * 24 + 6) * 3600 * 1000)); // ~7.2 days
const DEFAULT_CN_EXAM = toDatetimeLocalString(new Date(now + (11 * 24 + 9) * 3600 * 1000));  // ~11.4 days
const DEFAULT_DSA_EXAM = toDatetimeLocalString(new Date(now + (18 * 24 + 11) * 3600 * 1000)); // ~18.5 days

export const DEFAULT_SUBJECTS: SubjectMeta[] = [
  {
    id: 'os',
    name: 'Operating Systems',
    accentColor: '#3B82F6', // Royal Sapphire
    examDate: DEFAULT_OS_EXAM,
    iconName: 'Cpu',
    units: [
      { id: 'u1', unit: 1, title: 'Process Scheduling & CPU Algorithms', name: 'Process Scheduling & CPU Algorithms' },
      { id: 'u2', unit: 2, title: 'Process Synchronization & Deadlocks', name: 'Process Synchronization & Deadlocks' },
      { id: 'u3', unit: 3, title: 'Memory Management & Paging / TLB', name: 'Memory Management & Paging / TLB' },
      { id: 'u4', unit: 4, title: 'Storage & Disk Scheduling', name: 'Storage & Disk Scheduling' },
      { id: 'u5', unit: 5, title: 'Virtualization & System Security', name: 'Virtualization & System Security' },
    ]
  },
  {
    id: 'dbms',
    name: 'Database Systems',
    accentColor: '#F97316', // Sunset Orange
    examDate: DEFAULT_DBMS_EXAM,
    iconName: 'Database',
    units: [
      { id: 'u1', unit: 1, title: 'Relational Model & ER Architecture', name: 'Relational Model & ER Architecture' },
      { id: 'u2', unit: 2, title: 'SQL & Normalization (1NF to BCNF)', name: 'SQL & Normalization (1NF to BCNF)' },
      { id: 'u3', unit: 3, title: 'Transactions, ACID & Concurrency', name: 'Transactions, ACID & Concurrency' },
      { id: 'u4', unit: 4, title: 'Indexing, B+ Trees & Query Plans', name: 'Indexing, B+ Trees & Query Plans' },
      { id: 'u5', unit: 5, title: 'Distributed DBs & WAL Recovery', name: 'Distributed DBs & WAL Recovery' },
    ]
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    accentColor: '#10B981', // Emerald Mint
    examDate: DEFAULT_CN_EXAM,
    iconName: 'Network',
    units: [
      { id: 'u1', unit: 1, title: 'OSI 7-Layer vs TCP/IP Models', name: 'OSI 7-Layer vs TCP/IP Models' },
      { id: 'u2', unit: 2, title: 'Data Link Layer & Flow Control', name: 'Data Link Layer & Flow Control' },
      { id: 'u3', unit: 3, title: 'Network Layer & Routing Protocols', name: 'Network Layer & Routing Protocols' },
      { id: 'u4', unit: 4, title: 'Transport Layer & TCP Congestion', name: 'Transport Layer & TCP Congestion' },
      { id: 'u5', unit: 5, title: 'Application Layer & DNS Resolution', name: 'Application Layer & DNS Resolution' },
    ]
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    accentColor: '#06B6D4', // Ocean Cyan
    examDate: DEFAULT_DSA_EXAM,
    iconName: 'Code',
    units: [
      { id: 'u1', unit: 1, title: 'Asymptotic Analysis & Master Theorem', name: 'Asymptotic Analysis & Master Theorem' },
      { id: 'u2', unit: 2, title: 'Balanced Search Trees & AVL Rotations', name: 'Balanced Search Trees & AVL Rotations' },
      { id: 'u3', unit: 3, title: 'Priority Queues, Heaps & Hashing', name: 'Priority Queues, Heaps & Hashing' },
      { id: 'u4', unit: 4, title: 'Graph Algorithms & Shortest Paths', name: 'Graph Algorithms & Shortest Paths' },
      { id: 'u5', unit: 5, title: 'Dynamic Programming & 0/1 Knapsack', name: 'Dynamic Programming & 0/1 Knapsack' },
    ]
  }
];

export const DEFAULT_TASKS: StudyTask[] = [
  { id: 't-os-1', subjectId: 'os', unitId: 'u2', unit: 2, text: 'Solve Banker\'s Algorithm 10-Mark safe sequence problem', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-os-2', subjectId: 'os', unitId: 'u3', unit: 3, text: 'Derive Effective Memory Access Time (EMAT) formula with TLB hit ratio', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-os-3', subjectId: 'os', unitId: 'u1', unit: 1, text: 'Watch 15-min crash revision video on CPU Scheduling Gantt Charts', completed: true, isMission: false, createdAt: Date.now() },
  
  { id: 't-dbms-1', subjectId: 'dbms', unitId: 'u2', unit: 2, text: 'Practice 1NF -> 2NF -> 3NF -> BCNF decomposition table', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-dbms-2', subjectId: 'dbms', unitId: 'u3', unit: 3, text: 'Precedence Graph conflict serializability cycle detection test', completed: false, isMission: true, createdAt: Date.now() },

  { id: 't-cn-1', subjectId: 'cn', unitId: 'u4', unit: 4, text: 'Draw TCP Congestion Control cwnd graph (Slow start, AIMD, 3 dup ACKs)', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-cn-2', subjectId: 'cn', unitId: 'u4', unit: 4, text: 'Memorize TCP 3-Way Handshake vs 4-Way Termination packet ladder', completed: false, isMission: true, createdAt: Date.now() },

  { id: 't-dsa-1', subjectId: 'dsa', unitId: 'u2', unit: 2, text: 'Practice all 4 AVL Tree rotations (LL, RR, LR, RL) on sample key set', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-dsa-2', subjectId: 'dsa', unitId: 'u5', unit: 5, text: 'Trace 0/1 Knapsack dynamic programming table recurrence relation', completed: false, isMission: true, createdAt: Date.now() },
];

export const DEFAULT_VIDEOS: VideoResource[] = [
  {
    id: 'v-os-1',
    subjectId: 'os',
    unitId: 'u2',
    unit: 2,
    title: "Banker's Algorithm with Safe Sequence Example — Gate Smashers",
    youtubeUrl: 'https://www.youtube.com/watch?v=7gmLZ2vgw5Y',
    videoId: '7gmLZ2vgw5Y',
    notes: 'Key formula: Need = Max - Allocation. If Need <= Work, process finishes and releases Allocated resources back to Work vector.',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 24
  },
  {
    id: 'v-os-2',
    subjectId: 'os',
    unitId: 'u1',
    unit: 1,
    title: 'Preemptive vs Non-Preemptive CPU Scheduling Algorithms — Neso Academy',
    youtubeUrl: 'https://www.youtube.com/watch?v=EWkQD_WWmS4',
    videoId: 'EWkQD_WWmS4',
    notes: 'TAT = Completion Time - Arrival Time. Waiting Time = TAT - Burst Time. Always draw a neat Gantt chart in the first 2 minutes of the exam.',
    isWatched: true,
    addedAt: Date.now() - 3600000 * 48
  },
  {
    id: 'v-dbms-1',
    subjectId: 'dbms',
    unitId: 'u2',
    unit: 2,
    title: 'Normalization (1NF, 2NF, 3NF, BCNF) Made Easy — Gate Smashers',
    youtubeUrl: 'https://www.youtube.com/watch?v=5fs1hdkhms8',
    videoId: '5fs1hdkhms8',
    notes: 'BCNF condition: For every non-trivial FD X -> Y, X MUST be a Superkey. If not, decompose table into (X, Y) and (X, Rest).',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 12
  },
  {
    id: 'v-cn-1',
    subjectId: 'cn',
    unitId: 'u4',
    unit: 4,
    title: 'TCP Congestion Control (Slow Start & AIMD) — Gate Smashers',
    youtubeUrl: 'https://www.youtube.com/watch?v=8y_jC_XvXn4',
    videoId: '8y_jC_XvXn4',
    notes: 'On 3 Duplicate ACKs: Fast Retransmit triggers immediately, ssthresh set to cwnd/2, Fast Recovery skips slow start back to 1 MSS.',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 30
  },
  {
    id: 'v-dsa-1',
    subjectId: 'dsa',
    unitId: 'u2',
    unit: 2,
    title: 'AVL Tree Insertion & 4 Rotations (LL, RR, LR, RL) — Abdul Bari',
    youtubeUrl: 'https://www.youtube.com/watch?v=jDM6_TnYIqE',
    videoId: 'jDM6_TnYIqE',
    notes: 'Balance Factor = Height(L) - Height(R). Must be strictly in {-1, 0, +1}. Single rotation for LL/RR, Double rotation for LR/RL.',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 50
  }
];

export const DEFAULT_PDFS: PdfResource[] = [
  {
    id: 'pdf-os-1',
    subjectId: 'os',
    unitId: 'u2',
    unit: 2,
    fileName: 'OS_Deadlocks_Synchronization_Summary.pdf',
    uploadDate: new Date(Date.now() - 86400000).toLocaleDateString(),
    fileSize: '1.4 MB',
    extractedText: 'Banker algorithm for deadlock avoidance. Safety state algorithm. Semaphores Wait() and Signal() operations. Peterson algorithm for mutual exclusion.',
    summary: 'Comprehensive revision guide covering Coffman 4 conditions, Banker algorithm data structures (Available, Max, Allocation, Need), and Semaphore synchronization primitives.',
    extractedQuestions: [
      "Explain Banker's Algorithm for Deadlock Avoidance with a numerical example.",
      'State the 4 Coffman conditions required for Deadlock to occur.',
      'Differentiate between Counting and Binary Semaphores with code.'
    ]
  },
  {
    id: 'pdf-dbms-1',
    subjectId: 'dbms',
    unitId: 'u2',
    unit: 2,
    fileName: 'DBMS_Normalization_CheatSheet.pdf',
    uploadDate: new Date(Date.now() - 172800000).toLocaleDateString(),
    fileSize: '2.1 MB',
    extractedText: 'Functional dependencies, 1NF atomic attributes, 2NF partial dependencies, 3NF transitive dependencies, BCNF superkey condition. ACID transactions, conflict serializability, 2PL lock point.',
    summary: 'High-yield exam review sheet detailing normalization closure calculations, candidate key identification, and 2-Phase Locking growing vs shrinking phase.',
    extractedQuestions: [
      'Decompose relation R into BCNF and verify if dependency is preserved.',
      'Explain Conflict Serializability with a Precedence Graph.'
    ]
  }
];

// Helper: Extract YouTube ID from various URL formats
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
}

/**
 * Robust Unit Normalizer:
 * Safely recovers units whether saved as an array of objects, array of strings,
 * comma-separated string, or newline-separated text.
 */
export function normalizeSubjectUnits(subject: any): SubjectUnit[] {
  if (!subject) return [];

  const raw = subject.units ?? subject.syllabus ?? subject.topics;

  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        const cleanTitle = item.replace(/^Unit\s*\d+[:\-.]\s*/i, '').trim() || item.trim();
        return {
          id: `u${idx + 1}`,
          unit: idx + 1,
          title: cleanTitle || `Unit ${idx + 1}`,
          name: cleanTitle || `Unit ${idx + 1}`
        };
      }
      if (typeof item === 'object' && item !== null) {
        const uNum = Number(item.unit) || (idx + 1);
        const title = (item.title || item.name || `Unit ${uNum}`).trim();
        return {
          id: String(item.id || `u${uNum}`),
          unit: uNum,
          title: title,
          name: title
        };
      }
      return {
        id: `u${idx + 1}`,
        unit: idx + 1,
        title: `Unit ${idx + 1}`,
        name: `Unit ${idx + 1}`
      };
    });
  }

  if (typeof raw === 'string' && raw.trim().length > 0) {
    const lines = raw.split(/\r?\n|,/).map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      return lines.map((line, idx) => {
        const cleanTitle = line.replace(/^Unit\s*\d+[:\-.]\s*/i, '').trim() || line.trim();
        return {
          id: `u${idx + 1}`,
          unit: idx + 1,
          title: cleanTitle || `Unit ${idx + 1}`,
          name: cleanTitle || `Unit ${idx + 1}`
        };
      });
    }
  }

  // Fallback if no units were entered: provide a default Unit 1
  return [
    {
      id: 'u1',
      unit: 1,
      title: 'Core Concepts & Fundamentals',
      name: 'Core Concepts & Fundamentals'
    }
  ];
}

/**
 * Requirement 2: Auto-Sort Subjects by Exam Time Remaining (Closest Exam First)
 * Upcoming exams with least time left come first (#1, #2, ...), followed by more distant exams.
 * Completed / past exams are placed at the end.
 */
export function sortSubjectsByExamUrgency(subjects: SubjectMeta[]): SubjectMeta[] {
  const now = Date.now();
  return [...subjects].sort((a, b) => {
    const targetA = a.examDate ? new Date(a.examDate).getTime() : Infinity;
    const targetB = b.examDate ? new Date(b.examDate).getTime() : Infinity;
    const diffA = targetA - now;
    const diffB = targetB - now;

    // Both in future: closest first
    if (diffA > 0 && diffB > 0) {
      return diffA - diffB;
    }
    // A in future, B in past: A comes first
    if (diffA > 0 && diffB <= 0) {
      return -1;
    }
    // B in future, A in past: B comes first
    if (diffA <= 0 && diffB > 0) {
      return 1;
    }
    // Both in past: most recently passed first
    return targetB - targetA;
  });
}

/**
 * Exam Urgency Calculation with Continuous HSL Color Shift
 */
export function getExamUrgencyColor(examDateString: string): ExamUrgency {
  const fallbackDate = new Date(Date.now() + 7 * 86400 * 1000);
  const target = examDateString ? new Date(examDateString).getTime() : fallbackDate.getTime();
  const diffMs = target - Date.now();

  const targetObj = new Date(target);
  const formattedExamDate = isNaN(target) 
    ? 'No Exam Date Set' 
    : targetObj.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) + ' • ' + targetObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isNaN(target) || diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      fractionalDays: 0,
      hue: 0,
      hslColor: 'hsl(0, 85%, 45%)', // Urgent Crimson
      isUrgent: true,
      statusLabel: 'Completed / Update Date',
      formattedCountdown: '0d : 0h : 0m : 0s',
      formattedExamDate
    };
  }

  const fractionalDays = diffMs / (1000 * 60 * 60 * 24);
  const days = Math.floor(fractionalDays);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  let hue = 145;
  let statusLabel = 'On Track';
  let isUrgent = false;

  if (fractionalDays >= 15) {
    hue = 145;
    statusLabel = 'On Track (> 15 Days)';
  } else if (fractionalDays > 5) {
    const t = (fractionalDays - 5) / (15 - 5);
    hue = Math.round(20 + t * (145 - 20));
    statusLabel = fractionalDays > 9 ? 'Active Prep' : 'Approaching Soon';
  } else {
    const t = Math.max(0, fractionalDays) / 5;
    hue = Math.round(t * 20);
    statusLabel = '🚨 Urgent (< 5 Days)';
    isUrgent = true;
  }

  const hslColor = `hsl(${hue}, 85%, 45%)`;
  const formattedCountdown = `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;

  return {
    days,
    hours,
    minutes,
    seconds,
    fractionalDays,
    hue,
    hslColor,
    isUrgent,
    statusLabel,
    formattedCountdown,
    formattedExamDate
  };
}

export function calculateCountdown(examDateString: string): CountdownTime {
  const urgency = getExamUrgencyColor(examDateString);
  let urgencyLevel: 'critical' | 'high' | 'normal' = 'normal';
  if (urgency.fractionalDays <= 3) urgencyLevel = 'critical';
  else if (urgency.fractionalDays <= 7) urgencyLevel = 'high';
  return {
    days: urgency.days,
    hours: urgency.hours,
    minutes: urgency.minutes,
    seconds: urgency.seconds,
    totalSeconds: Math.floor(urgency.fractionalDays * 86400),
    label: urgency.formattedCountdown,
    urgency: urgencyLevel
  };
}

// EXACT STORAGE KEYS (PRESERVED FOR ZERO DATA LOSS)
const STORAGE_KEYS = {
  SUBJECTS: 'exam_hub_v3_subjects',
  QUESTIONS: 'exam_hub_v3_questions',
  TASKS: 'exam_hub_v3_tasks',
  VIDEOS: 'exam_hub_v3_videos',
  PDFS: 'exam_hub_v3_pdfs',
  ACTIVE_SUBJECT: 'exam_hub_v3_active_subject',
  THEME: 'exam_hub_v3_theme',
};

// FALLBACK KEYS FROM PREVIOUS VERSIONS (ONLY CHECKED IF CURRENT KEY IS COMPLETELY EMPTY)
const FALLBACK_KEYS = {
  SUBJECTS: ['pyq_hud_subjects_v2', 'pyq_subjects', 'exam_hub_subjects'],
  QUESTIONS: ['pyq_hud_questions_v2', 'pyq_questions'],
  TASKS: ['pyq_hud_tasks_v2', 'pyq_tasks'],
  VIDEOS: ['pyq_hud_videos_v2'],
  PDFS: ['pyq_hud_pdfs_v2']
};

/**
 * Storage Service with Non-Destructive Schema Upgrading
 * Guarantees zero data loss for existing user-entered subjects and resources.
 */
export const storageService = {
  // SUBJECTS
  getSubjects(): SubjectMeta[] {
    try {
      // 1. First check the primary storage key
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Non-destructively normalize units while preserving all user data
          const upgraded = parsed.map((s: any) => ({
            ...s,
            accentColor: s.accentColor || ACCENT_PALETTE[0].hex,
            units: normalizeSubjectUnits(s)
          }));
          return upgraded;
        }
      }

      // 2. If primary is empty, inspect fallback keys to rescue previously entered data
      for (const fallbackKey of FALLBACK_KEYS.SUBJECTS) {
        const fallbackData = localStorage.getItem(fallbackKey);
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const upgraded = parsed.map((s: any) => ({
              ...s,
              accentColor: s.accentColor || ACCENT_PALETTE[0].hex,
              units: normalizeSubjectUnits(s)
            }));
            this.saveSubjects(upgraded);
            return upgraded;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading subjects:', e);
    }

    // 3. ONLY load defaults if user has ZERO subjects anywhere
    this.saveSubjects(DEFAULT_SUBJECTS);
    return DEFAULT_SUBJECTS;
  },

  saveSubjects(subjects: SubjectMeta[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
      this.broadcastToExtension();
    } catch (e) {
      console.error('Error saving subjects:', e);
    }
  },

  addSubject(subject: SubjectMeta): SubjectMeta[] {
    const list = this.getSubjects();
    const normalized: SubjectMeta = {
      ...subject,
      units: normalizeSubjectUnits(subject)
    };
    const updated = [...list, normalized];
    this.saveSubjects(updated);
    return updated;
  },

  updateSubject(subject: SubjectMeta): SubjectMeta[] {
    const list = this.getSubjects();
    const normalized: SubjectMeta = {
      ...subject,
      units: normalizeSubjectUnits(subject)
    };
    const updated = list.map(s => s.id === subject.id ? normalized : s);
    this.saveSubjects(updated);
    return updated;
  },

  updateSubjectUnits(subjectId: string, units: SubjectUnit[]): SubjectMeta[] {
    const list = this.getSubjects();
    const updated = list.map(s => {
      if (s.id === subjectId) {
        return { ...s, units };
      }
      return s;
    });
    this.saveSubjects(updated);
    return updated;
  },

  deleteSubject(subjectId: string): SubjectMeta[] {
    const list = this.getSubjects();
    const updated = list.filter(s => s.id !== subjectId);
    this.saveSubjects(updated);

    // Cascade cleanup
    this.saveQuestions(this.getQuestions().filter(q => q.subjectId !== subjectId));
    this.saveTasks(this.getTasks().filter(t => t.subjectId !== subjectId));
    this.saveVideos(this.getVideos().filter(v => v.subjectId !== subjectId));
    this.savePdfs(this.getPdfs().filter(p => p.subjectId !== subjectId));
    
    return updated;
  },

  // QUESTIONS
  getQuestions(): PYQQuestion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((q: any) => ({
            ...q,
            unitId: q.unitId || (q.unit ? `u${q.unit}` : undefined)
          }));
        }
      }

      for (const fallbackKey of FALLBACK_KEYS.QUESTIONS) {
        const fallbackData = localStorage.getItem(fallbackKey);
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.saveQuestions(parsed);
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading questions:', e);
    }
    this.saveQuestions(INITIAL_QUESTIONS);
    return INITIAL_QUESTIONS;
  },

  saveQuestions(questions: PYQQuestion[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
      this.broadcastToExtension();
    } catch (e) {
      console.error('Error saving questions:', e);
    }
  },

  addQuestion(question: PYQQuestion): PYQQuestion[] {
    const list = this.getQuestions();
    const updated = [question, ...list];
    this.saveQuestions(updated);
    return updated;
  },

  toggleQuestionMastered(questionId: string): PYQQuestion[] {
    const list = this.getQuestions();
    const updated = list.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          userStatus: (q.userStatus === 'mastered' ? 'not-started' : 'mastered') as 'not-started' | 'mastered'
        };
      }
      return q;
    });
    this.saveQuestions(updated);
    return updated;
  },

  // TASKS
  getTasks(): StudyTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((t: any) => ({
            ...t,
            unitId: t.unitId || (t.unit ? `u${t.unit}` : undefined)
          }));
        }
      }

      for (const fallbackKey of FALLBACK_KEYS.TASKS) {
        const fallbackData = localStorage.getItem(fallbackKey);
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          if (Array.isArray(parsed)) {
            this.saveTasks(parsed);
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading tasks:', e);
    }
    this.saveTasks(DEFAULT_TASKS);
    return DEFAULT_TASKS;
  },

  saveTasks(tasks: StudyTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks:', e);
    }
  },

  addTask(task: StudyTask): StudyTask[] {
    const list = this.getTasks();
    const updated = [task, ...list];
    this.saveTasks(updated);
    return updated;
  },

  toggleTask(taskId: string): StudyTask[] {
    const list = this.getTasks();
    const updated = list.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    this.saveTasks(updated);
    return updated;
  },

  deleteTask(taskId: string): StudyTask[] {
    const list = this.getTasks();
    const updated = list.filter(t => t.id !== taskId);
    this.saveTasks(updated);
    return updated;
  },

  // VIDEOS
  getVideos(): VideoResource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((v: any) => ({
            ...v,
            unitId: v.unitId || (v.unit ? `u${v.unit}` : undefined)
          }));
        }
      }

      for (const fallbackKey of FALLBACK_KEYS.VIDEOS) {
        const fallbackData = localStorage.getItem(fallbackKey);
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          if (Array.isArray(parsed)) {
            this.saveVideos(parsed);
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading videos:', e);
    }
    this.saveVideos(DEFAULT_VIDEOS);
    return DEFAULT_VIDEOS;
  },

  saveVideos(videos: VideoResource[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    } catch (e) {
      console.error('Error saving videos:', e);
    }
  },

  addVideo(video: VideoResource): VideoResource[] {
    const list = this.getVideos();
    const updated = [video, ...list];
    this.saveVideos(updated);
    return updated;
  },

  updateVideoNotes(videoId: string, notes: string): VideoResource[] {
    const list = this.getVideos();
    const updated = list.map(v => v.id === videoId ? { ...v, notes } : v);
    this.saveVideos(updated);
    return updated;
  },

  toggleVideoWatched(videoId: string): VideoResource[] {
    const list = this.getVideos();
    const updated = list.map(v => v.id === videoId ? { ...v, isWatched: !v.isWatched } : v);
    this.saveVideos(updated);
    return updated;
  },

  deleteVideo(videoId: string): VideoResource[] {
    const list = this.getVideos();
    const updated = list.filter(v => v.id !== videoId);
    this.saveVideos(updated);
    return updated;
  },

  // PDFS
  getPdfs(): PdfResource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PDFS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => ({
            ...p,
            unitId: p.unitId || (p.unit ? `u${p.unit}` : undefined)
          }));
        }
      }

      for (const fallbackKey of FALLBACK_KEYS.PDFS) {
        const fallbackData = localStorage.getItem(fallbackKey);
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          if (Array.isArray(parsed)) {
            this.savePdfs(parsed);
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading pdfs:', e);
    }
    this.savePdfs(DEFAULT_PDFS);
    return DEFAULT_PDFS;
  },

  savePdfs(pdfs: PdfResource[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PDFS, JSON.stringify(pdfs));
    } catch (e) {
      console.error('Error saving pdfs:', e);
    }
  },

  addPdf(pdf: PdfResource): PdfResource[] {
    const list = this.getPdfs();
    const updated = [pdf, ...list];
    this.savePdfs(updated);
    return updated;
  },

  deletePdf(pdfId: string): PdfResource[] {
    const list = this.getPdfs();
    const updated = list.filter(p => p.id !== pdfId);
    this.savePdfs(updated);
    return updated;
  },

  // MOVE ITEMS BETWEEN UNITS (1-Click Move to Unit)
  moveItemToUnit(
    itemType: 'task' | 'video' | 'pdf' | 'question', 
    itemId: string, 
    targetUnitId: string,
    targetUnitNumber?: number
  ): void {
    if (itemType === 'task') {
      const tasks = this.getTasks().map(t => {
        if (t.id === itemId) {
          return { ...t, unitId: targetUnitId, unit: targetUnitNumber ?? t.unit };
        }
        return t;
      });
      this.saveTasks(tasks);
    } else if (itemType === 'video') {
      const videos = this.getVideos().map(v => {
        if (v.id === itemId) {
          return { ...v, unitId: targetUnitId, unit: targetUnitNumber ?? v.unit };
        }
        return v;
      });
      this.saveVideos(videos);
    } else if (itemType === 'pdf') {
      const pdfs = this.getPdfs().map(p => {
        if (p.id === itemId) {
          return { ...p, unitId: targetUnitId, unit: targetUnitNumber ?? p.unit };
        }
        return p;
      });
      this.savePdfs(pdfs);
    } else if (itemType === 'question') {
      const questions = this.getQuestions().map(q => {
        if (q.id === itemId) {
          return { ...q, unitId: targetUnitId, unit: targetUnitNumber ?? q.unit };
        }
        return q;
      });
      this.saveQuestions(questions);
    }
  },

  // RESET TO DEFAULT DEMO DATA
  resetToDefaultData(): {
    subjects: SubjectMeta[];
    questions: PYQQuestion[];
    tasks: StudyTask[];
    videos: VideoResource[];
    pdfs: PdfResource[];
  } {
    this.saveSubjects(DEFAULT_SUBJECTS);
    this.saveQuestions(INITIAL_QUESTIONS);
    this.saveTasks(DEFAULT_TASKS);
    this.saveVideos(DEFAULT_VIDEOS);
    this.savePdfs(DEFAULT_PDFS);

    return {
      subjects: DEFAULT_SUBJECTS,
      questions: INITIAL_QUESTIONS,
      tasks: DEFAULT_TASKS,
      videos: DEFAULT_VIDEOS,
      pdfs: DEFAULT_PDFS
    };
  },

  // BROADCAST TO BROWSER EXTENSION
  broadcastToExtension(): void {
    try {
      const subjects = this.getSubjects();
      const questions = this.getQuestions();
      const activeSubjectId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SUBJECT) || 'os';
      const theme = (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'dark';

      window.postMessage({
        type: 'PYQ_SYNC_DATA',
        payload: {
          version: '3.0.0',
          timestamp: Date.now(),
          subjects,
          questions,
          activeSubjectId,
          theme
        }
      }, '*');
    } catch (e) {
      console.warn('Extension broadcast notice:', e);
    }
  }
};
