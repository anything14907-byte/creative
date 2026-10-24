import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SubjectMeta, 
  SubjectFile, 
  FileCategory, 
  VideoResource 
} from './types';
import { indexedDbService } from './utils/indexedDbService';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar, MainNavView } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SubjectDetailView } from './components/SubjectDetailView';
import { AddSubjectModal } from './components/AddSubjectModal';
import { BackupModal } from './components/BackupModal';
import { Toast, ToastMessage } from './components/Toast';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const [subjects, setSubjects] = useState<SubjectMeta[]>([]);
  const [files, setFiles] = useState<SubjectFile[]>([]);
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [storageUsage, setStorageUsage] = useState<{ totalBytes: number; formatted: string; fileCount: number }>({
    totalBytes: 0,
    formatted: '0 KB',
    fileCount: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Active view: 'dashboard' (cards overview) | 'subject' (inside specific subject)
  const [currentView, setCurrentView] = useState<MainNavView>('dashboard');

  // Currently focused subject
  const [activeSubjectId, setActiveSubjectId] = useState<string>('');

  // Modals
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
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

  // Load all data from IndexedDB
  const refreshAllData = useCallback(async () => {
    try {
      const loadedSubjects = await indexedDbService.getSubjects();
      const loadedFiles = await indexedDbService.getFiles();
      const loadedVideos = await indexedDbService.getVideos();
      const usage = await indexedDbService.getStorageUsage();

      setSubjects(loadedSubjects);
      setFiles(loadedFiles);
      setVideos(loadedVideos);
      setStorageUsage(usage);

      // Load notes for each subject
      const notes: Record<string, string> = {};
      for (const s of loadedSubjects) {
        notes[s.id] = await indexedDbService.getNotes(s.id);
      }
      setNotesMap(notes);

      if (loadedSubjects.length > 0 && !activeSubjectId) {
        setActiveSubjectId(loadedSubjects[0].id);
      }
    } catch (err) {
      console.error('Error loading data from IndexedDB:', err);
      showToast('Error loading study data from IndexedDB', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeSubjectId, showToast]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Find active subject
  const activeSubject = useMemo(() => {
    return subjects.find(s => s.id === activeSubjectId) || subjects[0];
  }, [subjects, activeSubjectId]);

  // ==========================================
  // NAVIGATION HANDLERS
  // ==========================================
  const handleSelectSubject = (id: string) => {
    setActiveSubjectId(id);
    setCurrentView('subject');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // SUBJECT CRUD
  // ==========================================
  const handleAddSubject = async (newSubject: SubjectMeta) => {
    await indexedDbService.saveSubject(newSubject);
    setSubjects(prev => [...prev, newSubject]);
    setActiveSubjectId(newSubject.id);
    setIsAddSubjectOpen(false);
    showToast(`Created "${newSubject.name}"! 🚀`, 'success');
  };

  const handleUpdateSubject = async (updatedSubject: SubjectMeta) => {
    await indexedDbService.saveSubject(updatedSubject);
    setSubjects(prev => prev.map(s => s.id === updatedSubject.id ? updatedSubject : s));
    showToast(`Updated "${updatedSubject.name}"!`, 'success');
  };

  const handleDeleteSubject = async (id: string) => {
    await indexedDbService.deleteSubject(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
    setFiles(prev => prev.filter(f => f.subjectId !== id));
    setVideos(prev => prev.filter(v => v.subjectId !== id));
    const usage = await indexedDbService.getStorageUsage();
    setStorageUsage(usage);
    if (activeSubjectId === id) {
      const remaining = subjects.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setActiveSubjectId(remaining[0].id);
      } else {
        setCurrentView('dashboard');
      }
    }
  };

  // ==========================================
  // FILE OPERATIONS
  // ==========================================
  const handleAddFiles = async (newFiles: SubjectFile[]) => {
    await indexedDbService.addFiles(newFiles);
    setFiles(prev => [...prev, ...newFiles]);
    const usage = await indexedDbService.getStorageUsage();
    setStorageUsage(usage);
  };

  const handleUpdateFile = async (updatedFile: SubjectFile) => {
    await indexedDbService.updateFile(updatedFile);
    setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
  };

  const handleDeleteFile = async (fileId: string) => {
    await indexedDbService.deleteFile(fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    const usage = await indexedDbService.getStorageUsage();
    setStorageUsage(usage);
  };

  const handleMoveFile = async (fileId: string, newCategory: FileCategory) => {
    await indexedDbService.moveFile(fileId, newCategory);
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, category: newCategory } : f));
  };

  const handleToggleImportant = async (fileId: string) => {
    const newState = await indexedDbService.toggleFileImportant(fileId);
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isImportant: newState } : f));
  };

  const handleToggleDone = async (fileId: string) => {
    const newState = await indexedDbService.toggleFileDone(fileId);
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isDone: newState } : f));
  };

  // ==========================================
  // MY NOTES
  // ==========================================
  const handleSaveNotes = async (subjectId: string, content: string) => {
    await indexedDbService.saveNotes(subjectId, content);
    setNotesMap(prev => ({ ...prev, [subjectId]: content }));
  };

  // ==========================================
  // YOUTUBE VIDEOS
  // ==========================================
  const handleAddVideo = async (video: VideoResource) => {
    await indexedDbService.saveVideo(video);
    setVideos(prev => [...prev, video]);
  };

  const handleToggleVideoWatched = async (videoId: string) => {
    const newState = await indexedDbService.toggleVideoWatched(videoId);
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, isWatched: newState } : v));
  };

  const handleUpdateVideoNotes = async (videoId: string, notes: string) => {
    await indexedDbService.updateVideoNotes(videoId, notes);
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, notes } : v));
  };

  const handleDeleteVideo = async (videoId: string) => {
    await indexedDbService.deleteVideo(videoId);
    setVideos(prev => prev.filter(v => v.id !== videoId));
  };

  // ==========================================
  // BACKUP EXPORT & IMPORT
  // ==========================================
  const handleExportBackup = async () => {
    try {
      await indexedDbService.exportCompleteBackup();
      showToast('Single-file backup JSON downloaded! 📦', 'success');
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`, 'error');
    }
  };

  const handleImportBackup = async (content: string) => {
    try {
      const result = await indexedDbService.importCompleteBackup(content);
      if (result.success) {
        await refreshAllData();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(`Import failed: ${err.message}`, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-bg dark:bg-night-bg flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <div className="text-sm font-bold text-paper-ink dark:text-night-text">
          Opening PyqRanker IndexedDB...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-bg dark:bg-night-bg text-paper-ink dark:text-night-text transition-colors duration-200">
      
      {/* Top Header Bar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        subjects={subjects}
        activeSubjectId={activeSubjectId}
        onSelectSubject={handleSelectSubject}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
        
        {/* VIEW 1: DASHBOARD (ALL SUBJECTS CARDS + FILE COUNTS + ONLY + ADD SUBJECT BUTTON) */}
        {currentView === 'dashboard' && (
          <DashboardView
            subjects={subjects}
            files={files}
            onSelectSubject={handleSelectSubject}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            storageUsage={storageUsage}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 2: INSIDE SUBJECT PAGE */}
        {currentView === 'subject' && activeSubject && (
          <SubjectDetailView
            subject={activeSubject}
            files={files}
            notesText={notesMap[activeSubject.id] || ''}
            videos={videos}
            onBackToDashboard={handleBackToDashboard}
            onAddFiles={handleAddFiles}
            onUpdateFile={handleUpdateFile}
            onDeleteFile={handleDeleteFile}
            onMoveFile={handleMoveFile}
            onToggleImportant={handleToggleImportant}
            onToggleDone={handleToggleDone}
            onSaveNotes={handleSaveNotes}
            onAddVideo={handleAddVideo}
            onToggleVideoWatched={handleToggleVideoWatched}
            onUpdateVideoNotes={handleUpdateVideoNotes}
            onDeleteVideo={handleDeleteVideo}
            onShowToast={showToast}
          />
        )}

      </main>

      {/* The Single Add Subject Modal (opened only from dashboard button) */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAdd={handleAddSubject}
      />

      {/* Backup and Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataReloaded={refreshAllData}
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
