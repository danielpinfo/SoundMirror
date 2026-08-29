/**
 * Portuguese (Brazil) phoneme system
 * Pack-owned units aligned with PhonemeResolver output
 */

const phonemeSystem = {
  system: 'pack_units',
  locale: 'pt-BR',

  phonemes: [
    // Vowels
    { symbol: 'a', type: 'vowel' },
    { symbol: 'e', type: 'vowel' },
    { symbol: 'i', type: 'vowel' },
    { symbol: 'o', type: 'vowel' },
    { symbol: 'u', type: 'vowel' },

    // Diphthongs
    { symbol: 'ei', type: 'vowel' },
    { symbol: 'au', type: 'vowel' },

    // Nasal vowels
    { symbol: 'an', type: 'vowel' },
    { symbol: 'en', type: 'vowel' },
    { symbol: 'in', type: 'vowel' },
    { symbol: 'on', type: 'vowel' },
    { symbol: 'un', type: 'vowel' },

    // Nasal diphthongs
    { symbol: 'anw', type: 'vowel' },
    { symbol: 'ane', type: 'vowel' },
    { symbol: 'one', type: 'vowel' },

    // Glides
    { symbol: 'w', type: 'glide' },

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
    { symbol: 'z', type: 'fricative' },
    { symbol: 'sh', type: 'fricative' },
    { symbol: 'zh', type: 'fricative' },
    { symbol: 'rr', type: 'fricative' },

    // Liquids
    { symbol: 'r', type: 'tap' },
    { symbol: 'l', type: 'approximant' },

    // Palatal
    { symbol: 'ly', type: 'glide' },
  ],
};

export default phonemeSystem;