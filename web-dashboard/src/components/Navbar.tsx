import React from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  BookOpen, 
  Search, 
  FileText, 
  Chrome,
  Download,
  Upload
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { PYQQuestion, SubjectId } from '../types';
import { exportJsonSnapshot, importJsonSnapshot } from '../utils/syncBridge';

export type AppMode = 'study' | 'scanner' | 'cheat';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenExtensionInstaller: () => void;
  questions: PYQQuestion[];
  activeSubjectId: SubjectId;
  onImportQuestions: (questions: PYQQuestion[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  onOpenExtensionInstaller,
  questions,
  activeSubjectId,
  onImportQuestions,
  onShowToast
}) => {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportJsonSnapshot(questions, activeSubjectId);
    onShowToast(`Exported ${questions.length} questions backup!`, 'success');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importJsonSnapshot(file);
      onImportQuestions(imported);
      onShowToast(`Imported ${imported.length} questions successfully!`, 'success');
    } catch (err: any) {
      onShowToast('Could not import backup file', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-day-border dark:border-cyber-border bg-white/85 dark:bg-[#06090E]/85 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#00E599]/15 dark:bg-[#00E599]/20 border border-[#00E599]/40 flex items-center justify-center text-[#00E599] shadow-glow-emerald">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-[#00E599]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-day-text dark:text-white">
                Pyq<span className="text-emerald-600 dark:text-[#00E599]">Ranker</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[#00E599] border border-emerald-500/20">
                AI Companion
              </span>
            </div>
          </div>
        </div>

        {/* 3 Simple Modes Selector (Center) */}
        <nav className="flex items-center p-1 rounded-2xl border border-day-border dark:border-cyber-border bg-slate-100/80 dark:bg-[#0F1722]/90 backdrop-blur-md">
          <button
            onClick={() => onSelectMode('study')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentMode === 'study'
                ? 'bg-emerald-600 text-white dark:bg-[#00E599] dark:text-[#06090E] shadow-sm'
                : 'text-day-muted dark:text-cyber-muted hover:text-day-text dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Study Top Questions</span>
          </button>

          <button
            onClick={() => onSelectMode('scanner')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentMode === 'scanner'
                ? 'bg-emerald-600 text-white dark:bg-[#00E599] dark:text-[#06090E] shadow-sm'
                : 'text-day-muted dark:text-cyber-muted hover:text-day-text dark:hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>2. Scanner & PDF</span>
          </button>

          <button
            onClick={() => onSelectMode('cheat')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentMode === 'cheat'
                ? 'bg-emerald-600 text-white dark:bg-[#00E599] dark:text-[#06090E] shadow-sm'
                : 'text-day-muted dark:text-cyber-muted hover:text-day-text dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Cheat Sheet</span>
          </button>
        </nav>

        {/* Right Actions: Get Extension, Day/Night Toggle, Backup */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
          {/* Get Browser Extension Button */}
          <button
            onClick={onOpenExtensionInstaller}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00E599]/15 dark:bg-[#00E599]/20 hover:bg-[#00E599]/25 text-emerald-800 dark:text-[#00E599] border border-[#00E599]/40 shadow-sm transition-all active:scale-95"
          >
            <Chrome className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get Extension</span>
          </button>

          {/* Backup Tools */}
          <div className="hidden md:flex items-center gap-1 border-l border-day-border dark:border-cyber-border pl-2">
            <button
              onClick={handleExport}
              title="Save Backup"
              className="p-1.5 rounded-lg text-day-muted dark:text-cyber-muted hover:text-day-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restore Backup"
              className="p-1.5 rounded-lg text-day-muted dark:text-cyber-muted hover:text-day-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </div>

          {/* Day / Night Mode Pill Switch */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-day-border dark:border-cyber-border bg-white dark:bg-[#0F1722] text-xs font-semibold text-day-text dark:text-white shadow-sm hover:border-[#00E599] transition-all"
            title={theme === 'dark' ? 'Switch to Daylight Alabaster' : 'Switch to Obsidian Titanium'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline text-[11px] font-medium text-cyber-muted">Day</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline text-[11px] font-medium text-day-muted">Night</span>
              </>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
