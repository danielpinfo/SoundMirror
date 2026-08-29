// Holds state for audio-driven playback (scaffold)
export class PlaybackSession {
  audioUrl: string | null = null;
  setAudio(url: string | null) { this.audioUrl = url; }
}