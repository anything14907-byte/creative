import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Flame, 
  FileText, 
  Award, 
  ChevronRight, 
  Check, 
  ArrowLeft,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PYQQuestion, EvaluationResult, QuestionStatus } from '../types';
import { evaluateAnswer } from '../utils/rubricEvaluator';

interface RubricGraderSandboxProps {
  question: PYQQuestion;
  allQuestions: PYQQuestion[];
  onSelectAnotherQuestion: (q: PYQQuestion) => void;
  onBackToExplorer: () => void;
  onUpdateQuestionAnswer: (id: string, answer: string, score: number, status: QuestionStatus) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const RubricGraderSandbox: React.FC<RubricGraderSandboxProps> = ({
  question,
  allQuestions,
  onSelectAnotherQuestion,
  onBackToExplorer,
  onUpdateQuestionAnswer,
  onShowToast
}) => {
  const [answerText, setAnswerText] = useState(question.lastAttemptAnswer || '');
  const [evaluation, setEvaluation] = useState<EvaluationResult>(() => evaluateAnswer(question, question.lastAttemptAnswer || ''));
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(() => (question.marks === 2 ? 180 : question.marks === 5 ? 480 : 900));
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const confettiFiredRef = useRef(false);

  // Filter subject questions for quick switcher
  const siblingQuestions = allQuestions.filter(q => q.subjectId === question.subjectId);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            onShowToast('⏰ Time is up for this question!', 'info');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Real-time evaluation on typing
  useEffect(() => {
    const result = evaluateAnswer(question, answerText);
    setEvaluation(result);

    // Trigger celebration when student crosses 8.5/10!
    if (result.scoreOutOf10 >= 8.5 && !confettiFiredRef.current && answerText.length > 50) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      confettiFiredRef.current = true;
      onShowToast('🎉 Stellar Answer! Rubric score exceeded 8.5/10!', 'success');
    } else if (result.scoreOutOf10 < 8.0) {
      confettiFiredRef.current = false;
    }
  }, [answerText, question]);

