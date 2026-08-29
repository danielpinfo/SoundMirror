/**
 * PracticeReplayEngine
 *
 * Drives replay of a stored practice session.
 *
 * Pipeline:
 *   load session
 *   → audio playback (HTMLAudioElement)
 *   → correct articulation timeline  (from phonemeTimeline + articulationMap)
 *   → user articulation timeline     (estimated from video feature data)
 *   → dual animation frame streams   (via onCorrectFrame / onUserFrame callbacks)
 *
 * Usage:
 *   const engine = new PracticeReplayEngine(session, articulationMap);
 *   engine.onCorrectFrame = (frame) => { ... }
 *   engine.onUserFrame    = (frame) => { ... }
 *   engine.onProgress     = (posMs)  => { ... }
 *   engine.onComplete     = ()       => { ... }
 *   engine.load();
 *   engine.play();
 *   engine.pause();
 *   engine.seek(ms);
 *   engine.dispose();
 */

export class PracticeReplayEngine {
  /**
   * @param {object} session        — loaded from SessionManager.loadSession()
   * @param {object} articulationMap — from PluginContext
   */
  constructor(session, articulationMap) {
    this._session         = session;
    this._articulationMap = articulationMap;

    // Build phoneme → frame index lookup from articulationMap
    this._phonemeToFrame = {};
    for (const frame of (articulationMap?.frames ?? [])) {
      for (const ph of (frame.phonemes ?? [])) {
        this._phonemeToFrame[ph] = frame.index;
      }
    }

    // Precompute correct articulation timeline: [{start, end, frame}] in ms
    this._correctTimeline = this._buildCorrectTimeline(session.phonemeTimeline ?? []);

    // Precompute user articulation timeline from video features
    this._userTimeline = this._buildUserTimeline(session.videoTimeline ?? []);

    // Audio element
    this._audio = null;
    this._rafId = null;
    this._startedAt = null;

    // Public callbacks
    this.onCorrectFrame = null;
    this.onUserFrame    = null;
    this.onProgress     = null;
    this.onComplete     = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Prepare audio blob for playback. */
  load() {
    if (this._session.audioBlob) {
      const url = URL.createObjectURL(this._session.audioBlob);
      this._audio = new Audio(url);
      this._audio.preload = 'auto';
      this._audio.onended = () => this._handleComplete();
    }
  }

  play() {
    this._audio?.play();
    this._startRAF();
  }

  pause() {
    this._audio?.pause();
    this._stopRAF();
  }

  seek(ms) {
    if (this._audio) this._audio.currentTime = ms / 1000;
  }

  get currentMs() {
    return (this._audio?.currentTime ?? 0) * 1000;
  }

  get duration() {
    if (this._audio?.duration && isFinite(this._audio.duration)) return this._audio.duration * 1000;
    if (this._correctTimeline.length) return this._correctTimeline[this._correctTimeline.length - 1].end;
    return 0;
  }

  dispose() {
    this._stopRAF();
    if (this._audio) {
      this._audio.pause();
      if (this._audio.src) URL.revokeObjectURL(this._audio.src);
      this._audio = null;
    }
  }

  // ---------------------------------------------------------------------------
  // RAF loop — resolves frame state at audio clock position
  // ---------------------------------------------------------------------------

  _startRAF() {
    this._stopRAF();
    const tick = () => {
      const posMs = this.currentMs;
      const correctFrame = this._resolveFrame(this._correctTimeline, posMs);
      const userFrame    = this._resolveFrame(this._userTimeline,    posMs);

      if (correctFrame !== this._lastCorrect) {
        this._lastCorrect = correctFrame;
        this.onCorrectFrame?.(correctFrame);
      }
      if (userFrame !== this._lastUser) {
        this._lastUser = userFrame;
        this.onUserFrame?.(userFrame);
      }
      this.onProgress?.(posMs);
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _stopRAF() {
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
  }

  _handleComplete() {
    this._stopRAF();
    this.onComplete?.();
  }

  // ---------------------------------------------------------------------------
  // Timeline builders
  // ---------------------------------------------------------------------------

  _buildCorrectTimeline(phonemeTimeline) {
    return phonemeTimeline.map(p => ({
      start: p.start * 1000,
      end:   p.end   * 1000,
      frame: this._phonemeToFrame[p.phoneme] ?? 0,
    }));
  }

  _buildUserTimeline(videoTimeline) {
    // Convert video feature snapshots → estimated articulation frames
    return videoTimeline.map(v => ({
      start: v.time,
      end:   v.time + 50,   // ~20fps window
      frame: estimateFrameFromFeatures(v.features),
    }));
  }

  // ---------------------------------------------------------------------------
  // Frame resolver
  // ---------------------------------------------------------------------------

  _resolveFrame(timeline, posMs) {
    if (!timeline.length) return 0;
    for (let i = 0; i < timeline.length; i++) {
      if (posMs <= timeline[i].end) return timeline[i].frame;
    }
    return timeline[timeline.length - 1].frame;
  }
}

// ---------------------------------------------------------------------------
// Feature → frame estimator (language-agnostic biomechanical heuristics)
// ---------------------------------------------------------------------------

/**
 * Map articulatory features to an estimated animation frame index.
 * Frame indices match the universal articulation map in PluginLoader.
 */
export function estimateFrameFromFeatures(features = {}) {
  const { lip_closure = 0, lip_rounding = 0, lip_spread = 0, mouth_open = 0 } = features;

  if (lip_closure > 0.75)                          return 8;  // bilabial
  if (lip_rounding > 0.6 && mouth_open > 0.4)      return 5;  // rounded_vowel_oo
  if (lip_rounding > 0.55)                         return 4;  // rounded_vowel_ue
  if (mouth_open > 0.75)                           return 1;  // open_vowel
  if (mouth_open > 0.5)                            return 2;  // mid_vowel
  if (lip_spread > 0.65)                           return 3;  // front_vowel
  if (lip_spread > 0.5 && mouth_open < 0.3)        return 11; // alveolar_fricative
  if (mouth_open > 0.3)                            return 2;  // mid_vowel
  return 0; // neutral
}