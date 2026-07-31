import React, { useState, useEffect } from 'react';
import { VideoItem } from './types';
import { SAMPLE_VIDEOS } from './data/sampleVideos';
import { FoldersView } from './components/FoldersView';
import { FileListView } from './components/FileListView';
import { PlayerView } from './components/PlayerView';

export default function App() {
  // Saved or initial video state
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('mx_app_videos_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved videos:', e);
      }
    }
    return SAMPLE_VIDEOS;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('mx_app_videos_v2', JSON.stringify(videos));
  }, [videos]);

  // Screen Navigation State: 'folders' | 'files' | 'player'
  const [activeScreen, setActiveScreen] = useState<'folders' | 'files' | 'player'>('folders');
  
  // Selected Active Folder
  const [selectedFolderName, setSelectedFolderName] = useState<string>('Legends.S01');

  // Currently Selected / Playing Video
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  // Navigate to folder
  const handleSelectFolder = (folderName: string) => {
    setSelectedFolderName(folderName);
    setActiveScreen('files');
  };

  // Play video handler
  const handlePlayVideo = (video: VideoItem) => {
    setPlayingVideo(video);
    setActiveScreen('player');
  };

  // Next video in playlist
  const handleNextVideo = () => {
    if (!playingVideo) return;
    const currentFolderVideos = videos.filter((v) => v.folderName === playingVideo.folderName);
    const idx = currentFolderVideos.findIndex((v) => v.id === playingVideo.id);
    if (idx >= 0 && idx < currentFolderVideos.length - 1) {
      setPlayingVideo(currentFolderVideos[idx + 1]);
    }
  };

  // Prev video in playlist
  const handlePrevVideo = () => {
    if (!playingVideo) return;
    const currentFolderVideos = videos.filter((v) => v.folderName === playingVideo.folderName);
    const idx = currentFolderVideos.findIndex((v) => v.id === playingVideo.id);
    if (idx > 0) {
      setPlayingVideo(currentFolderVideos[idx - 1]);
    }
  };

  // Delete video handler
  const handleDeleteVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  // Handle local videos auto sync import
  const handleImportLocalVideos = (importedVideos: VideoItem[]) => {
    setVideos((prev) => {
      // Filter out duplicates by title
      const existingTitles = new Set(prev.map((v) => v.title));
      const filteredNew = importedVideos.filter((v) => !existingTitles.has(v.title));
      return [...filteredNew, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Screen 1: Folders UI */}
      {activeScreen === 'folders' && (
        <FoldersView
          videos={videos}
          onSelectFolder={handleSelectFolder}
          onPlayDefaultVideo={() => {
            // Play first video in Legends.S01
            const defaultVideo = videos.find((v) => v.folderName === 'Legends.S01') || videos[0];
            if (defaultVideo) {
              handlePlayVideo(defaultVideo);
            }
          }}
          onImportLocalVideos={handleImportLocalVideos}
        />
      )}

      {/* Screen 2: File UI */}
      {activeScreen === 'files' && (
        <FileListView
          folderName={selectedFolderName}
          videos={videos}
          currentlyPlayingId={playingVideo?.id}
          onBack={() => setActiveScreen('folders')}
          onPlayVideo={handlePlayVideo}
          onDeleteVideo={handleDeleteVideo}
        />
      )}

      {/* Screen 3: Player UI */}
      {activeScreen === 'player' && playingVideo && (
        <PlayerView
          video={playingVideo}
          playlist={videos.filter((v) => v.folderName === playingVideo.folderName)}
          onBack={() => setActiveScreen('files')}
          onNextVideo={handleNextVideo}
          onPrevVideo={handlePrevVideo}
        />
      )}
    </div>
  );
}
