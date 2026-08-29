import airflowProfiles from './airflowProfiles';
import airflowOverrides from './airflowOverrides';
import airflowTransitions from './airflowTransitions';

/**
 * Chinese airflow map
 *
 * Must stay aligned with the articulation-step inventory emitted by:
 * languagepacks/zh/PhonemeResolver.jsx
 *
 * Resolver emits:
 * - initials directly: zh, ch, sh, b, p, m, etc.
 * - finals as articulation steps: "iao:i", "iao:a", "iao:o", "an:an", etc.
 */

const PHONEME_CLASS_MAP = {
  neutral: 'silence',
  pause: 'silence',
  silence: 'silence',
  closure: 'closure',

  a: 'vowel_short',
  e: 'vowel_short',
  i: 'vowel_short',
  o: 'vowel_short',
  u: 'vowel_short',
  v: 'vowel_long',

  n: 'nasal',
  ng: 'nasal',

  b: 'stop_unaspirated',
  d: 'stop_unaspirated',
  g: 'stop_unaspirated',
  j: 'affricate_unaspirated',
  zh: 'affricate_unaspirated',
  z: 'affricate_unaspirated',

  p: 'stop_aspirated',
  t: 'stop_aspirated',
  k: 'stop_aspirated',
  q: 'affricate_aspirated',
  ch: 'affricate_aspirated',
  c: 'affricate_aspirated',

  m: 'nasal',
  l: 'liquid',
  r: 'liquid',
  y: 'glide',
  w: 'glide',

  f: 'fricative_soft',
  x: 'fricative_soft',
  s: 'fricative_strong',
  sh: 'fricative_strong',
  h: 'fricative_strong',
};

const STEP_CLASS_MAP = {
  'ie:i': 'vowel_short',
  'ie:e': 'vowel_short',

  'ao:a': 'vowel_short',
  'ao:o': 'vowel_short',

  'iao:i': 'vowel_short',
  'iao:a': 'vowel_short',
  'iao:o': 'vowel_short',

  'ia:i': 'vowel_short',
  'ia:a': 'vowel_short',

  'ai:a': 'vowel_short',
  'ai:i': 'vowel_short',

  'ei:e': 'vowel_short',
  'ei:i': 'vowel_short',

  'a:a': 'vowel_short',
  'o:o': 'vowel_short',
  'e:e': 'vowel_short',
  'i:i': 'vowel_short',
  'u:u': 'vowel_short',
  'v:v': 'vowel_long',

  'an:an': 'vowel_short',
  'en:en': 'vowel_short',
  'ang:ang': 'vowel_short',
  'eng:eng': 'vowel_short',
  'ong:ong': 'vowel_short',

  'iu:iu': 'vowel_short',
  'ian:ian': 'vowel_short',
  'in:in': 'vowel_short',
  'iang:iang': 'vowel_short',
  'ing:ing': 'vowel_short',
  'iong:iong': 'vowel_short',

  'ua:ua': 'vowel_short',
  'uo:uo': 'vowel_short',
  'uai:uai': 'vowel_short',
  'ui:ui': 'vowel_short',
  'uan:uan': 'vowel_short',
  'un:un': 'vowel_short',
  'uang:uang': 'vowel_short',
  'ueng:ueng': 'vowel_short',

  've:ve': 'vowel_long',
  'van:van': 'vowel_long',
  'vn:vn': 'vowel_long',

  'ou:ou': 'vowel_short',
  'er:er': 'liquid',
};

const FRAME_CLASS_MAP = {
  0: 'silence',
  1: 'vowel_short',
  2: 'vowel_short',
  3: 'vowel_short',
  4: 'vowel_long',
  5: 'vowel_short',
  6: 'stop_aspirated',
  7: 'stop_unaspirated',
  8: 'stop_unaspirated',
  9: 'nasal',
  10: 'nasal',
  11: 'fricative_strong',
  12: 'fricative_strong',
  13: 'fricative_soft',
  14: 'fricative_soft',
  15: 'affricate_unaspirated',
  16: 'fricative_strong',
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

const allPhonemeClasses = {
  ...PHONEME_CLASS_MAP,
  ...STEP_CLASS_MAP,
};

const byPhoneme = Object.fromEntries(
  Object.entries(allPhonemeClasses).map(([key, airflowClass]) => [
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
  locale: 'zh-CN',
  byPhoneme,
  byFrame,
  airflowProfiles,
  airflowOverrides,
  airflowTransitions,
};

export default airflowMap;