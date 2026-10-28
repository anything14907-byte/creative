import React from 'react';
import { 
  SubjectMeta, 
  SyllabusTopic, 
  PYQQuestion, 
  StudyTask, 
  Flashcard, 
  PomodoroSession,
  VideoResource
} from '../types';
import { 
  getExamUrgencyColor, 
  sortSubjectsByExamUrgency, 
  storageService,
  calculateUnitReadiness,
  getSubjectTotalStudiedMinutes,
  formatStudiedTime,
  formatUnitDisplayName
} from '../utils/storageService';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Layers, 
  ArrowRight, 
  Timer, 
  Brain,
  Plus,
  Edit3,
  Database,
  Download,
  X,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react';

interface TodayScreenProps {
  subjects: SubjectMeta[];
  topics: SyllabusTopic[];
  questions: PYQQuestion[];
  tasks: StudyTask[];
  flashcards: Flashcard[];
  pomodoroLogs: PomodoroSession[];
  videos?: VideoResource[];
  onToggleTopicCompleted: (topicId: string) => void;
  onSelectSubject: (subjectId: string, unitId?: string) => void;
  onNavigateView: (view: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAddSubject?: () => void;
  onEditSubject?: (subject: SubjectMeta) => void;
  onOpenBackup?: () => void;
  onReorderSubjects?: (subjects: SubjectMeta[]) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  subjects,
  topics,
  questions,
  tasks,
  flashcards,
  pomodoroLogs,
  videos = [],
  onToggleTopicCompleted,
  onSelectSubject,
  onNavigateView,
  onShowToast,
  onOpenAddSubject,
  onEditSubject,
  onOpenBackup,
  onReorderSubjects
}) => {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const [dismissedBackupReminder, setDismissedBackupReminder] = React.useState(false);
  const lastBackupTs = Number(localStorage.getItem('pyq_last_backup_export_ts') || 0);
  const daysSinceBackup = lastBackupTs > 0 ? (Date.now() - lastBackupTs) / (1000 * 60 * 60 * 24) : 999;
  const showBackupReminder = !dismissedBackupReminder && daysSinceBackup >= 7;

  // Sorting: by date (closest exam first) or custom order (saved)
  const [sortMode, setSortMode] = React.useState<'date' | 'custom'>(() => {
    return (localStorage.getItem('pyq_subject_sort_mode') as 'date' | 'custom') || 'date';
  });
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);

  const displaySubjects = React.useMemo(() => {
    if (sortMode === 'date') {
      return sortSubjectsByExamUrgency(subjects);
    }
    return subjects;
  }, [subjects, sortMode]);

  const handleMoveSubject = (idx: number, offset: number) => {
    const target = idx + offset;
    if (target < 0 || target >= displaySubjects.length) return;
    const reordered = [...displaySubjects];
    const [removed] = reordered.splice(idx, 1);
    reordered.splice(target, 0, removed);
    storageService.saveSubjects(reordered);
    if (onReorderSubjects) {
      onReorderSubjects(reordered);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (sortMode !== 'custom') return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (sortMode !== 'custom') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (sortMode !== 'custom' || draggedIdx === null || draggedIdx === targetIndex) return;
    e.preventDefault();
    const reordered = [...displaySubjects];
    const [removed] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIndex, 0, removed);
    setDraggedIdx(null);
    storageService.saveSubjects(reordered);
    if (onReorderSubjects) {
      onReorderSubjects(reordered);
    }
  };

  const sortedSubjectsForNext = React.useMemo(() => sortSubjectsByExamUrgency(subjects), [subjects]);
  const nextSubject = sortedSubjectsForNext.find(s => {
    if (!s.examDate || !s.examDate.trim()) return false;
    const u = getExamUrgencyColor(s.examDate);
    return u.hasDate && u.fractionalDays > 0;
  });

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
    <div className="w-full space-y-8 animate-fade-slide-up pb-16">

      {/* 0. BACKUP REMINDER BANNER (Requirement 13: 7 days without export) */}
      {showBackupReminder && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-paper-ink dark:text-night-text flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Backup Reminder {lastBackupTs > 0 ? `(Last exported ${Math.floor(daysSinceBackup)} days ago)` : '(No backup exported yet)'}
              </div>
              <div className="text-[11px] text-paper-muted dark:text-night-muted">
                Keep your study notes, syllabus units, and revision files safe with a local single-file backup.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onOpenBackup && (
              <button
                onClick={onOpenBackup}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold btn-tactile shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Backup</span>
              </button>
            )}
            <button
              onClick={() => setDismissedBackupReminder(true)}
              className="p-1.5 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text"
              title="Dismiss reminder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* 1. NEXT EXAM COUNTDOWN HERO BANNER (100% Widescreen Horizontal Layout) */}
      {nextSubject && nextUrgency && nextUrgency.hasDate && (
        <div 
          className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card transition-all w-full"
          style={{ borderLeft: `8px solid ${nextSubject.accentColor}` }}
        >
          {/* Subtle background glow */}
          <div 
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15"
            style={{ backgroundColor: nextSubject.accentColor }}
          />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 w-full">
            
            {/* Left: Priority #1 Subject & Target Exam Date */}
            <div className="space-y-2 shrink-0">
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
                  <span>Priority #1 • {nextUrgency.statusLabel}</span>
                </span>

                <span className="text-xs font-semibold text-paper-muted dark:text-night-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target: {nextUrgency.formattedExamDate}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h1 
                  onClick={() => onSelectSubject(nextSubject.id)}
                  className="text-2xl sm:text-3xl font-extrabold text-paper-ink dark:text-night-text tracking-tight cursor-pointer hover:underline"
                  title="Open Subject Workspace"
                >
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

              <div className="flex items-center gap-3 text-xs text-paper-muted dark:text-night-muted">
                <span>⏱️ Studied: <strong className="text-paper-ink dark:text-night-text">{formatStudiedTime(getSubjectTotalStudiedMinutes(nextSubject.id, pomodoroLogs))}</strong></span>
                <span>•</span>
                <span>{nextSubject.units.length} Units</span>
                {nextSubject.code && (
                  <>
                    <span>•</span>
                    <span className="font-mono uppercase font-bold">{nextSubject.code}</span>
                  </>
                )}
              </div>
            </div>

            {/* Center: Live DAYS : HOURS : MINUTES : SECONDS Urgency Clock */}
            <div 
              className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl border shadow-sm transition-all text-center xl:min-w-[300px] shrink-0"
              style={{ 
                backgroundColor: `${nextUrgency.hslColor}10`,
                borderColor: `${nextUrgency.hslColor}40`
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-paper-muted dark:text-night-muted mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: nextUrgency.hslColor }} />
                <span>Urgency Countdown Clock</span>
              </div>
              <div 
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight"
                style={{ color: nextUrgency.hslColor }}
              >
                {nextUrgency.formattedCountdown}
              </div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted font-medium mt-1">
                {nextUrgency.fractionalDays <= 5 ? '🚨 High Priority Exam' : 'Target Locked'}
              </div>
            </div>

            {/* Right: Quick-Jump Unit Pills with mini progress bars */}
            <div className="flex flex-col gap-3 xl:min-w-[320px] w-full">
              <div className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center justify-between">
                <span>Quick-Jump Units</span>
                <span className="text-[11px] text-paper-muted dark:text-night-muted">Readiness %</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
                {nextSubject.units.map(unit => {
                  const readiness = calculateUnitReadiness(unit, tasks, videos, questions, topics);
                  return (
                    <button
                      key={unit.id}
                      onClick={() => onSelectSubject(nextSubject.id, unit.id)}
                      className="px-2.5 py-1.5 rounded-xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated hover:border-emerald-500 text-left transition-all btn-tactile group flex flex-col gap-1 min-w-[110px]"
                      title={`Jump to ${formatUnitDisplayName(unit)} (${readiness.percentage}% ready)`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-paper-ink dark:text-night-text">
                        <span className="truncate max-w-[80px]">{formatUnitDisplayName(unit)}</span>
                        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">{readiness.percentage}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-paper-card dark:bg-night-card overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${readiness.percentage}%`,
                            backgroundColor: nextSubject.accentColor 
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onNavigateView('timer')}
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 btn-tactile shadow-sm"
                >
                  <Timer className="w-4 h-4" />
                  <span>Start Focus (25m)</span>
                </button>
                <button
                  onClick={() => onSelectSubject(nextSubject.id)}
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 btn-tactile shadow-sm"
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

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort: by exam date / my own order */}
            <div className="flex items-center gap-1 bg-paper-cardElevated dark:bg-night-cardElevated p-1 rounded-xl border border-paper-border dark:border-night-border text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => {
                  setSortMode('date');
                  localStorage.setItem('pyq_subject_sort_mode', 'date');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${sortMode === 'date' ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-night-bg font-bold shadow-sm' : 'text-paper-muted dark:text-night-muted hover:text-paper-ink'}`}
              >
                By Date
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortMode('custom');
                  localStorage.setItem('pyq_subject_sort_mode', 'custom');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${sortMode === 'custom' ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-night-bg font-bold shadow-sm' : 'text-paper-muted dark:text-night-muted hover:text-paper-ink'}`}
              >
                My Order
              </button>
            </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
          {displaySubjects.map((sub, idx) => {
            const urgency = getExamUrgencyColor(sub.examDate);
            const progress = storageService.getSubjectProgress(sub.id, topics);
            const subPyqs = questions.filter(q => q.subjectId === sub.id);
            const masteredPyqs = subPyqs.filter(q => q.userStatus === 'mastered').length;
            const totalMinutesStudied = getSubjectTotalStudiedMinutes(sub.id, pomodoroLogs);

            return (
              <div
                key={sub.id}
                draggable={sortMode === 'custom'}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                className={`p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card flex flex-col justify-between transition-all hover:shadow-md group ${draggedIdx === idx ? 'opacity-40 scale-95 border-dashed border-emerald-500' : ''}`}
                style={{ borderTop: `4px solid ${sub.accentColor}` }}
              >
                <div>
                  {/* Header: Title & Action Controls */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                      <h4 
                        onClick={() => onSelectSubject(sub.id)}
                        className="text-base font-extrabold text-paper-ink dark:text-night-text cursor-pointer hover:underline leading-snug break-words"
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
                          className="p-1 rounded-md text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text opacity-70 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                          title="Edit subject name & exam date"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {sortMode === 'custom' && (
                        <div className="flex items-center gap-0.5 text-paper-muted shrink-0 mt-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSubject(idx, -1);
                            }}
                            className="p-1 rounded hover:text-paper-ink dark:hover:text-night-text disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Move subject left"
                          >
                            <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === displaySubjects.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSubject(idx, 1);
                            }}
                            className="p-1 rounded hover:text-paper-ink dark:hover:text-night-text disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Move subject right"
                          >
                            <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* REQUIREMENT 2: Exact Formatted Exam Date + Smooth Color-Coded Urgency Badge */}
                  <div 
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border text-[11px] font-semibold my-2.5 transition-all"
                    style={{
                      backgroundColor: urgency.hasDate ? `${urgency.hslColor}10` : 'rgba(91, 101, 115, 0.08)',
                      borderColor: urgency.hasDate ? `${urgency.hslColor}35` : 'rgba(91, 101, 115, 0.2)'
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: urgency.hslColor }} />
                      <span className="truncate text-paper-ink dark:text-night-text font-medium">
                        {urgency.hasDate ? urgency.formattedExamDate : 'No exam date set'}
                      </span>
                    </div>
                    <div 
                      className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold shrink-0 shadow-xs flex items-center gap-1"
                      style={{ 
                        backgroundColor: urgency.hasDate ? `${urgency.hslColor}25` : 'rgba(91, 101, 115, 0.15)',
                        color: urgency.hasDate ? urgency.hslColor : '#5B6573'
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {urgency.hasDate 
                          ? (urgency.fractionalDays > 0 ? `${urgency.days}d ${urgency.hours}h` : 'Exam Passed')
                          : 'Set Date'}
                      </span>
                    </div>
                  </div>

                  {/* Total Studied Time & Code */}
                  <div className="flex items-center gap-2 mb-3 text-[11px] text-paper-muted dark:text-night-muted flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border font-medium flex items-center gap-1">
                      <span>⏱️</span>
                      <span>Total Studied: <strong className="text-paper-ink dark:text-night-text">{formatStudiedTime(totalMinutesStudied)}</strong></span>
                    </span>
                    {sub.code && (
                      <span className="font-mono text-[10px] uppercase font-bold text-paper-muted dark:text-night-muted">
                        {sub.code}
                      </span>
                    )}
                  </div>

                  {/* Syllabus Progress bar */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-paper-body dark:text-night-text">Syllabus Completion</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{progress.percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-paper-cardElevated dark:bg-night-cardElevated overflow-hidden border border-paper-border dark:border-night-border">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
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

                  {/* Topic Mastery Tags Breakdown (Weak / Okay / Strong) */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold mb-3">
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

                  {/* REQUIREMENT 2.3: Clickable Unit / Top Topic Pills Below Mastery Counters */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-paper-muted dark:text-night-muted uppercase tracking-wider">
                      <span>Units & Topics</span>
                      <span className="font-mono">{sub.units.length} Units</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {sub.units.map(unit => {
                        const readiness = calculateUnitReadiness(unit, tasks, videos, questions, topics);
                        return (
                          <div
                            key={unit.id}
                            className="inline-flex items-center rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:border-emerald-500/50 transition-all text-[11px] overflow-hidden group/pill"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSubject(sub.id, unit.id);
                              }}
                              className="px-2.5 py-1 font-bold text-paper-ink dark:text-night-text hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 btn-tactile"
                              title={`Jump to ${formatUnitDisplayName(unit)} in Syllabus (${readiness.percentage}% ready)`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sub.accentColor }} />
                              <span className="truncate max-w-[95px]">{formatUnitDisplayName(unit)}</span>
                              <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 text-emerald-600 dark:text-emerald-400">
                                {readiness.percentage}%
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSubject(sub.id, unit.id);
                              }}
                              className="px-1.5 py-1 text-[10px] font-semibold text-paper-muted hover:text-cyan-600 dark:hover:text-cyan-400 border-l border-paper-border dark:border-night-border hover:bg-black/5 dark:hover:bg-white/5"
                              title={`Quick Add Video or PDF in ${formatUnitDisplayName(unit)}`}
                            >
                              +Add
                            </button>
                          </div>
                        );
                      })}
                      {sub.units.length === 0 && (
                        <span className="text-[11px] text-paper-muted dark:text-night-muted italic">
                          No units added yet. Open subject to configure syllabus units.
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Bottom Action Button (Styled in User's chosen Card Accent Color) */}
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
