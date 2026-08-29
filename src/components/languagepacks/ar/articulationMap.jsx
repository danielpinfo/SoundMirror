/**
 * Articulation map — phoneme → frame index (0-19)
 * Arabic phoneme-level mapping aligned with PhonemeResolver.jsx
 */

const articulationMap = {
  locale: 'ar-SA',
  neutral_frame: 0,
  frames: [
    { index: 0,  label: 'neutral',           phonemes: [] },

    { index: 1,  label: 'open_vowel',              phonemes: ['V:a', 'V:ا'] },
    { index: 2,  label: 'mid_vowel',               phonemes: ['V:e'] },
    { index: 3,  label: 'front_vowel',             phonemes: ['V:i', 'V:ي'] },
    { index: 4,  label: 'rounded_vowel_ue',        phonemes: [] },
    { index: 5,  label: 'rounded_vowel_oo',        phonemes: ['V:o', 'V:u', 'V:و', 'C:و'] },

    { index: 6,  label: 'velar_stop',              phonemes: ['C:ك', 'C:ق', 'C:خ', 'C:غ'] },
    { index: 7,  label: 'alveolar_stop',           phonemes: ['C:ت', 'C:د', 'C:ط', 'C:ض'] },
    { index: 8,  label: 'bilabial',                phonemes: ['C:ب', 'C:م'] },
    { index: 9,  label: 'alveolar_nasal',          phonemes: ['C:ن'] },
    { index: 10, label: 'velar_nasal',             phonemes: [] },
    { index: 11, label: 'alveolar_fricative',      phonemes: ['C:س', 'C:ز', 'C:ص'] },
    { index: 12, label: 'postalveolar_fricative',  phonemes: ['C:ش', 'C:ج'] },
    { index: 13, label: 'dental_fricative',        phonemes: ['C:ث', 'C:ذ', 'C:ظ'] },
    { index: 14, label: 'labiodental_fricative',   phonemes: ['C:ف'] },
    { index: 15, label: 'affricate',                phonemes: [] },
    { index: 16, label: 'glottal',                  phonemes: ['C:ه', 'C:ء', 'C:ح', 'C:ع'] },
    { index: 17, label: 'rhotic',                   phonemes: ['C:ر'] },
    { index: 18, label: 'lateral',                  phonemes: ['C:ل'] },
    { index: 19, label: 'glide',                    phonemes: ['C:ي'] },
  ],
};

export const phonemeToFrameIndex = (() => {
  const map = {};
  for (const frame of articulationMap.frames) {
    for (const phoneme of frame.phonemes) {
      map[phoneme] = frame.index;
    }
  }
  return map;
})();

export default articulationMap;
