import { PYQQuestion, EvaluationResult } from '../types';

export function evaluateAnswer(question: PYQQuestion, answerText: string): EvaluationResult {
  const trimmed = (answerText || '').trim();
  if (!trimmed) {
    return {
      scoreOutOf10: 0,
      percentage: 0,
      matchedKeywords: [],
      missingKeywords: [...question.expectedKeywords],
      wordCount: 0,
      feedback: 'Type your bullet points or definition to test your recall.',
      passedThreshold: false
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lowerAnswer = trimmed.toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of question.expectedKeywords) {
    const cleanKw = kw.toLowerCase().trim();
    const tokens = cleanKw.split(/\s+/);
    const tokenMatch = tokens.length > 1 ? tokens.every(t => lowerAnswer.includes(t)) : false;

    if (lowerAnswer.includes(cleanKw) || tokenMatch) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const minTargetWords = question.marks === 2 ? 20 : question.marks === 5 ? 50 : 120;
  const kwCoverage = question.expectedKeywords.length > 0 
    ? matchedKeywords.length / question.expectedKeywords.length 
    : 1;

  // 6 points for keywords, 3 points for length, 1 point for bullet structure
  const kwScore = kwCoverage * 6.0;
  const lenScore = Math.min(3.0, (wordCount / minTargetWords) * 3.0);
  const hasBullets = /(?:^|\n)\s*(?:[-*•]|\d+[.)])\s+/m.test(trimmed) ? 1.0 : 0.5;

  let score = Math.round((kwScore + lenScore + hasBullets) * 10) / 10;
  score = Math.min(10, Math.max(1, score));

  let feedback = 'Keep practicing! Review the ideal answer bullets above to improve.';
  if (score >= 8.5) {
    feedback = '🌟 Outstanding! You nailed the core keywords and structure expected in university exams.';
  } else if (score >= 6.5) {
    feedback = '👍 Solid response! Try including the missing keywords highlighted in red for full marks.';
  } else if (score >= 4.0) {
    feedback = '📝 Good start! Add more technical details and bullet points to hit exam rubric benchmarks.';
  }

  return {
    scoreOutOf10: score,
    percentage: Math.round((score / 10) * 100),
    matchedKeywords,
    missingKeywords,
    wordCount,
    feedback,
    passedThreshold: score >= 7.0
  };
}
