/**
 * Feedo Delivery Partner — Incoming Order Alert Service
 * 
 * Provides loud, attention-grabbing sound and vibration alerting for incoming orders:
 * - Synthesizes loud dual-tone alert pulses using Web Audio API (zero external asset dependency)
 * - Vibrates mobile devices using navigator.vibrate
 * - Auto-terminates after 30 seconds maximum
 * - Immediately stops on accept, decline, expire, or modal close
 * - Prevents multiple alert instances from overlapping
 * - Cleans up all audio contexts and vibration timers to protect battery life
 * - Provides graceful fallback when sound/vibration is restricted by browser policy
 */

class OrderAlertService {
  private audioCtx: AudioContext | null = null;
  private isAlerting: boolean = false;
  private autoStopTimer: ReturnType<typeof setTimeout> | null = null;
  private pulseInterval: ReturnType<typeof setInterval> | null = null;
  private vibrationInterval: ReturnType<typeof setInterval> | null = null;
  private isMutedByBrowser: boolean = false;
  private statusListeners: Set<(isAlerting: boolean, isMuted: boolean) => void> = new Set();

  constructor() {
    // AudioContext will be initialized lazily on user gesture / offer trigger
  }

  public subscribe(callback: (isAlerting: boolean, isMuted: boolean) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.isAlerting, this.isMutedByBrowser);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.statusListeners.forEach((cb) => {
      try {
        cb(this.isAlerting, this.isMutedByBrowser);
      } catch {
        // Safe subscriber error boundary
      }
    });
  }

  /**
   * Starts a loud incoming order alert with synchronized vibration.
   * Auto-stops after max 30 seconds (30,000 ms).
   */
  public startAlert(maxDurationMs: number = 30000): void {
    // 1. Clean up any existing alert first to prevent sound/vibration overlap
    this.stopAlert();

    this.isAlerting = true;
    this.isMutedByBrowser = false;
    this.notifyListeners();

    // 2. Start Web Audio chime sequence
    this.startAudioLoop();

    // 3. Start Device Vibration (if supported by hardware/browser)
    this.startVibrationLoop();

    // 4. Set 30-second maximum timeout
    this.autoStopTimer = setTimeout(() => {
      this.stopAlert();
    }, maxDurationMs);
  }

  /**
   * Stops all alert sound, vibration, and timers immediately.
   */
  public stopAlert(): void {
    this.isAlerting = false;

    // Clear auto-stop timer
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }

    // Clear audio repeat interval
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }

    // Clear vibration repeat interval
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }

    // Stop device vibration
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {
        // Ignore vibration cancellation errors
      }
    }

    // Suspend or close audio context cleanly
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close().catch(() => {});
      } catch {
        // Ignore audio close errors
      }
      this.audioCtx = null;
    }

    this.notifyListeners();
  }

  /**
   * Generates loud, urgent multi-tone alert pulses using Web Audio API.
   * Alternates high-frequency tones (880 Hz / 1760 Hz) designed to be audible in noisy environments.
   */
  private startAudioLoop(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        this.isMutedByBrowser = true;
        this.notifyListeners();
        return;
      }

      this.audioCtx = new AudioContextClass();

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {
          this.isMutedByBrowser = true;
          this.notifyListeners();
        });
      }

      // Play initial loud pulse immediately
      this.playDualChimePulse();

      // Repeat loud alert pulse every 1.2 seconds for up to 30 seconds
      this.pulseInterval = setInterval(() => {
        if (!this.isAlerting) return;
        this.playDualChimePulse();
      }, 1200);
    } catch {
      this.isMutedByBrowser = true;
      this.notifyListeners();
    }
  }

  private playDualChimePulse(): void {
    if (!this.audioCtx || this.audioCtx.state === 'closed') return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Master Gain for maximum attention-grabbing volume (clamped to safe ceiling)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.85, now);
      masterGain.connect(ctx.destination);

      // Tone 1: 880 Hz (A5 - loud punchy primary wave)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.18);
      gain1.gain.setValueAtTime(0.9, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.24);

      // Tone 2: 1760 Hz (A6 - sharp high chime for penetration through street noise)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1980, now + 0.32);
      gain2.gain.setValueAtTime(0.0, now);
      gain2.gain.setValueAtTime(0.9, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.40);

      // Tone 3: Urgent double beep
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(1320, now + 0.45);
      gain3.gain.setValueAtTime(0.5, now + 0.45);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
      osc3.connect(gain3);
      gain3.connect(masterGain);
      osc3.start(now + 0.45);
      osc3.stop(now + 0.68);
    } catch {
      // Audio playback interrupted
    }
  }

  /**
   * Triggers device vibration pattern.
   * Pattern: 400ms vibrate, 150ms pause, 400ms vibrate, 150ms pause, 600ms vibrate
   */
  private startVibrationLoop(): void {
    if (typeof window === 'undefined' || !('navigator' in window) || !('vibrate' in navigator)) {
      return;
    }

    const pattern = [400, 150, 400, 150, 600];

    try {
      navigator.vibrate(pattern);

      // Repeat vibration pattern every 2.2 seconds
      this.vibrationInterval = setInterval(() => {
        if (!this.isAlerting) return;
        try {
          navigator.vibrate(pattern);
        } catch {
          // Ignore vibration errors
        }
      }, 2200);
    } catch {
      // Vibration not permitted or device has no haptics
    }
  }

  /**
   * Allows user interaction to unlock audio if initially blocked by browser autoplay policy.
   */
  public attemptUnmute(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().then(() => {
        this.isMutedByBrowser = false;
        this.notifyListeners();
        this.playDualChimePulse();
      }).catch(() => {});
    } else if (this.isAlerting) {
      this.startAudioLoop();
    }
  }

  public getIsAlerting(): boolean {
    return this.isAlerting;
  }

  public getIsMutedByBrowser(): boolean {
    return this.isMutedByBrowser;
  }
}

export const orderAlertService = new OrderAlertService();
