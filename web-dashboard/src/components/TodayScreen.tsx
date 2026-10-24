import React from 'react';
import { 
  SubjectMeta, 
  SyllabusTopic, 
  PYQQuestion, 
  StudyTask, 
  Flashcard, 
  PomodoroSession,
  DayStudyPlan 
} from '../types';
import { getExamUrgencyColor, sortSubjectsByExamUrgency, storageService } from '../utils/storageService';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Play, 
  BookOpen, 
  Sparkles, 
  Layers, 
  RotateCcw, 
  ArrowRight, 
  Timer, 
  Brain,
  AlertTriangle,
  Award
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
  onShowToast
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

  // Generate today's topics plan
  const smartPlan = React.useMemo(() => {
    return storageService.generateSmartStudyPlan(subjects, topics, questions);
  }, [subjects, topics, questions]);

  const todayPlan = smartPlan.find(p => p.isToday) || smartPlan[0];
  const todayTopics = todayPlan ? todayPlan.topics : [];

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

              <h1 className="text-2xl sm:text-4xl font-extrabold text-paper-ink dark:text-night-text tracking-tight">
                {nextSubject.name}
              </h1>

              <p className="text-xs sm:text-sm text-paper-body dark:text-night-muted max-w-xl leading-relaxed">
                {nextUrgency.fractionalDays <= 5
                  ? `🚨 Critical countdown: Only ${nextUrgency.days} days and ${nextUrgency.hours} hours remaining. Prioritize highest-repeated PYQs and weak topics today.`
                  : `Target exam locked. Review your syllabus checklist, active recall flashcards, and finish today's assigned study topics below.`}
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
        {/* Stat 1: Topics To Study Today */}
        <div 
          onClick={() => onNavigateView('planner')}
          className="p-4 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:border-emerald-500 cursor-pointer transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-paper-ink dark:text-night-text">
              {todayTopics.length} Topics
            </div>
            <div className="text-xs text-paper-muted dark:text-night-muted">
              Scheduled For Today • View Plan →
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

      {/* 3. TOPICS TO STUDY TODAY (ACTIONABLE CHECKLIST) */}
      <div className="p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-border dark:border-night-border">
          <div>
            <h3 className="text-lg font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Today's Study Plan</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted font-bold font-mono">
                {todayTopics.filter(t => {
                  const realTopic = topics.find(rt => rt.id === t.topicId);
                  return realTopic ? realTopic.completed : false;
                }).length} / {todayTopics.length} Done
              </span>
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
              Smart study algorithm prioritizes weak & high-frequency exam topics first. Check off topics as you finish them.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateView('planner')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated text-paper-ink dark:text-night-text hover:border-emerald-500 btn-tactile flex items-center gap-1.5"
            >
              <span>Full Study Calendar →</span>
            </button>
          </div>
        </div>

        {/* Topic Items Checklist */}
        <div className="space-y-3">
          {todayTopics.map((topicItem, idx) => {
            const actualTopic = topics.find(t => t.id === topicItem.topicId);
            const isCompleted = actualTopic ? actualTopic.completed : false;
            const mastery = actualTopic ? actualTopic.mastery : topicItem.mastery;

            return (
              <div
                key={topicItem.topicId || idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' 
                    : 'bg-paper-cardElevated dark:bg-night-cardElevated border-paper-border dark:border-night-border hover:border-emerald-500'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTopicCompleted(topicItem.topicId)}
                    className="mt-0.5 p-1 text-paper-muted hover:text-emerald-600 dark:text-night-muted dark:hover:text-emerald-400 transition-colors btn-tactile shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-paper-muted dark:text-night-muted" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono"
                        style={{ 
                          backgroundColor: `${topicItem.accentColor}18`,
                          color: topicItem.accentColor
                        }}
                      >
                        {topicItem.subjectName} • Unit {topicItem.unitNumber}
                      </span>

                      {/* Mastery badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        mastery === 'weak' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                        mastery === 'strong' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                        'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}>
                        {mastery.toUpperCase()}
                      </span>

                      {topicItem.frequency > 0 && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-current" />
                          <span>{topicItem.frequency} PYQs</span>
                        </span>
                      )}
                    </div>

                    <div className={`text-sm font-bold ${isCompleted ? 'line-through text-paper-muted dark:text-night-muted' : 'text-paper-ink dark:text-night-text'}`}>
                      {topicItem.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[11px] text-paper-muted dark:text-night-muted font-mono font-medium">
                    ~{topicItem.estimatedMinutes} mins
                  </span>

                  <button
                    onClick={() => onSelectSubject(topicItem.subjectId)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-paper-border dark:border-night-border hover:border-emerald-500 text-paper-ink dark:text-night-text btn-tactile"
                  >
                    Open Topic
                  </button>
                </div>
              </div>
            );
          })}

          {todayTopics.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-dashed border-paper-border dark:border-night-border space-y-2">
              <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-paper-ink dark:text-night-text">
                All Topics Completed for Today! 🌟
              </h4>
              <p className="text-xs text-paper-muted dark:text-night-muted max-w-sm mx-auto">
                You've finished today's scheduled work. You can review flashcards or open the Syllabus Tracker to get ahead on upcoming units.
              </p>
              <button
                onClick={() => onNavigateView('syllabus')}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white btn-tactile inline-flex items-center gap-1.5"
              >
                <span>View Full Syllabus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. PROGRESS SUMMARY FOR EACH SUBJECT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Subject Progress Summary</span>
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
              Live syllabus progress, weak vs strong breakdown, and exam status across your subjects.
            </p>
          </div>

          <button
            onClick={() => onNavigateView('syllabus')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline btn-tactile"
          >
            Manage Syllabus →
          </button>
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
                className="p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card flex flex-col justify-between transition-all hover:shadow-md"
                style={{ borderTop: `4px solid ${sub.accentColor}` }}
              >
                <div>
                  {/* Header: Title & Time Remaining Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 
                      onClick={() => onSelectSubject(sub.id)}
                      className="text-base font-bold text-paper-ink dark:text-night-text cursor-pointer hover:underline line-clamp-1"
                    >
                      {sub.name}
                    </h4>

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
