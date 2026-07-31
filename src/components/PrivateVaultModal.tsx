import React, { useState } from 'react';
import { X, Lock, Unlock, ShieldAlert, Eye, Play, Trash2 } from 'lucide-react';
import { VideoItem } from '../types';
import { formatTime } from '../utils/subtitleParser';

interface PrivateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultVideos: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onRemoveFromVault: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
}

export const PrivateVaultModal: React.FC<PrivateVaultModalProps> = ({
  isOpen,
  onClose,
  vaultVideos,
  onPlayVideo,
  onRemoveFromVault,
  onDeleteVideo
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const DEFAULT_PIN = '1234';

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEFAULT_PIN) {
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect PIN. Default PIN is 1234.');
    }
  };

  const handleClose = () => {
    setIsUnlocked(false);
    setPinInput('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] text-white border border-[#262626]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Private Security Vault</h3>
              <p className="text-xs text-neutral-400">PIN Protected Encrypted Media Storage</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-[#1a1a1a] hover:bg-[#262626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isUnlocked ? (
          /* PIN Verification Form */
          <form onSubmit={handleVerifyPin} className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#141414] border border-[#262626] flex items-center justify-center text-white">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Enter Security PIN</h4>
              <p className="text-xs text-neutral-400">Enter your 4-digit vault passcode to view hidden files</p>
            </div>

            <div className="max-w-xs mx-auto">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="• • • •"
                className="w-full text-center tracking-[1em] font-mono text-2xl py-3 bg-[#141414] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-neutral-400"
              />
            </div>

            {errorMsg && <p className="text-xs text-neutral-300 font-medium">{errorMsg}</p>}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full max-w-xs py-3 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Private Vault</span>
              </button>
            </div>

            <p className="text-[10px] text-neutral-500 italic">Hint: Default passcode is 1234</p>
          </form>
        ) : (
          /* Vault Unlocked Content */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Hidden Files: {vaultVideos.length}</span>
              <span className="text-white font-medium flex items-center space-x-1">
                <Unlock className="w-3 h-3" />
                <span>Vault Unlocked</span>
              </span>
            </div>

            {vaultVideos.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 text-xs">
                No private videos stored in vault yet. Select any video in your media library and tap "Move to Vault".
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                {vaultVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-3 bg-[#141414] border border-[#222222] rounded-xl flex items-center justify-between hover:border-[#333333] transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        onClick={() => {
                          handleClose();
                          onPlayVideo(vid);
                        }}
                        className="w-16 aspect-video bg-[#050505] rounded-lg overflow-hidden cursor-pointer relative flex-shrink-0"
                      >
                        {vid.poster && <img src={vid.poster} alt={vid.title} className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-current" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-semibold text-white truncate">{vid.title}</h5>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {vid.size} • {formatTime(vid.duration)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => {
                          handleClose();
                          onPlayVideo(vid);
                        }}
                        title="Play Video"
                        className="p-2 text-neutral-300 hover:text-white hover:bg-[#222222] rounded-xl"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onRemoveFromVault(vid.id)}
                        title="Unhide / Move back to Library"
                        className="p-2 text-neutral-300 hover:text-white hover:bg-[#222222] rounded-xl"
                      >
                        <Unlock className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteVideo(vid.id)}
                        title="Delete Permanently"
                        className="p-2 text-neutral-400 hover:text-white hover:bg-[#222222] rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
