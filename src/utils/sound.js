class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmMuted = false;
    this.bgmAudio = null;
    this.bgmFadeInterval = null;
    this.bgmTargetVolume = .05;

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.bgmAudio) {
            this.bgmAudio.pause();
          }
        } else {
          if (this.bgmPlaying && !this.bgmMuted && this.bgmAudio) {
            this.bgmAudio.play().catch(e => console.warn('BGM resume blocked', e));
          }
        }
      });
    }
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.bgmAudio) {
      const basePath = window.location.pathname.split('/')[1];
      this.bgmAudio = new Audio(`/${basePath ? basePath + "/" : ""}bgm.mp3`);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0; // Prepare for smooth fade in
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

  // ── Ambient BGM: MP3 File ──────────────────────────────────────────────
  startBGM() {
    if (this.bgmPlaying || this.bgmMuted) return;
    try {
      this.init();
      this.bgmPlaying = true;

      if (this.bgmFadeInterval) {
        clearInterval(this.bgmFadeInterval);
        this.bgmFadeInterval = null;
      }

      this.bgmAudio.play().catch(e => {
        console.warn('Autoplay blocked for BGM:', e);
        this.bgmPlaying = false; // Reset state if blocked by browser
      });

      // Smooth fade in over ~2 seconds
      let vol = this.bgmAudio.volume;
      this.bgmFadeInterval = setInterval(() => {
        vol = Math.min(this.bgmTargetVolume, vol + 0.05); // Target volume dynamic
        this.bgmAudio.volume = vol;
        if (vol >= this.bgmTargetVolume) {
          clearInterval(this.bgmFadeInterval);
          this.bgmFadeInterval = null;
        }
      }, 100);

    } catch (e) {
      console.warn('BGM start failed', e);
    }
  }

  setBgmVolume(vol) {
    this.bgmTargetVolume = vol;
    if (this.bgmAudio && this.bgmPlaying && !this.bgmMuted) {
      this.bgmAudio.volume = vol;
    }
  }

  stopBGM() {
    if (!this.bgmPlaying || !this.bgmAudio) return;
    try {
      this.bgmPlaying = false;

      if (this.bgmFadeInterval) {
        clearInterval(this.bgmFadeInterval);
        this.bgmFadeInterval = null;
      }

      // Smooth fade out over ~1.5 seconds
      let vol = this.bgmAudio.volume;
      this.bgmFadeInterval = setInterval(() => {
        vol = Math.max(0, vol - 0.05);
        this.bgmAudio.volume = vol;
        if (vol <= 0) {
          clearInterval(this.bgmFadeInterval);
          this.bgmFadeInterval = null;
          this.bgmAudio.pause();
        }
      }, 100);

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
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, this.ctx.currentTime); // Raised frequency for laptop speakers
      osc.frequency.linearRampToValueAtTime(160, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime); // Increased gain
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Shake sound failed', e);
    }
  }

  // ── Blocked Board Alarm ──────────────────────────────────────────
  playBlockedAlert() {
    if (this.muted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;

      const playChime = (freq, time, vol) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.start(time);
        osc.stop(time + 0.35);
      };

      playChime(587.33, now, 0.03); // D5
      playChime(880.00, now + 0.1, 0.02); // A5 (a gentle fifth higher)
    } catch (e) {
      console.warn('Blocked alert sound failed', e);
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
      filter.frequency.exponentialRampToValueAtTime(600, now + duration / 2);
      filter.frequency.exponentialRampToValueAtTime(100, now + duration);
      filter.Q.value = 1.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.012, now + duration / 3);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {
      console.warn('Wind sound failed', e);
    }
  }

  // ── Addictive Sudoku Success Chime ─────────────────────────────
  playSudokuSuccess() {
    if (this.muted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;

      // Helper function to play a sweet sine chime
      const playChime = (freq, time, duration, vol = 0.05) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.start(time);
        osc.stop(time + duration);
      };

      // 1. Instantly play a juicy, rounded bubble "pop" sweep
      const oscPop = this.ctx.createOscillator();
      const gainPop = this.ctx.createGain();
      oscPop.connect(gainPop);
      gainPop.connect(this.ctx.destination);
      oscPop.type = 'sine';
      oscPop.frequency.setValueAtTime(280, now);
      oscPop.frequency.exponentialRampToValueAtTime(950, now + 0.065);
      gainPop.gain.setValueAtTime(0, now);
      gainPop.gain.linearRampToValueAtTime(0.07, now + 0.012);
      gainPop.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      oscPop.start(now);
      oscPop.stop(now + 0.065);

      // 2. Play a rapid, magical, ascending E-Major pentatonic cascade starting just as the pop peaks
      playChime(659.25, now + 0.04, 0.35, 0.04);  // E5
      playChime(830.61, now + 0.09, 0.42, 0.04);  // G#5
      playChime(987.77, now + 0.14, 0.50, 0.04);  // B5
      playChime(1318.51, now + 0.19, 0.62, 0.05); // E6

    } catch (e) {
      console.warn("Sudoku success sound play failed", e);
    }
  }

  // ── Bubble Cool Sounds ──────────────────────────────────────────
  playBubbleShoot() {
    if (this.muted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Bubble shoot sound failed", e);
    }
  }

  playBubblePop(comboIndex = 0) {
    if (this.muted) return;
    try {
      this.init();
      const baseFreq = 520 + Math.min(12, comboIndex) * 75;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      console.warn("Bubble pop sound failed", e);
    }
  }

  playBubbleBounce() {
    if (this.muted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("Bubble bounce sound failed", e);
    }
  }

  playBubbleDrop() {
    if (this.muted) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const freq = 400 + Math.random() * 300;
        const time = now + (i * 0.05);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq - 150, time + 0.08);

        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        osc.start(time);
        osc.stop(time + 0.08);
      }
    } catch (e) {
      console.warn("Bubble drop sound failed", e);
    }
  }

  playBubbleRowDrop() {
    if (this.muted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Bubble row drop sound failed", e);
    }
  }
}

export const sound = new SoundController();
