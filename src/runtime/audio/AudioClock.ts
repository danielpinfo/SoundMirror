// Audio master clock — thin adapter
import { AudioPlayer } from './AudioPlayer.js';

export class AudioClock {
  constructor(private player: AudioPlayer) {}
  nowMs() { return Math.max(0, Math.round((this.player?.currentTime ?? 0) * 1000)); }
  durationMs() { return Math.max(0, Math.round((this.player?.duration ?? 0) * 1000)); }
}