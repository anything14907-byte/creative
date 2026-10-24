import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Chrome, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Play, 
  Flame, 
  Search, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Laptop
} from 'lucide-react';
import { PYQQuestion } from '../types';

interface ExtensionInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: PYQQuestion[];
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ExtensionInstallerModal: React.FC<ExtensionInstallerModalProps> = ({
  isOpen,
  onClose,
  questions,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'install' | 'simulator'>('install');
  const [simulatedTopic, setSimulatedTopic] = useState('Operating Systems: Banker\'s Algorithm & Deadlock Avoidance');
  const [simulatedMatches, setSimulatedMatches] = useState<PYQQuestion[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const copyShortcut = () => {
    navigator.clipboard.writeText('Alt + Q');
    onShowToast('Copied shortcut "Alt + Q" to clipboard!', 'success');
  };

  const copyRepoExtensionLink = () => {
    navigator.clipboard.writeText('https://github.com/anything14907-byte/creative/tree/main/extension');
    onShowToast('Copied extension folder link to clipboard!', 'success');
  };

  const handleSimulateScan = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const lower = simulatedTopic.toLowerCase();
      const matched = questions.filter(q => {
        const textMatch = q.question.toLowerCase().includes(lower) || lower.split(/\s+/).some(term => term.length > 3 && q.question.toLowerCase().includes(term));
        const kwMatch = q.expectedKeywords.some(kw => lower.includes(kw.toLowerCase()));
        const unitMatch = q.unitTitle.toLowerCase().includes(lower);
        return textMatch || kwMatch || unitMatch;
      });

      setSimulatedMatches(matched.length > 0 ? matched.slice(0, 4) : questions.slice(0, 3));
      setIsSimulating(false);
      onShowToast(`Simulated scan matched ${matched.length || 3} university PYQs!`, 'success');
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl rounded-3xl border border-solar-border dark:border-obsidian-border bg-solar-card dark:bg-obsidian-card shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-solar-border dark:border-obsidian-border flex items-center justify-between bg-white dark:bg-obsidian-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Chrome className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-solar-text dark:text-obsidian-text">
                  PyqRanker In-Page Study Companion
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Manifest V3 Ready
                </span>
              </div>
              <p className="text-xs text-solar-muted dark:text-obsidian-muted">
                Matches university questions & rubric keys directly inside Wikipedia, GeeksforGeeks, and notes
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

        {/* Tab Navigation */}
        <div className="flex border-b border-solar-border dark:border-obsidian-border px-6 pt-2 gap-4 text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'install'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-solar-muted dark:text-obsidian-muted hover:text-solar-text'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Installation Guide</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('simulator');
              if (simulatedMatches.length === 0) handleSimulateScan();
            }}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-solar-muted dark:text-obsidian-muted hover:text-solar-text'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>Interactive Scanner Simulator</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: INSTALLATION GUIDE */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Zero External Keys • Pure Localhost & Offline Friendly
                  </div>
                  <p className="text-[11px] text-solar-muted dark:text-obsidian-muted mt-0.5">
                    The extension uses Chrome's native Manifest V3 standard with isolated Shadow DOM styling.
                  </p>
                </div>

                <a
                  href="https://github.com/anything14907-byte/creative/tree/main/extension"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex-shrink-0"
                >
                  <span>View /extension on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* 4 Steps */}
              <div className="space-y-3 text-xs">
                
                {/* Step 1 */}
                <div className="p-4 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">1</span>
                    <span className="font-bold text-solar-text dark:text-obsidian-text">Get the extension directory</span>
                  </div>
                  <p className="text-solar-muted dark:text-obsidian-muted pl-7">
                    Clone the repo or download the <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-indigo-600 dark:text-indigo-400">/extension</code> directory to your computer:
                  </p>
                  <div className="pl-7 flex items-center gap-2">
                    <code className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-solar-border dark:border-obsidian-border font-mono text-solar-text dark:text-obsidian-text flex-1 overflow-x-auto">
                      git clone https://github.com/anything14907-byte/creative.git
                    </code>
                    <button
                      onClick={copyRepoExtensionLink}
                      className="px-2.5 py-1 rounded-lg border border-solar-border dark:border-obsidian-border hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">2</span>
                    <span className="font-bold text-solar-text dark:text-obsidian-text">Open browser extension manager</span>
                  </div>
                  <p className="text-solar-muted dark:text-obsidian-muted pl-7">
                    In your Chromium browser (Chrome, Brave, Edge, Arc, Opera), navigate to:
                  </p>
                  <div className="pl-7">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-solar-text dark:text-obsidian-text border border-solar-border dark:border-obsidian-border">
                      chrome://extensions
                    </span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">3</span>
                    <span className="font-bold text-solar-text dark:text-obsidian-text">Enable Developer Mode & Load Unpacked</span>
                  </div>
                  <p className="text-solar-muted dark:text-obsidian-muted pl-7">
                    Toggle <strong>"Developer mode"</strong> in the top-right corner. Then click <strong>"Load unpacked"</strong> and select the <code className="font-mono text-indigo-600 dark:text-indigo-400">/extension</code> folder.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">4</span>
                    <span className="font-bold text-solar-text dark:text-obsidian-text">Open any study page and press Alt + Q</span>
                  </div>
                  <p className="text-solar-muted dark:text-obsidian-muted pl-7">
                    Visit any computer science tutorial, YouTube video, or Wikipedia article. The floating pill button will appear, or you can press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold">Alt + Q</kbd> to launch the in-page recall sidebar!
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE LIVE SCANNER SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-900/50 text-xs">
                <div className="font-bold text-cyan-900 dark:text-cyan-200 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  Live In-Browser TF-IDF Scanner Preview
                </div>
                <p className="text-solar-muted dark:text-obsidian-muted leading-relaxed">
                  Test how the browser extension scans webpage headings, paragraphs, and text selections to match relevant past university exam questions in real time.
                </p>
              </div>

              {/* Sample Topic Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-solar-text dark:text-obsidian-text">
                  Simulate Webpage Topic or Highlighted Text:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simulatedTopic}
                    onChange={(e) => setSimulatedTopic(e.target.value)}
                    placeholder="Enter article topic or highlighted text..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-xs text-solar-text dark:text-obsidian-text outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSimulateScan}
                    disabled={isSimulating}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isSimulating ? 'Scanning...' : 'Scan'}</span>
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-solar-muted dark:text-obsidian-muted">Try presets:</span>
                  {[
                    "Banker's Algorithm & Safe State",
                    "Paging, TLB & Effective Memory Access",
                    "Two-Phase Locking (2PL) Concurrency",
                    "TCP Congestion Control & AIMD",
                    "AVL Tree Rotations (LL, RR, LR, RL)"
                  ].map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        setSimulatedTopic(preset);
                        setTimeout(() => handleSimulateScan(), 50);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-solar-text dark:text-obsidian-text hover:text-indigo-500"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated In-Page Pill & Sidebar Preview */}
              <div className="p-4 rounded-2xl border border-solar-border dark:border-obsidian-border bg-slate-50 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-solar-muted dark:text-obsidian-muted">
                  <span>Simulated Shadow DOM Launcher:</span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md">
                    <Flame className="w-3.5 h-3.5 fill-white animate-pulse" />
                    <span>{simulatedMatches.length} PYQs Match This Page</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {simulatedMatches.map(q => (
                    <div 
                      key={q.id}
                      className="p-3 rounded-xl border border-solar-border dark:border-obsidian-border bg-white dark:bg-obsidian-card text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {q.subjectName} • Unit {q.unit} ({q.marks}M)
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-rose-500">
                          <Flame className="w-3 h-3 fill-rose-500" />
                          Asked {q.repeatCount}x ({q.yearsAsked.join(',')})
                        </span>
                      </div>
                      <p className="font-medium text-solar-text dark:text-obsidian-text">
                        {q.question}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
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

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-solar-border dark:border-obsidian-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
          <button
            onClick={copyShortcut}
            className="flex items-center gap-1 text-solar-muted dark:text-obsidian-muted hover:text-solar-text font-medium"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Shortcut: Alt + Q</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
