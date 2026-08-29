const airflowOverrides = {
  p: { airflowClass: 'stop_aspirated', oral: 0.66, velocity: 0.76, width: 'medium', turbulent: true },
  t: { airflowClass: 'stop_aspirated', oral: 0.68, velocity: 0.78, width: 'medium', turbulent: true },
  k: { airflowClass: 'stop_aspirated', oral: 0.72, velocity: 0.82, width: 'wide', turbulent: true },
  b: { airflowClass: 'stop_unaspirated', oral: 0.38, velocity: 0.42, width: 'narrow', turbulent: false },
  d: { airflowClass: 'stop_unaspirated', oral: 0.4, velocity: 0.44, width: 'narrow', turbulent: false },
  g: { airflowClass: 'stop_unaspirated', oral: 0.44, velocity: 0.48, width: 'medium', turbulent: false },

  f: { airflowClass: 'fricative_weak', oral: 0.6, velocity: 0.48, width: 'medium', turbulent: true },
  v: { airflowClass: 'fricative_weak', oral: 0.58, velocity: 0.46, width: 'medium', turbulent: true },
  s: { airflowClass: 'fricative_strong', oral: 0.84, velocity: 0.68, width: 'narrow', turbulent: true },
  z: { airflowClass: 'fricative_strong', oral: 0.78, velocity: 0.62, width: 'medium', turbulent: true },
  sh: { airflowClass: 'fricative_strong', oral: 0.8, velocity: 0.64, width: 'medium', turbulent: true },
  h: { airflowClass: 'fricative_strong', oral: 0.68, velocity: 0.54, width: 'wide', turbulent: false },
  kh: { airflowClass: 'dorsal_fricative_hard', oral: 0.78, velocity: 0.62, width: 'medium', turbulent: true },

  ts: { airflowClass: 'affricate', oral: 0.8, velocity: 0.76, width: 'medium', turbulent: true },
  pf: { airflowClass: 'cluster_release', oral: 0.82, velocity: 0.74, width: 'medium', turbulent: true },

  m: { airflowClass: 'nasal', oral: 0.04, nasal: 0.76, velocity: 0.42, width: 'medium', turbulent: false },
  n: { airflowClass: 'nasal', oral: 0.04, nasal: 0.74, velocity: 0.4, width: 'medium', turbulent: false },

  l: { airflowClass: 'liquid', oral: 0.4, velocity: 0.32, width: 'medium', turbulent: false },
  r: { airflowClass: 'liquid', oral: 0.42, velocity: 0.34, width: 'medium', turbulent: false },
  y: { airflowClass: 'glide', oral: 0.3, velocity: 0.24, width: 'narrow', turbulent: false },

  a: { airflowClass: 'vowel_short', oral: 0.64, velocity: 0.4, width: 'medium' },
  e: { airflowClass: 'vowel_short', oral: 0.58, velocity: 0.36, width: 'medium' },
  i: { airflowClass: 'vowel_short', oral: 0.56, velocity: 0.34, width: 'medium' },
  o: { airflowClass: 'vowel_short', oral: 0.62, velocity: 0.38, width: 'medium' },
  u: { airflowClass: 'vowel_short', oral: 0.6, velocity: 0.36, width: 'medium' },
  oe: { airflowClass: 'vowel_long', oral: 0.6, velocity: 0.38, width: 'medium' },
  ue: { airflowClass: 'vowel_long', oral: 0.6, velocity: 0.38, width: 'medium' },
  ai: { airflowClass: 'vowel_long', oral: 0.68, velocity: 0.44, width: 'wide' },
  ee: { airflowClass: 'vowel_long', oral: 0.58, velocity: 0.36, width: 'medium' },
};

export default airflowOverrides;