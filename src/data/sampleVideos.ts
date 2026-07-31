import { VideoItem } from '../types';

export const INITIAL_FOLDERS = [
  'All Videos',
  'Downloads',
  'Movies',
  'Trailers',
  'Camera',
  'Screen Recordings'
];

export const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    title: 'Big Buck Bunny (4K Ultra HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    duration: 596,
    size: '345.2 MB',
    date: '2026-07-28',
    folderName: 'Movies',
    decoder: 'HW+',
    resolution: '4K Ultra HD',
    codec: 'H.264 / AAC 5.1',
    progress: 142,
    completed: false,
    isNew: true,
    isPrivate: false,
    subtitles: [
      {
        id: 'sub-en',
        label: 'English (Default)',
        language: 'en',
        cues: [
          { id: '1', start: 2, end: 7, text: 'Welcome to Big Buck Bunny - Open Source Cinema' },
          { id: '2', start: 12, end: 18, text: 'A large and lovable rabbit awakens on a sunny morning.' },
          { id: '3', start: 25, end: 32, text: 'The gentle giant enjoys nature, flowers, and butterflies.' },
          { id: '4', start: 45, end: 52, text: 'Suddenly, three woodland bullies appear to disrupt the peace!' },
          { id: '5', start: 65, end: 72, text: 'Frank, Rinky, and Gamera start throwing berries.' },
          { id: '6', start: 90, end: 98, text: 'Bunny decides it is time to devise a clever plan for revenge.' },
          { id: '7', start: 120, end: 128, text: 'Setting up traps across the forest with precision.' }
        ]
      },
      {
        id: 'sub-bn',
        label: 'Bengali (বাংলা)',
        language: 'bn',
        cues: [
          { id: '1', start: 2, end: 7, text: 'বিগ বাক বানি - ওপেন সোর্স সিনেমা জগতে স্বাগতম' },
          { id: '2', start: 12, end: 18, text: 'এক সুন্দর সকালে এক বিশাল ও শান্ত খরগোশ জেগে ওঠে।' },
          { id: '3', start: 25, end: 32, text: 'সে বনের ফুল ও প্রজাপতির সাথে প্রকৃতি উপভোগ করছিল।' },
          { id: '4', start: 45, end: 52, text: 'হঠাৎ বনের তিন দুষ্টু প্রাণী এসে তার শান্তি নষ্ট করে!' }
        ]
      },
      {
        id: 'sub-hi',
        label: 'Hindi (हिंदी)',
        language: 'hi',
        cues: [
          { id: '1', start: 2, end: 7, text: 'बिग बक बनी में आपका स्वागत है' },
          { id: '2', start: 12, end: 18, text: 'एक खूबसूरत सुबह एक विशाल और प्यारा खरगोश जागता है।' },
          { id: '3', start: 25, end: 32, text: 'वह प्रकृति, फूलों और तितलियों का आनंद लेता है।' }
        ]
      }
    ],
    audioTracks: [
      { id: 'aud-1', label: 'English 5.1 Surround', language: 'en' },
      { id: 'aud-2', label: 'Hindi Dubbed Stereo', language: 'hi' },
      { id: 'aud-3', label: 'Bengali Audio Commentary', language: 'bn' }
    ],
    selectedAudioTrackId: 'aud-1'
  },
  {
    id: 'vid-2',
    title: 'Tears of Steel (Sci-Fi Short)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: 734,
    size: '512.8 MB',
    date: '2026-07-25',
    folderName: 'Movies',
    decoder: 'HW',
    resolution: '1080p FHD',
    codec: 'HEVC / Dolby Atmos',
    progress: 0,
    completed: false,
    isNew: true,
    isPrivate: false,
    subtitles: [
      {
        id: 'sub-tos-en',
        label: 'English (CC)',
        language: 'en',
        cues: [
          { id: '1', start: 5, end: 12, text: 'Amsterdam, in a dystopian future where robots rule the city.' },
          { id: '2', start: 18, end: 26, text: 'A group of warriors and scientists gather in the ancient church.' },
          { id: '3', start: 35, end: 42, text: 'We need to recalibrate the memory device before they breach the wall!' }
        ]
      }
    ],
    audioTracks: [
      { id: 'aud-tos-1', label: 'Original English (Stereo)', language: 'en' },
      { id: 'aud-tos-2', label: 'Director Commentary', language: 'en' }
    ],
    selectedAudioTrackId: 'aud-tos-1'
  },
  {
    id: 'vid-3',
    title: 'Cyberpunk Neon Metropolis 2088',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    duration: 888,
    size: '620.0 MB',
    date: '2026-07-20',
    folderName: 'Downloads',
    decoder: 'HW+',
    resolution: '4K HDR',
    codec: 'AV1 / OPUS 7.1',
    progress: 888,
    completed: true,
    isNew: false,
    isPrivate: false,
    subtitles: [
      {
        id: 'sub-sintel-en',
        label: 'English Subtitles',
        language: 'en',
        cues: [
          { id: '1', start: 3, end: 9, text: 'In search of a lost dragon, a lonely girl traverses icy mountains.' }
        ]
      }
    ],
    audioTracks: [
      { id: 'aud-sin-1', label: 'English Master 7.1', language: 'en' }
    ],
    selectedAudioTrackId: 'aud-sin-1'
  },
  {
    id: 'vid-4',
    title: 'Nature Wonders & Wildlife Documentary',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    duration: 15,
    size: '28.4 MB',
    date: '2026-07-15',
    folderName: 'Trailers',
    decoder: 'SW',
    resolution: '1080p 60fps',
    codec: 'H.264 / AAC',
    progress: 0,
    completed: false,
    isNew: false,
    isPrivate: false,
    subtitles: [],
    audioTracks: [{ id: 'a1', label: 'English Surround', language: 'en' }],
    selectedAudioTrackId: 'a1'
  },
  {
    id: 'vid-5',
    title: 'Cinematic Drone Footage - Alpine Peaks',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    duration: 15,
    size: '32.1 MB',
    date: '2026-07-10',
    folderName: 'Camera',
    decoder: 'HW+',
    resolution: '4K 60fps',
    codec: 'H.265 / AAC',
    progress: 5,
    completed: false,
    isNew: false,
    isPrivate: false,
    subtitles: [],
    audioTracks: [{ id: 'a1', label: 'Stereo Sound', language: 'en' }],
    selectedAudioTrackId: 'a1'
  },
  {
    id: 'vid-6',
    title: 'Secret Vault Footage - Encrypted File',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    duration: 60,
    size: '88.5 MB',
    date: '2026-07-01',
    folderName: 'Private',
    decoder: 'HW',
    resolution: '1080p',
    codec: 'H.264 / AAC',
    progress: 0,
    completed: false,
    isNew: false,
    isPrivate: true,
    subtitles: [],
    audioTracks: [{ id: 'a1', label: 'Default Track', language: 'en' }],
    selectedAudioTrackId: 'a1'
  }
];
