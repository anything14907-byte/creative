import React, { useState } from 'react';
import { SubjectMeta, PdfResource } from '../types';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { 
  FileText, UploadCloud, Plus, Trash2, Eye, Sparkles, AlertCircle, 
  CheckCircle2, X, Download, FileUp 
} from 'lucide-react';

interface PdfVaultTabProps {
  subject: SubjectMeta;
  pdfs: PdfResource[];
  onAddPdf: (pdf: PdfResource) => void;
  onDeletePdf: (id: string) => void;
}

export const PdfVaultTab: React.FC<PdfVaultTabProps> = ({
  subject,
  pdfs,
  onAddPdf,
  onDeletePdf
}) => {
  const subjectPdfs = pdfs.filter(p => p.subjectId === subject.id);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePdfModal, setActivePdfModal] = useState<PdfResource | null>(null);

  // Manual note input toggle
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [customNoteTitle, setCustomNoteTitle] = useState('');
  const [customNoteContent, setCustomNoteContent] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const extractedText = await extractTextFromPdf(file);
      
      // Generate automatic key points summary & questions
      const words = extractedText.split(/\s+/).filter(Boolean);
      const cleanSummary = extractedText.slice(0, 350).replace(/\s+/g, ' ').trim() + '...';

      // Simple regex question extractor
      const matches = extractedText.match(/(?:(?:Explain|Describe|Define|Compare|Calculate|What is|Write short note on)\s+[^.?!]+[.?!])/gi) || [];
      const extractedQuestions = matches.slice(0, 4).map(q => q.trim());

      const newPdf: PdfResource = {
        id: `pdf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        subjectId: subject.id,
        fileName: file.name,
        uploadDate: new Date().toLocaleDateString(),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        extractedText: extractedText || 'No text extracted',
        summary: cleanSummary || 'Syllabus and revision notes extracted directly from uploaded PDF.',
        extractedQuestions: extractedQuestions.length > 0 ? extractedQuestions : [
          `Review core concepts and definitions from ${file.name}`,
          'Summarize key algorithmic principles and draw architecture flow'
        ]
      };

      onAddPdf(newPdf);
      setSelectedFile(null);
      setIsUploading(false);
    } catch (err) {
      console.error('PDF parsing error:', err);
      alert('Could not extract PDF text. Added file metadata.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNoteTitle.trim() || !customNoteContent.trim()) return;

    const newNote: PdfResource = {
      id: `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: subject.id,
      fileName: `${customNoteTitle.trim()}.txt`,
      uploadDate: new Date().toLocaleDateString(),
      fileSize: `${(customNoteContent.length / 1024).toFixed(1)} KB`,
      extractedText: customNoteContent.trim(),
      summary: customNoteContent.slice(0, 250).trim() + '...',
      extractedQuestions: [
        `Review key points from ${customNoteTitle.trim()}`
      ]
    };

    onAddPdf(newNote);
    setCustomNoteTitle('');
    setCustomNoteContent('');
    setIsAddingNote(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl hud-glass-panel">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              {subject.name} • PDF & Study Material Vault
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload question papers, professor slides, and syllabus notes with client-side text extraction.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
          >
            {isAddingNote ? 'Cancel Note' : '+ Paste Text Note'}
          </button>
          <label className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 shrink-0" style={{ backgroundColor: subject.accentColor }}>
            <UploadCloud className="w-4 h-4" />
            Upload PDF Document
            <input 
              type="file" 
              accept=".pdf,.txt" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isProcessing} 
            />
          </label>
        </div>
      </div>

      {/* Processing Status Banner */}
      {isProcessing && (
        <div className="p-4 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs flex items-center justify-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4" />
          Extracting text and generating revision summary from {selectedFile?.name}...
        </div>
      )}

      {/* Paste Note Form */}
      {isAddingNote && (
        <form onSubmit={handleManualNoteSubmit} className="p-5 rounded-2xl bg-[#0E1530] border border-emerald-500/30 space-y-3">
          <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Quick Study Notes for {subject.name}
          </h4>
          <div>
            <input
              type="text"
              required
              placeholder="Note Title (e.g. Unit 3 Quick Formulas & Definitions)"
              value={customNoteTitle}
              onChange={e => setCustomNoteTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <textarea
              required
              rows={5}
              placeholder="Paste lecture takeaways, textbook formulas, or exam tips here..."
              value={customNoteContent}
              onChange={e => setCustomNoteContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-400 text-black text-xs font-bold hover:bg-emerald-300"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* PDF List Cards */}
      {subjectPdfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectPdfs.map(pdf => (
            <div 
              key={pdf.id}
              className="p-5 rounded-2xl hud-glass-panel border border-white/10 hover:border-emerald-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{pdf.fileName}</h4>
                      <span className="text-[10px] text-slate-400">Uploaded {pdf.uploadDate} • {pdf.fileSize}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeletePdf(pdf.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed my-3 line-clamp-3 bg-black/30 p-2.5 rounded-xl border border-white/5">
                  {pdf.summary}
                </p>

                {/* Extracted questions preview */}
                {pdf.extractedQuestions && pdf.extractedQuestions.length > 0 && (
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Extracted Exam Questions:
                    </span>
                    {pdf.extractedQuestions.slice(0, 2).map((q, idx) => (
                      <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-cyan-400">•</span>
                        <span className="line-clamp-1">{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-mono">100% Client-Side Parsed</span>
                <button
                  onClick={() => setActivePdfModal(pdf)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-300" /> Read Full Content
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl hud-glass-panel border border-dashed border-white/20">
          <FileUp className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Documents Uploaded Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Upload course slides, syllabus PDFs, or previous exam question papers for {subject.name} to extract automatic summaries.
          </p>
          <label className="px-4 py-2 rounded-xl bg-emerald-400 text-black text-xs font-bold hover:bg-emerald-300 cursor-pointer inline-flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4" /> Choose PDF File
            <input 
              type="file" 
              accept=".pdf,.txt" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isProcessing} 
            />
          </label>
        </div>
      )}

      {/* Full Content Reader Modal */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#0E1530] border border-white/15 text-white shadow-2xl relative my-8 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setActivePdfModal(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">{activePdfModal.fileName}</h3>
                <span className="text-xs text-slate-400">Extracted Text Content • {activePdfModal.fileSize}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                {activePdfModal.extractedText}
              </div>

              {activePdfModal.extractedQuestions && activePdfModal.extractedQuestions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25">
                  <h4 className="text-xs font-bold text-cyan-300 mb-2">Key Extracted Questions:</h4>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {activePdfModal.extractedQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActivePdfModal(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
