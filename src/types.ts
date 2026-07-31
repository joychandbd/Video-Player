export type DecoderMode = 'HW' | 'HW+' | 'SW';

export type AspectRatioMode = 'fit' | 'stretch' | 'crop' | '16:9' | '4:3' | 'original';

export interface SubtitleCue {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  src?: string;
  isExternal?: boolean;
  cues: SubtitleCue[];
}

export interface AudioTrack {
  id: string;
  label: string;
  language: string;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  poster?: string;
  duration: number; // in seconds
  size: string;     // e.g. "450 MB"
  date: string;     // ISO or formatted
  folderName: string;
  decoder: DecoderMode;
  resolution: string; // e.g. "1080p", "4K", "720p"
  codec: string;      // e.g. "H.264 / AAC", "HEVC / AC3"
  progress: number;   // current watched time in seconds
  completed: boolean;
  isNew?: boolean;
  isPrivate?: boolean;
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
  selectedAudioTrackId?: string;
}

export interface SubtitleStyle {
  fontSize: number;          // in px (14 - 36)
  color: string;             // hex or color string
  backgroundColor: string;   // hex or rgba
  bgOpacity: number;         // 0 to 1
  posY: number;              // 5% to 90% from bottom
  fontFamily: string;
  outline: boolean;
  shadow: boolean;
  syncDelay: number;         // in seconds, e.g. +0.5 or -1.0
}

export interface EqualizerSettings {
  enabled: boolean;
  preset: string;
  gain200: number; // 100 is normal, up to 200 is 2x boost
  bands: number[]; // 5 or 10 bands gains in dB (-12 to +12)
}

export interface PlaybackSettings {
  speed: number;
  decoderMode: DecoderMode;
  multiCoreCores: number;
  pitchCorrection: boolean;
  brightness: number; // 0 to 100
  volume: number;     // 0 to 200
  aspectRatio: AspectRatioMode;
  zoomLevel: number;  // 100% to 400%
  panX: number;
  panY: number;
  backgroundPlay: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerEndTime: number | null;
}
