import airflowProfiles from './airflowProfiles';
import airflowOverrides from './airflowOverrides';
import airflowTransitions from './airflowTransitions';

/**
 * Spanish airflow map
 *
 * Must stay aligned with the phoneme inventory emitted by:
 * components/languagepacks/es/PhonemeResolver.jsx
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
  h: 'fricative_strong',
  f: 'fricative_weak',
  v: 'fricative_weak',

  ch: 'affricate',

  m: 'nasal',
  n: 'nasal',
  ny: 'nasal',

  l: 'liquid',
  r: 'liquid',
  rr: 'trill',

  y: 'glide',
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

export function resolveAirflowByPhoneme(phoneme) {
  return byPhoneme[phoneme] ?? byPhoneme.neutral ?? airflowProfiles.silence;
}

export function resolveAirflowByFrame(frame) {
  return byFrame[String(frame)] ?? byFrame[0] ?? airflowProfiles.silence;
}

const airflowMap = {
  locale: 'es-US',
  byPhoneme,
  byFrame,
  airflowProfiles,
  airflowOverrides,
  airflowTransitions,
  resolveAirflowByPhoneme,
  resolveAirflowByFrame,
};

export default airflowMap;
