const airflowTransitions = {
  'closure->stop_unaspirated': { attack: 0.22, release: 0.24, sustain: 0.16 },
  'closure->stop_aspirated': { attack: 0.2, release: 0.36, sustain: 0.2 },

  'stop_unaspirated->vowel_short': { attack: 0.16, release: 0.2, sustain: 0.72 },
  'stop_unaspirated->vowel_long': { attack: 0.16, release: 0.22, sustain: 0.8 },
  'stop_aspirated->vowel_short': { attack: 0.14, release: 0.3, sustain: 0.74 },

  'fricative_strong->vowel_short': { release: 0.34, sustain: 0.82 },
  'fricative_strong->vowel_long': { soften: 0.32 },

  'dorsal_fricative_hard->vowel_short': { soften: 0.3, turbulenceRampDown: 0.3 },
  'dorsal_fricative_hard->vowel_long': { soften: 0.34, turbulenceRampDown: 0.34 },

  'affricate->fricative_strong': { release: 0.22, turbulenceRamp: 0.3 },

  'cluster_release->fricative_weak': { hold: 0.18, release: 0.24, turbulenceRamp: 0.28 },
  'cluster_release->fricative_strong': { hold: 0.18, release: 0.26, turbulenceRamp: 0.32 },

  'vowel_short->closure': { decay: 0.24 },
  'vowel_long->closure': { decay: 0.28 },

  'nasal->vowel_short': { blend: 0.34, nasalFade: 0.26 },
  'nasal->vowel_long': { blend: 0.38, nasalFade: 0.28 },

  'glide->vowel_short': { blend: 0.42 },
  'glide->vowel_long': { blend: 0.46 },
};

export default airflowTransitions;