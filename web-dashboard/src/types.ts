export type SubjectId = 'os' | 'dbms' | 'cn' | 'dsa' | string;

export type QuestionMarks = 2 | 5 | 10;

export type QuestionStatus = 'not-started' | 'needs-revision' | 'mastered';

export type FrequencyCategory = 'critical' | 'frequent' | 'occasional';

export interface RubricGuide {
  recommendedWordCount: { min: number; max: number };
  structureRequirements: string[];
  keyConcepts: string[];
}

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
  frequencyCategory: FrequencyCategory;
  expectedKeywords: string[];
  rubricGuide: RubricGuide;
  modelAnswerSummary: string;
  userStatus: QuestionStatus;
  userNotes: string;
  lastAttemptScore?: number;
  lastAttemptAnswer?: string;
  lastAttemptDate?: string;
  bookmarked?: boolean;
}

export interface SubjectMeta {
  id: SubjectId;
  code: string;
  name: string;
  semester: string;
  totalCredits: number;
  units: {
    unit: number;
    title: string;
    description: string;
  }[];
}

export interface ExamCountdownConfig {
  subjectId: SubjectId;
  subjectName: string;
  examDate: string; // ISO string e.g. "2026-11-15T09:30:00"
  targetGoalMarks: number;
}

export interface EvaluationResult {
  scoreOutOf10: number;
  percentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  wordCount: number;
  wordCountStatus: 'too-brief' | 'optimal' | 'lengthy';
  structuralChecklist: {
    rule: string;
    passed: boolean;
    feedback: string;
  }[];
  generalFeedback: string;
  passedThreshold: boolean;
}

export interface SyncPayload {
  version: string;
  timestamp: number;
  questions: PYQQuestion[];
  activeSubjectId: SubjectId;
  theme: 'light' | 'dark';
}
