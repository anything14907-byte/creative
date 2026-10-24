import React, { useState } from 'react';
import { SubjectMeta, SyllabusTopic, PYQQuestion, DayStudyPlan } from '../types';
import { storageService, getExamUrgencyColor } from '../utils/storageService';
import { 
  Calendar, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flame, 
  Layers, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface SmartStudyPlannerViewProps {
  subjects: SubjectMeta[];
  topics: SyllabusTopic[];
  questions: PYQQuestion[];
  onToggleTopicCompleted: (topicId: string) => void;
  onSelectSubject: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SmartStudyPlannerView: React.FC<SmartStudyPlannerViewProps> = ({
  subjects,
  topics,
  questions,
  onToggleTopicCompleted,
  onSelectSubject,
  onShowToast
}) => {
  // Plan state
  const [skipRerenderKey, setSkipRerenderKey] = useState(0);

  const smartPlan = React.useMemo(() => {
    return storageService.generateSmartStudyPlan(subjects, topics, questions);
  }, [subjects, topics, questions, skipRerenderKey]);

  // Next upcoming exam
  const now = Date.now();
  const nextSubject = subjects
    .filter(s => s.examDate && new Date(s.examDate).getTime() > now)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0] || subjects[0];

  const urgency = nextSubject ? getExamUrgencyColor(nextSubject.examDate) : null;

  // Total topics left
  const uncompletedTopics = topics.filter(t => !t.completed);

  const handleRedistribute = () => {
    setSkipRerenderKey(k => k + 1);
    onShowToast('Remaining topics recalculated and redistributed from today! 🚀', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-slide-up pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Smart Day-by-Day Study Planner</span>
          </h2>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            Auto-generated study schedule. Weak and high-frequency topics come first.
          </p>
        </div>

        {/* 1-Click Redistribute Button */}
        <button
          onClick={handleRedistribute}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 btn-tactile shadow-sm self-start sm:self-auto"
          title="Recalculate remaining workload if you missed or skipped previous days"
        >
          <RotateCcw className="w-4 h-4" />
          <span>⚡ Redistribute Plan (I Skipped a Day)</span>
        </button>
      </div>

      {/* Target Exam Banner */}
      {nextSubject && urgency && (
        <div 
          className="p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card flex flex-col md:flex-row md:items-center justify-between gap-5"
          style={{ borderLeft: `6px solid ${urgency.hslColor}` }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span 
                className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono uppercase"
                style={{ backgroundColor: `${urgency.hslColor}18`, color: urgency.hslColor }}
              >
                Target Exam: {nextSubject.name}
              </span>
              <span className="text-xs text-paper-muted dark:text-night-muted">
                {urgency.formattedExamDate}
              </span>
            </div>

            <h3 className="text-lg font-bold text-paper-ink dark:text-night-text">
              {smartPlan.length} Days Allocated • {uncompletedTopics.length} Topics Remaining
            </h3>

            <p className="text-xs text-paper-muted dark:text-night-muted max-w-xl">
              Topics marked as <strong>Weak</strong> and those appearing repeatedly in past exams are scheduled in the earliest days.
            </p>
          </div>

          <div 
            className="px-5 py-3 rounded-2xl text-center border shadow-xs shrink-0"
            style={{ 
              backgroundColor: `${urgency.hslColor}10`,
              borderColor: `${urgency.hslColor}35`
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted mb-0.5">
              Countdown
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono" style={{ color: urgency.hslColor }}>
              {urgency.formattedCountdown}
            </div>
          </div>
        </div>
      )}

      {/* Days Study Grid */}
      <div className="space-y-6">
        {smartPlan.map((dayPlan) => {
          const dayCompleted = dayPlan.topics.filter(t => {
            const actualTopic = topics.find(rt => rt.id === t.topicId);
            return actualTopic ? actualTopic.completed : false;
          }).length;
          const dayTotal = dayPlan.topics.length;
          const isAllDone = dayTotal > 0 && dayCompleted === dayTotal;

          return (
            <div 
              key={dayPlan.dayNumber}
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                dayPlan.isToday 
                  ? 'bg-paper-card dark:bg-night-card border-emerald-500 shadow-md ring-1 ring-emerald-500/20' 
                  : isAllDone
                  ? 'bg-paper-card/70 dark:bg-night-card/70 border-paper-border dark:border-night-border opacity-85'
                  : 'bg-paper-card dark:bg-night-card border-paper-border dark:border-night-border'
              }`}
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-border dark:border-night-border mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold font-mono ${
                    dayPlan.isToday 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-paper-cardElevated dark:bg-night-cardElevated text-paper-ink dark:text-night-text border border-paper-border dark:border-night-border'
                  }`}>
                    {dayPlan.label}
                  </span>

                  <div>
                    <span className="text-xs font-semibold text-paper-ink dark:text-night-text">
                      {new Date(dayPlan.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[11px] text-paper-muted dark:text-night-muted ml-2">
                      ({dayCompleted} of {dayTotal} topics completed)
                    </span>
                  </div>
                </div>

                {isAllDone && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Day Complete!</span>
                  </span>
                )}
              </div>

              {/* Day Topics */}
              <div className="space-y-2.5">
                {dayPlan.topics.map((item, idx) => {
                  const actualTopic = topics.find(t => t.id === item.topicId);
                  const isDone = actualTopic ? actualTopic.completed : false;
                  const mastery = actualTopic ? actualTopic.mastery : item.mastery;

                  return (
                    <div
                      key={item.topicId || idx}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDone 
                          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' 
                          : 'bg-paper-cardElevated dark:bg-night-cardElevated border-paper-border dark:border-night-border hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => onToggleTopicCompleted(item.topicId)}
                          className="mt-0.5 p-1 text-paper-muted hover:text-emerald-600 dark:text-night-muted dark:hover:text-emerald-400 transition-colors btn-tactile shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-paper-muted dark:text-night-muted" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span 
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono"
                              style={{ backgroundColor: `${item.accentColor}18`, color: item.accentColor }}
                            >
                              {item.subjectName} • Unit {item.unitNumber}
                            </span>

                            {/* Mastery Badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              mastery === 'weak' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                              mastery === 'strong' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                              'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            }`}>
                              {mastery.toUpperCase()}
                            </span>

                            {item.frequency > 0 && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                <Flame className="w-3 h-3 fill-current" />
                                <span>{item.frequency} PYQs</span>
                              </span>
                            )}
                          </div>

                          <div className={`text-xs sm:text-sm font-bold line-clamp-1 ${isDone ? 'line-through text-paper-muted dark:text-night-muted' : 'text-paper-ink dark:text-night-text'}`}>
                            {item.title}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-[11px] text-paper-muted dark:text-night-muted font-mono">
                          ~{item.estimatedMinutes} mins
                        </span>

                        <button
                          onClick={() => onSelectSubject(item.subjectId)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-paper-border dark:border-night-border hover:border-emerald-500 text-paper-ink dark:text-night-text btn-tactile"
                        >
                          Study Topic
                        </button>
                      </div>
                    </div>
                  );
                })}

                {dayPlan.topics.length === 0 && (
                  <div className="text-center py-6 text-xs text-paper-muted dark:text-night-muted italic">
                    No topics scheduled for this day. Click "Redistribute Plan" if you want to balance your schedule.
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
