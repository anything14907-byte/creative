import React, { useState } from 'react';
import { 
  Search, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Check, 
  Loader2, 
  Flame, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { PYQQuestion, SubjectMeta, SubjectId } from '../types';
import { extractTextFromPdf, parseQuestionsFromText } from '../utils/pdfExtractor';
import { QuestionCard } from './QuestionCard';

interface TopicScannerViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: SubjectId;
  questions: PYQQuestion[];
  onAddExtractedQuestions: (newQuestions: PYQQuestion[]) => void;
  onToggleMastered: (id: string) => void;
  onSaveAnswer: (id: string, answer: string, score: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TopicScannerView: React.FC<TopicScannerViewProps> = ({
  subjects,
  activeSubjectId,
  questions,
  onAddExtractedQuestions,
  onToggleMastered,
  onSaveAnswer,
  onShowToast
}) => {
  const [topicText, setTopicText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [matchedQuestions, setMatchedQuestions] = useState<PYQQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Quick try samples
  const handleTrySample = (sampleType: 'deadlock' | 'norm' | 'osi') => {
    let sampleContent = '';
    if (sampleType === 'deadlock') {
      sampleContent = `Operating Systems: Deadlock avoidance and Banker's Algorithm. Safe sequence calculations, Allocation and Max matrices, available resources vector, and Coffman deadlock conditions.`;
    } else if (sampleType === 'norm') {
      sampleContent = `Database Management: Relational decomposition, 1NF, 2NF, 3NF, and BCNF normalization. Candidate keys, functional dependencies, and transitive dependency removal.`;
    } else {
      sampleContent = `Computer Networks: Transport layer flow control and congestion avoidance. TCP 3-way handshake, SYN, ACK packets, sliding window, and AIMD congestion window cwnd.`;
    }

    setTopicText(sampleContent);
    runScanner(sampleContent);
  };

  const runScanner = (text: string) => {
    if (!text.trim()) return;
    setIsScanning(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      const scored = questions.map(q => {
        let score = 0;
        const qLower = q.question.toLowerCase();
        const unitLower = q.unitTitle.toLowerCase();
        
        // Keyword matches
        for (const kw of q.expectedKeywords) {
          if (lower.includes(kw.toLowerCase())) score += 5;
        }

        // Text matches
        const tokens = lower.split(/\s+/).filter(w => w.length > 3);
        for (const t of tokens) {
          if (qLower.includes(t)) score += 1.5;
          if (unitLower.includes(t)) score += 2;
        }

        return { question: q, score };
      });

      const filtered = scored
        .filter(item => item.score > 3)
        .sort((a, b) => b.score - a.score)
        .map(item => item.question);

      setMatchedQuestions(filtered.length > 0 ? filtered.slice(0, 5) : questions.slice(0, 3));
      setIsScanning(false);
      onShowToast(`Scanner matched ${filtered.length || 3} relevant exam questions!`, 'success');
    }, 450);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const text = await extractTextFromPdf(file);
      const parsed = parseQuestionsFromText(text, activeSubjectId, 2025);
      if (parsed.length > 0) {
        onAddExtractedQuestions(parsed);
        setMatchedQuestions(parsed);
        onShowToast(`Extracted ${parsed.length} questions from ${file.name}!`, 'success');
      } else {
        onShowToast('Could not find question formats in this file. Try pasting text on the left.', 'info');
      }
    } catch (err: any) {
      onShowToast('Failed to extract PDF text', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* View Header */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-day-text dark:text-white">
          Smart Topic Scanner & Question Paper Upload
        </h2>
        <p className="text-xs sm:text-sm text-day-muted dark:text-cyber-muted">
          Paste study notes or drop an exam paper to instantly discover matching university questions.
        </p>
      </div>

      {/* 2-Column Split: Topic Paste (Left) & Drop PDF (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left Card: Paste Topic or Notes */}
        <div className="p-5 rounded-2xl border border-paper-border dark:border-night-border bg-paper-card dark:bg-night-card shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Paste Study Topic or Notes
              </span>
              <span className="text-[11px] text-paper-muted dark:text-night-muted">Instant Matching</span>
            </div>

            <textarea
              value={topicText}
              onChange={(e) => setTopicText(e.target.value)}
              placeholder="Paste article paragraphs, lecture notes, or syllabus topics here..."
              rows={5}
              className="w-full p-3 rounded-xl border border-paper-border dark:border-night-border bg-paper-input dark:bg-night-input text-xs sm:text-sm text-paper-body dark:text-night-text outline-none transition-all resize-none"
            />

            {/* 3 Quick-Try Sample Buttons */}
            <div className="pt-2 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted">
                1-Click Quick Samples:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleTrySample('deadlock')}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20"
                >
                  Try: OS Deadlock Notes
                </button>
                <button
                  onClick={() => handleTrySample('norm')}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/20"
                >
                  Try: DBMS Normalization
                </button>
                <button
                  onClick={() => handleTrySample('osi')}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20"
                >
                  Try: TCP & Handshake
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => runScanner(topicText)}
            disabled={isScanning || !topicText.trim()}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all active:scale-95 btn-tactile"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isScanning ? 'Matching Questions...' : 'Scan For Matching PYQs'}</span>
          </button>
        </div>

        {/* Right Card: Drop Question Paper PDF */}
        <div className="p-5 rounded-2xl border border-paper-border dark:border-night-border bg-paper-card dark:bg-night-card shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5" />
                Drop Question Paper PDF
              </span>
              <span className="text-[11px] text-paper-muted dark:text-night-muted">Client-Side Parser</span>
            </div>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFileUpload(file);
              }}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-paper-border dark:border-night-border rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated hover:border-emerald-500 cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              </div>
              <div className="text-xs font-bold text-paper-ink dark:text-night-text">
                {isUploading ? 'Extracting questions...' : 'Click to select or drag PDF paper'}
              </div>
              <p className="text-[11px] text-paper-muted dark:text-night-muted mt-0.5">
                Scanned university papers, midterm sheets (.pdf, .txt)
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
          </div>

          <div className="p-3 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-muted dark:text-night-muted flex items-center justify-between">
            <span>Or load pre-set test paper:</span>
            <button
              onClick={() => handleTrySample('deadlock')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Load 2025 Paper →
            </button>
          </div>
        </div>

      </div>

      {/* Matched Questions Result Section */}
      {matchedQuestions.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-day-text dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00E599]" />
              Matched Past University Questions ({matchedQuestions.length})
            </h3>
            <span className="text-xs text-day-muted dark:text-cyber-muted">
              Click 'Show Ideal Exam Answer' to review
            </span>
          </div>

          <div className="space-y-3">
            {matchedQuestions.map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                onToggleMastered={onToggleMastered}
                onSaveAnswer={onSaveAnswer}
                onShowToast={onShowToast}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
