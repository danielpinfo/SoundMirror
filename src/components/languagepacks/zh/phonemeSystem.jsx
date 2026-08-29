/**
 * Chinese phoneme system
 * Pack-owned units aligned with PhonemeResolver output
 */

const phonemeSystem = {
  system: 'pack_units',
  locale: 'zh-CN',

  phonemes: [
    // Vowels / finals
    { symbol: 'a', type: 'vowel' },
    { symbol: 'e', type: 'vowel' },
    { symbol: 'i', type: 'vowel' },
    { symbol: 'o', type: 'vowel' },
    { symbol: 'u', type: 'vowel' },
    { symbol: 'v', type: 'vowel' },

    { symbol: 'ai', type: 'vowel' },
    { symbol: 'ei', type: 'vowel' },
    { symbol: 'ao', type: 'vowel' },
    { symbol: 'ou', type: 'vowel' },

    { symbol: 'an', type: 'vowel' },
    { symbol: 'en', type: 'vowel' },
    { symbol: 'ang', type: 'vowel' },
    { symbol: 'eng', type: 'vowel' },
    { symbol: 'ong', type: 'vowel' },

    { symbol: 'ia', type: 'vowel' },
    { symbol: 'ie', type: 'vowel' },
    { symbol: 'iao', type: 'vowel' },
    { symbol: 'iu', type: 'vowel' },

    { symbol: 'ian', type: 'vowel' },
    { symbol: 'in', type: 'vowel' },
    { symbol: 'iang', type: 'vowel' },
    { symbol: 'ing', type: 'vowel' },
    { symbol: 'iong', type: 'vowel' },

    { symbol: 'ua', type: 'vowel' },
    { symbol: 'uo', type: 'vowel' },
    { symbol: 'uai', type: 'vowel' },
    { symbol: 'ui', type: 'vowel' },

    { symbol: 'uan', type: 'vowel' },
    { symbol: 'un', type: 'vowel' },
    { symbol: 'uang', type: 'vowel' },
    { symbol: 'ueng', type: 'vowel' },

    { symbol: 've', type: 'vowel' },
    { symbol: 'van', type: 'vowel' },
    { symbol: 'vn', type: 'vowel' },

    { symbol: 'er', type: 'vowel' },

    // Stops / affricates / fricatives / nasals / liquids / glides
    { symbol: 'b', type: 'stop' },
    { symbol: 'p', type: 'stop' },
    { symbol: 'd', type: 'stop' },
    { symbol: 't', type: 'stop' },
    { symbol: 'g', type: 'stop' },
    { symbol: 'k', type: 'stop' },

    { symbol: 'j', type: 'affricate' },
    { symbol: 'q', type: 'affricate' },
    { symbol: 'zh', type: 'affricate' },
    { symbol: 'ch', type: 'affricate' },
    { symbol: 'z', type: 'affricate' },
    { symbol: 'c', type: 'affricate' },

    { symbol: 'f', type: 'fricative' },
    { symbol: 'h', type: 'fricative' },
    { symbol: 'x', type: 'fricative' },
    { symbol: 'sh', type: 'fricative' },
    { symbol: 's', type: 'fricative' },

    { symbol: 'm', type: 'nasal' },
    { symbol: 'n', type: 'nasal' },
    { symbol: 'ng', type: 'nasal' },

    { symbol: 'l', type: 'liquid' },
    { symbol: 'r', type: 'liquid' },

    { symbol: 'y', type: 'glide' },
    { symbol: 'w', type: 'glide' },
  ],
};

export default phonemeSystem;