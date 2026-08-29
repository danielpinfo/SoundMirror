const phonemeSystem = {
  system: 'pack_units',
  locale: 'es-US',

  phonemes: [
    // Vowels
    { symbol: 'a', type: 'vowel' },
    { symbol: 'e', type: 'vowel' },
    { symbol: 'i', type: 'vowel' },
    { symbol: 'o', type: 'vowel' },
    { symbol: 'u', type: 'vowel' },

    // Stops
    { symbol: 'b', type: 'stop' },
    { symbol: 'p', type: 'stop' },
    { symbol: 't', type: 'stop' },
    { symbol: 'd', type: 'stop' },
    { symbol: 'k', type: 'stop' },
    { symbol: 'g', type: 'stop' },

    // Nasals
    { symbol: 'm', type: 'nasal' },
    { symbol: 'n', type: 'nasal' },
    { symbol: 'ny', type: 'nasal' },

    // Fricatives
    { symbol: 'f', type: 'fricative' },
    { symbol: 'v', type: 'fricative' },
    { symbol: 's', type: 'fricative' },
    { symbol: 'h', type: 'fricative' },

    // Affricate
    { symbol: 'ch', type: 'affricate' },

    // Rhotics
    { symbol: 'r', type: 'tap' },
    { symbol: 'rr', type: 'trill' },

    // Laterals / Glides
    { symbol: 'l', type: 'liquid' },
    { symbol: 'y', type: 'glide' },
    { symbol: 'w', type: 'glide' },
  ],
};

export default phonemeSystem;
