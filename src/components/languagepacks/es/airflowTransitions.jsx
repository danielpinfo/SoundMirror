const airflowTransitions = {
  'closure->stop_unaspirated': { attack: 0.24, release: 0.26, sustain: 0.16 },
  'stop_unaspirated->vowel_short': { attack: 0.18, release: 0.2, sustain: 0.72 },
  'stop_unaspirated->vowel_long': { attack: 0.18, release: 0.22, sustain: 0.8 },
  'fricative_weak->vowel_short': { soften: 0.24 },
  'fricative_weak->vowel_long': { soften: 0.28 },
  'fricative_strong->vowel_short': { soften: 0.28 },
  'fricative_strong->vowel_long': { soften: 0.32 },
  'vowel_short->closure': { decay: 0.24 },
  'vowel_long->closure': { decay: 0.28 },
  'nasal->vowel_short': { blend: 0.34, nasalFade: 0.26 },
  'nasal->vowel_long': { blend: 0.38, nasalFade: 0.28 },
  'nasal->stop_unaspirated': { decay: 0.2, nasalFade: 0.26 },
  'liquid->vowel_short': { blend: 0.38 },
  'liquid->vowel_long': { blend: 0.42 },
  'trill->vowel_short': { blend: 0.4, pulse: 0.24 },
  'trill->vowel_long': { blend: 0.44, pulse: 0.26 },
  'affricate->fricative_strong': { release: 0.22, turbulenceRamp: 0.3 },
  'glide->vowel_short': { blend: 0.44 },
  'glide->vowel_long': { blend: 0.48 },
};

export default airflowTransitions;