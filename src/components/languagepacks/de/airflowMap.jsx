import airflowProfiles from './airflowProfiles';
import airflowOverrides from './airflowOverrides';
import airflowTransitions from './airflowTransitions';

const PHONEME_CLASS_MAP = {
  neutral: 'silence',
  pause: 'silence',
  silence: 'silence',
  closure: 'closure',

  p: 'stop_aspirated',
  t: 'stop_aspirated',
  k: 'stop_aspirated',
  b: 'stop_unaspirated',
  d: 'stop_unaspirated',
  g: 'stop_unaspirated',

  f: 'fricative_weak',
  v: 'fricative_weak',
  s: 'fricative_strong',
  z: 'fricative_strong',
  sh: 'fricative_strong',
  ch: 'fricative_strong',
  h: 'fricative_strong',
  kh: 'dorsal_fricative_hard',

  ts: 'affricate',
  pf: 'cluster_release',

  m: 'nasal',
  n: 'nasal',

  l: 'liquid',
  r: 'liquid',

  y: 'glide',

  a: 'vowel_short',
  e: 'vowel_short',
  i: 'vowel_short',
  o: 'vowel_short',
  u: 'vowel_short',
  oe: 'vowel_long',
  ue: 'vowel_long',
  ai: 'vowel_long',
  ee: 'vowel_long',
};

const FRAME_CLASS_MAP = {
  0: 'silence',
  1: 'vowel_short',
  2: 'vowel_short',
  3: 'vowel_long',
  4: 'vowel_long',
  5: 'vowel_short',
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
  locale: 'de-DE',
  byPhoneme,
  byFrame,
  airflowProfiles,
  airflowOverrides,
  airflowTransitions,
};

export default airflowMap;