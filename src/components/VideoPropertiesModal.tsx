import React from 'react';
import { X, Info, HardDrive, Clock, Film, Cpu, Tag, Folder } from 'lucide-react';
import { VideoItem } from '../types';
import { formatTime } from '../utils/subtitleParser';

interface VideoPropertiesModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export const VideoPropertiesModal: React.FC<VideoPropertiesModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  const propItems = [
    { label: 'Title', value: video.title, icon: Film },
    { label: 'Duration', value: formatTime(video.duration), icon: Clock },
    { label: 'File Size', value: video.size, icon: HardDrive },
    { label: 'Resolution', value: video.resolution, icon: Tag },
    { label: 'Decoder Engine', value: `${video.decoder} (Multi-Core)`, icon: Cpu },
    { label: 'Codec Info', value: video.codec, icon: Info },
    { label: 'Storage Folder', value: `/storage/emulated/0/Movies/${video.folderName}`, icon: Folder },
    { label: 'Date Added', value: video.date, icon: Clock }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] text-white border border-[#262626]">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Media Properties & Details</h3>
              <p className="text-xs text-neutral-400">Technical File Specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-[#1a1a1a] hover:bg-[#262626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Thumbnail Preview Header */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-[#222222]">
          {video.poster && <img src={video.poster} alt={video.title} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-3 left-3 right-3">
            <span className="bg-[#222222] text-white border border-[#333333] font-mono font-bold text-[10px] px-2 py-0.5 rounded mr-2">
              {video.decoder}
            </span>
            <span className="text-xs font-bold text-white truncate">{video.title}</span>
          </div>
        </div>

        {/* Properties Grid List */}
        <div className="space-y-2 bg-[#141414] p-4 rounded-xl border border-[#222222] text-xs">
          {propItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[#222222] last:border-0">
                <span className="text-neutral-400 flex items-center space-x-2">
                  <Icon className="w-3.5 h-3.5 text-neutral-300" />
                  <span>{item.label}:</span>
                </span>
                <span className="font-semibold text-neutral-200 font-mono truncate max-w-[200px]" title={item.value}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
