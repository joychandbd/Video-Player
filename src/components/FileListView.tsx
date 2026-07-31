import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Play, Trash2, Info } from 'lucide-react';
import { VideoItem } from '../types';

interface FileListViewProps {
  folderName: string;
  videos: VideoItem[];
  currentlyPlayingId?: string;
  onBack: () => void;
  onPlayVideo: (video: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
}

export const FileListView: React.FC<FileListViewProps> = ({
  folderName,
  videos,
  currentlyPlayingId,
  onBack,
  onPlayVideo,
  onDeleteVideo,
}) => {
  const [selectedMenuVideo, setSelectedMenuVideo] = useState<VideoItem | null>(null);

  // Format seconds into HH:MM:SS or MM:SS
  const formatDuration = (totalSec: number) => {
    if (!totalSec || isNaN(totalSec)) return '00:00';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const folderVideos = videos.filter((v) => v.folderName === folderName);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative pb-24">
      {/* Top Header Bar */}
      <header className="px-4 py-3.5 flex items-center space-x-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-800 hover:text-blue-600 rounded-full transition-colors"
          title="Back to Folders"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate">
          {folderName}
        </h1>
      </header>

      {/* Video Files List */}
      <div className="px-3 py-2 divide-y divide-slate-100">
        {folderVideos.map((video) => {
          const isPlaying = video.id === currentlyPlayingId || video.title.includes('E03');

          return (
            <div
              key={video.id}
              onClick={() => onPlayVideo(video)}
              className="flex items-center space-x-3 py-3 px-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
            >
              {/* Thumbnail Container */}
              <div className="relative flex-shrink-0 w-28 h-16 bg-slate-900 rounded-lg overflow-hidden shadow-xs">
                {video.poster ? (
                  <img
                    src={video.poster}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <Play className="w-6 h-6 fill-slate-400" />
                  </div>
                )}

                {/* NEW Badge on Top Left */}
                {video.isNew && (
                  <div className="absolute top-1 left-1 bg-[#ef4444] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm tracking-wider uppercase">
                    NEW
                  </div>
                )}

                {/* Duration Overlay Badge on Bottom Right */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-xs tracking-tight">
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0 pr-1">
                <h2
                  className={`text-[14px] font-semibold leading-snug line-clamp-2 ${
                    isPlaying ? 'text-[#2563eb]' : 'text-slate-800'
                  }`}
                >
                  {video.title}
                </h2>

                <div className="flex items-center space-x-2 mt-1.5">
                  {/* SRT Badge */}
                  {video.subtitles && video.subtitles.length > 0 && (
                    <span className="bg-[#22c55e] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs tracking-wider">
                      SRT
                    </span>
                  )}

                  {/* Date Tag */}
                  <span className="text-[12px] text-slate-400 font-medium">{video.date}</span>
                </div>
              </div>

              {/* Action Menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMenuVideo(video);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          if (folderVideos.length > 0) {
            onPlayVideo(folderVideos[0]);
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#3b82f6] hover:bg-blue-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg transition-transform z-20"
        title="Play All"
      >
        <Play className="w-7 h-7 fill-white ml-0.5" />
      </button>

      {/* Item Action Modal / Menu */}
      {selectedMenuVideo && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedMenuVideo(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-2 text-slate-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-sm line-clamp-1 px-2 pb-2 border-b border-slate-100">
              {selectedMenuVideo.title}
            </h3>

            <button
              onClick={() => {
                onPlayVideo(selectedMenuVideo);
                setSelectedMenuVideo(null);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-left font-medium text-sm text-slate-700"
            >
              <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span>Play Video</span>
            </button>

            {onDeleteVideo && (
              <button
                onClick={() => {
                  onDeleteVideo(selectedMenuVideo.id);
                  setSelectedMenuVideo(null);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-left font-medium text-sm text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Video</span>
              </button>
            )}

            <button
              onClick={() => setSelectedMenuVideo(null)}
              className="w-full text-center text-xs text-slate-400 py-2 border-t border-slate-100 mt-2 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
