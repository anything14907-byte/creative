import React from 'react';
import { 
  BarChart3, 
  Layers, 
  PenTool, 
  FileCheck2, 
  Flame, 
  Clock, 
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SubjectId, PYQQuestion } from '../types';

export type ActiveTab = 'analytics' | 'questions' | 'sandbox' | 'cheatsheet';

interface SidebarNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  questions: PYQQuestion[];
  activeSubjectId: SubjectId;
  examDateStr: string;
  onOpenExamDatePicker: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  questions,
  activeSubjectId,
  examDateStr,
  onOpenExamDatePicker
}) => {
  const subjectQuestions = questions.filter(q => q.subjectId === activeSubjectId);
  const criticalCount = subjectQuestions.filter(q => q.isHighProbability).length;
  const masteredCount = subjectQuestions.filter(q => q.userStatus === 'mastered').length;

  // Calculate days remaining
  const targetDate = new Date(examDateStr);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const navItems = [
    {
      id: 'analytics' as ActiveTab,
      label: 'Exam ROI & Heatmap',
      icon: BarChart3,
      badge: 'Insights',
      badgeColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60'
    },
    {
      id: 'questions' as ActiveTab,
      label: 'Question Bank',
      icon: Layers,
      badge: `${subjectQuestions.length}`,
      badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      id: 'sandbox' as ActiveTab,
      label: 'Rubric Grader',
      icon: PenTool,
      badge: 'Live Grader',
      badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'cheatsheet' as ActiveTab,
      label: 'Night-Before Sheet',
      icon: FileCheck2,
      badge: `${criticalCount} Hot`,
      badgeColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
    }
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col justify-between p-4 border-r border-solar-border dark:border-obsidian-border bg-solar-card/50 dark:bg-[#090D16]/50">
      
      {/* Navigation Links */}
      <div className="space-y-1.5">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-solar-muted dark:text-obsidian-muted">
          Study Workspaces
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-solar-text dark:text-obsidian-text hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                <span>{item.label}</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${isActive ? 'bg-white/20 text-white' : item.badgeColor}`}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Target Exam Countdown Widget in Sidebar */}
      <div className="mt-6 pt-4 border-t border-solar-border dark:border-obsidian-border space-y-3">
        <div className="p-3.5 rounded-2xl border border-solar-border dark:border-obsidian-border bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-obsidian-card dark:to-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-solar-muted dark:text-obsidian-muted mb-1.5">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
              <Clock className="w-3 h-3 text-indigo-500" /> Target Exam
            </span>
            <button 
              onClick={onOpenExamDatePicker}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
            >
              Edit
            </button>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="font-extrabold text-2xl tracking-tight text-solar-text dark:text-obsidian-text">
              {diffDays} <span className="text-xs font-normal text-solar-muted dark:text-obsidian-muted">days left</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-500">
              <Flame className="w-3.5 h-3.5 fill-rose-500 animate-pulse" />
              <span>{criticalCount} Hot PYQs</span>
            </div>
          </div>

          {/* Quick Mastery Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-solar-muted dark:text-obsidian-muted">Mastery Progress</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {subjectQuestions.length > 0 ? Math.round((masteredCount / subjectQuestions.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${subjectQuestions.length > 0 ? (masteredCount / subjectQuestions.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Browser Extension Instructions Card */}
        <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/30 text-xs text-solar-muted dark:text-obsidian-muted">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extension Ready</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Load <code className="px-1 py-0.5 rounded bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 font-mono">/extension</code> into Chrome to match PYQs while browsing study sites.
          </p>
        </div>

      </div>

    </aside>
  );
};
