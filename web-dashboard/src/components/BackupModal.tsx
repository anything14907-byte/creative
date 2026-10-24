import React, { useRef } from 'react';
import { storageService } from '../utils/storageService';
import { 
  Download, 
  Upload, 
  X, 
  ShieldCheck, 
  Database, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataReloaded,
  onShowToast
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const subjects = storageService.getSubjects();
  const topics = storageService.getTopics();
  const questions = storageService.getQuestions();
  const tasks = storageService.getTasks();
  const flashcards = storageService.getFlashcards();
  const videos = storageService.getVideos();
  const pomodoro = storageService.getPomodoroLogs();

  const handleExport = () => {
    storageService.exportBackup();
    onShowToast('Backup JSON exported successfully! 📦', 'success');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = storageService.importBackup(content);
      if (result.success) {
        onDataReloaded();
        onShowToast(result.message, 'success');
        onClose();
      } else {
        onShowToast(result.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-slide-up">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-2xl relative space-y-5">
        
        {/* Header */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-paper-ink dark:text-night-text">
              Data Backup & Restore (JSON)
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted">
              Never lose your college subjects, exam countdowns, or flashcards.
            </p>
          </div>
        </div>

        {/* Current Storage Stats */}
        <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border space-y-2">
          <div className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Currently Saved in Your Browser:</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
            <div className="p-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border">
              <div className="font-bold text-emerald-600 dark:text-emerald-400">{subjects.length}</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Subjects</div>
            </div>

            <div className="p-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border">
              <div className="font-bold text-cyan-600 dark:text-cyan-400">{topics.length}</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Topics</div>
            </div>

            <div className="p-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border">
              <div className="font-bold text-amber-600 dark:text-amber-400">{questions.length}</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">PYQs</div>
            </div>

            <div className="p-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border">
              <div className="font-bold text-rose-600 dark:text-rose-400">{flashcards.length}</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Cards</div>
            </div>

            <div className="p-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border">
              <div className="font-bold text-emerald-600 dark:text-emerald-400">{pomodoro.length}</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Sessions</div>
            </div>

            <div className="p-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border">
              <div className="font-bold text-cyan-600 dark:text-cyan-400">{videos.length}</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Videos</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export JSON Button */}
          <button
            onClick={handleExport}
            className="p-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex flex-col items-center justify-center gap-1.5 btn-tactile shadow-sm text-center"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs font-bold">Export Backup (JSON)</span>
            <span className="text-[10px] opacity-80">Downloads your full dataset file</span>
          </button>

          {/* Import JSON Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-2xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated hover:border-emerald-500 text-paper-ink dark:text-night-text flex flex-col items-center justify-center gap-1.5 btn-tactile shadow-xs text-center"
          >
            <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold">Import Backup (JSON)</span>
            <span className="text-[10px] text-paper-muted dark:text-night-muted">Restores data from a backup file</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".json,application/json" 
            className="hidden" 
          />
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-paper-muted dark:text-night-muted flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            Everything is automatically preserved in your browser's <code>localStorage</code>. Use Export JSON if you plan to switch laptops or clear browser cache!
          </span>
        </div>

      </div>
    </div>
  );
};
