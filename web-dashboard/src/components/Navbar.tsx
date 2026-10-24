import React, { useRef } from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  FileUp, 
  FileText, 
  Download, 
  Upload, 
  CheckCircle2, 
  Laptop, 
  ChevronDown,
  BookOpen,
  Chrome
} from 'lucide-react';
import { SubjectMeta, SubjectId, PYQQuestion } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { exportJsonSnapshot, importJsonSnapshot } from '../utils/syncBridge';

interface NavbarProps {
  subjects: SubjectMeta[];
  activeSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
  questions: PYQQuestion[];
  onImportQuestions: (imported: PYQQuestion[]) => void;
  onOpenPdfParser: () => void;
  onOpenCheatSheet: () => void;
  onOpenExtensionInstaller: () => void;
  isExtensionSynced: boolean;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  subjects,
  activeSubjectId,
  onSelectSubject,
  questions,
  onImportQuestions,
  onOpenPdfParser,
  onOpenCheatSheet,
  onOpenExtensionInstaller,
  isExtensionSynced,
  onShowToast
}) => {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  const handleExport = () => {
    exportJsonSnapshot(questions, activeSubjectId);
    onShowToast(`Exported ${questions.length} questions as JSON snapshot!`, 'success');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importJsonSnapshot(file);
      onImportQuestions(imported);
      onShowToast(`Successfully imported ${imported.length} questions!`, 'success');
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to import JSON snapshot', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-solar-border dark:border-obsidian-border bg-white/80 dark:bg-[#090D16]/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:via-cyan-300 dark:to-indigo-300 bg-clip-text text-transparent">
                PyqRanker
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                MV3 Companion
              </span>
            </div>
            <p className="text-xs text-solar-muted dark:text-obsidian-muted hidden md:block">
              Smart University PYQ Matcher & In-Page Recall
            </p>
          </div>
        </div>

        {/* Center: Subject Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card hover:border-indigo-500 transition-all cursor-pointer shadow-sm">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <div className="text-left">
                <div className="text-[10px] text-solar-muted dark:text-obsidian-muted font-mono leading-none">
                  {activeSubject.code}
                </div>
                <div className="text-sm font-semibold text-solar-text dark:text-obsidian-text leading-tight">
                  {activeSubject.name}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-solar-muted dark:text-obsidian-muted ml-1" />
            </div>

            <div className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card shadow-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-solar-muted dark:text-obsidian-muted border-b border-solar-border dark:border-obsidian-border">
                Select Active Subject
              </div>
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => onSelectSubject(s.id)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-sm transition-colors ${
                    s.id === activeSubjectId 
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' 
                      : 'text-solar-text dark:text-obsidian-text hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-[11px] text-solar-muted dark:text-obsidian-muted">{s.code} • {s.semester}</div>
                  </div>
                  {s.id === activeSubjectId && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Get Browser Extension Button */}
          <button
            onClick={onOpenExtensionInstaller}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Chrome className="w-4 h-4" />
            <span className="hidden sm:inline">Get Extension</span>
          </button>

          {/* Extension Status Indicator */}
          <div 
            title={isExtensionSynced ? 'Manifest V3 Extension Connected & Syncing' : 'Extension ready. Click Get Extension to install'}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-solar-border dark:border-obsidian-border bg-slate-50 dark:bg-slate-900 text-solar-muted dark:text-obsidian-muted cursor-pointer"
            onClick={onOpenExtensionInstaller}
          >
            <span className={`w-2 h-2 rounded-full ${isExtensionSynced ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
            <span>{isExtensionSynced ? 'Extension Synced' : 'MV3 Extension Ready'}</span>
          </div>

          {/* PDF Upload Button */}
          <button
            onClick={onOpenPdfParser}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all shadow-indigo-500/20 active:scale-95"
          >
            <FileUp className="w-4 h-4" />
            <span className="hidden sm:inline">Parse Paper</span>
          </button>

          {/* Cheat Sheet Button */}
          <button
            onClick={onOpenCheatSheet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card text-solar-text dark:text-obsidian-text hover:border-indigo-500 transition-all active:scale-95 shadow-sm"
          >
            <FileText className="w-4 h-4 text-purple-500" />
            <span className="hidden md:inline">Cheat Sheet</span>
          </button>

          {/* Snapshot Export / Import */}
          <div className="hidden sm:flex items-center gap-1 border-l border-solar-border dark:border-obsidian-border pl-2">
            <button
              onClick={handleExport}
              title="Export JSON Snapshot"
              className="p-2 rounded-xl text-solar-muted dark:text-obsidian-muted hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import JSON Snapshot"
              className="p-2 rounded-xl text-solar-muted dark:text-obsidian-muted hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          {/* Theme Toggle (Solar Paper / Obsidian Focus) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Day / Night mode"
            className="p-2 rounded-xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card text-solar-text dark:text-obsidian-text hover:border-indigo-500 transition-all shadow-sm active:scale-95"
            title={theme === 'dark' ? 'Switch to Solar Paper (Day Mode)' : 'Switch to Obsidian Focus (Night Mode)'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
