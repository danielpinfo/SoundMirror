import airflowProfiles from './airflowProfiles';
import airflowOverrides from './airflowOverrides';
import airflowTransitions from './airflowTransitions';

const PHONEME_CLASS_MAP = {
  neutral: 'silence',
  pause: 'silence',
  silence: 'silence',
  closure: 'closure',

  'C:ب': 'stop_unaspirated',
  'C:ت': 'stop_unaspirated',
  'C:د': 'stop_unaspirated',
  'C:ط': 'stop_unaspirated',
  'C:ك': 'stop_unaspirated',
  'C:ق': 'stop_unaspirated',

  'C:ف': 'fricative_weak',
  'C:س': 'fricative_strong',
  'C:ص': 'fricative_strong',
  'C:ش': 'fricative_strong',
  'C:ز': 'fricative_strong',
  'C:ذ': 'fricative_strong',
  'C:ث': 'fricative_strong',
  'C:ظ': 'fricative_strong',
  'C:ض': 'fricative_strong',

  'C:خ': 'fricative_strong',
  'C:غ': 'fricative_strong',
  'C:ح': 'fricative_soft',
  'C:ه': 'fricative_soft',
  'C:ع': 'liquid',
  'C:ء': 'closure',

  'C:م': 'nasal',
  'C:ن': 'nasal',

  'C:ل': 'liquid',
  'C:ر': 'liquid',

  'C:ي': 'glide',
  'C:و': 'glide',

  'V:a': 'vowel_short',
  'V:e': 'vowel_short',
  'V:i': 'vowel_short',
  'V:o': 'vowel_short',
  'V:u': 'vowel_short',

  'V:ا': 'vowel_long',
  'V:ي': 'vowel_long',
  'V:و': 'vowel_long',
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

const airflowMap = {
  locale: 'ar-SA',
  byPhoneme,
  byFrame,
  airflowProfiles,
  airflowOverrides,
  airflowTransitions,
};

export default airflowMap;