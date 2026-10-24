import React, { useState } from 'react';
import { SubjectMeta, VideoResource } from '../types';
import { extractYoutubeId } from '../utils/storageService';
import { 
  Play, Plus, Video, Trash2, CheckCircle2, Circle, ExternalLink, 
  FileEdit, AlertCircle 
} from 'lucide-react';

interface VideoLearningTabProps {
  subject: SubjectMeta;
  videos: VideoResource[];
  onAddVideo: (video: VideoResource) => void;
  onUpdateNotes: (videoId: string, notes: string) => void;
  onToggleWatched: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
}

export const VideoLearningTab: React.FC<VideoLearningTabProps> = ({
  subject,
  videos,
  onAddVideo,
  onUpdateNotes,
  onToggleWatched,
  onDeleteVideo
}) => {
  const subjectVideos = videos.filter(v => v.subjectId === subject.id);
  
  // Active playing video (default to first video)
  const [activeVideoId, setActiveVideoId] = useState<string>(() => {
    return subjectVideos[0]?.id || '';
  });

  // New video input modal / form state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeVideo = subjectVideos.find(v => v.id === activeVideoId) || subjectVideos[0];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newTitle.trim() || !newUrl.trim()) {
      setErrorMsg('Please enter both video title and YouTube link.');
      return;
    }

    const ytid = extractYoutubeId(newUrl.trim());
    if (!ytid) {
      setErrorMsg('Invalid YouTube URL! Please provide a valid youtube.com or youtu.be link.');
      return;
    }

    const newVideo: VideoResource = {
      id: `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      subjectId: subject.id,
      title: newTitle.trim(),
      youtubeUrl: newUrl.trim(),
      videoId: ytid,
      notes: '',
      isWatched: false,
      addedAt: Date.now()
    };

    onAddVideo(newVideo);
    setActiveVideoId(newVideo.id);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-fade-slide-up">
      
      {/* Header with Title & Add Video Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-paper-ink dark:text-night-text">
              {subject.name} • Video Learning Hub
            </h3>
          </div>
          <p className="text-xs text-paper-body dark:text-night-muted mt-0.5">
            Embed YouTube crash courses and take side-by-side timestamps & exam notes.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg flex items-center gap-1.5 btn-tactile shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Form' : '+ Add Video'}</span>
        </button>
      </div>

      {/* Add New Video Form Panel */}
      {isAdding && (
        <form 
          onSubmit={handleAddSubmit} 
          className="p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-emerald-500/40 space-y-3.5 shadow-md"
        >
          <h4 className="text-sm font-bold text-paper-ink dark:text-night-text flex items-center gap-1.5">
            <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Add YouTube Lecture for {subject.name}</span>
          </h4>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-paper-ink dark:text-night-text mb-1">
                Lecture Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CPU Scheduling Gantt Chart Tutorial"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text placeholder-paper-muted dark:placeholder-night-muted text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-paper-ink dark:text-night-text mb-1">
                YouTube Link (Full URL or youtu.be)
              </label>
              <input
                type="text"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text placeholder-paper-muted dark:placeholder-night-muted text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-paper-border dark:border-night-border text-paper-body dark:text-night-text text-xs font-semibold hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg text-xs font-bold btn-tactile shadow-sm"
            >
              Embed & Save Video
            </button>
          </div>
        </form>
      )}

      {/* Main Video Theatre: Side-by-Side In-App Player & Notes */}
      {activeVideo ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Embedded YouTube iFrame Player */}
          <div className="lg:col-span-7 space-y-3">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-paper-border dark:border-night-border shadow-lg relative">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Controls & Title */}
            <div className="p-4 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-paper-card dark:shadow-night-card">
              <div>
                <h4 className="text-sm font-bold text-paper-ink dark:text-night-text">
                  {activeVideo.title}
                </h4>
                <a 
                  href={activeVideo.youtubeUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleWatched(activeVideo.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile transition-colors ${
                    activeVideo.isWatched 
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                      : 'bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-body dark:text-night-text hover:bg-paper-card dark:hover:bg-night-card'
                  }`}
                >
                  {activeVideo.isWatched ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Watched ✅</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-paper-muted dark:text-night-muted" />
                      <span>Mark Watched</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onDeleteVideo(activeVideo.id)}
                  className="p-2 rounded-xl text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 hover:bg-paper-cardElevated dark:hover:bg-night-cardElevated btn-tactile transition-colors"
                  title="Remove video from subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Side-by-Side Video Notes & Timestamps Notepad */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-paper-border dark:border-night-border">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-bold text-paper-ink dark:text-night-text">
                    Lecture Notes & Timestamps
                  </h4>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10">
                  Auto-Saved
                </span>
              </div>

              <p className="text-xs text-paper-muted dark:text-night-muted mb-3">
                Type key formulas, derivation steps, or timestamps (e.g. "04:15 - Gantt chart derivation").
              </p>

              <textarea
                rows={11}
                placeholder="Type your persistent revision notes for this lecture here..."
                value={activeVideo.notes || ''}
                onChange={e => onUpdateNotes(activeVideo.id, e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-paper-cardElevated dark:bg-night-cardElevated border border-paper-border dark:border-night-border text-paper-ink dark:text-night-text placeholder-paper-muted dark:placeholder-night-muted text-xs font-mono focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
              />
            </div>

            <div className="mt-3 pt-2 border-t border-paper-border dark:border-night-border text-xs text-paper-muted dark:text-night-muted flex items-center justify-between">
              <span>Saved locally in browser</span>
              <span className="font-mono text-paper-ink dark:text-night-text font-bold">
                {(activeVideo.notes || '').length} chars
              </span>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-paper-card dark:bg-night-card border-2 border-dashed border-paper-border dark:border-night-border shadow-paper-card dark:shadow-night-card">
          <Video className="w-10 h-10 text-paper-muted dark:text-night-muted mx-auto mb-3" />
          <h4 className="text-base font-bold text-paper-ink dark:text-night-text mb-1">
            No Videos Added Yet
          </h4>
          <p className="text-xs text-paper-body dark:text-night-muted max-w-sm mx-auto mb-4">
            Embed your first YouTube crash course or revision lecture for {subject.name} to start learning with side-by-side notes.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-night-bg text-xs font-bold btn-tactile shadow-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Video</span>
          </button>
        </div>
      )}

      {/* Video Playlist Grid (Switch between saved lectures) */}
      {subjectVideos.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted mb-3">
            {subject.name} Video Links ({subjectVideos.length} Saved)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {subjectVideos.map(vid => {
              const isActive = vid.id === (activeVideo?.id || '');
              return (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideoId(vid.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border btn-tactile ${
                    isActive 
                      ? 'bg-paper-cardElevated dark:bg-night-cardElevated border-emerald-500 shadow-sm' 
                      : 'bg-paper-card dark:bg-night-card border-paper-border dark:border-night-border hover:border-paper-borderHover dark:hover:border-night-borderHover'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-paper-ink dark:text-night-text line-clamp-2">
                      {vid.title}
                    </span>
                    {vid.isWatched ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">✅</span>
                    ) : (
                      <span className="text-xs text-paper-muted dark:text-night-muted shrink-0">⏳</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-paper-muted dark:text-night-muted mt-2 pt-2 border-t border-paper-border dark:border-night-border">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isActive ? 'Now Playing' : 'Play Video'}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteVideo(vid.id);
                      }}
                      className="text-paper-muted hover:text-rose-600 dark:text-night-muted dark:hover:text-rose-400 p-1"
                      title="Delete video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
