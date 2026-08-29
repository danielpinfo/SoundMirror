const phonemeSystem = {
  system: 'pack_units',
  locale: 'it-IT',
  phonemes: [
    { symbol: 'a', type: 'vowel' },
    { symbol: 'e', type: 'vowel' },
    { symbol: 'i', type: 'vowel' },
    { symbol: 'o', type: 'vowel' },
    { symbol: 'u', type: 'vowel' },

    { symbol: 'w', type: 'glide' },

    { symbol: 'b', type: 'stop' },
    { symbol: 'p', type: 'stop' },
    { symbol: 't', type: 'stop' },
    { symbol: 'd', type: 'stop' },
    { symbol: 'k', type: 'stop' },
    { symbol: 'g', type: 'stop' },

    { symbol: 'm', type: 'nasal' },
    { symbol: 'n', type: 'nasal' },
    { symbol: 'ny', type: 'nasal' },

    { symbol: 'f', type: 'fricative' },
    { symbol: 'v', type: 'fricative' },
    { symbol: 's', type: 'fricative' },
    { symbol: 'sh', type: 'fricative' },

    { symbol: 'ch', type: 'affricate' },
    { symbol: 'j', type: 'affricate' },
    { symbol: 'ts', type: 'affricate' },

    { symbol: 'r', type: 'tap' },
    { symbol: 'rr', type: 'trill' },

    { symbol: 'l', type: 'lateral' },
    { symbol: 'ly', type: 'lateral' },
  ],
};

export default phonemeSystem;