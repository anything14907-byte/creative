import React, { useState } from 'react';
import { SubjectMeta } from '../types';
import { toDatetimeLocalString } from '../utils/storageService';
import { Plus, X, Calendar, BookOpen, Tag } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newSubject: SubjectMeta) => void;
}

const COLOR_OPTIONS = [
  { name: 'Cyber Emerald', hex: '#10B981' },
  { name: 'Ocean Cyan', hex: '#06B6D4' },
  { name: 'Solar Amber', hex: '#F59E0B' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
];

const ICON_OPTIONS = ['Cpu', 'Database', 'Network', 'Code', 'BookOpen'];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('5th Semester');
  const [accentColor, setAccentColor] = useState(COLOR_OPTIONS[0].hex);
  const [iconName, setIconName] = useState(ICON_OPTIONS[0]);
  const [examDate, setExamDate] = useState(() => {
    // Default 10 days from now
    return toDatetimeLocalString(new Date(Date.now() + 10 * 24 * 3600 * 1000));
  });
  const [unitsInput, setUnitsInput] = useState('Unit 1: Fundamentals & Architecture\nUnit 2: Core Processing & Logic\nUnit 3: Optimization & Practice');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !examDate) return;

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
    // Derive a clean short code from subject initials
    const code = name.trim().split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase();

    const newSubject: SubjectMeta = {
      id: newId,
      name: name.trim(),
      code: code || 'SUB',
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
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-paper-ink dark:text-night-text">
              + Add New Subject
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted">
              Track live countdowns, study plans, and past exam questions
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
              placeholder="e.g. Software Engineering or Artificial Intelligence"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text placeholder-paper-muted dark:placeholder-night-muted focus:outline-none focus:border-emerald-500 text-xs"
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

          {/* Color & Semester Pickers */}
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
                placeholder="e.g. 5th Semester"
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
              placeholder="Unit 1: Overview&#10;Unit 2: Deep Dive&#10;Unit 3: Applications"
              className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text placeholder-paper-muted dark:placeholder-night-muted focus:outline-none focus:border-emerald-500 text-xs font-mono resize-none"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-paper-border dark:border-night-border text-paper-body dark:text-night-text text-xs font-semibold hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg text-xs font-bold flex items-center justify-center gap-1.5 btn-tactile shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Subject</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
