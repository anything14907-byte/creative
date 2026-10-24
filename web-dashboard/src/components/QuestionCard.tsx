import React, { useState } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  PenTool, 
  BookOpen, 
  Sparkles, 
  Check, 
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PYQQuestion, EvaluationResult } from '../types';
import { evaluateAnswer } from '../utils/rubricEvaluator';

interface QuestionCardProps {
  question: PYQQuestion;
  onToggleMastered: (id: string) => void;
  onSaveAnswer: (id: string, answer: string, score: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onToggleMastered,
  onSaveAnswer,
  onShowToast
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState(question.lastAttemptAnswer || '');
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);

  const isMastered = question.userStatus === 'mastered';

  const handleToggleMaster = () => {
    onToggleMastered(question.id);
    if (!isMastered) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#10B981', '#06B6D4', '#F59E0B']
      });
      onShowToast('Marked as Mastered! Keep going 🔥', 'success');
    }
  };

  const handleCheckRecall = () => {
    const res = evaluateAnswer(question, practiceAnswer);
    setEvalResult(res);
    onSaveAnswer(question.id, practiceAnswer, res.scoreOutOf10);

    if (res.scoreOutOf10 >= 8.5) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#06B6D4', '#FFFFFF']
      });
      onShowToast('🎉 Excellent! 8.5+/10 on exam keywords!', 'success');
    }
  };

  return (
    <div className={`p-5 rounded-2xl bg-paper-card dark:bg-night-card border transition-all duration-200 shadow-paper-card dark:shadow-night-card ${
      isMastered 
        ? 'border-emerald-500/50 dark:border-emerald-500/40' 
        : 'border-paper-border dark:border-night-border hover:border-paper-borderHover dark:hover:border-night-borderHover'
    }`}>
      
      {/* Badges Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Unit Badge */}
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-body dark:text-night-text">
            Unit {question.unit}: {question.unitTitle}
          </span>

          {/* Marks Badge */}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            question.marks === 10
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
              : question.marks === 5
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
          }`}>
            {question.marks} Marks
          </span>

          {/* Repeat Badge */}
          {question.repeatCount >= 3 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Repeated {question.repeatCount}x ({question.yearsAsked.slice(-3).join(', ')})
            </span>
          ) : (
            <span className="text-xs text-paper-muted dark:text-night-muted">
              Asked in {question.yearsAsked.join(', ')}
            </span>
          )}
        </div>

        {/* Mastered Toggle Button */}
        <button
          onClick={handleToggleMaster}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors btn-tactile ${
            isMastered
              ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-night-bg shadow-sm'
              : 'bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-body dark:text-night-text hover:border-emerald-500'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isMastered ? 'Mastered ✅' : 'Mark Mastered'}</span>
        </button>
      </div>

      {/* Question Text (100% Contrast) */}
      <h4 className="text-base font-bold text-paper-ink dark:text-night-text leading-snug mb-4">
        {question.question}
      </h4>

      {/* Action Buttons: "Show Easy Answer" & "Test Myself" */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-paper-border dark:border-night-border">
        <button
          onClick={() => {
            setShowAnswer(!showAnswer);
            if (!showAnswer) setShowPractice(false);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors btn-tactile ${
            showAnswer
              ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-night-bg'
              : 'bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text hover:border-emerald-500'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{showAnswer ? 'Hide Answer' : 'Show Easy Answer'}</span>
          {showAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => {
            setShowPractice(!showPractice);
            if (!showPractice) setShowAnswer(false);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors btn-tactile ${
            showPractice
              ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-night-bg'
              : 'bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text hover:border-cyan-500'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>{showPractice ? 'Close Test' : 'Test Myself'}</span>
          {showPractice ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {question.lastAttemptScore !== undefined && (
          <span className="text-xs font-mono font-bold text-paper-muted dark:text-night-muted ml-auto">
            Last score: {question.lastAttemptScore}/10
          </span>
        )}
      </div>

      {/* Expandable Model Exam Answer */}
      {showAnswer && (
        <div className="mt-4 p-4 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border animate-fade-slide-up space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>3 Clear Points to Write in Exam:</span>
          </div>

          <div className="space-y-2">
            {question.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-paper-body dark:text-night-text leading-relaxed">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Key Diagram / Formula Tip */}
          {question.diagramFormulaTip && (
            <div className="p-3 rounded-lg bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-body dark:text-night-text">
              <strong className="text-cyan-700 dark:text-cyan-400">📐 Diagram / Formula Tip: </strong>
              {question.diagramFormulaTip}
            </div>
          )}

          {/* Keywords */}
          {question.expectedKeywords && question.expectedKeywords.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-paper-muted dark:text-night-muted">Keywords:</span>
              {question.expectedKeywords.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expandable "Test Myself" Recall Sandbox */}
      {showPractice && (
        <div className="mt-4 p-4 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border animate-fade-slide-up space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-paper-ink dark:text-night-text">
              Type your answer from memory (without looking):
            </label>
            <span className="text-[11px] text-paper-muted dark:text-night-muted">
              Scored against rubric keywords
            </span>
          </div>

          <textarea
            rows={4}
            placeholder="Type key definitions, algorithm steps, or formulas..."
            value={practiceAnswer}
            onChange={e => setPracticeAnswer(e.target.value)}
            className="w-full p-3 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text text-xs focus:outline-none focus:border-cyan-500"
          />

          <div className="flex justify-end">
            <button
              onClick={handleCheckRecall}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-500 dark:text-night-bg text-xs font-bold btn-tactile"
            >
              Check Score
            </button>
          </div>

          {evalResult && (
            <div className="p-3.5 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-paper-ink dark:text-night-text">
                  Score: <span className="text-cyan-600 dark:text-cyan-400 text-sm">{evalResult.scoreOutOf10}/10</span> ({evalResult.wordCount} words)
                </span>
                <span className="text-xs font-semibold text-paper-muted dark:text-night-muted">
                  {evalResult.matchedKeywords.length} of {question.expectedKeywords.length} Keywords Hit
                </span>
              </div>

              {evalResult.missingKeywords.length > 0 && (
                <div className="text-xs text-paper-body dark:text-night-muted">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Include next time: </span>
                  {evalResult.missingKeywords.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
