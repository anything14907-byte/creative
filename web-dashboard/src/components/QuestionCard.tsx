import React, { useState } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  PenTool, 
  BookOpen, 
  Tag, 
  Sparkles, 
  Lightbulb, 
  Check, 
  X,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PYQQuestion, QuestionStatus, EvaluationResult } from '../types';
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
        particleCount: 45,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#00E599', '#38BDF8', '#F59E0B']
      });
      onShowToast('Marked as Mastered! Keep crushing it 🔥', 'success');
    }
  };

  const handleCheckRecall = () => {
    const res = evaluateAnswer(question, practiceAnswer);
    setEvalResult(res);
    onSaveAnswer(question.id, practiceAnswer, res.scoreOutOf10);

    if (res.scoreOutOf10 >= 8.5) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00E599', '#38BDF8', '#FFFFFF']
      });
      onShowToast('🎉 Stellar Recall! 8.5+/10 on exam keywords!', 'success');
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 p-5 bg-white/90 dark:bg-[#0F1722]/80 backdrop-blur-md ${
      isMastered 
        ? 'border-emerald-500/40 shadow-sm'
        : question.isHighProbability 
        ? 'border-emerald-500/30 hover:border-[#00E599] shadow-sm hover:shadow-glow-emerald/10'
        : 'border-day-border dark:border-cyber-border hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      
      {/* Badges Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Unit Badge */}
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Unit {question.unit}: {question.unitTitle}
          </span>

          {/* Marks Badge */}
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
            question.marks === 10
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              : question.marks === 5
              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-[#00E599] border border-emerald-500/20'
          }`}>
            {question.marks} Marks
          </span>

          {/* Repeat Frequency Badge */}
          {question.repeatCount >= 3 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Asked {question.repeatCount}x ({question.yearsAsked.join(', ')})</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg text-xs text-day-muted dark:text-cyber-muted bg-slate-100/60 dark:bg-slate-800/40">
              Asked in {question.yearsAsked.join(', ')}
            </span>
          )}

        </div>

        {/* Mastered Toggle Button */}
        <button
          onClick={handleToggleMaster}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            isMastered
              ? 'bg-emerald-600 text-white dark:bg-[#00E599] dark:text-[#06090E] shadow-sm'
              : 'border border-day-border dark:border-cyber-border text-day-muted dark:text-cyber-muted hover:border-[#00E599] hover:text-day-text dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'text-white dark:text-[#06090E]' : 'text-slate-400'}`} />
          <span>{isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
        </button>
      </div>

      {/* Question Text */}
      <h3 className="text-sm sm:text-base font-bold text-day-text dark:text-white leading-relaxed mb-4">
        {question.question}
      </h3>

      {/* Action Buttons: Show Ideal Answer & Test Yourself */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-day-border/60 dark:border-cyber-border/60">
        
        {/* Toggle Ideal Exam Answer */}
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            showAnswer
              ? 'bg-slate-200 dark:bg-slate-800 text-day-text dark:text-white'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-[#00E599] border border-emerald-500/20'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{showAnswer ? 'Hide Exam Answer' : '📖 Show Ideal Exam Answer'}</span>
          {showAnswer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Toggle Test Yourself Practice */}
        <button
          onClick={() => setShowPractice(!showPractice)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            showPractice
              ? 'bg-slate-200 dark:bg-slate-800 text-day-text dark:text-white'
              : 'border border-day-border dark:border-cyber-border text-day-text dark:text-white hover:border-[#00E599]'
          }`}
        >
          <PenTool className="w-3.5 h-3.5 text-cyan-500" />
          <span>{showPractice ? 'Close Practice' : '✍️ Test Yourself'}</span>
        </button>

        {question.lastAttemptScore !== undefined && (
          <span className="text-xs font-semibold text-day-muted dark:text-cyber-muted ml-auto">
            Last Score: <strong className="text-emerald-600 dark:text-[#00E599]">{question.lastAttemptScore}/10</strong>
          </span>
        )}
      </div>

      {/* EXPANDABLE 1: IDEAL EXAM ANSWER (3-4 Crisp Bullets + Diagram/Formula + Keywords) */}
      {showAnswer && (
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0A0F18] border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
          
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-[#00E599] flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00E599]" />
              Ideal 3–4 Bullet Points for Exam Full Marks
            </div>
            
            <ul className="space-y-2 text-xs sm:text-sm text-day-text dark:text-slate-200 leading-relaxed">
              {question.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-[#00E599] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Diagram / Formula Tip */}
          {question.diagramFormulaTip && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-xs">
              <div className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                Must-Draw Diagram / Formula Tip:
              </div>
              <p className="text-day-muted dark:text-slate-300 leading-relaxed">
                {question.diagramFormulaTip}
              </p>
            </div>
          )}

          {/* Must-Include Keywords */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-day-muted dark:text-cyber-muted mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-500" /> Essential Keywords Evaluator Looks For:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {question.expectedKeywords.map(kw => (
                <span 
                  key={kw} 
                  className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#00E599]/15 text-emerald-800 dark:text-[#00E599] border border-[#00E599]/30"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* EXPANDABLE 2: TEST YOURSELF INLINE PRACTICE BOX */}
      {showPractice && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0A0F18] border border-day-border dark:border-cyber-border space-y-3 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-day-text dark:text-white flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-cyan-400" />
              Active Recall Test Box
            </span>
            <span className="text-day-muted dark:text-cyber-muted">
              {practiceAnswer.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            value={practiceAnswer}
            onChange={(e) => setPracticeAnswer(e.target.value)}
            placeholder="Type your brief answers or bullet points from memory here to check your score..."
            rows={4}
            className="w-full p-3 rounded-xl border border-day-border dark:border-cyber-border bg-white dark:bg-[#0F1722] text-xs sm:text-sm text-day-text dark:text-white outline-none focus:border-[#00E599] transition-all resize-y"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setPracticeAnswer('');
                setEvalResult(null);
              }}
              className="text-xs text-day-muted dark:text-cyber-muted hover:text-day-text flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>

            <button
              onClick={handleCheckRecall}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00E599] dark:hover:bg-[#00C782] text-white dark:text-[#06090E] font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Check My Answer Score</span>
            </button>
          </div>

          {/* Feedback Display */}
          {evalResult && (
            <div className={`p-3 rounded-xl border text-xs space-y-2 ${
              evalResult.scoreOutOf10 >= 8
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : evalResult.scoreOutOf10 >= 5
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Score: {evalResult.scoreOutOf10} / 10</span>
                <span>{evalResult.matchedKeywords.length}/{question.expectedKeywords.length} Keywords Hit</span>
              </div>
              <p>{evalResult.feedback}</p>

              {/* Missing Keywords Alert */}
              {evalResult.missingKeywords.length > 0 && (
                <div className="pt-1 text-[11px]">
                  <span className="font-bold">Missing Keywords: </span>
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
