import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Bookmark, 
  Layers, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { PYQQuestion, SubjectMeta, QuestionStatus } from '../types';
import { QuestionCard } from './QuestionCard';

interface QuestionBankExplorerProps {
  questions: PYQQuestion[];
  subject: SubjectMeta;
  initialUnitFilter?: number | null;
  onClearInitialUnitFilter?: () => void;
  onSelectForPractice: (question: PYQQuestion) => void;
  onUpdateStatus: (id: string, status: QuestionStatus) => void;
  onToggleBookmark: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
}

export const QuestionBankExplorer: React.FC<QuestionBankExplorerProps> = ({
  questions,
  subject,
  initialUnitFilter,
  onClearInitialUnitFilter,
  onSelectForPractice,
  onUpdateStatus,
  onToggleBookmark,
  onSaveNote
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>(initialUnitFilter || 'all');
  const [selectedMarks, setSelectedMarks] = useState<number | 'all'>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<'all' | 'high-probability' | 'critical'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | QuestionStatus | 'bookmarked'>('all');

  // Filter subject questions first
  const subjectQuestions = useMemo(() => {
    return questions.filter(q => q.subjectId === subject.id);
  }, [questions, subject.id]);

  // Apply filters
  const filteredQuestions = useMemo(() => {
    return subjectQuestions.filter(q => {
      // Search text match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.question.toLowerCase().includes(query);
        const matchesUnit = q.unitTitle.toLowerCase().includes(query);
        const matchesKeywords = q.expectedKeywords.some(kw => kw.toLowerCase().includes(query));
        if (!matchesText && !matchesUnit && !matchesKeywords) return false;
      }

      // Unit filter
      if (selectedUnit !== 'all' && q.unit !== selectedUnit) return false;

      // Marks filter
      if (selectedMarks !== 'all' && q.marks !== selectedMarks) return false;

      // Frequency filter
      if (selectedFrequency === 'high-probability' && !q.isHighProbability && q.repeatCount < 3) return false;
      if (selectedFrequency === 'critical' && q.repeatCount < 4) return false;

      // Status filter
      if (selectedStatus === 'bookmarked' && !q.bookmarked) return false;
      if (selectedStatus !== 'all' && selectedStatus !== 'bookmarked' && q.userStatus !== selectedStatus) return false;

      return true;
    });
  }, [subjectQuestions, searchQuery, selectedUnit, selectedMarks, selectedFrequency, selectedStatus]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedUnit('all');
    setSelectedMarks('all');
    setSelectedFrequency('all');
    setSelectedStatus('all');
    if (onClearInitialUnitFilter) onClearInitialUnitFilter();
  };

  const hasActiveFilters = searchQuery !== '' || selectedUnit !== 'all' || selectedMarks !== 'all' || selectedFrequency !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6">
      
      {/* Search Bar & Top Controls */}
      <div className="p-4 sm:p-5 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-sm space-y-4">
        
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-solar-muted dark:text-obsidian-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, units, or rubric keywords (e.g., 'Banker', 'Paging', '2PL', 'Dijkstra')..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-solar-border dark:border-obsidian-border bg-slate-50 dark:bg-slate-900/60 text-solar-text dark:text-obsidian-text text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-solar-muted dark:placeholder:text-obsidian-muted"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-solar-muted hover:text-solar-text dark:hover:text-obsidian-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Unit Filter Selector */}
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-solar-text dark:text-obsidian-text outline-none focus:border-indigo-500"
            >
              <option value="all">All Units (1–5)</option>
              {subject.units.map(u => (
                <option key={u.unit} value={u.unit}>
                  Unit {u.unit}: {u.title.slice(0, 24)}...
                </option>
              ))}
            </select>

            {/* Marks Filter */}
            <select
              value={selectedMarks}
              onChange={(e) => setSelectedMarks(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-solar-text dark:text-obsidian-text outline-none focus:border-indigo-500"
            >
              <option value="all">All Marks (2M, 5M, 10M)</option>
              <option value={2}>2 Marks (Definitions)</option>
              <option value={5}>5 Marks (Conceptual)</option>
              <option value={10}>10 Marks (Major / Long)</option>
            </select>

            {/* Repeat Frequency Filter */}
            <button
              onClick={() => setSelectedFrequency(prev => prev === 'high-probability' ? 'all' : 'high-probability')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedFrequency === 'high-probability'
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/25'
                  : 'border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-solar-text dark:text-obsidian-text hover:border-rose-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>3+ Times Repeated</span>
            </button>

            {/* Bookmarked Filter */}
            <button
              onClick={() => setSelectedStatus(prev => prev === 'bookmarked' ? 'all' : 'bookmarked')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedStatus === 'bookmarked'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                  : 'border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-solar-text dark:text-obsidian-text hover:border-amber-400'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Starred</span>
            </button>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-solar-text dark:text-obsidian-text outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Pending</option>
              <option value="needs-revision">Needs Revision</option>
              <option value="mastered">Mastered</option>
            </select>

          </div>

          {/* Reset Filters & Results Count */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-solar-muted dark:text-obsidian-muted font-medium">
              Showing <span className="font-bold text-solar-text dark:text-obsidian-text">{filteredQuestions.length}</span> of {subjectQuestions.length} PYQs
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Reset
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Questions List */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              onSelectForPractice={onSelectForPractice}
              onUpdateStatus={onUpdateStatus}
              onToggleBookmark={onToggleBookmark}
              onSaveNote={onSaveNote}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-solar-border dark:border-obsidian-border bg-solar-card/30 dark:bg-obsidian-card/30">
          <Layers className="w-10 h-10 mx-auto text-solar-muted dark:text-obsidian-muted mb-3 opacity-50" />
          <h3 className="text-base font-bold text-solar-text dark:text-obsidian-text">
            No past university questions match your current filters
          </h3>
          <p className="text-xs text-solar-muted dark:text-obsidian-muted mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, mark criteria, or reset all active filters to view all questions.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
};
