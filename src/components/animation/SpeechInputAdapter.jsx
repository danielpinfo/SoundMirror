/**
 * SpeechInputAdapter
 *
 * Converts phoneme timing data (supplied by SoundMirror) into an articulation
 * timeline compatible with SpriteAnimationEngine.
 *
 * Input:  Array<{ phoneme: string, start: number, end: number }>  (seconds)
 * Output: Array<{ frame: number, start: number, end: number }>    (milliseconds)
 *
 * Neutral frames (index 0) are automatically prepended and appended.
 * No speech recognition or TTS is performed here.
 */

// ---------------------------------------------------------------------------
// Phoneme → frame index map (derived from articulation_frames.json)
// ---------------------------------------------------------------------------
const PHONEME_TO_FRAME = {
  // Vowels
  'a':  1, 'ah': 1,
  'e':  2, 'eh': 2,
  'ee': 3, 'i':  3,
  'ue': 4,
  'oo': 5, 'u':  5,
  // Velar stop
  'k':  6, 'g':  6, 'c':  6, 'q':  6,
  // Alveolar stop
  't':  7, 'd':  7,
  // Bilabial
  'b':  8, 'p':  8, 'm':  8,
  // Alveolar nasal
  'n':  9,
  // Velar nasal
  'ng': 10,
  // Alveolar fricative
  's':  11, 'z': 11,
  // Postalveolar fricative
  'sh': 12, 'zh': 12,
  // Dental fricative
  'th': 13,
  // Labiodental fricative
  'f':  14, 'v': 14,
  // Affricate
  'ch': 15, 'j': 15,
  // Glottal
  'h':  16,
  // Rhotic
  'r':  17,
  // Lateral
  'l':  18,
  // Glide
  'y':  19, 'w': 19,
};

/** Resolve phoneme string to a frame index (0 = neutral fallback). */
function phonemeToFrame(phoneme) {
  const p = phoneme.toLowerCase().trim();
  return PHONEME_TO_FRAME[p] ?? 0;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

/**
 * Convert SoundMirror phoneme timings into an articulation timeline.
 *
 * @param {Array<{phoneme: string, start: number, end: number}>} phonemeTimings
 *   Phoneme events in seconds.
 * @returns {Array<{frame: number, start: number, end: number}>}
 *   Timeline entries in milliseconds, with neutral lead-in and lead-out.
 */
export function adaptPhonemeTimings(phonemeTimings) {
  if (!phonemeTimings || phonemeTimings.length === 0) {
    return [{ frame: 0, start: 0, end: 100 }];
  }

  // Sort by start time (defensive — SoundMirror should already order these)
  const sorted = [...phonemeTimings].sort((a, b) => a.start - b.start);

  const firstStartMs = sorted[0].start * 1000;
  const lastEndMs    = sorted[sorted.length - 1].end * 1000;

  const timeline = [];

  // Neutral lead-in (from 0 to first phoneme start)
  if (firstStartMs > 0) {
    timeline.push({ frame: 0, start: 0, end: firstStartMs });
  } else {
    // Always include a minimal neutral at the very start
    timeline.push({ frame: 0, start: 0, end: 0 });
  }

  // Convert each phoneme event
  for (const { phoneme, start, end } of sorted) {
    timeline.push({
      frame: phonemeToFrame(phoneme),
      start: start * 1000,
      end:   end   * 1000,
    });
  }

  // Neutral lead-out
  timeline.push({ frame: 0, start: lastEndMs, end: lastEndMs + 80 });

  return timeline;
}

/**
 * Total duration of a speech-mode timeline (ms).
 * Works with both {hold,transition} and {start,end} formats.
 */
export function getSpeechTimelineDuration(timeline) {
  if (!timeline || timeline.length === 0) return 0;
  const last = timeline[timeline.length - 1];
  if ('end' in last) return last.end;
  // fallback: sum durations
  return timeline.reduce((s, e) => s + (e.hold ?? e.duration ?? 0) + (e.transition ?? 0), 0);
}