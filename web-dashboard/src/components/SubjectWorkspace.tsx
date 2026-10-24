import React, { useState } from 'react';
import { SubjectMeta, PYQQuestion, StudyTask, VideoResource, PdfResource, CountdownTime } from '../types';
import { SmartActionPlanTab } from './SmartActionPlanTab';
import { VideoLearningTab } from './VideoLearningTab';
import { PdfVaultTab } from './PdfVaultTab';
import { PyqBankTab } from './PyqBankTab';
import { EditExamDateModal } from './EditExamDateModal';
import { EditSubjectModal } from './EditSubjectModal';
import { 
  Clock, Calendar, Sparkles, Video, FileText, Flame, 
  ArrowLeft, Edit3, Trash2, Cpu, Database, Network, Code, BookOpen 
} from 'lucide-react';

interface SubjectWorkspaceProps {
  subject: SubjectMeta;
  countdown: CountdownTime;
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

type WorkspaceTab = 'action' | 'videos' | 'pdfs' | 'pyqs';

export const SubjectWorkspace: React.FC<SubjectWorkspaceProps> = ({
  subject,
  countdown,
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
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('action');
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);

  const subjectQuestions = questions.filter(q => q.subjectId === subject.id);
  const subjectVideos = videos.filter(v => v.subjectId === subject.id);
  const subjectPdfs = pdfs.filter(p => p.subjectId === subject.id);
  const subjectTasks = tasks.filter(t => t.subjectId === subject.id);

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
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Subject Command Bar */}
      <div 
        className="p-6 rounded-3xl hud-glass-panel relative overflow-hidden"
        style={{ borderColor: `${subject.accentColor}35` }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Back button, Icon, Name & Code */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToOverview}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors shrink-0"
              title="Back to Command Center Overview"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ 
                backgroundColor: `${subject.accentColor}25`, 
                color: subject.accentColor,
                boxShadow: `0 0 20px -2px ${subject.accentColor}40`
              }}
            >
              {getSubjectIcon(subject.iconName)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-cyan-300">
                  {subject.code}
                </span>
                <span className="text-xs text-slate-400">
                  {subject.semester}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">
                {subject.name}
              </h2>
            </div>
          </div>

          {/* Right: Live Ticking Countdown HUD & Quick Subject Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Countdown Badge */}
            <div 
              onClick={() => setIsEditDateOpen(true)}
              className="px-4 py-2 rounded-2xl bg-black/40 border border-white/15 cursor-pointer hover:border-cyan-400 transition-all flex items-center gap-3 select-none"
              title="Click to edit exam date & time"
            >
              <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Target Exam Countdown
                </div>
                <div className="text-sm font-extrabold font-mono text-cyan-300">
                  {countdown.label}
                </div>
              </div>
            </div>

            {/* Edit Subject Button */}
            <button
              onClick={() => setIsEditSubjectOpen(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              title="Edit Subject & Syllabus"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 4 Multi-Media Workspace Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('action')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'action'
                ? 'bg-cyan-500 text-black shadow-neon-cyan'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1. Smart Action Plan & Concept Explainer
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'videos'
                ? 'bg-cyan-500 text-black shadow-neon-cyan'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            2. Video Hub ({subjectVideos.length})
          </button>

          <button
            onClick={() => setActiveTab('pdfs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'pdfs'
                ? 'bg-cyan-500 text-black shadow-neon-cyan'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            3. PDF & Notes Vault ({subjectPdfs.length})
          </button>

          <button
            onClick={() => setActiveTab('pyqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'pyqs'
                ? 'bg-cyan-500 text-black shadow-neon-cyan'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            4. High-Repeat PYQs ({subjectQuestions.length})
          </button>
        </div>

      </div>

      {/* Active Tab View */}
      {activeTab === 'action' && (
        <SmartActionPlanTab
          subject={subject}
          countdown={countdown}
          tasks={tasks}
          onToggleTask={onToggleTask}
          onAddTask={onAddTask}
          onDeleteTask={onDeleteTask}
          onOpenEditDate={() => setIsEditDateOpen(true)}
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

      {/* Edit Subject Modal */}
      <EditSubjectModal
        subject={subject}
        isOpen={isEditSubjectOpen}
        onClose={() => setIsEditSubjectOpen(false)}
        onUpdate={(updated) => {
          onUpdateSubject(updated);
          onShowToast('Subject & syllabus updated!', 'success');
        }}
        onDelete={(id) => {
          onDeleteSubject(id);
          onBackToOverview();
          onShowToast('Subject removed from command center.', 'info');
        }}
      />

    </div>
  );
};
