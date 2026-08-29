const airflowOverrides = {
  'C:ب': { airflowClass: 'stop_unaspirated', oral: 0.4, velocity: 0.44, width: 'narrow', turbulent: false },
  'C:ت': { airflowClass: 'stop_unaspirated', oral: 0.46, velocity: 0.5, width: 'narrow', turbulent: false },
  'C:د': { airflowClass: 'stop_unaspirated', oral: 0.42, velocity: 0.46, width: 'narrow', turbulent: false },
  'C:ط': { airflowClass: 'stop_unaspirated', oral: 0.5, velocity: 0.54, width: 'narrow', turbulent: false },
  'C:ك': { airflowClass: 'stop_unaspirated', oral: 0.5, velocity: 0.54, width: 'medium', turbulent: false },
  'C:ق': { airflowClass: 'stop_unaspirated', oral: 0.54, velocity: 0.58, width: 'medium', turbulent: false },

  'C:ف': { airflowClass: 'fricative_weak', oral: 0.62, velocity: 0.5, width: 'medium', turbulent: true },
  'C:س': { airflowClass: 'fricative_strong', oral: 0.84, velocity: 0.68, width: 'narrow', turbulent: true },
  'C:ص': { airflowClass: 'fricative_strong', oral: 0.86, velocity: 0.7, width: 'narrow', turbulent: true },
  'C:ش': { airflowClass: 'fricative_strong', oral: 0.8, velocity: 0.66, width: 'medium', turbulent: true },
  'C:ز': { airflowClass: 'fricative_strong', oral: 0.78, velocity: 0.62, width: 'medium', turbulent: true },
  'C:ذ': { airflowClass: 'fricative_strong', oral: 0.74, velocity: 0.58, width: 'medium', turbulent: true },
  'C:ث': { airflowClass: 'fricative_strong', oral: 0.76, velocity: 0.6, width: 'medium', turbulent: true },
  'C:ظ': { airflowClass: 'fricative_strong', oral: 0.8, velocity: 0.64, width: 'medium', turbulent: true },
  'C:ض': { airflowClass: 'fricative_strong', oral: 0.78, velocity: 0.62, width: 'medium', turbulent: true },

  'C:خ': { airflowClass: 'fricative_strong', oral: 0.82, velocity: 0.68, width: 'wide', turbulent: true },
  'C:غ': { airflowClass: 'fricative_strong', oral: 0.76, velocity: 0.6, width: 'wide', turbulent: true },
  'C:ح': { airflowClass: 'fricative_soft', oral: 0.58, velocity: 0.46, width: 'wide', turbulent: true },
  'C:ه': { airflowClass: 'fricative_soft', oral: 0.56, velocity: 0.44, width: 'wide', turbulent: true },
  'C:ع': { airflowClass: 'liquid', oral: 0.34, velocity: 0.28, width: 'medium', turbulent: false },
  'C:ء': { airflowClass: 'closure', oral: 0.02, velocity: 0.06, width: 'narrow', turbulent: false },

  'C:م': { airflowClass: 'nasal', oral: 0.04, nasal: 0.76, velocity: 0.42, width: 'medium', turbulent: false },
  'C:ن': { airflowClass: 'nasal', oral: 0.04, nasal: 0.74, velocity: 0.4, width: 'medium', turbulent: false },

  'C:ل': { airflowClass: 'liquid', oral: 0.42, velocity: 0.34, width: 'medium', turbulent: false },
  'C:ر': { airflowClass: 'liquid', oral: 0.4, velocity: 0.34, width: 'medium', turbulent: false },

  'C:ي': { airflowClass: 'glide', oral: 0.3, velocity: 0.24, width: 'narrow', turbulent: false },
  'C:و': { airflowClass: 'glide', oral: 0.34, velocity: 0.28, width: 'narrow', turbulent: false },

  'V:a': { airflowClass: 'vowel_short', oral: 0.66, velocity: 0.44, width: 'medium' },
  'V:e': { airflowClass: 'vowel_short', oral: 0.6, velocity: 0.4, width: 'medium' },
  'V:i': { airflowClass: 'vowel_short', oral: 0.56, velocity: 0.38, width: 'medium' },
  'V:o': { airflowClass: 'vowel_short', oral: 0.64, velocity: 0.42, width: 'medium' },
  'V:u': { airflowClass: 'vowel_short', oral: 0.6, velocity: 0.4, width: 'medium' },

  'V:ا': { airflowClass: 'vowel_long', oral: 0.68, velocity: 0.46, width: 'medium' },
  'V:و': { airflowClass: 'vowel_long', oral: 0.64, velocity: 0.42, width: 'medium' },
  'V:ي': { airflowClass: 'vowel_long', oral: 0.6, velocity: 0.4, width: 'medium' },
};

export default airflowOverrides;