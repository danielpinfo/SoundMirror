import airflowProfiles from './airflowProfiles';
import airflowOverrides from './airflowOverrides';
import airflowTransitions from './airflowTransitions';

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

  f: 'fricative_weak',
  v: 'fricative_weak',
  s: 'fricative_strong',
  z: 'fricative_strong',
  sh: 'fricative_strong',
  zh: 'fricative_strong',

  r: 'uvular_fricative',

  m: 'nasal',
  n: 'nasal',
  ny: 'nasal',

  an: 'nasal_vowel',
  on: 'nasal_vowel',
  in: 'nasal_vowel',
  un: 'nasal_vowel',

  l: 'liquid',

  y: 'glide',
  wa: 'glide',

  a: 'vowel_short',
  e: 'vowel_short',
  i: 'vowel_short',
  o: 'vowel_short',
  u: 'vowel_short',
  oo: 'vowel_long',
  eu: 'vowel_long',
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
  15: 'silence',
  16: 'silence',
  17: 'uvular_fricative',
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
  locale: 'fr-FR',
  byPhoneme,
  byFrame,
  airflowProfiles,
  airflowOverrides,
  airflowTransitions,
};

export default airflowMap;