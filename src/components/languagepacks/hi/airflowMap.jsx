import airflowProfiles from './airflowProfiles';
import airflowOverrides from './airflowOverrides';
import airflowTransitions from './airflowTransitions';

const PHONEME_CLASS_MAP = {
  neutral: 'silence',
  pause: 'silence',
  silence: 'silence',
  closure: 'closure',

  k: 'stop_unaspirated',
  kh: 'stop_aspirated',
  g: 'stop_unaspirated',
  gh: 'stop_aspirated',
  q: 'stop_unaspirated',

  tt: 'stop_unaspirated',
  tth: 'stop_aspirated',
  dd: 'stop_unaspirated',
  ddh: 'stop_aspirated',
  t: 'stop_unaspirated',
  th: 'stop_aspirated',
  d: 'stop_unaspirated',
  dh: 'stop_aspirated',

  p: 'stop_unaspirated',
  ph: 'stop_aspirated',
  b: 'stop_unaspirated',
  bh: 'stop_aspirated',

  ch: 'affricate',
  chh: 'affricate',
  j: 'affricate',
  jh: 'affricate',

  s: 'fricative_strong',
  sh: 'fricative_strong',
  ssh: 'fricative_strong',
  h: 'fricative_weak',
  x: 'fricative_strong',
  ghh: 'fricative_weak',
  z: 'fricative_strong',
  f: 'fricative_strong',
  zh: 'fricative_strong',
  v: 'fricative_weak',

  m: 'nasal',
  n: 'nasal',
  ng: 'nasal',
  ny: 'nasal',
  nn: 'nasal',
  '~': 'nasal_vowel',

  r: 'liquid',
  rr: 'liquid',
  rrh: 'liquid',
  l: 'liquid',

  y: 'glide',

  a: 'vowel_short',
  aa: 'vowel_long',
  i: 'vowel_short',
  ii: 'vowel_long',
  u: 'vowel_short',
  uu: 'vowel_long',
  e: 'vowel_long',
  ai: 'vowel_long',
  o: 'vowel_long',
  au: 'vowel_long',
  ri: 'liquid',

  an: 'nasal_vowel',
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
  16: 'fricative_weak',
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
  locale: 'hi-IN',
  byPhoneme,
  byFrame,
  airflowProfiles,
  airflowOverrides,
  airflowTransitions,
};

export default airflowMap;
