/**
 * SoundMirror Airflow Map
 * English (US)
 *
 * PACK-OWNED AIRFLOW DEFINITIONS
 *
 * This file maps phonemes and animation frames to airflow behavior.
 * It is pack-owned and must remain language-local.
 *
 * IMPORTANT ARCHITECTURE RULES
 * - Phoneme-first (never alphabet-driven)
 * - Pack owns airflow behavior
 * - No shared logic fallback
 */

import airflowProfiles from './airflowProfiles';
import airflowOverrides from './airflowOverrides';
import airflowTransitions from './airflowTransitions';

/**
 * Phoneme -> airflow class
 *
 * Must align with:
 * - phonemeSystem.jsx
 * - articulationMap.jsx
 * - PhonemeResolver output
 */
const PHONEME_CLASS_MAP = {
  // silence
  neutral: 'silence',
  pause: 'silence',
  silence: 'silence',
  closure: 'closure',

  // stops
  p: 'stop_aspirated',
  t: 'stop_aspirated',
  k: 'stop_aspirated',
  b: 'stop_unaspirated',
  d: 'stop_unaspirated',
  g: 'stop_unaspirated',

  // fricatives
  f: 'fricative_weak',
  v: 'fricative_weak',
  s: 'fricative_strong',
  z: 'fricative_strong',
  sh: 'fricative_strong',
  zh: 'fricative_strong',
  th: 'fricative_strong',
  dh: 'fricative_strong',
  h: 'fricative_strong',

  // affricates
  ch: 'affricate',
  jh: 'affricate',

  // nasals
  m: 'nasal',
  n: 'nasal',
  ng: 'nasal',

  // liquids
  l: 'liquid',
  r: 'liquid',

  // glides
  w: 'glide',
  y: 'glide',

  // vowels short
  a: 'vowel_short',
  ah: 'vowel_short',
  aa: 'vowel_short',
  ae: 'vowel_short',
  e: 'vowel_short',
  eh: 'vowel_short',
  i: 'vowel_short',
  ih: 'vowel_short',
  o: 'vowel_short',
  ao: 'vowel_short',
  u: 'vowel_short',
  uh: 'vowel_short',
  er: 'vowel_short',

  // vowels long
  ee: 'vowel_long',
  iy: 'vowel_long',
  ey: 'vowel_long',
  ai: 'vowel_long',
  ay: 'vowel_long',
  ow: 'vowel_long',
  uw: 'vowel_long',
  ue: 'vowel_long',
  oo: 'vowel_long',
  aw: 'vowel_long',
  oy: 'vowel_long',
};

/**
 * Frame -> airflow class
 *
 * Must match articulationMap exactly
 */
const FRAME_CLASS_MAP = {
  0: 'silence',

  1: 'vowel_short',
  2: 'vowel_long',
  3: 'vowel_long',
  4: 'vowel_long',
  5: 'vowel_long',

  6: 'stop_aspirated',
  7: 'stop_aspirated',
  8: 'stop_unaspirated',

  9: 'nasal',
  10: 'nasal',

  11: 'fricative_strong',
  12: 'fricative_strong',
  13: 'fricative_strong',
  14: 'fricative_weak',

  15: 'affricate',

  16: 'fricative_strong',

  17: 'liquid',
  18: 'liquid',

  19: 'glide',
};

/**
 * Build airflow entry
 */
function buildEntry(key, airflowClass) {
  const profile = airflowProfiles[airflowClass] ?? airflowProfiles.silence;
  const override = airflowOverrides[key] ?? {};

  return {
    ...profile,
    ...override,
    airflowClass: override.airflowClass ?? airflowClass,
  };
}

function buildLookupMap(sourceMap) {
  return Object.fromEntries(
    Object.entries(sourceMap).map(([key, airflowClass]) => [
      key,
      buildEntry(key, airflowClass),
    ])
  );
}

export const airflowClassByPhoneme = PHONEME_CLASS_MAP;
export const airflowClassByFrame = FRAME_CLASS_MAP;

export const byPhoneme = buildLookupMap(PHONEME_CLASS_MAP);
export const byFrame = buildLookupMap(FRAME_CLASS_MAP);

/**
 * Helpers
 */
export function getAirflowByPhoneme(phoneme) {
  return byPhoneme[phoneme] ?? byPhoneme.silence ?? airflowProfiles.silence;
}

export function getAirflowByFrame(frame) {
  return byFrame[frame] ?? byFrame[0] ?? airflowProfiles.silence;
}

const airflowMap = {
  locale: 'en-US',
  byPhoneme,
  byFrame,
  airflowProfiles,
  airflowOverrides,
  airflowTransitions,
};

export default airflowMap;