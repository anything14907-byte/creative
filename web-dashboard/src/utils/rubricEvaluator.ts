import { PYQQuestion, EvaluationResult } from '../types';

/**
 * Evaluates a student's answer against the PYQ's specific rubric
 */
export function evaluateAnswer(question: PYQQuestion, answerText: string): EvaluationResult {
  const trimmed = answerText.trim();
  if (!trimmed) {
    return {
      scoreOutOf10: 0,
      percentage: 0,
      matchedKeywords: [],
      missingKeywords: [...question.expectedKeywords],
      wordCount: 0,
      wordCountStatus: 'too-brief',
      structuralChecklist: [
        { rule: 'Definition & Core Thesis', passed: false, feedback: 'No answer provided.' },
        { rule: 'Technical Keywords Coverage', passed: false, feedback: '0 of ' + question.expectedKeywords.length + ' keywords detected.' },
        { rule: 'Depth & Structural Formatting', passed: false, feedback: 'Include bullet points or step-by-step logic.' }
      ],
      generalFeedback: 'Type your answer to evaluate your mastery against university rubric standards.',
      passedThreshold: false
    };
  }

  // Calculate word count
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Determine target word ranges based on question marks
  const minWords = question.rubricGuide?.recommendedWordCount?.min || (question.marks === 2 ? 25 : question.marks === 5 ? 75 : 175);
  const maxWords = question.rubricGuide?.recommendedWordCount?.max || (question.marks === 2 ? 65 : question.marks === 5 ? 180 : 400);

  let wordCountStatus: 'too-brief' | 'optimal' | 'lengthy' = 'optimal';
  let wordScore = 2.5; // Max 2.5 for length/detail

  if (wordCount < minWords) {
    wordCountStatus = 'too-brief';
    const ratio = wordCount / minWords;
    wordScore = Math.max(0.5, ratio * 2.0);
  } else if (wordCount > maxWords * 1.5) {
    wordCountStatus = 'lengthy';
    wordScore = 2.0; // slight deduction for overly verbose/unstructured rambling
  } else {
    wordCountStatus = 'optimal';
    wordScore = 2.5;
  }

  // Keyword Matching
  const lowerAnswer = trimmed.toLowerCase();
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of question.expectedKeywords) {
    const cleanKw = kw.toLowerCase().trim();
    // Allow matching key sub-tokens (e.g. "banker" in "banker's algorithm")
    const tokens = cleanKw.split(/\s+/);
    const regex = new RegExp(`\\b${escapeRegExp(cleanKw)}\\b`, 'i');
    const tokenMatch = tokens.length > 1 ? tokens.every(t => lowerAnswer.includes(t)) : false;

    if (regex.test(lowerAnswer) || tokenMatch || lowerAnswer.includes(cleanKw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordCoverageRatio = question.expectedKeywords.length > 0 
    ? matchedKeywords.length / question.expectedKeywords.length 
    : 1.0;
  const keywordScore = keywordCoverageRatio * 5.0; // Max 5.0 for rubric keywords

  // Structural heuristics (Max 2.5)
  let structureScore = 0.5;
  const hasBulletsOrNumbers = /(?:^|\n)\s*(?:[-*•]|\d+[.)])\s+/m.test(trimmed);
  const hasParagraphs = trimmed.split(/\n\s*\n/).length > 1;
  const hasFormulasOrArrows = /[=<>+*/→⇒\-]/.test(trimmed);
  const hasIntroOrConclusion = /(definition|defined as|in conclusion|summary|therefore|steps|algorithm|example)/i.test(trimmed);

  const structuralChecklist = [
    {
      rule: 'Key Concept Coverage',
      passed: matchedKeywords.length >= Math.ceil(question.expectedKeywords.length * 0.6),
      feedback: matchedKeywords.length >= Math.ceil(question.expectedKeywords.length * 0.6)
        ? `Great keyword density (${matchedKeywords.length}/${question.expectedKeywords.length} terms hit)`
        : `Missing ${missingKeywords.length} essential rubric terms: ${missingKeywords.slice(0, 3).join(', ')}`
    },
    {
      rule: 'Recommended Word Length',
      passed: wordCount >= minWords,
      feedback: wordCount >= minWords
        ? `Sufficient depth (${wordCount} words, target: ${minWords}–${maxWords})`
        : `Answer is too brief for a ${question.marks}M question (${wordCount}/${minWords} words required)`
    },
    {
      rule: 'Structured Format (Bullets / Steps / Math)',
      passed: hasBulletsOrNumbers || (question.marks === 2 && hasIntroOrConclusion),
      feedback: hasBulletsOrNumbers
        ? 'Clear structured presentation with step points.'
        : 'Examiners reward bulleted answers, steps, and formulas over unbroken walls of text.'
    }
  ];

  if (hasBulletsOrNumbers) structureScore += 1.0;
  if (hasFormulasOrArrows) structureScore += 0.5;
  if (hasIntroOrConclusion) structureScore += 0.5;
  structureScore = Math.min(2.5, structureScore);

  // Total raw score out of 10
  const totalScore = Math.min(10, Math.round((wordScore + keywordScore + structureScore) * 10) / 10);
  const percentage = Math.round((totalScore / 10) * 100);

  let generalFeedback = '';
  if (totalScore >= 8.5) {
    generalFeedback = '🌟 Outstanding! Your response strictly adheres to official grading keys with accurate technical terminology.';
  } else if (totalScore >= 6.5) {
    generalFeedback = '👍 Good solid response. Integrate the missing rubric terms to secure full marks from the evaluator.';
  } else if (totalScore >= 4.0) {
    generalFeedback = '⚠️ Average answer. Your answer lacks specific technical keywords and structural breakdown.';
  } else {
    generalFeedback = '❌ Needs significant revision. Review the model answer and incorporate core definitions.';
  }

  return {
    scoreOutOf10: totalScore,
    percentage,
    matchedKeywords,
    missingKeywords,
    wordCount,
    wordCountStatus,
    structuralChecklist,
    generalFeedback,
    passedThreshold: totalScore >= 7.0
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
