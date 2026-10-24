import { SubjectMeta, PYQQuestion, StudyTask, VideoResource, PdfResource, CountdownTime, ConceptExplainer } from '../types';
import { INITIAL_QUESTIONS } from '../data/pyqData';

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
const DEFAULT_OS_EXAM = toDatetimeLocalString(new Date(now + (3 * 24 + 8) * 3600 * 1000));   // 3 days 8h (Crunch Mode)
const DEFAULT_DBMS_EXAM = toDatetimeLocalString(new Date(now + (6 * 24 + 14) * 3600 * 1000)); // 6 days 14h (Active Practice)
const DEFAULT_CN_EXAM = toDatetimeLocalString(new Date(now + (10 * 24 + 9) * 3600 * 1000));   // 10 days (Deep Learning)
const DEFAULT_DSA_EXAM = toDatetimeLocalString(new Date(now + (15 * 24 + 11) * 3600 * 1000)); // 15 days (Deep Learning)

export const DEFAULT_SUBJECTS: SubjectMeta[] = [
  {
    id: 'os',
    code: 'CS301',
    name: 'Operating Systems',
    semester: '5th Semester',
    iconName: 'Cpu',
    accentColor: '#00F0FF', // Electric Cyan
    examDate: DEFAULT_OS_EXAM,
    units: [
      { unit: 1, title: 'Process Scheduling' },
      { unit: 2, title: 'Synchronization & Deadlocks' },
      { unit: 3, title: 'Memory & Paging' },
      { unit: 4, title: 'Storage & Disk Management' },
      { unit: 5, title: 'Virtualization & Security' },
    ]
  },
  {
    id: 'dbms',
    code: 'CS302',
    name: 'Database Systems',
    semester: '5th Semester',
    iconName: 'Database',
    accentColor: '#00F5A0', // Hyper Emerald
    examDate: DEFAULT_DBMS_EXAM,
    units: [
      { unit: 1, title: 'Relational Model & Algebra' },
      { unit: 2, title: 'SQL & Normalization' },
      { unit: 3, title: 'Transactions & Concurrency' },
      { unit: 4, title: 'Indexing & B+ Trees' },
      { unit: 5, title: 'Distributed Databases' },
    ]
  },
  {
    id: 'cn',
    code: 'CS303',
    name: 'Computer Networks',
    semester: '5th Semester',
    iconName: 'Network',
    accentColor: '#FFB800', // Solar Gold
    examDate: DEFAULT_CN_EXAM,
    units: [
      { unit: 1, title: 'OSI Model & Physical Layer' },
      { unit: 2, title: 'Data Link Layer & Framing' },
      { unit: 3, title: 'Network Layer & Routing' },
      { unit: 4, title: 'Transport Layer & TCP' },
      { unit: 5, title: 'Application Layer & DNS' },
    ]
  },
  {
    id: 'dsa',
    code: 'CS304',
    name: 'Data Structures & Algorithms',
    semester: '3rd Semester',
    iconName: 'Code',
    accentColor: '#FF3366', // Neon Coral
    examDate: DEFAULT_DSA_EXAM,
    units: [
      { unit: 1, title: 'Asymptotic Analysis & Lists' },
      { unit: 2, title: 'Trees & AVL Balancing' },
      { unit: 3, title: 'Heaps & Hashing' },
      { unit: 4, title: 'Graphs & Dijkstra' },
      { unit: 5, title: 'Dynamic Programming' },
    ]
  }
];

