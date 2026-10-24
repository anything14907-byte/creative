export type SubjectId = string;

export type QuestionMarks = 2 | 5 | 10;

export type QuestionStatus = 'not-started' | 'mastered';

export interface PYQQuestion {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  unit: number;
  unitTitle: string;
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
  accentColor: string; // Hex color: '#10B981', '#06B6D4', '#F59E0B', '#EF4444'
  units: {
    unit: number;
    title: string;
  }[];
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
