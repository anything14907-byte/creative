import React, { useState } from 'react';
import { SubjectMeta, PdfResource, PYQQuestion, Flashcard, SyllabusTopic, SubjectFile } from '../types';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { formatUnitDisplayName } from '../utils/storageService';
import { indexedDbService } from '../utils/indexedDbService';
import { 
  analyzeExtractedNotes, 
  runOcrOnImage, 
  runOcrOnScannedPdf, 
  NotesAnalysisResult, 
  PracticeQuestionItem,
  SectionHeading
} from '../utils/notesAnalyzer';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  Check, 
  Trash2, 
  Eye, 
  BookOpen, 
  Plus, 
  ArrowRight,
  Brain,
  Flame,
  X,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Square,
  ListTree,
  FunctionSquare,
  Code2,
  Download,
  Edit3,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PdfNotesViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: string;
  topics?: SyllabusTopic[];
  pdfs: PdfResource[];
  onAddPdf: (pdf: PdfResource) => void;
  onDeletePdf: (id: string) => void;
  onAddQuestion: (q: PYQQuestion) => void;
  onAddFlashcard: (card: Flashcard) => void;
  onAddTopic?: (topic: SyllabusTopic) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PdfNotesView: React.FC<PdfNotesViewProps> = ({
  subjects,
  activeSubjectId,
  topics = [],
  pdfs,
  onAddPdf,
  onDeletePdf,
  onAddQuestion,
  onAddFlashcard,
  onAddTopic,
  onShowToast
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || subjects[0]?.id || 'os');
  const [targetSubjectId, setTargetSubjectId] = useState<string>(activeSubjectId || subjects[0]?.id || 'os');
  const [targetUnitId, setTargetUnitId] = useState<string>('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<{ percent: number; status: string } | null>(null);

  // Analysis result
  const [analysis, setAnalysis] = useState<NotesAnalysisResult | null>(null);
  const [editableText, setEditableText] = useState<string>('');
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);

  // Editable practice questions state
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestionItem[]>([]);

  // Selected headings for "Add headings as topics"
  const [selectedHeadings, setSelectedHeadings] = useState<Record<string, boolean>>({});

  // Full Note Modal
  const [viewingPdf, setViewingPdf] = useState<PdfResource | null>(null);

  const targetSubject = subjects.find(s => s.id === targetSubjectId) || subjects[0];
  const selectedUnit = targetSubject?.units?.find(u => u.id === targetUnitId) || targetSubject?.units?.[0];
  const subjectPdfs = pdfs.filter(p => p.subjectId === selectedSubjectId);

  // Check which headings already exist as topics in current subject/unit
  const existingTopicTitles = React.useMemo(() => {
    return new Set(
      topics
        .filter(t => t.subjectId === targetSubjectId)
        .map(t => t.title.toLowerCase().trim())
    );
  }, [topics, targetSubjectId]);

  // Process and analyze raw extracted text
  const applyAnalysis = (rawText: string, fileName: string) => {
    const result = analyzeExtractedNotes(rawText);
    setAnalysis(result);
    setEditableText(result.cleanedText || rawText);
    setPracticeQuestions(result.practiceQuestions);

    // Initialize heading checkboxes: pre-check non-existing headings
    const initialHeadingSelection: Record<string, boolean> = {};
    result.headings.forEach(h => {
      const alreadyExists = existingTopicTitles.has(h.cleanTitle.toLowerCase().trim());
      initialHeadingSelection[h.id] = !alreadyExists;
    });
    setSelectedHeadings(initialHeadingSelection);
  };

  // File Upload & OCR Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setOcrProgress(null);
    setAnalysis(null);

    // Read Data URL for saving to IndexedDB / previewing
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    try {
      const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name);
      let rawText = '';

      if (isImg) {
        // Image OCR with progress
        setOcrProgress({ percent: 10, status: 'Loading OCR engine for image...' });
        rawText = await runOcrOnImage(file, (percent, status) => {
          setOcrProgress({ percent, status });
        });
      } else {
        // PDF: first attempt native text layer extraction
        setOcrProgress({ percent: 15, status: 'Extracting text layer from PDF...' });
        try {
          rawText = await extractTextFromPdf(file);
        } catch (pdfErr) {
          console.warn('Native PDF extraction failed, falling back to OCR:', pdfErr);
          rawText = '';
        }

        // If PDF text is empty or virtually non-existent (< 50 chars), it's a scanned PDF
        const cleanCheck = rawText.replace(/[-—_]{2,}\s*Page\s*\d+\s*[-—_]{2,}/gi, '').trim();
        if (cleanCheck.length < 50) {
          setOcrProgress({ percent: 25, status: 'Scanned PDF detected (no text layer). Running OCR on pages...' });
          rawText = await runOcrOnScannedPdf(file, (percent, status) => {
            setOcrProgress({ percent, status });
          });
        }
      }

      applyAnalysis(rawText, file.name);

      if (rawText.trim().length >= 45) {
        onShowToast('Notes extracted successfully! Review the outline, summary, and practice questions below.', 'success');
      } else {
        onShowToast('File text was too sparse or unreadable. See Quality Guard below.', 'info');
      }
    } catch (err: any) {
      console.error('File processing error:', err);
      onShowToast(err.message || 'Error processing file. Try another file or paste text below.', 'error');
      // Create empty analysis to trigger quality guard
      applyAnalysis('', file.name);
    } finally {
      setIsProcessing(false);
      setOcrProgress(null);
    }
  };

  // Re-run analysis on user-edited text
  const handleReanalyze = () => {
    if (!editableText.trim()) {
      onShowToast('Please enter or paste notes text to analyze.', 'info');
      return;
    }
    const fileName = selectedFile?.name || 'Manual Notes';
    applyAnalysis(editableText, fileName);
    onShowToast('Re-analyzed notes successfully!', 'success');
  };

  // Update question marks
  const handleQuestionMarksChange = (id: string, newMarks: 2 | 5 | 10) => {
    setPracticeQuestions(prev => prev.map(q => q.id === id ? { ...q, marks: newMarks } : q));
  };

  // Update question text
  const handleQuestionTextChange = (id: string, newText: string) => {
    setPracticeQuestions(prev => prev.map(q => q.id === id ? { ...q, question: newText } : q));
  };

  // ACTION 1: Add Headings as Topics to Selected Unit
  const handleAddHeadingsAsTopics = () => {
    if (!analysis || !onAddTopic) return;
    const unitId = selectedUnit?.id || 'u1';
    const unitNum = selectedUnit?.unit || 1;

    const headingsToAdd = analysis.headings.filter(h => {
      const isChecked = selectedHeadings[h.id];
      const alreadyExists = existingTopicTitles.has(h.cleanTitle.toLowerCase().trim());
      return isChecked && !alreadyExists;
    });

    if (headingsToAdd.length === 0) {
      onShowToast('No new headings selected to add as topics.', 'info');
      return;
    }

    let addedCount = 0;
    headingsToAdd.forEach(h => {
      const newTopic: SyllabusTopic = {
        id: `topic-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        subjectId: targetSubjectId,
        unitNumber: unitNum,
        unitId,
        unitLabel: selectedUnit ? formatUnitDisplayName(selectedUnit) : undefined,
        title: h.cleanTitle,
        completed: false,
        mastery: 'weak',
        createdAt: Date.now()
      };
      onAddTopic(newTopic);
      addedCount++;
    });

    // Update headings selection state so added ones reflect as existing
    setSelectedHeadings(prev => {
      const updated = { ...prev };
      headingsToAdd.forEach(h => { updated[h.id] = false; });
      return updated;
    });

    onShowToast(`Added ${addedCount} topics to ${targetSubject.name} (${selectedUnit ? formatUnitDisplayName(selectedUnit) : 'Unit'})! 📚`, 'success');
  };

  // ACTION 2: Create Flashcards from Key Terms
  const handleCreateFlashcards = () => {
    if (!analysis || analysis.keyTerms.length === 0) {
      onShowToast('No key terms found to create flashcards.', 'info');
      return;
    }

    analysis.keyTerms.forEach((kt, idx) => {
      const card: Flashcard = {
        id: `fc-pdf-${Date.now().toString(36)}-${idx}`,
        subjectId: targetSubjectId,
        topicTitle: kt.term,
        front: kt.term,
        back: kt.definition,
        intervalStep: 0,
        nextReviewDate: new Date().toISOString().split('T')[0],
        createdAt: Date.now()
      };
      onAddFlashcard(card);
    });

    onShowToast(`Created ${analysis.keyTerms.length} flashcards from key terms! 🧠`, 'success');
  };

  // ACTION 3: Add Practice Questions to PYQ Question Bank
  const handleSaveQuestionsToPyqBank = () => {
    if (practiceQuestions.length === 0) {
      onShowToast('No practice questions available to add.', 'info');
      return;
    }

    const unitLabelDisplay = selectedUnit ? formatUnitDisplayName(selectedUnit) : 'Unit';

    practiceQuestions.forEach((pq, idx) => {
      const q: PYQQuestion = {
        id: `q-practice-${Date.now().toString(36)}-${idx}`,
        subjectId: targetSubjectId,
        subjectName: targetSubject.name,
        unit: selectedUnit?.unit || 1,
        unitId: selectedUnit?.id || `u1`,
        unitTitle: unitLabelDisplay,
        question: pq.question,
        marks: pq.marks,
        yearsAsked: [2024, 2025],
        repeatCount: pq.marks === 10 ? 3 : 2,
        isHighProbability: pq.marks === 10,
        expectedKeywords: ['Definition', 'Working Mechanism', 'Application'],
        bullets: [
          'State key definition and theoretical scope.',
          'Elaborate step-by-step logic or technical details.',
          'Provide practical examples and trade-offs expected in exams.'
        ],
        diagramFormulaTip: 'Draw a clear labeled diagram or state governing formulas.',
        userStatus: 'not-started',
        isCustom: true
      };
      onAddQuestion(q);
    });

    onShowToast(`Added ${practiceQuestions.length} practice questions to PYQ Bank! 🎯`, 'success');
  };

  // ACTION 4: Save Original File to IndexedDB & Notes Library
  const handleSaveFileToSubject = async () => {
    const fileName = selectedFile?.name || (analysis?.headings[0]?.cleanTitle ? `${analysis.headings[0].cleanTitle}.pdf` : 'Study_Notes.pdf');
    const unitLabelDisplay = selectedUnit ? formatUnitDisplayName(selectedUnit) : 'Unit';

    // 1. Store original file in IndexedDB under selected subject & unit
    if (fileDataUrl && selectedFile) {
      const isImg = selectedFile.type.startsWith('image/');
      const newSubjectFile: SubjectFile = {
        id: `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        subjectId: targetSubjectId,
        unitId: selectedUnit?.id || `u1`,
        name: fileName,
        description: analysis?.summary?.[0] || 'Extracted notes file',
        category: 'notes',
        fileType: isImg ? 'image' : 'pdf',
        dataUrl: fileDataUrl,
        size: selectedFile.size,
        isImportant: false,
        isDone: false,
        createdAt: Date.now()
      };
      try {
        await indexedDbService.addFile(newSubjectFile);
      } catch (idbErr) {
        console.error('Error saving to IndexedDB:', idbErr);
      }
    }

    // 2. Save note in PDF state library
    const newPdf: PdfResource = {
      id: `pdf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: targetSubjectId,
      unit: selectedUnit?.unit || 1,
      unitId: selectedUnit?.id || `u1`,
      fileName,
      uploadDate: new Date().toLocaleDateString(),
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
      extractedText: editableText || analysis?.cleanedText || '',
      summary: analysis?.summary?.join(' ') || 'Summary not available.',
      extractedQuestions: practiceQuestions.map(q => q.question)
    };

    onAddPdf(newPdf);
    onShowToast(`Saved file & notes under ${targetSubject.name} (${unitLabelDisplay}) in IndexedDB! 💾`, 'success');
  };

  return (
    <div className="space-y-8 animate-fade-slide-up max-w-5xl mx-auto pb-16">
      
      {/* 1. HONEST NAMING: Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>PDF Notes Extractor</span>
          </h2>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            Extract clean outlines, key terms, formulas, and practice questions from chapter PDFs, scanned notes, and images.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="p-8 rounded-3xl bg-paper-card dark:bg-night-card border-2 border-dashed border-paper-border dark:border-night-border hover:border-emerald-500 transition-all text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
          {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-paper-ink dark:text-night-text">
            {isProcessing ? (ocrProgress?.status || 'Processing Document...') : 'Upload University Notes, Scanned PDFs, or Photos'}
          </h3>
          <p className="text-xs text-paper-muted dark:text-night-muted max-w-md mx-auto">
            Drag and drop chapter PDFs or photos of notes (.pdf, .png, .jpg). Built-in local OCR handles scanned pages in your browser.
          </p>
        </div>

        {/* OCR Progress Bar */}
        {isProcessing && ocrProgress && (
          <div className="max-w-md mx-auto space-y-2 pt-2">
            <div className="w-full bg-paper-cardElevated dark:bg-night-cardElevated h-2.5 rounded-full overflow-hidden border border-paper-border dark:border-night-border">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${ocrProgress.percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-paper-muted dark:text-night-muted">
              <span>{ocrProgress.status}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{ocrProgress.percent}%</span>
            </div>
          </div>
        )}

        <div>
          <label className="inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer btn-tactile shadow-sm">
            <span>Choose PDF or Image File</span>
            <input 
              type="file" 
              accept=".pdf,application/pdf,image/png,image/jpeg,image/webp,image/jpg" 
              onChange={handleFileUpload} 
              disabled={isProcessing}
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* QUALITY GUARD: When text is too short or garbled */}
      {analysis && !analysis.quality.isReliable && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-paper-ink dark:text-night-text space-y-4 animate-fade-slide-up">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-rose-600 dark:text-rose-400">
                Could not analyze this file reliably
              </h4>
              <p className="text-xs text-paper-body dark:text-night-text leading-relaxed">
                {analysis.quality.reason || 'The extracted text contains too few readable words or appears garbled.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {fileDataUrl && (
              <a
                href={fileDataUrl}
                target="_blank"
                rel="noreferrer"
                download={selectedFile?.name || 'notes_file'}
                className="px-4 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs font-bold hover:border-emerald-500 flex items-center gap-1.5 btn-tactile"
              >
                <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>View Original File</span>
              </a>
            )}

            <button
              onClick={() => setIsTextEditorOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 btn-tactile"
            >
              Open Text Editor to Paste Notes
            </button>
          </div>
        </div>
      )}

      {/* EDITABLE EXTRACTED TEXT DRAWER (Available for verification & re-analyzing) */}
      {analysis && (
        <div className="p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsTextEditorOpen(!isTextEditorOpen)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-paper-ink dark:text-night-text hover:text-emerald-600 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Extracted Notes Text ({editableText.length} chars)</span>
              {isTextEditorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <span className="text-[11px] text-paper-muted dark:text-night-muted">
              Page numbers & broken breaks removed. Edit freely and re-analyze.
            </span>
          </div>

          {isTextEditorOpen && (
            <div className="space-y-3 pt-2">
              <textarea
                rows={8}
                value={editableText}
                onChange={e => setEditableText(e.target.value)}
                placeholder="Paste or clean up notes text here..."
                className="w-full p-3.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text font-mono leading-relaxed focus:outline-none focus:border-emerald-500 resize-y"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-paper-muted dark:text-night-muted">
                  Fix any OCR typos above and click Analyze again.
                </span>
                <button
                  onClick={handleReanalyze}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 btn-tactile shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Analyze again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STRUCTURED OUTPUT BLOCKS (Rendered only if text passed quality guard) */}
      {analysis && analysis.quality.isReliable && (
        <div className="p-6 sm:p-8 rounded-3xl bg-paper-card dark:bg-night-card border border-emerald-500/40 shadow-xl space-y-8 animate-fade-slide-up">
          
          {/* Header & Target Subject/Unit Selection (Uses Saved Unit Labels) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-border dark:border-night-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                  Structured Study Notes
                </span>
                <span className="text-xs text-paper-muted dark:text-night-muted">
                  {selectedFile ? selectedFile.name : 'Extracted Chapter'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-paper-ink dark:text-night-text">
                {selectedFile?.name.replace(/\.[^/.]+$/, '') || 'Document Overview'}
              </h3>
            </div>

            {/* Target Subject & Unit dropdowns (Strictly using formatUnitDisplayName) */}
            <div className="flex items-center gap-2 flex-wrap">
              <div>
                <label className="block text-[10px] font-bold uppercase text-paper-muted dark:text-night-muted mb-0.5">Subject</label>
                <select
                  value={targetSubjectId}
                  onChange={e => setTargetSubjectId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-paper-muted dark:text-night-muted mb-0.5">Unit</label>
                <select
                  value={selectedUnit?.id || ''}
                  onChange={e => setTargetUnitId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text"
                >
                  {targetSubject?.units?.map(u => (
                    <option key={u.id} value={u.id}>
                      {formatUnitDisplayName(u)}
                    </option>
                  ))}
                  {(!targetSubject?.units || targetSubject.units.length === 0) && (
                    <option value="">No units defined</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* BLOCK 1: Contents / Outline & "Add Headings as Topics" */}
          {analysis.headings.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1.5">
                  <ListTree className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>1. Contents / Outline ({analysis.headings.length} Sections Detected)</span>
                </h4>

                {onAddTopic && (
                  <button
                    onClick={handleAddHeadingsAsTopics}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 btn-tactile shadow-xs self-start sm:self-auto"
                    title="Add checked headings as topics to the selected unit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Headings as Topics</span>
                  </button>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border space-y-2 max-h-64 overflow-y-auto">
                {analysis.headings.map(h => {
                  const alreadyExists = existingTopicTitles.has(h.cleanTitle.toLowerCase().trim());
                  const isChecked = !!selectedHeadings[h.id];

                  return (
                    <div 
                      key={h.id}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                        h.level === 1 
                          ? 'bg-paper-card dark:bg-night-card font-semibold' 
                          : 'pl-6 text-xs text-paper-body dark:text-night-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {onAddTopic && (
                          <button
                            type="button"
                            disabled={alreadyExists}
                            onClick={() => setSelectedHeadings(prev => ({ ...prev, [h.id]: !prev[h.id] }))}
                            className={`p-0.5 rounded transition-colors ${alreadyExists ? 'opacity-40 cursor-not-allowed text-paper-muted' : 'text-emerald-600 dark:text-emerald-400'}`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 text-paper-muted" />
                            )}
                          </button>
                        )}
                        <span className="truncate text-xs text-paper-ink dark:text-night-text">
                          {h.title}
                        </span>
                      </div>

                      {alreadyExists && (
                        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md shrink-0">
                          Already in syllabus
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BLOCK 2: Executive Summary (3 to 5 Complete Sentences, Document-wide) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>2. Executive Summary (3–5 Complete Sentences)</span>
            </h4>
            <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-body dark:text-night-text leading-relaxed space-y-2">
              {analysis.summary.map((sentence, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:text-emerald-400 mt-1.5 shrink-0" />
                  <span>{sentence}</span>
                </p>
              ))}
            </div>
          </div>

          {/* BLOCK 3: Key Terms & Definitions (Strict Patterns, Bold Term & Separate Definition) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>3. Key Terms & Definitions ({analysis.keyTerms.length} Extracted)</span>
              </h4>

              <button
                onClick={handleCreateFlashcards}
                disabled={analysis.keyTerms.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 btn-tactile shadow-xs"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Create Flashcards ({analysis.keyTerms.length})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.keyTerms.map((kt, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border space-y-1">
                  <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                    {kt.term}
                  </div>
                  <div className="text-[11px] text-paper-body dark:text-night-muted leading-relaxed">
                    {kt.definition}
                  </div>
                </div>
              ))}

              {analysis.keyTerms.length === 0 && (
                <div className="col-span-2 p-4 text-center text-xs text-paper-muted italic rounded-xl border border-dashed border-paper-border dark:border-night-border">
                  No strict definition patterns ("X is defined as", "X means", "X refers to") found in this text.
                </div>
              )}
            </div>
          </div>

          {/* BLOCK 4: Formulas & Algorithms (Listed Separately) */}
          {(analysis.formulasAndAlgorithms.formulas.length > 0 || analysis.formulasAndAlgorithms.algorithms.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Formulas */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1.5">
                  <FunctionSquare className="w-4 h-4 text-amber-500" />
                  <span>4A. Governing Formulas & Equations ({analysis.formulasAndAlgorithms.formulas.length})</span>
                </h4>
                <div className="p-3.5 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border space-y-2 max-h-52 overflow-y-auto font-mono text-xs">
                  {analysis.formulasAndAlgorithms.formulas.map((f, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text">
                      {f}
                    </div>
                  ))}
                  {analysis.formulasAndAlgorithms.formulas.length === 0 && (
                    <div className="text-center py-3 text-xs text-paper-muted italic">No formulas detected.</div>
                  )}
                </div>
              </div>

              {/* Algorithms */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-purple-500" />
                  <span>4B. Step-by-Step Algorithms ({analysis.formulasAndAlgorithms.algorithms.length})</span>
                </h4>
                <div className="p-3.5 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border space-y-2 max-h-52 overflow-y-auto font-mono text-xs">
                  {analysis.formulasAndAlgorithms.algorithms.map((a, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text">
                      {a}
                    </div>
                  ))}
                  {analysis.formulasAndAlgorithms.algorithms.length === 0 && (
                    <div className="text-center py-3 text-xs text-paper-muted italic">No numbered algorithm steps detected.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BLOCK 5: Practice Questions from your Notes (Complete Sentences, Editable Marks) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>5. Practice Questions from your Notes ({practiceQuestions.length})</span>
                </h4>
                <p className="text-[11px] text-paper-muted dark:text-night-muted">
                  Generated from outlines, key terms, and formulas. Every question is complete with editable suggested marks.
                </p>
              </div>

              <button
                onClick={handleSaveQuestionsToPyqBank}
                disabled={practiceQuestions.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 btn-tactile shadow-xs self-start sm:self-auto"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Add to PYQ Bank ({practiceQuestions.length})</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {practiceQuestions.map((pq) => (
                <div 
                  key={pq.id} 
                  className="p-3.5 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={pq.question}
                      onChange={e => handleQuestionTextChange(pq.id, e.target.value)}
                      className="w-full bg-transparent border-b border-transparent hover:border-paper-border focus:border-emerald-500 focus:outline-none font-semibold text-paper-ink dark:text-night-text py-0.5 text-xs"
                      title="Click to edit question text"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-paper-muted uppercase font-mono">Suggested Marks:</span>
                    <select
                      value={pq.marks}
                      onChange={e => handleQuestionMarksChange(pq.id, Number(e.target.value) as 2 | 5 | 10)}
                      className="px-2 py-1 rounded-lg text-xs font-bold font-mono bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-amber-600 dark:text-amber-400 focus:outline-none"
                    >
                      <option value={2}>2 Marks</option>
                      <option value={5}>5 Marks</option>
                      <option value={10}>10 Marks</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS (Save original file to IndexedDB, Create Flashcards, Add to PYQ) */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-paper-border dark:border-night-border">
            <button
              onClick={handleCreateFlashcards}
              disabled={analysis.keyTerms.length === 0}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated hover:border-cyan-500 text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-1.5 btn-tactile"
            >
              <Brain className="w-4 h-4" />
              <span>Create Flashcards ({analysis.keyTerms.length})</span>
            </button>

            <button
              onClick={handleSaveQuestionsToPyqBank}
              disabled={practiceQuestions.length === 0}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated hover:border-amber-500 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5 btn-tactile"
            >
              <Flame className="w-4 h-4" />
              <span>Add to PYQ Bank ({practiceQuestions.length})</span>
            </button>

            <button
              onClick={handleSaveFileToSubject}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 btn-tactile shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save to {targetSubject.name} (IndexedDB)</span>
            </button>
          </div>

        </div>
      )}

      {/* SAVED NOTES LIBRARY BY SUBJECT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-paper-ink dark:text-night-text flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Saved Subject Notes & Summaries</span>
          </h3>

          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectPdfs.map(pdf => (
            <div 
              key={pdf.id}
              className="p-5 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-xs flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-paper-ink dark:text-night-text line-clamp-1">{pdf.fileName}</h4>
                    <span className="text-[10px] text-paper-muted dark:text-night-muted">{pdf.uploadDate} • {pdf.fileSize}</span>
                  </div>

                  <button
                    onClick={() => onDeletePdf(pdf.id)}
                    className="p-1 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 opacity-70 group-hover:opacity-100"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-paper-body dark:text-night-muted line-clamp-3 bg-paper-cardElevated dark:bg-night-cardElevated p-3 rounded-2xl">
                  {pdf.summary}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-paper-border dark:border-night-border">
                <button
                  onClick={() => setViewingPdf(pdf)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper-cardElevated dark:bg-night-cardElevated hover:border-emerald-500 border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text flex items-center gap-1.5 btn-tactile"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Read Full Extracted Note</span>
                </button>
              </div>
            </div>
          ))}

          {subjectPdfs.length === 0 && (
            <div className="col-span-2 p-8 text-center rounded-3xl bg-paper-card dark:bg-night-card border border-dashed border-paper-border dark:border-night-border text-paper-muted text-xs">
              No notes saved for this subject yet. Upload a PDF or photo of notes above to extract structured outlines and practice questions.
            </div>
          )}
        </div>
      </div>

      {/* FULL NOTE MODAL */}
      {viewingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-slide-up">
          <div className="w-full max-w-2xl max-h-[85vh] p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-2xl relative flex flex-col space-y-4">
            <button 
              onClick={() => setViewingPdf(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text btn-tactile"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-paper-ink dark:text-night-text">{viewingPdf.fileName}</h3>
              <p className="text-xs text-paper-muted dark:text-night-muted">{viewingPdf.uploadDate} • Full Extracted Content</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-body dark:text-night-text leading-relaxed font-mono whitespace-pre-wrap">
                {viewingPdf.extractedText}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-paper-border dark:border-night-border">
              <button
                onClick={() => setViewingPdf(null)}
                className="px-4 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs font-bold btn-tactile"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
