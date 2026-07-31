import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Music,
  MessageSquareText,
  MoreVertical,
  SlidersHorizontal,
  Camera,
  Headphones,
  RotateCw,
  ChevronRight,
  Lock,
  Unlock,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Maximize,
  Minimize2,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  LandPlot,
  RefreshCw,
} from 'lucide-react';
import { VideoItem, DecoderMode, AspectRatioMode } from '../types';

interface PlayerViewProps {
  video: VideoItem;
  playlist: VideoItem[];
  onBack: () => void;
  onNextVideo: () => void;
  onPrevVideo: () => void;
}

export type RotationMode = 'auto' | '0' | '90' | '270' | '180';

export const PlayerView: React.FC<PlayerViewProps> = ({
  video,
  playlist,
  onBack,
  onNextVideo,
  onPrevVideo,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(video.progress || 2803); // Default 46:43
  const [duration, setDuration] = useState(video.duration || 3429); // Default 57:09
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [decoder, setDecoder] = useState<DecoderMode>(video.decoder || 'SW');
  const [speed, setSpeed] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('fit');
  const [isMuted, setIsMuted] = useState(false);
  const [bgAudioMode, setBgAudioMode] = useState(false);
  const [screenshotFlash, setScreenshotFlash] = useState(false);
  const [showEqPanel, setShowEqPanel] = useState(false);
  const [volumeBoost, setVolumeBoost] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState('Normal');

  // Rotation & Orientation states
  const [rotationMode, setRotationMode] = useState<RotationMode>('auto');
  const [isRotationLocked, setIsRotationLocked] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [showRotationMenu, setShowRotationMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Show Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Decoder toggle
  const toggleDecoder = () => {
    const modes: DecoderMode[] = ['SW', 'HW', 'HW+'];
    const idx = modes.indexOf(decoder);
    setDecoder(modes[(idx + 1) % modes.length]);
  };

  // Speed toggle
  const toggleSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length];
    setSpeed(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
  };

  // Aspect Ratio Toggle
  const toggleAspectRatio = () => {
    const modes: AspectRatioMode[] = ['fit', 'stretch', 'crop', '16:9'];
    const idx = modes.indexOf(aspectRatio);
    setAspectRatio(modes[(idx + 1) % modes.length]);
  };

  // Take Screenshot
  const handleScreenshot = () => {
    setScreenshotFlash(true);
    triggerToast('Screenshot captured!');
    setTimeout(() => setScreenshotFlash(false), 300);
  };

  // Rotation Controller Handler
  const handleSetRotationMode = (mode: RotationMode) => {
    setRotationMode(mode);
    setShowRotationMenu(false);

    if (mode === 'auto') {
      triggerToast('Auto Rotate Activated');
      applyAutoRotation();
      // Try calling native Screen Orientation lock if available
      if (window.screen?.orientation?.unlock) {
        try {
          window.screen.orientation.unlock();
        } catch (e) {
          console.log('Screen orientation unlock not supported');
        }
      }
    } else {
      const deg = parseInt(mode, 10);
      setRotationDegrees(deg);
      triggerToast(`Rotation set to ${deg}°`);

      // Try calling native Screen Orientation API lock if supported
      if (window.screen?.orientation && 'lock' in window.screen.orientation) {
        try {
          const type = deg === 90 || deg === 270 ? 'landscape' : 'portrait';
          (window.screen.orientation as any).lock(type).catch(() => {});
        } catch (e) {
          console.log('Screen orientation lock not permitted');
        }
      }
    }
  };

  // Toggle Rotation Lock
  const toggleRotationLock = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsRotationLocked(!isRotationLocked);
    if (!isRotationLocked) {
      triggerToast('Rotation Locked 🔒');
    } else {
      triggerToast('Rotation Unlocked 🔓 (Auto Rotate Active)');
      if (rotationMode === 'auto') {
        applyAutoRotation();
      }
    }
  };

  // Auto rotation decision based on viewport orientation / window dimensions
  const applyAutoRotation = () => {
    if (isRotationLocked) return;

    const isLandscapeWindow = window.innerWidth > window.innerHeight;
    
    // Auto-detect optimal angle: landscape window -> 0deg or 90deg depending on video natural aspect
    if (videoRef.current && videoRef.current.videoWidth && videoRef.current.videoHeight) {
      const isVideoLandscape = videoRef.current.videoWidth > videoRef.current.videoHeight;
      if (isVideoLandscape && !isLandscapeWindow) {
        // Video is landscape but screen is portrait -> Auto rotate video 90deg to fit screen horizontally
        setRotationDegrees(90);
      } else {
        setRotationDegrees(0);
      }
    } else {
      setRotationDegrees(isLandscapeWindow ? 0 : 0);
    }
  };

  // Auto Rotation Listener
  useEffect(() => {
    const handleResizeOrOrientation = () => {
      if (rotationMode === 'auto' && !isRotationLocked) {
        applyAutoRotation();
      }
    };

    window.addEventListener('resize', handleResizeOrOrientation);
    window.addEventListener('orientationchange', handleResizeOrOrientation);

    // Initial check
    if (rotationMode === 'auto' && !isRotationLocked) {
      applyAutoRotation();
    }

    return () => {
      window.removeEventListener('resize', handleResizeOrOrientation);
      window.removeEventListener('orientationchange', handleResizeOrOrientation);
    };
  }, [rotationMode, isRotationLocked]);

  // Auto hide controls
  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => {
      if (isPlaying && !isLocked) {
        setShowControls(false);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [showControls, isPlaying, isLocked]);

  return (
    <div
      ref={containerRef}
      onClick={() => {
        setShowControls(!showControls);
        setShowRotationMenu(false);
        setShowEqPanel(false);
      }}
      className="fixed inset-0 bg-black text-white z-50 flex items-center justify-center overflow-hidden font-sans select-none"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-semibold z-50 shadow-xl border border-white/20 backdrop-blur-md animate-fade-in flex items-center space-x-2">
          <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Video Container with Applied Dynamic Rotation */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `rotate(${rotationDegrees}deg)`,
          width: rotationDegrees === 90 || rotationDegrees === 270 ? '100vh' : '100vw',
          height: rotationDegrees === 90 || rotationDegrees === 270 ? '100vw' : '100vh',
        }}
      >
        <video
          ref={videoRef}
          src={video.url}
          poster={video.poster}
          autoPlay
          playsInline
          muted={isMuted}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              if (rotationMode === 'auto' && !isRotationLocked) {
                applyAutoRotation();
              }
            }
          }}
          className={`w-full h-full ${
            aspectRatio === 'fit'
              ? 'object-contain'
              : aspectRatio === 'stretch'
              ? 'object-fill'
              : aspectRatio === 'crop'
              ? 'object-cover'
              : 'object-contain'
          }`}
        />
      </div>

      {/* Screenshot Flash Effect */}
      {screenshotFlash && (
        <div className="absolute inset-0 bg-white/80 pointer-events-none z-40 transition-opacity duration-300" />
      )}

      {/* Controls Overlay Container */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 flex items-center justify-between text-white z-20">
          <div className="flex items-center space-x-3 min-w-0 pr-4">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <h2 className="text-sm sm:text-base font-semibold truncate max-w-lg text-white">
              {video.title}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Cast / Sparkles */}
            <button className="p-1.5 hover:bg-white/10 rounded-full text-white">
              <Sparkles className="w-5 h-5" />
            </button>

            {/* Audio Track */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 hover:bg-white/10 rounded-full text-white"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Music className="w-5 h-5" />}
            </button>

            {/* Subtitles */}
            <button className="p-1.5 hover:bg-white/10 rounded-full text-white">
              <MessageSquareText className="w-5 h-5" />
            </button>

            {/* Software/Hardware Decoder Toggle */}
            <button
              onClick={toggleDecoder}
              className="px-2 py-0.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-sm transition-colors border border-white/30"
            >
              {decoder}
            </button>

            {/* Menu */}
            <button className="p-1.5 hover:bg-white/10 rounded-full text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upper Left Floating Control Strip */}
        {!isLocked && (
          <div className="absolute top-16 left-4 flex items-center space-x-2 z-20">
            {/* Equalizer */}
            <button
              onClick={() => {
                setShowEqPanel(!showEqPanel);
                setShowRotationMenu(false);
              }}
              className="w-9 h-9 bg-black/60 hover:bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-white shadow-md"
              title="Equalizer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Speed */}
            <button
              onClick={toggleSpeed}
              className="h-9 px-2.5 bg-black/60 hover:bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
              title="Playback Speed"
            >
              {speed}X
            </button>

            {/* Screenshot */}
            <button
              onClick={handleScreenshot}
              className="w-9 h-9 bg-black/60 hover:bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-white shadow-md"
              title="Screenshot"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Background Audio / Headphones */}
            <button
              onClick={() => setBgAudioMode(!bgAudioMode)}
              className={`w-9 h-9 border rounded-full flex items-center justify-center text-white shadow-md ${
                bgAudioMode
                  ? 'bg-blue-600 border-blue-400'
                  : 'bg-black/60 hover:bg-black/80 border-white/10'
              }`}
              title="Background Audio"
            >
              <Headphones className="w-4 h-4" />
            </button>

            {/* Rotation Controller & Auto-rotate Toggle */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRotationMenu(!showRotationMenu);
                  setShowEqPanel(false);
                }}
                className={`w-9 h-9 border rounded-full flex items-center justify-center text-white shadow-md transition-colors ${
                  isRotationLocked
                    ? 'bg-amber-600/90 border-amber-400'
                    : rotationMode === 'auto'
                    ? 'bg-blue-600/90 border-blue-400'
                    : 'bg-black/60 hover:bg-black/80 border-white/10'
                }`}
                title="Auto Rotate & Screen Controller"
              >
                <RotateCw className={`w-4 h-4 ${rotationMode === 'auto' && !isRotationLocked ? 'animate-spin-slow' : ''}`} />
              </button>

              {/* Rotation Controller Menu Popup */}
              {showRotationMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-11 left-0 bg-slate-900/95 border border-slate-700 text-white p-3 rounded-2xl shadow-2xl z-30 w-56 backdrop-blur-md space-y-2 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs text-slate-300">Screen Rotation</span>
                    <button
                      onClick={toggleRotationLock}
                      className={`p-1 rounded-md text-xs font-bold flex items-center space-x-1 ${
                        isRotationLocked ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Lock or unlock current rotation"
                    >
                      {isRotationLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>{isRotationLocked ? 'Locked' : 'Lock'}</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    {/* Auto Rotate Option */}
                    <button
                      onClick={() => handleSetRotationMode('auto')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        rotationMode === 'auto' && !isRotationLocked
                          ? 'bg-blue-600 text-white font-bold'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Auto Rotate (Sensor)</span>
                      </div>
                      {rotationMode === 'auto' && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Active</span>}
                    </button>

                    {/* Portrait 0deg */}
                    <button
                      onClick={() => handleSetRotationMode('0')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        rotationMode === '0'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Portrait (0°)</span>
                      </div>
                      {rotationMode === '0' && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Selected</span>}
                    </button>

                    {/* Landscape 90deg */}
                    <button
                      onClick={() => handleSetRotationMode('90')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        rotationMode === '90'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <LandPlot className="w-3.5 h-3.5" />
                        <span>Landscape (90°)</span>
                      </div>
                      {rotationMode === '90' && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Selected</span>}
                    </button>

                    {/* Landscape 270deg */}
                    <button
                      onClick={() => handleSetRotationMode('270')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        rotationMode === '270'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <LandPlot className="w-3.5 h-3.5 rotate-180" />
                        <span>Landscape Reverse (270°)</span>
                      </div>
                      {rotationMode === '270' && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Selected</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Rotation Lock Button directly in toolbar */}
            <button
              onClick={toggleRotationLock}
              className={`w-9 h-9 border rounded-full flex items-center justify-center text-white shadow-md transition-colors ${
                isRotationLocked
                  ? 'bg-amber-600 border-amber-400 text-white'
                  : 'bg-black/60 hover:bg-black/80 border-white/10 text-slate-300'
              }`}
              title={isRotationLocked ? 'Unlock Rotation' : 'Lock Rotation'}
            >
              {isRotationLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Center Screen Unlock overlay when video controls locked */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <button
              onClick={() => setIsLocked(false)}
              className="p-4 bg-black/80 text-white rounded-full border border-white/20 shadow-2xl flex items-center space-x-2"
            >
              <Lock className="w-6 h-6 text-blue-400" />
              <span className="text-xs font-semibold pr-1">Tap to Unlock Controls</span>
            </button>
          </div>
        )}

        {/* Bottom Control Bar Overlay */}
        {!isLocked && (
          <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 space-y-2 z-20">
            {/* Seek Time Bar & Timestamps */}
            <div className="flex items-center space-x-3 text-xs font-mono font-medium text-white/90">
              <span>{formatTime(currentTime)}</span>

              {/* Progress Slider */}
              <div className="flex-1 relative flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCurrentTime(val);
                    if (videoRef.current) {
                      videoRef.current.currentTime = val;
                    }
                  }}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#3b82f6] focus:outline-none"
                />
              </div>

              <span>{formatTime(duration)}</span>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center justify-between pt-1">
              {/* Lock Button (Far Left) */}
              <button
                onClick={() => setIsLocked(true)}
                className="p-2 hover:bg-white/10 rounded-full text-white/90 transition-colors"
                title="Lock Controls"
              >
                <Lock className="w-5 h-5" />
              </button>

              {/* Center Playback Controls */}
              <div className="flex items-center space-x-8">
                {/* Prev */}
                <button
                  onClick={onPrevVideo}
                  className="p-2 text-white hover:text-blue-400 transition-colors active:scale-95"
                  title="Previous Video"
                >
                  <SkipBack className="w-6 h-6 fill-white" />
                </button>

                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-black" />
                  ) : (
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={onNextVideo}
                  className="p-2 text-white hover:text-blue-400 transition-colors active:scale-95"
                  title="Next Video"
                >
                  <SkipForward className="w-6 h-6 fill-white" />
                </button>
              </div>

              {/* Right Side Aspect & Minimize */}
              <div className="flex items-center space-x-3">
                {/* Aspect Ratio */}
                <button
                  onClick={toggleAspectRatio}
                  className="p-2 hover:bg-white/10 rounded-full text-white/90 transition-colors"
                  title="Aspect Ratio"
                >
                  <Maximize className="w-5 h-5" />
                </button>

                {/* Minimize / Back */}
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-white/10 rounded-full text-white/90 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Equalizer Popup Panel */}
      {showEqPanel && (
        <div className="absolute top-16 left-16 bg-slate-900/95 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl z-30 w-72 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm">Audio & Equalizer</h3>
            <button
              onClick={() => setShowEqPanel(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Volume Boost</span>
              <span className="text-blue-400">{volumeBoost}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              value={volumeBoost}
              onChange={(e) => setVolumeBoost(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Preset</label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg text-xs p-2 focus:outline-none"
            >
              <option value="Normal">Normal</option>
              <option value="Bass Booster">Bass Booster</option>
              <option value="Vocal Booster">Vocal Booster</option>
              <option value="Rock">Rock</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

