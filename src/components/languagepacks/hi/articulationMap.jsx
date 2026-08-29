const articulationMap = {
  locale: 'hi-IN',
  neutral_frame: 0,
  frames: [
    { index: 0,  label: 'neutral',                phonemes: [] },
    { index: 1,  label: 'open_vowel',             phonemes: ['a', 'aa'] },
    { index: 2,  label: 'mid_vowel',              phonemes: ['e', 'o'] },
    { index: 3,  label: 'front_vowel',            phonemes: ['i', 'ii', 'ai'] },
    { index: 4,  label: 'rounded_vowel_ue',       phonemes: [] },
    { index: 5,  label: 'rounded_vowel_oo',       phonemes: ['u', 'uu', 'au'] },
    { index: 6,  label: 'velar_stop',             phonemes: ['k', 'kh', 'g', 'gh', 'q'] },
    { index: 7,  label: 'alveolar_stop',          phonemes: ['tt', 'tth', 'dd', 'ddh', 't', 'th', 'd', 'dh'] },
    { index: 8,  label: 'bilabial',               phonemes: ['p', 'ph', 'b', 'bh', 'm'] },
    { index: 9,  label: 'alveolar_nasal',         phonemes: ['n', 'ny', 'nn', '~'] },
    { index: 10, label: 'velar_nasal',            phonemes: ['ng'] },
    { index: 11, label: 'alveolar_fricative',     phonemes: ['s', 'z'] },
    { index: 12, label: 'postalveolar_fricative', phonemes: ['sh', 'ssh', 'zh'] },
    { index: 13, label: 'dental_fricative',       phonemes: [] },
    { index: 14, label: 'labiodental_fricative',  phonemes: ['f', 'v'] },
    { index: 15, label: 'affricate',               phonemes: ['ch', 'chh', 'j', 'jh'] },
    { index: 16, label: 'glottal',                 phonemes: ['h', 'x', 'ghh'] },
    { index: 17, label: 'rhotic',                  phonemes: ['r', 'rr', 'rrh'] },
    { index: 18, label: 'lateral',                 phonemes: ['l'] },
    { index: 19, label: 'glide',                   phonemes: ['y'] },
  ],
};

export const phonemeToFrameIndex = (() => {
  const map = {};
  for (const f of articulationMap.frames) {
    for (const p of f.phonemes) map[p] = f.index;
  }
  return map;
})();

export default articulationMap;
