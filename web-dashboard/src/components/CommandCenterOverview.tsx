import React, { useState } from 'react';
import { SubjectMeta, PYQQuestion, StudyTask } from '../types';
import { getExamUrgencyColor } from '../utils/storageService';
import { EditExamDateModal } from './EditExamDateModal';
import { 
  Clock, Calendar, Plus, ArrowRight, Trash2, CheckCircle2, 
  Cpu, Database, Network, Code, BookOpen, AlertCircle, Sparkles 
} from 'lucide-react';

interface CommandCenterOverviewProps {
  subjects: SubjectMeta[];
  questions: PYQQuestion[];
  tasks: StudyTask[];
  onSelectSubject: (id: string) => void;
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
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);

  // Find nearest upcoming subject exam
  const nearestSubjectWithUrgency = React.useMemo(() => {
    let nearest: { subject: SubjectMeta; urgency: ReturnType<typeof getExamUrgencyColor> } | null = null;
    let minDays = Infinity;

    for (const sub of subjects) {
      const u = getExamUrgencyColor(sub.examDate);
      if (u.fractionalDays > 0 && u.fractionalDays < minDays) {
        minDays = u.fractionalDays;
        nearest = { subject: sub, urgency: u };
      }
    }
    if (!nearest && subjects.length > 0) {
      nearest = { subject: subjects[0], urgency: getExamUrgencyColor(subjects[0].examDate) };
    }
    return nearest;
  }, [subjects]);

  const getSubjectIcon = (name: string) => {
    switch (name) {
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Database': return <Database className="w-5 h-5" />;
      case 'Network': return <Network className="w-5 h-5" />;
      case 'Code': return <Code className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-slide-up">
      
      {/* 1. TOP HERO: NEAREST UPCOMING EXAM WITH DYNAMIC URGENCY SHIFT */}
      {nearestSubjectWithUrgency && (
        <div 
          className={`p-6 sm:p-7 rounded-3xl bg-paper-card dark:bg-night-card border transition-all duration-700 shadow-paper-card dark:shadow-night-card relative overflow-hidden ${nearestSubjectWithUrgency.urgency.isUrgent ? 'pulse-urgent-exam' : ''}`}
          style={{ 
            borderColor: nearestSubjectWithUrgency.urgency.hslColor,
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
                  {nearestSubjectWithUrgency.urgency.statusLabel}
                </span>

                <span className="text-xs text-paper-muted dark:text-night-muted font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {nearestSubjectWithUrgency.urgency.formattedExamDate}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-paper-ink dark:text-night-text tracking-tight">
                {nearestSubjectWithUrgency.subject.name}
              </h2>

              <p className="text-xs sm:text-sm text-paper-body dark:text-night-muted mt-1 max-w-xl">
                {nearestSubjectWithUrgency.urgency.fractionalDays <= 5 
                  ? '🚨 Critical revision window! Focus strictly on the highest-repeated past questions.'
                  : 'Prepare comfortably with unit-by-unit study missions and video lectures.'}
              </p>
            </div>

            {/* Right: Live Ticking Countdown HUD & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              
              {/* Ticking Timer Box */}
              <div 
                className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border transition-colors duration-500 shadow-sm"
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
                  style={{ backgroundColor: nearestSubjectWithUrgency.urgency.hslColor }}
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

      {/* 2. SUBJECT CARDS GRID (CLEAN, SPACIOUS, 100% CONTRAST) */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <span>Your Subjects</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted font-bold font-mono">
                {subjects.length} Active
              </span>
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
              Each subject shows its live countdown, exact exam date, and smooth Green → Yellow → Red urgency shift.
            </p>
          </div>

          <button
            onClick={onOpenAddSubject}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg flex items-center gap-1.5 btn-tactile shadow-sm"
          >
            <Plus className="w-4 h-4" /> + Add Subject
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {subjects.map(subject => {
            const urgency = getExamUrgencyColor(subject.examDate);
            const subQuestions = questions.filter(q => q.subjectId === subject.id);
            const masteredCount = subQuestions.filter(q => q.userStatus === 'mastered').length;
            const subTasks = tasks.filter(t => t.subjectId === subject.id);

            // Recommended single next action based on time remaining
            let nextAction = 'Solve 2 repeated PYQs today';
            if (urgency.fractionalDays <= 3) {
              nextAction = '🚨 Master top 3 repeat 10M questions';
            } else if (urgency.fractionalDays <= 7) {
              nextAction = '⚡ Practice 5M questions from memory';
            } else if (urgency.fractionalDays <= 12) {
              nextAction = '📖 Watch video lectures for Unit 2 & 3';
            } else {
              nextAction = '🟢 Read syllabus notes & outline questions';
            }

            return (
              <div
                key={subject.id}
                className={`p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card flex flex-col justify-between transition-all duration-500 hover:shadow-md relative overflow-hidden group ${urgency.isUrgent ? 'pulse-urgent-exam' : ''}`}
                style={{ 
                  borderTop: `4px solid ${urgency.hslColor}`
                }}
              >
                <div>
                  
                  {/* Card Header: Icon, Name & Delete */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ 
                          backgroundColor: `${urgency.hslColor}18`,
                          color: urgency.hslColor
                        }}
                      >
                        {getSubjectIcon(subject.iconName)}
                      </div>
                      <div>
                        <h4 
                          onClick={() => onSelectSubject(subject.id)}
                          className="text-base font-bold text-paper-ink dark:text-night-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 cursor-pointer transition-colors line-clamp-1"
                        >
                          {subject.name}
                        </h4>
                        <span className="text-[11px] text-paper-muted dark:text-night-muted font-medium">
                          {subject.units.length} Units • {subQuestions.length} Questions
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSubjectToDelete(subject.id)}
                      className="p-1.5 text-paper-muted dark:text-night-muted hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 1. Visible Exam Date with 1-Click "Change Date" Picker */}
                  <div className="my-3 p-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border flex items-center justify-between gap-2">
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

                  {/* 2. Live Countdown Timer with Smooth Color Shift */}
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

                  {/* 3. Recommended Next Action */}
                  <div className="p-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border mb-4 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted block mb-0.5">
                      Next Step:
                    </span>
                    <span className="text-paper-ink dark:text-night-text font-medium text-[11px] line-clamp-2">
                      {nextAction}
                    </span>
                  </div>

                </div>

                {/* Open Subject Button with Tactile Animation */}
                <button
                  onClick={() => onSelectSubject(subject.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm btn-tactile btn-shimmer transition-transform"
                  style={{ backgroundColor: urgency.hslColor }}
                >
                  <span>Open Subject</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            );
          })}

          {/* Add Subject Card */}
          <div
            onClick={onOpenAddSubject}
            className="p-6 rounded-2xl border-2 border-dashed border-paper-border dark:border-night-border hover:border-emerald-500 dark:hover:border-emerald-400 bg-paper-card/60 dark:bg-night-card/60 hover:bg-paper-card dark:hover:bg-night-card cursor-pointer transition-all flex flex-col items-center justify-center text-center group min-h-[290px] btn-tactile"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-paper-ink dark:text-night-text mb-1">+ Add Subject</h4>
            <p className="text-xs text-paper-muted dark:text-night-muted max-w-[200px]">
              Set your exam date to track live countdowns and practice questions.
            </p>
          </div>
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
