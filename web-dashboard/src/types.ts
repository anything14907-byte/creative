export type SubjectId = string;

export type QuestionMarks = 2 | 5 | 10;

export type QuestionStatus = 'not-started' | 'mastered';

export type TopicMastery = 'weak' | 'okay' | 'strong';

export interface SubjectUnit {
  id: string; // e.g. 'u1' or 'unit-1'
  unit: number; // 1, 2, 3...
  title: string; // e.g. 'Process Scheduling & CPU Algorithms'
  name?: string; // alias for title
}

export interface SyllabusTopic {
  id: string;
  subjectId: SubjectId;
  unitId: string;
  unitNumber: number;
  title: string;
  completed: boolean;
  mastery: TopicMastery;
  notes?: string;
  pyqCount?: number;
}

export interface PYQQuestion {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  unit: number;
  unitTitle: string;
  unitId?: string; // Links question to a specific SubjectUnit
  topicId?: string;
  topicTitle?: string;
  question: string;
  marks: QuestionMarks;
  yearsAsked: number[];
  repeatCount: number;
  isHighProbability: boolean;
  expectedKeywords: string[];
  
  // Student-friendly exam model answers
  bullets: string[];
  diagramFormulaTip: string;
  
  userStatus: QuestionStatus;
  userNotes?: string;
  lastAttemptScore?: number;
  lastAttemptAnswer?: string;
  bookmarked?: boolean;
  isCustom?: boolean;
}

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  code?: string;
  semester?: string;
  examDate: string; // ISO datetime string: 'YYYY-MM-DDTHH:mm'
  iconName: string;
  accentColor: string; // 10 distinct swatches
  units: SubjectUnit[];
  syllabus?: any;
  topics?: any;
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  label: string;
  urgency: 'critical' | 'high' | 'normal';
}

export interface ExamUrgency {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  fractionalDays: number;
  hue: number;
  hslColor: string;
  isUrgent: boolean; // fractionalDays <= 5
  statusLabel: string;
  formattedCountdown: string;
  formattedExamDate: string;
}

export interface StudyTask {
  id: string;
  subjectId: SubjectId;
  text: string;
  completed: boolean;
  isMission: boolean;
  createdAt: number;
  category?: string;
  unitId?: string; // Links task to a specific SubjectUnit
  unit?: number;
}

export interface VideoResource {
  id: string;
  subjectId: SubjectId;
  title: string;
  youtubeUrl: string;
  videoId: string;
  notes: string;
  isWatched: boolean;
  addedAt: number;
  unitId?: string; // Links video to a specific SubjectUnit
  unit?: number;
}

export interface PdfResource {
  id: string;
  subjectId: SubjectId;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  extractedText: string;
  summary: string;
  extractedQuestions?: string[];
  unitId?: string; // Links PDF to a specific SubjectUnit
  unit?: number;
}

export interface ConceptExplainer {
  id: string;
  subjectId: SubjectId;
  unit: number;
  topicTitle: string;
  oneMinuteSummary: string;
  architectureFlow: {
    title: string;
    steps: string[];
  };
  examPoints: string[];
  rubricKeywords: string[];
}

export interface EvaluationResult {
  scoreOutOf10: number;
  percentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  wordCount: number;
  feedback: string;
  passedThreshold: boolean;
}

export interface SyncPayload {
  version: string;
  timestamp: number;
  subjects: SubjectMeta[];
  questions: PYQQuestion[];
  activeSubjectId: SubjectId;
  theme: 'light' | 'dark';
}

export interface PomodoroSession {
  id: string;
  subjectId: SubjectId;
  subjectName?: string;
  accentColor?: string;
  minutes: number;
  date: string; // 'YYYY-MM-DD'
  timestamp: number;
}

export interface Flashcard {
  id: string;
  subjectId: SubjectId;
  unitId?: string;
  topicId?: string;
  topicTitle?: string;
  front: string;
  back: string;
  intervalStep: 0 | 1 | 2 | 3; // 0=new (today), 1=1d, 2=3d, 3=7d
  nextReviewDate: string; // 'YYYY-MM-DD'
  createdAt: number;
  lastReviewedAt?: number;
}

export interface PlannerDayTopic {
  topicId: string;
  subjectId: SubjectId;
  subjectName: string;
  accentColor: string;
  unitNumber: number;
  title: string;
  mastery: TopicMastery;
  frequency: number; // PYQ count
  completed: boolean;
  estimatedMinutes: number;
}

export interface DayStudyPlan {
  date: string; // 'YYYY-MM-DD'
  dayNumber: number;
  label: string; // e.g. "Today (Day 1)", "Tomorrow (Day 2)"
  isToday: boolean;
  isPast: boolean;
  topics: PlannerDayTopic[];
}

export interface FullBackupData {
  version: string;
  exportedAt: string;
  subjects: SubjectMeta[];
  topics: SyllabusTopic[];
  questions: PYQQuestion[];
  tasks: StudyTask[];
  videos: VideoResource[];
  pdfs: PdfResource[];
  pomodoroLogs: PomodoroSession[];
  flashcards: Flashcard[];
}
