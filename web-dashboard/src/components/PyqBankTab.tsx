import React, { useState, useMemo } from 'react';
import { SubjectMeta, PYQQuestion } from '../types';
import { QuestionCard } from './QuestionCard';
import { AddCustomPyqModal } from './AddCustomPyqModal';
import { 
  Flame, Search, Plus, BookOpen, Sparkles 
} from 'lucide-react';

interface PyqBankTabProps {
  subject: SubjectMeta;
  questions: PYQQuestion[];
  onToggleMastered: (id: string) => void;
  onSaveAnswer: (id: string, answer: string, score: number) => void;
  onAddQuestion: (q: PYQQuestion) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type FilterPill = 'all' | 'hot' | '10m' | 'short';

export const PyqBankTab: React.FC<PyqBankTabProps> = ({
  subject,
  questions,
  onToggleMastered,
  onSaveAnswer,
  onAddQuestion,
  onShowToast
}) => {
  const [activePill, setActivePill] = useState<FilterPill>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter questions for this subject
  const subjectQuestions = useMemo(() => {
    return questions.filter(q => q.subjectId === subject.id);
  }, [questions, subject.id]);

  // Apply search and pill filter
  const filteredQuestions = useMemo(() => {
    return subjectQuestions.filter(q => {
      // Pill check
      if (activePill === 'hot' && q.repeatCount < 3) return false;
      if (activePill === '10m' && q.marks !== 10) return false;
      if (activePill === 'short' && q.marks === 10) return false;

      // Search check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inQ = q.question.toLowerCase().includes(query);
        const inKw = (q.expectedKeywords || []).some(k => k.toLowerCase().includes(query));
        const inUnit = q.unitTitle.toLowerCase().includes(query);
        if (!inQ && !inKw && !inUnit) return false;
      }

      return true;
    });
  }, [subjectQuestions, activePill, searchQuery]);

  const masteredCount = subjectQuestions.filter(q => q.userStatus === 'mastered').length;

  return (
    <div className="space-y-6 animate-fade-slide-up">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card">
        <div>
          <h3 className="text-lg font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Important Past Exam Questions</span>
          </h3>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            {subjectQuestions.length} Questions indexed • {masteredCount} marked as mastered
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg flex items-center gap-1.5 btn-tactile shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> + Add Question
        </button>
      </div>

      {/* Filter Pills & Clean Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActivePill('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors btn-tactile ${
              activePill === 'all'
                ? 'bg-paper-ink text-white dark:bg-night-text dark:text-night-bg'
                : 'bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-body dark:text-night-text'
            }`}
          >
            All Questions ({subjectQuestions.length})
          </button>

          <button
            onClick={() => setActivePill('hot')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 btn-tactile ${
              activePill === 'hot'
                ? 'bg-amber-500 text-white dark:bg-amber-400 dark:text-night-bg'
                : 'bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-amber-700 dark:text-amber-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            Most Repeated (3+ Times)
          </button>

          <button
            onClick={() => setActivePill('10m')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors btn-tactile ${
              activePill === '10m'
                ? 'bg-paper-ink text-white dark:bg-night-text dark:text-night-bg'
                : 'bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-body dark:text-night-text'
            }`}
          >
            10-Mark Long Answers
          </button>

          <button
            onClick={() => setActivePill('short')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors btn-tactile ${
              activePill === 'short'
                ? 'bg-paper-ink text-white dark:bg-night-text dark:text-night-bg'
                : 'bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-body dark:text-night-text'
            }`}
          >
            2 & 5-Mark Short Answers
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search topic or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text placeholder-paper-muted dark:placeholder-night-muted text-xs focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-paper-muted dark:text-night-muted absolute left-2.5 top-3" />
        </div>
      </div>

      {/* Question Card List */}
      <div className="space-y-4">
        {filteredQuestions.map(q => (
          <QuestionCard
            key={q.id}
            question={q}
            onToggleMastered={onToggleMastered}
            onSaveAnswer={onSaveAnswer}
            onShowToast={onShowToast}
          />
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16 px-4 rounded-2xl bg-paper-card dark:bg-night-card border border-dashed border-paper-border dark:border-night-border">
            <BookOpen className="w-10 h-10 text-paper-muted dark:text-night-muted mx-auto mb-2" />
            <h4 className="text-sm font-bold text-paper-ink dark:text-night-text mb-1">No matching questions found</h4>
            <p className="text-xs text-paper-muted dark:text-night-muted max-w-sm mx-auto mb-4">
              Try switching your filter or search, or add a custom university question.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold btn-tactile"
            >
              + Add Question
            </button>
          </div>
        )}
      </div>

      {/* Add Custom Question Modal */}
      <AddCustomPyqModal
        subject={subject}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(q) => {
          onAddQuestion(q);
          onShowToast('Question added to subject bank! 🎯', 'success');
        }}
      />

    </div>
  );
};
