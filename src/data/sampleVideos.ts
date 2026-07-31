import { VideoItem } from '../types';

export const INITIAL_FOLDERS = [
  'Legends.S01',
  'MLWBD.com EKTB S01 480p',
  'Movie',
  'Quick Share',
  'SnapTube Video'
];

export const SAMPLE_VIDEOS: VideoItem[] = [
  // Legends.S01 Folder
  {
    id: 'leg-6',
    title: 'Legends.S01E06.720p.NF.WEB-DL.DUAL.AAC2.0.H.265-.Pw',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    duration: 4473, // 1:14:33
    size: '680 MB',
    date: 'Jul 28',
    folderName: 'Legends.S01',
    decoder: 'SW',
    resolution: '720p HD',
    codec: 'HEVC / AAC 2.0',
    progress: 0,
    completed: false,
    isNew: false,
    isPrivate: false,
    subtitles: [
      {
        id: 'sub-1',
        label: 'English (SRT)',
        language: 'en',
        cues: [
          { id: '1', start: 2, end: 8, text: 'Episode 6 - The Final Showdown' }
        ]
      }
    ],
    audioTracks: [{ id: 'a1', label: 'Dual Audio (Hindi + English)', language: 'en' }],
    selectedAudioTrackId: 'a1'
  },
  {
    id: 'leg-5',
    title: 'Legends.S01E05.720p.NF.WEB-DL.DUAL.AAC2.0.H.265-.Pw',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: 3515, // 58:35
    size: '520 MB',
    date: 'Jul 28',
    folderName: 'Legends.S01',
    decoder: 'SW',
    resolution: '720p HD',
    codec: 'HEVC / AAC 2.0',
    progress: 0,
    completed: false,
    isNew: false,
    isPrivate: false,
    subtitles: [
      {
        id: 'sub-2',
        label: 'English (SRT)',
        language: 'en',
        cues: [
          { id: '1', start: 2, end: 8, text: 'Episode 5 - The Secret Unveiled' }
        ]
      }
    ],
    audioTracks: [{ id: 'a1', label: 'Dual Audio', language: 'en' }],
    selectedAudioTrackId: 'a1'
  },
  {
    id: 'leg-4',
    title: 'Legends.S01E04.720p.NF.WEB-DL.DUAL.AAC2.0.H.265-.Pw',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    duration: 3416, // 56:56
    size: '510 MB',
    date: 'Jul 28',
    folderName: 'Legends.S01',
    decoder: 'SW',
    resolution: '720p HD',
    codec: 'HEVC / AAC 2.0',
    progress: 0,
    completed: false,
    isNew: false,
    isPrivate: false,
    subtitles: [
      {
        id: 'sub-3',
        label: 'English (SRT)',
        language: 'en',
        cues: [
          { id: '1', start: 2, end: 8, text: 'Episode 4 - Rising Shadows' }
        ]
      }
    ],
    audioTracks: [{ id: 'a1', label: 'Dual Audio', language: 'en' }],
    selectedAudioTrackId: 'a1'
  },
  {
    id: 'leg-3',
    title: 'Legends.S01E03.720p.NF.WEB-DL.DUAL.AAC2.0.H.265-.Pw',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    duration: 3429, // 57:09
    size: '515 MB',
    date: 'Jul 28',
    folderName: 'Legends.S01',
    decoder: 'SW',
    resolution: '720p HD',
    codec: 'HEVC / AAC 2.0',
    progress: 2803, // 46:43
    completed: false,
    isNew: false,
    isPrivate: false,
    subtitles: [
      {
        id: 'sub-4',
        label: 'English (SRT)',
        language: 'en',
        cues: [
          { id: '1', start: 2, end: 8, text: 'Episode 3 - Turning Point' }
        ]
      }
    ],
    audioTracks: [{ id: 'a1', label: 'Dual Audio', language: 'en' }],
    selectedAudioTrackId: 'a1'
  },
  {
    id: 'leg-2',
    title: 'Legends.S01E02.720p.NF.WEB-DL.DUAL.AAC2.0.H.265-.Pw',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    duration: 3493, // 58:13
    size: '525 MB',
    date: 'Jul 28',
    folderName: 'Legends.S01',
    decoder: 'SW',
    resolution: '720p HD',
    codec: 'HEVC / AAC 2.0',
    progress: 0,
    completed: false,
    isNew: true,
    isPrivate: false,
    subtitles: [
      {
        id: 'sub-5',
        label: 'English (SRT)',
        language: 'en',
        cues: []
      }
    ],
    audioTracks: [{ id: 'a1', label: 'Dual Audio', language: 'en' }],
    selectedAudioTrackId: 'a1'
  },
  {
    id: 'leg-1',
    title: 'Legends.S01E01.720p.NF.WEB-DL.DUAL.AAC2.0.H.265-.Pw',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    duration: 2904, // 48:24
    size: '450 MB',
    date: 'Jul 28',
    folderName: 'Legends.S01',
    decoder: 'SW',
    resolution: '720p HD',
    codec: 'HEVC / AAC 2.0',
    progress: 0,
    completed: false,
    isNew: true,
    isPrivate: false,
    subtitles: [
      {
        id: 'sub-6',
        label: 'English (SRT)',
        language: 'en',
        cues: []
      }
    ],
    audioTracks: [{ id: 'a1', label: 'Dual Audio', language: 'en' }],
    selectedAudioTrackId: 'a1'
  },

  // MLWBD.com EKTB S01 480p Folder
  {
    id: 'mlw-1',
    title: 'EKTB.S01E01.480p.WEBRip.x264.AAC.MLWBD.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: 2700,
    size: '220 MB',
    date: 'Jul 25',
    folderName: 'MLWBD.com EKTB S01 480p',
    decoder: 'HW',
    resolution: '480p',
    codec: 'H.264 / AAC',
    progress: 0,
    completed: false,
    isNew: true,
    isPrivate: false,
    subtitles: [],
    audioTracks: [{ id: 'a1', label: 'Hindi', language: 'hi' }]
  },

  // Movie Folder
  {
    id: 'mov-1',
    title: 'Inception.2010.1080p.Bluray.x264.AAC.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    duration: 8880,
    size: '2.1 GB',
    date: 'Jul 20',
    folderName: 'Movie',
    decoder: 'HW+',
    resolution: '1080p',
    codec: 'H.264 / AAC',
    progress: 0,
    completed: false,
    isNew: true,
    isPrivate: false,
    subtitles: [],
    audioTracks: [{ id: 'a1', label: 'English 5.1', language: 'en' }]
  },

  // Quick Share Folder
  {
    id: 'qs-1',
    title: 'VID_20260728_102030.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    duration: 120,
    size: '45 MB',
    date: 'Jul 28',
    folderName: 'Quick Share',
    decoder: 'HW',
    resolution: '1080p',
    codec: 'H.264 / AAC',
    progress: 0,
    completed: false,
    isNew: false,
    isPrivate: false,
    subtitles: [],
    audioTracks: [{ id: 'a1', label: 'Stereo', language: 'en' }]
  },

  // SnapTube Video Folder
  {
    id: 'st-1',
    title: 'Top_10_Action_Scenes_2026.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    duration: 650,
    size: '180 MB',
    date: 'Jul 26',
    folderName: 'SnapTube Video',
    decoder: 'HW+',
    resolution: '1080p',
    codec: 'H.264 / AAC',
    progress: 0,
    completed: false,
    isNew: true,
    isPrivate: false,
    subtitles: [],
    audioTracks: [{ id: 'a1', label: 'Stereo', language: 'en' }]
  }
];
