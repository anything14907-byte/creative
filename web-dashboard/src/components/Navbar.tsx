import React from 'react';
import { SubjectMeta } from '../types';
import { calculateCountdown } from '../utils/storageService';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, Clock, Sun, Moon, Plus, Download, RotateCcw, 
  Layers, Compass, Printer, Flame 
} from 'lucide-react';

export type MainNavView = 'overview' | 'workspace' | 'scanner' | 'cheatsheet';

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

  // Find closest upcoming exam for the navbar ticker
  const nearestCountdown = React.useMemo(() => {
    let nearest: { subject: SubjectMeta; text: string } | null = null;
    let minSeconds = Infinity;

    for (const sub of subjects) {
      const cd = calculateCountdown(sub.examDate);
      if (cd.totalSeconds > 0 && cd.totalSeconds < minSeconds) {
        minSeconds = cd.totalSeconds;
        nearest = { subject: sub, text: `${sub.code}: ${cd.days}d ${cd.hours}h ${cd.minutes}m` };
      }
    }
    return nearest;
  }, [subjects]);

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0A0F24]/80 dark:bg-[#0A0F24]/80 border-b border-white/10 print:hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Ticker */}
        <div className="flex items-center gap-4 shrink-0">
          <div 
            onClick={() => onSelectView('overview')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 p-0.5 shadow-neon-cyan group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0A0F24] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Pyq<span className="text-cyan-400">Ranker</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-bold">
                  HUD 2.0
                </span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                Exam Command Center & Study Hub
              </div>
            </div>
          </div>

          {/* Next Exam Mini Ticker in Navbar */}
          {nearestCountdown && (
            <div 
              onClick={() => onSelectView('overview')}
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-400 cursor-pointer text-xs transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-slate-400 font-medium">Nearest Exam:</span>
              <span className="font-mono font-bold text-cyan-300">
                {nearestCountdown.text}
              </span>
            </div>
          )}
        </div>

        {/* Center: Main Navigation Modes */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          <button
            onClick={() => onSelectView('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentView === 'overview'
                ? 'bg-cyan-500 text-black shadow-neon-cyan'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1.</span> Command Center
          </button>

          <button
            onClick={() => onSelectView('workspace')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentView === 'workspace'
                ? 'bg-cyan-500 text-black shadow-neon-cyan'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2.</span> {activeSubject ? activeSubject.code : 'Subject'} Hub
          </button>

          <button
            onClick={() => onSelectView('scanner')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentView === 'scanner'
                ? 'bg-cyan-500 text-black shadow-neon-cyan'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3.</span> Topic Scanner
          </button>

          <button
            onClick={() => onSelectView('cheatsheet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentView === 'cheatsheet'
                ? 'bg-cyan-500 text-black shadow-neon-cyan'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">4.</span> Cheat Sheet
          </button>
        </nav>

        {/* Right Actions: Add Subject, Extension, Reset, Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          
          <button
            onClick={onOpenAddSubject}
            className="hidden md:flex px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Subject</span>
          </button>

          <button
            onClick={onOpenExtensionModal}
            className="hidden sm:flex px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/20 transition-colors items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Browser Extension</span>
          </button>

          <button
            onClick={onResetData}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors"
            title="Reset to pristine university demo data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Futuristic Day / Night Pill Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Holographic Pearl Day' : 'Aurora HUD Night'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
