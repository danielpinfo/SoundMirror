const airflowTransitions = {
  'closure->stop_unaspirated': { attack: 0.22, release: 0.24, sustain: 0.16 },
  'closure->stop_aspirated': { attack: 0.24, release: 0.26, sustain: 0.18 },

  'stop_unaspirated->vowel_short': { attack: 0.16, release: 0.2, sustain: 0.72 },
  'stop_unaspirated->vowel_long': { attack: 0.16, release: 0.22, sustain: 0.8 },

  'stop_aspirated->vowel_short': { attack: 0.18, release: 0.24, sustain: 0.76 },
  'stop_aspirated->vowel_long': { attack: 0.18, release: 0.26, sustain: 0.84 },

  'affricate->vowel_short': { soften: 0.26 },
  'affricate->vowel_long': { soften: 0.3 },

  'fricative_weak->vowel_short': { soften: 0.24 },
  'fricative_weak->vowel_long': { soften: 0.28 },

  'fricative_strong->vowel_short': { soften: 0.28 },
  'fricative_strong->vowel_long': { soften: 0.32 },

  'nasal->vowel_short': { blend: 0.36, nasalFade: 0.26 },
  'nasal->vowel_long': { blend: 0.4, nasalFade: 0.28 },

  'nasal_vowel->stop_unaspirated': { blend: 0.34, nasalFade: 0.34 },
  'nasal_vowel->stop_aspirated': { blend: 0.36, nasalFade: 0.36 },

  'liquid->vowel_short': { blend: 0.4 },
  'liquid->vowel_long': { blend: 0.44 },

  'glide->vowel_short': { blend: 0.46 },
  'glide->vowel_long': { blend: 0.5 },

  'vowel_short->closure': { decay: 0.24 },
  'vowel_long->closure': { decay: 0.28 },
};

export default airflowTransitions;