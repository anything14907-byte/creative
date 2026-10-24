import React, { useState } from 'react';
import { SubjectMeta, StudyTask, ExamUrgency } from '../types';
import { 
  CheckCircle2, Circle, Plus, Trash2, Calendar, Clock, 
  Sparkles, AlertCircle 
} from 'lucide-react';

interface StudyPlanTabProps {
  subject: SubjectMeta;
  urgency: ExamUrgency;
  tasks: StudyTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenEditDate: () => void;
}

export const StudyPlanTab: React.FC<StudyPlanTabProps> = ({
  subject,
  urgency,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenEditDate
}) => {
  const [newTaskText, setNewTaskText] = useState('');

  const subjectTasks = tasks.filter(t => t.subjectId === subject.id);
  const completedCount = subjectTasks.filter(t => t.completed).length;
  const progressPercent = subjectTasks.length > 0 
    ? Math.round((completedCount / subjectTasks.length) * 100) 
    : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim());
    setNewTaskText('');
  };

  return (
    <div className="space-y-6 animate-fade-slide-up">
      
      {/* Top Countdown & Date Info Bar */}
      <div 
        className="p-6 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-500"
        style={{ borderLeft: `6px solid ${urgency.hslColor}` }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono"
              style={{ 
                color: urgency.hslColor,
                backgroundColor: `${urgency.hslColor}18`
              }}
            >
              {urgency.statusLabel}
            </span>

            <span className="text-xs text-paper-muted dark:text-night-muted font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {urgency.formattedExamDate}
            </span>

            <button
              onClick={onOpenEditDate}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline btn-tactile ml-1"
            >
              Change Date
            </button>
          </div>

          <h3 className="text-xl font-bold text-paper-ink dark:text-night-text">
            {subject.name} Study Plan
          </h3>

          <p className="text-xs text-paper-body dark:text-night-muted mt-1 max-w-xl">
            {urgency.fractionalDays <= 5
              ? `🚨 Only ${urgency.days} days and ${urgency.hours} hours left! Focus strictly on the highest-repeated past questions.`
              : urgency.fractionalDays <= 15
              ? `⚡ ${urgency.days} days left. Complete your unmastered questions and test yourself from memory.`
              : `🟢 Safe zone: ${urgency.days} days remaining. Review syllabus units comfortably and take lecture notes.`}
          </p>
        </div>

        {/* Live Countdown Display */}
        <div 
          className="p-4 rounded-xl text-center border shrink-0 transition-colors duration-500"
          style={{ 
            backgroundColor: `${urgency.hslColor}10`,
            borderColor: `${urgency.hslColor}35`
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted mb-0.5">
            Time Remaining
          </div>
          <div 
            className="text-xl sm:text-2xl font-extrabold countdown-digit"
            style={{ color: urgency.hslColor }}
          >
            {urgency.formattedCountdown}
          </div>
        </div>
      </div>

      {/* Checklist Card */}
      <div className="p-6 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card">
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <span>Study Checklist</span>
              <span className="text-xs font-mono font-bold text-paper-muted dark:text-night-muted px-2 py-0.5 rounded-md bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border">
                {completedCount} of {subjectTasks.length} Completed
              </span>
            </h4>
          </div>

          <span className="text-xs font-bold font-mono" style={{ color: urgency.hslColor }}>
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-paper-cardElevated dark:bg-night-cardElevated overflow-hidden mb-6">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: urgency.hslColor
            }}
          />
        </div>

        {/* Tasks List */}
        <div className="space-y-2.5 mb-5">
          {subjectTasks.map(task => (
            <div 
              key={task.id}
              className="flex items-center justify-between p-3 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border transition-colors hover:border-paper-borderHover dark:hover:border-night-borderHover group"
            >
              <div 
                onClick={() => onToggleTask(task.id)}
                className="flex items-center gap-3 flex-1 cursor-pointer select-none"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-paper-muted dark:text-night-muted shrink-0" />
                )}
                <span className={`text-xs font-medium ${task.completed ? 'line-through text-paper-muted dark:text-night-muted' : 'text-paper-ink dark:text-night-text'}`}>
                  {task.text}
                </span>
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity rounded-lg"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {subjectTasks.length === 0 && (
            <div className="text-center py-8 text-xs text-paper-muted dark:text-night-muted">
              No tasks added for this subject yet. Add your first study task below!
            </div>
          )}
        </div>

        {/* Add Task Input */}
        <form onSubmit={handleCreateTask} className="flex gap-2">
          <input
            type="text"
            placeholder="+ Add a study task (e.g., Practice Banker's Algorithm)..."
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text placeholder-paper-muted dark:placeholder-night-muted text-xs focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg text-xs font-bold btn-tactile shrink-0"
          >
            + Add Task
          </button>
        </form>

      </div>

    </div>
  );
};
