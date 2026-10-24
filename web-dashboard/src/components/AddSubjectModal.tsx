import React, { useState } from 'react';
import { SubjectMeta } from '../types';
import { toDatetimeLocalString } from '../utils/storageService';
import { Plus, X, Sparkles, Calendar, BookOpen, Hash, Tag } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newSubject: SubjectMeta) => void;
}

const COLOR_OPTIONS = [
  { name: 'Electric Cyan', hex: '#00F0FF' },
  { name: 'Hyper Emerald', hex: '#00F5A0' },
  { name: 'Solar Gold', hex: '#FFB800' },
  { name: 'Neon Coral', hex: '#FF3366' },
  { name: 'Sky Cyan', hex: '#38BDF8' },
];

const ICON_OPTIONS = ['Cpu', 'Database', 'Network', 'Code', 'BookOpen', 'Terminal', 'Sparkles'];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [semester, setSemester] = useState('5th Semester');
  const [accentColor, setAccentColor] = useState(COLOR_OPTIONS[0].hex);
  const [iconName, setIconName] = useState(ICON_OPTIONS[0]);
  const [examDate, setExamDate] = useState(() => {
    // Default 7 days from now
    return toDatetimeLocalString(new Date(Date.now() + 7 * 24 * 3600 * 1000));
  });
  const [unitsInput, setUnitsInput] = useState('Unit 1: Introduction & Fundamentals\nUnit 2: Core Architecture\nUnit 3: Advanced Optimization');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !examDate) return;

    // Parse units
    const units = unitsInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, idx) => ({
        unit: idx + 1,
        title: line.replace(/^Unit\s*\d+[:\-.]\s*/i, '').trim() || `Unit ${idx + 1}`
      }));

    const newId = `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;

    const newSubject: SubjectMeta = {
      id: newId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      semester: semester.trim(),
      accentColor,
      iconName,
      examDate,
      units: units.length > 0 ? units : [{ unit: 1, title: 'Core Syllabus' }]
    };

    onAdd(newSubject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-lg p-6 rounded-2xl bg-[#0E1530] border border-white/15 text-white shadow-2xl relative my-8"
        style={{ boxShadow: `0 0 35px -5px ${accentColor}33` }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Add Custom Exam Subject</h3>
            <p className="text-xs text-slate-400">Configure real university exam date & syllabus tracks</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Subject Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineering"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" /> Subject Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS401"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Exam Date & Starting Time
            </label>
            <input
              type="datetime-local"
              required
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          {/* Color & Icon Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" /> Neon Accent Color
              </label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAccentColor(c.hex)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full transition-transform ${accentColor === c.hex ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0E1530]' : 'opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Semester / Track
              </label>
              <input
                type="text"
                value={semester}
                onChange={e => setSemester(e.target.value)}
                placeholder="e.g. 6th Semester"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Syllabus Units (1 per line)
            </label>
            <textarea
              rows={3}
              value={unitsInput}
              onChange={e => setUnitsInput(e.target.value)}
              placeholder="Unit 1: Overview&#10;Unit 2: Deep Dive&#10;Unit 3: Applications"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs font-mono"
            />
          </div>

          <div className="flex gap-3 pt-3">
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
              style={{ backgroundColor: accentColor }}
            >
              <Plus className="w-4 h-4" /> Create Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
