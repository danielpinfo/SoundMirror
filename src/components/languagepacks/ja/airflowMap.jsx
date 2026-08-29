import airflowProfiles from './airflowProfiles';
import airflowOverrides from './airflowOverrides';
import airflowTransitions from './airflowTransitions';

/**
 * Japanese airflow map
 *
 * This file must stay aligned with the phoneme inventory emitted by:
 * languagepacks/ja/PhonemeResolver.jsx
 *
 * Active emitted phonemes are phoneme-level, not syllable-level:
 * q, n,
 * a, i, u, e, o,
 * k, g, t, d, s, z, sh, ch, ts, j, h, f, b, p, m, r, y, w,
 * ky, gy, ny, hy, by, py, ry, my
 */

const PHONEME_CLASS_MAP = {
  neutral: 'silence',
  pause: 'silence',
  silence: 'silence',
  closure: 'closure',

  q: 'geminate_hold',
  n: 'moraic_n',

  a: 'vowel_long',
  i: 'vowel_long',
  u: 'vowel_long',
  e: 'vowel_long',
  o: 'vowel_long',

  k: 'stop_clean',
  g: 'stop_clean',
  t: 'stop_clean',
  d: 'stop_clean',
  b: 'stop_clean',
  p: 'stop_clean',

  ky: 'stop_clean',
  gy: 'stop_clean',
  by: 'stop_clean',
  py: 'stop_clean',

  s: 'fricative_strong',
  z: 'fricative_soft',
  sh: 'fricative_soft',
  h: 'fricative_soft',
  f: 'fricative_soft',
  hy: 'fricative_soft',

  ch: 'affricate',
  ts: 'affricate',
  j: 'affricate',

  m: 'nasal',
  my: 'nasal',
  ny: 'nasal',

  r: 'liquid',
  ry: 'liquid',

  y: 'glide',
  w: 'glide',
};

const FRAME_CLASS_MAP = {
  0: 'silence',
  1: 'vowel_short',
  2: 'vowel_short',
  3: 'vowel_short',
  4: 'vowel_long',
  5: 'vowel_short',
  6: 'stop_clean',
  7: 'geminate_hold',
  8: 'stop_clean',
  9: 'moraic_n',
  10: 'nasal',
  11: 'fricative_strong',
  12: 'fricative_soft',
  13: 'fricative_soft',
  14: 'fricative_soft',
  15: 'affricate',
  16: 'fricative_soft',
  17: 'liquid',
  18: 'liquid',
  19: 'glide',
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
  locale: 'ja-JP',
  byPhoneme,
  byFrame,
  airflowProfiles,
  airflowOverrides,
  airflowTransitions,
};

export default airflowMap;