  const handleSaveProgress = () => {
    const newStatus: QuestionStatus = evaluation.scoreOutOf10 >= 7.5 ? 'mastered' : 'needs-revision';
    onUpdateQuestionAnswer(question.id, answerText, evaluation.scoreOutOf10, newStatus);
    onShowToast(`Progress saved! Rubric score: ${evaluation.scoreOutOf10}/10 (Marked as ${newStatus})`, 'success');
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(question.marks === 2 ? 180 : question.marks === 5 ? 480 : 900);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header / Back Button / Timer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToExplorer}
            className="p-2 rounded-xl border border-solar-border dark:border-obsidian-border text-solar-muted dark:text-obsidian-muted hover:text-solar-text dark:hover:text-obsidian-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Question Bank"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                Unit {question.unit} • {question.marks} Marks
              </span>
              {question.repeatCount >= 3 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                  <Flame className="w-3.5 h-3.5 fill-rose-500" /> Asked {question.repeatCount}x
                </span>
              )}
            </div>
            <span className="text-xs text-solar-muted dark:text-obsidian-muted">
              {question.subjectName} ({question.unitTitle})
            </span>
          </div>
        </div>

        {/* Practice Timer & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-solar-border dark:border-obsidian-border bg-slate-50 dark:bg-slate-900 font-mono text-sm font-bold text-solar-text dark:text-obsidian-text">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span className={timerSeconds < 60 ? 'text-rose-500 animate-pulse' : ''}>
              {formatTimer(timerSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-solar-text dark:text-obsidian-text hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-500 transition-colors"
              title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleResetTimer}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-solar-text dark:text-obsidian-text hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSaveProgress}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save Result</span>
          </button>
        </div>

      </div>

      {/* Question Details Banner */}
      <div className="p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-950/80 bg-indigo-50/30 dark:bg-indigo-950/20">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
          <Award className="w-4 h-4" /> Exam Question Prompt
        </div>
        <h2 className="text-base sm:text-lg font-bold text-solar-text dark:text-obsidian-text leading-relaxed">
          {question.question}
        </h2>

        {/* Quick Sibling Question Switcher */}
        <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-950/60 flex items-center justify-between text-xs text-solar-muted dark:text-obsidian-muted">
          <span>Switch PYQ:</span>
          <select
            value={question.id}
            onChange={(e) => {
              const selected = siblingQuestions.find(q => q.id === e.target.value);
              if (selected) {
                onSelectAnotherQuestion(selected);
                setAnswerText(selected.lastAttemptAnswer || '');
                confettiFiredRef.current = false;
              }
            }}
            className="text-xs font-medium px-2 py-1 rounded-lg border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-solar-text dark:text-obsidian-text outline-none max-w-xs truncate"
          >
            {siblingQuestions.map(q => (
              <option key={q.id} value={q.id}>
                {q.marks}M: {q.question.slice(0, 50)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Sandbox Split: Editor (Left 3 cols) & Real-time Rubric Grader (Right 2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Editor Box (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="p-4 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm flex-1 flex flex-col">
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-solar-muted dark:text-obsidian-muted">
                Student Answer Sandbox
              </span>
              <div className="flex items-center gap-3 text-xs text-solar-muted dark:text-obsidian-muted font-mono">
                <span>{evaluation.wordCount} words</span>
                <span>•</span>
                <span>Target: {question.rubricGuide.recommendedWordCount.min}–{question.rubricGuide.recommendedWordCount.max} words</span>
              </div>
            </div>

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your exam response here. Use bullet points, technical definitions, equations, and algorithms as expected by the university evaluator..."
              className="w-full flex-1 min-h-[360px] p-4 rounded-xl border border-solar-border dark:border-obsidian-border bg-slate-50/50 dark:bg-slate-900/50 text-solar-text dark:text-obsidian-text font-sans text-sm leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y placeholder:text-solar-muted dark:placeholder:text-obsidian-muted"
            />

            {/* Quick Answer Snippets / Format Aids */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-solar-border dark:border-obsidian-border text-xs text-solar-muted dark:text-obsidian-muted">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold">Format tip:</span>
                <button
                  type="button"
                  onClick={() => setAnswerText(prev => prev + '\n\n• Point 1: \n• Point 2: \n• Point 3: ')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:text-indigo-500 text-[11px]"
                >
                  + Bullet List
                </button>
                <button
                  type="button"
                  onClick={() => setAnswerText(prev => prev + '\n\nAlgorithm Steps:\n1. Initialize: \n2. Process: \n3. Return: ')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:text-indigo-500 text-[11px]"
                >
                  + Algorithm Steps
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-xs"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showModelAnswer ? 'Hide Model Key' : 'Reveal Model Answer'}</span>
              </button>
            </div>

          </div>

          {/* Model Answer Drawer */}
          {showModelAnswer && (
            <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Official Evaluator Model Summary
                </div>
                <span className="text-[10px] text-solar-muted dark:text-obsidian-muted">
                  Use for active recall checking
                </span>
              </div>
              <p className="text-xs sm:text-sm text-solar-text dark:text-obsidian-text leading-relaxed">
                {question.modelAnswerSummary}
              </p>
            </div>
          )}
        </div>

        {/* Real-Time Rubric Grader Score Card (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Instant Score Gauge Card */}
          <div className="p-6 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-solar-muted dark:text-obsidian-muted">
                Live Rubric Evaluation
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" /> Real-time
              </span>
            </div>

            {/* Score Ring Display */}
            <div className="flex items-center gap-5 my-4">
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-extrabold text-2xl border-2 shadow-inner transition-colors ${
                evaluation.scoreOutOf10 >= 8.5
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : evaluation.scoreOutOf10 >= 6.5
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-400'
                  : evaluation.scoreOutOf10 >= 4.0
                  ? 'bg-amber-50 text-amber-600 border-amber-500 dark:bg-amber-950/50 dark:text-amber-400'
                  : 'bg-rose-50 text-rose-600 border-rose-500 dark:bg-rose-950/50 dark:text-rose-400'
              }`}>
                <span>{evaluation.scoreOutOf10}</span>
                <span className="text-[10px] font-medium text-solar-muted dark:text-obsidian-muted">/ 10</span>
              </div>

              <div>
                <div className="font-bold text-sm text-solar-text dark:text-obsidian-text">
                  {evaluation.scoreOutOf10 >= 8.5 ? 'Full Marks Caliber' : evaluation.scoreOutOf10 >= 6.5 ? 'Strong Answer' : evaluation.scoreOutOf10 >= 4.0 ? 'Average Response' : 'Revision Required'}
                </div>
                <div className="text-xs text-solar-muted dark:text-obsidian-muted mt-0.5">
                  {evaluation.percentage}% Rubric Match
                </div>
                <div className="text-[11px] font-medium mt-1">
                  Word Count Status:{' '}
                  <span className={
                    evaluation.wordCountStatus === 'optimal' 
                      ? 'text-emerald-500 font-bold' 
                      : 'text-amber-500 font-bold'
                  }>
                    {evaluation.wordCountStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-solar-muted dark:text-obsidian-muted p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-solar-border dark:border-obsidian-border mb-4">
              {evaluation.generalFeedback}
            </p>

            {/* Keyword Checklist */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-solar-text dark:text-obsidian-text mb-1.5">
                  <span>Required Rubric Keywords ({evaluation.matchedKeywords.length}/{question.expectedKeywords.length})</span>
                  <span className="text-[11px] text-solar-muted">Weight: 50%</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {question.expectedKeywords.map(kw => {
                    const isMatched = evaluation.matchedKeywords.includes(kw);
                    return (
                      <span
                        key={kw}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800 opacity-80'
                        }`}
                      >
                        {isMatched ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        <span>{kw}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Structural Checklist */}
              <div className="pt-3 border-t border-solar-border dark:border-obsidian-border space-y-2">
                <div className="text-xs font-bold text-solar-text dark:text-obsidian-text">
                  Structural & Presentation Checklist
                </div>
                {evaluation.structuralChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-solar-text dark:text-obsidian-text">{item.rule}</div>
                      <div className="text-[11px] text-solar-muted dark:text-obsidian-muted">{item.feedback}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Quick Mark Rubric Tips */}
          <div className="p-4 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card text-xs text-solar-muted dark:text-obsidian-muted">
            <div className="font-bold text-solar-text dark:text-obsidian-text mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Evaluation Criteria Breakdown
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li><strong>2 Marks:</strong> Clear 1-sentence definition + 2 essential attributes.</li>
              <li><strong>5 Marks:</strong> Definition + working principle + bulleted characteristics.</li>
              <li><strong>10 Marks:</strong> Complete algorithm/proof + mathematical equation + diagram explanation.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
