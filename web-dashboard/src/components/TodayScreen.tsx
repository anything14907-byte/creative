import React from 'react';
import { 
  SubjectMeta, 
  SyllabusTopic, 
  PYQQuestion, 
  StudyTask, 
  Flashcard, 
  PomodoroSession 
} from '../types';
import { getExamUrgencyColor, sortSubjectsByExamUrgency, storageService } from '../utils/storageService';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Layers, 
  ArrowRight, 
  Timer, 
  Brain,
  Plus,
  Edit3
} from 'lucide-react';

interface TodayScreenProps {
  subjects: SubjectMeta[];
  topics: SyllabusTopic[];
  questions: PYQQuestion[];
  tasks: StudyTask[];
  flashcards: Flashcard[];
  pomodoroLogs: PomodoroSession[];
  onToggleTopicCompleted: (topicId: string) => void;
  onSelectSubject: (subjectId: string, unitId?: string) => void;
  onNavigateView: (view: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAddSubject?: () => void;
  onEditSubject?: (subject: SubjectMeta) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  subjects,
  topics,
  questions,
  tasks,
  flashcards,
  pomodoroLogs,
  onToggleTopicCompleted,
  onSelectSubject,
  onNavigateView,
  onShowToast,
  onOpenAddSubject,
  onEditSubject
}) => {
  const sortedSubjects = React.useMemo(() => sortSubjectsByExamUrgency(subjects), [subjects]);
  const nextSubject = sortedSubjects.find(s => {
    const u = getExamUrgencyColor(s.examDate);
    return u.fractionalDays > 0;
  }) || sortedSubjects[0];

  const nextUrgency = nextSubject ? getExamUrgencyColor(nextSubject.examDate) : null;

  // Flashcards due today
  const todayStr = new Date().toISOString().split('T')[0];
  const dueFlashcards = flashcards.filter(c => !c.nextReviewDate || c.nextReviewDate <= todayStr);

  // Focus time today
  const todayMinutes = pomodoroLogs
    .filter(l => l.date === todayStr)
    .reduce((sum, l) => sum + (Number(l.minutes) || 0), 0);

  // Overall syllabus progress
  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.completed).length;
  const overallPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-slide-up pb-16">
      
      {/* 1. NEXT EXAM COUNTDOWN HERO BANNER */}
      {nextSubject && nextUrgency && (
        <div 
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card transition-all"
          style={{ borderLeft: `8px solid ${nextSubject.accentColor}` }}
        >
          {/* Subtle background glow */}
          <div 
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15"
            style={{ backgroundColor: nextSubject.accentColor }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 shadow-sm"
                  style={{ 
                    color: nextUrgency.hslColor,
                    backgroundColor: `${nextUrgency.hslColor}18`,
                    border: `1px solid ${nextUrgency.hslColor}35`
                  }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{nextUrgency.statusLabel}</span>
                </span>

                <span className="text-xs font-semibold text-paper-muted dark:text-night-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Next Exam: {nextUrgency.formattedExamDate}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-paper-ink dark:text-night-text tracking-tight">
                  {nextSubject.name}
                </h1>
                {onEditSubject && (
                  <button
                    onClick={() => onEditSubject(nextSubject)}
                    className="p-1.5 rounded-xl border border-paper-border dark:border-night-border text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile transition-colors"
                    title="Edit Subject Name & Exam Date"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-paper-body dark:text-night-muted max-w-xl leading-relaxed">
                {nextUrgency.fractionalDays <= 5
                  ? `🚨 Critical countdown: Only ${nextUrgency.days} days and ${nextUrgency.hours} hours remaining. Prioritize highest-repeated PYQs and weak topics today.`
                  : `Target exam locked. Review your syllabus checklist, active recall flashcards, and study your high-frequency questions.`}
              </p>
            </div>

            {/* Countdown Box & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <div 
                className="w-full sm:w-auto px-6 py-4 rounded-2xl text-center border shadow-sm transition-all"
                style={{ 
                  backgroundColor: `${nextUrgency.hslColor}10`,
                  borderColor: `${nextUrgency.hslColor}40`
                }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-paper-muted dark:text-night-muted mb-0.5">
                  Time Remaining
                </div>
                <div 
                  className="text-2xl sm:text-3xl font-extrabold countdown-digit"
                  style={{ color: nextUrgency.hslColor }}
                >
                  {nextUrgency.formattedCountdown}
                </div>
              </div>

              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onNavigateView('timer')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 btn-tactile shadow-sm"
                >
                  <Timer className="w-4 h-4" />
                  <span>Start Focus (25m)</span>
                </button>

                <button
                  onClick={() => onSelectSubject(nextSubject.id)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 btn-tactile shadow-sm"
                  style={{ backgroundColor: nextSubject.accentColor }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Subject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUICK STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Overall Syllabus Progress */}
        <div 
          onClick={() => onNavigateView('syllabus')}
          className="p-4 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:border-emerald-500 cursor-pointer transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-paper-ink dark:text-night-text">
              {overallPercent}% Syllabus
            </div>
            <div className="text-xs text-paper-muted dark:text-night-muted">
              {completedTopics} of {totalTopics} topics completed →
            </div>
          </div>
        </div>

        {/* Stat 2: Focus Time Today */}
        <div 
          onClick={() => onNavigateView('timer')}
          className="p-4 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:border-emerald-500 cursor-pointer transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-paper-ink dark:text-night-text">
              {todayMinutes} mins
            </div>
            <div className="text-xs text-paper-muted dark:text-night-muted">
              Pomodoro Studied Today →
            </div>
          </div>
        </div>

        {/* Stat 3: Spaced Repetition Due Today */}
        <div 
          onClick={() => onNavigateView('flashcards')}
          className="p-4 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:border-emerald-500 cursor-pointer transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-paper-ink dark:text-night-text">
              {dueFlashcards.length} Cards
            </div>
            <div className="text-xs text-paper-muted dark:text-night-muted">
              {dueFlashcards.length > 0 ? 'Due For Review Today →' : 'All Cards Reviewed! 🎉'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROGRESS SUMMARY FOR EACH SUBJECT (WITH DASHBOARD + ADD SUBJECT BUTTON) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Subject Progress Summary</span>
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
              Live syllabus progress, weak vs strong breakdown, and exam status across your subjects.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* REQUIREMENT 2: Single "+ Add Subject" button on Dashboard */}
            {onOpenAddSubject && (
              <button
                onClick={onOpenAddSubject}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 btn-tactile shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            )}

            <button
              onClick={() => onNavigateView('syllabus')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline btn-tactile px-2 py-1"
            >
              Manage Syllabus →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedSubjects.map(sub => {
            const urgency = getExamUrgencyColor(sub.examDate);
            const progress = storageService.getSubjectProgress(sub.id, topics);
            const subPyqs = questions.filter(q => q.subjectId === sub.id);
            const masteredPyqs = subPyqs.filter(q => q.userStatus === 'mastered').length;

            return (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card flex flex-col justify-between transition-all hover:shadow-md group"
                style={{ borderTop: `4px solid ${sub.accentColor}` }}
              >
                <div>
                  {/* Header: Title, Edit Button & Time Remaining Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 
                        onClick={() => onSelectSubject(sub.id)}
                        className="text-base font-bold text-paper-ink dark:text-night-text cursor-pointer hover:underline truncate"
                        title={sub.name}
                      >
                        {sub.name}
                      </h4>
                      {onEditSubject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditSubject(sub);
                          }}
                          className="p-1 rounded-md text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text opacity-70 group-hover:opacity-100 transition-opacity"
                          title="Edit subject name & exam date"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0"
                      style={{ 
                        color: urgency.hslColor,
                        backgroundColor: `${urgency.hslColor}16`
                      }}
                    >
                      {urgency.fractionalDays > 0 ? `${urgency.days}d ${urgency.hours}h` : 'Completed'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-paper-body dark:text-night-text">Syllabus Completion</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{progress.percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-paper-cardElevated dark:bg-night-cardElevated overflow-hidden border border-paper-border dark:border-night-border">
                      <div 
                        className="h-full rounded-full transition-all duration-600"
                        style={{ 
                          width: `${progress.percentage}%`,
                          backgroundColor: sub.accentColor 
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-paper-muted dark:text-night-muted flex items-center justify-between">
                      <span>{progress.completed} of {progress.total} topics</span>
                      <span>{masteredPyqs}/{subPyqs.length} PYQs mastered</span>
                    </div>
                  </div>

                  {/* Topic Mastery Tags Breakdown */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold mb-4">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <div>{progress.weakCount}</div>
                      <div className="text-[9px] font-normal opacity-80">Weak</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <div>{progress.okayCount}</div>
                      <div className="text-[9px] font-normal opacity-80">Okay</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <div>{progress.strongCount}</div>
                      <div className="text-[9px] font-normal opacity-80">Strong</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <button
                  onClick={() => onSelectSubject(sub.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm btn-tactile btn-shimmer"
                  style={{ backgroundColor: sub.accentColor }}
                >
                  <span>Open Subject</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
