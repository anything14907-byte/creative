export type SubjectId = 'os' | 'dbms' | 'cn' | 'dsa' | string;

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
}

export interface SubjectMeta {
  id: SubjectId;
  code: string;
  name: string;
  semester: string;
  iconName: string;
  units: {
    unit: number;
    title: string;
  }[];
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
  questions: PYQQuestion[];
  activeSubjectId: SubjectId;
  theme: 'light' | 'dark';
}
