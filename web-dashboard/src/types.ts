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
  code: string;
  name: string;
  semester: string;
  iconName: string;
  accentColor: string; // e.g. '#00F0FF', '#FFB800', '#FF3366', '#00F5A0', '#38BDF8'
  examDate: string; // ISO datetime string: 'YYYY-MM-DDTHH:mm'
  units: {
    unit: number;
    title: string;
  }[];
}

export interface StudyTask {
  id: string;
  subjectId: SubjectId;
  text: string;
  completed: boolean;
  isMission: boolean;
  category: 'pyq' | 'video' | 'pdf' | 'concept' | 'custom';
  createdAt: number;
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
  extractedQuestions: string[];
}

export interface ConceptExplainer {
  topic: string;
  unitTitle: string;
  subjectId: SubjectId;
  analogy: {
    title: string;
    story: string;
    keyTakeaway: string;
  };
  architectureFlow: {
    title: string;
    steps: string[];
    formulaOrRule: string;
  };
  examPoints: string[];
  rubricKeywords: string[];
  flashcards: {
    question: string;
    answer: string;
  }[];
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  urgency: 'critical' | 'high' | 'normal' | 'passed';
  label: string;
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
