import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SidebarNav, ActiveTab } from './components/SidebarNav';
import { AnalyticsHeatmap } from './components/AnalyticsHeatmap';
import { QuestionBankExplorer } from './components/QuestionBankExplorer';
import { RubricGraderSandbox } from './components/RubricGraderSandbox';
import { PdfParserModal } from './components/PdfParserModal';
import { CheatSheetModal } from './components/CheatSheetModal';
import { Toast, ToastMessage } from './components/Toast';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { INITIAL_SUBJECTS, INITIAL_QUESTIONS } from './data/pyqData';
import { SubjectId, PYQQuestion, QuestionStatus } from './types';
import { 
  broadcastSync, 
  loadSavedQuestions, 
  getSavedExamDate, 
  saveExamDate 
} from './utils/syncBridge';

function DashboardContent() {
  const { theme } = useTheme();

  // Subjects & Questions state
  const [subjects] = useState(INITIAL_SUBJECTS);
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>(() => {
    return (localStorage.getItem('pyq_ranker_active_subject_v1') as SubjectId) || 'os';
  });
  
  const [questions, setQuestions] = useState<PYQQuestion[]>(() => {
    return loadSavedQuestions(INITIAL_QUESTIONS);
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('analytics');

  // Practicing question for Sandbox
  const [sandboxQuestion, setSandboxQuestion] = useState<PYQQuestion>(() => {
    return questions.find(q => q.subjectId === activeSubjectId) || questions[0];
  });

  // Filter passed from analytics to question bank
  const [explorerUnitFilter, setExplorerUnitFilter] = useState<number | null>(null);

  // Target exam date
  const [examDateStr, setExamDateStr] = useState<string>(() => {
    return getSavedExamDate(activeSubjectId);
  });

  // Modals state
  const [isPdfParserOpen, setIsPdfParserOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isExtensionSynced, setIsExtensionSynced] = useState(false);

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

  // Sync Bridge Effect: broadcast to extension and localStorage
  useEffect(() => {
    broadcastSync(questions, activeSubjectId, theme);
  }, [questions, activeSubjectId, theme]);

  // Listen for Extension Handshake Message
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PYQ_EXTENSION_ACK') {
        setIsExtensionSynced(true);
      }
      if (e.data && e.data.type === 'PYQ_PIN_NOTE') {
        // In-page extension pinned a note to a question
        const { questionId, note } = e.data.payload;
        setQuestions(prev => prev.map(q => {
          if (q.id === questionId) {
            const updated = q.userNotes ? `${q.userNotes}\n\n[Pinned Web Note]: ${note}` : `[Pinned Web Note]: ${note}`;
            return { ...q, userNotes: updated };
          }
          return q;
        }));
        showToast('Pinned web note from Chrome extension to question!', 'success');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [showToast]);

  // Switch subject
  const handleSelectSubject = (id: SubjectId) => {
    setActiveSubjectId(id);
    const newExamDate = getSavedExamDate(id);
    setExamDateStr(newExamDate);

    // Update sandbox question to match new subject
    const subjectQ = questions.find(q => q.subjectId === id);
    if (subjectQ) setSandboxQuestion(subjectQ);
    setExplorerUnitFilter(null);
  };

  // Update target exam date
  const handleUpdateExamDate = (newDateIso: string) => {
    setExamDateStr(newDateIso);
    saveExamDate(activeSubjectId, newDateIso);
    showToast('Target exam countdown updated!', 'success');
  };

  // Select question for rubric practice
  const handleSelectForPractice = (q: PYQQuestion) => {
    setSandboxQuestion(q);
    setActiveTab('sandbox');
  };

  // Filter questions by unit from analytics heatmap click
  const handleFilterByUnitFromHeatmap = (unit: number) => {
    setExplorerUnitFilter(unit);
    setActiveTab('questions');
  };

  // Update question status
  const handleUpdateStatus = (id: string, status: QuestionStatus) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, userStatus: status } : q));
  };

  // Toggle bookmark
  const handleToggleBookmark = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, bookmarked: !q.bookmarked } : q));
  };

  // Save personal study note
  const handleSaveNote = (id: string, note: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, userNotes: note } : q));
    showToast('Personal study note saved!', 'success');
  };

  // Update question answer & rubric score from sandbox
  const handleUpdateQuestionAnswer = (id: string, answer: string, score: number, status: QuestionStatus) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          lastAttemptAnswer: answer,
          lastAttemptScore: score,
          lastAttemptDate: new Date().toISOString(),
          userStatus: status
        };
      }
      return q;
    }));
  };

  // Add questions extracted from PDF / text parser
  const handleQuestionsExtracted = (newQuestions: PYQQuestion[]) => {
    setQuestions(prev => {
      // Deduplicate by question text
      const existingTexts = new Set(prev.map(q => q.question.toLowerCase().trim()));
      const filteredNew = newQuestions.filter(q => !existingTexts.has(q.question.toLowerCase().trim()));
      return [...filteredNew, ...prev];
    });
    // Set active subject to match extracted questions
    if (newQuestions.length > 0) {
      setActiveSubjectId(newQuestions[0].subjectId);
    }
  };

  // Import JSON snapshot
  const handleImportQuestions = (imported: PYQQuestion[]) => {
    setQuestions(imported);
  };

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-300">
      
      {/* Top Fixed Header */}
      <Navbar
        subjects={subjects}
        activeSubjectId={activeSubjectId}
        onSelectSubject={handleSelectSubject}
        questions={questions}
        onImportQuestions={handleImportQuestions}
        onOpenPdfParser={() => setIsPdfParserOpen(true)}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        isExtensionSynced={isExtensionSynced}
        onShowToast={showToast}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        
        {/* Left Sidebar Navigation */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'questions') setExplorerUnitFilter(null);
          }}
          questions={questions}
          activeSubjectId={activeSubjectId}
          examDateStr={examDateStr}
          onOpenExamDatePicker={() => {
            setActiveTab('analytics');
          }}
        />

        {/* Center Main Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          {/* View 1: Analytics & Heatmap */}
          {activeTab === 'analytics' && (
            <AnalyticsHeatmap
              questions={questions}
              subject={activeSubject}
              examDateStr={examDateStr}
              onUpdateExamDate={handleUpdateExamDate}
              onSelectQuestionForPractice={handleSelectForPractice}
              onFilterByUnit={handleFilterByUnitFromHeatmap}
            />
          )}

          {/* View 2: Question Bank Explorer */}
          {activeTab === 'questions' && (
            <QuestionBankExplorer
              questions={questions}
              subject={activeSubject}
              initialUnitFilter={explorerUnitFilter}
              onClearInitialUnitFilter={() => setExplorerUnitFilter(null)}
              onSelectForPractice={handleSelectForPractice}
              onUpdateStatus={handleUpdateStatus}
              onToggleBookmark={handleToggleBookmark}
              onSaveNote={handleSaveNote}
            />
          )}

          {/* View 3: Smart Rubric Sandbox */}
          {activeTab === 'sandbox' && (
            <RubricGraderSandbox
              question={sandboxQuestion}
              allQuestions={questions}
              onSelectAnotherQuestion={(q) => setSandboxQuestion(q)}
              onBackToExplorer={() => setActiveTab('questions')}
              onUpdateQuestionAnswer={handleUpdateQuestionAnswer}
              onShowToast={showToast}
            />
          )}

          {/* View 4: Night-Before Cheat Sheet */}
          {activeTab === 'cheatsheet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card">
                <div>
                  <h2 className="text-base font-bold text-solar-text dark:text-obsidian-text">
                    Night-Before Exam Cheat Sheet View
                  </h2>
                  <p className="text-xs text-solar-muted dark:text-obsidian-muted">
                    Instant print-optimized compendium of 3+ times repeated questions and core rubric keywords.
                  </p>
                </div>
                <button
                  onClick={() => setIsCheatSheetOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
                >
                  Open Full Screen / Print
                </button>
              </div>

              {/* Embed Quick View of Cheat Sheet */}
              <div className="p-6 rounded-2xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-xs">
                <CheatSheetModal
                  isOpen={true}
                  onClose={() => setActiveTab('analytics')}
                  questions={questions}
                  subject={activeSubject}
                />
              </div>
            </div>
          )}

        </main>

      </div>

      {/* PDF & Paper Parser Modal */}
      <PdfParserModal
        isOpen={isPdfParserOpen}
        onClose={() => setIsPdfParserOpen(false)}
        subjects={subjects}
        activeSubjectId={activeSubjectId}
        onQuestionsExtracted={handleQuestionsExtracted}
        onShowToast={showToast}
      />

      {/* Cheat Sheet Full Screen Modal */}
      <CheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
        questions={questions}
        subject={activeSubject}
      />

      {/* Global Toast Alerts */}
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
