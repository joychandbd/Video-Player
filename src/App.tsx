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

  // Rename video handler
  const handleRenameVideo = (videoId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, title: newTitle.trim() } : v))
    );
  };

  // Move video handler
  const handleMoveVideo = (videoId: string, targetFolderName: string) => {
    if (!targetFolderName.trim()) return;
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, folderName: targetFolderName.trim() } : v
      )
    );
  };

  // Copy video handler
  const handleCopyVideo = (videoId: string, targetFolderName: string) => {
    if (!targetFolderName.trim()) return;
    setVideos((prev) => {
      const source = prev.find((v) => v.id === videoId);
      if (!source) return prev;
      const copyItem: VideoItem = {
        ...source,
        id: `copy-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: `Copy of ${source.title}`,
        folderName: targetFolderName.trim(),
        isNew: true,
      };
      return [copyItem, ...prev];
    });
  };

  // Rename folder handler
  const handleRenameFolder = (oldFolderName: string, newFolderName: string) => {
    if (!newFolderName.trim() || oldFolderName === newFolderName) return;
    setVideos((prev) =>
      prev.map((v) =>
        v.folderName === oldFolderName
          ? { ...v, folderName: newFolderName.trim() }
          : v
      )
    );
    if (selectedFolderName === oldFolderName) {
      setSelectedFolderName(newFolderName.trim());
    }
  };

  // Delete folder handler
  const handleDeleteFolder = (folderName: string) => {
    setVideos((prev) => prev.filter((v) => v.folderName !== folderName));
  };

  // Open external file ("Open With" file manager intent handler)
  const handlePlayDirectFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = parseFloat(sizeInMB) > 1024 
      ? `${(parseFloat(sizeInMB) / 1024).toFixed(1)} GB` 
      : `${sizeInMB} MB`;

    const directVideo: VideoItem = {
      id: `ext-${Date.now()}`,
      title: file.name,
      url: fileUrl,
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
      duration: 300,
      size: formattedSize,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      folderName: 'External Videos',
      decoder: 'HW+',
      resolution: '1080p',
      codec: 'H.264 / AAC',
      progress: 0,
      completed: false,
      isNew: true,
      isPrivate: false,
      subtitles: [],
      audioTracks: [{ id: 'a1', label: 'Default Track', language: 'en' }]
    };

    setVideos((prev) => [directVideo, ...prev]);
    setPlayingVideo(directVideo);
    setActiveScreen('player');
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
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onPlayDirectFile={handlePlayDirectFile}
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
          onRenameVideo={handleRenameVideo}
          onMoveVideo={handleMoveVideo}
          onCopyVideo={handleCopyVideo}
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
