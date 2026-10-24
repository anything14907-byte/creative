import React, { useState } from 'react';
import { SubjectMeta, VideoResource } from '../types';
import { extractYoutubeId } from '../utils/storageService';
import { 
  Play, Plus, Video, Trash2, CheckCircle2, Circle, ExternalLink, 
  FileEdit, Sparkles, Clock, AlertCircle 
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
    <div className="space-y-6">
      
      {/* Header with Title & Add Video Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl hud-glass-panel">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              {subject.name} • Video Learning Hub
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Embed YouTube crash courses, revision lectures, and take side-by-side timestamps & exam notes.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 transition-transform hover:scale-105 shrink-0"
          style={{ backgroundColor: subject.accentColor }}
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Close Form' : 'Add YouTube Lecture'}
        </button>
      </div>

      {/* Add New Video Form Panel */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="p-5 rounded-2xl bg-[#0E1530] border border-cyan-500/30 space-y-3">
          <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Add YouTube Lecture to {subject.name}
          </h4>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lecture Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CPU Scheduling Gantt Chart Tutorial"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                YouTube Link (Full or youtu.be)
              </label>
              <input
                type="text"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 rounded-lg bg-white/10 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-lg bg-cyan-400 text-black text-xs font-bold hover:bg-cyan-300"
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
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl relative">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Controls & Title */}
            <div className="p-4 rounded-xl hud-glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">{activeVideo.title}</h4>
                <a 
                  href={activeVideo.youtubeUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  Open in YouTube tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleWatched(activeVideo.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${activeVideo.isWatched ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                >
                  {activeVideo.isWatched ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Watched ✅
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" /> Mark Watched
                    </>
                  )}
                </button>

                <button
                  onClick={() => onDeleteVideo(activeVideo.id)}
                  className="p-2 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 transition-colors"
                  title="Remove video from subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Side-by-Side Video Notes & Timestamps Notepad */}
          <div className="lg:col-span-5 p-5 rounded-2xl hud-glass-panel border border-white/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Lecture Notes & Key Timestamps</h4>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">Auto-Saved</span>
              </div>

              <p className="text-[11px] text-slate-400 mb-2">
                Type important formulas, step-by-step algorithms, or timestamps (e.g. "04:15 - Gantt chart derivation").
              </p>

              <textarea
                rows={11}
                placeholder="Type your persistent revision notes for this lecture here..."
                value={activeVideo.notes || ''}
                onChange={e => onUpdateNotes(activeVideo.id, e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
              />
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Saved locally in browser storage</span>
              <span className="text-cyan-400">{(activeVideo.notes || '').length} characters</span>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl hud-glass-panel border border-dashed border-white/20">
          <Video className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Videos Added Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Embed your first YouTube crash course or revision lecture for {subject.name} to start learning with side-by-side notes.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-cyan-400 text-black text-xs font-bold hover:bg-cyan-300"
          >
            + Add First YouTube Video
          </button>
        </div>
      )}

      {/* Video Playlist Grid (Switch between saved lectures) */}
      {subjectVideos.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            {subject.name} Video Vault ({subjectVideos.length} Saved)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subjectVideos.map(vid => {
              const isActive = vid.id === (activeVideo?.id || '');
              return (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideoId(vid.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${isActive ? 'bg-cyan-500/15 border-cyan-400 shadow-neon-cyan' : 'hud-glass-panel hover:border-white/30'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-white line-clamp-2">
                      {vid.title}
                    </span>
                    {vid.isWatched ? (
                      <span className="text-[10px] font-bold text-emerald-400 shrink-0">✅</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 shrink-0">⏳</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/10">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Play className="w-3 h-3 fill-current" /> {isActive ? 'Now Playing' : 'Play Video'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteVideo(vid.id);
                      }}
                      className="text-slate-500 hover:text-rose-400"
                      title="Delete video"
                    >
                      <Trash2 className="w-3 h-3" />
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
