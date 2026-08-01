import React, { useState } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Play,
  Trash2,
  Edit3,
  FolderInput,
  Copy,
  Info
} from 'lucide-react';
import { VideoItem } from '../types';
import { VideoPropertiesModal } from './VideoPropertiesModal';

interface FileListViewProps {
  folderName: string;
  videos: VideoItem[];
  currentlyPlayingId?: string;
  onBack: () => void;
  onPlayVideo: (video: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
  onRenameVideo?: (videoId: string, newTitle: string) => void;
  onMoveVideo?: (videoId: string, targetFolderName: string) => void;
  onCopyVideo?: (videoId: string, targetFolderName: string) => void;
}

export const FileListView: React.FC<FileListViewProps> = ({
  folderName,
  videos,
  currentlyPlayingId,
  onBack,
  onPlayVideo,
  onDeleteVideo,
  onRenameVideo,
  onMoveVideo,
  onCopyVideo,
}) => {
  const [selectedMenuVideo, setSelectedMenuVideo] = useState<VideoItem | null>(null);

  // Modals
  const [renamingVideo, setRenamingVideo] = useState<VideoItem | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');

  const [movingVideo, setMovingVideo] = useState<VideoItem | null>(null);
  const [targetFolderInput, setTargetFolderInput] = useState('');

  const [copyingVideo, setCopyingVideo] = useState<VideoItem | null>(null);
  const [copyTargetFolderInput, setCopyTargetFolderInput] = useState('');

  const [viewingPropertiesVideo, setViewingPropertiesVideo] = useState<VideoItem | null>(null);

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

  // Get list of existing unique folders for moving/copying target
  const availableFolders = Array.from(new Set(videos.map((v) => v.folderName)));

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

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate">
            {folderName}
          </h1>
          <p className="text-xs text-slate-500 font-medium">{folderVideos.length} videos</p>
        </div>
      </header>

      {/* Video Files List */}
      <div className="px-3 py-2 divide-y divide-slate-100">
        {folderVideos.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">No videos remaining in this folder.</p>
            <button
              onClick={onBack}
              className="mt-3 text-xs font-bold text-blue-600 hover:underline"
            >
              Return to Folders
            </button>
          </div>
        ) : (
          folderVideos.map((video) => {
            const isPlaying = video.id === currentlyPlayingId;

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

                  {video.isNew && (
                    <div className="absolute top-1 left-1 bg-[#ef4444] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm tracking-wider uppercase">
                      NEW
                    </div>
                  )}

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
                    {video.subtitles && video.subtitles.length > 0 && (
                      <span className="bg-[#22c55e] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs tracking-wider">
                        SRT
                      </span>
                    )}
                    <span className="text-[12px] text-slate-400 font-medium">{video.size}</span>
                    <span className="text-slate-300">•</span>
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
                  title="File Options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {folderVideos.length > 0 && (
        <button
          onClick={() => onPlayVideo(folderVideos[0])}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#3b82f6] hover:bg-blue-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg transition-transform z-20"
          title="Play All"
        >
          <Play className="w-7 h-7 fill-white ml-0.5" />
        </button>
      )}

      {/* Video Action Context Menu */}
      {selectedMenuVideo && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedMenuVideo(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-2 text-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-sm line-clamp-1 px-2 pb-2 border-b border-slate-100 text-slate-900">
              {selectedMenuVideo.title}
            </h3>

            {/* Play */}
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

            {/* Rename Video */}
            {onRenameVideo && (
              <button
                onClick={() => {
                  setRenamingVideo(selectedMenuVideo);
                  setNewTitleInput(selectedMenuVideo.title);
                  setSelectedMenuVideo(null);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-left font-medium text-sm text-slate-700"
              >
                <Edit3 className="w-4 h-4 text-slate-600" />
                <span>Rename Video</span>
              </button>
            )}

            {/* Move Video */}
            {onMoveVideo && (
              <button
                onClick={() => {
                  setMovingVideo(selectedMenuVideo);
                  setTargetFolderInput(selectedMenuVideo.folderName);
                  setSelectedMenuVideo(null);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-left font-medium text-sm text-slate-700"
              >
                <FolderInput className="w-4 h-4 text-slate-600" />
                <span>Move to Folder</span>
              </button>
            )}

            {/* Copy Video */}
            {onCopyVideo && (
              <button
                onClick={() => {
                  setCopyingVideo(selectedMenuVideo);
                  setCopyTargetFolderInput(selectedMenuVideo.folderName);
                  setSelectedMenuVideo(null);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-left font-medium text-sm text-slate-700"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copy to Folder</span>
              </button>
            )}

            {/* Properties & Details */}
            <button
              onClick={() => {
                setViewingPropertiesVideo(selectedMenuVideo);
                setSelectedMenuVideo(null);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-left font-medium text-sm text-slate-700"
            >
              <Info className="w-4 h-4 text-slate-600" />
              <span>Video Properties</span>
            </button>

            {/* Delete Video */}
            {onDeleteVideo && (
              <button
                onClick={() => {
                  if (confirm(`Delete video "${selectedMenuVideo.title}"?`)) {
                    onDeleteVideo(selectedMenuVideo.id);
                  }
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

      {/* Rename Video Modal */}
      {renamingVideo && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setRenamingVideo(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 text-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900">Rename Video File</h3>
            <input
              type="text"
              value={newTitleInput}
              onChange={(e) => setNewTitleInput(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setRenamingVideo(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onRenameVideo && renamingVideo) {
                    onRenameVideo(renamingVideo.id, newTitleInput);
                  }
                  setRenamingVideo(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Video Modal */}
      {movingVideo && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setMovingVideo(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 text-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900">Move Video to Folder</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Select or type target folder:</label>
              <input
                type="text"
                value={targetFolderInput}
                onChange={(e) => setTargetFolderInput(e.target.value)}
                placeholder="Folder Name (e.g., Camera (DCIM))"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableFolders.map((f) => (
                <button
                  key={f}
                  onClick={() => setTargetFolderInput(f)}
                  className={`px-2.5 py-1 text-xs rounded-lg border ${
                    targetFolderInput === f
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setMovingVideo(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onMoveVideo && movingVideo && targetFolderInput.trim()) {
                    onMoveVideo(movingVideo.id, targetFolderInput.trim());
                  }
                  setMovingVideo(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Video Modal */}
      {copyingVideo && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setCopyingVideo(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 text-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900">Copy Video to Folder</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Target folder name:</label>
              <input
                type="text"
                value={copyTargetFolderInput}
                onChange={(e) => setCopyTargetFolderInput(e.target.value)}
                placeholder="Folder Name"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableFolders.map((f) => (
                <button
                  key={f}
                  onClick={() => setCopyTargetFolderInput(f)}
                  className={`px-2.5 py-1 text-xs rounded-lg border ${
                    copyTargetFolderInput === f
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCopyingVideo(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onCopyVideo && copyingVideo && copyTargetFolderInput.trim()) {
                    onCopyVideo(copyingVideo.id, copyTargetFolderInput.trim());
                  }
                  setCopyingVideo(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Copy File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Properties Modal */}
      {viewingPropertiesVideo && (
        <VideoPropertiesModal
          video={viewingPropertiesVideo}
          onClose={() => setViewingPropertiesVideo(null)}
        />
      )}
    </div>
  );
};