export const DEFAULT_TASKS: StudyTask[] = [
  { id: 't-os-1', subjectId: 'os', text: 'Solve Banker\'s Algorithm 10-Mark safe sequence problem', completed: false, isMission: true, category: 'pyq', createdAt: Date.now() },
  { id: 't-os-2', subjectId: 'os', text: 'Derive Effective Memory Access Time (EMAT) formula with TLB hit ratio', completed: false, isMission: true, category: 'concept', createdAt: Date.now() },
  { id: 't-os-3', subjectId: 'os', text: 'Watch Gate Smashers 15-min crash revision on CPU Scheduling', completed: false, isMission: true, category: 'video', createdAt: Date.now() },
  
  { id: 't-dbms-1', subjectId: 'dbms', text: 'Trace 1NF -> 2NF -> 3NF -> BCNF decomposition step-by-step', completed: false, isMission: true, category: 'concept', createdAt: Date.now() },
  { id: 't-dbms-2', subjectId: 'dbms', text: 'Practice Conflict Serializability Precedence Graph cycle detection', completed: false, isMission: true, category: 'pyq', createdAt: Date.now() },
  { id: 't-dbms-3', subjectId: 'dbms', text: 'Review 2PL Growing Phase vs Shrinking Phase lock points', completed: true, isMission: false, category: 'custom', createdAt: Date.now() },

  { id: 't-cn-1', subjectId: 'cn', text: 'Draw TCP Congestion Control cwnd graph (Slow start, AIMD, 3 dup ACKs)', completed: false, isMission: true, category: 'pyq', createdAt: Date.now() },
  { id: 't-cn-2', subjectId: 'cn', text: 'Memorize TCP 3-Way Handshake vs 4-Way Termination packet flow', completed: false, isMission: true, category: 'concept', createdAt: Date.now() },

  { id: 't-dsa-1', subjectId: 'dsa', text: 'Practice all 4 AVL Tree rotations (LL, RR, LR, RL) on sample key set', completed: false, isMission: true, category: 'pyq', createdAt: Date.now() },
  { id: 't-dsa-2', subjectId: 'dsa', text: 'Trace 0/1 Knapsack dynamic programming table recurrence relation', completed: false, isMission: true, category: 'concept', createdAt: Date.now() },
];

export const DEFAULT_VIDEOS: VideoResource[] = [
  // OS
  {
    id: 'v-os-1',
    subjectId: 'os',
    title: "Banker's Algorithm with Safe Sequence Example — Gate Smashers",
    youtubeUrl: 'https://www.youtube.com/watch?v=7gmLZ2vgw5Y',
    videoId: '7gmLZ2vgw5Y',
    notes: 'Key rule: Need = Max - Allocation. If Need <= Work, process finishes and releases Allocated resources back to Work vector.',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 24
  },
  {
    id: 'v-os-2',
    subjectId: 'os',
    title: 'Preemptive vs Non-Preemptive CPU Scheduling Algorithms — Neso Academy',
    youtubeUrl: 'https://www.youtube.com/watch?v=EWkQD_WWmS4',
    videoId: 'EWkQD_WWmS4',
    notes: 'TAT = Completion Time - Arrival Time. Waiting Time = TAT - Burst Time. Always draw a neat Gantt chart in the first 2 minutes!',
    isWatched: true,
    addedAt: Date.now() - 3600000 * 48
  },
  // DBMS
  {
    id: 'v-dbms-1',
    subjectId: 'dbms',
    title: 'Normalization (1NF, 2NF, 3NF, BCNF) Made Easy — Gate Smashers',
    youtubeUrl: 'https://www.youtube.com/watch?v=5fs1hdkhms8',
    videoId: '5fs1hdkhms8',
    notes: 'BCNF condition: For every X -> Y, X MUST be a superkey. If not, split table into (X, Y) and (X, Rest).',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 12
  },
  {
    id: 'v-dbms-2',
    subjectId: 'dbms',
    title: 'ACID Properties in Database Management Systems — Gate Smashers',
    youtubeUrl: 'https://www.youtube.com/watch?v=pmsYpLkyh1Q',
    videoId: 'pmsYpLkyh1Q',
    notes: 'Atomicity: all-or-nothing (WAL log). Consistency: integrity constraints. Isolation: Concurrency control. Durability: committed data persists.',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 18
  },
  // CN
  {
    id: 'v-cn-1',
    subjectId: 'cn',
    title: 'TCP Congestion Control (Slow Start & AIMD) — Gate Smashers',
    youtubeUrl: 'https://www.youtube.com/watch?v=8y_jC_XvXn4',
    videoId: '8y_jC_XvXn4',
    notes: 'On 3 Duplicate ACKs: Fast Retransmit triggers immediately, ssthresh set to cwnd/2, Fast Recovery skips slow start back to 1 MSS.',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 30
  },
  {
    id: 'v-cn-2',
    subjectId: 'cn',
    title: 'OSI 7 Layers Explained Simply with Examples — Neso Academy',
    youtubeUrl: 'https://www.youtube.com/watch?v=vv4y_uOneC8',
    videoId: 'vv4y_uOneC8',
    notes: 'Mnemonics: Please Do Not Throw Sausage Pizza Away (Physical -> Data Link -> Network -> Transport -> Session -> Presentation -> Application).',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 40
  },
  // DSA
  {
    id: 'v-dsa-1',
    subjectId: 'dsa',
    title: 'AVL Tree Insertion & 4 Rotations (LL, RR, LR, RL) — Abdul Bari',
    youtubeUrl: 'https://www.youtube.com/watch?v=jDM6_TnYIqE',
    videoId: 'jDM6_TnYIqE',
    notes: 'Balance Factor = Height(L) - Height(R). Must be strictly in {-1, 0, +1}. Single rotation for LL/RR, Double rotation for LR/RL.',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 50
  },
  {
    id: 'v-dsa-2',
    subjectId: 'dsa',
    title: "Dijkstra's Shortest Path Algorithm Step-by-Step — Abdul Bari",
    youtubeUrl: 'https://www.youtube.com/watch?v=XB4MIexjvY0',
    videoId: 'XB4MIexjvY0',
    notes: 'Greedy choice: always pick unvisited vertex with minimum distance. Fails on negative weights because visited vertices are never reconsidered.',
    isWatched: false,
    addedAt: Date.now() - 3600000 * 60
  }
];

