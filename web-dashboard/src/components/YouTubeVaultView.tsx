import React, { useState } from 'react';
import { SubjectMeta, VideoResource } from '../types';
import { extractYoutubeId } from '../utils/storageService';
import { 
  Video, 
  Play, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Layers, 
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';

interface YouTubeVaultViewProps {
  subjects: SubjectMeta[];
  activeSubjectId: string;
  videos: VideoResource[];
  onAddVideo: (video: VideoResource) => void;
  onUpdateVideoNotes: (id: string, notes: string) => void;
  onToggleVideoWatched: (id: string) => void;
  onDeleteVideo: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const YouTubeVaultView: React.FC<YouTubeVaultViewProps> = ({
  subjects,
  activeSubjectId,
  videos,
  onAddVideo,
  onUpdateVideoNotes,
  onToggleVideoWatched,
  onDeleteVideo,
  onShowToast
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [activePlayingId, setActivePlayingId] = useState<string>('');
  const [seekTimestampSeconds, setSeekTimestampSeconds] = useState<number>(0);

  // Add video modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [subjectId, setSubjectId] = useState(activeSubjectId || subjects[0]?.id || 'os');
  const [videoTitle, setVideoTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [unitNum, setUnitNum] = useState(1);
  const [initialNotes, setInitialNotes] = useState('');

  const filteredVideos = videos.filter(v => {
    if (selectedSubjectId !== 'all' && v.subjectId !== selectedSubjectId) return false;
    return true;
  });

  // Group videos by subject
  const currentSubject = subjects.find(s => s.id === subjectId) || subjects[0];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !youtubeUrl.trim()) return;

    const ytid = extractYoutubeId(youtubeUrl.trim());
    if (!ytid) {
      onShowToast('Please enter a valid YouTube link (e.g. youtube.com or youtu.be)', 'error');
      return;
    }

    const newVid: VideoResource = {
      id: `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId,
      unit: Number(unitNum) || 1,
      unitId: `u${unitNum}`,
      title: videoTitle.trim(),
      youtubeUrl: youtubeUrl.trim(),
      videoId: ytid,
      notes: initialNotes.trim(),
      isWatched: false,
      addedAt: Date.now()
    };

    onAddVideo(newVid);
    setVideoTitle('');
    setYoutubeUrl('');
    setInitialNotes('');
    setIsAddOpen(false);
    onShowToast('Video lecture saved to YouTube Vault! 🎬', 'success');
  };

  // Convert mm:ss or hh:mm:ss to seconds
  const parseTimestamp = (ts: string): number => {
    const parts = ts.split(':').map(Number);
    if (parts.length === 2) {
      return (parts[0] * 60) + parts[1];
    } else if (parts.length === 3) {
      return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }
    return 0;
  };

  const handleTimestampClick = (vidId: string, timestampStr: string) => {
    const seconds = parseTimestamp(timestampStr);
    setActivePlayingId(vidId);
    setSeekTimestampSeconds(seconds);
    onShowToast(`Seeking to ${timestampStr} in video...`, 'info');
  };

  // Render notes with clickable timestamps
  const renderNotesWithClickableTimestamps = (vid: VideoResource) => {
    const notesText = vid.notes || '';
    if (!notesText.trim()) {
      return <span className="italic text-paper-muted dark:text-night-muted">No notes yet. Add timestamps like 02:30 below.</span>;
    }

    // Split text by timestamp pattern (e.g. 01:25 or 12:45 or 1:05:20)
    const regex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(notesText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(notesText.substring(lastIndex, match.index));
      }
      const timeStr = match[1];
      parts.push(
        <button
          key={`${vid.id}-${match.index}`}
          onClick={() => handleTimestampClick(vid.id, timeStr)}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 mx-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-[11px] transition-colors"
          title={`Click to jump to ${timeStr}`}
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>{timeStr}</span>
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < notesText.length) {
      parts.push(notesText.substring(lastIndex));
    }

    return parts;
  };

  const insertTimestampIntoNotes = (vid: VideoResource) => {
    const sample = vid.notes ? `${vid.notes}\n02:15 - Key exam formula` : '02:15 - Key exam formula';
    onUpdateVideoNotes(vid.id, sample);
    onShowToast('Added sample timestamp to notes! Click it to test seeking.', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-slide-up pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-paper-ink dark:text-night-text flex items-center gap-2">
            <Video className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>YouTube Lecture Vault & Timestamps</span>
          </h2>
          <p className="text-xs text-paper-muted dark:text-night-muted mt-0.5">
            Group lectures by subject and topic, track watched status, and jump directly to key video timestamps.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5 btn-tactile shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add YouTube Lecture</span>
        </button>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-paper-border dark:border-night-border max-w-full">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold btn-tactile whitespace-nowrap ${
            selectedSubjectId === 'all'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-body dark:text-night-text'
          }`}
        >
          All Subjects ({videos.length})
        </button>

        {subjects.map(s => {
          const isSelected = s.id === selectedSubjectId;
          const count = videos.filter(v => v.subjectId === s.id).length;

          return (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile whitespace-nowrap ${
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

      {/* Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVideos.map(vid => {
          const sub = subjects.find(s => s.id === vid.subjectId);
          const isPlaying = activePlayingId === vid.id;
          const embedUrl = isPlaying 
            ? `https://www.youtube-nocookie.com/embed/${vid.videoId}?start=${seekTimestampSeconds}&autoplay=1&rel=0`
            : `https://www.youtube-nocookie.com/embed/${vid.videoId}?rel=0`;

          return (
            <div 
              key={vid.id}
              className="p-5 sm:p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card space-y-4 flex flex-col justify-between"
              style={{ borderTop: `4px solid ${sub?.accentColor || '#06B6D4'}` }}
            >
              <div className="space-y-3">
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono"
                        style={{ backgroundColor: `${sub?.accentColor || '#06B6D4'}18`, color: sub?.accentColor || '#06B6D4' }}
                      >
                        {sub?.name || vid.subjectId} • Unit {vid.unit || 1}
                      </span>

                      {/* Watched Toggle Badge */}
                      <button
                        onClick={() => onToggleVideoWatched(vid.id)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                          vid.isWatched
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-paper-cardElevated dark:bg-night-cardElevated text-paper-muted dark:text-night-muted border border-paper-border dark:border-night-border'
                        }`}
                      >
                        {vid.isWatched ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                        <span>{vid.isWatched ? 'Watched' : 'To Watch'}</span>
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-paper-ink dark:text-night-text line-clamp-1">
                      {vid.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={vid.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-paper-muted hover:text-cyan-600 dark:text-night-muted dark:hover:text-cyan-400"
                      title="Open in YouTube"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onDeleteVideo(vid.id)}
                      className="p-1.5 rounded-lg text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400"
                      title="Delete video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Video Player */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-xs">
                  {isPlaying ? (
                    <iframe
                      src={embedUrl}
                      title={vid.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div 
                      onClick={() => { setActivePlayingId(vid.id); setSeekTimestampSeconds(0); }}
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-slate-900 text-white relative group"
                    >
                      <img 
                        src={`https://img.youtube.com/vi/${vid.videoId}/hqdefault.jpg`} 
                        alt={vid.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        onError={(e) => { (e.target as any).style.display = 'none'; }}
                      />
                      <div className="absolute w-14 h-14 rounded-2xl bg-cyan-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Clickable Timestamps Preview & Notes */}
                <div className="p-3 rounded-2xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>Timestamps & Exam Notes:</span>
                    </span>
                    <button
                      onClick={() => insertTimestampIntoNotes(vid)}
                      className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline btn-tactile"
                    >
                      + Add 02:15 Stamp
                    </button>
                  </div>

                  <div className="text-xs text-paper-body dark:text-night-text leading-relaxed whitespace-pre-wrap">
                    {renderNotesWithClickableTimestamps(vid)}
                  </div>
                </div>
              </div>

              {/* Notes Input Box */}
              <div>
                <textarea
                  rows={2}
                  placeholder="Type formulas, notes, or timestamps like 03:45..."
                  value={vid.notes || ''}
                  onChange={e => onUpdateVideoNotes(vid.id, e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs font-mono text-paper-ink dark:text-night-text focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-paper-card dark:bg-night-card border border-dashed border-paper-border dark:border-night-border text-paper-muted space-y-2">
          <Video className="w-8 h-8 mx-auto opacity-50" />
          <h4 className="text-sm font-bold text-paper-ink dark:text-night-text">No lectures saved in this subject</h4>
          <p className="text-xs">Click "+ Add YouTube Lecture" above to save crash courses or revision videos.</p>
        </div>
      )}

      {/* ADD LECTURE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-slide-up">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text shadow-2xl relative space-y-4">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-paper-muted hover:text-paper-ink dark:text-night-muted dark:hover:text-night-text btn-tactile"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <Video className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-bold text-paper-ink dark:text-night-text">
                + Save Video Lecture to Vault
              </h3>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Unit Number</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={unitNum}
                    onChange={e => setUnitNum(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Lecture Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banker's Algorithm Full Numerical with Gantt Chart"
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">YouTube URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Initial Notes with Timestamps (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 02:15 Safe state condition&#10;08:30 Need matrix formula"
                  value={initialNotes}
                  onChange={e => setInitialNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-xs font-mono focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-paper-border dark:border-night-border text-xs font-bold btn-tactile"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold btn-tactile shadow-sm"
                >
                  Save Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
