import React, { useState } from 'react';
import { SubjectMeta, PYQQuestion, StudyTask, CountdownTime } from '../types';
import { calculateCountdown } from '../utils/storageService';
import { EditExamDateModal } from './EditExamDateModal';
import { 
  Clock, Flame, Plus, Sparkles, ArrowRight, BookOpen, AlertTriangle, 
  CheckCircle2, Cpu, Database, Network, Code, Layers 
} from 'lucide-react';

interface CommandCenterOverviewProps {
  subjects: SubjectMeta[];
  questions: PYQQuestion[];
  tasks: StudyTask[];
  onSelectSubject: (id: string) => void;
  onOpenAddSubject: () => void;
  onUpdateSubject: (subject: SubjectMeta) => void;
}

export const CommandCenterOverview: React.FC<CommandCenterOverviewProps> = ({
  subjects,
  questions,
  tasks,
  onSelectSubject,
  onOpenAddSubject,
  onUpdateSubject
}) => {
  // Modal state for editing date from an individual card
  const [editingDateSubject, setEditingDateSubject] = useState<SubjectMeta | null>(null);

  // Find the nearest upcoming subject exam
  const nearestSubjectWithCountdown = React.useMemo(() => {
    let nearest: { subject: SubjectMeta; countdown: CountdownTime } | null = null;
    let minSeconds = Infinity;

    for (const sub of subjects) {
      const cd = calculateCountdown(sub.examDate);
      if (cd.totalSeconds > 0 && cd.totalSeconds < minSeconds) {
        minSeconds = cd.totalSeconds;
        nearest = { subject: sub, countdown: cd };
      }
    }
    // Fallback if all passed or none set
    if (!nearest && subjects.length > 0) {
      nearest = { subject: subjects[0], countdown: calculateCountdown(subjects[0].examDate) };
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
    <div className="space-y-8">
      
      {/* =========================================================================
          1. GLOBAL "NEXT UPCOMING EXAM" HERO COUNTDOWN HUD BANNER
          ========================================================================= */}
      {nearestSubjectWithCountdown && (
        <div 
          className="p-6 sm:p-8 rounded-3xl hud-glass-panel relative overflow-hidden border"
          style={{ 
            borderColor: `${nearestSubjectWithCountdown.subject.accentColor}55`,
            boxShadow: `0 0 40px -10px ${nearestSubjectWithCountdown.subject.accentColor}33`
          }}
        >
          {/* Subtle Ambient Glow */}
          <div 
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ backgroundColor: nearestSubjectWithCountdown.subject.accentColor }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Next Exam Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  Next Priority Exam Alert
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {nearestSubjectWithCountdown.subject.code} • {nearestSubjectWithCountdown.subject.semester}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {nearestSubjectWithCountdown.subject.name}
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Scheduled for {new Date(nearestSubjectWithCountdown.subject.examDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.
              </p>
            </div>

            {/* Right: Live Ticking Countdown HUD & Quick Jump Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              
              {/* Ticking Clock HUD Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md shadow-2xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Live Ticking Timer
                </div>
                
                <div 
                  className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight countdown-digit"
                  style={{ color: nearestSubjectWithCountdown.subject.accentColor }}
                >
                  <span className="px-1.5 py-1 rounded-md bg-white/5">{nearestSubjectWithCountdown.countdown.days}d</span> :{' '}
                  <span className="px-1.5 py-1 rounded-md bg-white/5">{nearestSubjectWithCountdown.countdown.hours}h</span> :{' '}
                  <span className="px-1.5 py-1 rounded-md bg-white/5">{nearestSubjectWithCountdown.countdown.minutes}m</span> :{' '}
                  <span className="px-1.5 py-1 rounded-md bg-white/5">{nearestSubjectWithCountdown.countdown.seconds}s</span>
                </div>

                <div className="mt-2 text-right">
                  {nearestSubjectWithCountdown.countdown.urgency === 'critical' && (
                    <span className="text-[11px] font-bold text-rose-400">🚨 CRITICAL (&lt; 3 DAYS LEFT)</span>
                  )}
                  {nearestSubjectWithCountdown.countdown.urgency === 'high' && (
                    <span className="text-[11px] font-bold text-amber-400">⚡ HIGH PRIORITY (&lt; 7 DAYS LEFT)</span>
                  )}
                  {nearestSubjectWithCountdown.countdown.urgency === 'normal' && (
                    <span className="text-[11px] font-bold text-emerald-400">🟢 ON TRACK (&gt; 7 DAYS LEFT)</span>
                  )}
                </div>
              </div>

              {/* Jump Straight into Subject */}
              <button
                onClick={() => onSelectSubject(nearestSubjectWithCountdown.subject.id)}
                className="px-6 py-4 rounded-2xl text-black font-extrabold text-sm flex items-center gap-2 shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: nearestSubjectWithCountdown.subject.accentColor,
                  boxShadow: `0 0 25px -4px ${nearestSubjectWithCountdown.subject.accentColor}`
                }}
              >
                <span>Jump Straight into {nearestSubjectWithCountdown.subject.code}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          2. SUBJECTS GRID: LIVE COUNTDOWN, MASTERY RING & STUDY COACH SUMMARY
          ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-extrabold text-white dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Your Active Exam Command Tracks ({subjects.length} Subjects)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any subject to open its deep concept explainer, YouTube video vault, PDF summaries, and PYQ bank.
            </p>
          </div>

          <button
            onClick={onOpenAddSubject}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300 flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Add New Subject
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {subjects.map(subject => {
            const countdown = calculateCountdown(subject.examDate);
            const subQuestions = questions.filter(q => q.subjectId === subject.id);
            const masteredCount = subQuestions.filter(q => q.userStatus === 'mastered').length;
            const masteryPercent = subQuestions.length > 0 
              ? Math.round((masteredCount / subQuestions.length) * 100) 
              : 0;

            const subTasks = tasks.filter(t => t.subjectId === subject.id);
            const pendingTasks = subTasks.filter(t => !t.completed).length;

            return (
              <div
                key={subject.id}
                className="p-5 rounded-2xl hud-glass-panel border transition-all duration-300 flex flex-col justify-between group hover:border-cyan-400 relative"
                style={{ borderColor: `${subject.accentColor}35` }}
              >
                <div>
                  
                  {/* Card Top: Icon, Code & Editable Clock */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ 
                        backgroundColor: `${subject.accentColor}25`, 
                        color: subject.accentColor,
                        boxShadow: `0 0 15px -3px ${subject.accentColor}40`
                      }}
                    >
                      {getSubjectIcon(subject.iconName)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                        {subject.code}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDateSubject(subject);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                        title="Edit Target Exam Date & Time"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Units */}
                  <h4 
                    onClick={() => onSelectSubject(subject.id)}
                    className="text-base font-bold text-white group-hover:text-cyan-300 cursor-pointer transition-colors"
                  >
                    {subject.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-4">
                    {subject.units.length} Syllabus Units • {subQuestions.length} High-Yield PYQs
                  </p>

                  {/* Per-Subject Live Countdown Box */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDateSubject(subject);
                    }}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:border-cyan-400/50 transition-colors mb-4"
                  >
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-1">
                      <span>Countdown to Exam:</span>
                      <span className="text-cyan-400 text-[10px]">Edit ⏰</span>
                    </div>

                    <div 
                      className="text-base font-extrabold font-mono countdown-digit"
                      style={{ color: subject.accentColor }}
                    >
                      {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
                    </div>

                    <div className="text-[10px] mt-1 font-semibold">
                      {countdown.urgency === 'critical' && (
                        <span className="text-rose-400">🚨 Crunch Mode (&lt; 3d left)</span>
                      )}
                      {countdown.urgency === 'high' && (
                        <span className="text-amber-400">⚡ Practice Mode (3–7d left)</span>
                      )}
                      {countdown.urgency === 'normal' && (
                        <span className="text-emerald-400">🟢 Deep Learning (&gt; 7d left)</span>
                      )}
                      {countdown.urgency === 'passed' && (
                        <span className="text-slate-400">🏁 Completed / Today</span>
                      )}
                    </div>
                  </div>

                  {/* Mastery Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                      <span>Mastery Progress</span>
                      <span className="font-mono">{masteredCount}/{subQuestions.length} ({masteryPercent}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${masteryPercent}%`,
                          backgroundColor: subject.accentColor 
                        }}
                      />
                    </div>
                  </div>

                </div>

                {/* Card Action Button */}
                <button
                  onClick={() => onSelectSubject(subject.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-black hover:opacity-95"
                  style={{ backgroundColor: subject.accentColor }}
                >
                  <span>Open Study Command Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            );
          })}

          {/* Add Subject Card placeholder */}
          <div
            onClick={onOpenAddSubject}
            className="p-6 rounded-2xl border border-dashed border-white/20 hover:border-cyan-400 bg-white/5 hover:bg-white/10 cursor-pointer transition-all flex flex-col items-center justify-center text-center group min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">+ Add Custom Subject</h4>
            <p className="text-xs text-slate-400 max-w-[200px]">
              Set custom exam dates, syllabus units, and custom PYQ banks for any course.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Date Modal for quick card clock trigger */}
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

    </div>
  );
};
