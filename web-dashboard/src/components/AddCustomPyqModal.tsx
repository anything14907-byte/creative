import React, { useState } from 'react';
import { PYQQuestion, SubjectMeta, QuestionMarks } from '../types';
import { Plus, X, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

interface AddCustomPyqModalProps {
  subject: SubjectMeta;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (q: PYQQuestion) => void;
}

export const AddCustomPyqModal: React.FC<AddCustomPyqModalProps> = ({
  subject,
  isOpen,
  onClose,
  onAdd
}) => {
  const [question, setQuestion] = useState('');
  const [marks, setMarks] = useState<QuestionMarks>(10);
  const [unit, setUnit] = useState(subject.units[0]?.unit || 1);
  const [repeatCount, setRepeatCount] = useState(3);
  const [bullet1, setBullet1] = useState('');
  const [bullet2, setBullet2] = useState('');
  const [bullet3, setBullet3] = useState('');
  const [diagramTip, setDiagramTip] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const bullets = [bullet1, bullet2, bullet3].map(b => b.trim()).filter(Boolean);
    const keywords = keywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const selectedUnitObj = subject.units.find(u => u.unit === unit);
    const unitTitle = selectedUnitObj ? selectedUnitObj.title : `Unit ${unit}`;

    const newQuestion: PYQQuestion = {
      id: `q-custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: subject.id,
      subjectName: subject.name,
      unit,
      unitTitle,
      question: question.trim(),
      marks,
      yearsAsked: [2022, 2023, 2024, 2025],
      repeatCount: Number(repeatCount) || 3,
      isHighProbability: Number(repeatCount) >= 3,
      expectedKeywords: keywords.length > 0 ? keywords : ['Definition', 'Working Principle', 'Key Diagram'],
      bullets: bullets.length > 0 ? bullets : ['Define the primary core concepts and objectives.', 'Explain the sequential execution mechanism.', 'Provide advantages, trade-offs, and exam summary.'],
      diagramFormulaTip: diagramTip.trim() || 'Draw a labeled block diagram and write governing equations.',
      userStatus: 'not-started',
      isCustom: true
    };

    onAdd(newQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-lg p-6 rounded-2xl bg-[#0E1530] border border-white/15 text-white shadow-2xl relative my-8"
        style={{ boxShadow: `0 0 35px -5px ${subject.accentColor}33` }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${subject.accentColor}25`, color: subject.accentColor }}
          >
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Add Custom Past Question (PYQ)</h3>
            <p className="text-xs text-slate-400">{subject.name} • Syllabus Bank</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Exam Question Text
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Explain Peterson's algorithm for mutual exclusion with entry and exit code..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marks</label>
              <select
                value={marks}
                onChange={e => setMarks(Number(e.target.value) as QuestionMarks)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value={10}>10 Marks</option>
                <option value={5}>5 Marks</option>
                <option value={2}>2 Marks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
              <select
                value={unit}
                onChange={e => setUnit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                {subject.units.map(u => (
                  <option key={u.unit} value={u.unit}>Unit {u.unit}: {u.title.slice(0, 15)}...</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Repeat Count</label>
              <input
                type="number"
                min={1}
                max={10}
                value={repeatCount}
                onChange={e => setRepeatCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Model Exam Answer (3 Crisp Bullet Points)
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Bullet 1: Core definition and concept foundation..."
                value={bullet1}
                onChange={e => setBullet1(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
              <input
                type="text"
                placeholder="Bullet 2: Working principle and data structures..."
                value={bullet2}
                onChange={e => setBullet2(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
              <input
                type="text"
                placeholder="Bullet 3: Evaluation, formulas, and conclusions..."
                value={bullet3}
                onChange={e => setBullet3(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Diagram or Formula Tip
            </label>
            <input
              type="text"
              placeholder="e.g. Draw the 2-process shared turn flag matrix..."
              value={diagramTip}
              onChange={e => setDiagramTip(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Keywords (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Mutual Exclusion, Critical Section, Turn Variable, Flag Array"
              value={keywordsInput}
              onChange={e => setKeywordsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-black text-sm font-bold flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: subject.accentColor }}
            >
              <Plus className="w-4 h-4" /> Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
