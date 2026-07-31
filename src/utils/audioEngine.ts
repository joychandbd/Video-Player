export interface EqualizerBands {
  b60: number;   // Sub-bass
  b230: number;  // Bass
  b910: number;  // Mid
  b3600: number; // High Mid
  b14000: number;// Treble
}

export const EQUALIZER_PRESETS: Record<string, EqualizerBands> = {
  'Normal': { b60: 0, b230: 0, b910: 0, b3600: 0, b14000: 0 },
  'Bass Boost': { b60: 7, b230: 5, b910: 1, b3600: 0, b14000: -2 },
  'Vocal Booster': { b60: -3, b230: 1, b910: 6, b3600: 5, b14000: 2 },
  'Rock': { b60: 5, b230: 3, b910: -1, b3600: 3, b14000: 5 },
  'Pop': { b60: -1, b230: 2, b910: 5, b3600: 2, b14000: -1 },
  'Electronic': { b60: 6, b230: 4, b910: -2, b3600: 3, b14000: 6 },
};

class AudioEngineManager {
  private ctx: AudioContext | null = null;
  private sourceMap: WeakMap<HTMLMediaElement, MediaElementAudioSourceNode> = new WeakMap();
  private gainNode: GainNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private currentVideoEl: HTMLMediaElement | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public attachVideo(videoEl: HTMLMediaElement, volumeBoostPercent: number = 100, bands: EqualizerBands = EQUALIZER_PRESETS['Normal']) {
    try {
      this.initContext();
      if (!this.ctx) return;

      if (this.currentVideoEl === videoEl && this.gainNode && this.filters.length === 5) {
        // Already attached, update gain and filter values
        this.setVolumeBoost(volumeBoostPercent);
        this.setBands(bands);
        return;
      }

      this.currentVideoEl = videoEl;

      let source = this.sourceMap.get(videoEl);
      if (!source) {
        source = this.ctx.createMediaElementSource(videoEl);
        this.sourceMap.set(videoEl, source);
      } else {
        source.disconnect();
      }

      // Create Gain Node for 200% Super Boost
      this.gainNode = this.ctx.createGain();
      this.setVolumeBoost(volumeBoostPercent);

      // Create 5-band Equalizer filters
      const freqs = [60, 230, 910, 3600, 14000];
      const bandKeys: (keyof EqualizerBands)[] = ['b60', 'b230', 'b910', 'b3600', 'b14000'];

      this.filters = freqs.map((freq, idx) => {
        const filter = this.ctx!.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === freqs.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.0;
        }
        filter.frequency.value = freq;
        filter.gain.value = bands[bandKeys[idx]];
        return filter;
      });

      // Connect source -> gain -> filter0 -> filter1 -> filter2 -> filter3 -> filter4 -> destination
      let currentChain: AudioNode = source;
      currentChain.connect(this.gainNode);
      currentChain = this.gainNode;

      for (const filter of this.filters) {
        currentChain.connect(filter);
        currentChain = filter;
      }

      currentChain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('WebAudio API setup info:', e);
    }
  }

  public setVolumeBoost(percent: number) {
    if (this.gainNode) {
      // 100% = gain 1.0; 200% = gain 2.0
      const gainVal = Math.max(0, Math.min(percent / 100, 2.0));
      this.gainNode.gain.setValueAtTime(gainVal, this.ctx ? this.ctx.currentTime : 0);
    }
  }

  public setBands(bands: EqualizerBands) {
    if (this.filters.length === 5) {
      const bandKeys: (keyof EqualizerBands)[] = ['b60', 'b230', 'b910', 'b3600', 'b14000'];
      this.filters.forEach((filter, idx) => {
        const gainVal = bands[bandKeys[idx]] || 0;
        filter.gain.setValueAtTime(gainVal, this.ctx ? this.ctx.currentTime : 0);
      });
    }
  }
}

export const audioEngine = new AudioEngineManager();
