import React, { useState } from 'react';
import { SubjectMeta, ExamSession } from '../types';
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
  Flame,
  Timer,
  Brain,
  Video,
  FileText,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react';

export type MainNavView = 
  | 'today' 
  | 'syllabus' 
  | 'pyqs' 
  | 'timer' 
  | 'flashcards' 
  | 'vault' 
  | 'pdf' 
  | 'overview' 
  | 'workspace';

interface NavbarProps {
  currentView: MainNavView;
  onSelectView: (view: MainNavView) => void;
  subjects: SubjectMeta[];
  activeSubjectId: string;
  onSelectSubject?: (id: string) => void;
  onOpenBackup: () => void;
  examSessions: ExamSession[];
  activeExamId: string;
  onSelectExam: (examId: string) => void;
  onAddExam: (name: string) => void;
  onRenameExam: (examId: string, newName: string) => void;
  onDeleteExam: (examId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  subjects,
  activeSubjectId,
  onSelectSubject,
  onOpenBackup,
  examSessions,
  activeExamId,
  onSelectExam,
  onAddExam,
  onRenameExam,
  onDeleteExam
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editingExamName, setEditingExamName] = useState('');

  const activeExam = examSessions.find(e => e.id === activeExamId) || examSessions[0] || { id: 'mid-sem', name: 'Mid Sem' };

  const navItems: { id: MainNavView; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'syllabus', label: 'Syllabus', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'pyqs', label: 'PYQ Ranker', icon: <Flame className="w-4 h-4" /> },
    { id: 'timer', label: 'Timer', icon: <Timer className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Brain className="w-4 h-4" /> },
    { id: 'vault', label: 'Vault', icon: <Video className="w-4 h-4" /> },
    { id: 'pdf', label: 'PDF Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'overview', label: 'All Subjects', icon: <Layers className="w-4 h-4" /> },
  ];

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim()) return;
    onAddExam(newExamName.trim());
    setNewExamName('');
    setIsCreatingExam(false);
    setIsExamDropdownOpen(false);
  };

  const handleRenameSubmit = (examId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExamName.trim()) return;
    onRenameExam(examId, editingExamName.trim());
    setEditingExamId(null);
  };

  const handleDeleteExamClick = (examId: string, name: string) => {
    if (examSessions.length <= 1) {
      alert('You must keep at least one exam.');
      return;
    }
    if (window.confirm(`Delete "${name}" and all its subjects, units and files? This cannot be undone.`)) {
      onDeleteExam(examId);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper-card/95 dark:bg-night-card/95 border-b border-paper-border dark:border-night-border shadow-sm print:hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Brand Logo + MULTIPLE EXAMS SWITCHER */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Logo */}
          <div 
            onClick={() => onSelectView('today')}
            className="flex items-center gap-2 cursor-pointer select-none group"
            title="Go to Today Screen"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-paper-card dark:bg-night-bg rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-base font-extrabold text-paper-ink dark:text-night-text tracking-tight flex items-center gap-1">
                Pyq<span className="text-emerald-600 dark:text-emerald-400">Ranker</span>
              </div>
            </div>
          </div>

          {/* REQUIREMENT 3: MULTIPLE EXAMS SWITCHER DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-2 btn-tactile transition-all"
              title="Switch Exam Session"
            >
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <span className="max-w-[110px] truncate">{activeExam.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExamDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Exam Switcher Popover */}
            {isExamDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-2xl p-3 z-50 animate-scale-up space-y-3">
                
                <div className="flex items-center justify-between pb-2 border-b border-paper-border dark:border-night-border">
                  <span className="text-xs font-bold text-paper-muted dark:text-night-muted uppercase tracking-wider">
                    Select University Exam
                  </span>
                  <button 
                    onClick={() => setIsExamDropdownOpen(false)}
                    className="text-paper-muted hover:text-paper-ink text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Exam Sessions List */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {examSessions.map(session => {
                    const isSelected = session.id === activeExam.id;
                    const isEditing = editingExamId === session.id;

                    if (isEditing) {
                      return (
                        <form
                          key={session.id}
                          onSubmit={(e) => handleRenameSubmit(session.id, e)}
                          className="flex items-center gap-1.5 p-1 bg-paper-cardElevated dark:bg-night-cardElevated rounded-xl border border-emerald-500"
                        >
                          <input
                            type="text"
                            value={editingExamName}
                            onChange={(e) => setEditingExamName(e.target.value)}
                            autoFocus
                            className="flex-1 px-2 py-1 text-xs bg-transparent text-paper-ink dark:text-night-text focus:outline-none font-bold"
                          />
                          <button type="submit" className="p-1 text-emerald-500 hover:text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => setEditingExamId(null)} className="p-1 text-paper-muted">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      );
                    }

                    return (
                      <div
                        key={session.id}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 group ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'border-paper-border dark:border-night-border hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated text-paper-ink dark:text-night-text'
                        }`}
                      >
                        <div 
                          onClick={() => {
                            onSelectExam(session.id);
                            setIsExamDropdownOpen(false);
                          }}
                          className="flex items-center gap-2 flex-1 cursor-pointer truncate"
                        >
                          <GraduationCap className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500' : 'text-paper-muted'}`} />
                          <span className="text-xs truncate">{session.name}</span>
                          {isSelected && <span className="text-[10px] text-emerald-500 font-mono">✓ Active</span>}
                        </div>

                        {/* Rename and Delete Actions */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingExamId(session.id);
                              setEditingExamName(session.name);
                            }}
                            className="p-1 rounded text-paper-muted hover:text-paper-ink dark:text-night-muted"
                            title="Rename Exam"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {examSessions.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExamClick(session.id, session.name);
                              }}
                              className="p-1 rounded text-paper-muted hover:text-red-500"
                              title="Delete Exam"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* + New Exam Form / Button */}
                {isCreatingExam ? (
                  <form onSubmit={handleCreateExamSubmit} className="pt-2 border-t border-paper-border dark:border-night-border space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. End Sem or GATE 2026..."
                      value={newExamName}
                      onChange={(e) => setNewExamName(e.target.value)}
                      autoFocus
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsCreatingExam(false)}
                        className="px-2.5 py-1 text-[11px] text-paper-muted hover:text-paper-ink"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg"
                      >
                        Add Exam
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreatingExam(true)}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Exam Session</span>
                  </button>
                )}

              </div>
            )}
          </div>

        </div>

        {/* Center: Desktop Navigation Tabs (PLANNER TAB IS REMOVED AS PER REQ 1) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto max-w-2xl py-1">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-glow-emerald dark:bg-emerald-500 dark:text-night-bg'
                    : 'text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Backup (JSON) & Theme Toggle (NO + Add Subject button here!) */}
        <div className="flex items-center gap-2 shrink-0">
          
          <button
            onClick={onOpenBackup}
            className="p-2 rounded-xl border border-paper-border dark:border-night-border text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated transition-colors btn-tactile flex items-center gap-1.5"
            title="Backup & Restore (JSON)"
          >
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold hidden sm:inline">Backup</span>
          </button>

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
