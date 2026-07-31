import React from 'react';
import { X, Volume2, Sliders, Check, VolumeX } from 'lucide-react';
import { EqualizerBands, EQUALIZER_PRESETS } from '../utils/audioEngine';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  volumeBoost: number;
  setVolumeBoost: (v: number) => void;
  selectedPreset: string;
  setSelectedPreset: (preset: string) => void;
  bands: EqualizerBands;
  setBands: (bands: EqualizerBands) => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  volumeBoost,
  setVolumeBoost,
  selectedPreset,
  setSelectedPreset,
  bands,
  setBands
}) => {
  if (!isOpen) return null;

  const bandLabels = [
    { key: 'b60' as keyof EqualizerBands, label: '60 Hz', desc: 'Sub-Bass' },
    { key: 'b230' as keyof EqualizerBands, label: '230 Hz', desc: 'Bass' },
    { key: 'b910' as keyof EqualizerBands, label: '910 Hz', desc: 'Mid' },
    { key: 'b3600' as keyof EqualizerBands, label: '3.6 kHz', desc: 'High Mid' },
    { key: 'b14000' as keyof EqualizerBands, label: '14 kHz', desc: 'Treble' }
  ];

  const handleBandChange = (key: keyof EqualizerBands, val: number) => {
    setSelectedPreset('Custom');
    setBands({
      ...bands,
      [key]: val
    });
  };

  const handleSelectPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    if (EQUALIZER_PRESETS[presetName]) {
      setBands({ ...EQUALIZER_PRESETS[presetName] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] text-white border border-[#262626]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Audio Equalizer & 200% Boost</h3>
              <p className="text-xs text-neutral-400">Web Audio API Hardware Amplification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-[#1a1a1a] hover:bg-[#262626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 200% Volume Boost Slider */}
        <div className="bg-[#141414] border border-[#222222] p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-semibold text-neutral-200">
              {volumeBoost > 100 ? (
                <Volume2 className="w-4 h-4 text-white animate-pulse" />
              ) : volumeBoost === 0 ? (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
              <span>Volume Gain (Up to 200%)</span>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                volumeBoost > 100
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#222222] text-neutral-300'
              }`}
            >
              {volumeBoost}% {volumeBoost > 100 ? ' (SUPER BOOST)' : ''}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="200"
            value={volumeBoost}
            onChange={(e) => setVolumeBoost(Number(e.target.value))}
            className="w-full accent-white h-2 bg-[#222222] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
            <span>0% Mute</span>
            <span>100% Normal</span>
            <span className="text-white font-bold">200% Max Boost</span>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Equalizer Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(EQUALIZER_PRESETS).map((p) => (
              <button
                key={p}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedPreset === p
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-[#141414] text-neutral-300 hover:bg-[#1f1f1f] border border-[#222222]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Band Sliders */}
        <div className="grid grid-cols-5 gap-3 pt-2">
          {bandLabels.map((b) => {
            const currentGain = bands[b.key] || 0;
            return (
              <div key={b.key} className="flex flex-col items-center space-y-2">
                <span className="text-[10px] font-mono text-neutral-300 font-semibold">
                  {currentGain > 0 ? `+${currentGain}` : currentGain} dB
                </span>

                <div className="h-32 flex items-center justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={currentGain}
                    onChange={(e) => handleBandChange(b.key, Number(e.target.value))}
                    className="h-28 accent-white bg-[#222222] rounded-lg cursor-pointer transform -rotate-90 origin-center"
                    style={{ width: '112px' }}
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-white">{b.label}</p>
                  <p className="text-[9px] text-neutral-500 truncate">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#1a1a1a]">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
