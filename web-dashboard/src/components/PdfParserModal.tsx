import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Check, 
  Loader2, 
  AlertCircle,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { PYQQuestion, SubjectMeta, SubjectId } from '../types';
import { extractTextFromPdf, parseQuestionsFromText } from '../utils/pdfExtractor';

interface PdfParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectMeta[];
  activeSubjectId: SubjectId;
  onQuestionsExtracted: (newQuestions: PYQQuestion[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PdfParserModal: React.FC<PdfParserModalProps> = ({
  isOpen,
  onClose,
  subjects,
  activeSubjectId,
  onQuestionsExtracted,
  onShowToast
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>(activeSubjectId);
  const [paperYear, setPaperYear] = useState<number>(2025);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<PYQQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'preview'>('upload');

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await extractTextFromPdf(file);
      setRawText(text);
      const parsed = parseQuestionsFromText(text, selectedSubjectId, paperYear);
      if (parsed.length === 0) {
        onShowToast('Could not find question patterns in this document. Try pasting raw text.', 'info');
      } else {
        setExtractedQuestions(parsed);
        setActiveTab('preview');
        onShowToast(`Successfully extracted ${parsed.length} questions from ${file.name}!`, 'success');
      }
    } catch (err: any) {
      onShowToast(err?.message || 'Error parsing PDF document', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseText = () => {
    if (!rawText.trim()) {
      onShowToast('Please paste question paper text first', 'info');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseQuestionsFromText(rawText, selectedSubjectId, paperYear);
      setExtractedQuestions(parsed);
      setActiveTab('preview');
      setIsProcessing(false);
      onShowToast(`Extracted ${parsed.length} questions from text!`, 'success');
    }, 400);
  };

  const loadSamplePaper = (paperType: 'os_2025' | 'dbms_2024') => {
    if (paperType === 'os_2025') {
      setSelectedSubjectId('os');
      setPaperYear(2025);
      setRawText(`UNIVERSITY OF TECHNOLOGY AND ENGINEERING
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
FINAL EXAMINATION — MAY 2025
SUBJECT: CS301 OPERATING SYSTEMS
Time: 3 Hours                                                    Max Marks: 100
--------------------------------------------------------------------------------

SECTION A (Short Answer Questions)
Q1. Define Process Control Block (PCB) and mention any four important fields stored inside it. [2 Marks]
Q2. State the four necessary Coffman conditions required for a deadlock to exist. [2 Marks]
Q3. What is thrashing in virtual memory systems? How does the working set model prevent it? [2 Marks]

SECTION B (Medium Analytical Questions)
Q4. Explain counting vs binary semaphores. Provide pseudocode for wait() and signal() operations. [5 Marks]
Q5. Explain Belady's Anomaly with an illustrative reference string under FIFO page replacement. [5 Marks]
Q6. Compare SCAN and C-SCAN disk scheduling algorithms. Calculate total head movement. [5 Marks]

SECTION C (Comprehensive Essay Questions)
Q7. Explain Banker's Algorithm for deadlock avoidance with a complete example showing Available, Max, Allocation and Need matrices. Trace safety algorithm. [10 Marks]
Q8. Discuss Preemptive vs Non-Preemptive CPU scheduling algorithms with Gantt charts. Calculate average turnaround time and average waiting time for FCFS, SJF and Round Robin. [10 Marks]
Q9. Describe Paging hardware and Translation Lookaside Buffer (TLB). Derive the Effective Memory Access Time (EMAT) formula with numerical hit ratio example. [10 Marks]`);
      setActiveTab('paste');
      onShowToast('Loaded 2025 OS University Final Exam Paper preset!', 'info');
    } else {
      setSelectedSubjectId('dbms');
      setPaperYear(2024);
      setRawText(`DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
UNIVERSITY EXAMINATION — NOVEMBER 2024
SUBJECT: CS302 DATABASE MANAGEMENT SYSTEMS
Time: 3 Hours                                                    Max Marks: 100
--------------------------------------------------------------------------------

1. Define Dirty Read anomaly in concurrent database transactions. Which SQL isolation level prevents it? [2 Marks]
2. Explain 1NF, 2NF, 3NF, and BCNF normalization with candidate keys and functional dependencies. Provide an example schema that satisfies 3NF but violates BCNF. [10 Marks]
3. Explain ACID properties and Conflict Serializability. How does a precedence graph test for serializability? [10 Marks]
4. Describe B+ Tree indexing structures. Why are B+ trees preferred over standard B-trees for range queries? [10 Marks]
5. Discuss Two-Phase Locking (2PL) protocol. Does basic 2PL prevent deadlocks? [5 Marks]`);
      setActiveTab('paste');
      onShowToast('Loaded 2024 DBMS University Paper preset!', 'info');
    }
  };

  const handleCommitQuestions = () => {
    if (extractedQuestions.length === 0) return;
    onQuestionsExtracted(extractedQuestions);
    onShowToast(`Added ${extractedQuestions.length} new PYQs to your question bank!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl rounded-3xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-solar-border dark:border-obsidian-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-solar-text dark:text-obsidian-text">
                University PYQ Paper Parser
              </h2>
              <p className="text-xs text-solar-muted dark:text-obsidian-muted">
                Extract questions, marks weightages, syllabus units, and rubric keys automatically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-solar-muted hover:text-solar-text dark:hover:text-obsidian-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Subject & Year Selectors */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-solar-border dark:border-obsidian-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-solar-text dark:text-obsidian-text">Target Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value as SubjectId)}
              className="px-2.5 py-1 rounded-lg border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-solar-text dark:text-obsidian-text outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-solar-text dark:text-obsidian-text">Exam Year:</span>
            <select
              value={paperYear}
              onChange={(e) => setPaperYear(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-solar-text dark:text-obsidian-text outline-none"
            >
              {[2026, 2025, 2024, 2023, 2022, 2021].map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-solar-muted dark:text-obsidian-muted">Presets:</span>
            <button
              onClick={() => loadSamplePaper('os_2025')}
              className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium hover:underline"
            >
              2025 OS Final
            </button>
            <button
              onClick={() => loadSamplePaper('dbms_2024')}
              className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-[11px] font-medium hover:underline"
            >
              2024 DBMS Midterm
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-solar-border dark:border-obsidian-border px-6 pt-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'upload' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-solar-muted dark:text-obsidian-muted hover:text-solar-text'
            }`}
          >
            Upload PDF File
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'paste' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-solar-muted dark:text-obsidian-muted hover:text-solar-text'
            }`}
          >
            Paste Text Paper
          </button>
          {extractedQuestions.length > 0 && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-solar-muted dark:text-obsidian-muted hover:text-solar-text'
              }`}
            >
              <span>Parsed Preview</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                {extractedQuestions.length}
              </span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload(file);
                }}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-solar-border dark:border-obsidian-border rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-500 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div className="text-sm font-bold text-solar-text dark:text-obsidian-text">
                  {isProcessing ? 'Extracting text with PDF.js...' : 'Drop your University Question Paper PDF here'}
                </div>
                <p className="text-xs text-solar-muted dark:text-obsidian-muted mt-1">
                  Supports multi-page scanned/text PDFs or text documents
                </p>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </label>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-solar-border dark:border-obsidian-border text-xs text-solar-muted dark:text-obsidian-muted flex items-center justify-between">
                <span>Want to test immediately?</span>
                <button
                  onClick={() => loadSamplePaper('os_2025')}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Load 2025 Sample Paper →
                </button>
              </div>
            </div>
          )}

          {/* Paste Tab */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste university question paper text here (e.g., Q1. Explain Banker's Algorithm [10 Marks])..."
                rows={10}
                className="w-full p-4 rounded-xl border border-solar-border dark:border-obsidian-border bg-slate-50/50 dark:bg-slate-900/50 text-solar-text dark:text-obsidian-text font-mono text-xs leading-relaxed outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleParseText}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Parse into Questions</span>
                </button>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-solar-muted dark:text-obsidian-muted mb-2">
                <span>Detected <strong>{extractedQuestions.length}</strong> individual exam questions:</span>
                <span className="text-emerald-500 font-semibold">Ready for import</span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {extractedQuestions.map((q, i) => (
                  <div 
                    key={q.id}
                    className="p-3 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Q{i + 1}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                          Unit {q.unit}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                          {q.marks} Marks
                        </span>
                      </div>
                      <span className="text-[11px] text-solar-muted dark:text-obsidian-muted">
                        Year {q.yearsAsked[0]}
                      </span>
                    </div>

                    <p className="font-medium text-solar-text dark:text-obsidian-text">
                      {q.question}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {q.expectedKeywords.map(k => (
                        <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-solar-border dark:border-obsidian-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-solar-muted hover:text-solar-text dark:hover:text-obsidian-text"
          >
            Cancel
          </button>

          {extractedQuestions.length > 0 && activeTab === 'preview' && (
            <button
              onClick={handleCommitQuestions}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Import {extractedQuestions.length} PYQs to Question Bank</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
