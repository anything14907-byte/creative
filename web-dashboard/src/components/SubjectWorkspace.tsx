import React, { useState, useEffect } from 'react';
import { SubjectMeta, SubjectUnit, PYQQuestion, StudyTask, VideoResource, PdfResource, SubjectFile } from '../types';
import { getExamUrgencyColor, ACCENT_PALETTE, extractYoutubeId, formatUnitDisplayName } from '../utils/storageService';
import { indexedDbService } from '../utils/indexedDbService';
import { EditExamDateModal } from './EditExamDateModal';
import { EditUnitsModal } from './EditUnitsModal';
import { QuestionCard } from './QuestionCard';
import { AddCustomPyqModal } from './AddCustomPyqModal';
import { PdfViewerModal } from './PdfViewerModal';
import { ImageViewerModal } from './ImageViewerModal';
import { ConfirmModal } from './ConfirmModal';
import { 
  Clock, Calendar, ArrowLeft, Trash2, Cpu, Database, Network, 
  Code, BookOpen, Layers, Plus, Video, FileText, CheckCircle2, 
  Circle, Play, ExternalLink, FileEdit, Eye, AlertCircle, Palette, 
  MoveRight, Flame, X, UploadCloud, Check, Download, Image, Edit2, Upload, Copy
} from 'lucide-react';

interface SubjectWorkspaceProps {
  subject: SubjectMeta;
  initialUnitId?: string;
  activeExamId?: string;
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
  activeExamId,
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

  // IndexedDB Files State
  const [dbFiles, setDbFiles] = useState<SubjectFile[]>([]);
  const [noteFormMode, setNoteFormMode] = useState<'write' | 'upload'>('write');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Modals & Preview State
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [isEditUnitsOpen, setIsEditUnitsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddPyqOpen, setIsAddPyqOpen] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState(false);

  // File Viewers & Actions
  const [previewPdfFile, setPreviewPdfFile] = useState<SubjectFile | null>(null);
  const [previewImageFile, setPreviewImageFile] = useState<SubjectFile | null>(null);
  const [previewNoteFile, setPreviewNoteFile] = useState<SubjectFile | null>(null);
  const [renamingFile, setRenamingFile] = useState<SubjectFile | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [fileToDelete, setFileToDelete] = useState<SubjectFile | null>(null);
  const [legacyPdfToDelete, setLegacyPdfToDelete] = useState<string | null>(null);

