import React, { useState, useMemo } from 'react';
import { SubjectMeta, PYQQuestion } from '../types';
import { QuestionCard } from './QuestionCard';
import { AddCustomPyqModal } from './AddCustomPyqModal';
import { 
  Flame, Search, Plus, Filter, BookOpen, Sparkles, CheckCircle2 
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

  // Filter for this subject
  const subjectQuestions = useMemo(() => {
    return questions.filter(q => q.subjectId === subject.id);
  }, [questions, subject.id]);

  // Apply search and pill filter
  const filteredQuestions = useMemo(() => {
    return subjectQuestions.filter(q => {
      // Pill check
      if (activePill === 'hot' && q.repeatCount < 4) return false;
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
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl hud-glass-panel">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              {subject.name} • High-Repeat Exam Bank
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {subjectQuestions.length} Curated Questions • {masteredCount} Mastered
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 transition-transform hover:scale-105 shrink-0"
          style={{ backgroundColor: subject.accentColor }}
        >
          <Plus className="w-4 h-4" /> Add Custom Exam Question
        </button>
      </div>

      {/* Filter Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActivePill('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activePill === 'all'
                ? 'bg-cyan-500 text-black font-bold shadow-neon-cyan'
                : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
          >
            All Questions ({subjectQuestions.length})
          </button>

          <button
            onClick={() => setActivePill('hot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activePill === 'hot'
                ? 'bg-amber-400 text-black font-bold shadow-neon-gold'
                : 'bg-white/10 hover:bg-white/15 text-amber-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            🔥 Most Repeated (4+ Times)
          </button>

          <button
            onClick={() => setActivePill('10m')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activePill === '10m'
                ? 'bg-rose-400 text-black font-bold shadow-neon-coral'
                : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
          >
            10-Mark Long Answers
          </button>

          <button
            onClick={() => setActivePill('short')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activePill === 'short'
                ? 'bg-emerald-400 text-black font-bold shadow-neon-emerald'
                : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
          >
            2 & 5-Mark Short Answers
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search Deadlock, B+ Tree, TCP..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
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
          <div className="text-center py-16 px-4 rounded-2xl hud-glass-panel border border-dashed border-white/20">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">No matching questions found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try switching your filter or search query, or add your own custom university question.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-400 text-black text-xs font-bold hover:bg-cyan-300"
            >
              + Add First Question for {subject.name}
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
          onShowToast('Custom PYQ added to question bank! 🎯', 'success');
        }}
      />

    </div>
  );
};
