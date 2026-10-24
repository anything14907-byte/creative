import React, { useState } from 'react';
import { SubjectMeta, Flashcard } from '../types';
import { 
  Brain, 
  RotateCw, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Award, 
  ArrowRight,
  Layers,
  X
} from 'lucide-react';

interface FlashcardsViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: string;
  flashcards: Flashcard[];
  onAddFlashcard: (card: Flashcard) => void;
  onReviewCard: (cardId: string, rating: 'hard' | 'good' | 'easy') => void;
  onDeleteFlashcard: (cardId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  subjects,
  activeSubjectId,
  flashcards,
  onAddFlashcard,
  onReviewCard,
  onDeleteFlashcard,
  onShowToast
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [isReviewMode, setIsReviewMode] = useState<boolean>(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New card modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cardSubjectId, setCardSubjectId] = useState(activeSubjectId || subjects[0]?.id || 'os');
  const [cardTopic, setCardTopic] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Due flashcards
  const dueCards = flashcards.filter(c => {
    if (selectedSubjectId !== 'all' && c.subjectId !== selectedSubjectId) return false;
    return !c.nextReviewDate || c.nextReviewDate <= todayStr;
  });

  const allFilteredCards = flashcards.filter(c => {
    if (selectedSubjectId !== 'all' && c.subjectId !== selectedSubjectId) return false;
    return true;
  });

  const activeCard = dueCards[currentCardIndex] || null;

  const handleRating = (rating: 'hard' | 'good' | 'easy') => {
    if (!activeCard) return;

    onReviewCard(activeCard.id, rating);
    setIsFlipped(false);

    if (currentCardIndex >= dueCards.length - 1) {
      setCurrentCardIndex(0);
      onShowToast('🎉 Awesome! You completed all flashcards due today!', 'success');
    } else {
      setCurrentCardIndex(idx => idx + 1);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;

    const newCard: Flashcard = {
      id: `fc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: cardSubjectId,
      topicTitle: cardTopic.trim() || 'General Concept',
      front: cardFront.trim(),
      back: cardBack.trim(),
      intervalStep: 0,
      nextReviewDate: todayStr,
      createdAt: Date.now()
    };

    onAddFlashcard(newCard);
    setCardFront('');
    setCardBack('');
    setCardTopic('');
    setIsCreateOpen(false);
    onShowToast('New flashcard added to your spaced repetition deck! 🗂️', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-slide-up max-w-4xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Spaced Repetition Flashcards</span>
          </h2>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            Active recall review with exponential spaced intervals (1, 3, and 7 days).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex p-1 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs font-bold">
            <button
              onClick={() => { setIsReviewMode(true); setIsFlipped(false); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isReviewMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-paper-muted dark:text-night-muted'
              }`}
            >
              Due Today ({dueCards.length})
            </button>
            <button
              onClick={() => setIsReviewMode(false)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                !isReviewMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-paper-muted dark:text-night-muted'
              }`}
            >
              All Cards ({allFilteredCards.length})
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 btn-tactile shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">+ Create Flashcard</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-paper-border dark:border-night-border max-w-full">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold btn-tactile whitespace-nowrap ${
            selectedSubjectId === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-body dark:text-night-text'
          }`}
        >
          All Subjects ({flashcards.length})
        </button>

        {subjects.map(s => {
          const isSelected = s.id === selectedSubjectId;
          const count = flashcards.filter(c => c.subjectId === s.id).length;

          return (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile whitespace-nowrap ${
                isSelected
                  ? 'text-white shadow-xs'
                  : 'bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-body dark:text-night-text'
              }`}
              style={{ backgroundColor: isSelected ? s.accentColor : undefined }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? '#FFFFFF' : s.accentColor }} />
              <span>{s.name}</span>
              <span className="opacity-75 font-mono text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: DUE TODAY INTERACTIVE FLIP CARD */}
      {isReviewMode && activeCard && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-paper-muted dark:text-night-muted">
            <span>Card {currentCardIndex + 1} of {dueCards.length} Due</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Interval: {activeCard.intervalStep === 0 ? 'New Card' : `${activeCard.intervalStep === 1 ? '1 Day' : activeCard.intervalStep === 2 ? '3 Days' : '7 Days'}`}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[320px] sm:min-h-[380px] p-8 sm:p-12 rounded-3xl bg-paper-card dark:bg-night-card border-2 border-paper-border dark:border-night-border hover:border-emerald-500 cursor-pointer shadow-paper-card dark:shadow-night-card transition-all flex flex-col justify-between select-none relative group"
            style={{
              borderColor: isFlipped ? '#10B981' : undefined
            }}
          >
            {/* Card Subject & Topic Tag */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text">
                {subjects.find(s => s.id === activeCard.subjectId)?.name || activeCard.subjectId} • {activeCard.topicTitle}
              </span>

              <span className="text-xs text-paper-muted dark:text-night-muted flex items-center gap-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click to Flip</span>
              </span>
            </div>

            {/* Card Content (Front vs Back) */}
            <div className="my-auto py-6 text-center">
              {!isFlipped ? (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Question / Concept (Front)
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text leading-relaxed">
                    {activeCard.front}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-fade-slide-up">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                    Model Answer / Key Points (Back)
                  </div>
                  <div className="text-base sm:text-lg font-medium text-paper-body dark:text-night-text leading-relaxed whitespace-pre-wrap max-w-2xl mx-auto">
                    {activeCard.back}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Flip Indicator */}
            <div className="text-center text-xs text-paper-muted dark:text-night-muted">
              {!isFlipped ? '💡 Test yourself from memory, then click card to verify answer' : '🎯 Rate how well you remembered this concept below:'}
            </div>
          </div>

          {/* Feedback Rating Buttons (Hard / Good / Easy) */}
          {isFlipped ? (
            <div className="grid grid-cols-3 gap-3 animate-fade-slide-up">
              <button
                onClick={() => handleRating('hard')}
                className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center gap-1 btn-tactile"
              >
                <span className="text-sm font-extrabold">🔴 Hard (Forgot)</span>
                <span className="text-[10px] opacity-80">Review again tomorrow (1d)</span>
              </button>

              <button
                onClick={() => handleRating('good')}
                className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center gap-1 btn-tactile"
              >
                <span className="text-sm font-extrabold">🟡 Good (Remembered)</span>
                <span className="text-[10px] opacity-80">Review in 3 days</span>
              </button>

              <button
                onClick={() => handleRating('easy')}
                className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center gap-1 btn-tactile"
              >
                <span className="text-sm font-extrabold">🟢 Easy (Mastered)</span>
                <span className="text-[10px] opacity-80">Review in 7 days</span>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => setIsFlipped(true)}
                className="px-6 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold btn-tactile shadow-sm inline-flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Show Answer (Flip Card)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* When 0 cards are due today */}
      {isReviewMode && dueCards.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-paper-card dark:bg-night-card border border-dashed border-paper-border dark:border-night-border space-y-3">
          <Award className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-paper-ink dark:text-night-text">
            All Caught Up! No Flashcards Due Today 🎉
          </h3>
          <p className="text-xs text-paper-muted dark:text-night-muted max-w-md mx-auto">
            You've reviewed all active recall flashcards scheduled for today. Check back tomorrow or switch to "All Cards" to browse your deck.
          </p>
          <button
            onClick={() => setIsReviewMode(false)}
            className="px-4 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs font-bold text-paper-ink dark:text-night-text btn-tactile inline-flex items-center gap-2"
          >
            <span>Browse All Flashcards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW 2: ALL FLASHCARDS LIST */}
      {!isReviewMode && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-paper-muted dark:text-night-muted flex items-center justify-between">
            <span>All Flashcards ({allFilteredCards.length})</span>
            <span>Spaced Repetition Schedule</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allFilteredCards.map(card => {
              const sub = subjects.find(s => s.id === card.subjectId);
              return (
                <div 
                  key={card.id} 
                  className="p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-xs flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono"
                        style={{ backgroundColor: `${sub?.accentColor || '#10B981'}18`, color: sub?.accentColor || '#10B981' }}
                      >
                        {sub?.name || card.subjectId} • {card.topicTitle}
                      </span>

                      <button
                        onClick={() => onDeleteFlashcard(card.id)}
                        className="p-1 text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 opacity-70 group-hover:opacity-100"
                        title="Delete Flashcard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-paper-ink dark:text-night-text">
                      {card.front}
                    </h4>

                    <p className="text-xs text-paper-body dark:text-night-muted line-clamp-3 bg-paper-cardElevated dark:bg-night-cardElevated p-2.5 rounded-xl whitespace-pre-wrap">
                      {card.back}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-paper-muted dark:text-night-muted pt-2 border-t border-paper-border dark:border-night-border font-mono">
                    <span>Next Review: {card.nextReviewDate || 'Today'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Step {card.intervalStep}/3
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE FLASHCARD MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-slide-up">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-2xl relative space-y-4">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text btn-tactile"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-paper-ink dark:text-night-text">
                + Create New Study Flashcard
              </h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <select
                    value={cardSubjectId}
                    onChange={e => setCardSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Topic / Concept</label>
                  <input
                    type="text"
                    placeholder="e.g. Banker's Algorithm"
                    value={cardTopic}
                    onChange={e => setCardTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Card Front (Question or Prompt)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. What are the 4 Coffman conditions for Deadlock?"
                  value={cardFront}
                  onChange={e => setCardFront(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Card Back (Model Answer / Key Points)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the ideal exam points, formulas, or bullet points..."
                  value={cardBack}
                  onChange={e => setCardBack(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-paper-border dark:border-night-border text-xs font-bold btn-tactile"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold btn-tactile shadow-sm"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
