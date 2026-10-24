import React, { useState, useEffect } from 'react';
import { SubjectMeta, SubjectUnit, PYQQuestion, StudyTask, VideoResource, PdfResource } from '../types';
import { getExamUrgencyColor, ACCENT_PALETTE, extractYoutubeId } from '../utils/storageService';
import { EditExamDateModal } from './EditExamDateModal';
import { EditUnitsModal } from './EditUnitsModal';
import { QuestionCard } from './QuestionCard';
import { AddCustomPyqModal } from './AddCustomPyqModal';
import { 
  Clock, Calendar, ArrowLeft, Trash2, Cpu, Database, Network, 
  Code, BookOpen, Layers, Plus, Video, FileText, CheckCircle2, 
  Circle, Play, ExternalLink, FileEdit, Eye, AlertCircle, Palette, 
  MoveRight, Flame, X, UploadCloud, Check
} from 'lucide-react';

interface SubjectWorkspaceProps {
  subject: SubjectMeta;
  initialUnitId?: string;
  questions: PYQQuestion[];
  tasks: StudyTask[];
  videos: VideoResource[];
  pdfs: PdfResource[];
  onToggleMastered: (id: string) => void;
  onSaveAnswer: (id: string, answer: string, score: number) => void;
  onAddQuestion: (q: PYQQuestion) => void;
  onToggleTask: (id: string) => void;
  onAddTask: (text: string, unitId?: string, unitNum?: number) => void;
  onDeleteTask: (id: string) => void;
  onAddVideo: (video: VideoResource) => void;
  onUpdateVideoNotes: (videoId: string, notes: string) => void;
  onToggleVideoWatched: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onAddPdf: (pdf: PdfResource) => void;
  onDeletePdf: (id: string) => void;
  onMoveItemToUnit: (type: 'task' | 'video' | 'pdf' | 'question', itemId: string, targetUnitId: string, targetUnitNumber?: number) => void;
  onUpdateSubject: (subject: SubjectMeta) => void;
  onDeleteSubject: (id: string) => void;
  onBackToOverview: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type UnitResourceType = 'all' | 'videos' | 'pdfs' | 'tasks' | 'pyqs';

export const SubjectWorkspace: React.FC<SubjectWorkspaceProps> = ({
  subject,
  initialUnitId,
  questions,
  tasks,
  videos,
  pdfs,
  onToggleMastered,
  onSaveAnswer,
  onAddQuestion,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onAddVideo,
  onUpdateVideoNotes,
  onToggleVideoWatched,
  onDeleteVideo,
  onAddPdf,
  onDeletePdf,
  onMoveItemToUnit,
  onUpdateSubject,
  onDeleteSubject,
  onBackToOverview,
  onShowToast
}) => {
  // Navigation: 'all' (Grouped View) or specific unitId (e.g. 'u1', 'u2')
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId || 'all');
  const [activeResourceType, setActiveResourceType] = useState<UnitResourceType>('all');

  useEffect(() => {
    setSelectedUnitId(initialUnitId || 'all');
  }, [initialUnitId, subject.id]);

  // Modals
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [isEditUnitsOpen, setIsEditUnitsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddPyqOpen, setIsAddPyqOpen] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState(false);

