import React, { useState } from 'react';
import { SubjectMeta, PYQQuestion, StudyTask } from '../types';
import { getExamUrgencyColor, sortSubjectsByExamUrgency, ACCENT_PALETTE } from '../utils/storageService';
import { EditExamDateModal } from './EditExamDateModal';
import { EditUnitsModal } from './EditUnitsModal';
import { 
  Clock, Calendar, Plus, ArrowRight, Trash2, Palette, 
  Cpu, Database, Network, Code, BookOpen, AlertCircle, Layers 
} from 'lucide-react';

interface CommandCenterOverviewProps {
  subjects: SubjectMeta[];
  questions: PYQQuestion[];
  tasks: StudyTask[];
  onSelectSubject: (id: string, unitId?: string) => void;
  onOpenAddSubject: () => void;
  onUpdateSubject: (subject: SubjectMeta) => void;
  onDeleteSubject: (id: string) => void;
}

export const CommandCenterOverview: React.FC<CommandCenterOverviewProps> = ({
  subjects,
  questions,
  tasks,
  onSelectSubject,
  onOpenAddSubject,
  onUpdateSubject,
  onDeleteSubject
}) => {
  const [editingDateSubject, setEditingDateSubject] = useState<SubjectMeta | null>(null);
  const [editingUnitsSubject, setEditingUnitsSubject] = useState<SubjectMeta | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [activeColorPickerSubjectId, setActiveColorPickerSubjectId] = useState<string | null>(null);

  // Auto-sort subjects by exam time remaining (closest exam first)
  const sortedSubjects = React.useMemo(() => {
    return sortSubjectsByExamUrgency(subjects);
  }, [subjects]);

  // Find the single nearest upcoming exam for the hero header
  const nearestSubjectWithUrgency = React.useMemo(() => {
    if (sortedSubjects.length === 0) return null;
    const top = sortedSubjects[0];
    return {
      subject: top,
      urgency: getExamUrgencyColor(top.examDate)
    };
  }, [sortedSubjects]);

  const getSubjectIcon = (name: string) => {
    switch (name) {
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Database': return <Database className="w-5 h-5" />;
      case 'Network': return <Network className="w-5 h-5" />;
      case 'Code': return <Code className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const handleQuickColorChange = (subject: SubjectMeta, hex: string) => {
    onUpdateSubject({ ...subject, accentColor: hex });
    setActiveColorPickerSubjectId(null);
  };

  return (
    <div className="space-y-8 animate-fade-slide-up">
      
      {/* 1. TOP HERO: NEAREST UPCOMING EXAM */}
      {nearestSubjectWithUrgency && (
        <div 
          className={`p-6 sm:p-7 rounded-3xl bg-paper-card dark:bg-night-card border transition-all duration-700 shadow-paper-card dark:shadow-night-card relative overflow-hidden ${nearestSubjectWithUrgency.urgency.isUrgent ? 'pulse-urgent-exam' : ''}`}
          style={{ 
            borderColor: nearestSubjectWithUrgency.subject.accentColor,
            borderTopWidth: '5px'
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left: Exam Info & Exact Date */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors duration-500"
                  style={{ 
                    color: nearestSubjectWithUrgency.urgency.hslColor,
                    backgroundColor: `${nearestSubjectWithUrgency.urgency.hslColor}18`
                  }}
                >
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>🚨 Priority #1 • Closest Exam</span>
                </span>

                <span className="text-xs text-paper-muted dark:text-night-muted font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{nearestSubjectWithUrgency.urgency.formattedExamDate}</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-paper-ink dark:text-night-text tracking-tight">
                {nearestSubjectWithUrgency.subject.name}
              </h2>

              <p className="text-xs sm:text-sm text-paper-body dark:text-night-muted mt-1 max-w-xl">
                {nearestSubjectWithUrgency.urgency.fractionalDays <= 5 
                  ? '🚨 Urgent revision window! Focus strictly on the highest-repeated past questions.'
                  : 'Prepare comfortably with unit-by-unit study checklist and video lectures.'}
              </p>
            </div>

            {/* Right: Live Ticking Countdown HUD & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              
              {/* Ticking Timer Box with Urgency Shift */}
              <div 
                className="p-4 rounded-2xl border transition-colors duration-500 shadow-sm"
                style={{ 
                  backgroundColor: `${nearestSubjectWithUrgency.urgency.hslColor}12`,
                  borderColor: `${nearestSubjectWithUrgency.urgency.hslColor}35`
                }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted mb-1 flex items-center gap-1">
                  <span>Time Remaining:</span>
                </div>
                
                <div 
                  className="text-2xl sm:text-3xl font-extrabold countdown-digit"
                  style={{ color: nearestSubjectWithUrgency.urgency.hslColor }}
                >
                  {nearestSubjectWithUrgency.urgency.formattedCountdown}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onSelectSubject(nearestSubjectWithUrgency.subject.id)}
                  className="px-5 py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm btn-tactile btn-shimmer"
                  style={{ backgroundColor: nearestSubjectWithUrgency.subject.accentColor }}
                >
                  <span>Open Subject</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setEditingDateSubject(nearestSubjectWithUrgency.subject)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-body dark:text-night-text hover:border-emerald-500 transition-colors btn-tactile text-center"
                >
                  Change Date
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 2. SUBJECT CARDS GRID (CHRONOLOGICALLY SORTED BY TIME REMAINING) */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <span>Your Subjects</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted font-bold font-mono">
                {sortedSubjects.length} Active
              </span>
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
              Automatically sorted by upcoming exam date (closest exam first). Click any Unit pill to jump directly to its materials.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedSubjects.map((subject, idx) => {
            const urgency = getExamUrgencyColor(subject.examDate);
            const subQuestions = questions.filter(q => q.subjectId === subject.id);
            const subTasks = tasks.filter(t => t.subjectId === subject.id);
            const isColorPickerOpen = activeColorPickerSubjectId === subject.id;

            // Priority label based on sorted rank
            let priorityBadge = `Priority #${idx + 1}`;
            if (urgency.fractionalDays <= 0) {
              priorityBadge = 'Completed / Update Date';
            } else if (idx === 0) {
              priorityBadge = '🚨 Priority #1 • Closest Exam';
            } else if (idx === 1) {
              priorityBadge = '⚡ Priority #2';
            } else if (idx === 2) {
              priorityBadge = '⚡ Priority #3';
            }

            return (
              <div
                key={subject.id}
                className="p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card flex flex-col justify-between transition-all duration-300 hover:shadow-md relative group"
                style={{ 
                  borderTop: `4px solid ${subject.accentColor}`
                }}
              >
                <div>
                  
                  {/* Priority Rank Tag with Urgency Color */}
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1"
                      style={{ 
                        color: urgency.hslColor,
                        backgroundColor: `${urgency.hslColor}16`
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{priorityBadge}</span>
                    </span>

                    {/* Header Controls: Quick Color Picker & Delete */}
                    <div className="flex items-center gap-1 relative">
                      
                      {/* 🎨 Quick Color Swatch Popover Trigger */}
                      <button
                        onClick={() => setActiveColorPickerSubjectId(isColorPickerOpen ? null : subject.id)}
                        className="p-1.5 rounded-lg text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated transition-colors btn-tactile"
                        title="Change card accent color"
                      >
                        <Palette className="w-3.5 h-3.5" style={{ color: subject.accentColor }} />
                      </button>

                      {/* Color Picker Dropdown Popover */}
                      {isColorPickerOpen && (
                        <div className="absolute right-0 top-8 z-30 p-2.5 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-xl grid grid-cols-5 gap-1.5 w-44 animate-fade-slide-up">
                          {ACCENT_PALETTE.map(c => (
                            <button
                              key={c.hex}
                              onClick={() => handleQuickColorChange(subject, c.hex)}
                              title={c.name}
                              className={`w-6 h-6 rounded-full transition-transform btn-tactile ${subject.accentColor === c.hex ? 'scale-125 ring-2 ring-emerald-500' : 'opacity-80 hover:opacity-100'}`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Delete Subject Button */}
                      <button
                        onClick={() => setSubjectToDelete(subject.id)}
                        className="p-1.5 text-paper-muted dark:text-night-muted hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors btn-tactile"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Title & Icon */}
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ 
                        backgroundColor: `${subject.accentColor}18`,
                        color: subject.accentColor
                      }}
                    >
                      {getSubjectIcon(subject.iconName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        onClick={() => onSelectSubject(subject.id)}
                        className="text-base font-bold text-paper-ink dark:text-night-text cursor-pointer transition-colors line-clamp-1"
                        style={{ color: undefined }}
                        title={subject.name}
                      >
                        {subject.name}
                      </h4>
                      <span className="text-[11px] text-paper-muted dark:text-night-muted font-medium">
                        {subject.units.length} Units • {subQuestions.length} PYQs
                      </span>
                    </div>
                  </div>

                  {/* 1. Visible Exam Date with 1-Click "Change Date" Picker */}
                  <div className="my-2.5 p-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-paper-body dark:text-night-text">
                      <Calendar className="w-3.5 h-3.5 text-paper-muted dark:text-night-muted shrink-0" />
                      <span className="font-semibold text-[11px] line-clamp-1">
                        {urgency.formattedExamDate}
                      </span>
                    </div>

                    <button
                      onClick={() => setEditingDateSubject(subject)}
                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 btn-tactile"
                    >
                      Change Date
                    </button>
                  </div>

                  {/* 2. Live Countdown Timer with Smooth Green -> Yellow -> Red Shift */}
                  <div 
                    className="p-3 rounded-xl mb-3 text-center border transition-all duration-600"
                    style={{ 
                      backgroundColor: `${urgency.hslColor}10`,
                      borderColor: `${urgency.hslColor}35`
                    }}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted mb-0.5">
                      Time Remaining
                    </div>
                    <div 
                      className="text-lg font-extrabold countdown-digit"
                      style={{ color: urgency.hslColor }}
                    >
                      {urgency.formattedCountdown}
                    </div>
                  </div>

                  {/* 3. UNITS PILL TAGS ON FRONT PAGE */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Syllabus Units ({subject.units.length}):</span>
                      </span>
                      <button
                        onClick={() => setEditingUnitsSubject(subject)}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline btn-tactile"
                      >
                        + Add / Edit
                      </button>
                    </div>

                    {/* Clickable Unit Pills */}
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {subject.units.map(u => (
                        <button
                          key={u.id}
                          onClick={() => onSelectSubject(subject.id, u.id)}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all btn-tactile text-left truncate max-w-full"
                          style={{
                            backgroundColor: `${subject.accentColor}10`,
                            borderColor: `${subject.accentColor}30`,
                            color: subject.accentColor
                          }}
                          title={`Click to open Unit ${u.unit}: ${u.title}`}
                        >
                          Unit {u.unit}: {u.title}
                        </button>
                      ))}

                      {subject.units.length === 0 && (
                        <button
                          onClick={() => setEditingUnitsSubject(subject)}
                          className="text-[11px] text-paper-muted dark:text-night-muted italic hover:underline"
                        >
                          + Click to add your first syllabus unit
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Open Subject Button with Subject Accent Color */}
                <button
                  onClick={() => onSelectSubject(subject.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm btn-tactile btn-shimmer transition-transform"
                  style={{ backgroundColor: subject.accentColor }}
                >
                  <span>Open Subject</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Date Modal */}
      {editingDateSubject && (
        <EditExamDateModal
          subject={editingDateSubject}
          isOpen={!!editingDateSubject}
          onClose={() => setEditingDateSubject(null)}
          onSave={(newDate) => {
            onUpdateSubject({ ...editingDateSubject, examDate: newDate });
          }}
        />
      )}

      {/* Edit Units Modal */}
      {editingUnitsSubject && (
        <EditUnitsModal
          subject={editingUnitsSubject}
          isOpen={!!editingUnitsSubject}
          onClose={() => setEditingUnitsSubject(null)}
          onSaveUnits={(updatedUnits) => {
            onUpdateSubject({ ...editingUnitsSubject, units: updatedUnits });
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-slide-up">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-xl">
            <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Delete Subject?</h3>
            </div>
            <p className="text-xs text-paper-muted dark:text-night-muted mb-5 leading-relaxed">
              Are you sure you want to remove this subject and its saved questions? This action cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setSubjectToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-paper-border dark:border-night-border text-xs font-semibold text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSubject(subjectToDelete);
                  setSubjectToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 btn-tactile"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
