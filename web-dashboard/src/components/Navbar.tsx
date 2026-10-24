import React, { useState } from 'react';
import { SubjectMeta } from '../types';
import { getExamUrgencyColor, sortSubjectsByExamUrgency } from '../utils/storageService';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, Clock, Sun, Moon, Plus, Download, RotateCcw, 
  Layers, BookOpen, ChevronDown 
} from 'lucide-react';

export type MainNavView = 'overview' | 'workspace';

interface NavbarProps {
  currentView: MainNavView;
  onSelectView: (view: MainNavView) => void;
  subjects: SubjectMeta[];
  activeSubjectId: string;
  onSelectSubject?: (id: string) => void;
  onOpenAddSubject: () => void;
  onOpenExtensionModal: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  subjects,
  activeSubjectId,
  onSelectSubject,
  onOpenAddSubject,
  onOpenExtensionModal,
  onResetData
}) => {
  const { theme, toggleTheme } = useTheme();

  // Find the nearest upcoming exam for the navbar ticker
  const nearestCountdown = React.useMemo(() => {
    let nearest: { subject: SubjectMeta; urgency: ReturnType<typeof getExamUrgencyColor> } | null = null;
    let minDiff = Infinity;

    for (const sub of subjects) {
      const u = getExamUrgencyColor(sub.examDate);
      if (u.fractionalDays > 0 && u.fractionalDays < minDiff) {
        minDiff = u.fractionalDays;
        nearest = { subject: sub, urgency: u };
      }
    }
    return nearest;
  }, [subjects]);

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const sortedSubjects = React.useMemo(() => sortSubjectsByExamUrgency(subjects), [subjects]);
  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  const handleSelectFromSwitcher = (id: string) => {
    setIsSwitcherOpen(false);
    if (onSelectSubject) {
      onSelectSubject(id);
    } else {
      onSelectView('workspace');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper-card/95 dark:bg-night-card/95 border-b border-paper-border dark:border-night-border shadow-sm print:hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Ticker */}
        <div className="flex items-center gap-4 shrink-0">
          <div 
            onClick={() => onSelectView('overview')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-paper-card dark:bg-night-bg rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="text-base font-extrabold text-paper-ink dark:text-night-text tracking-tight flex items-center gap-1.5">
                Pyq<span className="text-emerald-600 dark:text-emerald-400">Ranker</span>
              </div>
              <div className="text-[11px] text-paper-muted dark:text-night-muted font-medium hidden sm:block">
                Exam Command Center
              </div>
            </div>
          </div>

          {/* Next Exam Mini Ticker in Navbar with Dynamic Color */}
          {nearestCountdown && (
            <div 
              onClick={() => onSelectView('overview')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:border-emerald-500 cursor-pointer text-xs transition-colors shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 animate-pulse" style={{ color: nearestCountdown.urgency.hslColor }} />
              <span className="text-paper-muted dark:text-night-muted font-medium">Next Exam:</span>
              <strong className="text-paper-ink dark:text-night-text font-bold">
                {nearestCountdown.subject.name}
              </strong>
              <span 
                className="font-mono font-bold px-2 py-0.5 rounded-md text-[11px]"
                style={{ 
                  color: nearestCountdown.urgency.hslColor,
                  backgroundColor: `${nearestCountdown.urgency.hslColor}18`
                }}
              >
                {nearestCountdown.urgency.days}d {nearestCountdown.urgency.hours}h {nearestCountdown.urgency.minutes}m
              </span>
            </div>
          )}
        </div>

        {/* Center: Simplified Navigation with Sorted Subject Switcher */}
        <nav className="flex items-center gap-2 relative">
          <button
            onClick={() => onSelectView('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile ${
              currentView === 'overview'
                ? 'bg-emerald-600 text-white shadow-glow-emerald dark:bg-emerald-500 dark:text-night-bg'
                : 'text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Subjects</span>
          </button>

          {/* Subject Switcher Button with Dropdown Popover */}
          {activeSubject && (
            <div className="relative">
              <button
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile ${
                  currentView === 'workspace'
                    ? 'bg-emerald-600 text-white shadow-glow-emerald dark:bg-emerald-500 dark:text-night-bg'
                    : 'text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: activeSubject.accentColor }} 
                />
                <span className="max-w-[130px] sm:max-w-[180px] truncate">{activeSubject.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu listing subjects sorted chronologically by time remaining */}
              {isSwitcherOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-2xl p-2 z-50 animate-fade-slide-up space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted border-b border-paper-border dark:border-night-border flex items-center justify-between">
                    <span>Priority Ranked Subjects</span>
                    <span>{sortedSubjects.length} Total</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1 pt-1">
                    {sortedSubjects.map((sub, idx) => {
                      const u = getExamUrgencyColor(sub.examDate);
                      const isCurrent = sub.id === activeSubjectId;
                      let badge = `Priority #${idx + 1}`;
                      if (u.fractionalDays <= 0) badge = 'Completed';
                      else if (idx === 0) badge = '🚨 #1 Closest';

                      return (
                        <div
                          key={sub.id}
                          onClick={() => handleSelectFromSwitcher(sub.id)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 btn-tactile ${
                            isCurrent 
                              ? 'bg-emerald-500/15 border border-emerald-500/30' 
                              : 'hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: sub.accentColor }} 
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-paper-ink dark:text-night-text truncate">
                                {sub.name}
                              </div>
                              <div className="text-[10px] text-paper-muted dark:text-night-muted">
                                {badge} • {sub.units.length} Units
                              </div>
                            </div>
                          </div>

                          <span 
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
                            style={{ 
                              color: u.hslColor,
                              backgroundColor: `${u.hslColor}16`
                            }}
                          >
                            {u.days}d {u.hours}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right Actions: + Add Subject, Extension, Reset, Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          
          <button
            onClick={onOpenAddSubject}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg dark:hover:bg-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-sm btn-tactile btn-shimmer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subject</span>
          </button>

          <button
            onClick={onOpenExtensionModal}
            className="hidden sm:flex px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors items-center gap-1.5 btn-tactile"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Browser Extension</span>
          </button>

          <button
            onClick={onResetData}
            className="p-2 rounded-xl text-paper-muted hover:text-amber-600 dark:text-night-muted dark:hover:text-amber-400 hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated transition-colors btn-tactile"
            title="Reset to default study data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Eye-Comfort Day / Night Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated transition-colors btn-tactile"
            title={`Switch to ${theme === 'dark' ? 'Warm Paper Day' : 'Deep Ocean Night'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
