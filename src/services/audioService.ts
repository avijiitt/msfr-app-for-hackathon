class AudioService {
  private ctx: AudioContext | null = null;
  private sirenOsc1: OscillatorNode | null = null;
  private sirenOsc2: OscillatorNode | null = null;
  private isSirenPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSuccessChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Ignore audio autoplay restrictions
    }
  }

  public playAlertWarning() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      osc.frequency.setValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore
    }
  }

  public playStationChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [440, 554.37, 659.25]; // A4, C#5, E5
      
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.15);
        gain.gain.setValueAtTime(0.15, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.6);
      });
    } catch {
      // Ignore
    }
  }

  public startSiren() {
    try {
      this.initContext();
      if (!this.ctx || this.isSirenPlaying) return;
      this.isSirenPlaying = true;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      const now = this.ctx.currentTime;
      osc1.frequency.setValueAtTime(600, now);
      osc2.frequency.setValueAtTime(850, now);

      gain.gain.setValueAtTime(0.35, now);

      // LFO modulation
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 1.5; // 1.5 Hz warble
      lfoGain.gain.value = 300;

      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);
      lfo.start();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.sirenOsc1 = osc1;
      this.sirenOsc2 = osc2;
    } catch {
      // Ignore
    }
  }

  public stopSiren() {
    if (this.sirenOsc1) {
      try { this.sirenOsc1.stop(); this.sirenOsc1.disconnect(); } catch {}
      this.sirenOsc1 = null;
    }
    if (this.sirenOsc2) {
      try { this.sirenOsc2.stop(); this.sirenOsc2.disconnect(); } catch {}
      this.sirenOsc2 = null;
    }
    this.isSirenPlaying = false;
  }
}

export const audioService = new AudioService();
