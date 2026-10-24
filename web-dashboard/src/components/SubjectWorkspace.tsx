import React, { useState } from 'react';
import { SubjectMeta, PYQQuestion, StudyTask, VideoResource, PdfResource } from '../types';
import { getExamUrgencyColor } from '../utils/storageService';
import { StudyPlanTab } from './StudyPlanTab';
import { PyqBankTab } from './PyqBankTab';
import { VideoLearningTab } from './VideoLearningTab';
import { PdfVaultTab } from './PdfVaultTab';
import { EditExamDateModal } from './EditExamDateModal';
import { 
  Clock, Calendar, ArrowLeft, Trash2, Cpu, Database, Network, 
  Code, BookOpen, ClipboardList, Flame, Video, FileText, AlertCircle
} from 'lucide-react';

interface SubjectWorkspaceProps {
  subject: SubjectMeta;
  questions: PYQQuestion[];
  tasks: StudyTask[];
  videos: VideoResource[];
  pdfs: PdfResource[];
  onToggleMastered: (id: string) => void;
  onSaveAnswer: (id: string, answer: string, score: number) => void;
  onAddQuestion: (q: PYQQuestion) => void;
  onToggleTask: (id: string) => void;
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onAddVideo: (video: VideoResource) => void;
  onUpdateVideoNotes: (videoId: string, notes: string) => void;
  onToggleVideoWatched: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onAddPdf: (pdf: PdfResource) => void;
  onDeletePdf: (id: string) => void;
  onUpdateSubject: (subject: SubjectMeta) => void;
  onDeleteSubject: (id: string) => void;
  onBackToOverview: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type WorkspaceTab = 'plan' | 'pyqs' | 'videos' | 'pdfs';

export const SubjectWorkspace: React.FC<SubjectWorkspaceProps> = ({
  subject,
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
  onUpdateSubject,
  onDeleteSubject,
  onBackToOverview,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('plan');
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Dynamic urgency color and formatted date/countdown
  const urgency = getExamUrgencyColor(subject.examDate);

  const subjectQuestions = questions.filter(q => q.subjectId === subject.id);
  const subjectVideos = videos.filter(v => v.subjectId === subject.id);
  const subjectPdfs = pdfs.filter(p => p.subjectId === subject.id);

  const getSubjectIcon = (name: string) => {
    switch (name) {
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Database': return <Database className="w-5 h-5" />;
      case 'Network': return <Network className="w-5 h-5" />;
      case 'Code': return <Code className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-slide-up">
      
      {/* Top Subject Command Header */}
      <div 
        className={`p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card transition-all duration-600 ${urgency.isUrgent ? 'pulse-urgent-exam' : ''}`}
        style={{ borderTop: `5px solid ${urgency.hslColor}` }}
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
                backgroundColor: `${urgency.hslColor}18`, 
                color: urgency.hslColor
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
                  {subject.units.length} Units • {subjectQuestions.length} PYQs
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-paper-ink dark:text-night-text mt-0.5 tracking-tight">
                {subject.name}
              </h2>
            </div>
          </div>

          {/* Right: Visible Exam Date with 1-Click Change Date & Live Countdown */}
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

            {/* Live Countdown Badge */}
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

        {/* 4 Clean Tabs with Short Clear Names */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-paper-border dark:border-night-border overflow-x-auto pb-1">
          
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 btn-tactile transition-all whitespace-nowrap ${
              activeTab === 'plan'
                ? 'bg-emerald-600 text-white shadow-glow-emerald dark:bg-emerald-500 dark:text-night-bg'
                : 'text-paper-body dark:text-night-text bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:bg-paper-card dark:hover:bg-night-card'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>📋 Study Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('pyqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 btn-tactile transition-all whitespace-nowrap ${
              activeTab === 'pyqs'
                ? 'bg-emerald-600 text-white shadow-glow-emerald dark:bg-emerald-500 dark:text-night-bg'
                : 'text-paper-body dark:text-night-text bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:bg-paper-card dark:hover:bg-night-card'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>🔥 Past Exam Questions (PYQs)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
              {subjectQuestions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 btn-tactile transition-all whitespace-nowrap ${
              activeTab === 'videos'
                ? 'bg-emerald-600 text-white shadow-glow-emerald dark:bg-emerald-500 dark:text-night-bg'
                : 'text-paper-body dark:text-night-text bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:bg-paper-card dark:hover:bg-night-card'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>🎬 Video Links</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
              {subjectVideos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pdfs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 btn-tactile transition-all whitespace-nowrap ${
              activeTab === 'pdfs'
                ? 'bg-emerald-600 text-white shadow-glow-emerald dark:bg-emerald-500 dark:text-night-bg'
                : 'text-paper-body dark:text-night-text bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border hover:bg-paper-card dark:hover:bg-night-card'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 PDFs & Notes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
              {subjectPdfs.length}
            </span>
          </button>

        </div>

      </div>

      {/* Active Tab View */}
      {activeTab === 'plan' && (
        <StudyPlanTab
          subject={subject}
          urgency={urgency}
          tasks={tasks}
          onToggleTask={onToggleTask}
          onAddTask={onAddTask}
          onDeleteTask={onDeleteTask}
          onOpenEditDate={() => setIsEditDateOpen(true)}
        />
      )}

      {activeTab === 'pyqs' && (
        <PyqBankTab
          subject={subject}
          questions={questions}
          onToggleMastered={onToggleMastered}
          onSaveAnswer={onSaveAnswer}
          onAddQuestion={onAddQuestion}
          onShowToast={onShowToast}
        />
      )}

      {activeTab === 'videos' && (
        <VideoLearningTab
          subject={subject}
          videos={videos}
          onAddVideo={onAddVideo}
          onUpdateNotes={onUpdateVideoNotes}
          onToggleWatched={onToggleVideoWatched}
          onDeleteVideo={onDeleteVideo}
        />
      )}

      {activeTab === 'pdfs' && (
        <PdfVaultTab
          subject={subject}
          pdfs={pdfs}
          onAddPdf={onAddPdf}
          onDeletePdf={onDeletePdf}
        />
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
