/**
 * SoundMirror Airflow Transitions
 * English (US)
 *
 * Defines smoothing rules between airflow classes.
 * These are used to make airflow behavior feel continuous
 * rather than abruptly jumping from one articulation state
 * to the next.
 *
 * IMPORTANT:
 * - These transitions are language-pack-owned
 * - Shared code must not invent or override transitions
 * - Keys use the format: "fromClass->toClass"
 */

const airflowTransitions = {
  // ─────────────────────────────────────
  // Closure / stop release
  // ─────────────────────────────────────
  'closure->stop_unaspirated': { attack: 0.20, release: 0.32, sustain: 0.18 },
  'closure->stop_aspirated':   { attack: 0.18, release: 0.42, sustain: 0.24 },

  // ─────────────────────────────────────
  // Stops into vowels
  // ─────────────────────────────────────
  'stop_unaspirated->vowel_short': { attack: 0.14, release: 0.22, sustain: 0.70 },
  'stop_unaspirated->vowel_long':  { attack: 0.14, release: 0.24, sustain: 0.82 },
  'stop_aspirated->vowel_short':   { attack: 0.12, release: 0.34, sustain: 0.72 },
  'stop_aspirated->vowel_long':    { attack: 0.12, release: 0.38, sustain: 0.84 },

  // ─────────────────────────────────────
  // Fricatives into vowels
  // ─────────────────────────────────────
  'fricative_weak->vowel_short':   { soften: 0.26 },
  'fricative_weak->vowel_long':    { soften: 0.30 },
  'fricative_strong->vowel_short': { soften: 0.32 },
  'fricative_strong->vowel_long':  { soften: 0.36 },

  // ─────────────────────────────────────
  // Vowels into closure
  // ─────────────────────────────────────
  'vowel_short->closure': { decay: 0.28 },
  'vowel_long->closure':  { decay: 0.34 },

  // ─────────────────────────────────────
  // Nasals
  // ─────────────────────────────────────
  'nasal->closure':            { decay: 0.24 },
  'nasal->stop_unaspirated':   { decay: 0.22, nasalFade: 0.28 },
  'nasal->stop_aspirated':     { decay: 0.20, nasalFade: 0.30 },

  // ─────────────────────────────────────
  // Stops into fricatives
  // ─────────────────────────────────────
  'stop_unaspirated->fricative_weak':   { release: 0.26, turbulenceRamp: 0.30 },
  'stop_unaspirated->fricative_strong': { release: 0.28, turbulenceRamp: 0.34 },
  'stop_aspirated->fricative_weak':     { release: 0.30, turbulenceRamp: 0.34 },
  'stop_aspirated->fricative_strong':   { release: 0.34, turbulenceRamp: 0.38 },

  // ─────────────────────────────────────
  // Affricates
  // ─────────────────────────────────────
  'affricate->fricative_strong': { release: 0.24, turbulenceRamp: 0.34 },

  // ─────────────────────────────────────
  // Glides into vowels
  // ─────────────────────────────────────
  'glide->vowel_short': { blend: 0.42 },
  'glide->vowel_long':  { blend: 0.48 },
};

/**
 * Convenience helper
 */
export function getAirflowTransition(fromClass, toClass) {
  return airflowTransitions[`${fromClass}->${toClass}`] ?? null;
}

export default airflowTransitions;