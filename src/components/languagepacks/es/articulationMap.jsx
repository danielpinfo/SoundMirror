/**
 * Articulation map — Spanish (es)
 *
 * Pack-owned phoneme → frame authority.
 * Must stay aligned with Spanish PhonemeResolver output.
 */

const articulationMap = {
  locale: 'es-US',
  neutral_frame: 0,
  frames: [
    { index: 0,  label: 'neutral',     phonemes: [] },
    { index: 1,  label: 'open_vowel',              phonemes: ['a'] },
    { index: 2,  label: 'mid_vowel',               phonemes: ['e'] },
    { index: 3,  label: 'front_vowel',             phonemes: ['i'] },
    { index: 4,  label: 'rounded_vowel_ue',        phonemes: [] },
    { index: 5,  label: 'rounded_vowel_oo',        phonemes: ['o', 'u', 'w'] },
    { index: 6,  label: 'velar_stop',              phonemes: ['k', 'g'] },
    { index: 7,  label: 'alveolar_stop',           phonemes: ['t', 'd'] },
    { index: 8,  label: 'bilabial',                phonemes: ['b', 'p', 'm'] },
    { index: 9,  label: 'alveolar_nasal',          phonemes: ['n', 'ny'] },
    { index: 10, label: 'velar_nasal',             phonemes: [] },
    { index: 11, label: 'alveolar_fricative',      phonemes: ['s'] },
    { index: 12, label: 'postalveolar_fricative',  phonemes: [] },
    { index: 13, label: 'dental_fricative',        phonemes: [] },
    { index: 14, label: 'labiodental_fricative',   phonemes: ['f', 'v'] },
    { index: 15, label: 'affricate',                phonemes: ['ch'] },
    { index: 16, label: 'glottal',                  phonemes: ['h'] },
    { index: 17, label: 'rhotic',                   phonemes: ['r', 'rr'] },
    { index: 18, label: 'lateral',                  phonemes: ['l'] },
    { index: 19, label: 'glide',                    phonemes: ['y'] },
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

export function resolveFrame(phoneme) {
  return phonemeToFrameIndex[phoneme] ?? articulationMap.neutral_frame ?? 0;
}

export default articulationMap;
