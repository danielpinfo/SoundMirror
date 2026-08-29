const airflowOverrides = {
  // stops
  b: { airflowClass: 'stop_unaspirated', oral: 0.4, velocity: 0.42, width: 'narrow', turbulent: false },
  d: { airflowClass: 'stop_unaspirated', oral: 0.42, velocity: 0.44, width: 'narrow', turbulent: false },
  g: { airflowClass: 'stop_unaspirated', oral: 0.46, velocity: 0.48, width: 'medium', turbulent: false },

  p: { airflowClass: 'stop_aspirated', oral: 0.74, velocity: 0.78, width: 'medium', turbulent: true },
  t: { airflowClass: 'stop_aspirated', oral: 0.74, velocity: 0.78, width: 'medium', turbulent: true },
  k: { airflowClass: 'stop_aspirated', oral: 0.78, velocity: 0.8, width: 'medium', turbulent: true },

  // affricates
  j: { airflowClass: 'affricate_unaspirated', oral: 0.64, velocity: 0.58, width: 'medium', turbulent: true },
  zh: { airflowClass: 'affricate_unaspirated', oral: 0.66, velocity: 0.6, width: 'medium', turbulent: true },
  z: { airflowClass: 'affricate_unaspirated', oral: 0.66, velocity: 0.6, width: 'medium', turbulent: true },

  q: { airflowClass: 'affricate_aspirated', oral: 0.8, velocity: 0.74, width: 'medium', turbulent: true },
  ch: { airflowClass: 'affricate_aspirated', oral: 0.82, velocity: 0.76, width: 'medium', turbulent: true },
  c: { airflowClass: 'affricate_aspirated', oral: 0.82, velocity: 0.76, width: 'medium', turbulent: true },

  // fricatives
  s: { airflowClass: 'fricative_strong', oral: 0.78, velocity: 0.62, width: 'medium', turbulent: true },
  sh: { airflowClass: 'fricative_strong', oral: 0.78, velocity: 0.62, width: 'medium', turbulent: true },
  h: { airflowClass: 'fricative_strong', oral: 0.74, velocity: 0.6, width: 'medium', turbulent: true },

  x: { airflowClass: 'fricative_soft', oral: 0.58, velocity: 0.48, width: 'medium', turbulent: true },
  f: { airflowClass: 'fricative_soft', oral: 0.58, velocity: 0.46, width: 'medium', turbulent: true },

  // nasals
  m: { airflowClass: 'nasal', oral: 0.04, nasal: 0.74, velocity: 0.4, width: 'medium', turbulent: false },
  n: { airflowClass: 'nasal', oral: 0.04, nasal: 0.72, velocity: 0.4, width: 'medium', turbulent: false },
  ng: { airflowClass: 'nasal', oral: 0.04, nasal: 0.72, velocity: 0.38, width: 'medium', turbulent: false },

  // liquids
  l: { airflowClass: 'liquid', oral: 0.4, velocity: 0.32, width: 'medium', turbulent: false },
  r: { airflowClass: 'liquid', oral: 0.38, velocity: 0.3, width: 'medium', turbulent: false },

  // glides
  y: { airflowClass: 'glide', oral: 0.34, velocity: 0.28, width: 'narrow', turbulent: false },
  w: { airflowClass: 'glide', oral: 0.34, velocity: 0.28, width: 'narrow', turbulent: false },

  // vowels
  a: { airflowClass: 'vowel_short', oral: 0.66, velocity: 0.42, width: 'medium' },
  e: { airflowClass: 'vowel_short', oral: 0.6, velocity: 0.38, width: 'medium' },
  i: { airflowClass: 'vowel_short', oral: 0.56, velocity: 0.36, width: 'medium' },
  o: { airflowClass: 'vowel_short', oral: 0.64, velocity: 0.4, width: 'medium' },
  u: { airflowClass: 'vowel_short', oral: 0.6, velocity: 0.38, width: 'medium' },
  v: { airflowClass: 'vowel_long', oral: 0.6, velocity: 0.38, width: 'medium' },
};

export default airflowOverrides;