export const DEFAULT_PDFS: PdfResource[] = [
  {
    id: 'pdf-os-1',
    subjectId: 'os',
    fileName: 'OS_Unit2_Deadlocks_Synchronization_Summary.pdf',
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
    fileName: 'DBMS_Normalization_Transactions_CheatSheet.pdf',
    uploadDate: new Date(Date.now() - 172800000).toLocaleDateString(),
    fileSize: '2.1 MB',
    extractedText: 'Functional dependencies, 1NF atomic attributes, 2NF partial dependencies, 3NF transitive dependencies, BCNF superkey condition. ACID transactions, conflict serializability, 2PL lock point.',
    summary: 'High-yield exam review sheet detailing normalization closure calculations, candidate key identification, and 2-Phase Locking growing vs shrinking phase.',
    extractedQuestions: [
      'Decompose relation R into BCNF and verify if dependency is preserved.',
      'Explain Conflict Serializability with a Precedence Graph.',
      'Why is B+ Tree index preferred over B-Tree in modern DBMS?'
    ]
  }
];

// Helper: Extract YouTube ID from various URL formats
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
}

// Helper: Calculate live ticking countdown for an exam date
export function calculateCountdown(examDateString: string): CountdownTime {
  if (!examDateString) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, urgency: 'normal', label: 'No Date Set' };
  }

  const target = new Date(examDateString).getTime();
  const diff = target - Date.now();

  if (isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, urgency: 'normal', label: 'Invalid Date' };
  }

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      urgency: 'passed',
      label: 'Exam Today / Completed'
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  let urgency: 'critical' | 'high' | 'normal' = 'normal';
  if (days < 3) {
    urgency = 'critical';
  } else if (days < 7) {
    urgency = 'high';
  }

  const label = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  return { days, hours, minutes, seconds, totalSeconds, urgency, label };
}

// STORAGE KEYS
const STORAGE_KEYS = {
  SUBJECTS: 'pyq_hud_subjects_v2',
  QUESTIONS: 'pyq_hud_questions_v2',
  TASKS: 'pyq_hud_tasks_v2',
  VIDEOS: 'pyq_hud_videos_v2',
  PDFS: 'pyq_hud_pdfs_v2',
  ACTIVE_SUBJECT: 'pyq_hud_active_subject_v2',
  THEME: 'pyq_hud_theme_v2',
};

// Storage Service API
export const storageService = {
  // SUBJECTS
  getSubjects(): SubjectMeta[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading subjects from localStorage:', e);
    }
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
    const updated = [...list, subject];
    this.saveSubjects(updated);
    return updated;
  },

  updateSubject(subject: SubjectMeta): SubjectMeta[] {
    const list = this.getSubjects();
    const updated = list.map(s => s.id === subject.id ? subject : s);
    this.saveSubjects(updated);
    return updated;
  },

  deleteSubject(subjectId: string): SubjectMeta[] {
    const list = this.getSubjects();
    const updated = list.filter(s => s.id !== subjectId);
    this.saveSubjects(updated);

    // Also cascade cleanup related questions, tasks, videos, pdfs
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading questions from localStorage:', e);
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
        if (Array.isArray(parsed)) return parsed;
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
        if (Array.isArray(parsed)) return parsed;
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
        if (Array.isArray(parsed)) return parsed;
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
          version: '2.0.0',
          timestamp: Date.now(),
          subjects,
          questions,
          activeSubjectId,
          theme
        }
      }, '*');
    } catch (e) {
      console.warn('Extension broadcast error:', e);
    }
  }
};
