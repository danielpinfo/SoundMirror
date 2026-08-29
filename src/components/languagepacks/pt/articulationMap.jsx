const articulationMap = {
  locale: 'pt-BR',
  neutral_frame: 0,

  frames: [
    {
      index: 0,
      label: 'neutral',
      phonemes: [],
    },

    {
      index: 1,
      label: 'open_vowel',
      phonemes: ['a', 'an', 'anw', 'ane'],
    },

    {
      index: 2,
      label: 'mid_vowel',
      phonemes: ['e', 'en', 'ei'],
    },

    {
      index: 3,
      label: 'front_vowel',
      phonemes: ['i', 'in'],
    },

    {
      index: 4,
      label: 'rounded_vowel_ue',
      phonemes: [],
    },

    {
      index: 5,
      label: 'rounded_vowel_oo',
      phonemes: ['o', 'u', 'on', 'un', 'one', 'au', 'w'],
    },

    {
      index: 6,
      label: 'velar_stop',
      phonemes: ['k', 'g'],
    },

    {
      index: 7,
      label: 'alveolar_stop',
      phonemes: ['t', 'd'],
    },

    {
      index: 8,
      label: 'bilabial',
      phonemes: ['b', 'p', 'm'],
    },

    {
      index: 9,
      label: 'alveolar_nasal',
      phonemes: ['n'],
    },

    {
      index: 10,
      label: 'velar_nasal',
      phonemes: [],
    },

    {
      index: 11,
      label: 'alveolar_fricative',
      phonemes: ['s', 'z'],
    },

    {
      index: 12,
      label: 'postalveolar_fricative',
      phonemes: ['sh', 'zh'],
    },

    {
      index: 13,
      label: 'dental_fricative',
      phonemes: [],
    },

    {
      index: 14,
      label: 'labiodental_fricative',
      phonemes: ['f', 'v'],
    },

    {
      index: 15,
      label: 'affricate',
      phonemes: [],
    },

    {
      index: 16,
      label: 'glottal',
      phonemes: ['rr'],
    },

    {
      index: 17,
      label: 'rhotic',
      phonemes: ['r'],
    },

    {
      index: 18,
      label: 'lateral',
      phonemes: ['l'],
    },

    {
      index: 19,
      label: 'glide',
      phonemes: ['ly', 'ny'],
    },
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