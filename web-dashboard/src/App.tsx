import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, AppMode } from './components/Navbar';
import { StudyHomeView } from './components/StudyHomeView';
import { TopicScannerView } from './components/TopicScannerView';
import { CheatSheetView } from './components/CheatSheetView';
import { ExtensionInstallerModal } from './components/ExtensionInstallerModal';
import { Toast, ToastMessage } from './components/Toast';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { INITIAL_SUBJECTS, INITIAL_QUESTIONS } from './data/pyqData';
import { SubjectId, PYQQuestion } from './types';
import { broadcastSync, loadSavedQuestions } from './utils/syncBridge';

function DashboardContent() {
  const { theme } = useTheme();

  // State
  const [subjects] = useState(INITIAL_SUBJECTS);
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>(() => {
    return (localStorage.getItem('pyq_ranker_active_subject_v1') as SubjectId) || 'os';
  });

  const [questions, setQuestions] = useState<PYQQuestion[]>(() => {
    return loadSavedQuestions(INITIAL_QUESTIONS);
  });

  // 3 Simple Modes: 'study' (default) | 'scanner' | 'cheat'
  const [currentMode, setCurrentMode] = useState<AppMode>('study');

  // Extension installer modal
  const [isExtensionInstallerOpen, setIsExtensionInstallerOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  // Broadcast sync to Chrome Extension & LocalStorage
  useEffect(() => {
    broadcastSync(questions, activeSubjectId, theme);
  }, [questions, activeSubjectId, theme]);

  // Listen for Extension events
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PYQ_PIN_NOTE') {
        const { questionId, note } = e.data.payload;
        setQuestions(prev => prev.map(q => {
          if (q.id === questionId) {
            const updated = q.userNotes ? `${q.userNotes}\n\n[Web Clip]: ${note}` : `[Web Clip]: ${note}`;
            return { ...q, userNotes: updated };
          }
          return q;
        }));
        showToast('Pinned web clip from Chrome extension to question!', 'success');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [showToast]);

  // Toggle mastered status
  const handleToggleMastered = (id: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          userStatus: q.userStatus === 'mastered' ? 'not-started' : 'mastered'
        };
      }
      return q;
    }));
  };

  // Save practice recall answer & score
  const handleSaveAnswer = (id: string, answer: string, score: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          lastAttemptAnswer: answer,
          lastAttemptScore: score,
          userStatus: score >= 8 ? 'mastered' : q.userStatus
        };
      }
      return q;
    }));
  };

  // Add questions extracted from PDF
  const handleAddExtractedQuestions = (newQuestions: PYQQuestion[]) => {
    setQuestions(prev => {
      const existingTexts = new Set(prev.map(q => q.question.toLowerCase().trim()));
      const filtered = newQuestions.filter(q => !existingTexts.has(q.question.toLowerCase().trim()));
      return [...filtered, ...prev];
    });
    if (newQuestions.length > 0) {
      setActiveSubjectId(newQuestions[0].subjectId);
    }
  };

  // Import questions from JSON
  const handleImportQuestions = (imported: PYQQuestion[]) => {
    setQuestions(imported);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA] dark:bg-[#06090E] text-[#090D16] dark:text-[#F3F6FA] transition-colors duration-200">
      
      {/* Top Glass Navigation Bar */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onOpenExtensionInstaller={() => setIsExtensionInstallerOpen(true)}
        questions={questions}
        activeSubjectId={activeSubjectId}
        onImportQuestions={handleImportQuestions}
        onShowToast={showToast}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Mode 1: Study Top Questions */}
        {currentMode === 'study' && (
          <StudyHomeView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            onSelectSubject={(id) => setActiveSubjectId(id)}
            questions={questions}
            onToggleMastered={handleToggleMastered}
            onSaveAnswer={handleSaveAnswer}
            onShowToast={showToast}
          />
        )}

        {/* Mode 2: Topic Scanner & PDF Upload */}
        {currentMode === 'scanner' && (
          <TopicScannerView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            questions={questions}
            onAddExtractedQuestions={handleAddExtractedQuestions}
            onToggleMastered={handleToggleMastered}
            onSaveAnswer={handleSaveAnswer}
            onShowToast={showToast}
          />
        )}

        {/* Mode 3: Last-Minute Cheat Sheet */}
        {currentMode === 'cheat' && (
          <CheatSheetView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            onSelectSubject={(id) => setActiveSubjectId(id)}
            questions={questions}
          />
        )}

      </main>

      {/* Browser Extension Installer & Simulator Modal */}
      <ExtensionInstallerModal
        isOpen={isExtensionInstallerOpen}
        onClose={() => setIsExtensionInstallerOpen(false)}
        questions={questions}
        onShowToast={showToast}
      />

      {/* Global Alerts */}
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
