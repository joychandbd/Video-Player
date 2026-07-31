import React from 'react';
import {
  Play,
  Clock,
  HardDrive,
  Info,
  CheckCircle2,
  Trash2,
  Lock,
  Sparkles,
  Zap
} from 'lucide-react';
import { VideoItem } from '../types';
import { formatTime } from '../utils/subtitleParser';

interface VideoGridProps {
  videos: VideoItem[];
  viewMode: 'grid' | 'list';
  selectedVideoIds: string[];
  toggleSelectVideo: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  onPlayVideo: (video: VideoItem) => void;
  onShowProperties: (video: VideoItem) => void;
  onDeleteSelected: () => void;
  onMoveToVaultSelected: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  viewMode,
  selectedVideoIds,
  toggleSelectVideo,
  selectAll,
  clearSelection,
  onPlayVideo,
  onShowProperties,
  onDeleteSelected,
  onMoveToVaultSelected
}) => {
  const isAllSelected = videos.length > 0 && selectedVideoIds.length === videos.length;
  const isAnySelected = selectedVideoIds.length > 0;

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center text-neutral-500 mb-4">
          <Play className="w-8 h-8 opacity-40 ml-1" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">No Videos Found</h3>
        <p className="text-sm text-neutral-400 max-w-sm">
          Try searching for another keyword, changing folder filter, or adding new videos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Multi-Selection Sticky Action Bar */}
      {isAnySelected && (
        <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-center space-x-3 text-xs sm:text-sm text-neutral-200 font-medium">
            <span className="bg-white px-2.5 py-0.5 rounded-full font-bold text-black text-xs">
              {selectedVideoIds.length} Selected
            </span>
            <button
              onClick={isAllSelected ? clearSelection : selectAll}
              className="text-neutral-400 hover:text-white underline text-xs"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onMoveToVaultSelected}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1a] text-neutral-200 hover:bg-[#262626] border border-[#262626] text-xs font-medium transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Move to Vault</span>
            </button>

            <button
              onClick={onDeleteSelected}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-[#262626] text-xs font-medium transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>Delete</span>
            </button>

            <button
              onClick={clearSelection}
              className="px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#222222] text-neutral-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((video) => {
            const isSelected = selectedVideoIds.includes(video.id);
            const progressPercent = video.duration > 0 ? (video.progress / video.duration) * 100 : 0;

            return (
              <div
                key={video.id}
                className={`group relative bg-[#0f0f0f] border rounded-2xl overflow-hidden transition-all hover:border-[#333333] ${
                  isSelected ? 'border-white ring-1 ring-white/40 bg-[#141414]' : 'border-[#1a1a1a]'
                }`}
              >
                {/* Thumbnail Poster Box */}
                <div className="relative aspect-video bg-[#050505] overflow-hidden cursor-pointer" onClick={() => onPlayVideo(video)}>
                  {video.poster ? (
                    <img
                      src={video.poster}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#050505] text-neutral-700">
                      <Play className="w-12 h-12" />
                    </div>
                  )}

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-opacity" />

                  {/* Play Center Hover Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Top Left Badges: NEW / Decoder */}
                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 z-10">
                    {video.isNew && (
                      <span className="flex items-center space-x-1 bg-white text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>NEW</span>
                      </span>
                    )}
                    <span className="bg-[#0a0a0a]/80 text-neutral-300 border border-[#262626] text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {video.decoder}
                    </span>
                  </div>

                  {/* Top Right Checkbox for Multi-Select */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectVideo(video.id);
                    }}
                    className={`absolute top-2.5 right-2.5 z-10 p-1 rounded-full transition-transform ${
                      isSelected ? 'text-white bg-black' : 'text-neutral-500 hover:text-white bg-black/60'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${isSelected ? 'fill-white text-black' : ''}`} />
                  </button>

                  {/* Bottom Right Duration */}
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-neutral-200 text-xs font-mono px-2 py-0.5 rounded-md border border-[#262626]">
                    {formatTime(video.duration)}
                  </div>

                  {/* Bottom Left Resolution */}
                  <div className="absolute bottom-2.5 left-2.5 bg-[#0a0a0a]/90 border border-[#262626] text-neutral-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    {video.resolution}
                  </div>

                  {/* Watched Progress Bar */}
                  {progressPercent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#222222]">
                      <div
                        className="h-full bg-white"
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Card Info Content */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      onClick={() => onPlayVideo(video)}
                      className={`text-sm font-semibold cursor-pointer line-clamp-1 hover:text-neutral-300 transition-colors ${
                        video.completed ? 'text-neutral-500 line-through decoration-neutral-700' : 'text-white'
                      }`}
                      title={video.title}
                    >
                      {video.title}
                    </h4>

                    <button
                      onClick={() => onShowProperties(video)}
                      title="Video Details & Properties"
                      className="text-neutral-500 hover:text-white p-1 hover:bg-[#1f1f1f] rounded transition-colors flex-shrink-0"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pt-1 border-t border-[#1a1a1a]">
                    <span className="flex items-center space-x-1">
                      <HardDrive className="w-3 h-3 text-neutral-500" />
                      <span>{video.size}</span>
                    </span>

                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>{video.date}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden divide-y divide-[#1a1a1a] shadow-sm">
          {videos.map((video) => {
            const isSelected = selectedVideoIds.includes(video.id);

            return (
              <div
                key={video.id}
                className={`flex items-center justify-between p-3 sm:p-4 hover:bg-[#161616] transition-colors ${
                  isSelected ? 'bg-[#181818]' : ''
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Select Checkbox */}
                  <button
                    onClick={() => toggleSelectVideo(video.id)}
                    className="text-neutral-500 hover:text-white p-1"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${isSelected ? 'fill-white text-black' : 'text-neutral-600'}`}
                    />
                  </button>

                  {/* Thumbnail */}
                  <div
                    onClick={() => onPlayVideo(video)}
                    className="relative w-24 sm:w-32 aspect-video bg-[#050505] rounded-xl overflow-hidden cursor-pointer flex-shrink-0 group"
                  >
                    {video.poster ? (
                      <img src={video.poster} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700">
                        <Play className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Play className="w-6 h-6 text-white opacity-80 group-hover:scale-110 transition-transform fill-current" />
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-neutral-300 font-mono px-1 rounded border border-[#222222]">
                      {formatTime(video.duration)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4
                        onClick={() => onPlayVideo(video)}
                        className={`text-sm font-semibold truncate cursor-pointer hover:text-neutral-300 ${
                          video.completed ? 'text-neutral-500 line-through decoration-neutral-700' : 'text-white'
                        }`}
                      >
                        {video.title}
                      </h4>
                      {video.isNew && (
                        <span className="bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                      <span className="text-white font-mono font-semibold">{video.decoder}</span>
                      <span>•</span>
                      <span>{video.resolution}</span>
                      <span>•</span>
                      <span>{video.size}</span>
                      <span>•</span>
                      <span>{video.folderName}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 ml-3">
                  <button
                    onClick={() => onShowProperties(video)}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-[#222222] rounded-xl transition-colors"
                    title="Properties"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onPlayVideo(video)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Play</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
