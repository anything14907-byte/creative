import { SubjectMeta, PYQQuestion, StudyTask, VideoResource, PdfResource, ExamUrgency, CountdownTime } from '../types';
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
const DEFAULT_OS_EXAM = toDatetimeLocalString(new Date(now + (3 * 24 + 8) * 3600 * 1000));   // ~3.3 days (Urgent Red/Orange < 5d)
const DEFAULT_DBMS_EXAM = toDatetimeLocalString(new Date(now + (7 * 24 + 6) * 3600 * 1000)); // ~7.2 days (Warm Yellow/Amber)
const DEFAULT_CN_EXAM = toDatetimeLocalString(new Date(now + (11 * 24 + 9) * 3600 * 1000));  // ~11.4 days (Yellow-Green)
const DEFAULT_DSA_EXAM = toDatetimeLocalString(new Date(now + (18 * 24 + 11) * 3600 * 1000)); // ~18.5 days (Safe Green > 15d)

export const DEFAULT_SUBJECTS: SubjectMeta[] = [
  {
    id: 'os',
    name: 'Operating Systems',
    accentColor: '#EF4444', // Will dynamically compute from urgency
    examDate: DEFAULT_OS_EXAM,
    iconName: 'Cpu',
    units: [
      { unit: 1, title: 'Process Scheduling & CPU Algorithms' },
      { unit: 2, title: 'Process Synchronization & Deadlocks' },
      { unit: 3, title: 'Memory Management & Paging / TLB' },
      { unit: 4, title: 'Storage & Disk Scheduling' },
      { unit: 5, title: 'Virtualization & System Security' },
    ]
  },
  {
    id: 'dbms',
    name: 'Database Systems',
    accentColor: '#F59E0B',
    examDate: DEFAULT_DBMS_EXAM,
    iconName: 'Database',
    units: [
      { unit: 1, title: 'Relational Model & ER Architecture' },
      { unit: 2, title: 'SQL & Normalization (1NF to BCNF)' },
      { unit: 3, title: 'Transactions, ACID & Concurrency' },
      { unit: 4, title: 'Indexing, B+ Trees & Query Plans' },
      { unit: 5, title: 'Distributed DBs & WAL Recovery' },
    ]
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    accentColor: '#10B981',
    examDate: DEFAULT_CN_EXAM,
    iconName: 'Network',
    units: [
      { unit: 1, title: 'OSI 7-Layer vs TCP/IP Models' },
      { unit: 2, title: 'Data Link Layer & Flow Control' },
      { unit: 3, title: 'Network Layer & Routing Protocols' },
      { unit: 4, title: 'Transport Layer & TCP Congestion' },
      { unit: 5, title: 'Application Layer & DNS Resolution' },
    ]
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    accentColor: '#06B6D4',
    examDate: DEFAULT_DSA_EXAM,
    iconName: 'Code',
    units: [
      { unit: 1, title: 'Asymptotic Analysis & Master Theorem' },
      { unit: 2, title: 'Balanced Search Trees & AVL Rotations' },
      { unit: 3, title: 'Priority Queues, Heaps & Hashing' },
      { unit: 4, title: 'Graph Algorithms & Shortest Paths' },
      { unit: 5, title: 'Dynamic Programming & 0/1 Knapsack' },
    ]
  }
];

export const DEFAULT_TASKS: StudyTask[] = [
  { id: 't-os-1', subjectId: 'os', text: 'Solve Banker\'s Algorithm 10-Mark safe sequence problem', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-os-2', subjectId: 'os', text: 'Derive Effective Memory Access Time (EMAT) formula with TLB hit ratio', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-os-3', subjectId: 'os', text: 'Watch 15-min crash revision video on CPU Scheduling Gantt Charts', completed: true, isMission: false, createdAt: Date.now() },
  
  { id: 't-dbms-1', subjectId: 'dbms', text: 'Practice 1NF -> 2NF -> 3NF -> BCNF decomposition table', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-dbms-2', subjectId: 'dbms', text: 'Precedence Graph conflict serializability cycle detection test', completed: false, isMission: true, createdAt: Date.now() },

  { id: 't-cn-1', subjectId: 'cn', text: 'Draw TCP Congestion Control cwnd graph (Slow start, AIMD, 3 dup ACKs)', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-cn-2', subjectId: 'cn', text: 'Memorize TCP 3-Way Handshake vs 4-Way Termination packet ladder', completed: false, isMission: true, createdAt: Date.now() },

  { id: 't-dsa-1', subjectId: 'dsa', text: 'Practice all 4 AVL Tree rotations (LL, RR, LR, RL) on sample key set', completed: false, isMission: true, createdAt: Date.now() },
  { id: 't-dsa-2', subjectId: 'dsa', text: 'Trace 0/1 Knapsack dynamic programming table recurrence relation', completed: false, isMission: true, createdAt: Date.now() },
];

export const DEFAULT_VIDEOS: VideoResource[] = [
  {
    id: 'v-os-1',
    subjectId: 'os',
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
 * Requirement 2: Smooth Continuous Exam Urgency Color Shift (Green -> Yellow -> Red)
 * Calculates exact fractional daysRemaining and smoothly interpolates HSL color:
 * - daysRemaining >= 15: Safe Green (hue = 145)
 * - 5 < daysRemaining < 15: Green (145) -> Yellow-Green (95) -> Warm Yellow/Amber (45) -> Orange (20)
 * - daysRemaining <= 5: Orange (20) -> Urgent Crimson Red (0) with pulse animation
 */
export function getExamUrgencyColor(examDateString: string): ExamUrgency {
  const fallbackDate = new Date(Date.now() + 7 * 86400 * 1000);
  const target = examDateString ? new Date(examDateString).getTime() : fallbackDate.getTime();
  const diffMs = target - Date.now();

  // Formatted date string for user
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
      statusLabel: 'Exam Today / Completed',
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
    // Vibrant Safe Green
    hue = 145;
    statusLabel = 'On Track (> 15 Days)';
  } else if (fractionalDays > 5) {
    // Smooth transition from Green (145) down to Orange (20)
    const t = (fractionalDays - 5) / (15 - 5); // 0 at 5 days, 1 at 15 days
    hue = Math.round(20 + t * (145 - 20));
    statusLabel = fractionalDays > 9 ? 'Active Prep' : 'Approaching Soon';
  } else {
    // Smooth transition from Orange (20) down to Urgent Red (0)
    const t = Math.max(0, fractionalDays) / 5; // 0 at 0 days, 1 at 5 days
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

// STORAGE KEYS — BUMPED TO exam_hub_v3 AS REQUIRED
const STORAGE_KEYS = {
  SUBJECTS: 'exam_hub_v3_subjects',
  QUESTIONS: 'exam_hub_v3_questions',
  TASKS: 'exam_hub_v3_tasks',
  VIDEOS: 'exam_hub_v3_videos',
  PDFS: 'exam_hub_v3_pdfs',
  ACTIVE_SUBJECT: 'exam_hub_v3_active_subject',
  THEME: 'exam_hub_v3_theme',
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
      console.warn('Error reading subjects:', e);
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
