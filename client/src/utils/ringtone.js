// Web Audio API Ringtone Generator for Incoming & Outgoing Calls

class RingtoneManager {
  constructor() {
    this.audioCtx = null;
    this.osc1 = null;
    this.osc2 = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.intervalId = null;
  }

  startRingtone(type = "incoming") {
    if (this.isPlaying) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.isPlaying = true;

      const playToneBurst = () => {
        if (!this.isPlaying || !this.audioCtx) return;

        // Frequencies for telephone ringtone (440Hz + 480Hz)
        const freq1 = type === "incoming" ? 440 : 400;
        const freq2 = type === "incoming" ? 480 : 450;

        this.osc1 = this.audioCtx.createOscillator();
        this.osc2 = this.audioCtx.createOscillator();
        this.gainNode = this.audioCtx.createGain();

        this.osc1.type = "sine";
        this.osc2.type = "sine";
        this.osc1.frequency.setValueAtTime(freq1, this.audioCtx.currentTime);
        this.osc2.frequency.setValueAtTime(freq2, this.audioCtx.currentTime);

        this.gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.8);

        this.osc1.connect(this.gainNode);
        this.osc2.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);

        this.osc1.start(this.audioCtx.currentTime);
        this.osc2.start(this.audioCtx.currentTime);
        this.osc1.stop(this.audioCtx.currentTime + 1.8);
        this.osc2.stop(this.audioCtx.currentTime + 1.8);
      };

      playToneBurst();
      this.intervalId = setInterval(playToneBurst, 3000);
    } catch (err) {
      console.error("Failed to start ringtone audio:", err);
    }
  }

  stopRingtone() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (err) {}
      this.audioCtx = null;
    }
  }
}

export const ringtoneManager = new RingtoneManager();
