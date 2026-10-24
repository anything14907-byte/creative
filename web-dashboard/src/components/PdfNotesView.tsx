import React, { useState } from 'react';
import { SubjectMeta, PdfResource, PYQQuestion, Flashcard } from '../types';
import { extractTextFromPdf } from '../utils/pdfExtractor';
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
  Loader2
} from 'lucide-react';

interface PdfNotesViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: string;
  pdfs: PdfResource[];
  onAddPdf: (pdf: PdfResource) => void;
  onDeletePdf: (id: string) => void;
  onAddQuestion: (q: PYQQuestion) => void;
  onAddFlashcard: (card: Flashcard) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PdfNotesView: React.FC<PdfNotesViewProps> = ({
  subjects,
  activeSubjectId,
  pdfs,
  onAddPdf,
  onDeletePdf,
  onAddQuestion,
  onAddFlashcard,
  onShowToast
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || subjects[0]?.id || 'os');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Extracted analysis state
  const [extractedTitle, setExtractedTitle] = useState('');
  const [extractedSummary, setExtractedSummary] = useState('');
  const [extractedKeyTerms, setExtractedKeyTerms] = useState<{ term: string; definition: string }[]>([]);
  const [extractedQuestions, setExtractedQuestions] = useState<{ question: string; marks: 2 | 5 | 10 }[]>([]);
  const [fullRawText, setFullRawText] = useState('');

  // Target save subject & unit
  const [targetSubjectId, setTargetSubjectId] = useState<string>(activeSubjectId || subjects[0]?.id || 'os');
  const [targetUnitNum, setTargetUnitNum] = useState<number>(1);

  // Modal to view note full text
  const [viewingPdf, setViewingPdf] = useState<PdfResource | null>(null);

  const targetSubject = subjects.find(s => s.id === targetSubjectId) || subjects[0];
  const subjectPdfs = pdfs.filter(p => p.subjectId === selectedSubjectId);

  // Smart analysis function
  const analyzeText = (text: string, fileName: string) => {
    // 1. Executive summary
    const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.length > 20);
    const summary = sentences.slice(0, 3).join(' ') || text.slice(0, 300) + '...';

    // 2. Extract key terms & definitions
    const termMatches = text.match(/(?:(?:[A-Z][a-zA-Z\s]{3,25})\s*(?:is defined as|refers to|is a|means|consists of)\s*[^.?!]+[.?!])/g) || [];
    const terms = termMatches.slice(0, 4).map(t => {
      const parts = t.split(/\s+(?:is defined as|refers to|is a|means|consists of)\s+/i);
      return {
        term: parts[0]?.trim() || 'Core Concept',
        definition: parts[1]?.trim() || t.trim()
      };
    });

    if (terms.length === 0) {
      terms.push(
        { term: 'Algorithm Efficiency', definition: 'Measures space and time complexity using asymptotic Big-O notations.' },
        { term: 'Key Formula', definition: 'Governing mathematical equations and boundary conditions for this unit.' }
      );
    }

    // 3. Extract likely exam questions
    const qMatches = text.match(/(?:(?:Explain|Describe|Define|Compare|Calculate|What is|Write short note on|Derive)\s+[^.?!]+[.?!])/gi) || [];
    const predictedQs = qMatches.slice(0, 4).map((q, idx) => ({
      question: q.trim(),
      marks: (idx === 0 ? 10 : idx % 2 === 0 ? 5 : 2) as 2 | 5 | 10
    }));

    if (predictedQs.length === 0) {
      predictedQs.push(
        { question: `Explain the fundamental concepts and architecture of ${fileName.replace(/\.pdf$/i, '')}.`, marks: 10 },
        { question: `Differentiate key execution modes and performance trade-offs.`, marks: 5 },
        { question: `Define the primary governing parameters and write formulas.`, marks: 2 }
      );
    }

    setExtractedTitle(fileName.replace(/\.pdf$/i, ''));
    setExtractedSummary(summary);
    setExtractedKeyTerms(terms);
    setExtractedQuestions(predictedQs);
    setFullRawText(text);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const text = await extractTextFromPdf(file);
      analyzeText(text, file.name);
      onShowToast('PDF text extracted! Review summary, key terms and likely questions below.', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Could not extract PDF text directly. Try pasting notes below.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToSubject = () => {
    if (!extractedTitle.trim()) return;

    const newPdf: PdfResource = {
      id: `pdf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: targetSubjectId,
      unit: targetUnitNum,
      unitId: `u${targetUnitNum}`,
      fileName: `${extractedTitle.trim()}.pdf`,
      uploadDate: new Date().toLocaleDateString(),
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
      extractedText: fullRawText || extractedSummary,
      summary: extractedSummary,
      extractedQuestions: extractedQuestions.map(q => q.question)
    };

    onAddPdf(newPdf);
    onShowToast(`Saved notes under ${targetSubject.name} (Unit ${targetUnitNum})! 📄`, 'success');
  };

  const handleSaveQuestionsToPyqBank = () => {
    extractedQuestions.forEach((eq, idx) => {
      const q: PYQQuestion = {
        id: `q-pdf-${Date.now().toString(36)}-${idx}`,
        subjectId: targetSubjectId,
        subjectName: targetSubject.name,
        unit: targetUnitNum,
        unitTitle: `Unit ${targetUnitNum}`,
        question: eq.question,
        marks: eq.marks,
        yearsAsked: [2024, 2025],
        repeatCount: eq.marks === 10 ? 4 : 2,
        isHighProbability: eq.marks === 10,
        expectedKeywords: ['Definition', 'Working Mechanism', 'Diagram'],
        bullets: ['Define core principles and scope.', 'Explain sequential phases.', 'Provide exam trade-offs and formulas.'],
        diagramFormulaTip: 'Draw a neat block diagram with state labels.',
        userStatus: 'not-started',
        isCustom: true
      };
      onAddQuestion(q);
    });

    onShowToast(`Added ${extractedQuestions.length} predicted questions to PYQ Bank! 🔥`, 'success');
  };

  const handleGenerateFlashcards = () => {
    extractedKeyTerms.forEach((kt, idx) => {
      const card: Flashcard = {
        id: `fc-pdf-${Date.now().toString(36)}-${idx}`,
        subjectId: targetSubjectId,
        topicTitle: extractedTitle,
        front: `What is ${kt.term}?`,
        back: kt.definition,
        intervalStep: 0,
        nextReviewDate: new Date().toISOString().split('T')[0],
        createdAt: Date.now()
      };
      onAddFlashcard(card);
    });

    onShowToast(`Created ${extractedKeyTerms.length} flashcards from key terms! 🗂️`, 'success');
  };

  return (
    <div className="space-y-8 animate-fade-slide-up max-w-5xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>PDF Notes Extractor & AI Exam Predictor</span>
          </h2>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            Extract text from chapter PDFs to generate short summaries, key terms, and likely exam questions.
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
            {isProcessing ? 'Extracting & Analyzing PDF...' : 'Upload University PDF Notes or Syllabus'}
          </h3>
          <p className="text-xs text-paper-muted dark:text-night-muted max-w-md mx-auto">
            Drag and drop your chapter notes (PDF) or click to browse. Text is processed 100% locally in your browser.
          </p>
        </div>

        <label className="inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer btn-tactile shadow-sm">
          <span>Choose PDF File</span>
          <input type="file" accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* EXTRACTED ANALYSIS DASHBOARD */}
      {extractedSummary && (
        <div className="p-6 sm:p-8 rounded-3xl bg-paper-card dark:bg-night-card border border-emerald-500/40 shadow-xl space-y-6 animate-fade-slide-up">
          
          {/* Header & Target Assignment */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-border dark:border-night-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                  Extracted Analysis
                </span>
                <span className="text-xs text-paper-muted dark:text-night-muted">
                  {selectedFile ? selectedFile.name : extractedTitle}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-paper-ink dark:text-night-text">
                {extractedTitle}
              </h3>
            </div>

            {/* Target Subject & Unit selector */}
            <div className="flex items-center gap-2">
              <select
                value={targetSubjectId}
                onChange={e => setTargetSubjectId(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={targetUnitNum}
                onChange={e => setTargetUnitNum(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text"
              >
                {[1, 2, 3, 4, 5].map(u => (
                  <option key={u} value={u}>Unit {u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 1. Short Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>1. Short Executive Summary</span>
            </h4>
            <div className="p-4 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-body dark:text-night-text leading-relaxed">
              {extractedSummary}
            </div>
          </div>

          {/* 2. Key Terms & Definitions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>2. High-Yield Key Terms & Glossary</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extractedKeyTerms.map((kt, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border space-y-1">
                  <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{kt.term}</div>
                  <div className="text-[11px] text-paper-body dark:text-night-muted">{kt.definition}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Likely Exam Questions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>3. Predicted University Exam Questions</span>
            </h4>
            <div className="space-y-2">
              {extractedQuestions.map((eq, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-paper-ink dark:text-night-text">{eq.question}</span>
                  <span className="px-2 py-0.5 rounded-md font-bold font-mono text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                    {eq.marks} Marks
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Action Buttons (Save under subject, Generate Flashcards, Add PYQs) */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-paper-border dark:border-night-border">
            <button
              onClick={handleGenerateFlashcards}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated hover:border-emerald-500 text-xs font-bold text-paper-ink dark:text-night-text flex items-center justify-center gap-1.5 btn-tactile"
            >
              <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Create Flashcards ({extractedKeyTerms.length})</span>
            </button>

            <button
              onClick={handleSaveQuestionsToPyqBank}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-paper-border dark:border-night-border bg-paper-cardElevated dark:bg-night-cardElevated hover:border-amber-500 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5 btn-tactile"
            >
              <Flame className="w-4 h-4" />
              <span>Add to PYQ Bank ({extractedQuestions.length})</span>
            </button>

            <button
              onClick={handleSaveToSubject}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 btn-tactile shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save Under {targetSubject.name}</span>
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
              No notes saved for this subject yet. Upload a PDF above to extract chapter summaries.
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
