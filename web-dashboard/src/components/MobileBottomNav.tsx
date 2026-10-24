import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Flame, 
  Calendar, 
  Timer, 
  Brain, 
  Video, 
  FileText, 
  Layers, 
  MoreHorizontal,
  X,
  ShieldCheck
} from 'lucide-react';

export type ExtendedNavView = 
  | 'today' 
  | 'syllabus' 
  | 'pyqs' 
  | 'timer' 
  | 'flashcards' 
  | 'vault' 
  | 'pdf' 
  | 'overview' 
  | 'workspace';

interface MobileBottomNavProps {
  currentView: ExtendedNavView;
  onSelectView: (view: ExtendedNavView) => void;
  onOpenBackup: () => void;
  dueFlashcardsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenBackup,
  dueFlashcardsCount
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs: { id: ExtendedNavView; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'syllabus', label: 'Syllabus', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'timer', label: 'Timer', icon: <Timer className="w-5 h-5" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Brain className="w-5 h-5" /> },
    { id: 'vault', label: 'Vault', icon: <Video className="w-5 h-5" /> },
  ];

  const moreTabs: { id: ExtendedNavView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'pdf', label: 'PDF Notes Tool', icon: <FileText className="w-5 h-5" /> },
    { id: 'overview', label: 'All Subjects Grid', icon: <Layers className="w-5 h-5" /> },
  ];

  const handleTabClick = (view: ExtendedNavView) => {
    onSelectView(view);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* "More" Drawer for Mobile */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-slide-up">
          <div className="p-6 rounded-t-3xl bg-paper-card dark:bg-night-card border-t border-paper-border dark:border-night-border space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-paper-border dark:border-night-border">
              <span className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted">
                Additional Tools & Study Companion
              </span>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {moreTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2 btn-tactile ${
                    currentView === tab.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'bg-paper-cardElevated dark:bg-night-cardElevated border-paper-border dark:border-night-border text-paper-ink dark:text-night-text font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon}
                    <span className="text-xs">{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-black">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setIsMoreOpen(false); onOpenBackup(); }}
              className="w-full py-3 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs font-bold text-paper-ink dark:text-night-text flex items-center justify-center gap-2 btn-tactile"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Data Backup & Restore (JSON)</span>
            </button>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar on Mobile (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-card/95 dark:bg-night-card/95 backdrop-blur-lg border-t border-paper-border dark:border-night-border h-16 flex items-center justify-around px-2 shadow-lg safe-area-bottom">
        {mainTabs.map(tab => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold scale-105' 
                  : 'text-paper-muted dark:text-night-muted font-medium'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* More Options Button */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isMoreOpen || moreTabs.some(t => t.id === currentView)
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-paper-muted dark:text-night-muted font-medium'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {dueFlashcardsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>
    </>
  );
};
