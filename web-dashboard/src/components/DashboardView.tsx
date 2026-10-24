import React, { useState, useRef } from 'react';
import { SubjectMeta, SubjectFile } from '../types';
import { getExamUrgencyColor, sortSubjectsByExamUrgency } from '../utils/storageService';
import { EditSubjectModal } from './EditSubjectModal';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  FileText, 
  Database, 
  Download, 
  Upload, 
  ShieldCheck, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface DashboardViewProps {
  subjects: SubjectMeta[];
  files: SubjectFile[];
  onSelectSubject: (id: string) => void;
  onOpenAddSubject: () => void;
  onUpdateSubject: (subject: SubjectMeta) => void;
  onDeleteSubject: (id: string) => void;
  storageUsage: { totalBytes: number; formatted: string; fileCount: number };
  onExportBackup: () => void;
  onImportBackup: (content: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  files,
  onSelectSubject,
  onOpenAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  storageUsage,
  onExportBackup,
  onImportBackup,
  onShowToast
}) => {
  const [editingSubject, setEditingSubject] = useState<SubjectMeta | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-sort subjects by exam date (nearest exam first)
  const sortedSubjects = React.useMemo(() => {
    return sortSubjectsByExamUrgency(subjects);
  }, [subjects]);

  // Find nearest upcoming exam
  const nearestSubjectWithUrgency = React.useMemo(() => {
    if (sortedSubjects.length === 0) return null;
    const top = sortedSubjects[0];
    return {
      subject: top,
      urgency: getExamUrgencyColor(top.examDate)
    };
  }, [sortedSubjects]);

  const handleDeleteClick = (e: React.MouseEvent, subject: SubjectMeta) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${subject.name}" and all its saved files? This cannot be undone.`)) {
      onDeleteSubject(subject.id);
      onShowToast(`Deleted "${subject.name}"`, 'info');
    }
  };

  const handleEditClick = (e: React.MouseEvent, subject: SubjectMeta) => {
    e.stopPropagation();
    setEditingSubject(subject);
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-fade-slide-up pb-16">
      
      {/* 1. TOP HERO: NEAREST UPCOMING EXAM COUNTDOWN */}
      {nearestSubjectWithUrgency && (
        <div 
          className="p-6 sm:p-8 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card relative overflow-hidden transition-all"
          style={{ 
            borderTop: `6px solid ${nearestSubjectWithUrgency.subject.accentColor}`,
            boxShadow: `0 10px 30px -10px ${nearestSubjectWithUrgency.subject.accentColor}25`
          }}
        >
          {/* Subtle glow */}
          <div 
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15"
            style={{ backgroundColor: nearestSubjectWithUrgency.subject.accentColor }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ 
                    color: nearestSubjectWithUrgency.urgency.hslColor,
                    backgroundColor: `${nearestSubjectWithUrgency.urgency.hslColor}18`
                  }}
                >
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Next Exam Up</span>
                </span>

                <span className="text-xs text-paper-muted dark:text-night-muted font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{nearestSubjectWithUrgency.urgency.formattedExamDate}</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-paper-ink dark:text-night-text tracking-tight">
                {nearestSubjectWithUrgency.subject.name}
              </h2>
              <p className="text-xs sm:text-sm text-paper-muted dark:text-night-muted mt-1">
                {files.filter(f => f.subjectId === nearestSubjectWithUrgency.subject.id).length} files ready for revision
              </p>
            </div>

            {/* Countdown Badge & Quick Jump */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border rounded-2xl p-3 sm:p-4 shadow-sm">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: `${nearestSubjectWithUrgency.urgency.hslColor}20`,
                    color: nearestSubjectWithUrgency.urgency.hslColor 
                  }}
                >
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted">
                    Time Remaining
                  </div>
                  <div 
                    className="text-xl sm:text-2xl font-mono font-extrabold tracking-tight"
                    style={{ color: nearestSubjectWithUrgency.urgency.hslColor }}
                  >
                    {nearestSubjectWithUrgency.urgency.days}d {nearestSubjectWithUrgency.urgency.hours}h {nearestSubjectWithUrgency.urgency.minutes}m {nearestSubjectWithUrgency.urgency.seconds}s
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectSubject(nearestSubjectWithUrgency.subject.id)}
                className="px-5 py-3.5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg dark:hover:bg-emerald-400 font-bold text-xs flex items-center gap-2 shadow-sm btn-tactile"
              >
                <span>Open Subject</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. DASHBOARD BAR: STORAGE INFO, BACKUP & ONLY "+ ADD SUBJECT" BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-sm">
        
        {/* Storage usage indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
              <span>IndexedDB Storage</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {storageUsage.formatted} used
              </span>
            </div>
            <div className="text-[11px] text-paper-muted dark:text-night-muted">
              {storageUsage.fileCount} total files stored offline in browser
            </div>
          </div>
        </div>

        {/* Action Buttons: Export, Import & The ONLY + Add Subject Button */}
        <div className="flex items-center gap-2 flex-wrap">
          
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleBackupFileSelect}
            className="hidden"
          />

          <button
            onClick={onExportBackup}
            className="px-3 py-2 rounded-xl border border-paper-border dark:border-night-border text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Download single JSON backup with all files and notes"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl border border-paper-border dark:border-night-border text-paper-body dark:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Restore all data from JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-500" />
            <span>Import Backup</span>
          </button>

          {/* THE SINGLE + ADD SUBJECT BUTTON REQUIRED ON DASHBOARD ONLY */}
          <button
            onClick={onOpenAddSubject}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg dark:hover:bg-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm btn-tactile btn-shimmer"
            title="Add a new subject to your study dashboard"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subject</span>
          </button>

        </div>

      </div>

      {/* 3. ALL SUBJECTS CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>All College Subjects</span>
            <span className="text-xs text-paper-muted dark:text-night-muted font-normal">
              ({subjects.length})
            </span>
          </h3>
          <span className="text-xs text-paper-muted dark:text-night-muted">
            Sorted by exam date
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-paper-card dark:bg-night-card border border-dashed border-paper-border dark:border-night-border space-y-4">
            <BookOpen className="w-12 h-12 mx-auto text-paper-muted dark:text-night-muted opacity-40" />
            <div className="text-base font-bold text-paper-ink dark:text-night-text">
              No subjects yet!
            </div>
            <p className="text-xs text-paper-muted dark:text-night-muted max-w-sm mx-auto">
              Click the "+ Add Subject" button above to add your first semester course and start uploading PYQs and notes.
            </p>
            <button
              onClick={onOpenAddSubject}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white dark:bg-emerald-500 dark:text-night-bg text-xs font-bold shadow-sm"
            >
              + Add Subject Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedSubjects.map(sub => {
              const u = getExamUrgencyColor(sub.examDate);
              const subFiles = files.filter(f => f.subjectId === sub.id);
              const fileCount = subFiles.length;
              const pyqCount = subFiles.filter(f => f.category === 'pyq').length;
              const notesCount = subFiles.filter(f => f.category === 'notes').length;
              const imgCount = subFiles.filter(f => f.category === 'images').length;

              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubject(sub.id)}
                  className="group relative rounded-3xl p-5 bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:border-emerald-500/50 shadow-paper-card dark:shadow-night-card transition-all cursor-pointer flex flex-col justify-between gap-5 hover:-translate-y-1 hover:shadow-xl"
                  style={{ 
                    borderTop: `5px solid ${sub.accentColor}`
                  }}
                >
                  
                  {/* Card Top: Subject Name, Code & Actions */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: sub.accentColor }} 
                          />
                          <h4 className="text-lg font-bold text-paper-ink dark:text-night-text truncate group-hover:text-emerald-500 transition-colors">
                            {sub.name}
                          </h4>
                        </div>
                        {sub.code && (
                          <span className="text-[11px] font-mono font-bold text-paper-muted dark:text-night-muted mt-0.5 block">
                            {sub.code} {sub.semester ? `• ${sub.semester}` : ''}
                          </span>
                        )}
                      </div>

                      {/* Card Edit and Delete buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleEditClick(e, sub)}
                          className="p-1.5 rounded-lg text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated border border-paper-border dark:border-night-border transition-colors"
                          title="Edit subject name & exam date"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, sub)}
                          className="p-1.5 rounded-lg text-paper-muted hover:text-red-500 dark:text-night-muted dark:hover:text-red-400 hover:bg-red-500/10 border border-paper-border dark:border-night-border transition-colors"
                          title="Delete subject (asks confirmation)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Live Exam Countdown */}
                    <div className="mt-3 p-3 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Clock 
                          className="w-4 h-4 shrink-0" 
                          style={{ color: u.hslColor }} 
                        />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted">
                            Exam Date
                          </div>
                          <div className="text-xs font-semibold text-paper-ink dark:text-night-text">
                            {u.formattedExamDate}
                          </div>
                        </div>
                      </div>

                      <span 
                        className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold shrink-0"
                        style={{ 
                          color: u.hslColor,
                          backgroundColor: `${u.hslColor}16`
                        }}
                      >
                        {u.days}d {u.hours}h left
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom: Number of files inside & Open Arrow */}
                  <div className="pt-3 border-t border-paper-border dark:border-night-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-paper-muted dark:text-night-muted font-bold">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>{fileCount} File{fileCount === 1 ? '' : 's'} inside</span>
                      <span className="text-[10px] opacity-70">
                        ({pyqCount} PYQ, {notesCount} Notes, {imgCount} Img)
                      </span>
                    </div>

                    <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Subject Modal */}
      <EditSubjectModal
        subject={editingSubject}
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        onUpdate={onUpdateSubject}
        onDelete={onDeleteSubject}
      />

    </div>
  );
};
