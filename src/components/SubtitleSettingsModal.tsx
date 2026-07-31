import React, { useState } from 'react';
import {
  X,
  Subtitles,
  Upload,
  Globe,
  Sliders,
  Type,
  Palette,
  Check,
  Search,
  RotateCcw
} from 'lucide-react';
import { SubtitleTrack, SubtitleStyle } from '../types';
import { parseSRT } from '../utils/subtitleParser';

interface SubtitleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtitles: SubtitleTrack[];
  selectedSubtitleId: string | null;
  onSelectSubtitle: (id: string | null) => void;
  onAddSubtitleTrack: (track: SubtitleTrack) => void;
  style: SubtitleStyle;
  setStyle: React.Dispatch<React.SetStateAction<SubtitleStyle>>;
}

export const SubtitleSettingsModal: React.FC<SubtitleSettingsModalProps> = ({
  isOpen,
  onClose,
  subtitles,
  selectedSubtitleId,
  onSelectSubtitle,
  onAddSubtitleTrack,
  style,
  setStyle
}) => {
  const [activeTab, setActiveTab] = useState<'tracks' | 'style' | 'online'>('tracks');
  const [onlineQuery, setOnlineQuery] = useState('');
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; lang: string }>>([]);

  if (!isOpen) return null;

  // Handle local SRT / VTT file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          const cues = parseSRT(text);
          const newTrack: SubtitleTrack = {
            id: `sub-custom-${Date.now()}`,
            label: file.name.replace(/\.(srt|vtt)$/i, ''),
            language: 'custom',
            isExternal: true,
            cues
          };
          onAddSubtitleTrack(newTrack);
          onSelectSubtitle(newTrack.id);
        }
      };
      reader.readAsText(file);
    }
  };

  // Online Subtitle Search simulation
  const handleOnlineSearch = () => {
    if (!onlineQuery.trim()) return;
    setIsSearchingOnline(true);
    setTimeout(() => {
      setSearchResults([
        { id: 'dl-1', name: `${onlineQuery} - Official BluRay English Subtitle (OpenSubtitles)`, lang: 'English' },
        { id: 'dl-2', name: `${onlineQuery} - Bengali HD Translated Subtitle by Subscene`, lang: 'Bengali' },
        { id: 'dl-3', name: `${onlineQuery} - Hindi Dubbed Clean Subtitles`, lang: 'Hindi' },
        { id: 'dl-4', name: `${onlineQuery} - Spanish Multi-sub Complete`, lang: 'Spanish' }
      ]);
      setIsSearchingOnline(false);
    }, 800);
  };

  const handleDownloadOnlineSub = (item: { id: string; name: string; lang: string }) => {
    const sampleCues = [
      { id: '1', start: 1, end: 6, text: `[${item.lang}] Subtitles loaded automatically from OpenSubtitles!` },
      { id: '2', start: 7, end: 15, text: `Enjoy watching with high precision synchronization.` }
    ];
    const newTrack: SubtitleTrack = {
      id: `sub-online-${Date.now()}`,
      label: `${item.lang} - ${item.name.slice(0, 25)}...`,
      language: item.lang.toLowerCase().slice(0, 2),
      isExternal: true,
      cues: sampleCues
    };
    onAddSubtitleTrack(newTrack);
    onSelectSubtitle(newTrack.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-6 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] text-white border border-[#262626]">
              <Subtitles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Subtitle Manager & Stylist</h3>
              <p className="text-xs text-neutral-400">Tracks, Synchronization & Appearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-[#1a1a1a] hover:bg-[#262626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-[#141414] p-1 rounded-xl border border-[#222222]">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'tracks' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span>Tracks ({subtitles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'style' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Text Style & Position</span>
          </button>

          <button
            onClick={() => setActiveTab('online')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'online' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search Online</span>
          </button>
        </div>

        {/* Tab Content 1: Subtitle Tracks List & Upload */}
        {activeTab === 'tracks' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Select Subtitle Track
              </label>

              {/* Disable Subtitles Option */}
              <div
                onClick={() => onSelectSubtitle(null)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedSubtitleId === null
                    ? 'bg-white text-black font-semibold border-white'
                    : 'bg-[#141414] border-[#222222] text-neutral-300 hover:bg-[#1f1f1f]'
                }`}
              >
                <span className="text-sm font-medium">Off (Disable Subtitles)</span>
                {selectedSubtitleId === null && <Check className="w-4 h-4 text-black" />}
              </div>

              {/* Subtitles List */}
              {subtitles.map((sub) => {
                const isSelected = selectedSubtitleId === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => onSelectSubtitle(sub.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white text-black font-semibold border-white'
                        : 'bg-[#141414] border-[#222222] text-neutral-300 hover:bg-[#1f1f1f]'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-semibold">{sub.label}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        Language: {sub.language.toUpperCase()} • {sub.cues.length} Cues
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-black" />}
                  </div>
                );
              })}
            </div>

            {/* Local SRT Upload Button */}
            <div className="pt-2">
              <label className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-dashed border-[#262626] bg-[#141414] hover:bg-[#1a1a1a] cursor-pointer text-xs font-bold text-neutral-200 hover:text-white transition-all">
                <Upload className="w-4 h-4" />
                <span>Open Local Subtitle File (.srt, .vtt)</span>
                <input
                  type="file"
                  accept=".srt,.vtt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Subtitle Sync Timing */}
            <div className="bg-[#141414] p-4 rounded-xl border border-[#222222] space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-neutral-300">Subtitle Sync Delay:</span>
                <span className="text-white font-mono">
                  {style.syncDelay > 0 ? `+${style.syncDelay.toFixed(1)}s` : `${style.syncDelay.toFixed(1)}s`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStyle((s) => ({ ...s, syncDelay: s.syncDelay - 0.5 }))}
                  className="px-3 py-1.5 bg-[#1f1f1f] text-neutral-200 text-xs rounded-lg hover:bg-[#262626] font-bold border border-[#262626]"
                >
                  -0.5s
                </button>
                <button
                  onClick={() => setStyle((s) => ({ ...s, syncDelay: s.syncDelay + 0.5 }))}
                  className="px-3 py-1.5 bg-[#1f1f1f] text-neutral-200 text-xs rounded-lg hover:bg-[#262626] font-bold border border-[#262626]"
                >
                  +0.5s
                </button>
                <button
                  onClick={() => setStyle((s) => ({ ...s, syncDelay: 0 }))}
                  className="px-3 py-1.5 bg-[#1f1f1f] text-neutral-400 hover:text-white text-xs rounded-lg flex items-center space-x-1 ml-auto border border-[#262626]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Subtitle Styling & Customization */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Live Subtitle Preview Box */}
            <div className="bg-black p-6 rounded-xl border border-[#222222] flex items-center justify-center min-h-[100px] relative overflow-hidden">
              <div
                style={{
                  fontSize: `${style.fontSize}px`,
                  color: style.color,
                  backgroundColor: `rgba(0, 0, 0, ${style.bgOpacity})`,
                  textShadow: style.shadow ? '2px 2px 4px rgba(0,0,0,0.9)' : 'none',
                  WebkitTextStroke: style.outline ? '1px black' : 'none'
                }}
                className="px-3 py-1 rounded font-sans text-center transition-all"
              >
                Sample Subtitle Preview (Big Buck Bunny)
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-neutral-300">
                <span className="flex items-center space-x-1">
                  <Type className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Font Size</span>
                </span>
                <span className="font-mono text-white">{style.fontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="36"
                value={style.fontSize}
                onChange={(e) => setStyle((s) => ({ ...s, fontSize: Number(e.target.value) }))}
                className="w-full accent-white h-2 bg-[#222222] rounded-lg cursor-pointer"
              />
            </div>

            {/* Vertical Screen Position */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-neutral-300">
                <span className="flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Vertical Position (From Bottom)</span>
                </span>
                <span className="font-mono text-white">{style.posY}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                value={style.posY}
                onChange={(e) => setStyle((s) => ({ ...s, posY: Number(e.target.value) }))}
                className="w-full accent-white h-2 bg-[#222222] rounded-lg cursor-pointer"
              />
            </div>

            {/* Colors & Options */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Text Color</label>
                <div className="flex space-x-2">
                  {['#FFFFFF', '#FFDD00', '#00FFCC', '#FF6699'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setStyle((s) => ({ ...s, color: c }))}
                      className="w-8 h-8 rounded-full border border-[#333333] shadow-md transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">
                  Background Opacity ({Math.round(style.bgOpacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={style.bgOpacity}
                  onChange={(e) => setStyle((s) => ({ ...s, bgOpacity: Number(e.target.value) }))}
                  className="w-full accent-white h-2 bg-[#222222] rounded-lg cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Online Subtitle Search */}
        {activeTab === 'online' && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Enter movie or show title (e.g. Big Buck Bunny)..."
                  value={onlineQuery}
                  onChange={(e) => setOnlineQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-[#222222] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
                />
              </div>
              <button
                onClick={handleOnlineSearch}
                disabled={isSearchingOnline}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                {isSearchingOnline ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-500">
                  Search OpenSubtitles / Subscene database for instant subtitle download.
                </div>
              ) : (
                searchResults.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 bg-[#141414] border border-[#222222] rounded-xl flex items-center justify-between hover:border-[#333333] transition-all"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-white">{res.name}</h5>
                      <p className="text-[10px] text-neutral-400">Language: {res.lang}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadOnlineSub(res)}
                      className="px-3 py-1 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-lg shadow-sm"
                    >
                      Download
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#1a1a1a]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
