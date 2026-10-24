import React, { useState } from 'react';
import { SubjectMeta, SubjectUnit, SyllabusTopic, TopicMastery } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Layers, 
  BookOpen, 
  Check, 
  X, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Flame
} from 'lucide-react';
import { storageService, getExamUrgencyColor } from '../utils/storageService';

interface SyllabusTrackerViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: string;
  onSelectSubject: (id: string) => void;
  topics: SyllabusTopic[];
  onToggleTopicCompleted: (topicId: string) => void;
  onSetTopicMastery: (topicId: string, mastery: TopicMastery) => void;
  onAddTopic: (topic: SyllabusTopic) => void;
  onDeleteTopic: (topicId: string) => void;
  onAddUnit: (subjectId: string, unitTitle: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SyllabusTrackerView: React.FC<SyllabusTrackerViewProps> = ({
  subjects,
  activeSubjectId,
  onSelectSubject,
  topics,
  onToggleTopicCompleted,
  onSetTopicMastery,
  onAddTopic,
  onDeleteTopic,
  onAddUnit,
  onShowToast
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || subjects[0]?.id || 'os');
  const [isAddingTopicUnitId, setIsAddingTopicUnitId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicMastery, setNewTopicMastery] = useState<TopicMastery>('weak');
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const subjectTopics = topics.filter(t => t.subjectId === currentSubject.id);

  // Calculate subject progress metrics
  const totalTopics = subjectTopics.length;
  const completedTopics = subjectTopics.filter(t => t.completed).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const weakCount = subjectTopics.filter(t => t.mastery === 'weak').length;
  const okayCount = subjectTopics.filter(t => t.mastery === 'okay').length;
  const strongCount = subjectTopics.filter(t => t.mastery === 'strong').length;

  const urgency = getExamUrgencyColor(currentSubject.examDate);

  const handleCreateTopic = (unit: SubjectUnit, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const newTopic: SyllabusTopic = {
      id: `top-${currentSubject.id}-${unit.id}-${Date.now().toString(36)}`,
      subjectId: currentSubject.id,
      unitId: unit.id,
      unitNumber: unit.unit,
      title: newTopicTitle.trim(),
      completed: false,
      mastery: newTopicMastery,
      pyqCount: 0
    };

    onAddTopic(newTopic);
    setNewTopicTitle('');
    setIsAddingTopicUnitId(null);
    onShowToast(`Added topic to Unit ${unit.unit}!`, 'success');
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;
    onAddUnit(currentSubject.id, newUnitTitle.trim());
    setNewUnitTitle('');
    setIsAddingUnit(false);
    onShowToast(`Created Unit ${currentSubject.units.length + 1}!`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-slide-up pb-16">
      
      {/* Top Header & Subject Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Syllabus Tracker & Mastery Hub</span>
          </h2>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            Add units and topics with checkboxes, mark mastery as Weak / Okay / Strong, and track your completion %.
          </p>
        </div>

        {/* Quick Add Unit Button */}
        <button
          onClick={() => setIsAddingUnit(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 btn-tactile shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Syllabus Unit</span>
        </button>
      </div>

      {/* Subject Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-paper-border dark:border-night-border max-w-full">
        {subjects.map(s => {
          const isSelected = s.id === selectedSubjectId;
          const subTopics = topics.filter(t => t.subjectId === s.id);
          const percent = subTopics.length > 0 
            ? Math.round((subTopics.filter(t => t.completed).length / subTopics.length) * 100) 
            : 0;

          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubjectId(s.id);
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
                {percent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Subject Overview Banner with % Complete Progress */}
      <div 
        className="p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-5"
        style={{ borderLeft: `6px solid ${currentSubject.accentColor}` }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono uppercase"
                style={{ backgroundColor: `${currentSubject.accentColor}18`, color: currentSubject.accentColor }}
              >
                {currentSubject.name}
              </span>
              <span className="text-xs text-paper-muted dark:text-night-muted">
                {currentSubject.units.length} Units • {totalTopics} Topics Total
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-paper-ink dark:text-night-text">
              Syllabus Completion: {progressPercent}%
            </h3>
          </div>

          {/* Mastery Breakdown Stats */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400">{weakCount} Topics</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Weak (Need Review)</div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{okayCount} Topics</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Okay (Moderate)</div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{strongCount} Topics</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Strong (Mastered)</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-3 rounded-full bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: currentSubject.accentColor }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-paper-muted dark:text-night-muted">
            <span>{completedTopics} of {totalTopics} topics studied</span>
            <span>{totalTopics - completedTopics} topics remaining</span>
          </div>
        </div>
      </div>

      {/* Add Unit Modal Form */}
      {isAddingUnit && (
        <form onSubmit={handleCreateUnit} className="p-4 rounded-2xl bg-paper-card dark:bg-night-card border border-emerald-500/40 space-y-3 animate-fade-slide-up shadow-md">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Add New Unit for {currentSubject.name}</span>
            </h4>
            <button type="button" onClick={() => setIsAddingUnit(false)} className="text-paper-muted hover:text-paper-ink">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Unit Title (e.g. Distributed Database Systems & WAL)..."
              value={newUnitTitle}
              onChange={e => setNewUnitTitle(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold btn-tactile shadow-sm"
            >
              Add Unit
            </button>
          </div>
        </form>
      )}

      {/* Units & Topics List */}
      <div className="space-y-6">
        {currentSubject.units.map(unit => {
          const unitTopics = subjectTopics.filter(t => t.unitId === unit.id || t.unitNumber === unit.unit);
          const unitCompleted = unitTopics.filter(t => t.completed).length;
          const unitPercent = unitTopics.length > 0 ? Math.round((unitCompleted / unitTopics.length) * 100) : 0;
          const isAddingToThisUnit = isAddingTopicUnitId === unit.id;

          return (
            <div 
              key={unit.id}
              className="p-5 sm:p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-4"
              style={{ borderLeft: `5px solid ${currentSubject.accentColor}` }}
            >
              {/* Unit Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-border dark:border-night-border">
                <div className="flex items-center gap-3">
                  <span 
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0"
                    style={{ backgroundColor: `${currentSubject.accentColor}18`, color: currentSubject.accentColor }}
                  >
                    Unit {unit.unit}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-paper-ink dark:text-night-text">
                      {unit.title}
                    </h4>
                    <span className="text-[11px] text-paper-muted dark:text-night-muted">
                      {unitCompleted} of {unitTopics.length} topics finished ({unitPercent}%)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingTopicUnitId(isAddingToThisUnit ? null : unit.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:border-emerald-500 text-paper-ink dark:text-night-text flex items-center gap-1.5 btn-tactile self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>+ Add Topic</span>
                </button>
              </div>

              {/* Inline Form to Add Topic to this Unit */}
              {isAddingToThisUnit && (
                <form onSubmit={e => handleCreateTopic(unit, e)} className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-emerald-500/30 space-y-3 animate-fade-slide-up">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-paper-ink dark:text-night-text">
                      Add Topic to Unit {unit.unit}
                    </span>
                    <button type="button" onClick={() => setIsAddingTopicUnitId(null)} className="text-paper-muted hover:text-paper-ink">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Topic name (e.g. Banker's Algorithm Safe Sequences)..."
                      value={newTopicTitle}
                      onChange={e => setNewTopicTitle(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500"
                    />

                    {/* Initial Mastery Selector */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setNewTopicMastery('weak')}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${newTopicMastery === 'weak' ? 'bg-rose-600 text-white' : 'bg-paper-card dark:bg-night-card text-rose-600'}`}
                      >
                        Weak
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTopicMastery('okay')}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${newTopicMastery === 'okay' ? 'bg-amber-600 text-white' : 'bg-paper-card dark:bg-night-card text-amber-600'}`}
                      >
                        Okay
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTopicMastery('strong')}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${newTopicMastery === 'strong' ? 'bg-emerald-600 text-white' : 'bg-paper-card dark:bg-night-card text-emerald-600'}`}
                      >
                        Strong
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold btn-tactile shadow-sm shrink-0"
                    >
                      Save Topic
                    </button>
                  </div>
                </form>
              )}

              {/* Topics List with Checkboxes & Mastery Toggles */}
              <div className="space-y-2.5">
                {unitTopics.map(topic => (
                  <div 
                    key={topic.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                      topic.completed
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80'
                        : 'bg-paper-cardElevated dark:bg-night-cardElevated border-paper-border dark:border-night-border hover:border-emerald-500/50'
                    }`}
                  >
                    {/* Left: Checkbox + Title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleTopicCompleted(topic.id)}
                        className="p-1 text-paper-muted hover:text-emerald-600 dark:text-night-muted dark:hover:text-emerald-400 transition-colors btn-tactile shrink-0"
                        title={topic.completed ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {topic.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-paper-muted dark:text-night-muted" />
                        )}
                      </button>

                      <span className={`text-xs font-bold line-clamp-1 ${topic.completed ? 'line-through text-paper-muted dark:text-night-muted' : 'text-paper-ink dark:text-night-text'}`}>
                        {topic.title}
                      </span>
                    </div>

                    {/* Right: Mastery Tags (Weak / Okay / Strong) & Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      
                      {/* Interactive Mastery Selector Pills */}
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-[10px] font-bold">
                        <button
                          onClick={() => onSetTopicMastery(topic.id, 'weak')}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            topic.mastery === 'weak'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                          }`}
                          title="Mark as Weak topic"
                        >
                          Weak
                        </button>

                        <button
                          onClick={() => onSetTopicMastery(topic.id, 'okay')}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            topic.mastery === 'okay'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                          }`}
                          title="Mark as Okay topic"
                        >
                          Okay
                        </button>

                        <button
                          onClick={() => onSetTopicMastery(topic.id, 'strong')}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            topic.mastery === 'strong'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title="Mark as Strong topic"
                        >
                          Strong
                        </button>
                      </div>

                      {/* Delete Topic Button */}
                      <button
                        onClick={() => onDeleteTopic(topic.id)}
                        className="p-1.5 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 rounded-lg hover:bg-paper-card dark:hover:bg-night-card transition-colors opacity-70 group-hover:opacity-100"
                        title="Delete topic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {unitTopics.length === 0 && (
                  <div className="text-center py-4 text-xs text-paper-muted dark:text-night-muted italic">
                    No topics added to Unit {unit.unit} yet. Click "+ Add Topic" above to get started.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
