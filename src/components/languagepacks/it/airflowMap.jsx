import airflowProfiles from './airflowProfiles';
import airflowOverrides from './airflowOverrides';
import airflowTransitions from './airflowTransitions';

/**
 * Italian airflow map
 *
 * This file must stay aligned with the phoneme inventory emitted by:
 * languagepacks/it/PhonemeResolver.jsx
 *
 * Active emitted phonemes:
 * a, e, i, o, u, w,
 * k, g, t, d, b, p, m, n, ny, s, sh, f, v, ch, j, ts, r, rr, l, ly
 */

const PHONEME_CLASS_MAP = {
  neutral: 'silence',
  pause: 'silence',
  silence: 'silence',
  closure: 'closure',

  p: 'stop_unaspirated',
  b: 'stop_unaspirated',
  t: 'stop_unaspirated',
  d: 'stop_unaspirated',
  k: 'stop_unaspirated',
  g: 'stop_unaspirated',

  s: 'fricative_strong',
  sh: 'fricative_strong',
  f: 'fricative_weak',
  v: 'fricative_weak',

  ch: 'affricate',
  j: 'affricate',
  ts: 'affricate',

  m: 'nasal',
  n: 'nasal',
  ny: 'nasal',

  l: 'liquid',
  r: 'liquid',
  rr: 'trill',
  ly: 'palatal_liquid',

  w: 'glide',

  a: 'vowel_short',
  e: 'vowel_short',
  i: 'vowel_short',
  o: 'vowel_short',
  u: 'vowel_short',
};

const FRAME_CLASS_MAP = {
  0: 'silence',
  1: 'vowel_short',
  2: 'vowel_short',
  3: 'vowel_short',
  4: 'vowel_long',
  5: 'vowel_short',
  6: 'stop_unaspirated',
  7: 'stop_unaspirated',
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
  19: 'palatal_liquid',
};

function buildEntry(key, airflowClass) {
  const profile = airflowProfiles[airflowClass] ?? airflowProfiles.silence;
  const override = airflowOverrides[key] ?? {};

  return {
    ...profile,
    ...override,
    airflowClass: override.airflowClass ?? airflowClass,
  };
}

const byPhoneme = Object.fromEntries(
  Object.entries(PHONEME_CLASS_MAP).map(([key, airflowClass]) => [
    key,
    buildEntry(key, airflowClass),
  ])
);

const byFrame = Object.fromEntries(
  Object.entries(FRAME_CLASS_MAP).map(([frame, airflowClass]) => [
    frame,
    buildEntry(frame, airflowClass),
  ])
);

const airflowMap = {
  locale: 'it-IT',
  byPhoneme,
  byFrame,
  airflowProfiles,
  airflowOverrides,
  airflowTransitions,
};

export default airflowMap;