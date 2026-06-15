class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmNodes = null;
    this.bgmPlaying = false;
    this.bgmMuted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playLaser() {
    if (this.muted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }

  playScore() {
    if (this.muted) return;
    try {
      this.init();
      // Magical girl sparkle / cute victory chime
      const notes = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const startTime = this.ctx.currentTime + (i * 0.08);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.05, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }

  playExplosion() {
    // We repurpose explosion to be a cute poof
    if (this.muted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }

  playPowerup() {
    if (this.muted) return;
    try {
      this.init();
      // Super cute ascending glissando "pyuu-in~!"
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }

  playClick() {
    if (this.muted) return;
    try {
      this.init();
      // Cute hollow "bloop" (like picking up a ball)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }

  playWaterPour() {
    if (this.muted) return;
    try {
      this.init();
      // Cute bubbling sound "blub-blub-blub"
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        // Random cute high pitch bubble
        const freq = 600 + Math.random() * 400;
        const startTime = this.ctx.currentTime + (i * 0.08);
        
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq + 300, startTime + 0.05);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.05, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);
        
        osc.start(startTime);
        osc.stop(startTime + 0.06);
      }
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }

  playBallDrop() {
    if (this.muted) return;
    try {
      this.init();
      
      const playTok = (time, baseVol, freqStart = 800, freqEnd = 150) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        // A mix of sine and square for a hard plastic "tok"
        osc.type = 'square';
        
        // Fast pitch drop
        osc.frequency.setValueAtTime(freqStart, time);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, time + 0.03);
        
        // Extremely fast volume envelope (percussive)
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(baseVol, time + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        
        // Lowpass filter to remove harsh high frequencies
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, time);
        filter.frequency.exponentialRampToValueAtTime(300, time + 0.03);
        
        osc.disconnect();
        osc.connect(filter);
        filter.connect(gain);
        
        osc.start(time);
        osc.stop(time + 0.03);
      };

      const now = this.ctx.currentTime;
      
      // Main impact
      playTok(now, 0.15, 900, 150);
      
      // Rapid rattles (bounces)
      playTok(now + 0.05, 0.05, 1000, 200);
      playTok(now + 0.08, 0.02, 1100, 250);

    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }

  playTubeComplete() {
    if (this.muted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      
      const playBell = (freq, time, vol) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
        
        osc.start(time);
        osc.stop(time + 0.8);
      };

      // Natural, pleasant glass harmonic chord (E major)
      playBell(659.25, now, 0.08); // E5
      playBell(830.61, now + 0.03, 0.06); // G#5
      playBell(987.77, now + 0.06, 0.06); // B5
      playBell(1318.51, now + 0.09, 0.08); // E6
      
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }

  // ── Ambient BGM Pad ──────────────────────────────────────────────
  startBGM() {
    if (this.bgmPlaying || this.bgmMuted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;

      // Master gain for the entire BGM
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.035, now + 3); // Slow fade in
      masterGain.connect(this.ctx.destination);

      // Low-pass filter with slow LFO modulation
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.Q.setValueAtTime(2, now);
      filter.connect(masterGain);

      // LFO to modulate filter cutoff (breathing effect)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.08, now); // Very slow: ~8 second cycle
      lfoGain.gain.setValueAtTime(200, now); // Modulation depth
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);

      // Chord: C3, E3, G3, B3 (Cmaj7) — warm, dreamy
      const freqs = [130.81, 164.81, 196.00, 246.94];
      const oscillators = [];

      freqs.forEach((freq, i) => {
        // Each note uses 2 slightly detuned oscillators for richness
        for (let d = 0; d < 2; d++) {
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq + (d === 0 ? -0.5 : 0.5), now);
          oscGain.gain.setValueAtTime(0.15, now);
          osc.connect(oscGain);
          oscGain.connect(filter);
          osc.start(now);
          oscillators.push({ osc, gain: oscGain });
        }
      });

      this.bgmNodes = { masterGain, filter, lfo, lfoGain, oscillators };
      this.bgmPlaying = true;
    } catch (e) {
      console.warn('BGM start failed', e);
    }
  }

  stopBGM() {
    if (!this.bgmPlaying || !this.bgmNodes) return;
    try {
      const now = this.ctx.currentTime;
      // Fade out over 2 seconds
      this.bgmNodes.masterGain.gain.linearRampToValueAtTime(0, now + 2);

      // Clean up after fade
      setTimeout(() => {
        try {
          this.bgmNodes.oscillators.forEach(({ osc }) => osc.stop());
          this.bgmNodes.lfo.stop();
        } catch (_) { /* already stopped */ }
        this.bgmNodes = null;
        this.bgmPlaying = false;
      }, 2500);
    } catch (e) {
      console.warn('BGM stop failed', e);
    }
  }

  toggleBGM() {
    if (this.bgmPlaying) {
      this.stopBGM();
      this.bgmMuted = true;
    } else {
      this.bgmMuted = false;
      this.startBGM();
    }
    return !this.bgmMuted;
  }

  // ── Shake / Invalid Move ──────────────────────────────────────────
  playShake() {
    if (this.muted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('Shake sound failed', e);
    }
  }

  // ── Progress Chime (tube getting close to completion) ─────────────
  playProgressChime(progress) {
    // progress: 0-1, how full is the tube with same-color balls
    if (this.muted || progress < 0.5) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const freq = 800 + progress * 600; // Higher pitch as progress increases

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Progress chime failed', e);
    }
  }

  // ── Wind Breeze ──────────────────────────────────────────────
  playWind() {
    if (this.muted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const duration = 4.0;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      
      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      // Animate filter frequency to create a "whoosh" wind sound
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration / 2);
      filter.frequency.exponentialRampToValueAtTime(100, now + duration);
      filter.Q.value = 1.5;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + duration / 3);
      gain.gain.linearRampToValueAtTime(0, now + duration);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start(now);
    } catch (e) {
      console.warn('Wind sound failed', e);
    }
  }
}

export const sound = new SoundController();
