import React, { useState } from 'react';
import { SubjectMeta, CountdownTime } from '../types';
import { calculateCountdown } from '../utils/storageService';
import { Clock, Calendar, Check, X } from 'lucide-react';

interface EditExamDateModalProps {
  subject: SubjectMeta;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDate: string) => void;
}

export const EditExamDateModal: React.FC<EditExamDateModalProps> = ({
  subject,
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedDate, setSelectedDate] = useState(subject.examDate || '');
  
  if (!isOpen) return null;

  const previewCountdown: CountdownTime = calculateCountdown(selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    onSave(selectedDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        className="w-full max-w-md p-6 rounded-2xl bg-[#0E1530] border border-white/15 text-white shadow-2xl relative"
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
            style={{ backgroundColor: `${subject.accentColor}22`, color: subject.accentColor }}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Edit Exam Date & Time</h3>
            <p className="text-xs text-slate-400">{subject.name} ({subject.code})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Target Exam Date & Starting Time
            </label>
            <input
              type="datetime-local"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">Live Countdown Preview:</span>
            <div className="text-right">
              <span className="text-sm font-bold font-mono text-cyan-300">
                {previewCountdown.label}
              </span>
              <div className="text-[10px] mt-0.5">
                {previewCountdown.urgency === 'critical' && (
                  <span className="text-rose-400 font-bold">🚨 CRITICAL (&lt; 3 Days)</span>
                )}
                {previewCountdown.urgency === 'high' && (
                  <span className="text-amber-400 font-bold">⚡ HIGH PRIORITY (&lt; 7 Days)</span>
                )}
                {previewCountdown.urgency === 'normal' && (
                  <span className="text-emerald-400 font-bold">🟢 ON TRACK (&gt; 7 Days)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
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
              <Check className="w-4 h-4" /> Save Target Date
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