  // Forms state for adding resources
  const [addingResourceType, setAddingResourceType] = useState<{ unitId: string; type: 'video' | 'pdf' | 'task' } | null>(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [activePdfModal, setActivePdfModal] = useState<PdfResource | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string>('');

  // Load files from IndexedDB
  const loadDbFiles = async () => {
    try {
      const allFiles = await indexedDbService.getFiles(subject.id, activeExamId);
      setDbFiles(allFiles);
    } catch (err) {
      console.error('Error loading files from IndexedDB:', err);
    }
  };

  useEffect(() => {
    loadDbFiles();
  }, [subject.id, activeExamId]);

  // Urgency calculations
  const urgency = getExamUrgencyColor(subject.examDate);

  // Filter subject items
  const subjectQuestions = questions.filter(q => q.subjectId === subject.id);
  const subjectVideos = videos.filter(v => v.subjectId === subject.id);
  const subjectPdfs = pdfs.filter(p => p.subjectId === subject.id);
  const subjectTasks = tasks.filter(t => t.subjectId === subject.id);

  // Identify unassigned items
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
    onShowToast(`Added video to ${formatUnitDisplayName(subject.units.find(u => u.id === unitId) || { id: unitId, unit: unitNum || 1, title: '' })}! 🎬`, 'success');
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  // Add text note (saved to IndexedDB + backwards compatible)
  const handleAddNoteSubmit = async (unitId: string, unitNum: number | undefined, e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const noteId = `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const noteFile: SubjectFile = {
      id: noteId,
      examId: activeExamId,
      subjectId: subject.id,
      unitId,
      name: newNoteTitle.trim(),
      description: newNoteContent.slice(0, 150).trim(),
      category: 'notes',
      fileType: 'note',
      dataUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(newNoteContent.trim())}`,
      size: newNoteContent.length,
      date: new Date().toLocaleDateString(),
      isImportant: false,
      isDone: false,
      createdAt: Date.now()
    };

    try {
      await indexedDbService.addFile(noteFile);
      await loadDbFiles();

      const newLegacyNote: PdfResource = {
        id: noteId,
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
      onAddPdf(newLegacyNote);

      setNewNoteTitle('');
      setNewNoteContent('');
      setAddingResourceType(null);
      onShowToast(`Saved study note in IndexedDB! 📄`, 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Could not save note to IndexedDB', 'error');
    }
  };

  // Upload multiple PDFs/images to IndexedDB
  const handleUploadFilesSubmit = async (unitId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      onShowToast('Please select at least one PDF or Image file', 'info');
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const f = selectedFiles[i];
        const dataUrl = await readFileAsDataUrl(f);
        const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        const isImg = f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(f.name);
        
        let fileDisplayName = f.name;
        if (selectedFiles.length === 1 && uploadTitle.trim()) {
          fileDisplayName = uploadTitle.trim();
        } else if (selectedFiles.length > 1 && uploadTitle.trim()) {
          fileDisplayName = `${uploadTitle.trim()} (${i + 1}) - ${f.name}`;
        }

        const newFile: SubjectFile = {
          id: `file-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          examId: activeExamId,
          subjectId: subject.id,
          unitId,
          name: fileDisplayName,
          description: uploadDesc.trim() || undefined,
          category: isPdf ? 'notes' : (isImg ? 'images' : 'notes'),
          fileType: isPdf ? 'pdf' : (isImg ? 'image' : 'note'),
          dataUrl,
          size: f.size,
          date: new Date().toLocaleDateString(),
          isImportant: false,
          isDone: false,
          createdAt: Date.now()
        };

        await indexedDbService.addFile(newFile);
      }

      await loadDbFiles();
      setSelectedFiles([]);
      setUploadTitle('');
      setUploadDesc('');
      setAddingResourceType(null);
      onShowToast(`Uploaded ${selectedFiles.length} file(s) to IndexedDB! 📁`, 'success');
    } catch (err) {
      console.error('File upload error:', err);
      onShowToast('Failed to upload files. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadFile = (file: SubjectFile) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name || 'document';
    link.click();
  };

  const handleRenameFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFile || !renameValue.trim()) return;
    try {
      await indexedDbService.renameFile(renamingFile.id, renameValue.trim());
      await loadDbFiles();
      setRenamingFile(null);
      setRenameValue('');
      onShowToast('File renamed successfully!', 'success');
    } catch (err) {
      console.error('Rename failed:', err);
      onShowToast('Failed to rename file', 'error');
    }
  };

  const handleDeleteFileConfirm = async () => {
    if (fileToDelete) {
      try {
        await indexedDbService.deleteFile(fileToDelete.id);
        await loadDbFiles();
        onShowToast(`Deleted "${fileToDelete.name}"`, 'info');
      } catch (err) {
        console.error('Delete failed:', err);
      }
      setFileToDelete(null);
    }
  };

  const handleDeleteLegacyPdfConfirm = () => {
    if (legacyPdfToDelete) {
      onDeletePdf(legacyPdfToDelete);
      onShowToast('Deleted note', 'info');
      setLegacyPdfToDelete(null);
    }
  };

  const handleAddTaskSubmit = (unitId: string, unitNum: number | undefined, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    onAddTask(newTaskText.trim(), unitId, unitNum);
    setNewTaskText('');
    setAddingResourceType(null);
    onShowToast(`Task added to Unit! 📋`, 'success');
  };

  const handleMove = (type: 'task' | 'video' | 'pdf' | 'question', itemId: string, targetUnitId: string) => {
    const targetUnit = subject.units.find(u => u.id === targetUnitId);
    onMoveItemToUnit(type, itemId, targetUnitId, targetUnit?.unit);
    onShowToast(`Moved to ${targetUnit ? formatUnitDisplayName(targetUnit) : targetUnitId}!`, 'success');
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
                backgroundColor: `${subject.accentColor}15`, 
                color: subject.accentColor,
                border: `1px solid ${subject.accentColor}30`
              }}
            >
              {getSubjectIcon(subject.iconName || 'BookOpen')}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-paper-muted dark:text-night-muted">
                  {subject.code}
                </span>
                {subject.semester && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted">
                    {subject.semester}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-paper-ink dark:text-night-text">
                {subject.name}
              </h2>
            </div>
          </div>

          {/* Right: Exam Date & Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Exam Date Badge (Click to edit) */}
            <button
              onClick={() => setIsEditDateOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:border-emerald-500/50 flex items-center gap-2.5 transition-all btn-tactile text-left"
              title="Click to change target exam date"
            >
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-paper-muted dark:text-night-muted block leading-none">Exam Date</span>
                <span className="text-xs font-bold text-paper-ink dark:text-night-text">
                  {urgency.formattedExamDate}
                </span>
              </div>
              <span 
                className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                style={{ 
                  backgroundColor: `${urgency.hslColor}20`,
                  color: urgency.hslColor
                }}
              >
                {urgency.formattedCountdown}
              </span>
            </button>

            {/* Accent Color Palette Picker */}
            <div className="relative">
              <button
                onClick={() => setActiveColorPicker(!activeColorPicker)}
                className="p-2.5 rounded-xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated hover:border-emerald-500 text-paper-ink dark:text-night-text btn-tactile"
                title="Change Subject Accent Color"
              >
                <Palette className="w-4 h-4" style={{ color: subject.accentColor }} />
              </button>

              {activeColorPicker && (
                <div className="absolute right-0 mt-2 p-3 bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border rounded-2xl shadow-xl z-20 flex gap-2">
                  {ACCENT_PALETTE.map(color => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        onUpdateSubject({ ...subject, accentColor: color.hex });
                        setActiveColorPicker(false);
                        onShowToast('Accent theme updated!', 'success');
                      }}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-125"
                      style={{ 
                        backgroundColor: color.hex,
                        borderColor: subject.accentColor === color.hex ? '#FFFFFF' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Delete Subject Button */}
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="p-2.5 rounded-xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-900 transition-colors btn-tactile"
              title="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>

      {/* 2. UNIT SELECTOR & NAVIGATION TABS */}
      <div className="p-4 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            
            {/* View All Units Pill */}
            <button
              onClick={() => setSelectedUnitId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile transition-all shrink-0 ${
                selectedUnitId === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-paper-body dark:text-night-text bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:bg-paper-card dark:hover:bg-night-card'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Units ({subject.units.length})</span>
            </button>

            {/* Individual Unit Pills */}
            {subject.units.map(u => {
              const { uTasks, uVideos, uPdfs, uQuestions } = getUnitItems(u);
              const unitFileCount = dbFiles.filter(f => f.unitId === u.id).length;
              const totalItems = uTasks.length + uVideos.length + unitFileCount + uPdfs.length + uQuestions.length;
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
                  <span>{formatUnitDisplayName(u)}</span>
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

      {/* 3. UNASSIGNED / PREVIOUSLY SAVED ITEMS SECTION */}
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
                  These items were saved before unit organization. Use the <strong>"Move to Unit ▾"</strong> dropdown to assign them:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
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
                    <option key={u.id} value={u.id}>{formatUnitDisplayName(u)}</option>
                  ))}
                </select>
              </div>
            ))}

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
                    <option key={u.id} value={u.id}>{formatUnitDisplayName(u)}</option>
                  ))}
                </select>
              </div>
            ))}

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
                    <option key={u.id} value={u.id}>{formatUnitDisplayName(u)}</option>
                  ))}
                </select>
              </div>
            ))}

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
                    <option key={u.id} value={u.id}>{formatUnitDisplayName(u)}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MAIN UNIT WORKSPACE VIEW */}
      <div className="space-y-6">
        
        {subject.units.length === 0 && (
          <div className="p-8 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-center space-y-3">
            <Layers className="w-10 h-10 text-paper-muted dark:text-night-muted mx-auto opacity-50" />
            <h4 className="text-base font-bold text-paper-ink dark:text-night-text">No Units Created Yet</h4>
            <p className="text-xs text-paper-muted dark:text-night-muted max-w-sm mx-auto">
              Organize this subject into units to track syllabus, upload PDFs, and practice PYQs.
            </p>
            <button
              onClick={() => setIsEditUnitsOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold btn-tactile inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Unit</span>
            </button>
          </div>
        )}

        {subject.units
          .filter(u => selectedUnitId === 'all' || u.id === selectedUnitId)
          .map(unit => {
            const { uTasks, uVideos, uPdfs, uQuestions } = getUnitItems(unit);
            const unitDbFiles = dbFiles.filter(f => f.unitId === unit.id || (!f.unitId && selectedUnitId === unit.id));
            const existingDbIds = new Set(unitDbFiles.map(f => f.id));
            const filteredLegacyPdfs = uPdfs.filter(p => !existingDbIds.has(p.id));
            const totalNotesAndFilesCount = unitDbFiles.length + filteredLegacyPdfs.length;
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
                        {unit.unitLabel || `Unit ${unit.unit}`}
                      </span>
                      <span className="text-xs text-paper-muted dark:text-night-muted font-medium">
                        {uTasks.length} Tasks • {uVideos.length} Videos • {totalNotesAndFilesCount} Notes & Files • {uQuestions.length} PYQs
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-paper-ink dark:text-night-text">
                      {formatUnitDisplayName(unit)}
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

                {/* Inline Forms for adding items */}
                {isAdding && addingResourceType.type === 'video' && (
                  <form onSubmit={e => handleAddVideoSubmit(unit.id, unit.unit, e)} className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-cyan-500/40 space-y-3 animate-fade-slide-up">
                    <h5 className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Add Video Lecture for {formatUnitDisplayName(unit)}</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Video Title (e.g. Page Replacement Algorithms Explained)"
                        value={newVideoTitle}
                        onChange={e => setNewVideoTitle(e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="url"
                        required
                        placeholder="YouTube Video Link (e.g. https://youtu.be/...)"
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

                {/* Two-Option Form: Write Note OR Upload PDF / Image */}
                {isAdding && addingResourceType.type === 'pdf' && (
                  <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-emerald-500/40 space-y-4 animate-fade-slide-up">
                    {/* Mode Selector */}
                    <div className="flex items-center justify-between border-b border-paper-border dark:border-night-border pb-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNoteFormMode('write')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            noteFormMode === 'write'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-paper-muted dark:text-night-muted hover:text-paper-ink dark:hover:text-night-text'
                          }`}
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Write Note</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteFormMode('upload')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            noteFormMode === 'upload'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-paper-muted dark:text-night-muted hover:text-paper-ink dark:hover:text-night-text'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload PDF / Image</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAddingResourceType(null)}
                        className="p-1.5 rounded-lg text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {noteFormMode === 'write' ? (
                      <form onSubmit={e => handleAddNoteSubmit(unit.id, unit.unit, e)} className="space-y-3">
                        <h5 className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Write Study Note for {formatUnitDisplayName(unit)}</span>
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
                    ) : (
                      <form onSubmit={e => handleUploadFilesSubmit(unit.id, e)} className="space-y-3">
                        <h5 className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Upload PDF or Images for {formatUnitDisplayName(unit)}</span>
                        </h5>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Title (optional, defaults to file name)"
                            value={uploadTitle}
                            onChange={e => setUploadTitle(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            placeholder="Description (optional, e.g. Teacher lecture notes or formula sheet)"
                            value={uploadDesc}
                            onChange={e => setUploadDesc(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500"
                          />
                          <div className="p-4 border-2 border-dashed border-paper-border dark:border-night-border rounded-xl text-center hover:border-emerald-500 transition-colors">
                            <input
                              type="file"
                              id={`file-upload-${unit.id}`}
                              multiple
                              accept=".pdf,image/png,image/jpeg,image/jpg"
                              onChange={e => {
                                if (e.target.files) {
                                  setSelectedFiles(Array.from(e.target.files));
                                }
                              }}
                              className="hidden"
                            />
                            <label htmlFor={`file-upload-${unit.id}`} className="cursor-pointer flex flex-col items-center gap-1.5">
                              <UploadCloud className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-bold text-paper-ink dark:text-night-text">
                                Choose PDFs or Images (PNG, JPG)
                              </span>
                              <span className="text-[11px] text-paper-muted dark:text-night-muted">
                                Multiple files supported • Saved in IndexedDB
                              </span>
                            </label>
                            {selectedFiles.length > 0 && (
                              <div className="mt-3 text-left space-y-1 max-h-24 overflow-y-auto">
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">Selected ({selectedFiles.length}):</span>
                                {selectedFiles.map((sf, idx) => (
                                  <div key={idx} className="text-[11px] text-paper-body dark:text-night-text flex items-center justify-between bg-paper-card dark:bg-night-card p-1.5 rounded border border-paper-border dark:border-night-border">
                                    <span className="truncate">{sf.name}</span>
                                    <span className="text-paper-muted dark:text-night-muted ml-2 text-[10px]">{(sf.size / 1024).toFixed(1)} KB</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button type="button" onClick={() => setAddingResourceType(null)} className="px-3 py-1.5 rounded-lg border border-paper-border dark:border-night-border text-xs btn-tactile">Cancel</button>
                          <button 
                            type="submit" 
                            disabled={selectedFiles.length === 0 || isUploading}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold btn-tactile shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {isAdding && addingResourceType.type === 'task' && (
                  <form onSubmit={e => handleAddTaskSubmit(unit.id, unit.unit, e)} className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-amber-500/40 space-y-3 animate-fade-slide-up">
                    <h5 className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Add Checklist Task for {formatUnitDisplayName(unit)}</span>
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

                {/* Unit Content Grid (Tasks, Notes & Files, Video Links, Exam Questions) - equal row heights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  
                    {/* Unit Tasks Checklist */}
                    <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Unit Tasks ({uTasks.length})</span>
                        </span>
                        <span className="text-[10px] text-paper-muted dark:text-night-muted">
                          {uTasks.filter(t => t.completed).length} completed
                        </span>
                      </div>

                      <div className="space-y-2 flex-1 max-h-96 overflow-y-auto pr-1">
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
                                  <option key={otherU.id} value={otherU.id}>{formatUnitDisplayName(otherU)}</option>
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
                            No tasks for {formatUnitDisplayName(unit)} yet. Click "+ Add Task" to create one.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Unit Notes & Files list */}
                    <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Notes & Files ({totalNotesAndFilesCount})</span>
                        </span>
                        <span className="text-[10px] text-paper-muted dark:text-night-muted">
                          Stored in IndexedDB
                        </span>
                      </div>

                      <div className="space-y-2.5 flex-1 max-h-96 overflow-y-auto pr-1">
                        {/* 1. IndexedDB Files (PDFs, Images, Notes) */}
                        {unitDbFiles.map(file => {
                          const isPdf = file.fileType === 'pdf' || file.name.toLowerCase().endsWith('.pdf');
                          const isImg = file.fileType === 'image' || file.dataUrl?.startsWith('data:image/');

                          return (
                            <div key={file.id} className="p-3 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex flex-col justify-between gap-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5">
                                  <div className="p-2 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border shrink-0 mt-0.5">
                                    {isPdf ? (
                                      <FileText className="w-4 h-4 text-rose-500" />
                                    ) : isImg ? (
                                      <Image className="w-4 h-4 text-blue-500" />
                                    ) : (
                                      <FileEdit className="w-4 h-4 text-emerald-500" />
                                    )}
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-bold text-paper-ink dark:text-night-text line-clamp-1">{file.name}</h6>
                                    <div className="flex items-center gap-2 text-[10px] text-paper-muted dark:text-night-muted mt-0.5">
                                      <span>{file.date || new Date(file.createdAt).toLocaleDateString()}</span>
                                      <span>•</span>
                                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                                      {file.description && (
                                        <>
                                          <span>•</span>
                                          <span className="line-clamp-1 italic">{file.description}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Open / Preview Button */}
                                  <button
                                    onClick={() => {
                                      if (isPdf) {
                                        setPreviewPdfFile(file);
                                      } else if (isImg) {
                                        setPreviewImageFile(file);
                                      } else {
                                        setPreviewNoteFile(file);
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-[11px] font-semibold text-paper-ink dark:text-night-text hover:border-emerald-500 btn-tactile flex items-center gap-1"
                                    title="Open and preview in app"
                                  >
                                    <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>Preview</span>
                                  </button>

                                  {/* Download Button */}
                                  <button
                                    onClick={() => handleDownloadFile(file)}
                                    className="p-1.5 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text btn-tactile"
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Rename Button */}
                                  <button
                                    onClick={() => {
                                      setRenamingFile(file);
                                      setRenameValue(file.name);
                                    }}
                                    className="p-1.5 rounded-lg bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text btn-tactile"
                                    title="Rename File"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Button */}
                                  <button 
                                    onClick={() => setFileToDelete(file)} 
                                    className="p-1.5 rounded-lg text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 btn-tactile"
                                    title="Delete File"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* 2. Legacy PDFs / Notes if present */}
                        {filteredLegacyPdfs.map(pdf => (
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

                                <button 
                                  onClick={() => setLegacyPdfToDelete(pdf.id)} 
                                  className="p-1 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400"
                                  title="Delete Note"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-paper-body dark:text-night-muted line-clamp-2 bg-paper-cardElevated dark:bg-night-cardElevated p-2 rounded-lg">
                              {pdf.summary}
                            </p>
                          </div>
                        ))}

                        {totalNotesAndFilesCount === 0 && (
                          <div className="text-center py-5 text-xs text-paper-muted dark:text-night-muted italic">
                            No notes or files yet. Click "+ Add Note / PDF" to write notes or upload PDFs and images.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Unit Video Lectures */}
                    <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span>Video Links ({uVideos.length})</span>
                        </span>
                      </div>

                      <div className="space-y-3 flex-1 max-h-96 overflow-y-auto pr-1">
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
                                      <option key={otherU.id} value={otherU.id}>{formatUnitDisplayName(otherU)}</option>
                                    ))}
                                  </select>

                                  <button onClick={() => onDeleteVideo(vid.id)} className="p-1 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

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
                            No videos added for {formatUnitDisplayName(unit)} yet. Click "+ Add Video" above.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Unit Past Exam Questions (PYQs) */}
                    <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-paper-ink dark:text-night-text flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Unit Exam Questions ({uQuestions.length})</span>
                        </span>
                      </div>

                      <div className="space-y-3 flex-1 max-h-96 overflow-y-auto pr-1">
                        {uQuestions.map((q) => (
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
                            No questions logged for {formatUnitDisplayName(unit)} yet. Click "+ Add PYQ" above.
                          </div>
                        )}
                      </div>
                    </div>

                </div>

              </div>
            );
          })}

      </div>

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        file={previewPdfFile}
        onClose={() => setPreviewPdfFile(null)}
      />

      {/* Image Viewer Modal with Zoom */}
      <ImageViewerModal
        file={previewImageFile}
        onClose={() => setPreviewImageFile(null)}
      />

      {/* Note Text Reader Modal */}
      {previewNoteFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-slide-up">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-2xl relative my-8 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setPreviewNoteFile(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <FileEdit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-paper-ink dark:text-night-text">{previewNoteFile.name}</h3>
                <span className="text-xs text-paper-muted dark:text-night-muted">
                  Saved Note • {previewNoteFile.date || 'Today'} • {(previewNoteFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="p-4 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-body dark:text-night-text leading-relaxed font-mono whitespace-pre-wrap">
                {previewNoteFile.dataUrl?.startsWith('data:text/plain;charset=utf-8,')
                  ? decodeURIComponent(previewNoteFile.dataUrl.replace('data:text/plain;charset=utf-8,', ''))
                  : (previewNoteFile.description || 'Note content empty')}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-paper-border dark:border-night-border flex items-center justify-between">
              <button
                onClick={() => {
                  const content = previewNoteFile.dataUrl?.startsWith('data:text/plain;charset=utf-8,')
                    ? decodeURIComponent(previewNoteFile.dataUrl.replace('data:text/plain;charset=utf-8,', ''))
                    : (previewNoteFile.description || '');
                  navigator.clipboard.writeText(content);
                  onShowToast('Note copied to clipboard!', 'success');
                }}
                className="px-3 py-1.5 rounded-xl border border-paper-border dark:border-night-border text-xs font-semibold text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </button>

              <button
                onClick={() => setPreviewNoteFile(null)}
                className="px-4 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs font-bold text-paper-ink dark:text-night-text btn-tactile"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename File Modal */}
      {renamingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-slide-up">
          <form onSubmit={handleRenameFileSubmit} className="w-full max-w-sm p-6 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold">Rename File</h3>
            </div>
            <input
              type="text"
              required
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500"
              placeholder="Enter new file name"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenamingFile(null)}
                className="px-3.5 py-1.5 rounded-xl border border-paper-border dark:border-night-border text-xs btn-tactile text-paper-body dark:text-night-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold btn-tactile shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete File Confirmation Modal */}
      <ConfirmModal
        isOpen={!!fileToDelete}
        title="Delete File / Note?"
        message={`Are you sure you want to delete "${fileToDelete?.name}"? This file will be permanently removed from IndexedDB.`}
        confirmLabel="Delete"
        isDanger={true}
        onCancel={() => setFileToDelete(null)}
        onConfirm={handleDeleteFileConfirm}
      />

      {/* Delete Legacy Note Confirmation Modal */}
      <ConfirmModal
        isOpen={!!legacyPdfToDelete}
        title="Delete Study Note?"
        message="Are you sure you want to delete this study note? This action cannot be undone."
        confirmLabel="Delete"
        isDanger={true}
        onCancel={() => setLegacyPdfToDelete(null)}
        onConfirm={handleDeleteLegacyPdfConfirm}
      />

      {/* Full Content Reader Modal for Legacy Notes */}
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
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Subject?"
        message={`Are you sure you want to delete ${subject.name}? All associated study tasks, questions, notes, and videos will be removed.`}
        confirmLabel="Delete Subject"
        isDanger={true}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          setIsDeleteConfirmOpen(false);
          onDeleteSubject(subject.id);
          onBackToOverview();
          onShowToast(`Removed ${subject.name} from subjects.`, 'info');
        }}
      />

    </div>
  );
};
