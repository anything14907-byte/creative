import React from 'react';
import { SubjectMeta } from '../types';
import { getExamUrgencyColor } from '../utils/storageService';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, Clock, Sun, Moon, Plus, Download, RotateCcw, 
  Layers, BookOpen 
} from 'lucide-react';

export type MainNavView = 'overview' | 'workspace';

interface NavbarProps {
  currentView: MainNavView;
  onSelectView: (view: MainNavView) => void;
  subjects: SubjectMeta[];
  activeSubjectId: string;
  onOpenAddSubject: () => void;
  onOpenExtensionModal: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  subjects,
  activeSubjectId,
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

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

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

        {/* Center: Simplified Clean Navigation */}
        <nav className="flex items-center gap-2">
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

          {activeSubject && (
            <button
              onClick={() => onSelectView('workspace')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile ${
                currentView === 'workspace'
                  ? 'bg-emerald-600 text-white shadow-glow-emerald dark:bg-emerald-500 dark:text-night-bg'
                  : 'text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{activeSubject.name}</span>
            </button>
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
