import React, { useState, useRef, useEffect } from 'react';
import { SubjectMeta, ExamSession, SyllabusTopic } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Database, 
  ChevronDown, 
  BookOpen, 
  Layers,
  Timer, 
  Brain, 
  Video, 
  FileText, 
  GraduationCap, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Search,
  ExternalLink
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { formatUnitDisplayName } from '../utils/storageService';

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
  topics?: SyllabusTopic[];
  onNavigateToTopic?: (subjectId: string, unitId: string, topicId: string) => void;
  onNavigateToSubject?: (subjectId: string) => void;
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
  onDeleteExam,
  topics = [],
  onNavigateToTopic,
  onNavigateToSubject
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editingExamName, setEditingExamName] = useState('');

  // Search Bar State (Requirement 1)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [examToDelete, setExamToDelete] = useState<{ id: string; name: string } | null>(null);

  const activeExam = examSessions.find(e => e.id === activeExamId) || examSessions[0] || { id: 'mid-sem', name: 'Mid Sem' };

  // Requirement 3: PYQ Ranker tab removed from navigation
  const navItems: { id: MainNavView; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'syllabus', label: 'Syllabus', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'timer', label: 'Timer', icon: <Timer className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Brain className="w-4 h-4" /> },
    { id: 'vault', label: 'Vault', icon: <Video className="w-4 h-4" /> },
    { id: 'pdf', label: 'PDF Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'overview', label: 'All Subjects', icon: <Layers className="w-4 h-4" /> },
  ];

  // Close search results dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results case-insensitively
  const cleanQuery = searchQuery.trim().toLowerCase();
  const isSearching = cleanQuery.length > 0;

  const matchedSubjects = isSearching
    ? subjects.filter(s => s.name.toLowerCase().includes(cleanQuery))
    : [];

  const matchedTopics = isSearching
    ? topics.filter(t => t.title.toLowerCase().includes(cleanQuery))
    : [];

  const hasResults = matchedSubjects.length > 0 || matchedTopics.length > 0;

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
    setExamToDelete({ id: examId, name });
  };

  const handleTopicClick = (topic: SyllabusTopic) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onNavigateToTopic) {
      onNavigateToTopic(topic.subjectId, topic.unitId, topic.id);
    } else {
      if (onSelectSubject) onSelectSubject(topic.subjectId);
      onSelectView('syllabus');
    }
  };

  const handleSubjectClick = (subjectId: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onNavigateToSubject) {
      onNavigateToSubject(subjectId);
    } else {
      if (onSelectSubject) onSelectSubject(subjectId);
      onSelectView('syllabus');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper-card/95 dark:bg-night-card/95 border-b border-paper-border dark:border-night-border shadow-sm print:hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Header Bar */}
        <div className="h-16 flex items-center justify-between gap-3">
          
          {/* Left: Brand Logo + MULTIPLE EXAMS SWITCHER */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
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

            {/* Exam Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 sm:gap-2 btn-tactile transition-all"
                title="Switch Exam Session"
              >
                <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="max-w-[85px] sm:max-w-[110px] truncate">{activeExam.name}</span>
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

                  {/* + New Exam Form */}
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

          {/* Center-Left: REQUIREMENT 1 - Search Bar (Desktop) */}
          <div ref={searchContainerRef} className="hidden md:block relative flex-1 max-w-xs lg:max-w-sm">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-paper-muted absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={`Search ${activeExam.name} topics & subjects...`}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text placeholder-paper-muted focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-paper-muted hover:text-paper-ink absolute right-1.5 top-1.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Search Results Dropdown */}
            {isSearchOpen && isSearching && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-2xl rounded-2xl p-2 z-50 max-h-96 overflow-y-auto animate-scale-up space-y-2">
                
                {/* Topic Results */}
                {matchedTopics.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-paper-muted dark:text-night-muted uppercase tracking-wider px-2 py-1">
                      Topics ({matchedTopics.length})
                    </div>
                    <div className="space-y-1">
                      {matchedTopics.map(topic => {
                        const sub = subjects.find(s => s.id === topic.subjectId);
                        const unit = sub?.units?.find(u => u.id === topic.unitId);
                        const unitLabel = unit ? formatUnitDisplayName(unit) : formatUnitDisplayName({ unitNumber: topic.unitNumber, unitLabel: (topic as any).unitLabel, title: (topic as any).unitTitle });

                        return (
                          <div
                            key={topic.id}
                            onClick={() => handleTopicClick(topic)}
                            className="p-2.5 rounded-xl hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated cursor-pointer transition-colors border border-transparent hover:border-emerald-500/30 flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-paper-ink dark:text-night-text line-clamp-1">
                                {topic.title}
                              </div>
                              <div className="text-[10px] text-paper-muted flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span 
                                  className="font-bold px-1.5 py-0.2 rounded font-mono"
                                  style={{ backgroundColor: `${sub?.accentColor || '#10B981'}20`, color: sub?.accentColor || '#10B981' }}
                                >
                                  {sub?.name || 'Subject'}
                                </span>
                                <span>•</span>
                                <span>{unitLabel}</span>
                              </div>
                            </div>

                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                              topic.mastery === 'weak' ? 'bg-rose-500/10 text-rose-500' :
                              topic.mastery === 'strong' ? 'bg-emerald-500/10 text-emerald-500' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {topic.mastery}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Subject Results */}
                {matchedSubjects.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-paper-muted dark:text-night-muted uppercase tracking-wider px-2 py-1">
                      Subjects ({matchedSubjects.length})
                    </div>
                    <div className="space-y-1">
                      {matchedSubjects.map(sub => (
                        <div
                          key={sub.id}
                          onClick={() => handleSubjectClick(sub.id)}
                          className="p-2.5 rounded-xl hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated cursor-pointer transition-colors border border-transparent hover:border-emerald-500/30 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.accentColor }} />
                            <span className="text-xs font-bold text-paper-ink dark:text-night-text truncate">{sub.name}</span>
                          </div>
                          <span className="text-[10px] text-paper-muted font-mono shrink-0">
                            {sub.units?.length || 0} Units →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results Found */}
                {!hasResults && (
                  <div className="py-6 px-4 text-center">
                    <Search className="w-5 h-5 text-paper-muted mx-auto mb-1.5 opacity-50" />
                    <div className="text-xs font-bold text-paper-ink dark:text-night-text">No results found</div>
                    <div className="text-[11px] text-paper-muted mt-0.5">
                      No topics or subjects match "{searchQuery}" in {activeExam.name}.
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Center-Right: Desktop Navigation Tabs (PYQ Ranker is removed per Req 3) */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto max-w-xl py-1">
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

          {/* Right Actions: Backup (JSON) & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
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

        {/* Mobile Search Bar Row (Requirement 1: Visible at top on every page) */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-paper-muted absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={`Search ${activeExam.name} topics & subjects...`}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text placeholder-paper-muted focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-paper-muted hover:text-paper-ink absolute right-1.5 top-1.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mobile Search Results Dropdown */}
            {isSearchOpen && isSearching && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-2xl rounded-2xl p-2 z-50 max-h-80 overflow-y-auto animate-scale-up space-y-2">
                {matchedTopics.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-paper-muted uppercase tracking-wider px-2 py-1">
                      Topics ({matchedTopics.length})
                    </div>
                    <div className="space-y-1">
                      {matchedTopics.map(topic => {
                        const sub = subjects.find(s => s.id === topic.subjectId);
                        const unit = sub?.units?.find(u => u.id === topic.unitId);
                        const unitLabel = unit ? formatUnitDisplayName(unit) : formatUnitDisplayName({ unitNumber: topic.unitNumber, unitLabel: (topic as any).unitLabel, title: (topic as any).unitTitle });

                        return (
                          <div
                            key={topic.id}
                            onClick={() => handleTopicClick(topic)}
                            className="p-2.5 rounded-xl hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated cursor-pointer transition-colors border border-transparent hover:border-emerald-500/30 flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-paper-ink dark:text-night-text line-clamp-1">
                                {topic.title}
                              </div>
                              <div className="text-[10px] text-paper-muted flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span 
                                  className="font-bold px-1.5 py-0.2 rounded font-mono"
                                  style={{ backgroundColor: `${sub?.accentColor || '#10B981'}20`, color: sub?.accentColor || '#10B981' }}
                                >
                                  {sub?.name || 'Subject'}
                                </span>
                                <span>•</span>
                                <span>{unitLabel}</span>
                              </div>
                            </div>

                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                              topic.mastery === 'weak' ? 'bg-rose-500/10 text-rose-500' :
                              topic.mastery === 'strong' ? 'bg-emerald-500/10 text-emerald-500' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {topic.mastery}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {matchedSubjects.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-paper-muted uppercase tracking-wider px-2 py-1">
                      Subjects ({matchedSubjects.length})
                    </div>
                    <div className="space-y-1">
                      {matchedSubjects.map(sub => (
                        <div
                          key={sub.id}
                          onClick={() => handleSubjectClick(sub.id)}
                          className="p-2.5 rounded-xl hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated cursor-pointer transition-colors border border-transparent hover:border-emerald-500/30 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.accentColor }} />
                            <span className="text-xs font-bold text-paper-ink dark:text-night-text truncate">{sub.name}</span>
                          </div>
                          <span className="text-[10px] text-paper-muted font-mono shrink-0">
                            {sub.units?.length || 0} Units →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!hasResults && (
                  <div className="py-6 px-4 text-center">
                    <Search className="w-5 h-5 text-paper-muted mx-auto mb-1.5 opacity-50" />
                    <div className="text-xs font-bold text-paper-ink dark:text-night-text">No results found</div>
                    <div className="text-[11px] text-paper-muted mt-0.5">
                      No topics or subjects match "{searchQuery}" in {activeExam.name}.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Delete Exam Confirmation Modal (Requirement 12) */}
      <ConfirmModal
        isOpen={!!examToDelete}
        title="Delete Exam?"
        message={`Are you sure you want to delete "${examToDelete?.name}"? All its subjects, units, topics, notes, and files will be removed. This action cannot be undone.`}
        confirmLabel="Delete Exam"
        isDanger={true}
        onCancel={() => setExamToDelete(null)}
        onConfirm={() => {
          if (examToDelete) {
            onDeleteExam(examToDelete.id);
            setExamToDelete(null);
          }
        }}
      />
    </header>
  );
};
