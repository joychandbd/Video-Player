import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sun,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Lock,
  Unlock,
  Subtitles,
  Sliders,
  Moon,
  Settings,
  Tv,
  Gauge,
  Cpu,
  Layers,
  ZoomIn
} from 'lucide-react';
import { VideoItem, SubtitleStyle, EqualizerSettings, DecoderMode, AspectRatioMode } from '../types';
import { formatTime } from '../utils/subtitleParser';
import { audioEngine, EqualizerBands } from '../utils/audioEngine';

interface VideoPlayerProps {
  video: VideoItem;
  playlist: VideoItem[];
  onClose: () => void;
  onNextVideo: () => void;
  onPrevVideo: () => void;
  onOpenEqualizer: () => void;
  onOpenSubtitles: () => void;
  onOpenSleepTimer: () => void;
  volumeBoost: number;
  setVolumeBoost: (vol: number) => void;
  eqBands: EqualizerBands;
  subtitleStyle: SubtitleStyle;
  selectedSubtitleId: string | null;
  sleepMinutes: number | null;
  onUpdateProgress: (videoId: string, time: number, duration: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  onNextVideo,
  onPrevVideo,
  onOpenEqualizer,
  onOpenSubtitles,
  onOpenSleepTimer,
  volumeBoost,
  setVolumeBoost,
  eqBands,
  subtitleStyle,
  selectedSubtitleId,
  sleepMinutes,
  onUpdateProgress
}) => {
  // Video element ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core Playback States
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(video.progress || 0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [buffered, setBuffered] = useState(0);

  // Settings & Overlays
  const [decoder, setDecoder] = useState<DecoderMode>(video.decoder || 'HW+');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('fit');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [pitchCorrection, setPitchCorrection] = useState(true);
  const [brightness, setBrightness] = useState(100); // 0% to 100%
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Gesture Feedback States
  const [gestureType, setGestureType] = useState<'volume' | 'brightness' | 'seek' | 'doubleTapLeft' | 'doubleTapRight' | null>(null);
  const [gestureValue, setGestureValue] = useState<string | number>('');
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drag Gesture tracking
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartXRef = useRef(0);
  const initialValRef = useRef(0);

  // Pinch Zoom state
  const [zoomScale, setZoomScale] = useState(100); // 100% to 400%

  // Multi-Core Cores
  const [coresCount] = useState(8);

  // Active Subtitle cue text
  const [activeSubtitleText, setActiveSubtitleText] = useState('');

  // Attach Web Audio API engine
  useEffect(() => {
    if (videoRef.current) {
      audioEngine.attachVideo(videoRef.current, volumeBoost, eqBands);
    }
  }, [videoRef, volumeBoost, eqBands]);

  // Handle Video Load & Initial Resume Time
  useEffect(() => {
    if (videoRef.current) {
      if (video.progress > 0 && video.progress < video.duration - 5) {
        videoRef.current.currentTime = video.progress;
      }
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [video]);

  // Handle Playback Speed & Pitch
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      if ('preservesPitch' in videoRef.current) {
        (videoRef.current as unknown as { preservesPitch: boolean }).preservesPitch = pitchCorrection;
      }
    }
  }, [playbackSpeed, pitchCorrection]);

  // Update Subtitle Cue
  useEffect(() => {
    if (!selectedSubtitleId) {
      setActiveSubtitleText('');
      return;
    }
    const currentSubTrack = video.subtitles.find((s) => s.id === selectedSubtitleId);
    if (!currentSubTrack || !currentSubTrack.cues) {
      setActiveSubtitleText('');
      return;
    }

    const targetTime = currentTime + subtitleStyle.syncDelay;
    const currentCue = currentSubTrack.cues.find(
      (c) => targetTime >= c.start && targetTime <= c.end
    );

    setActiveSubtitleText(currentCue ? currentCue.text : '');
  }, [currentTime, selectedSubtitleId, video.subtitles, subtitleStyle.syncDelay]);

  // Auto hide controls after inactivity
  const triggerControlsShow = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Trigger feedback overlay
  const showGestureFeedback = (type: 'volume' | 'brightness' | 'seek' | 'doubleTapLeft' | 'doubleTapRight', val: string | number) => {
    setGestureType(type);
    setGestureValue(val);
    if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
    gestureTimeoutRef.current = setTimeout(() => {
      setGestureType(null);
    }, 1200);
  };

  // Timeupdate handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(cur);
      setDuration(dur);

      if (videoRef.current.buffered.length > 0) {
        setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      }

      onUpdateProgress(video.id, cur, dur);
    }
  };

  // Toggle Play Pause
  const togglePlayPause = () => {
    if (isLocked) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
    triggerControlsShow();
  };

  // Skip Seconds
  const skipSeconds = (secs: number) => {
    if (isLocked || !videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + secs));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    if (secs > 0) {
      showGestureFeedback('doubleTapRight', `+${secs}s`);
    } else {
      showGestureFeedback('doubleTapLeft', `${secs}s`);
    }
    triggerControlsShow();
  };

  // On Screen Pointer Down (Gestures)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLocked) return;
    triggerControlsShow();
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartXRef.current = e.clientX;

    const rect = e.currentTarget.getBoundingClientRect();
    const isRightSide = e.clientX > rect.left + rect.width / 2;

    if (isRightSide) {
      initialValRef.current = volumeBoost;
    } else {
      initialValRef.current = brightness;
    }
  };

  // On Screen Pointer Move (Gestures)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || isLocked) return;

    const deltaY = dragStartYRef.current - e.clientY;
    const deltaX = e.clientX - dragStartXRef.current;
    const rect = e.currentTarget.getBoundingClientRect();

    // If vertical movement is dominant (Volume / Brightness)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 15) {
      const sensitivity = 1.2;
      const change = Math.round((deltaY / rect.height) * 100 * sensitivity);

      if (dragStartXRef.current > rect.left + rect.width / 2) {
        // Right Side -> Volume (0 - 200%)
        const newVol = Math.max(0, Math.min(200, initialValRef.current + change));
        setVolumeBoost(newVol);
        showGestureFeedback('volume', `${newVol}%`);
      } else {
        // Left Side -> Brightness (10 - 100%)
        const newBri = Math.max(10, Math.min(100, initialValRef.current + change));
        setBrightness(newBri);
        showGestureFeedback('brightness', `${newBri}%`);
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Double tap detection
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const handleTouchTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;

    if (now - lastTapRef.current.time < 300) {
      // Double tap detected!
      if (x > rect.left + rect.width / 2) {
        skipSeconds(10);
      } else {
        skipSeconds(-10);
      }
    } else {
      triggerControlsShow();
    }
    lastTapRef.current = { time: now, x };
  };

  // Picture-in-Picture
  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not available:', err);
    }
  };

  // Aspect ratio style generator
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'stretch':
        return 'w-full h-full object-fill';
      case 'crop':
        return 'w-full h-full object-cover';
      case '16:9':
        return 'w-full aspect-video object-contain';
      case '4:3':
        return 'w-full aspect-[4/3] object-contain';
      case 'fit':
      default:
        return 'w-full h-full object-contain';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsShow}
      className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* Video Element Frame */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleTouchTap}
        style={{
          filter: `brightness(${brightness}%)`
        }}
      >
        <video
          ref={videoRef}
          src={video.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            onNextVideo();
          }}
          className={`${getAspectRatioClass()} transition-all duration-300 transform`}
          style={{
            transform: `scale(${zoomScale / 100})`
          }}
        />

        {/* Subtitle Display Overlay */}
        {activeSubtitleText && (
          <div
            className="absolute left-4 right-4 z-20 flex justify-center pointer-events-none transition-all"
            style={{
              bottom: `${subtitleStyle.posY}%`
            }}
          >
            <div
              style={{
                fontSize: `${subtitleStyle.fontSize}px`,
                color: subtitleStyle.color,
                backgroundColor: `rgba(0, 0, 0, ${subtitleStyle.bgOpacity})`,
                textShadow: subtitleStyle.shadow ? '2px 2px 5px rgba(0,0,0,0.9)' : 'none',
                WebkitTextStroke: subtitleStyle.outline ? '1px black' : 'none'
              }}
              className="px-4 py-1.5 rounded-xl font-sans text-center max-w-3xl font-medium leading-relaxed shadow-2xl backdrop-blur-xs"
            >
              {activeSubtitleText}
            </div>
          </div>
        )}

        {/* On-Screen Gesture Feedback Indicator Badges */}
        {gestureType && (
          <div className="absolute z-30 pointer-events-none flex items-center justify-center animate-fade-in">
            {gestureType === 'volume' && (
              <div className="bg-[#0f0f0f]/95 border border-[#262626] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-md">
                <Volume2 className="w-6 h-6 animate-pulse" />
                <span className="text-xl font-mono font-bold">{gestureValue}</span>
              </div>
            )}

            {gestureType === 'brightness' && (
              <div className="bg-[#0f0f0f]/95 border border-[#262626] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-md">
                <Sun className="w-6 h-6 animate-spin" />
                <span className="text-xl font-mono font-bold">{gestureValue}</span>
              </div>
            )}

            {gestureType === 'doubleTapRight' && (
              <div className="bg-white text-black px-6 py-3.5 rounded-full shadow-2xl flex items-center space-x-2 backdrop-blur">
                <RotateCw className="w-5 h-5" />
                <span className="text-base font-bold font-mono">{gestureValue}</span>
              </div>
            )}

            {gestureType === 'doubleTapLeft' && (
              <div className="bg-white text-black px-6 py-3.5 rounded-full shadow-2xl flex items-center space-x-2 backdrop-blur">
                <RotateCcw className="w-5 h-5" />
                <span className="text-base font-bold font-mono">{gestureValue}</span>
              </div>
            )}
          </div>
        )}

        {/* Kids / Touch Lock Toggle Floating Button */}
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`absolute top-4 left-4 z-40 p-3 rounded-2xl shadow-2xl backdrop-blur border transition-all ${
            isLocked
              ? 'bg-neutral-800 border-white text-white'
              : 'bg-[#0f0f0f]/90 border-[#262626] text-neutral-300 hover:text-white'
          }`}
          title={isLocked ? 'Tap to Unlock Touch Controls' : 'Lock Touch Screen'}
        >
          {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
        </button>

        {/* Locked Banner Message */}
        {isLocked && (
          <div className="absolute top-16 left-4 z-40 bg-[#0f0f0f]/90 border border-[#262626] text-white text-xs px-3 py-1.5 rounded-xl font-medium shadow-xl backdrop-blur">
            Screen Controls Locked. Tap padlock icon to unlock.
          </div>
        )}
      </div>

      {/* Main Overlay Player Controls (Top Bar & Bottom Timeline) */}
      {!isLocked && showControls && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-transparent to-black/90 transition-opacity duration-300">
          {/* TOP CONTROL BAR */}
          <div className="pointer-events-auto flex items-center justify-between gap-3 bg-[#0a0a0a]/90 border border-[#1a1a1a] p-3 rounded-2xl backdrop-blur-md shadow-2xl">
            {/* Left: Back Arrow & Video Title */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <button
                onClick={onClose}
                className="p-2 text-neutral-300 hover:text-white hover:bg-[#1f1f1f] rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">{video.title}</h2>
                <div className="flex items-center space-x-2 text-[10px] text-neutral-400 font-mono">
                  <span>{video.resolution}</span>
                  <span>•</span>
                  <span>{video.codec}</span>
                </div>
              </div>
            </div>

            {/* Right: Engine & Decoder Selectors */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Decoder Engine Selector Pill */}
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-1 flex items-center space-x-1">
                {(['HW', 'HW+', 'SW'] as DecoderMode[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDecoder(d)}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                      decoder === d
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Multi-Core Badge */}
              <span className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-[#141414] border border-[#262626] text-neutral-300 text-[10px] font-mono rounded-xl">
                <Cpu className="w-3 h-3 text-neutral-400" />
                <span>{coresCount} Cores</span>
              </span>

              {/* Equalizer Modal Trigger */}
              <button
                onClick={onOpenEqualizer}
                className={`p-2 rounded-xl border transition-all ${
                  volumeBoost > 100
                    ? 'bg-white text-black border-white shadow-sm font-bold'
                    : 'bg-[#141414] text-neutral-300 border-[#262626] hover:bg-[#1f1f1f]'
                }`}
                title="Equalizer & 200% Audio Boost"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Subtitles Button */}
              <button
                onClick={onOpenSubtitles}
                className={`p-2 rounded-xl border transition-all ${
                  selectedSubtitleId
                    ? 'bg-white text-black border-white'
                    : 'bg-[#141414] text-neutral-300 border-[#262626] hover:bg-[#1f1f1f]'
                }`}
                title="Subtitles & Styling"
              >
                <Subtitles className="w-4 h-4" />
              </button>

              {/* Sleep Timer */}
              <button
                onClick={onOpenSleepTimer}
                className={`p-2 rounded-xl border transition-all ${
                  sleepMinutes
                    ? 'bg-white text-black border-white'
                    : 'bg-[#141414] text-neutral-300 border-[#262626] hover:bg-[#1f1f1f]'
                }`}
                title="Sleep Timer"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* BOTTOM TIMELINE SCRUBBER & CONTROLS BAR */}
          <div className="pointer-events-auto bg-[#0a0a0a]/90 border border-[#1a1a1a] p-4 rounded-2xl backdrop-blur-md shadow-2xl space-y-3">
            {/* Interactive Progress Bar Scrubber */}
            <div className="relative group flex items-center space-x-3">
              <span className="text-xs font-mono font-bold text-neutral-300 w-12 text-right">
                {formatTime(currentTime)}
              </span>

              <div className="relative flex-1 h-3 flex items-center cursor-pointer">
                {/* Buffered Track */}
                <div className="absolute inset-0 h-1.5 bg-[#222222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-600"
                    style={{ width: `${(buffered / (duration || 1)) * 100}%` }}
                  />
                </div>

                {/* Watched Track */}
                <div
                  className="absolute left-0 h-1.5 bg-white rounded-full"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />

                {/* Range Input overlay */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const newT = Number(e.target.value);
                    setCurrentTime(newT);
                    if (videoRef.current) videoRef.current.currentTime = newT;
                  }}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
                />
              </div>

              <span className="text-xs font-mono text-neutral-400 w-12">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls Button Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Left Playback Buttons */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={onPrevVideo}
                  className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-[#1f1f1f] transition-all"
                  title="Previous Video"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={() => skipSeconds(-10)}
                  className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-[#1f1f1f] transition-all"
                  title="Skip 10s Back"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="p-3 bg-white hover:bg-neutral-200 text-black rounded-xl shadow-md transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => skipSeconds(10)}
                  className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-[#1f1f1f] transition-all"
                  title="Skip 10s Forward"
                >
                  <RotateCw className="w-5 h-5" />
                </button>

                <button
                  onClick={onNextVideo}
                  className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-[#1f1f1f] transition-all"
                  title="Next Video"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Right Settings Shortcuts (Speed, Aspect Ratio, Zoom, PiP) */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Speed Dropdown */}
                <div className="flex items-center space-x-1 bg-[#141414] border border-[#262626] px-2.5 py-1 rounded-xl text-xs">
                  <Gauge className="w-3.5 h-3.5 text-neutral-400" />
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-transparent text-white font-mono font-bold focus:outline-none"
                  >
                    <option value="0.25" className="bg-[#141414]">0.25x</option>
                    <option value="0.5" className="bg-[#141414]">0.5x</option>
                    <option value="0.75" className="bg-[#141414]">0.75x</option>
                    <option value="1.0" className="bg-[#141414]">1.0x Normal</option>
                    <option value="1.25" className="bg-[#141414]">1.25x</option>
                    <option value="1.5" className="bg-[#141414]">1.5x</option>
                    <option value="2.0" className="bg-[#141414]">2.0x</option>
                    <option value="3.0" className="bg-[#141414]">3.0x</option>
                    <option value="4.0" className="bg-[#141414]">4.0x Speed</option>
                  </select>
                </div>

                {/* Aspect Ratio Button */}
                <button
                  onClick={() => {
                    const modes: AspectRatioMode[] = ['fit', 'stretch', 'crop', '16:9', '4:3'];
                    const nextIdx = (modes.indexOf(aspectRatio) + 1) % modes.length;
                    setAspectRatio(modes[nextIdx]);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#141414] border border-[#262626] hover:bg-[#1f1f1f] text-white text-xs font-semibold rounded-xl"
                  title="Aspect Ratio & Screen Fit"
                >
                  <Tv className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="uppercase">{aspectRatio}</span>
                </button>

                {/* Pinch / Zoom Toggle */}
                <button
                  onClick={() => setZoomScale(zoomScale >= 200 ? 100 : zoomScale + 50)}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#141414] border border-[#262626] hover:bg-[#1f1f1f] text-white text-xs font-mono font-bold rounded-xl"
                  title="Zoom Video Frame"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{zoomScale}%</span>
                </button>

                {/* PiP Mode */}
                <button
                  onClick={togglePiP}
                  className="p-2 bg-[#141414] border border-[#262626] text-neutral-300 hover:text-white rounded-xl hover:bg-[#1f1f1f]"
                  title="Picture in Picture (Floating Player)"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
