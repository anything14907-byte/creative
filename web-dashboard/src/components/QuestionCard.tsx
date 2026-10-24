import React, { useState } from 'react';
import { 
  Flame, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  PenTool, 
  FileText, 
  Tag, 
  StickyNote,
  Save
} from 'lucide-react';
import { PYQQuestion, QuestionStatus } from '../types';

interface QuestionCardProps {
  question: PYQQuestion;
  onSelectForPractice: (question: PYQQuestion) => void;
  onUpdateStatus: (id: string, status: QuestionStatus) => void;
  onToggleBookmark: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onSelectForPractice,
  onUpdateStatus,
  onToggleBookmark,
  onSaveNote
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(question.userNotes || '');

  const handleSaveNote = () => {
    onSaveNote(question.id, noteText);
    setEditingNote(false);
  };

  const getMarksColor = (marks: number) => {
    switch (marks) {
      case 2:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 5:
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 10:
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusBadge = (status: QuestionStatus) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Mastered
          </span>
        );
      case 'needs-revision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Needs Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5" /> Not Started
          </span>
        );
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 p-5 bg-solar-card dark:bg-obsidian-card ${
      question.isHighProbability 
        ? 'border-indigo-200/80 dark:border-indigo-900/60 shadow-sm hover:shadow-md' 
        : 'border-solar-border dark:border-obsidian-border hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      
      {/* Header: Meta Badges & Bookmark */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          {/* Unit Badge */}
          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Unit {question.unit}
          </span>

          {/* Marks Badge */}
          <span className={`px-2 py-0.5 rounded-lg text-xs border ${getMarksColor(question.marks)}`}>
            {question.marks} Marks
          </span>

          {/* Repeat Frequency Badge */}
          {question.repeatCount >= 3 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs">
              <Flame className="w-3 h-3 fill-white" />
              Asked {question.repeatCount}x in 5 Years
            </span>
          ) : question.repeatCount > 1 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Asked {question.repeatCount}x
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg text-xs text-solar-muted dark:text-obsidian-muted bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              Asked in {question.yearsAsked.join(', ')}
            </span>
          )}

          {/* Status Badge */}
          {getStatusBadge(question.userStatus)}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={() => onToggleBookmark(question.id)}
          className={`p-1.5 rounded-xl transition-colors ${
            question.bookmarked 
              ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={question.bookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
        >
          {question.bookmarked ? <BookmarkCheck className="w-5 h-5 fill-amber-400" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      {/* Question Text */}
      <h3 className="text-sm sm:text-base font-semibold text-solar-text dark:text-obsidian-text leading-relaxed mb-3">
        {question.question}
      </h3>

      {/* Question Years Tags */}
      <div className="flex flex-wrap items-center gap-1 mb-4">
        <span className="text-[11px] text-solar-muted dark:text-obsidian-muted mr-1">Appeared in:</span>
        {question.yearsAsked.map(yr => (
          <span 
            key={yr} 
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-solar-muted dark:text-obsidian-muted"
          >
            {yr}
          </span>
        ))}
      </div>

      {/* Rubric Keywords Preview Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[11px] font-medium text-solar-muted dark:text-obsidian-muted flex items-center gap-1">
          <Tag className="w-3 h-3 text-indigo-500" /> Rubric Keys:
        </span>
        {question.expectedKeywords.slice(0, expanded ? question.expectedKeywords.length : 4).map(kw => (
          <span 
            key={kw} 
            className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
          >
            {kw}
          </span>
        ))}
        {!expanded && question.expectedKeywords.length > 4 && (
          <span className="text-[10px] text-solar-muted dark:text-obsidian-muted font-medium">
            +{question.expectedKeywords.length - 4} more
          </span>
        )}
      </div>

      {/* Expanded Details: Rubric Criteria & Model Answer */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-solar-border dark:border-obsidian-border space-y-3 text-xs">
          
          {/* Model Answer Summary */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-solar-border dark:border-obsidian-border">
            <div className="font-bold text-solar-text dark:text-obsidian-text flex items-center gap-1.5 mb-1 text-xs">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Official Model Answer Key
            </div>
            <p className="text-solar-muted dark:text-obsidian-muted leading-relaxed">
              {question.modelAnswerSummary}
            </p>
          </div>

          {/* Rubric Structure Checklist */}
          <div className="p-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <div className="font-bold text-indigo-900 dark:text-indigo-200 mb-1 text-xs">
              Grading Benchmark Requirements ({question.marks} Marks)
            </div>
            <ul className="list-disc list-inside space-y-1 text-solar-muted dark:text-obsidian-muted">
              {question.rubricGuide.structureRequirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
              <li>Target Length: {question.rubricGuide.recommendedWordCount.min}–{question.rubricGuide.recommendedWordCount.max} words</li>
            </ul>
          </div>

          {/* User Study Note Section */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-solar-border dark:border-obsidian-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-solar-text dark:text-obsidian-text flex items-center gap-1 text-xs">
                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                Personal Study Notes & Formulas
              </span>
              {!editingNote && (
                <button
                  onClick={() => setEditingNote(true)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                >
                  {question.userNotes ? 'Edit Note' : '+ Add Note'}
                </button>
              )}
            </div>

            {editingNote ? (
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Attach mnemonics, page numbers, or formulas to remember for this question..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-obsidian-card text-solar-text dark:text-obsidian-text outline-none focus:border-indigo-500"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingNote(false)}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    <Save className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-solar-muted dark:text-obsidian-muted italic">
                {question.userNotes || 'No notes added yet. Click "+ Add Note" to pin critical formulas or mnemonics.'}
              </p>
            )}
          </div>

        </div>
      )}

      {/* Card Actions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-solar-border dark:border-obsidian-border mt-3">
        
        {/* Status Switcher */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-solar-muted dark:text-obsidian-muted mr-1 hidden sm:inline">Status:</span>
          {(['not-started', 'needs-revision', 'mastered'] as QuestionStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => onUpdateStatus(question.id, st)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                question.userStatus === st
                  ? st === 'mastered'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : st === 'needs-revision'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-slate-700 text-white'
                  : 'text-solar-muted dark:text-obsidian-muted hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'not-started' ? 'Pending' : st === 'needs-revision' ? 'Revise' : 'Mastered'}
            </button>
          ))}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-solar-muted dark:text-obsidian-muted hover:text-solar-text dark:hover:text-obsidian-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>{expanded ? 'Less' : 'Rubric Key'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onSelectForPractice(question)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 transition-all active:scale-95"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Practice Rubric</span>
          </button>
        </div>

      </div>

    </div>
  );
};
