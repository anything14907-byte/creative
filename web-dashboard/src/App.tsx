import React, { useState, useEffect, useCallback } from 'react';
import { SubjectMeta, PYQQuestion, StudyTask, VideoResource, PdfResource } from './types';
import { storageService } from './utils/storageService';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar, MainNavView } from './components/Navbar';
import { CommandCenterOverview } from './components/CommandCenterOverview';
import { SubjectWorkspace } from './components/SubjectWorkspace';
import { AddSubjectModal } from './components/AddSubjectModal';
import { ExtensionInstallerModal } from './components/ExtensionInstallerModal';
import { Toast, ToastMessage } from './components/Toast';

function DashboardContent() {
  // 1. Core State loaded from Persistent Storage (bumped to exam_hub_v3)
  const [subjects, setSubjects] = useState<SubjectMeta[]>(() => storageService.getSubjects());
  const [questions, setQuestions] = useState<PYQQuestion[]>(() => storageService.getQuestions());
  const [tasks, setTasks] = useState<StudyTask[]>(() => storageService.getTasks());
  const [videos, setVideos] = useState<VideoResource[]>(() => storageService.getVideos());
  const [pdfs, setPdfs] = useState<PdfResource[]>(() => storageService.getPdfs());

  // Active navigation view: 'overview' (Command Center) | 'workspace' (Subject Hub)
  const [currentView, setCurrentView] = useState<MainNavView>('overview');

  // Currently focused subject
  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    return localStorage.getItem('exam_hub_v3_active_subject') || subjects[0]?.id || 'os';
  });

  // Modal states
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ticker to force live 1-second countdown rerender across the entire app
  const [, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Find active subject object
  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  // ==========================================
  // SUBJECT HANDLERS
  // ==========================================
  const handleSelectSubject = (id: string) => {
    setActiveSubjectId(id);
    localStorage.setItem('exam_hub_v3_active_subject', id);
    setCurrentView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubject = (newSubject: SubjectMeta) => {
    const updated = storageService.addSubject(newSubject);
    setSubjects(updated);
    setActiveSubjectId(newSubject.id);
    localStorage.setItem('exam_hub_v3_active_subject', newSubject.id);
    setCurrentView('workspace');
    showToast(`Created new subject "${newSubject.name}"! 🚀`, 'success');
  };

  const handleUpdateSubject = (updatedSubject: SubjectMeta) => {
    const updated = storageService.updateSubject(updatedSubject);
    setSubjects(updated);
    showToast(`Updated ${updatedSubject.name} settings & exam date!`, 'success');
  };

  const handleDeleteSubject = (id: string) => {
    const updated = storageService.deleteSubject(id);
    setSubjects(updated);
    setQuestions(storageService.getQuestions());
    setTasks(storageService.getTasks());
    setVideos(storageService.getVideos());
    setPdfs(storageService.getPdfs());
    if (activeSubjectId === id && updated.length > 0) {
      setActiveSubjectId(updated[0].id);
      localStorage.setItem('exam_hub_v3_active_subject', updated[0].id);
    }
  };

  // ==========================================
  // QUESTION HANDLERS
  // ==========================================
  const handleToggleMastered = (id: string) => {
    const updated = storageService.toggleQuestionMastered(id);
    setQuestions(updated);
  };

  const handleSaveAnswer = (id: string, answer: string, score: number) => {
    const updated = questions.map(q => {
      if (q.id === id) {
        return { ...q, lastAttemptAnswer: answer, lastAttemptScore: score };
      }
      return q;
    });
    setQuestions(updated);
    storageService.saveQuestions(updated);
  };

  const handleAddQuestion = (q: PYQQuestion) => {
    const updated = storageService.addQuestion(q);
    setQuestions(updated);
    showToast('Question saved to subject bank! 🔥', 'success');
  };

  // ==========================================
  // TASK HANDLERS
  // ==========================================
  const handleToggleTask = (id: string) => {
    const updated = storageService.toggleTask(id);
    setTasks(updated);
  };

  const handleAddTask = (text: string) => {
    const newTask: StudyTask = {
      id: `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: activeSubjectId,
      text,
      completed: false,
      isMission: false,
      category: 'custom',
      createdAt: Date.now()
    };
    const updated = storageService.addTask(newTask);
    setTasks(updated);
    showToast('Task added to checklist!', 'success');
  };

  const handleDeleteTask = (id: string) => {
    const updated = storageService.deleteTask(id);
    setTasks(updated);
  };

  // ==========================================
  // VIDEO HANDLERS
  // ==========================================
  const handleAddVideo = (video: VideoResource) => {
    const updated = storageService.addVideo(video);
    setVideos(updated);
    showToast('YouTube video embedded in Subject Hub! 🎬', 'success');
  };

  const handleUpdateVideoNotes = (id: string, notes: string) => {
    const updated = storageService.updateVideoNotes(id, notes);
    setVideos(updated);
  };

  const handleToggleVideoWatched = (id: string) => {
    const updated = storageService.toggleVideoWatched(id);
    setVideos(updated);
  };

  const handleDeleteVideo = (id: string) => {
    const updated = storageService.deleteVideo(id);
    setVideos(updated);
    showToast('Video removed from subject.', 'info');
  };

  // ==========================================
  // PDF HANDLERS
  // ==========================================
  const handleAddPdf = (pdf: PdfResource) => {
    const updated = storageService.addPdf(pdf);
    setPdfs(updated);
    showToast('Document parsed and saved to Vault! 📄', 'success');
  };

  const handleDeletePdf = (id: string) => {
    const updated = storageService.deletePdf(id);
    setPdfs(updated);
    showToast('Document removed from Vault.', 'info');
  };

  // ==========================================
  // RESET DEMO DATA
  // ==========================================
  const handleResetData = () => {
    if (window.confirm('Reset all subjects, countdowns, videos, and questions to the default university study dataset?')) {
      const reset = storageService.resetToDefaultData();
      setSubjects(reset.subjects);
      setQuestions(reset.questions);
      setTasks(reset.tasks);
      setVideos(reset.videos);
      setPdfs(reset.pdfs);
      setActiveSubjectId(reset.subjects[0].id);
      localStorage.setItem('exam_hub_v3_active_subject', reset.subjects[0].id);
      showToast('Reset to default university study data!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-paper-bg dark:bg-night-bg text-paper-ink dark:text-night-text transition-colors duration-200">
      
      {/* Top Header Bar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        subjects={subjects}
        activeSubjectId={activeSubjectId}
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* VIEW 1: COMMAND CENTER OVERVIEW */}
        {currentView === 'overview' && (
          <CommandCenterOverview
            subjects={subjects}
            questions={questions}
            tasks={tasks}
            onSelectSubject={handleSelectSubject}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {/* VIEW 2: SUBJECT WORKSPACE */}
        {currentView === 'workspace' && activeSubject && (
          <SubjectWorkspace
            subject={activeSubject}
            questions={questions}
            tasks={tasks}
            videos={videos}
            pdfs={pdfs}
            onToggleMastered={handleToggleMastered}
            onSaveAnswer={handleSaveAnswer}
            onAddQuestion={handleAddQuestion}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onAddVideo={handleAddVideo}
            onUpdateVideoNotes={handleUpdateVideoNotes}
            onToggleVideoWatched={handleToggleVideoWatched}
            onDeleteVideo={handleDeleteVideo}
            onAddPdf={handleAddPdf}
            onDeletePdf={handleDeletePdf}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onBackToOverview={() => setCurrentView('overview')}
            onShowToast={showToast}
          />
        )}

      </main>

      {/* Modals */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAdd={handleAddSubject}
      />

      <ExtensionInstallerModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        questions={questions}
        onShowToast={showToast}
      />

      {/* Toast Feedback */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}

export default App;
