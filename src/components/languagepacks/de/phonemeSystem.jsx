const phonemeSystem = {
  system: 'pack_units',
  locale: 'de-DE',
  phonemes: [
    { symbol: 'a', type: 'vowel' },
    { symbol: 'e', type: 'vowel' },
    { symbol: 'i', type: 'vowel' },
    { symbol: 'o', type: 'vowel' },
    { symbol: 'u', type: 'vowel' },
    { symbol: 'oe', type: 'vowel' },
    { symbol: 'ue', type: 'vowel' },
    { symbol: 'ai', type: 'vowel' },
    { symbol: 'ee', type: 'vowel' },

    { symbol: 'b', type: 'stop' },
    { symbol: 'p', type: 'stop' },
    { symbol: 't', type: 'stop' },
    { symbol: 'd', type: 'stop' },
    { symbol: 'k', type: 'stop' },
    { symbol: 'g', type: 'stop' },

    { symbol: 'm', type: 'nasal' },
    { symbol: 'n', type: 'nasal' },

    { symbol: 'f', type: 'fricative' },
    { symbol: 'v', type: 'fricative' },
    { symbol: 's', type: 'fricative' },
    { symbol: 'z', type: 'fricative' },
    { symbol: 'sh', type: 'fricative' },
    { symbol: 'kh', type: 'fricative' },
    { symbol: 'ch', type: 'fricative' },
    { symbol: 'h', type: 'fricative' },

    { symbol: 'ts', type: 'affricate' },
    { symbol: 'pf', type: 'affricate' },

    { symbol: 'r', type: 'tap' },
    { symbol: 'l', type: 'approximant' },
    { symbol: 'y', type: 'approximant' },
  ],
};

export default phonemeSystem;