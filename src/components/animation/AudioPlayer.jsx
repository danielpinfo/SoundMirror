/**
 * AudioPlayer
 *
 * Thin wrapper around HTMLAudioElement.
 *
 * Current SoundMirror reference playback contract:
 * - Teaching speed is owned by TTS generation.
 * - Reference playback should normally use playbackRate 1.0.
 * - setPlaybackRate remains available for explicit callers, but should not be
 *   used to apply teaching speed downstream.
 * - Duration is raw media duration from the generated audio file.
 */

export class AudioPlayer {
  constructor({ playbackRate = null } = {}) {
    this._el = typeof window !== 'undefined' ? new Audio() : null;

    this._playbackRate = playbackRate;

    if (this._el) {
      this._el.crossOrigin = 'anonymous';
      this._el.preload = 'auto';
      this._el.playsInline = true;

      if (typeof playbackRate === 'number') {
        this._applyRate('constructor-init');
      }
    }
  }

  _applyRate(reason = 'unknown') {
    if (!this._el || typeof this._playbackRate !== 'number') return;
    this._el.playbackRate = this._playbackRate;
  }

  setPlaybackRate(rate) {
    this._playbackRate = rate;
    if (this._el) {
      this._applyRate('setPlaybackRate');
    }
  }

  setSource(url) {
    if (!this._el) return;

    this._el.src = url || '';

    if (url) {
      this._el.load();

      // Some browsers reset playbackRate on metadata load. Re-apply the
      // currently configured rate, which should normally be 1.0 for reference
      // playback.
      const onMeta = () => {
        this._applyRate('loadedmetadata');
      };
      this._el.addEventListener('loadedmetadata', onMeta, { once: true });
    }

    this._applyRate('setSource');
  }

  play() {
    this._applyRate('play:pre');
    return this._el?.play() ?? Promise.resolve();
  }

  pause() {
    this._el?.pause();
  }

  seek(timeSeconds) {
    if (this._el) {
      this._el.currentTime = timeSeconds;
    }
  }

  get currentTime() {
    return this._el?.currentTime ?? 0;
  }

  get duration() {
    return this._el?.duration ?? 0;
  }

  get paused() {
    return this._el?.paused ?? true;
  }

  addEventListener(event, cb) {
    this._el?.addEventListener(event, cb);
  }

  removeEventListener(event, cb) {
    this._el?.removeEventListener(event, cb);
  }
}