import React, { useState, useEffect } from 'react';
import { SubjectMeta } from '../types';
import { Edit3, X, Trash2, Calendar, BookOpen, Tag, Check } from 'lucide-react';

interface EditSubjectModalProps {
  subject: SubjectMeta | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: SubjectMeta) => void;
  onDelete: (id: string) => void;
}

const COLOR_OPTIONS = [
  { name: 'Cyber Emerald', hex: '#10B981' },
  { name: 'Ocean Cyan', hex: '#06B6D4' },
  { name: 'Solar Amber', hex: '#F59E0B' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
];

export const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  subject,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [accentColor, setAccentColor] = useState(COLOR_OPTIONS[0].hex);
  const [examDate, setExamDate] = useState('');
  const [unitsInput, setUnitsInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (subject) {
      setName(subject.name);
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
    if (!name.trim() || !examDate) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-slide-up">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-2xl relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-paper-ink dark:text-night-text">
              Edit Subject
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted">
              {subject.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-paper-ink dark:text-night-text mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Subject Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-paper-ink dark:text-night-text mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Exam Date & Starting Time</span>
            </label>
            <input
              type="datetime-local"
              required
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-paper-ink dark:text-night-text mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Card Accent Theme</span>
              </label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAccentColor(c.hex)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full transition-transform btn-tactile ${accentColor === c.hex ? 'scale-125 ring-2 ring-emerald-500' : 'opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-paper-ink dark:text-night-text mb-1.5">
                Semester / Term
              </label>
              <input
                type="text"
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-paper-ink dark:text-night-text mb-1">
              Syllabus Units (1 per line)
            </label>
            <textarea
              rows={3}
              value={unitsInput}
              onChange={e => setUnitsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500 text-xs font-mono resize-none"
            />
          </div>

          {/* Delete Section */}
          <div className="pt-2 border-t border-paper-border dark:border-night-border flex items-center justify-between">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 btn-tactile transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Subject</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">Confirm delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 btn-tactile transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 rounded-xl border border-paper-border dark:border-night-border text-paper-body dark:text-night-text text-xs btn-tactile"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-paper-border dark:border-night-border text-paper-body dark:text-night-text text-xs font-semibold hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg text-xs font-bold flex items-center gap-1.5 btn-tactile shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
