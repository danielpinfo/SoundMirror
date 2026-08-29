const airflowOverrides = {
  k: { airflowClass: 'stop_unaspirated', oral: 0.44, velocity: 0.46 },
  kh: { airflowClass: 'stop_aspirated', oral: 0.52, velocity: 0.56 },
  g: { airflowClass: 'stop_unaspirated', oral: 0.42, velocity: 0.44 },
  gh: { airflowClass: 'stop_aspirated', oral: 0.5, velocity: 0.54 },

  t: { airflowClass: 'stop_unaspirated', oral: 0.44, velocity: 0.46 },
  d: { airflowClass: 'stop_unaspirated', oral: 0.42, velocity: 0.44 },

  p: { airflowClass: 'stop_unaspirated', oral: 0.44, velocity: 0.46 },
  ph: { airflowClass: 'stop_aspirated', oral: 0.52, velocity: 0.56 },
  b: { airflowClass: 'stop_unaspirated', oral: 0.42, velocity: 0.44 },
  bh: { airflowClass: 'stop_aspirated', oral: 0.5, velocity: 0.54 },

  ch: { airflowClass: 'affricate', oral: 0.7, velocity: 0.64 },
  j: { airflowClass: 'affricate', oral: 0.68, velocity: 0.62 },

  s: { airflowClass: 'fricative_strong', oral: 0.76, velocity: 0.6 },
  sh: { airflowClass: 'fricative_strong', oral: 0.74, velocity: 0.58 },
  h: { airflowClass: 'fricative_weak', oral: 0.5, velocity: 0.4 },

  m: { airflowClass: 'nasal', nasal: 0.74 },
  n: { airflowClass: 'nasal', nasal: 0.72 },

  r: { airflowClass: 'liquid', oral: 0.36 },
  l: { airflowClass: 'liquid', oral: 0.38 },
  y: { airflowClass: 'glide', oral: 0.3 },

  a: { airflowClass: 'vowel_short' },
  aa: { airflowClass: 'vowel_long' },
  i: { airflowClass: 'vowel_short' },
  ii: { airflowClass: 'vowel_long' },
  u: { airflowClass: 'vowel_short' },
  uu: { airflowClass: 'vowel_long' },
  e: { airflowClass: 'vowel_long' },
  ai: { airflowClass: 'vowel_long' },
  o: { airflowClass: 'vowel_long' },
  au: { airflowClass: 'vowel_long' },
  ri: { airflowClass: 'liquid' },
  an: { airflowClass: 'nasal_vowel' },
};

export default airflowOverrides;