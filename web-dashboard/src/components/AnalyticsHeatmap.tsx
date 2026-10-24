import React, { useState } from 'react';
import { 
  Flame, 
  Target, 
  CheckCircle, 
  TrendingUp, 
  Zap, 
  Clock, 
  Award, 
  ArrowRight, 
  Calendar,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { PYQQuestion, SubjectMeta, SubjectId } from '../types';

interface AnalyticsHeatmapProps {
  questions: PYQQuestion[];
  subject: SubjectMeta;
  examDateStr: string;
  onUpdateExamDate: (newDate: string) => void;
  onSelectQuestionForPractice: (question: PYQQuestion) => void;
  onFilterByUnit: (unit: number) => void;
}

export const AnalyticsHeatmap: React.FC<AnalyticsHeatmapProps> = ({
  questions,
  subject,
  examDateStr,
  onUpdateExamDate,
  onSelectQuestionForPractice,
  onFilterByUnit
}) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(examDateStr.slice(0, 16));

  const subjectQuestions = questions.filter(q => q.subjectId === subject.id);
  
  // KPI 1: Total PYQs Indexed
  const totalCount = subjectQuestions.length;

  // KPI 2: High-Probability / Guaranteed Repeats (>= 3 times)
  const highProbabilityQuestions = subjectQuestions.filter(q => q.isHighProbability || q.repeatCount >= 3);
  
  // KPI 3: Syllabus Coverage %
  const unitsWithQuestions = new Set(subjectQuestions.map(q => q.unit)).size;
  const coveragePercent = Math.min(100, Math.round((unitsWithQuestions / (subject.units.length || 5)) * 100));

  // KPI 4: Practice Mastery
  const masteredCount = subjectQuestions.filter(q => q.userStatus === 'mastered').length;
  const masteryPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // Countdown calculations
  const targetTime = new Date(examDateStr).getTime();
  const now = Date.now();
  const diffHours = Math.max(0, Math.floor((targetTime - now) / (1000 * 60 * 60)));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  // Topic Frequency Matrix: Aggregate Marks Yielded Per Syllabus Unit over past 5 years
  const unitStats = subject.units.map(unitObj => {
    const unitQuestions = subjectQuestions.filter(q => q.unit === unitObj.unit);
    const totalYieldMarks = unitQuestions.reduce((acc, q) => acc + (q.marks * q.repeatCount), 0);
    const repeatCountSum = unitQuestions.reduce((acc, q) => acc + q.repeatCount, 0);
    const criticalQuestions = unitQuestions.filter(q => q.isHighProbability);

    return {
      unit: unitObj.unit,
      title: unitObj.title,
      description: unitObj.description,
      questionCount: unitQuestions.length,
      totalYieldMarks,
      repeatCountSum,
      criticalCount: criticalQuestions.length,
      yieldLevel: totalYieldMarks >= 35 ? 'HIGH_YIELD' : totalYieldMarks >= 20 ? 'MEDIUM_YIELD' : 'NORMAL'
    };
  });

  const maxYieldMarks = Math.max(...unitStats.map(u => u.totalYieldMarks), 1);

  // Top 5 Must-Revise Questions (sorted by repeatCount desc, then marks desc)
  const topMustRevise = [...subjectQuestions]
    .sort((a, b) => (b.repeatCount * b.marks) - (a.repeatCount * a.marks))
    .slice(0, 5);

  const handleSaveDate = () => {
    onUpdateExamDate(new Date(tempDate).toISOString());
    setIsEditingDate(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Target Exam Countdown Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-cyan-300 border border-white/10 mb-3">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exam Countdown • {subject.name} ({subject.code})</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {diffDays > 0 ? (
                <>
                  <span className="text-amber-400 font-mono text-3xl sm:text-4xl">{diffDays}</span> Days and{' '}
                  <span className="text-cyan-300 font-mono text-3xl sm:text-4xl">{remainingHours}</span> Hours Left
                </>
              ) : (
                <span className="text-rose-400 font-mono">Exam is Today! Last-Minute Cram Mode 🔥</span>
              )}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Target high-probability topics first. Master the top 5 questions below to guarantee high marks.
            </p>
          </div>

          {/* Countdown Clock / Date Editor */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {isEditingDate ? (
              <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-indigo-500/50">
                <input
                  type="datetime-local"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="bg-transparent text-white text-xs px-2 py-1 rounded outline-none border border-slate-700"
                />
                <button
                  onClick={handleSaveDate}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingDate(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingDate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-semibold transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4 text-cyan-300" />
                <span>Change Exam Date</span>
              </button>
            )}

            <button
              onClick={() => onSelectQuestionForPractice(topMustRevise[0])}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-95 w-full sm:w-auto"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Cram Top Repeated PYQ</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-solar-muted dark:text-obsidian-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">PYQs Indexed</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-solar-text dark:text-obsidian-text">
            {totalCount}
          </div>
          <div className="text-xs text-solar-muted dark:text-obsidian-muted mt-1">
            Across 5 past exam sessions (2021–2025)
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-solar-muted dark:text-obsidian-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Guaranteed Repeats</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
              <Flame className="w-4 h-4 fill-rose-500" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {highProbabilityQuestions.length}
          </div>
          <div className="text-xs text-solar-muted dark:text-obsidian-muted mt-1">
            Questions asked 3+ times (90%+ hit chance)
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-solar-muted dark:text-obsidian-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Syllabus Coverage</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-500">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
            {coveragePercent}%
          </div>
          <div className="text-xs text-solar-muted dark:text-obsidian-muted mt-1">
            {unitsWithQuestions} of {subject.units.length} units mapped to questions
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-solar-muted dark:text-obsidian-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mastered PYQs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {masteredCount} <span className="text-sm font-normal text-solar-muted dark:text-obsidian-muted">({masteryPercent}%)</span>
          </div>
          <div className="text-xs text-solar-muted dark:text-obsidian-muted mt-1">
            Rubric score ≥ 7.0 secured in recall
          </div>
        </div>

      </div>

      {/* Main Grid: Topic Frequency Matrix (Left) & Top 5 Must-Revise Questions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Topic Frequency Matrix (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-solar-text dark:text-obsidian-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Topic Frequency & Exam Mark Yield Matrix
              </h2>
              <p className="text-xs text-solar-muted dark:text-obsidian-muted">
                Cumulative historical marks yield per unit (2021–2025). Prioritize high-yield bars.
              </p>
            </div>
            <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              5-Year Weightage
            </span>
          </div>

          {/* Unit Visual Heatmap Bars */}
          <div className="space-y-4">
            {unitStats.map(stat => {
              const percentage = Math.round((stat.totalYieldMarks / maxYieldMarks) * 100);
              const isHigh = stat.yieldLevel === 'HIGH_YIELD';
              return (
                <div 
                  key={stat.unit}
                  onClick={() => onFilterByUnit(stat.unit)}
                  className="p-3.5 rounded-xl border border-solar-border dark:border-obsidian-border hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-solar-text dark:text-obsidian-text group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Unit {stat.unit}: {stat.title}
                        </span>
                        {isHigh && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                            <Flame className="w-3 h-3 fill-rose-500" /> Highest Yield
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-solar-muted dark:text-obsidian-muted line-clamp-1">
                        {stat.description}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                        {stat.totalYieldMarks} Marks
                      </div>
                      <div className="text-[10px] text-solar-muted dark:text-obsidian-muted">
                        {stat.questionCount} Questions • {stat.repeatCountSum} Repeats
                      </div>
                    </div>
                  </div>

                  {/* Visual Bar Gauge */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isHigh 
                          ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600' 
                          : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                      }`}
                      style={{ width: `${Math.max(15, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-solar-border dark:border-obsidian-border flex items-center justify-between text-xs text-solar-muted dark:text-obsidian-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High-Yield Topic (≥35 marks)
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ml-2" /> Standard Topic
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">Click any unit to filter questions →</span>
          </div>
        </div>

        {/* Top 5 Must-Revise Questions (1 Col) */}
        <div className="p-6 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-solar-text dark:text-obsidian-text flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                Top 5 "Must-Revise" PYQs
              </h2>
              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Exam Priority
              </span>
            </div>
            <p className="text-xs text-solar-muted dark:text-obsidian-muted mb-4">
              Repeated up to 5 times in consecutive university papers. High probability for the upcoming exam.
            </p>

            <div className="space-y-3">
              {topMustRevise.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestionForPractice(q)}
                  className="p-3 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                      U{q.unit} • {q.marks}M
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      <Flame className="w-3 h-3 fill-rose-500" />
                      Asked {q.repeatCount}x
                    </span>
                  </div>
                  <p className="text-xs font-medium text-solar-text dark:text-obsidian-text line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectQuestionForPractice(topMustRevise[0])}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <span>Open Rubric Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
