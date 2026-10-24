import React, { useState } from 'react';
import { SubjectMeta } from '../types';
import { getExamUrgencyColor, sortSubjectsByExamUrgency } from '../utils/storageService';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Database, 
  ChevronDown, 
  BookOpen, 
  Layers,
  ArrowLeft
} from 'lucide-react';

export type MainNavView = 'dashboard' | 'subject';

interface NavbarProps {
  currentView: MainNavView;
  onSelectView: (view: MainNavView) => void;
  subjects: SubjectMeta[];
  activeSubjectId: string;
  onSelectSubject?: (id: string) => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  subjects,
  activeSubjectId,
  onSelectSubject,
  onOpenBackup
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const sortedSubjects = React.useMemo(() => sortSubjectsByExamUrgency(subjects), [subjects]);
  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  const handleSelectFromSwitcher = (id: string) => {
    setIsSwitcherOpen(false);
    if (onSelectSubject) {
      onSelectSubject(id);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper-card/95 dark:bg-night-card/95 border-b border-paper-border dark:border-night-border shadow-sm print:hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => onSelectView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="Go to Subjects Dashboard"
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
              <div className="text-[10px] text-paper-muted dark:text-night-muted font-medium hidden sm:block">
                College Exam Study Hub
              </div>
            </div>
          </div>
        </div>

        {/* Center: Navigation Links & Subject Quick Switcher */}
        <nav className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile whitespace-nowrap transition-all ${
              currentView === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-glow-emerald dark:bg-emerald-500 dark:text-night-bg'
                : 'text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* Subject Switcher Button with Dropdown Popover */}
          {activeSubject && currentView === 'subject' && (
            <div className="relative shrink-0">
              <button
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 btn-tactile bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: activeSubject.accentColor }} 
                />
                <span className="max-w-[120px] truncate">{activeSubject.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isSwitcherOpen && (
                <div className="absolute left-0 sm:right-0 mt-2 w-72 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-2xl p-2 z-50 animate-fade-slide-up space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted border-b border-paper-border dark:border-night-border flex items-center justify-between">
                    <span>Switch Subject</span>
                    <span>{sortedSubjects.length} Total</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1 py-1">
                    {sortedSubjects.map(sub => {
                      const u = getExamUrgencyColor(sub.examDate);
                      const isSelected = sub.id === activeSubject.id;
                      return (
                        <div
                          key={sub.id}
                          onClick={() => handleSelectFromSwitcher(sub.id)}
                          className={`p-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                              : 'hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated text-paper-ink dark:text-night-text'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: sub.accentColor }} 
                            />
                            <span className="text-xs truncate">{sub.name}</span>
                          </div>

                          <span 
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
                            style={{ 
                              color: u.hslColor,
                              backgroundColor: `${u.hslColor}16`
                            }}
                          >
                            {u.days}d left
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

        {/* Right Actions: Backup (JSON) & Theme Toggle (NO + Add Subject here!) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Backup Button */}
          <button
            onClick={onOpenBackup}
            className="p-2 rounded-xl border border-paper-border dark:border-night-border text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated transition-colors btn-tactile flex items-center gap-1.5"
            title="Backup & Restore (JSON)"
          >
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold hidden sm:inline">Backup</span>
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
