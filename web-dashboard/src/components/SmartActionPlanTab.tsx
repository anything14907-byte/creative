import React, { useState } from 'react';
import { SubjectMeta, StudyTask, CountdownTime } from '../types';
import { getConceptExplainer } from '../data/conceptExplainerData';
import { 
  Clock, Sparkles, CheckCircle2, Circle, Plus, Trash2, Lightbulb, 
  Layers, FileText, RotateCcw, AlertTriangle, ArrowRight, BookOpen, Search
} from 'lucide-react';

interface SmartActionPlanTabProps {
  subject: SubjectMeta;
  countdown: CountdownTime;
  tasks: StudyTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenEditDate: () => void;
}

export const SmartActionPlanTab: React.FC<SmartActionPlanTabProps> = ({
  subject,
  countdown,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenEditDate
}) => {
  // Task input state
  const [newTaskText, setNewTaskText] = useState('');

  // Concept explainer state
  const [selectedTopic, setSelectedTopic] = useState(() => {
    if (subject.id === 'os') return 'os-deadlock';
    if (subject.id === 'dbms') return 'dbms-normalization';
    if (subject.id === 'cn') return 'cn-tcp';
    if (subject.id === 'dsa') return 'dsa-avl';
    return subject.units[0]?.title || 'Core Syllabus Topic';
  });
  const [customTopicQuery, setCustomTopicQuery] = useState('');
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const subjectTasks = tasks.filter(t => t.subjectId === subject.id);
  const completedCount = subjectTasks.filter(t => t.completed).length;
  const progressPercent = subjectTasks.length > 0 
    ? Math.round((completedCount / subjectTasks.length) * 100) 
    : 0;

  // AI Study Coach logic based on countdown days
  let coachMode = 'Deep Understanding Mode';
  let coachColor = 'text-emerald-400';
  let coachBg = 'bg-emerald-500/10 border-emerald-500/30';
  let coachMessage = '';

  if (countdown.urgency === 'critical') {
    coachMode = 'CRUNCH MODE (< 3 Days Remaining)';
    coachColor = 'text-rose-400';
    coachBg = 'bg-rose-500/15 border-rose-500/35';
    coachMessage = `🚨 Only ${countdown.days * 24 + countdown.hours} hours until your exam! Stop reading thick textbooks. Focus strictly on guaranteed 10-Mark repeated PYQs, review diagram formulas for full marks, and watch revision videos at 1.5x speed.`;
  } else if (countdown.urgency === 'high') {
    coachMode = 'ACTIVE PRACTICE MODE (3–7 Days Remaining)';
    coachColor = 'text-amber-400';
    coachBg = 'bg-amber-500/15 border-amber-500/35';
    coachMessage = `⚡ High-Yield Practice Phase! ${countdown.days} days left. Solve 5-Mark and 10-Mark questions from memory, test your rubric keywords, and review your uploaded PDF summaries.`;
  } else {
    coachMode = 'DEEP MASTERY MODE (> 7 Days Remaining)';
    coachColor = 'text-cyan-400';
    coachBg = 'bg-cyan-500/15 border-cyan-500/35';
    coachMessage = `🟢 Strategic Build Phase! ${countdown.days} days remaining. Build crystal-clear conceptual intuition using the Real-World Analogies below and watch complete lecture series.`;
  }

  // Active Explainer object
  const activeExplainer = getConceptExplainer(customTopicQuery || selectedTopic, subject.id);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim());
    setNewTaskText('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP DUAL CARDS: LIVE COUNTDOWN HUD & SMART STUDY COACH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Per-Subject Live Countdown HUD Card */}
        <div 
          className="lg:col-span-5 p-6 rounded-2xl hud-glass-panel relative overflow-hidden"
          style={{ borderColor: `${subject.accentColor}40` }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" style={{ color: subject.accentColor }} />
              Live Subject Countdown
            </span>
            <button
              onClick={onOpenEditDate}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            >
              ⏰ Edit Exam Time
            </button>
          </div>

          <div className="text-center py-3">
            <div className="text-xs text-slate-400 mb-1">Time Left Until {subject.code} Paper:</div>
            <div 
              className="text-3xl sm:text-4xl font-extrabold countdown-digit"
              style={{ color: subject.accentColor }}
            >
              {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
            </div>
            
            <div className="mt-3 inline-block">
              {countdown.urgency === 'critical' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  🚨 CRITICAL EXAM (&lt; 3 DAYS)
                </span>
              )}
              {countdown.urgency === 'high' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ⚡ HIGH PRIORITY (&lt; 7 DAYS)
                </span>
              )}
              {countdown.urgency === 'normal' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🟢 ON TRACK (&gt; 7 DAYS)
                </span>
              )}
              {countdown.urgency === 'passed' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                  🏁 EXAM IN PROGRESS OR FINISHED
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Target Date: {new Date(subject.examDate).toLocaleDateString()}</span>
            <span>Starts at: {new Date(subject.examDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Right: Smart Study Coach Card with Interactive Missions */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border ${coachBg} backdrop-blur-md relative`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${coachColor}`} />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${coachColor}`}>
                {coachMode}
              </h3>
            </div>
            <div className="text-xs font-mono font-bold text-slate-300">
              {completedCount}/{subjectTasks.length} Done ({progressPercent}%)
            </div>
          </div>

          <p className="text-xs text-slate-200 dark:text-slate-300 leading-relaxed mb-4">
            {coachMessage}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden mb-4">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: subject.accentColor
              }}
            />
          </div>

          {/* Mission Checklist */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {subjectTasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-200 group transition-colors hover:border-white/20"
              >
                <div 
                  onClick={() => onToggleTask(task.id)}
                  className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={task.completed ? 'line-through text-slate-500' : 'font-medium'}>
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom mission input */}
          <form onSubmit={handleCreateTask} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="+ Add your own custom study task..."
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-black text-xs font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: subject.accentColor }}
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* 2. DEEP CONCEPT EXPLAINER (UNDERSTAND ANY TOPIC BETTER) */}
      <div className="p-6 rounded-2xl hud-glass-panel border border-white/15">
        
        {/* Header & Topic Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white dark:text-white">
                Understand Any Topic Better (Deep Concept Explainer)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Break down complex syllabus concepts into simple analogies, visual architectures, and exam-ready points.
            </p>
          </div>

          {/* Preset Topics & Custom Input */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedTopic}
              onChange={e => {
                setSelectedTopic(e.target.value);
                setCustomTopicQuery('');
                setIsCardFlipped(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
            >
              {subject.id === 'os' && (
                <>
                  <option value="os-deadlock">Banker's Algorithm & Deadlocks</option>
                  <option value="os-paging">Virtual Memory, Paging & TLB</option>
                </>
              )}
              {subject.id === 'dbms' && (
                <>
                  <option value="dbms-normalization">Normalization (1NF to BCNF)</option>
                  <option value="dbms-acid">ACID & Conflict Serializability</option>
                </>
              )}
              {subject.id === 'cn' && (
                <>
                  <option value="cn-tcp">TCP Congestion Control & Handshake</option>
                </>
              )}
              {subject.id === 'dsa' && (
                <>
                  <option value="dsa-avl">AVL Tree Balancing & Rotations</option>
                </>
              )}
              {subject.units.map(u => (
                <option key={u.unit} value={u.title}>Unit {u.unit}: {u.title}</option>
              ))}
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Or type any topic..."
                value={customTopicQuery}
                onChange={e => {
                  setCustomTopicQuery(e.target.value);
                  setIsCardFlipped(false);
                }}
                className="w-40 sm:w-48 pl-7 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* 4-CARD BREAKDOWN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: Simple Intuition & Real-World Analogy */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/25 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Card 1 • 30-Sec Grasp</span>
                <h4 className="text-sm font-bold text-white">{activeExplainer.analogy.title}</h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              "{activeExplainer.analogy.story}"
            </p>

            <div className="p-2.5 rounded-xl bg-black/30 border border-amber-500/20 text-[11px] text-amber-200">
              <strong>Key Takeaway:</strong> {activeExplainer.analogy.keyTakeaway}
            </div>
          </div>

          {/* Card 2: Visual Architecture & Step-by-Step Flow */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/25 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Card 2 • Technical Flow</span>
                <h4 className="text-sm font-bold text-white">{activeExplainer.architectureFlow.title}</h4>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {activeExplainer.architectureFlow.steps.map((step, idx) => (
                <div key={idx} className="text-xs text-slate-300 font-mono bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/5">
                  {step}
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-cyan-500/20 text-[11px] text-cyan-200 font-mono">
              <strong>Governing Formula / Rule:</strong> {activeExplainer.architectureFlow.formulaOrRule}
            </div>
          </div>

          {/* Card 3: Exam-Ready 5M / 10M Bullet Points & Rubric Keywords */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/25 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Card 3 • Write in Exam</span>
                <h4 className="text-sm font-bold text-white">Full-Mark Exam Points & Keywords</h4>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {activeExplainer.examPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
              {activeExplainer.rubricKeywords.map((kw, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4: Quick Flashcard Flip (Memory Tester) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/25 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Card 4 • Test Memory</span>
                    <h4 className="text-sm font-bold text-white">Active Recall Flashcard</h4>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {activeFlashcardIndex + 1} / {activeExplainer.flashcards.length}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div 
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="w-full min-h-[140px] p-4 rounded-xl bg-black/40 border border-white/15 cursor-pointer flex flex-col items-center justify-center text-center transition-all hover:border-rose-400/50 select-none"
              >
                {!isCardFlipped ? (
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2 block">
                      Question (Click to reveal answer)
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {activeExplainer.flashcards[activeFlashcardIndex]?.question || 'Click Next to flip card'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 block">
                      Answer Key
                    </span>
                    <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                      {activeExplainer.flashcards[activeFlashcardIndex]?.answer || 'Answer revealed'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Flashcard Next/Prev buttons */}
            <div className="flex items-center justify-between mt-3 pt-2">
              <button
                onClick={() => {
                  setActiveFlashcardIndex(prev => (prev > 0 ? prev - 1 : activeExplainer.flashcards.length - 1));
                  setIsCardFlipped(false);
                }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-300 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-[11px] text-slate-400">Click card to flip</span>
              <button
                onClick={() => {
                  setActiveFlashcardIndex(prev => (prev + 1) % activeExplainer.flashcards.length);
                  setIsCardFlipped(false);
                }}
                className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs text-rose-300 font-bold transition-colors"
              >
                Next Card →
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
