import React, { useState, useEffect } from 'react';
import { SubjectMeta } from '../types';
import { Edit3, X, Trash2, Calendar, BookOpen, Hash, Tag, Check } from 'lucide-react';

interface EditSubjectModalProps {
  subject: SubjectMeta | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: SubjectMeta) => void;
  onDelete: (id: string) => void;
}

const COLOR_OPTIONS = [
  { name: 'Electric Cyan', hex: '#00F0FF' },
  { name: 'Hyper Emerald', hex: '#00F5A0' },
  { name: 'Solar Gold', hex: '#FFB800' },
  { name: 'Neon Coral', hex: '#FF3366' },
  { name: 'Sky Cyan', hex: '#38BDF8' },
];

export const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  subject,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [semester, setSemester] = useState('');
  const [accentColor, setAccentColor] = useState(COLOR_OPTIONS[0].hex);
  const [examDate, setExamDate] = useState('');
  const [unitsInput, setUnitsInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setCode(subject.code);
      setSemester(subject.semester || '5th Semester');
      setAccentColor(subject.accentColor || COLOR_OPTIONS[0].hex);
      setExamDate(subject.examDate || '');
      setUnitsInput(
        subject.units.map(u => `Unit ${u.unit}: ${u.title}`).join('\n')
      );
      setShowDeleteConfirm(false);
    }
  }, [subject]);

  if (!isOpen || !subject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !examDate) return;

    const units = unitsInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, idx) => ({
        unit: idx + 1,
        title: line.replace(/^Unit\s*\d+[:\-.]\s*/i, '').trim() || `Unit ${idx + 1}`
      }));

    const updated: SubjectMeta = {
      ...subject,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      semester: semester.trim(),
      accentColor,
      examDate,
      units: units.length > 0 ? units : subject.units
    };

    onUpdate(updated);
    onClose();
  };

  const handleDelete = () => {
    onDelete(subject.id);
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
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Edit Subject & Syllabus</h3>
            <p className="text-xs text-slate-400">{subject.name} ({subject.code})</p>
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
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" /> Subject Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:border-cyan-400 text-sm"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:border-cyan-400 text-xs font-mono"
            />
          </div>

          {/* Delete Section */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Subject
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300 font-bold">Confirm delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 rounded-lg bg-white/10 text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-black text-sm font-bold flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: accentColor }}
              >
                <Check className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
