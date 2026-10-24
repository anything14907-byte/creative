import React, { useState, useEffect } from 'react';
import { SubjectMeta, SubjectUnit } from '../types';
import { X, Plus, Trash2, BookOpen, Check } from 'lucide-react';

interface EditUnitsModalProps {
  subject: SubjectMeta;
  isOpen: boolean;
  onClose: () => void;
  onSaveUnits: (updatedUnits: SubjectUnit[]) => void;
}

export const EditUnitsModal: React.FC<EditUnitsModalProps> = ({
  subject,
  isOpen,
  onClose,
  onSaveUnits
}) => {
  const [units, setUnits] = useState<SubjectUnit[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (subject && subject.units) {
      setUnits([...subject.units]);
    }
  }, [subject]);

  if (!isOpen) return null;

  const handleTitleChange = (id: string, title: string) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, title, name: title } : u));
  };

  const handleDeleteUnit = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newUnit: SubjectUnit = {
      id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      unitNumber: newTitle.trim(),
      title: newTitle.trim(),
      name: newTitle.trim()
    };

    setUnits(prev => [...prev, newUnit]);
    setNewTitle('');
  };

  const handleSave = () => {
    const cleaned = units.filter(u => u.title.trim().length > 0);
    onSaveUnits(cleaned.length > 0 ? cleaned : subject.units);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-slide-up">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-2xl relative max-h-[88vh] flex flex-col">
        
        {/* Header */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
            style={{ backgroundColor: `${subject.accentColor}18`, color: subject.accentColor }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-paper-ink dark:text-night-text">
              Manage Subject Units
            </h3>
            <p className="text-xs text-paper-muted dark:text-night-muted">
              {subject.name} • {units.length} Units Configured
            </p>
          </div>
        </div>

        {/* Units List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {units.map((u, idx) => (
            <div 
              key={u.id}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border"
            >
              <span 
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0"
                style={{ 
                  backgroundColor: `${subject.accentColor}20`,
                  color: subject.accentColor 
                }}
              >
                Unit {idx + 1}
              </span>

              <input
                type="text"
                value={u.title}
                onChange={e => handleTitleChange(u.id, e.target.value)}
                placeholder={`Unit ${idx + 1} Title`}
                className="flex-1 px-3 py-1.5 rounded-lg bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text focus:outline-none focus:border-emerald-500 font-medium"
              />

              <button
                type="button"
                onClick={() => handleDeleteUnit(u.id)}
                className="p-1.5 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 rounded-lg hover:bg-paper-card dark:hover:bg-night-card transition-colors shrink-0"
                title="Delete unit"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {units.length === 0 && (
            <div className="text-center py-6 text-xs text-paper-muted dark:text-night-muted">
              No units defined yet. Add your first syllabus unit below.
            </div>
          )}
        </div>

        {/* Add New Unit Form */}
        <form onSubmit={handleAddUnit} className="mt-4 pt-3 border-t border-paper-border dark:border-night-border flex gap-2">
          <input
            type="text"
            placeholder={`+ Add Unit ${units.length + 1} title (e.g. Memory Management)...`}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs text-paper-ink dark:text-night-text placeholder-paper-muted dark:placeholder-night-muted focus:outline-none focus:border-emerald-500 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 btn-tactile shadow-sm shrink-0"
            style={{ backgroundColor: subject.accentColor }}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-4 mt-2 border-t border-paper-border dark:border-night-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-paper-border dark:border-night-border text-paper-body dark:text-night-text text-xs font-semibold hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm btn-tactile"
            style={{ backgroundColor: subject.accentColor }}
          >
            <Check className="w-4 h-4" />
            <span>Save Units</span>
          </button>
        </div>

      </div>
    </div>
  );
};
