import React, { useState, useEffect, useRef } from 'react';
import { SubjectMeta, PomodoroSession } from '../types';
import { storageService } from '../utils/storageService';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Coffee, 
  TrendingUp, 
  Calendar, 
  Trash2, 
  Sparkles,
  Award,
  Clock
} from 'lucide-react';

interface FocusTimerViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: string;
  pomodoroLogs: PomodoroSession[];
  onLogSession: (subjectId: string, minutes: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  subjects,
  activeSubjectId,
  pomodoroLogs,
  onLogSession,
  onShowToast
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || subjects[0]?.id || 'os');
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  // Set mode duration
  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'focus') setSecondsLeft(25 * 60);
    else if (newMode === 'shortBreak') setSecondsLeft(5 * 60);
    else setSecondsLeft(15 * 60);
  };

  // Timer interval
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, selectedSubjectId]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'focus') {
      const minutes = 25;
      onLogSession(selectedSubjectId, minutes);
      setSessionCount(c => c + 1);
      onShowToast(`🎉 Awesome focus session! Logged 25 mins for ${selectedSubject?.name || 'Subject'}. Take a 5-min break!`, 'success');
      switchMode('shortBreak');
    } else {
      onShowToast('Break finished! Ready for the next focus session?', 'info');
      switchMode('focus');
    }
  };

  const handleManualComplete = () => {
    const elapsedMinutes = Math.max(1, Math.round((25 * 60 - secondsLeft) / 60));
    onLogSession(selectedSubjectId, elapsedMinutes);
    onShowToast(`Logged ${elapsedMinutes} focus minutes!`, 'success');
    switchMode('focus');
  };

  // Format MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Weekly Stats calculation
  const weeklyStats = React.useMemo(() => {
    return storageService.getWeeklyPomodoroStats();
  }, [pomodoroLogs]);

  const maxMinutesInWeek = Math.max(...weeklyStats.map(s => s.minutes), 60);

  // Today & Week Totals
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutes = pomodoroLogs
    .filter(l => l.date === todayStr)
    .reduce((sum, l) => sum + (Number(l.minutes) || 0), 0);

  const totalWeekMinutes = weeklyStats.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="space-y-8 animate-fade-slide-up max-w-4xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text flex items-center gap-2">
            <Timer className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Focus Timer (Pomodoro 25/5)</span>
          </h2>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            Timed study sessions logged per subject with weekly analytics.
          </p>
        </div>

        {/* Quick Subject Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-paper-muted dark:text-night-muted">Target Subject:</span>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500 shadow-xs"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Pomodoro Clock Card */}
      <div 
        className="p-8 sm:p-12 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card text-center space-y-6 relative overflow-hidden transition-all"
        style={{ borderTop: `6px solid ${selectedSubject?.accentColor || '#10B981'}` }}
      >
        {/* Mode Selector Buttons */}
        <div className="inline-flex p-1.5 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border gap-1.5 shadow-xs">
          <button
            onClick={() => switchMode('focus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all btn-tactile ${
              mode === 'focus' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-paper-body dark:text-night-text hover:bg-paper-card dark:hover:bg-night-card'
            }`}
          >
            🔥 Focus (25m)
          </button>

          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all btn-tactile ${
              mode === 'shortBreak' 
                ? 'bg-cyan-600 text-white shadow-xs' 
                : 'text-paper-body dark:text-night-text hover:bg-paper-card dark:hover:bg-night-card'
            }`}
          >
            ☕ Short Break (5m)
          </button>

          <button
            onClick={() => switchMode('longBreak')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all btn-tactile ${
              mode === 'longBreak' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-paper-body dark:text-night-text hover:bg-paper-card dark:hover:bg-night-card'
            }`}
          >
            🌴 Long Break (15m)
          </button>
        </div>

        {/* Selected Subject Banner */}
        <div className="flex items-center justify-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: selectedSubject?.accentColor }} 
          />
          <span className="text-sm font-bold text-paper-ink dark:text-night-text">
            Studying: {selectedSubject?.name}
          </span>
        </div>

        {/* Giant Timer Digits */}
        <div className="py-2">
          <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-paper-ink dark:text-night-text select-none countdown-digit">
            {formattedTime}
          </div>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-2">
            {mode === 'focus' ? 'Keep distractions away and master your concepts.' : 'Relax, breathe, and grab water before the next sprint.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-8 py-3.5 rounded-2xl text-base font-extrabold text-white flex items-center gap-2 btn-tactile shadow-md transition-all ${
              isActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={() => switchMode(mode)}
            className="p-3.5 rounded-2xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text btn-tactile"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isActive && (
            <button
              onClick={handleManualComplete}
              className="px-4 py-3.5 rounded-2xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:border-emerald-500 btn-tactile"
              title="End session now and log minutes"
            >
              Log Now
            </button>
          )}
        </div>
      </div>

      {/* WEEKLY STUDY MINUTES BAR CHART */}
      <div className="p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-border dark:border-night-border">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Weekly Focus Activity (Last 7 Days)</span>
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted">
              Total minutes logged through Pomodoro focus sessions.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <span className="text-paper-muted dark:text-night-muted">
              Today: <strong className="text-emerald-600 dark:text-emerald-400">{todayMinutes}m</strong>
            </span>
            <span className="text-paper-muted dark:text-night-muted">
              Week Total: <strong className="text-emerald-600 dark:text-emerald-400">{totalWeekMinutes}m</strong>
            </span>
          </div>
        </div>

        {/* Clean Bar Chart */}
        <div className="pt-4">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {weeklyStats.map((stat, idx) => {
              const heightPercent = maxMinutesInWeek > 0 
                ? Math.max(8, Math.round((stat.minutes / maxMinutesInWeek) * 100)) 
                : 8;
              const isToday = stat.date === todayStr;

              return (
                <div key={stat.date || idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip minutes badge on hover */}
                  <div className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text opacity-0 group-hover:opacity-100 transition-opacity">
                    {stat.minutes}m
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-paper-cardElevated dark:bg-night-cardElevated rounded-xl overflow-hidden p-1 flex items-end justify-center h-full">
                    <div 
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isToday 
                          ? 'bg-gradient-to-t from-emerald-600 to-cyan-500 shadow-glow-emerald' 
                          : stat.minutes > 0
                          ? 'bg-emerald-600/70 hover:bg-emerald-600'
                          : 'bg-paper-border dark:bg-night-border/40'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="text-center">
                    <div className={`text-xs font-bold ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-paper-body dark:text-night-text'}`}>
                      {stat.day}
                    </div>
                    <div className="text-[9px] text-paper-muted dark:text-night-muted font-mono">
                      {stat.minutes}m
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Recent Focus Sessions</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pomodoroLogs.slice(0, 6).map(log => (
            <div 
              key={log.id} 
              className="p-3.5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: log.accentColor || '#10B981' }} />
                <div>
                  <div className="font-bold text-paper-ink dark:text-night-text">{log.subjectName || log.subjectId}</div>
                  <div className="text-[10px] text-paper-muted dark:text-night-muted">{log.date}</div>
                </div>
              </div>

              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                +{log.minutes} mins
              </div>
            </div>
          ))}

          {pomodoroLogs.length === 0 && (
            <div className="p-6 text-center rounded-2xl bg-paper-card dark:bg-night-card border border-dashed border-paper-border dark:border-night-border text-paper-muted text-xs">
              No sessions logged yet. Complete your first 25-minute Pomodoro above!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
