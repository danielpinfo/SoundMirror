const airflowOverrides = {
  p: { airflowClass: 'stop_unaspirated', oral: 0.44, velocity: 0.46, width: 'narrow', turbulent: false },
  b: { airflowClass: 'stop_unaspirated', oral: 0.4, velocity: 0.42, width: 'narrow', turbulent: false },
  t: { airflowClass: 'stop_unaspirated', oral: 0.46, velocity: 0.48, width: 'narrow', turbulent: false },
  d: { airflowClass: 'stop_unaspirated', oral: 0.42, velocity: 0.44, width: 'narrow', turbulent: false },
  k: { airflowClass: 'stop_unaspirated', oral: 0.5, velocity: 0.52, width: 'medium', turbulent: false },
  g: { airflowClass: 'stop_unaspirated', oral: 0.46, velocity: 0.48, width: 'medium', turbulent: false },

  s: { airflowClass: 'fricative_strong', oral: 0.84, velocity: 0.68, width: 'narrow', turbulent: true },
  z: { airflowClass: 'fricative_strong', oral: 0.8, velocity: 0.64, width: 'narrow', turbulent: true },
  sh: { airflowClass: 'fricative_strong', oral: 0.78, velocity: 0.62, width: 'medium', turbulent: true },
  zh: { airflowClass: 'fricative_strong', oral: 0.78, velocity: 0.62, width: 'medium', turbulent: true },

  f: { airflowClass: 'fricative_weak', oral: 0.6, velocity: 0.48, width: 'medium', turbulent: true },
  v: { airflowClass: 'fricative_weak', oral: 0.58, velocity: 0.46, width: 'medium', turbulent: true },

  rr: { airflowClass: 'uvular_fricative', oral: 0.86, velocity: 0.72, width: 'wide', turbulent: true },

  m: { airflowClass: 'nasal', oral: 0, nasal: 0.76, velocity: 0.42, width: 'medium', turbulent: false },
  n: { airflowClass: 'nasal', oral: 0, nasal: 0.74, velocity: 0.4, width: 'medium', turbulent: false },
  ny: { airflowClass: 'nasal', oral: 0, nasal: 0.72, velocity: 0.38, width: 'medium', turbulent: false },

  ly: { airflowClass: 'liquid', oral: 0.36, velocity: 0.3, width: 'medium', turbulent: false },
  l: { airflowClass: 'liquid', oral: 0.4, velocity: 0.32, width: 'medium', turbulent: false },
  r: { airflowClass: 'liquid', oral: 0.38, velocity: 0.3, width: 'medium', turbulent: false },

  w: { airflowClass: 'glide', oral: 0.34, velocity: 0.28, width: 'narrow', turbulent: false },

  an: { airflowClass: 'nasal_vowel', oral: 0.26, nasal: 0.48, velocity: 0.38, width: 'medium' },
  en: { airflowClass: 'nasal_vowel', oral: 0.24, nasal: 0.5, velocity: 0.36, width: 'medium' },
  in: { airflowClass: 'nasal_vowel', oral: 0.22, nasal: 0.52, velocity: 0.34, width: 'medium' },
  on: { airflowClass: 'nasal_vowel', oral: 0.24, nasal: 0.5, velocity: 0.36, width: 'medium' },
  un: { airflowClass: 'nasal_vowel', oral: 0.22, nasal: 0.52, velocity: 0.34, width: 'medium' },
  anw: { airflowClass: 'nasal_vowel', oral: 0.28, nasal: 0.46, velocity: 0.38, width: 'medium' },
  ane: { airflowClass: 'nasal_vowel', oral: 0.26, nasal: 0.48, velocity: 0.38, width: 'medium' },
  one: { airflowClass: 'nasal_vowel', oral: 0.24, nasal: 0.5, velocity: 0.36, width: 'medium' },

  a: { airflowClass: 'vowel_short', oral: 0.66, velocity: 0.42, width: 'medium' },
  e: { airflowClass: 'vowel_short', oral: 0.6, velocity: 0.38, width: 'medium' },
  i: { airflowClass: 'vowel_short', oral: 0.56, velocity: 0.36, width: 'medium' },
  o: { airflowClass: 'vowel_short', oral: 0.64, velocity: 0.4, width: 'medium' },
  u: { airflowClass: 'vowel_short', oral: 0.6, velocity: 0.38, width: 'medium' },

  ei: { airflowClass: 'vowel_long', oral: 0.62, velocity: 0.4, width: 'medium' },
  au: { airflowClass: 'vowel_long', oral: 0.66, velocity: 0.42, width: 'medium' },
};

export default airflowOverrides;