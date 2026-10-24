import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SubjectMeta, 
  PYQQuestion, 
  StudyTask, 
  VideoResource, 
  PdfResource, 
  SyllabusTopic, 
  TopicMastery, 
  Flashcard, 
  PomodoroSession 
} from './types';
import { storageService } from './utils/storageService';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar, MainNavView } from './components/Navbar';
import { TodayScreen } from './components/TodayScreen';
import { SyllabusTrackerView } from './components/SyllabusTrackerView';
import { PyqRankerView } from './components/PyqRankerView';
import { SmartStudyPlannerView } from './components/SmartStudyPlannerView';
import { FocusTimerView } from './components/FocusTimerView';
import { FlashcardsView } from './components/FlashcardsView';
import { YouTubeVaultView } from './components/YouTubeVaultView';
import { PdfNotesView } from './components/PdfNotesView';
import { CommandCenterOverview } from './components/CommandCenterOverview';
import { SubjectWorkspace } from './components/SubjectWorkspace';
import { AddSubjectModal } from './components/AddSubjectModal';
import { ExtensionInstallerModal } from './components/ExtensionInstallerModal';
import { BackupModal } from './components/BackupModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Toast, ToastMessage } from './components/Toast';

function DashboardContent() {
  // 1. Core State loaded from Persistent Storage (Guaranteed Zero Data Loss)
  const [subjects, setSubjects] = useState<SubjectMeta[]>(() => storageService.getSubjects());
  const [questions, setQuestions] = useState<PYQQuestion[]>(() => storageService.getQuestions());
  const [tasks, setTasks] = useState<StudyTask[]>(() => storageService.getTasks());
  const [videos, setVideos] = useState<VideoResource[]>(() => storageService.getVideos());
  const [pdfs, setPdfs] = useState<PdfResource[]>(() => storageService.getPdfs());
  const [topics, setTopics] = useState<SyllabusTopic[]>(() => storageService.getTopics());
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => storageService.getFlashcards());
  const [pomodoroLogs, setPomodoroLogs] = useState<PomodoroSession[]>(() => storageService.getPomodoroLogs());

  // Active navigation view: default to 'today' as requested in Upgrade 1
  const [currentView, setCurrentView] = useState<MainNavView>('today');

  // Currently focused subject & unit
  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    return localStorage.getItem('exam_hub_v3_active_subject') || subjects[0]?.id || 'os';
  });
  const [activeUnitId, setActiveUnitId] = useState<string>('all');

  // Modal states
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

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

  // Calculate due flashcards count for mobile badge
  const todayDateStr = new Date().toISOString().split('T')[0];
  const dueFlashcardsCount = useMemo(() => {
    return flashcards.filter(c => !c.nextReviewDate || c.nextReviewDate <= todayDateStr).length;
  }, [flashcards, todayDateStr]);

  // ==========================================
  // SUBJECT HANDLERS
  // ==========================================
  const handleSelectSubject = (id: string, unitId?: string) => {
    setActiveSubjectId(id);
    setActiveUnitId(unitId || 'all');
    localStorage.setItem('exam_hub_v3_active_subject', id);
  };

  const handleSelectSubjectAndOpenWorkspace = (id: string, unitId?: string) => {
    handleSelectSubject(id, unitId);
    setCurrentView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubject = (newSubject: SubjectMeta) => {
    const updated = storageService.addSubject(newSubject);
    setSubjects(updated);
    setActiveSubjectId(newSubject.id);
    setActiveUnitId('all');
    localStorage.setItem('exam_hub_v3_active_subject', newSubject.id);
    setTopics(storageService.getTopics());
    setCurrentView('syllabus');
    showToast(`Created new subject "${newSubject.name}"! 🚀`, 'success');
  };

  const handleUpdateSubject = (updatedSubject: SubjectMeta) => {
    const updated = storageService.updateSubject(updatedSubject);
    setSubjects(updated);
    showToast(`Updated ${updatedSubject.name}!`, 'success');
  };

  const handleDeleteSubject = (id: string) => {
    const updated = storageService.deleteSubject(id);
    setSubjects(updated);
    setQuestions(storageService.getQuestions());
    setTasks(storageService.getTasks());
    setVideos(storageService.getVideos());
    setPdfs(storageService.getPdfs());
    setTopics(storageService.getTopics());
    setFlashcards(storageService.getFlashcards());
    if (activeSubjectId === id && updated.length > 0) {
      setActiveSubjectId(updated[0].id);
      localStorage.setItem('exam_hub_v3_active_subject', updated[0].id);
    }
  };

  // ==========================================
  // SYLLABUS TOPIC HANDLERS
  // ==========================================
  const handleToggleTopicCompleted = (topicId: string) => {
    const updated = storageService.toggleTopicCompleted(topicId);
    setTopics(updated);
  };

  const handleSetTopicMastery = (topicId: string, mastery: TopicMastery) => {
    const updated = storageService.setTopicMastery(topicId, mastery);
    setTopics(updated);
    showToast(`Marked topic mastery as ${mastery.toUpperCase()}`, 'info');
  };

  const handleAddTopic = (topic: SyllabusTopic) => {
    const updated = storageService.addTopic(topic);
    setTopics(updated);
    showToast('Topic added to syllabus!', 'success');
  };

  const handleDeleteTopic = (topicId: string) => {
    const updated = storageService.deleteTopic(topicId);
    setTopics(updated);
    showToast('Topic removed from syllabus.', 'info');
  };

  const handleAddUnit = (subjectId: string, unitTitle: string) => {
    const targetSub = subjects.find(s => s.id === subjectId);
    if (!targetSub) return;
    const nextNum = (targetSub.units?.length || 0) + 1;
    const newUnit = {
      id: `unit-${Date.now().toString(36)}-${nextNum}`,
      unit: nextNum,
      unitNumber: nextNum,
      title: unitTitle.trim(),
      name: unitTitle.trim()
    };
    const updatedSub: SubjectMeta = {
      ...targetSub,
      units: [...(targetSub.units || []), newUnit]
    };
    handleUpdateSubject(updatedSub);
    showToast(`Added Unit ${nextNum}: "${unitTitle}"`, 'success');
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
    setTopics(storageService.getTopics());
    showToast('Question saved to subject PYQ bank! 🔥', 'success');
  };

  // ==========================================
  // TASK HANDLERS
  // ==========================================
  const handleToggleTask = (id: string) => {
    const updated = storageService.toggleTask(id);
    setTasks(updated);
  };

  const handleAddTask = (text: string, unitId?: string, unitNum?: number) => {
    const newTask: StudyTask = {
      id: `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: activeSubjectId,
      unitId,
      unit: unitNum,
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
  // FOCUS TIMER / POMODORO HANDLERS
  // ==========================================
  const handleLogPomodoro = (subjectId: string, minutes: number) => {
    const updated = storageService.logPomodoroSession(subjectId, minutes);
    setPomodoroLogs(updated);
    const subName = subjects.find(s => s.id === subjectId)?.name || 'Subject';
    showToast(`Logged ${minutes} min focus session for ${subName}! 🔥`, 'success');
  };

  // ==========================================
  // FLASHCARD HANDLERS (SPACED REPETITION)
  // ==========================================
  const handleAddFlashcard = (card: Flashcard) => {
    const updated = storageService.addFlashcard(card);
    setFlashcards(updated);
    showToast('Flashcard saved with Spaced Repetition! 🧠', 'success');
  };

  const handleReviewCard = (cardId: string, rating: 'hard' | 'good' | 'easy') => {
    const updated = storageService.reviewFlashcard(cardId, rating);
    setFlashcards(updated);
  };

  const handleDeleteFlashcard = (cardId: string) => {
    const updated = storageService.deleteFlashcard(cardId);
    setFlashcards(updated);
    showToast('Flashcard deleted.', 'info');
  };

  // ==========================================
  // VIDEO HANDLERS (YOUTUBE VAULT)
  // ==========================================
  const handleAddVideo = (video: VideoResource) => {
    const updated = storageService.addVideo(video);
    setVideos(updated);
    showToast('Lecture saved to YouTube Vault! 🎥', 'success');
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
    showToast('Video removed from Vault.', 'info');
  };

  // ==========================================
  // PDF HANDLERS
  // ==========================================
  const handleAddPdf = (pdf: PdfResource) => {
    const updated = storageService.addPdf(pdf);
    setPdfs(updated);
    showToast('PDF notes saved to subject library! 📄', 'success');
  };

  const handleDeletePdf = (id: string) => {
    const updated = storageService.deletePdf(id);
    setPdfs(updated);
    showToast('Document removed from Vault.', 'info');
  };

  // ==========================================
  // MOVE ITEM TO UNIT HANDLER
  // ==========================================
  const handleMoveItemToUnit = (
    type: 'task' | 'video' | 'pdf' | 'question', 
    itemId: string, 
    targetUnitId: string, 
    targetUnitNumber?: number
  ) => {
    storageService.moveItemToUnit(type, itemId, targetUnitId, targetUnitNumber);
    if (type === 'task') setTasks(storageService.getTasks());
    if (type === 'video') setVideos(storageService.getVideos());
    if (type === 'pdf') setPdfs(storageService.getPdfs());
    if (type === 'question') setQuestions(storageService.getQuestions());
  };

  // ==========================================
  // DATA RELOAD & RESTORE
  // ==========================================
  const handleDataReloaded = () => {
    setSubjects(storageService.getSubjects());
    setQuestions(storageService.getQuestions());
    setTasks(storageService.getTasks());
    setVideos(storageService.getVideos());
    setPdfs(storageService.getPdfs());
    setTopics(storageService.getTopics());
    setFlashcards(storageService.getFlashcards());
    setPomodoroLogs(storageService.getPomodoroLogs());
  };

  const handleResetData = () => {
    if (window.confirm('Reset all subjects, countdowns, videos, and questions to default? This will replace any custom changes.')) {
      const reset = storageService.resetToDefaultData();
      setSubjects(reset.subjects);
      setQuestions(reset.questions);
      setTasks(reset.tasks);
      setVideos(reset.videos);
      setPdfs(reset.pdfs);
      setTopics(storageService.getTopics());
      setFlashcards(storageService.getFlashcards());
      setPomodoroLogs(storageService.getPomodoroLogs());
      setActiveSubjectId(reset.subjects[0].id);
      setActiveUnitId('all');
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
        onSelectSubject={handleSelectSubject}
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area: pb-24 on mobile so MobileBottomNav never blocks elements */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        
        {/* VIEW 1: HOME / TODAY SCREEN (UPGRADE 1) */}
        {currentView === 'today' && (
          <TodayScreen
            subjects={subjects}
            topics={topics}
            questions={questions}
            tasks={tasks}
            flashcards={flashcards}
            pomodoroLogs={pomodoroLogs}
            onToggleTopicCompleted={handleToggleTopicCompleted}
            onSelectSubject={(id, unitId) => {
              handleSelectSubject(id, unitId);
              setCurrentView('syllabus');
            }}
            onNavigateView={setCurrentView}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 2: SYLLABUS TRACKER (UPGRADE 2) */}
        {currentView === 'syllabus' && (
          <SyllabusTrackerView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            onSelectSubject={handleSelectSubject}
            topics={topics}
            onToggleTopicCompleted={handleToggleTopicCompleted}
            onSetTopicMastery={handleSetTopicMastery}
            onAddTopic={handleAddTopic}
            onDeleteTopic={handleDeleteTopic}
            onAddUnit={handleAddUnit}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 3: PYQ RANKER (UPGRADE 3) */}
        {currentView === 'pyqs' && (
          <PyqRankerView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            onSelectSubject={handleSelectSubject}
            questions={questions}
            topics={topics}
            onToggleMastered={handleToggleMastered}
            onSaveAnswer={handleSaveAnswer}
            onAddQuestion={handleAddQuestion}
            onSetTopicMastery={handleSetTopicMastery}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 4: SMART STUDY PLANNER (UPGRADE 4) */}
        {currentView === 'planner' && (
          <SmartStudyPlannerView
            subjects={subjects}
            topics={topics}
            questions={questions}
            onToggleTopicCompleted={handleToggleTopicCompleted}
            onSelectSubject={handleSelectSubject}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 5: FOCUS TIMER / POMODORO (UPGRADE 5) */}
        {currentView === 'timer' && (
          <FocusTimerView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            pomodoroLogs={pomodoroLogs}
            onLogSession={handleLogPomodoro}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 6: FLASHCARDS / SPACED REPETITION (UPGRADE 8) */}
        {currentView === 'flashcards' && (
          <FlashcardsView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            flashcards={flashcards}
            onAddFlashcard={handleAddFlashcard}
            onReviewCard={handleReviewCard}
            onDeleteFlashcard={handleDeleteFlashcard}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 7: YOUTUBE VAULT (UPGRADE 9) */}
        {currentView === 'vault' && (
          <YouTubeVaultView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            videos={videos}
            onAddVideo={handleAddVideo}
            onUpdateVideoNotes={handleUpdateVideoNotes}
            onToggleVideoWatched={handleToggleVideoWatched}
            onDeleteVideo={handleDeleteVideo}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 8: PDF NOTES TOOL (UPGRADE 7) */}
        {currentView === 'pdf' && (
          <PdfNotesView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            pdfs={pdfs}
            onAddPdf={handleAddPdf}
            onDeletePdf={handleDeletePdf}
            onAddQuestion={handleAddQuestion}
            onAddFlashcard={handleAddFlashcard}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 9: COMMAND CENTER OVERVIEW */}
        {currentView === 'overview' && (
          <CommandCenterOverview
            subjects={subjects}
            questions={questions}
            tasks={tasks}
            onSelectSubject={handleSelectSubjectAndOpenWorkspace}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {/* VIEW 10: SUBJECT WORKSPACE */}
        {currentView === 'workspace' && activeSubject && (
          <SubjectWorkspace
            subject={activeSubject}
            initialUnitId={activeUnitId}
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
            onMoveItemToUnit={handleMoveItemToUnit}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onBackToOverview={() => setCurrentView('overview')}
            onShowToast={showToast}
          />
        )}

      </main>

      {/* Mobile Bottom Navigation (Upgrade 10 - Mobile-First) */}
      <MobileBottomNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        dueFlashcardsCount={dueFlashcardsCount}
      />

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

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataReloaded={handleDataReloaded}
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
