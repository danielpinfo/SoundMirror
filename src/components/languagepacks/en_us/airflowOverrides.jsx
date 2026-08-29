/**
 * SoundMirror Airflow Overrides
 * English (US)
 *
 * Fine-tuned airflow adjustments per phoneme.
 * These override the base airflowProfiles where needed.
 *
 * IMPORTANT:
 * - Overrides should only adjust values that differ from base profiles
 * - Keep this file minimal and precise
 * - This file is pack-owned (no shared logic)
 */

const airflowOverrides = {

  // ─────────────────────────────────────
  // Stops
  // ─────────────────────────────────────

  p: { airflowClass: 'stop_aspirated', oral: 0.74, velocity: 0.82, width: 'medium', turbulent: true },
  t: { airflowClass: 'stop_aspirated', oral: 0.76, velocity: 0.84, width: 'medium', turbulent: true },
  k: { airflowClass: 'stop_aspirated', oral: 0.82, velocity: 0.88, width: 'wide', turbulent: true },

  b: { airflowClass: 'stop_unaspirated', oral: 0.38, velocity: 0.50, width: 'narrow', turbulent: false },
  d: { airflowClass: 'stop_unaspirated', oral: 0.40, velocity: 0.52, width: 'narrow', turbulent: false },
  g: { airflowClass: 'stop_unaspirated', oral: 0.46, velocity: 0.56, width: 'medium', turbulent: false },


  // ─────────────────────────────────────
  // Fricatives
  // ─────────────────────────────────────

  h:  { airflowClass: 'fricative_strong', oral: 0.88, velocity: 0.72, width: 'wide', turbulent: false },

  th: { airflowClass: 'fricative_strong', oral: 0.78, velocity: 0.62, width: 'medium', turbulent: true },
  dh: { airflowClass: 'fricative_strong', oral: 0.74, velocity: 0.58, width: 'medium', turbulent: true },

  s:  { airflowClass: 'fricative_strong', oral: 0.90, velocity: 0.74, width: 'narrow', turbulent: true },
  z:  { airflowClass: 'fricative_strong', oral: 0.86, velocity: 0.68, width: 'narrow', turbulent: true },

  sh: { airflowClass: 'fricative_strong', oral: 0.84, velocity: 0.66, width: 'medium', turbulent: true },
  zh: { airflowClass: 'fricative_strong', oral: 0.78, velocity: 0.60, width: 'medium', turbulent: true },


  // ─────────────────────────────────────
  // Affricates
  // ─────────────────────────────────────

  ch: { airflowClass: 'affricate', oral: 0.82, velocity: 0.80, width: 'medium', turbulent: true },
  j:  { airflowClass: 'affricate', oral: 0.74, velocity: 0.70, width: 'medium', turbulent: true },


  // ─────────────────────────────────────
  // Nasals
  // ─────────────────────────────────────

  ng: { airflowClass: 'nasal', oral: 0.02, nasal: 0.68, velocity: 0.38, width: 'medium', turbulent: false },


  // ─────────────────────────────────────
  // Liquids
  // ─────────────────────────────────────

  r: { airflowClass: 'liquid', oral: 0.38, velocity: 0.32, width: 'medium', turbulent: false },
  l: { airflowClass: 'liquid', oral: 0.40, velocity: 0.34, width: 'medium', turbulent: false },


  // ─────────────────────────────────────
  // Glides
  // ─────────────────────────────────────

  w: { airflowClass: 'glide', oral: 0.32, velocity: 0.26, width: 'narrow', turbulent: false },
  y: { airflowClass: 'glide', oral: 0.30, velocity: 0.25, width: 'narrow', turbulent: false },


  // ─────────────────────────────────────
  // Long vowels
  // ─────────────────────────────────────

  ee:  { airflowClass: 'vowel_long', oral: 0.64, velocity: 0.42, width: 'medium' },
  ey:  { airflowClass: 'vowel_long', oral: 0.66, velocity: 0.44, width: 'medium' },
  ei:  { airflowClass: 'vowel_long', oral: 0.66, velocity: 0.44, width: 'medium' },

  ai:  { airflowClass: 'vowel_long', oral: 0.72, velocity: 0.48, width: 'wide' },

  ohw: { airflowClass: 'vowel_long', oral: 0.70, velocity: 0.48, width: 'wide' },
  yoo: { airflowClass: 'vowel_long', oral: 0.62, velocity: 0.42, width: 'medium' },

  ow:  { airflowClass: 'vowel_long', oral: 0.68, velocity: 0.46, width: 'medium' },
  oy:  { airflowClass: 'vowel_long', oral: 0.68, velocity: 0.46, width: 'medium' },

  ue:  { airflowClass: 'vowel_long', oral: 0.60, velocity: 0.42, width: 'medium' },
  oo:  { airflowClass: 'vowel_long', oral: 0.68, velocity: 0.46, width: 'medium' },

  aw:  { airflowClass: 'vowel_long', oral: 0.70, velocity: 0.48, width: 'wide' },

};

export default airflowOverrides;