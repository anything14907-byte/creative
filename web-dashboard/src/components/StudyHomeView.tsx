import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Flame, 
  Layers, 
  Cpu, 
  Database, 
  Network, 
  Code,
  CheckCircle2,
  X,
  BookOpen
} from 'lucide-react';
import { SubjectMeta, SubjectId, PYQQuestion } from '../types';
import { QuestionCard } from './QuestionCard';

interface StudyHomeViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
  questions: PYQQuestion[];
  onToggleMastered: (id: string) => void;
  onSaveAnswer: (id: string, answer: string, score: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type FilterPill = 'all' | 'repeated' | '10m' | 'short';

export const StudyHomeView: React.FC<StudyHomeViewProps> = ({
  subjects,
  activeSubjectId,
  onSelectSubject,
  questions,
  onToggleMastered,
  onSaveAnswer,
  onShowToast
}) => {
  const [filterPill, setFilterPill] = useState<FilterPill>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Icon mapping
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-emerald-500" />;
      case 'Database': return <Database className="w-5 h-5 text-sky-400" />;
      case 'Network': return <Network className="w-5 h-5 text-amber-400" />;
      case 'Code': return <Code className="w-5 h-5 text-emerald-400" />;
      default: return <BookOpen className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Filter subject questions
  const subjectQuestions = useMemo(() => {
    return questions.filter(q => q.subjectId === activeSubjectId);
  }, [questions, activeSubjectId]);

  // Apply search & 4 simple pills
  const displayedQuestions = useMemo(() => {
    return subjectQuestions.filter(q => {
      if (searchQuery.trim()) {
        const qStr = searchQuery.toLowerCase();
        const matchesQ = q.question.toLowerCase().includes(qStr);
        const matchesUnit = q.unitTitle.toLowerCase().includes(qStr);
        const matchesKw = q.expectedKeywords.some(kw => kw.toLowerCase().includes(qStr));
        if (!matchesQ && !matchesUnit && !matchesKw) return false;
      }

      if (filterPill === 'repeated' && q.repeatCount < 3 && !q.isHighProbability) return false;
      if (filterPill === '10m' && q.marks !== 10) return false;
      if (filterPill === 'short' && q.marks !== 2 && q.marks !== 5) return false;

      return true;
    });
  }, [subjectQuestions, filterPill, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Hero Subject Selector (4 Interactive Cards with Circular Progress Rings) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {subjects.map(s => {
          const sQuestions = questions.filter(q => q.subjectId === s.id);
          const totalCount = sQuestions.length;
          const masteredCount = sQuestions.filter(q => q.userStatus === 'mastered').length;
          const percent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
          const isSelected = s.id === activeSubjectId;

          return (
            <div
              key={s.id}
              onClick={() => onSelectSubject(s.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                isSelected
                  ? 'border-[#00E599] bg-[#00E599]/10 dark:bg-[#00E599]/10 shadow-glow-emerald/20'
                  : 'border-day-border dark:border-cyber-border bg-white/80 dark:bg-[#0F1722]/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
                  {getSubjectIcon(s.iconName)}
                </div>

                {/* Circular Progress Ring */}
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg className="w-9 h-9 transform -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      className="text-slate-200 dark:text-slate-800"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={88}
                      strokeDashoffset={88 - (88 * percent) / 100}
                      className="text-[#00E599] transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-day-text dark:text-white">
                    {percent}%
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[10px] font-mono text-day-muted dark:text-cyber-muted uppercase">
                  {s.code} • {s.semester}
                </div>
                <div className="text-sm font-bold text-day-text dark:text-white truncate">
                  {s.name}
                </div>
                <div className="text-[11px] text-day-muted dark:text-cyber-muted mt-1">
                  {masteredCount} of {totalCount} Mastered
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Simple Search Bar + 4 Filter Pills */}
      <div className="p-4 rounded-2xl border border-day-border dark:border-cyber-border bg-white/80 dark:bg-[#0F1722]/80 backdrop-blur-md space-y-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-day-muted dark:text-cyber-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any topic like Deadlock, B+ Tree, TCP, Normalization, AVL..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-day-border dark:border-cyber-border bg-slate-50 dark:bg-[#06090E] text-xs sm:text-sm text-day-text dark:text-white outline-none focus:border-[#00E599] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-day-muted hover:text-day-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 4 Simple Pill Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-2">
            
            <button
              onClick={() => setFilterPill('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterPill === 'all'
                  ? 'bg-emerald-600 text-white dark:bg-[#00E599] dark:text-[#06090E] shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-day-muted dark:text-cyber-muted hover:text-day-text'
              }`}
            >
              All Questions ({subjectQuestions.length})
            </button>

            <button
              onClick={() => setFilterPill('repeated')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterPill === 'repeated'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-day-muted dark:text-cyber-muted hover:text-day-text'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>🔥 Most Repeated (Must Study)</span>
            </button>

            <button
              onClick={() => setFilterPill('10m')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterPill === '10m'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-day-muted dark:text-cyber-muted hover:text-day-text'
              }`}
            >
              10-Mark Long Answers
            </button>

            <button
              onClick={() => setFilterPill('short')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterPill === 'short'
                  ? 'bg-emerald-500/80 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-day-muted dark:text-cyber-muted hover:text-day-text'
              }`}
            >
              2 & 5-Mark Short Answers
            </button>

          </div>

          <span className="text-xs text-day-muted dark:text-cyber-muted font-medium">
            Showing <strong className="text-day-text dark:text-white">{displayedQuestions.length}</strong> questions
          </span>
        </div>

      </div>

      {/* 3. Questions List */}
      <div className="space-y-4">
        {displayedQuestions.length > 0 ? (
          displayedQuestions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              onToggleMastered={onToggleMastered}
              onSaveAnswer={onSaveAnswer}
              onShowToast={onShowToast}
            />
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-day-border dark:border-cyber-border bg-white/40 dark:bg-[#0F1722]/40">
            <Layers className="w-8 h-8 mx-auto text-day-muted dark:text-cyber-muted mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-day-text dark:text-white">
              No questions found matching your filter
            </h4>
            <p className="text-xs text-day-muted dark:text-cyber-muted mt-1">
              Try clicking "All Questions" or clear your search term.
            </p>
            <button
              onClick={() => { setFilterPill('all'); setSearchQuery(''); }}
              className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 dark:bg-[#00E599] text-white dark:text-[#06090E] text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
