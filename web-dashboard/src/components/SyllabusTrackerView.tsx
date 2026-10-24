import React, { useState, useEffect } from 'react';
import { SubjectMeta, SubjectUnit, SyllabusTopic, TopicMastery, SubjectFile, FileCategory } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  BookOpen, 
  X, 
  ArrowUp,
  ArrowDown,
  Edit2,
  Video,
  Play,
  FileText,
  Image,
  Upload,
  Calendar,
  ExternalLink,
  Tag
} from 'lucide-react';
import { getExamUrgencyColor, extractYoutubeId } from '../utils/storageService';
import { indexedDbService } from '../utils/indexedDbService';

interface SyllabusTrackerViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: string;
  activeExamId: string;
  onSelectSubject: (id: string) => void;
  topics: SyllabusTopic[];
  onToggleTopicCompleted: (topicId: string) => void;
  onSetTopicMastery: (topicId: string, mastery: TopicMastery) => void;
  onAddTopic: (topic: SyllabusTopic) => void;
  onDeleteTopic: (topicId: string) => void;
  onAddTopicVideo?: (topicId: string, videoUrl: string) => void;
  onRemoveTopicVideo?: (topicId: string, videoUrl: string) => void;
  onAddUnit: (subjectId: string, unitTitle: string) => void;
  onRenameUnit?: (subjectId: string, unitId: string, newTitle: string) => void;
  onDeleteUnit?: (subjectId: string, unitId: string) => void;
  onReorderUnit?: (subjectId: string, unitId: string, direction: 'up' | 'down') => void;
  onOpenAddSubject?: () => void;
  onEditSubject?: (subject: SubjectMeta) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SyllabusTrackerView: React.FC<SyllabusTrackerViewProps> = ({
  subjects,
  activeSubjectId,
  activeExamId,
  onSelectSubject,
  topics,
  onToggleTopicCompleted,
  onSetTopicMastery,
  onAddTopic,
  onDeleteTopic,
  onAddTopicVideo,
  onRemoveTopicVideo,
  onAddUnit,
  onRenameUnit,
  onDeleteUnit,
  onReorderUnit,
  onOpenAddSubject,
  onEditSubject,
  onShowToast
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || subjects[0]?.id || 'os');
  
  // Topic creation form state
  const [isAddingTopicUnitId, setIsAddingTopicUnitId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicMastery, setNewTopicMastery] = useState<TopicMastery>('weak');
  const [newTopicVideoUrl, setNewTopicVideoUrl] = useState('');

  // Unit creation and rename form state
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingUnitTitle, setEditingUnitTitle] = useState('');

  // Adding video link to existing topic
  const [addingVideoTopicId, setAddingVideoTopicId] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  // Active embedded video modal
  const [activeVideoModalUrl, setActiveVideoModalUrl] = useState<string | null>(null);

  // Subject Files (IndexedDB) state
  const [subjectFiles, setSubjectFiles] = useState<SubjectFile[]>([]);
  const [fileFilter, setFileFilter] = useState<'all' | 'pyq' | 'notes' | 'images'>('all');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<FileCategory>('pyq');
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear().toString());
  const [uploadExamType, setUploadExamType] = useState('End Sem');
  const [uploadTitle, setUploadTitle] = useState('');

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const subjectTopics = topics.filter(t => t.subjectId === currentSubject?.id);

  // Sync selectedSubjectId if activeSubjectId changes from outside
  useEffect(() => {
    if (activeSubjectId && activeSubjectId !== selectedSubjectId) {
      setSelectedSubjectId(activeSubjectId);
    }
  }, [activeSubjectId]);

  // Load subject files from IndexedDB whenever subject or exam changes
  useEffect(() => {
    if (currentSubject) {
      indexedDbService.getFiles(currentSubject.id, activeExamId).then(files => {
        setSubjectFiles(files);
      }).catch(err => {
        console.warn('Error loading files from IndexedDB:', err);
      });
    }
  }, [currentSubject?.id, activeExamId]);

  if (!currentSubject) {
    return (
      <div className="p-8 text-center rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border space-y-4">
        <h3 className="text-base font-bold text-paper-ink dark:text-night-text">No subjects found for this exam.</h3>
        {onOpenAddSubject && (
          <button
            onClick={onOpenAddSubject}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5 mx-auto btn-tactile"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        )}
      </div>
    );
  }

  // Metrics
  const totalTopics = subjectTopics.length;
  const completedTopics = subjectTopics.filter(t => t.completed).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const weakCount = subjectTopics.filter(t => t.mastery === 'weak').length;
  const okayCount = subjectTopics.filter(t => t.mastery === 'okay').length;
  const strongCount = subjectTopics.filter(t => t.mastery === 'strong').length;
  const urgency = getExamUrgencyColor(currentSubject.examDate);

  // Handlers
  const handleCreateTopic = (unit: SubjectUnit, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const videoUrls: string[] = [];
    if (newTopicVideoUrl.trim()) {
      videoUrls.push(newTopicVideoUrl.trim());
    }

    const newTopic: SyllabusTopic = {
      id: `top-${currentSubject.id}-${unit.id}-${Date.now().toString(36)}`,
      subjectId: currentSubject.id,
      unitId: unit.id,
      unitNumber: unit.unitNumber || unit.unit || unit.title,
      title: newTopicTitle.trim(),
      completed: false,
      mastery: newTopicMastery,
      videoUrls,
      pyqCount: 0
    };

    onAddTopic(newTopic);
    setNewTopicTitle('');
    setNewTopicVideoUrl('');
    setIsAddingTopicUnitId(null);
    onShowToast(`Added topic to ${unit.title || `Unit ${unit.unit}`}!`, 'success');
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;
    onAddUnit(currentSubject.id, newUnitTitle.trim());
    setNewUnitTitle('');
    setIsAddingUnit(false);
    onShowToast(`Created "${newUnitTitle.trim()}"!`, 'success');
  };

  const handleRenameUnitSubmit = (unitId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnitTitle.trim()) return;
    if (onRenameUnit) {
      onRenameUnit(currentSubject.id, unitId, editingUnitTitle.trim());
      onShowToast('Unit renamed successfully.', 'success');
    }
    setEditingUnitId(null);
  };

  const handleDeleteUnitClick = (unitId: string, unitTitle: string) => {
    if (window.confirm(`Delete "${unitTitle}" and all its topics?`)) {
      if (onDeleteUnit) {
        onDeleteUnit(currentSubject.id, unitId);
        onShowToast(`Deleted "${unitTitle}".`, 'info');
      }
    }
  };

  const handleAddVideoToTopicSubmit = (topicId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) return;
    if (onAddTopicVideo) {
      onAddTopicVideo(topicId, videoUrlInput.trim());
      onShowToast('YouTube video attached to topic! 🎥', 'success');
    }
    setVideoUrlInput('');
    setAddingVideoTopicId(null);
  };

  // File Upload Handler (Requirement 8: Stored in IndexedDB, separated by exam)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      const isImg = file.type.includes('image') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);

      const newSubjectFile: SubjectFile = {
        id: `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        examId: activeExamId,
        subjectId: currentSubject.id,
        name: uploadTitle.trim() || file.name,
        category: uploadCategory,
        fileType: isPdf ? 'pdf' : (isImg ? 'image' : 'file'),
        dataUrl,
        size: file.size,
        year: uploadCategory === 'pyq' ? uploadYear : undefined,
        examType: uploadCategory === 'pyq' ? uploadExamType : undefined,
        isImportant: false,
        isDone: false,
        createdAt: Date.now()
      };

      await indexedDbService.addFile(newSubjectFile);
      setSubjectFiles(prev => [newSubjectFile, ...prev]);
      setIsUploadingFile(false);
      setUploadTitle('');
      onShowToast(`Uploaded "${newSubjectFile.name}" to IndexedDB! 📄`, 'success');
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm('Delete this file from IndexedDB?')) {
      await indexedDbService.deleteFile(fileId);
      setSubjectFiles(prev => prev.filter(f => f.id !== fileId));
      onShowToast('File deleted.', 'info');
    }
  };

  const filteredFiles = subjectFiles.filter(f => {
    if (fileFilter === 'all') return true;
    return f.category === fileFilter;
  });

  return (
    <div className="space-y-6 animate-fade-slide-up pb-16">
      
      {/* Top Header & Single "+ Add Subject" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Syllabus Tracker & Mastery Hub</span>
          </h2>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            Manage your units, topics with Weak/Okay/Strong tags, attached YouTube videos, and subject files.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* REQUIREMENT 2: Single "+ Add Subject" button (one icon, text "Add Subject") */}
          {onOpenAddSubject && (
            <button
              onClick={onOpenAddSubject}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 btn-tactile shadow-sm"
              title="Add a new subject to this exam"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          )}

          {/* "+ Add Syllabus Unit" button */}
          <button
            onClick={() => setIsAddingUnit(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-paper-border dark:border-night-border bg-paper-card dark:bg-night-card hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated text-paper-ink dark:text-night-text flex items-center gap-1.5 btn-tactile shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* Subject Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-paper-border dark:border-night-border max-w-full">
        {subjects.map(s => {
          const isSelected = s.id === selectedSubjectId;
          const subTopics = topics.filter(t => t.subjectId === s.id);
          const percent = subTopics.length > 0 
            ? Math.round((subTopics.filter(t => t.completed).length / subTopics.length) * 100) 
            : 0;

          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubjectId(s.id);
                onSelectSubject(s.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 btn-tactile whitespace-nowrap transition-all ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'text-paper-body dark:text-night-text bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated'
              }`}
              style={{
                backgroundColor: isSelected ? s.accentColor : undefined
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? '#FFFFFF' : s.accentColor }} />
              <span>{s.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${isSelected ? 'bg-black/20 text-white' : 'bg-paper-cardElevated dark:bg-night-cardElevated text-paper-muted dark:text-night-muted'}`}>
                {percent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Subject Overview Banner with Edit Subject Button & % Progress */}
      <div 
        className="p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-5"
        style={{ borderLeft: `6px solid ${currentSubject.accentColor}` }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span 
                className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono uppercase"
                style={{ backgroundColor: `${currentSubject.accentColor}18`, color: currentSubject.accentColor }}
              >
                {currentSubject.name}
              </span>

              {/* Countdown badge */}
              <span 
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1"
                style={{ color: urgency.hslColor, backgroundColor: `${urgency.hslColor}16` }}
              >
                <Calendar className="w-3 h-3" />
                <span>{urgency.fractionalDays > 0 ? `${urgency.days}d ${urgency.hours}h left` : 'Completed'}</span>
              </span>

              {/* REQUIREMENT 4: Edit Subject's Name and Exam Date */}
              {onEditSubject && (
                <button
                  onClick={() => onEditSubject(currentSubject)}
                  className="px-2.5 py-0.5 rounded-md border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated text-[11px] font-semibold text-paper-ink dark:text-night-text hover:border-emerald-500 flex items-center gap-1 btn-tactile"
                  title="Edit Subject Name & Exam Date"
                >
                  <Edit2 className="w-3 h-3 text-emerald-500" />
                  <span>Edit Subject</span>
                </button>
              )}
            </div>

            <h3 className="text-xl font-extrabold text-paper-ink dark:text-night-text">
              Syllabus Completion: {progressPercent}%
            </h3>
          </div>

          {/* Mastery Breakdown Stats */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400">{weakCount} Topics</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Weak</div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{okayCount} Topics</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Okay</div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{strongCount} Topics</div>
              <div className="text-[10px] text-paper-muted dark:text-night-muted">Strong</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-3 rounded-full bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: currentSubject.accentColor }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-paper-muted dark:text-night-muted font-mono">
            <span>{completedTopics} of {totalTopics} topics studied</span>
            <span>{totalTopics - completedTopics} topics remaining</span>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 5: Add Unit Form (User types unit number or name freely, never auto-renamed or renumbered) */}
      {isAddingUnit && (
        <form onSubmit={handleCreateUnit} className="p-4 rounded-2xl bg-paper-card dark:bg-night-card border border-emerald-500/40 space-y-3 animate-fade-slide-up shadow-md">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Add Custom Unit to {currentSubject.name}</span>
            </h4>
            <button type="button" onClick={() => setIsAddingUnit(false)} className="text-paper-muted hover:text-paper-ink">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              placeholder="Type unit number or name (e.g. Unit 3, Unit 4, or Thermodynamics)..."
              value={newUnitTitle}
              onChange={e => setNewUnitTitle(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500 font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold btn-tactile shadow-sm shrink-0"
            >
              Add Unit
            </button>
          </div>
        </form>
      )}

      {/* REQUIREMENT 7: Each unit is its own card/box with name, progress %, and topics listed inside in consistent order */}
      <div className="space-y-6">
        {(currentSubject.units || []).map((unit, unitIdx) => {
          const unitTopics = subjectTopics.filter(t => t.unitId === unit.id || t.unitNumber === unit.unit || t.unitNumber === unit.title || t.unitNumber === unit.name);
          const unitCompleted = unitTopics.filter(t => t.completed).length;
          const unitPercent = unitTopics.length > 0 ? Math.round((unitCompleted / unitTopics.length) * 100) : 0;
          const isAddingToThisUnit = isAddingTopicUnitId === unit.id;
          const isEditingThisUnit = editingUnitId === unit.id;

          const unitDisplayName = unit.title || unit.name || (unit.unitNumber ? String(unit.unitNumber) : `Unit ${unit.unit || unitIdx + 1}`);

          return (
            <div 
              key={unit.id}
              className="p-5 sm:p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-4"
              style={{ borderLeft: `5px solid ${currentSubject.accentColor}` }}
            >
              {/* Unit Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-border dark:border-night-border">
                
                {isEditingThisUnit ? (
                  <form onSubmit={(e) => handleRenameUnitSubmit(unit.id, e)} className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingUnitTitle}
                      onChange={(e) => setEditingUnitTitle(e.target.value)}
                      autoFocus
                      required
                      className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-emerald-500 text-paper-ink dark:text-night-text focus:outline-none"
                    />
                    <button type="submit" className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg">Save</button>
                    <button type="button" onClick={() => setEditingUnitId(null)} className="px-2 py-1.5 text-xs text-paper-muted">Cancel</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-paper-ink dark:text-night-text truncate">
                          {unitDisplayName}
                        </h4>
                        
                        {/* Unit Edit / Rename Button */}
                        {onRenameUnit && (
                          <button
                            onClick={() => {
                              setEditingUnitId(unit.id);
                              setEditingUnitTitle(unitDisplayName);
                            }}
                            className="p-1 rounded text-paper-muted hover:text-paper-ink dark:text-night-muted"
                            title="Rename unit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Reorder Up / Down Controls (Requirement 5) */}
                        {onReorderUnit && (
                          <div className="flex items-center gap-0.5">
                            <button
                              disabled={unitIdx === 0}
                              onClick={() => onReorderUnit(currentSubject.id, unit.id, 'up')}
                              className="p-1 rounded text-paper-muted hover:text-paper-ink disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move unit up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={unitIdx === (currentSubject.units?.length || 0) - 1}
                              onClick={() => onReorderUnit(currentSubject.id, unit.id, 'down')}
                              className="p-1 rounded text-paper-muted hover:text-paper-ink disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move unit down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Delete Unit */}
                        {onDeleteUnit && (
                          <button
                            onClick={() => handleDeleteUnitClick(unit.id, unitDisplayName)}
                            className="p-1 rounded text-paper-muted hover:text-rose-500"
                            title="Delete unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <span className="text-[11px] text-paper-muted dark:text-night-muted font-mono">
                        {unitCompleted} of {unitTopics.length} topics finished ({unitPercent}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* + Add Topic Button */}
                <button
                  onClick={() => setIsAddingTopicUnitId(isAddingToThisUnit ? null : unit.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:border-emerald-500 text-paper-ink dark:text-night-text flex items-center gap-1.5 btn-tactile self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>+ Add Topic</span>
                </button>
              </div>

              {/* REQUIREMENT 6: Inline Form to Add Topic with title, mastery & YouTube video link */}
              {isAddingToThisUnit && (
                <form onSubmit={e => handleCreateTopic(unit, e)} className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-emerald-500/30 space-y-3 animate-fade-slide-up">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-paper-ink dark:text-night-text">
                      Add Topic to {unitDisplayName}
                    </span>
                    <button type="button" onClick={() => setIsAddingTopicUnitId(null)} className="text-paper-muted hover:text-paper-ink">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        required
                        placeholder="Topic title (e.g. Banker's Algorithm Safe Sequences)..."
                        value={newTopicTitle}
                        onChange={e => setNewTopicTitle(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500 font-medium"
                      />

                      {/* Mastery Selector */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setNewTopicMastery('weak')}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${newTopicMastery === 'weak' ? 'bg-rose-600 text-white' : 'bg-paper-card dark:bg-night-card text-rose-600'}`}
                        >
                          Weak
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTopicMastery('okay')}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${newTopicMastery === 'okay' ? 'bg-amber-600 text-white' : 'bg-paper-card dark:bg-night-card text-amber-600'}`}
                        >
                          Okay
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTopicMastery('strong')}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${newTopicMastery === 'strong' ? 'bg-emerald-600 text-white' : 'bg-paper-card dark:bg-night-card text-emerald-600'}`}
                        >
                          Strong
                        </button>
                      </div>
                    </div>

                    {/* Optional YouTube Video link right in topic creation */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Video className="w-3.5 h-3.5 text-paper-muted absolute left-3 top-2.5" />
                        <input
                          type="url"
                          placeholder="Optional YouTube Video link (e.g. https://youtube.com/watch?v=...)"
                          value={newTopicVideoUrl}
                          onChange={e => setNewTopicVideoUrl(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold btn-tactile shadow-sm shrink-0"
                      >
                        Save Topic
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* REQUIREMENT 6: Topics List with Checkbox (done), Weak/Okay/Strong tags, and YouTube video links */}
              <div className="space-y-2.5">
                {unitTopics.map(topic => {
                  const videosList = topic.videoUrls || [];
                  const isAddingVideo = addingVideoTopicId === topic.id;

                  return (
                    <div 
                      key={topic.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 group ${
                        topic.completed
                          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80'
                          : 'bg-paper-cardElevated dark:bg-night-cardElevated border-paper-border dark:border-night-border hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Checkbox + Title */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => onToggleTopicCompleted(topic.id)}
                            className="p-1 text-paper-muted hover:text-emerald-600 dark:text-night-muted dark:hover:text-emerald-400 transition-colors btn-tactile shrink-0"
                            title={topic.completed ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            {topic.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-paper-muted dark:text-night-muted" />
                            )}
                          </button>

                          <span className={`text-xs font-bold line-clamp-1 ${topic.completed ? 'line-through text-paper-muted dark:text-night-muted' : 'text-paper-ink dark:text-night-text'}`}>
                            {topic.title}
                          </span>
                        </div>

                        {/* Mastery Tags & Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          
                          {/* Weak / Okay / Strong Pills */}
                          <div className="flex items-center gap-1 p-1 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-[10px] font-bold">
                            <button
                              onClick={() => onSetTopicMastery(topic.id, 'weak')}
                              className={`px-2 py-0.5 rounded-md transition-all ${
                                topic.mastery === 'weak'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                              }`}
                              title="Mark as Weak"
                            >
                              Weak
                            </button>

                            <button
                              onClick={() => onSetTopicMastery(topic.id, 'okay')}
                              className={`px-2 py-0.5 rounded-md transition-all ${
                                topic.mastery === 'okay'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                              }`}
                              title="Mark as Okay"
                            >
                              Okay
                            </button>

                            <button
                              onClick={() => onSetTopicMastery(topic.id, 'strong')}
                              className={`px-2 py-0.5 rounded-md transition-all ${
                                topic.mastery === 'strong'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title="Mark as Strong"
                            >
                              Strong
                            </button>
                          </div>

                          {/* + Attach Video Button */}
                          <button
                            onClick={() => setAddingVideoTopicId(isAddingVideo ? null : topic.id)}
                            className="p-1.5 text-paper-muted hover:text-emerald-600 dark:text-night-muted dark:hover:text-emerald-400 rounded-lg hover:bg-paper-card dark:hover:bg-night-card transition-colors flex items-center gap-1 text-[11px] font-semibold"
                            title="Attach YouTube video to topic"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">+ Video</span>
                          </button>

                          {/* Delete Topic Button */}
                          <button
                            onClick={() => onDeleteTopic(topic.id)}
                            className="p-1.5 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 rounded-lg hover:bg-paper-card dark:hover:bg-night-card transition-colors opacity-70 group-hover:opacity-100"
                            title="Delete topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Attached YouTube Video Links for this topic */}
                      {videosList.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pl-8 pt-1">
                          {videosList.map((url, vIdx) => {
                            const ytId = extractYoutubeId(url);
                            return (
                              <div
                                key={vIdx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold group/video"
                              >
                                <button
                                  type="button"
                                  onClick={() => setActiveVideoModalUrl(url)}
                                  className="flex items-center gap-1 hover:underline"
                                  title="Watch Video"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Video {vIdx + 1} {ytId ? `(${ytId.slice(0, 5)}...)` : ''}</span>
                                </button>

                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-0.5 text-paper-muted hover:text-paper-ink"
                                  title="Open in new YouTube tab"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>

                                {onRemoveTopicVideo && (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveTopicVideo(topic.id, url)}
                                    className="p-0.5 text-paper-muted hover:text-rose-500"
                                    title="Remove this video link"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Inline Form to add another YouTube link to this topic */}
                      {isAddingVideo && (
                        <form
                          onSubmit={(e) => handleAddVideoToTopicSubmit(topic.id, e)}
                          className="flex items-center gap-2 pl-8 pt-1 animate-fade-slide-up"
                        >
                          <input
                            type="url"
                            required
                            placeholder="Paste YouTube link (https://youtube.com/watch?v=...)"
                            value={videoUrlInput}
                            onChange={(e) => setVideoUrlInput(e.target.value)}
                            autoFocus
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-paper-card dark:bg-night-card border border-emerald-500 text-paper-ink dark:text-night-text focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg shadow-sm"
                          >
                            Attach
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingVideoTopicId(null)}
                            className="px-2 py-1.5 text-xs text-paper-muted"
                          >
                            Cancel
                          </button>
                        </form>
                      )}

                    </div>
                  );
                })}

                {unitTopics.length === 0 && (
                  <div className="text-center py-4 text-xs text-paper-muted dark:text-night-muted italic">
                    No topics added to {unitDisplayName} yet. Click "+ Add Topic" above to get started.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* REQUIREMENT 8: FILES (PYQ Papers, Teacher PDFs and Images stored in IndexedDB, separated by exam) */}
      <div className="p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-border dark:border-night-border">
          <div>
            <h3 className="text-lg font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{currentSubject.name} — Files & Study Materials</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-muted dark:text-night-muted font-bold font-mono">
                {filteredFiles.length} Stored in IndexedDB
              </span>
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
              Upload past-year papers, teacher lecture notes, and whiteboard photos. Separated per exam session.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadingFile(!isUploadingFile)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 btn-tactile shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>+ Upload Material</span>
            </button>
          </div>
        </div>

        {/* Upload Form */}
        {isUploadingFile && (
          <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-emerald-500/30 space-y-3 animate-fade-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-paper-ink dark:text-night-text">
                Upload to {currentSubject.name} (Exam: {activeExamId})
              </span>
              <button onClick={() => setIsUploadingFile(false)} className="text-paper-muted hover:text-paper-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-paper-muted mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as FileCategory)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text"
                >
                  <option value="pyq">PYQ Exam Paper (PDF)</option>
                  <option value="notes">Teacher Notes (PDF/Text)</option>
                  <option value="images">Diagrams & Whiteboard (Image)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-paper-muted mb-1">Title / Label</label>
                <input
                  type="text"
                  placeholder="e.g. 2024 End Sem Paper..."
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-paper-muted mb-1">Select File (PDF / Image)</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-paper-ink dark:text-night-text file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          {(['all', 'pyq', 'notes', 'images'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFileFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                fileFilter === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-paper-cardElevated dark:bg-night-cardElevated text-paper-muted hover:text-paper-ink border border-paper-border dark:border-night-border'
              }`}
            >
              {cat === 'all' ? 'All Files' : cat === 'pyq' ? 'PYQ Papers' : cat === 'notes' ? 'Teacher Notes' : 'Images'}
            </button>
          ))}
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredFiles.map(file => {
            const isImg = file.fileType === 'image';

            return (
              <div
                key={file.id}
                className="p-3.5 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex items-center justify-center shrink-0">
                    {isImg ? (
                      <Image className="w-5 h-5 text-amber-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-paper-ink dark:text-night-text truncate" title={file.name}>
                      {file.name}
                    </h5>
                    <div className="text-[10px] text-paper-muted flex items-center gap-1.5 mt-0.5">
                      <span className="uppercase font-mono">{file.category}</span>
                      {file.year && <span>• {file.year}</span>}
                      {file.examType && <span>• {file.examType}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-paper-border dark:border-night-border">
                  <a
                    href={file.dataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open / Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-1 text-paper-muted hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredFiles.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-paper-muted dark:text-night-muted italic border border-dashed border-paper-border dark:border-night-border rounded-2xl">
              No files uploaded yet for this subject. Click "+ Upload Material" above to add your PYQs, PDFs, or photos.
            </div>
          )}
        </div>

      </div>

      {/* Embedded YouTube Video Modal (Requirement 6: Videos should open or embed from the topic) */}
      {activeVideoModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-slide-up">
          <div className="w-full max-w-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border rounded-3xl overflow-hidden shadow-2xl relative space-y-3 p-4">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-500" />
                <span>Embedded Lecture Player</span>
              </span>
              <button
                onClick={() => setActiveVideoModalUrl(null)}
                className="p-1.5 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-paper-border dark:border-night-border">
              {extractYoutubeId(activeVideoModalUrl) ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${extractYoutubeId(activeVideoModalUrl)}?autoplay=1`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <p className="text-xs text-paper-muted">Cannot embed this URL directly.</p>
                  <a
                    href={activeVideoModalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <span>Open in YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