  // Forms state for adding resources
  const [addingResourceType, setAddingResourceType] = useState<{ unitId: string; type: 'video' | 'pdf' | 'task' } | null>(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [activePdfModal, setActivePdfModal] = useState<PdfResource | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string>('');

  // Urgency calculations
  const urgency = getExamUrgencyColor(subject.examDate);

  // Filter subject items
  const subjectQuestions = questions.filter(q => q.subjectId === subject.id);
  const subjectVideos = videos.filter(v => v.subjectId === subject.id);
  const subjectPdfs = pdfs.filter(p => p.subjectId === subject.id);
  const subjectTasks = tasks.filter(t => t.subjectId === subject.id);

  // Identify unassigned items (items not matching any defined subject unit)
  const unitIds = new Set(subject.units.map(u => u.id));
  const unitNumbers = new Set(subject.units.map(u => u.unit));

  const isItemAssigned = (item: { unitId?: string; unit?: number }) => {
    if (item.unitId && unitIds.has(item.unitId)) return true;
    if (item.unit && unitNumbers.has(item.unit)) return true;
    return false;
  };

  const unassignedTasks = subjectTasks.filter(t => !isItemAssigned(t));
  const unassignedVideos = subjectVideos.filter(v => !isItemAssigned(v));
  const unassignedPdfs = subjectPdfs.filter(p => !isItemAssigned(p));
  const unassignedQuestions = subjectQuestions.filter(q => !isItemAssigned(q));
  const hasUnassignedItems = unassignedTasks.length > 0 || unassignedVideos.length > 0 || unassignedPdfs.length > 0 || unassignedQuestions.length > 0;

  const getSubjectIcon = (name: string) => {
    switch (name) {
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Database': return <Database className="w-5 h-5" />;
      case 'Network': return <Network className="w-5 h-5" />;
      case 'Code': return <Code className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  // Unit filter helpers
  const getUnitItems = (unit: SubjectUnit) => {
    const uTasks = subjectTasks.filter(t => t.unitId === unit.id || t.unit === unit.unit);
    const uVideos = subjectVideos.filter(v => v.unitId === unit.id || v.unit === unit.unit);
    const uPdfs = subjectPdfs.filter(p => p.unitId === unit.id || p.unit === unit.unit);
    const uQuestions = subjectQuestions.filter(q => q.unitId === unit.id || q.unit === unit.unit);
    return { uTasks, uVideos, uPdfs, uQuestions };
  };

  const handleAddVideoSubmit = (unitId: string, unitNum: number | undefined, e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;

    const ytid = extractYoutubeId(newVideoUrl.trim());
    if (!ytid) {
      onShowToast('Please provide a valid YouTube URL (e.g. youtube.com or youtu.be)', 'error');
      return;
    }

    const newVid: VideoResource = {
      id: `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: subject.id,
      unitId,
      unit: unitNum,
      title: newVideoTitle.trim(),
      youtubeUrl: newVideoUrl.trim(),
      videoId: ytid,
      notes: '',
      isWatched: false,
      addedAt: Date.now()
    };

    onAddVideo(newVid);
    setActiveVideoId(newVid.id);
    setNewVideoTitle('');
    setNewVideoUrl('');
    setAddingResourceType(null);
    onShowToast(`Added video to Unit ${unitNum || 1}! 🎬`, 'success');
  };

  const handleAddNoteSubmit = (unitId: string, unitNum: number | undefined, e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: PdfResource = {
      id: `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: subject.id,
      unitId,
      unit: unitNum,
      fileName: `${newNoteTitle.trim()}.txt`,
      uploadDate: new Date().toLocaleDateString(),
      fileSize: `${(newNoteContent.length / 1024).toFixed(1)} KB`,
      extractedText: newNoteContent.trim(),
      summary: newNoteContent.slice(0, 250).trim() + '...',
      extractedQuestions: [`Review key points from ${newNoteTitle.trim()}`]
    };

    onAddPdf(newNote);
    setNewNoteTitle('');
    setNewNoteContent('');
    setAddingResourceType(null);
    onShowToast(`Saved study note under Unit ${unitNum || 1}! 📄`, 'success');
  };

  const handleAddTaskSubmit = (unitId: string, unitNum: number | undefined, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    onAddTask(newTaskText.trim(), unitId, unitNum);
    setNewTaskText('');
    setAddingResourceType(null);
    onShowToast(`Task added to Unit ${unitNum || 1}! 📋`, 'success');
  };

  const handleMove = (type: 'task' | 'video' | 'pdf' | 'question', itemId: string, targetUnitId: string) => {
    const targetUnit = subject.units.find(u => u.id === targetUnitId);
    onMoveItemToUnit(type, itemId, targetUnitId, targetUnit?.unit);
    onShowToast(`Moved to Unit ${targetUnit?.unit || targetUnitId}!`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-slide-up">
      
      {/* 1. TOP SUBJECT COMMAND HEADER */}
      <div 
        className="p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card transition-all duration-300"
        style={{ borderTop: `5px solid ${subject.accentColor}` }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Left: Back button & Subject Title */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBackToOverview}
              className="p-2.5 rounded-xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated text-paper-ink dark:text-night-text hover:bg-paper-card dark:hover:bg-night-card transition-colors btn-tactile shrink-0"
              title="Back to All Subjects"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ 
                backgroundColor: `${subject.accentColor}18`, 
                color: subject.accentColor
              }}
            >
              {getSubjectIcon(subject.iconName)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md font-mono"
                  style={{ 
                    color: urgency.hslColor,
                    backgroundColor: `${urgency.hslColor}18`
                  }}
                >
                  {urgency.statusLabel}
                </span>
                <span className="text-xs text-paper-muted dark:text-night-muted font-medium">
                  {subject.units.length} Units • {subjectQuestions.length} PYQs • {subjectVideos.length} Videos
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-paper-ink dark:text-night-text mt-0.5 tracking-tight">
                {subject.name}
              </h2>
            </div>
          </div>

          {/* Right: Quick Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* 1-Click Change Date Picker Pill */}
            <div 
              onClick={() => setIsEditDateOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:border-emerald-500 cursor-pointer flex items-center gap-2 select-none btn-tactile shadow-sm"
              title="Click to edit exam date & time"
            >
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-[10px] text-paper-muted dark:text-night-muted font-bold uppercase tracking-wider">
                  Exam Date
                </div>
                <div className="text-xs font-bold text-paper-ink dark:text-night-text">
                  {urgency.formattedExamDate}
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                Change
              </span>
            </div>

            {/* Live Countdown Badge with Urgency Shift */}
            <div 
              className="px-4 py-2 rounded-xl border text-center transition-all duration-600 shadow-sm"
              style={{ 
                backgroundColor: `${urgency.hslColor}10`,
                borderColor: `${urgency.hslColor}35`
              }}
            >
              <div className="text-[10px] text-paper-muted dark:text-night-muted font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" style={{ color: urgency.hslColor }} />
                <span>Time Remaining</span>
              </div>
              <div 
                className="text-sm sm:text-base font-extrabold countdown-digit"
                style={{ color: urgency.hslColor }}
              >
                {urgency.formattedCountdown}
              </div>
            </div>

            {/* Quick Palette Swatch Popover */}
            <div className="relative">
              <button
                onClick={() => setActiveColorPicker(!activeColorPicker)}
                className="p-2.5 rounded-xl border border-paper-border dark:border-night-border text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated transition-colors btn-tactile"
                title="Change subject accent theme color"
              >
                <Palette className="w-4 h-4" style={{ color: subject.accentColor }} />
              </button>

              {activeColorPicker && (
                <div className="absolute right-0 top-11 z-30 p-2.5 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-2xl grid grid-cols-5 gap-1.5 w-44 animate-fade-slide-up">
                  {ACCENT_PALETTE.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => {
                        onUpdateSubject({ ...subject, accentColor: c.hex });
                        setActiveColorPicker(false);
                        onShowToast(`Accent color updated to ${c.name}!`, 'success');
                      }}
                      title={c.name}
                      className={`w-6 h-6 rounded-full transition-transform btn-tactile ${subject.accentColor === c.hex ? 'scale-125 ring-2 ring-emerald-500' : 'opacity-80 hover:opacity-100'}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Delete Subject Button */}
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="p-2.5 rounded-xl border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated transition-colors btn-tactile"
              title="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* 2. PROMINENT UNIT NAVIGATION BAR */}
        <div className="mt-6 pt-4 border-t border-paper-border dark:border-night-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            
            {/* All Units Button */}
            <button
              onClick={() => setSelectedUnitId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 btn-tactile transition-all whitespace-nowrap ${
                selectedUnitId === 'all'
                  ? 'text-white shadow-sm'
                  : 'text-paper-body dark:text-night-text bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:bg-paper-card dark:hover:bg-night-card'
              }`}
              style={{ 
                backgroundColor: selectedUnitId === 'all' ? subject.accentColor : undefined 
              }}
            >
              <Layers className="w-4 h-4" />
              <span>📚 All Units (Grouped View)</span>
            </button>

            {/* Unit Buttons */}
            {subject.units.map(u => {
              const { uTasks, uVideos, uPdfs, uQuestions } = getUnitItems(u);
              const totalItems = uTasks.length + uVideos.length + uPdfs.length + uQuestions.length;
              const isSelected = selectedUnitId === u.id;

              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile transition-all whitespace-nowrap ${
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'text-paper-body dark:text-night-text bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:bg-paper-card dark:hover:bg-night-card'
                  }`}
                  style={{
                    backgroundColor: isSelected ? subject.accentColor : undefined
                  }}
                >
                  <span>Unit {u.unit}: {u.title}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${isSelected ? 'bg-black/20 text-white' : 'bg-paper-border dark:bg-night-border text-paper-muted dark:text-night-muted'}`}>
                    {totalItems}
                  </span>
                </button>
              );
            })}

          </div>

          {/* Manage Units Button */}
          <button
            onClick={() => setIsEditUnitsOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated hover:border-emerald-500 text-paper-ink dark:text-night-text flex items-center gap-1.5 btn-tactile shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>+ Add / Edit Units</span>
          </button>
        </div>

      </div>

      {/* 3. UNASSIGNED / PREVIOUSLY SAVED ITEMS SECTION (1-CLICK MOVE TO UNIT) */}
      {hasUnassignedItems && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-paper-ink dark:text-night-text space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                  📦 General / Unassigned Items ({unassignedTasks.length + unassignedVideos.length + unassignedPdfs.length + unassignedQuestions.length})
                </h4>
                <p className="text-xs text-paper-muted dark:text-night-muted">
                  These items were saved before unit organization. Use the <strong>"Move to Unit ▾"</strong> dropdown to easily assign them to any unit:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Unassigned Tasks */}
            {unassignedTasks.map(t => (
              <div key={t.id} className="p-3 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex items-center justify-between gap-3 text-xs">
                <span className="font-medium line-clamp-1 flex-1">📋 Task: {t.text}</span>
                <select
                  onChange={e => e.target.value && handleMove('task', t.id, e.target.value)}
                  defaultValue=""
                  className="px-2 py-1 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-[11px] font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                >
                  <option value="" disabled>Move to Unit ▾</option>
                  {subject.units.map(u => (
                    <option key={u.id} value={u.id}>Unit {u.unit}: {u.title}</option>
                  ))}
                </select>
              </div>
            ))}

            {/* Unassigned Videos */}
            {unassignedVideos.map(v => (
              <div key={v.id} className="p-3 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex items-center justify-between gap-3 text-xs">
                <span className="font-medium line-clamp-1 flex-1">🎬 Video: {v.title}</span>
                <select
                  onChange={e => e.target.value && handleMove('video', v.id, e.target.value)}
                  defaultValue=""
                  className="px-2 py-1 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-[11px] font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                >
                  <option value="" disabled>Move to Unit ▾</option>
                  {subject.units.map(u => (
                    <option key={u.id} value={u.id}>Unit {u.unit}: {u.title}</option>
                  ))}
                </select>
              </div>
            ))}

            {/* Unassigned PDFs */}
            {unassignedPdfs.map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex items-center justify-between gap-3 text-xs">
                <span className="font-medium line-clamp-1 flex-1">📄 Note: {p.fileName}</span>
                <select
                  onChange={e => e.target.value && handleMove('pdf', p.id, e.target.value)}
                  defaultValue=""
                  className="px-2 py-1 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-[11px] font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                >
                  <option value="" disabled>Move to Unit ▾</option>
                  {subject.units.map(u => (
                    <option key={u.id} value={u.id}>Unit {u.unit}: {u.title}</option>
                  ))}
                </select>
              </div>
            ))}

            {/* Unassigned Questions */}
            {unassignedQuestions.map(q => (
              <div key={q.id} className="p-3 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex items-center justify-between gap-3 text-xs">
                <span className="font-medium line-clamp-1 flex-1">🔥 PYQ: {q.question}</span>
                <select
                  onChange={e => e.target.value && handleMove('question', q.id, e.target.value)}
                  defaultValue=""
                  className="px-2 py-1 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-[11px] font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                >
                  <option value="" disabled>Move to Unit ▾</option>
                  {subject.units.map(u => (
                    <option key={u.id} value={u.id}>Unit {u.unit}: {u.title}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MAIN UNIT WORKSPACE VIEW */}
      <div className="space-y-6">
        
        {/* Render units (either all units or the single selected unit) */}
        {subject.units
          .filter(u => selectedUnitId === 'all' || u.id === selectedUnitId)
          .map(unit => {
            const { uTasks, uVideos, uPdfs, uQuestions } = getUnitItems(unit);
            const isAdding = addingResourceType?.unitId === unit.id;

            return (
              <div 
                key={unit.id}
                className="p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-6 transition-all"
                style={{ borderLeft: `6px solid ${subject.accentColor}` }}
              >
                {/* Unit Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-border dark:border-night-border">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold"
                        style={{ 
                          backgroundColor: `${subject.accentColor}18`,
                          color: subject.accentColor
                        }}
                      >
                        Unit {unit.unit}
                      </span>
                      <span className="text-xs text-paper-muted dark:text-night-muted font-medium">
                        {uTasks.length} Tasks • {uVideos.length} Videos • {uPdfs.length} Notes • {uQuestions.length} PYQs
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-paper-ink dark:text-night-text">
                      {unit.title}
                    </h3>
                  </div>

                  {/* Add Resource Buttons for this Unit */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setAddingResourceType(isAdding && addingResourceType?.type === 'video' ? null : { unitId: unit.id, type: 'video' })}
                      className="px-3 py-1.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs font-semibold text-paper-body dark:text-night-text hover:border-emerald-500 btn-tactile flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>+ Add Video</span>
                    </button>

                    <button
                      onClick={() => setAddingResourceType(isAdding && addingResourceType?.type === 'pdf' ? null : { unitId: unit.id, type: 'pdf' })}
                      className="px-3 py-1.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs font-semibold text-paper-body dark:text-night-text hover:border-emerald-500 btn-tactile flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>+ Add Note / PDF</span>
                    </button>

                    <button
                      onClick={() => setAddingResourceType(isAdding && addingResourceType?.type === 'task' ? null : { unitId: unit.id, type: 'task' })}
                      className="px-3 py-1.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs font-semibold text-paper-body dark:text-night-text hover:border-emerald-500 btn-tactile flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>+ Add Task</span>
                    </button>

                    <button
                      onClick={() => setIsAddPyqOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg text-xs font-bold btn-tactile shadow-sm flex items-center gap-1.5"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>+ Add PYQ</span>
                    </button>
                  </div>
                </div>

                {/* Inline Resource Creation Form for Unit */}
                {isAdding && addingResourceType.type === 'video' && (
                  <form onSubmit={e => handleAddVideoSubmit(unit.id, unit.unit, e)} className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-cyan-500/40 space-y-3 animate-fade-slide-up">
                    <h5 className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Add YouTube Video for Unit {unit.unit}: {unit.title}</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Video Title (e.g. CPU Scheduling Gantt Charts)"
                        value={newVideoTitle}
                        onChange={e => setNewVideoTitle(e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="YouTube Link (https://www.youtube.com/watch?v=...)"
                        value={newVideoUrl}
                        onChange={e => setNewVideoUrl(e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setAddingResourceType(null)} className="px-3 py-1.5 rounded-lg border border-paper-border dark:border-night-border text-xs btn-tactile">Cancel</button>
                      <button type="submit" className="px-4 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold btn-tactile shadow-sm">Save Video</button>
                    </div>
                  </form>
                )}

                {isAdding && addingResourceType.type === 'pdf' && (
                  <form onSubmit={e => handleAddNoteSubmit(unit.id, unit.unit, e)} className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-emerald-500/40 space-y-3 animate-fade-slide-up">
                    <h5 className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Write Study Notes for Unit {unit.unit}: {unit.title}</span>
                    </h5>
                    <input
                      type="text"
                      required
                      placeholder="Note Title (e.g. Important Formulas & Definitions)"
                      value={newNoteTitle}
                      onChange={e => setNewNoteTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500"
                    />
                    <textarea
                      rows={4}
                      required
                      placeholder="Type formulas, algorithm steps, or exam points here..."
                      value={newNoteContent}
                      onChange={e => setNewNoteContent(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs font-mono text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setAddingResourceType(null)} className="px-3 py-1.5 rounded-lg border border-paper-border dark:border-night-border text-xs btn-tactile">Cancel</button>
                      <button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold btn-tactile shadow-sm">Save Note</button>
                    </div>
                  </form>
                )}

                {isAdding && addingResourceType.type === 'task' && (
                  <form onSubmit={e => handleAddTaskSubmit(unit.id, unit.unit, e)} className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-amber-500/40 space-y-3 animate-fade-slide-up">
                    <h5 className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Add Checklist Task for Unit {unit.unit}</span>
                    </h5>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Practice Banker's Algorithm Safe Sequence numerical..."
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-amber-500"
                      />
                      <button type="button" onClick={() => setAddingResourceType(null)} className="px-3 py-2 rounded-xl border border-paper-border dark:border-night-border text-xs btn-tactile">Cancel</button>
                      <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold btn-tactile shadow-sm">Save Task</button>
                    </div>
                  </form>
                )}

                {/* Unit Content Grid (Videos, PDFs, Tasks, PYQs) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Tasks & Videos */}
                  <div className="space-y-6">
                    
                    {/* Unit Tasks Checklist */}
                    <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Unit Tasks ({uTasks.length})</span>
                        </span>
                        <span className="text-[10px] text-paper-muted dark:text-night-muted">
                          {uTasks.filter(t => t.completed).length} completed
                        </span>
                      </div>

                      <div className="space-y-2">
                        {uTasks.map(t => (
                          <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border group">
                            <div 
                              onClick={() => onToggleTask(t.id)} 
                              className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                            >
                              {t.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-paper-muted dark:text-night-muted shrink-0" />
                              )}
                              <span className={`text-xs ${t.completed ? 'line-through text-paper-muted dark:text-night-muted' : 'text-paper-ink dark:text-night-text'}`}>
                                {t.text}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                              <select
                                onChange={e => e.target.value && handleMove('task', t.id, e.target.value)}
                                defaultValue=""
                                className="px-1.5 py-0.5 rounded text-[10px] bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted outline-none"
                                title="Move to another unit"
                              >
                                <option value="" disabled>Move ▾</option>
                                {subject.units.map(otherU => (
                                  <option key={otherU.id} value={otherU.id}>Unit {otherU.unit}</option>
                                ))}
                              </select>

                              <button onClick={() => onDeleteTask(t.id)} className="p-1 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {uTasks.length === 0 && (
                          <div className="text-center py-4 text-xs text-paper-muted dark:text-night-muted italic">
                            No tasks for Unit {unit.unit} yet. Click "+ Add Task" to create one.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Unit Video Lectures */}
                    <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span>Video Links ({uVideos.length})</span>
                        </span>
                      </div>

                      <div className="space-y-3">
                        {uVideos.map(vid => {
                          const isPlaying = activeVideoId === vid.id;
                          return (
                            <div key={vid.id} className="p-3 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h6 className="text-xs font-bold text-paper-ink dark:text-night-text line-clamp-1">{vid.title}</h6>
                                  <a href={vid.youtubeUrl} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 mt-0.5">
                                    <span>Watch on YouTube</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => setActiveVideoId(isPlaying ? '' : vid.id)}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-bold btn-tactile flex items-center gap-1 ${isPlaying ? 'bg-cyan-600 text-white' : 'bg-paper-cardElevated dark:bg-night-cardElevated text-cyan-600 dark:text-cyan-400'}`}
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>{isPlaying ? 'Close' : 'Watch'}</span>
                                  </button>

                                  <select
                                    onChange={e => e.target.value && handleMove('video', vid.id, e.target.value)}
                                    defaultValue=""
                                    className="px-1.5 py-1 rounded text-[10px] bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted outline-none"
                                  >
                                    <option value="" disabled>Move ▾</option>
                                    {subject.units.map(otherU => (
                                      <option key={otherU.id} value={otherU.id}>Unit {otherU.unit}</option>
                                    ))}
                                  </select>

                                  <button onClick={() => onDeleteVideo(vid.id)} className="p-1 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Embedded player if active */}
                              {isPlaying && (
                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black mt-2">
                                  <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${vid.videoId}?rel=0&modestbranding=1`}
                                    title={vid.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full border-0"
                                  />
                                </div>
                              )}

                              {/* Persistent Notes Box */}
                              <div className="pt-2 border-t border-paper-border dark:border-night-border">
                                <textarea
                                  rows={2}
                                  placeholder="Type quick formulas or timestamps for this video..."
                                  value={vid.notes || ''}
                                  onChange={e => onUpdateVideoNotes(vid.id, e.target.value)}
                                  className="w-full p-2 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-[11px] font-mono text-paper-ink dark:text-night-text focus:outline-none focus:border-cyan-500 resize-none"
                                />
                              </div>
                            </div>
                          );
                        })}

                        {uVideos.length === 0 && (
                          <div className="text-center py-4 text-xs text-paper-muted dark:text-night-muted italic">
                            No videos added for Unit {unit.unit} yet. Click "+ Add Video" above.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: PDFs/Notes & PYQs */}
                  <div className="space-y-6">
                    
                    {/* Unit PDFs & Study Notes */}
                    <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>PDFs & Notes ({uPdfs.length})</span>
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {uPdfs.map(pdf => (
                          <div key={pdf.id} className="p-3 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex flex-col justify-between gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h6 className="text-xs font-bold text-paper-ink dark:text-night-text line-clamp-1">{pdf.fileName}</h6>
                                <span className="text-[10px] text-paper-muted dark:text-night-muted">{pdf.uploadDate} • {pdf.fileSize}</span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setActivePdfModal(pdf)}
                                  className="px-2.5 py-1 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-[11px] font-semibold text-paper-ink dark:text-night-text hover:border-emerald-500 btn-tactile flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Read</span>
                                </button>

                                <select
                                  onChange={e => e.target.value && handleMove('pdf', pdf.id, e.target.value)}
                                  defaultValue=""
                                  className="px-1.5 py-1 rounded text-[10px] bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted outline-none"
                                >
                                  <option value="" disabled>Move ▾</option>
                                  {subject.units.map(otherU => (
                                    <option key={otherU.id} value={otherU.id}>Unit {otherU.unit}</option>
                                  ))}
                                </select>

                                <button onClick={() => onDeletePdf(pdf.id)} className="p-1 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-paper-body dark:text-night-muted line-clamp-2 bg-paper-cardElevated dark:bg-night-cardElevated p-2 rounded-lg">
                              {pdf.summary}
                            </p>
                          </div>
                        ))}

                        {uPdfs.length === 0 && (
                          <div className="text-center py-4 text-xs text-paper-muted dark:text-night-muted italic">
                            No study notes or PDFs for Unit {unit.unit} yet.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Unit Past Exam Questions (PYQs) */}
                    <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Unit Past Questions ({uQuestions.length})</span>
                        </span>
                        <button
                          onClick={() => setIsAddPyqOpen(true)}
                          className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline btn-tactile"
                        >
                          + Add Question
                        </button>
                      </div>

                      <div className="space-y-3">
                        {uQuestions.map(q => (
                          <QuestionCard
                            key={q.id}
                            question={q}
                            onToggleMastered={onToggleMastered}
                            onSaveAnswer={onSaveAnswer}
                            onShowToast={onShowToast}
                          />
                        ))}

                        {uQuestions.length === 0 && (
                          <div className="text-center py-4 text-xs text-paper-muted dark:text-night-muted italic">
                            No past exam questions added for Unit {unit.unit} yet.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}

      </div>

      {/* Full Content Reader Modal for Notes/PDF */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-slide-up">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-2xl relative my-8 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setActivePdfModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-paper-ink dark:text-night-text">{activePdfModal.fileName}</h3>
                <span className="text-xs text-paper-muted dark:text-night-muted">Extracted Content • {activePdfModal.fileSize}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="p-4 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-body dark:text-night-text leading-relaxed font-mono whitespace-pre-wrap">
                {activePdfModal.extractedText}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-paper-border dark:border-night-border flex justify-end">
              <button
                onClick={() => setActivePdfModal(null)}
                className="px-4 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs font-bold text-paper-ink dark:text-night-text btn-tactile"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Date Modal */}
      <EditExamDateModal
        subject={subject}
        isOpen={isEditDateOpen}
        onClose={() => setIsEditDateOpen(false)}
        onSave={(newDate) => {
          onUpdateSubject({ ...subject, examDate: newDate });
          onShowToast('Target exam date updated! Countdown synced.', 'success');
        }}
      />

      {/* Edit Units Modal */}
      <EditUnitsModal
        subject={subject}
        isOpen={isEditUnitsOpen}
        onClose={() => setIsEditUnitsOpen(false)}
        onSaveUnits={(updatedUnits) => {
          onUpdateSubject({ ...subject, units: updatedUnits });
          onShowToast('Syllabus units updated!', 'success');
        }}
      />

      {/* Add Custom PYQ Modal */}
      <AddCustomPyqModal
        subject={subject}
        isOpen={isAddPyqOpen}
        onClose={() => setIsAddPyqOpen(false)}
        onAdd={(q) => {
          onAddQuestion(q);
        }}
      />

      {/* Delete Subject Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-slide-up">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-xl">
            <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Delete Subject?</h3>
            </div>
            <p className="text-xs text-paper-muted dark:text-night-muted mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-paper-ink dark:text-night-text">{subject.name}</strong>? All associated study tasks, questions, and videos will be removed.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-paper-border dark:border-night-border text-xs font-semibold text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSubject(subject.id);
                  onBackToOverview();
                  onShowToast(`Removed ${subject.name} from subjects.`, 'info');
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 btn-tactile"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
