import React from 'react';
import { X, Moon, Clock, Check } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleepMinutes: number | null;
  setSleepMinutes: (mins: number | null) => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  sleepMinutes,
  setSleepMinutes
}) => {
  if (!isOpen) return null;

  const timerOptions = [
    { label: 'Off (Disabled)', value: null },
    { label: '15 Minutes', value: 15 },
    { label: '30 Minutes', value: 30 },
    { label: '45 Minutes', value: 45 },
    { label: '60 Minutes (1 Hour)', value: 60 },
    { label: '90 Minutes', value: 90 },
    { label: '120 Minutes (2 Hours)', value: 120 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] text-white border border-[#262626]">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Playback Sleep Timer</h3>
              <p className="text-xs text-neutral-400">Auto Stop Video After Timer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-[#1a1a1a] hover:bg-[#262626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {timerOptions.map((opt, idx) => {
            const isSelected = sleepMinutes === opt.value;
            return (
              <div
                key={idx}
                onClick={() => {
                  setSleepMinutes(opt.value);
                  onClose();
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white text-black font-semibold border-white'
                    : 'bg-[#141414] border-[#222222] text-neutral-300 hover:bg-[#1f1f1f]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Clock className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-neutral-500'}`} />
                  <span className="text-xs">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-black" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
