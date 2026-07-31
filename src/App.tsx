import React, { useState, useEffect, useMemo } from 'react';
import { VideoItem, SubtitleStyle, SubtitleTrack } from './types';
import { SAMPLE_VIDEOS, INITIAL_FOLDERS } from './data/sampleVideos';
import { EqualizerBands, EQUALIZER_PRESETS } from './utils/audioEngine';
import { Header } from './components/Header';
import { VideoGrid } from './components/VideoGrid';
import { VideoPlayer } from './components/VideoPlayer';
import { EqualizerModal } from './components/EqualizerModal';
import { SubtitleSettingsModal } from './components/SubtitleSettingsModal';
import { PrivateVaultModal } from './components/PrivateVaultModal';
import { AddVideoModal } from './components/AddVideoModal';
import { VideoPropertiesModal } from './components/VideoPropertiesModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { Folder, Film, Lock, Plus, Sparkles, HardDrive, ShieldCheck } from 'lucide-react';

export default function App() {
  // Master Video List State
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('mx_app_videos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved videos:', e);
      }
    }
    return SAMPLE_VIDEOS;
  });

  // Save videos to localStorage
  useEffect(() => {
    localStorage.setItem('mx_app_videos', JSON.stringify(videos));
  }, [videos]);

  // UI State: Navigation & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'folders' | 'private'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('All Videos');
  const [sortBy, setSortBy] = useState<string>('date');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  // Active Playing Video State
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  // Audio Equalizer & 200% Boost State
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [volumeBoost, setVolumeBoost] = useState<number>(100);
  const [selectedEqPreset, setSelectedEqPreset] = useState<string>('Normal');
  const [eqBands, setEqBands] = useState<EqualizerBands>(EQUALIZER_PRESETS['Normal']);

  // Subtitle Settings State
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>('sub-en');
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontSize: 22,
    color: '#FFFFFF',
    backgroundColor: '#000000',
    bgOpacity: 0.7,
    posY: 12,
    fontFamily: 'sans-serif',
    outline: true,
    shadow: true,
    syncDelay: 0
  });

  // Modals
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSleepOpen, setIsSleepOpen] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [propertiesVideo, setPropertiesVideo] = useState<VideoItem | null>(null);

  // Folders computation
  const availableFolders = useMemo(() => {
    const set = new Set(INITIAL_FOLDERS);
    videos.forEach((v) => {
      if (v.folderName) set.add(v.folderName);
    });
    return Array.from(set);
  }, [videos]);

  // Filtered & Sorted Videos List
  const filteredVideos = useMemo(() => {
    return videos
      .filter((v) => {
        // Vault check
        if (activeTab === 'private') {
          if (!v.isPrivate) return false;
        } else {
          if (v.isPrivate) return false;
        }

        // Folder check
        if (activeTab === 'folders' && selectedFolder !== 'All Videos') {
          if (v.folderName !== selectedFolder) return false;
        }

        // Search check
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = v.title.toLowerCase().includes(q);
          const matchFolder = v.folderName.toLowerCase().includes(q);
          const matchDecoder = v.decoder.toLowerCase().includes(q);
          const matchRes = v.resolution.toLowerCase().includes(q);
          return matchTitle || matchFolder || matchDecoder || matchRes;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.title.localeCompare(b.title);
        } else if (sortBy === 'date') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === 'size') {
          return parseFloat(b.size) - parseFloat(a.size);
        } else if (sortBy === 'duration') {
          return b.duration - a.duration;
        }
        return 0;
      });
  }, [videos, activeTab, selectedFolder, searchQuery, sortBy]);

  // Multi-Selection Handlers
  const toggleSelectVideo = (id: string) => {
    setSelectedVideoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedVideoIds(filteredVideos.map((v) => v.id));
  };

  const clearSelection = () => {
    setSelectedVideoIds([]);
  };

  const handleDeleteSelected = () => {
    setVideos((prev) => prev.filter((v) => !selectedVideoIds.includes(v.id)));
    clearSelection();
  };

  const handleMoveToVaultSelected = () => {
    setVideos((prev) =>
      prev.map((v) => (selectedVideoIds.includes(v.id) ? { ...v, isPrivate: true } : v))
    );
    clearSelection();
  };

  // Video Progress Update
  const handleUpdateProgress = (videoId: string, time: number, duration: number) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const isCompleted = duration > 0 && time >= duration - 5;
          return {
            ...v,
            progress: Math.floor(time),
            completed: isCompleted,
            isNew: false
          };
        }
        return v;
      })
    );
  };

  // Next / Prev Video Navigation in Player
  const handleNextVideo = () => {
    if (!playingVideo) return;
    const currentIndex = filteredVideos.findIndex((v) => v.id === playingVideo.id);
    if (currentIndex >= 0 && currentIndex < filteredVideos.length - 1) {
      setPlayingVideo(filteredVideos[currentIndex + 1]);
    }
  };

  const handlePrevVideo = () => {
    if (!playingVideo) return;
    const currentIndex = filteredVideos.findIndex((v) => v.id === playingVideo.id);
    if (currentIndex > 0) {
      setPlayingVideo(filteredVideos[currentIndex - 1]);
    }
  };

  // Add new video
  const handleAddVideo = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev]);
  };

  // Add custom subtitle track to video
  const handleAddSubtitleTrack = (track: SubtitleTrack) => {
    if (playingVideo) {
      const updatedSubtitles = [...playingVideo.subtitles, track];
      const updatedVideo = { ...playingVideo, subtitles: updatedSubtitles };
      setPlayingVideo(updatedVideo);
      setVideos((prev) => prev.map((v) => (v.id === playingVideo.id ? updatedVideo : v)));
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#fafafa] font-sans antialiased selection:bg-neutral-700 selection:text-white">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        folders={availableFolders}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenAddModal={() => setIsAddOpen(true)}
        onRefresh={() => {
          // Trigger simulated media rescan
          const refreshed = videos.map((v) => ({ ...v, isNew: false }));
          setVideos(refreshed);
        }}
        videoCount={filteredVideos.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a] p-6 shadow-sm">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono font-medium tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
                <span>MX PLAYER PRO ULTRA ENGINE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                High Performance Hardware Playback & Audio Boost
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Experience HW / HW+ Multi-Core decoding, 200% Web Audio gain boost, gesture volume/brightness controls, and synced multi-language subtitles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Import Video</span>
              </button>

              <button
                onClick={() => setIsVaultOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626] text-white hover:bg-[#262626] text-xs font-semibold transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Private Vault</span>
              </button>
            </div>
          </div>
        </div>

        {/* Video Explorer Grid/List */}
        <VideoGrid
          videos={filteredVideos}
          viewMode={viewMode}
          selectedVideoIds={selectedVideoIds}
          toggleSelectVideo={toggleSelectVideo}
          selectAll={selectAll}
          clearSelection={clearSelection}
          onPlayVideo={(v) => {
            setPlayingVideo(v);
            if (v.subtitles && v.subtitles.length > 0) {
              setSelectedSubtitleId(v.subtitles[0].id);
            } else {
              setSelectedSubtitleId(null);
            }
          }}
          onShowProperties={(v) => setPropertiesVideo(v)}
          onDeleteSelected={handleDeleteSelected}
          onMoveToVaultSelected={handleMoveToVaultSelected}
        />
      </main>

      {/* Fullscreen Video Player View */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          playlist={filteredVideos}
          onClose={() => setPlayingVideo(null)}
          onNextVideo={handleNextVideo}
          onPrevVideo={handlePrevVideo}
          onOpenEqualizer={() => setIsEqOpen(true)}
          onOpenSubtitles={() => setIsSubOpen(true)}
          onOpenSleepTimer={() => setIsSleepOpen(true)}
          volumeBoost={volumeBoost}
          setVolumeBoost={setVolumeBoost}
          eqBands={eqBands}
          subtitleStyle={subtitleStyle}
          selectedSubtitleId={selectedSubtitleId}
          sleepMinutes={sleepMinutes}
          onUpdateProgress={handleUpdateProgress}
        />
      )}

      {/* Audio Equalizer & 200% Boost Modal */}
      <EqualizerModal
        isOpen={isEqOpen}
        onClose={() => setIsEqOpen(false)}
        volumeBoost={volumeBoost}
        setVolumeBoost={setVolumeBoost}
        selectedPreset={selectedEqPreset}
        setSelectedPreset={setSelectedEqPreset}
        bands={eqBands}
        setBands={setEqBands}
      />

      {/* Subtitle Manager Modal */}
      <SubtitleSettingsModal
        isOpen={isSubOpen}
        onClose={() => setIsSubOpen(false)}
        subtitles={playingVideo ? playingVideo.subtitles : []}
        selectedSubtitleId={selectedSubtitleId}
        onSelectSubtitle={setSelectedSubtitleId}
        onAddSubtitleTrack={handleAddSubtitleTrack}
        style={subtitleStyle}
        setStyle={setSubtitleStyle}
      />

      {/* Private Vault Security Modal */}
      <PrivateVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        vaultVideos={videos.filter((v) => v.isPrivate)}
        onPlayVideo={(v) => {
          setPlayingVideo(v);
          if (v.subtitles && v.subtitles.length > 0) {
            setSelectedSubtitleId(v.subtitles[0].id);
          } else {
            setSelectedSubtitleId(null);
          }
        }}
        onRemoveFromVault={(id) => {
          setVideos((prev) =>
            prev.map((v) => (v.id === id ? { ...v, isPrivate: false } : v))
          );
        }}
        onDeleteVideo={(id) => {
          setVideos((prev) => prev.filter((v) => v.id !== id));
        }}
      />

      {/* Add / Upload Video Modal */}
      <AddVideoModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddVideo={handleAddVideo}
        folders={availableFolders}
      />

      {/* Video Properties Details Modal */}
      <VideoPropertiesModal
        video={propertiesVideo}
        onClose={() => setPropertiesVideo(null)}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepOpen}
        onClose={() => setIsSleepOpen(false)}
        sleepMinutes={sleepMinutes}
        setSleepMinutes={setSleepMinutes}
      />
    </div>
  );
}
