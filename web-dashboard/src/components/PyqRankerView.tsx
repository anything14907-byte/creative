import React, { useState } from 'react';
import { SubjectMeta, PYQQuestion, SyllabusTopic, TopicMastery, QuestionMarks } from '../types';
import { storageService, formatUnitDisplayName } from '../utils/storageService';
import { QuestionCard } from './QuestionCard';
import { 
  Flame, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Tag, 
  Calendar, 
  Award, 
  BookOpen, 
  ChevronRight, 
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AddCustomPyqModal } from './AddCustomPyqModal';

interface PyqRankerViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: string;
  onSelectSubject: (id: string) => void;
  questions: PYQQuestion[];
  topics: SyllabusTopic[];
  onToggleMastered: (id: string) => void;
  onSaveAnswer: (id: string, answer: string, score: number) => void;
  onAddQuestion: (q: PYQQuestion) => void;
  onSetTopicMastery: (topicId: string, mastery: TopicMastery) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PyqRankerView: React.FC<PyqRankerViewProps> = ({
  subjects,
  activeSubjectId,
  onSelectSubject,
  questions,
  topics,
  onToggleMastered,
  onSaveAnswer,
  onAddQuestion,
  onSetTopicMastery,
  onShowToast
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || subjects[0]?.id || 'os');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const subjectTopics = topics.filter(t => t.subjectId === currentSubject.id);
  const subjectQuestions = questions.filter(q => q.subjectId === currentSubject.id);

  // High-Priority Topics Ranking based on frequency of appearances
  const rankedTopics = React.useMemo(() => {
    return storageService.getHighPriorityTopics(currentSubject.id, subjectTopics, subjectQuestions);
  }, [currentSubject.id, subjectTopics, subjectQuestions]);

  // Filtered Questions list
  const filteredQuestions = subjectQuestions.filter(q => {
    if (selectedTopicFilter !== 'all') {
      const matchTopic = (q.topicId && q.topicId === selectedTopicFilter) || 
                         (q.topicTitle && q.topicTitle.toLowerCase() === selectedTopicFilter.toLowerCase());
      if (!matchTopic) return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchText = q.question.toLowerCase().includes(query) ||
                        (q.expectedKeywords || []).some(k => k.toLowerCase().includes(query));
      if (!matchText) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-slide-up pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>PYQ Ranker & High-Priority Topics</span>
          </h2>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            Topics ranked by how frequently they appear in university past exams (2021–2025).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 btn-tactile shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Past Exam Question</span>
        </button>
      </div>

      {/* Subject Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-paper-border dark:border-night-border max-w-full">
        {subjects.map(s => {
          const isSelected = s.id === selectedSubjectId;
          const count = questions.filter(q => q.subjectId === s.id).length;

          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubjectId(s.id);
                setSelectedTopicFilter('all');
                onSelectSubject(s.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 btn-tactile whitespace-nowrap transition-all ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'text-paper-body dark:text-night-text bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated'
              }`}
              style={{
                backgroundColor: isSelected ? s.accentColor : undefined
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? '#FFFFFF' : s.accentColor }} />
              <span>{s.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${isSelected ? 'bg-black/20 text-white' : 'bg-paper-cardElevated dark:bg-night-cardElevated text-paper-muted dark:text-night-muted'}`}>
                {count} PYQs
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. HIGH-PRIORITY TOPICS RANKED LIST */}
      <div className="p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-paper-border dark:border-night-border">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>High-Priority Exam Topics (Ranked by Frequency)</span>
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted">
              Click any topic to filter matching past exam questions below.
            </p>
          </div>

          {selectedTopicFilter !== 'all' && (
            <button
              onClick={() => setSelectedTopicFilter('all')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline btn-tactile"
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>

        {/* Ranked Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {rankedTopics.map((item, idx) => {
            const isFilterActive = selectedTopicFilter === item.topicTitle || selectedTopicFilter === item.topicId;

            return (
              <div
                key={item.topicId || idx}
                onClick={() => setSelectedTopicFilter(isFilterActive ? 'all' : item.topicTitle)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 group ${
                  isFilterActive
                    ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                    : 'bg-paper-cardElevated dark:bg-night-cardElevated border-paper-border dark:border-night-border hover:border-amber-500/60'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold font-mono shrink-0 ${
                    idx === 0 ? 'bg-amber-500 text-black shadow-sm' :
                    idx === 1 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                    idx === 2 ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' :
                    'bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted'
                  }`}>
                    #{idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-paper-card dark:bg-night-card text-paper-muted dark:text-night-muted font-mono">
                        {formatUnitDisplayName(currentSubject.units?.find(u => u.id === item.unitId || u.unit === item.unitNumber) || { unitNumber: item.unitNumber, unitLabel: (item as any).unitLabel, title: (item as any).unitTitle })}
                      </span>

                      {/* Mastery Pill */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.mastery === 'weak' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                        item.mastery === 'strong' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                        'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}>
                        {item.mastery.toUpperCase()}
                      </span>

                      {item.isHighPriority && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-current" />
                          <span>High Probability</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-paper-ink dark:text-night-text line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {item.topicTitle}
                    </h4>

                    {/* Years repeated */}
                    {item.yearsAsked && item.yearsAsked.length > 0 && (
                      <div className="text-[10px] text-paper-muted dark:text-night-muted mt-1 flex items-center gap-1 flex-wrap">
                        <span>Asked in:</span>
                        {item.yearsAsked.map(y => (
                          <span key={y} className="px-1.5 py-0.2 rounded bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border font-mono font-bold">
                            {y}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Frequency Count */}
                <div className="text-right shrink-0">
                  <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                    {item.totalRepeatCount}×
                  </div>
                  <div className="text-[10px] text-paper-muted dark:text-night-muted">
                    {item.questions.length} Questions
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PAST EXAM QUESTIONS LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-paper-ink dark:text-night-text">
              Question Bank ({filteredQuestions.length})
            </h3>
            {selectedTopicFilter !== 'all' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                Filtered: {selectedTopicFilter}
              </span>
            )}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-paper-muted dark:text-night-muted" />
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Questions Grid */}
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
            <div className="p-12 text-center rounded-3xl bg-paper-card dark:bg-night-card border border-dashed border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-50" />
              <div className="text-sm font-bold text-paper-ink dark:text-night-text">No questions found</div>
              <p className="text-xs">Try selecting another topic filter or click "+ Add Past Exam Question" above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Custom PYQ Modal */}
      {isAddModalOpen && (
        <AddCustomPyqModal
          subject={currentSubject}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newQ) => {
            onAddQuestion(newQ);
            onShowToast('Added new PYQ question to bank! 🔥', 'success');
          }}
        />
      )}

    </div>
  );
};
