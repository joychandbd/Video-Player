import React, { useState } from 'react';
import { X, Upload, Link, Plus, Film, Check } from 'lucide-react';
import { VideoItem } from '../types';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (video: VideoItem) => void;
  folders: string[];
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  isOpen,
  onClose,
  onAddVideo,
  folders
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'samples'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [folderInput, setFolderInput] = useState(folders[1] || 'Downloads');

  if (!isOpen) return null;

  // Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      const newVideo: VideoItem = {
        id: `vid-local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: objectUrl,
        poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
        duration: 180,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0],
        folderName: folderInput,
        decoder: 'HW+',
        resolution: '1080p FHD',
        codec: 'H.264 / AAC',
        progress: 0,
        completed: false,
        isNew: true,
        isPrivate: false,
        subtitles: [],
        audioTracks: [{ id: 'a1', label: 'Default Audio', language: 'en' }]
      };
      onAddVideo(newVideo);
      onClose();
    }
  };

  // Direct URL Submit
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newVideo: VideoItem = {
      id: `vid-url-${Date.now()}`,
      title: titleInput.trim() || 'Custom Network Stream',
      url: urlInput.trim(),
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      duration: 300,
      size: 'Network Stream',
      date: new Date().toISOString().split('T')[0],
      folderName: folderInput,
      decoder: 'HW+',
      resolution: '4K Ultra HD',
      codec: 'H.264 / AAC',
      progress: 0,
      completed: false,
      isNew: true,
      isPrivate: false,
      subtitles: [],
      audioTracks: [{ id: 'a1', label: 'Network Audio Stream', language: 'en' }]
    };
    onAddVideo(newVideo);
    onClose();
  };

  const presetSamples = [
    {
      title: 'Cosmic Nebula Galaxy Exploration',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      resolution: '4K 60fps',
      size: '180 MB'
    },
    {
      title: 'Ocean Deep Blue Wildlife Documentary',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      resolution: '1080p FHD',
      size: '95 MB'
    },
    {
      title: 'Cyberpunk Metropolis City Lights',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      resolution: '4K HDR',
      size: '220 MB'
    }
  ];

  const handleAddSample = (sample: typeof presetSamples[0]) => {
    const newVid: VideoItem = {
      id: `vid-sample-${Date.now()}`,
      title: sample.title,
      url: sample.url,
      poster: sample.poster,
      duration: 60,
      size: sample.size,
      date: new Date().toISOString().split('T')[0],
      folderName: folderInput,
      decoder: 'HW+',
      resolution: sample.resolution,
      codec: 'HEVC / Dolby',
      progress: 0,
      completed: false,
      isNew: true,
      isPrivate: false,
      subtitles: [],
      audioTracks: [{ id: 'a1', label: 'Surround 5.1', language: 'en' }]
    };
    onAddVideo(newVid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] text-white border border-[#262626]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Video to Media Library</h3>
              <p className="text-xs text-neutral-400">Local Upload, Network URL, or Sample Movies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-[#1a1a1a] hover:bg-[#262626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Folder Destination Selector */}
        <div className="flex items-center justify-between bg-[#141414] p-3 rounded-xl border border-[#222222] text-xs">
          <span className="text-neutral-400 font-semibold">Destination Folder:</span>
          <select
            value={folderInput}
            onChange={(e) => setFolderInput(e.target.value)}
            className="bg-[#1f1f1f] text-neutral-200 rounded-lg border border-[#262626] px-3 py-1 focus:outline-none"
          >
            {folders.filter((f) => f !== 'All Videos').map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-[#141414] p-1 rounded-xl border border-[#222222]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'upload' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'url' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Stream URL</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'samples' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Samples</span>
          </button>
        </div>

        {/* Tab 1: Upload Local Video File */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#262626] bg-[#141414] hover:bg-[#1a1a1a] cursor-pointer transition-all space-y-3 group text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1f1f1f] border border-[#262626] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7 text-neutral-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Click or Drag Local Video File</h4>
                <p className="text-xs text-neutral-400 mt-1">Supports MP4, WebM, MKV, MOV, OGG, 4K/1080p</p>
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Tab 2: Stream URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Video Stream URL</label>
              <input
                type="url"
                required
                placeholder="https://example.com/video.mp4"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-[#141414] border border-[#222222] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Video Title (Optional)</label>
              <input
                type="text"
                placeholder="My Custom Stream"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full bg-[#141414] border border-[#222222] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add URL Video</span>
            </button>
          </form>
        )}

        {/* Tab 3: Preset Samples */}
        {activeTab === 'samples' && (
          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
            {presetSamples.map((sample, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#141414] border border-[#222222] rounded-xl flex items-center justify-between hover:border-[#333333] transition-all"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <img src={sample.poster} alt={sample.title} className="w-16 aspect-video rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-semibold text-white truncate">{sample.title}</h5>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {sample.resolution} • {sample.size}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAddSample(sample)}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
