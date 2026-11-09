/**
 * Synthesizes an emergency distress siren / audio beacon using the Web Audio API.
 * No external audio files or MP3 dependencies needed.
 */
class AudioBeaconSynthesizer {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isPlaying = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Starts a dual-tone European/US emergency wail siren
   */
  public startSiren(volume = 0.25) {
    if (this.isPlaying) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Gain node for smooth fade in
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.001, now);
    this.gainNode.gain.exponentialRampToValueAtTime(Math.min(volume, 0.4), now + 0.1);
    this.gainNode.connect(this.ctx.destination);

    // Main carrier oscillator (sawtooth/triangle blend for piercing emergency horn)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(750, now);

    // LFO to modulate the frequency up and down like an emergency siren
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(1.5, now); // 1.5 Hz cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, now); // sweep between 500Hz and 1000Hz

    this.lfo.connect(lfoGain);
    lfoGain.connect(this.osc1.frequency);

    this.osc1.connect(this.gainNode);

    this.osc1.start(now);
    this.lfo.start(now);
    this.isPlaying = true;
  }

  /**
   * Play a single standard emergency alert broadcast chirp (3 warning beeps)
   */
  public playAlertChirp() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(853, now); // EAS Dual-tone frequency 1
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  public stop() {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.gainNode) {
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    }

    setTimeout(() => {
      try {
        this.osc1?.stop();
        this.osc1?.disconnect();
        this.lfo?.stop();
        this.lfo?.disconnect();
        this.gainNode?.disconnect();
      } catch {
        // Safe disconnect cleanup
      }
      this.osc1 = null;
      this.lfo = null;
      this.gainNode = null;
      this.isPlaying = false;
    }, 120);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioBeacon = new AudioBeaconSynthesizer();
