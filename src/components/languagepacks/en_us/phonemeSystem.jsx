/**
 * SoundMirror Phoneme System
 * English (US)
 *
 * Canonical pack-owned phonology layer.
 *
 * Single source of truth for:
 * - canonical phoneme symbols
 * - ARPABET aliases
 * - helper labels
 * - phoneme classes
 * - analysis normalization hooks
 *
 * IMPORTANT: Frame mapping authority lives in articulationMap.jsx, not here.
 */

const phonemeSystem = {
  system: 'pack_units',
  locale: 'en-US',

  phonemes: [
    /*
     * Vowels
     *
     * Important open-vowel distinction:
     *
     * a  = AE, short A as in "jab"
     * aa = AA, open AH as in "job"
     * ah = AH, reduced/STRUT vowel as in "cup"
     * ue = UH, FOOT vowel as in "book"
     */
    {
      symbol: 'a',
      arpabet: ['AE'],
      helper: 'a',
      type: 'vowel',
    },
    {
      symbol: 'aa',
      arpabet: ['AA'],
      helper: 'ah',
      type: 'vowel',
    },
    {
      symbol: 'ah',
      arpabet: ['AH'],
      helper: 'uh',
      type: 'vowel',
    },
    {
      symbol: 'e',
      arpabet: ['EH'],
      helper: 'e',
      type: 'vowel',
    },
    {
      symbol: 'ee',
      arpabet: ['IY'],
      helper: 'ee',
      type: 'vowel',
    },
    {
      symbol: 'i',
      arpabet: ['IH'],
      helper: 'i',
      type: 'vowel',
    },
    {
      symbol: 'ue',
      arpabet: ['UH'],
      helper: 'u',
      type: 'vowel',
    },
    {
      symbol: 'oo',
      arpabet: ['UW'],
      helper: 'oo',
      type: 'vowel',
    },
    {
      symbol: 'o',
      arpabet: ['AO'],
      helper: 'o',
      type: 'vowel',
    },
    {
      symbol: 'ow',
      arpabet: ['OW'],
      helper: 'oh',
      type: 'vowel',
    },
    {
      symbol: 'aw',
      arpabet: ['AW'],
      helper: 'ow',
      type: 'vowel',
    },
    {
      symbol: 'ai',
      arpabet: ['AY'],
      helper: 'ai',
      type: 'vowel',
    },
    {
      symbol: 'oi',
      arpabet: ['OY'],
      helper: 'oi',
      type: 'vowel',
    },
    {
      symbol: 'er',
      arpabet: ['ER'],
      helper: 'er',
      type: 'vowel',
    },
    {
      symbol: 'ei',
      arpabet: ['EY'],
      helper: 'ei',
      type: 'vowel',
    },

    // Stops
    {
      symbol: 'b',
      arpabet: ['B'],
      helper: 'b',
      type: 'stop',
    },
    {
      symbol: 'p',
      arpabet: ['P'],
      helper: 'p',
      type: 'stop',
    },
    {
      symbol: 't',
      arpabet: ['T'],
      helper: 't',
      type: 'stop',
    },
    {
      symbol: 'd',
      arpabet: ['D'],
      helper: 'd',
      type: 'stop',
    },
    {
      symbol: 'k',
      arpabet: ['K'],
      helper: 'k',
      type: 'stop',
    },
    {
      symbol: 'g',
      arpabet: ['G'],
      helper: 'g',
      type: 'stop',
    },

    // Nasals
    {
      symbol: 'm',
      arpabet: ['M'],
      helper: 'm',
      type: 'nasal',
    },
    {
      symbol: 'n',
      arpabet: ['N'],
      helper: 'n',
      type: 'nasal',
    },
    {
      symbol: 'ng',
      arpabet: ['NG'],
      helper: 'ng',
      type: 'nasal',
    },

    // Fricatives
    {
      symbol: 'f',
      arpabet: ['F'],
      helper: 'f',
      type: 'fricative',
    },
    {
      symbol: 'v',
      arpabet: ['V'],
      helper: 'v',
      type: 'fricative',
    },
    {
      symbol: 's',
      arpabet: ['S'],
      helper: 's',
      type: 'fricative',
    },
    {
      symbol: 'z',
      arpabet: ['Z'],
      helper: 'z',
      type: 'fricative',
    },
    {
      symbol: 'sh',
      arpabet: ['SH'],
      helper: 'sh',
      type: 'fricative',
    },
    {
      symbol: 'zh',
      arpabet: ['ZH'],
      helper: 'zh',
      type: 'fricative',
    },
    {
      symbol: 'th',
      arpabet: ['TH'],
      helper: 'th',
      type: 'fricative',
    },
    {
      symbol: 'dh',
      arpabet: ['DH'],
      helper: 'th',
      type: 'fricative',
    },
    {
      symbol: 'h',
      arpabet: ['HH'],
      helper: 'h',
      type: 'fricative',
    },

    // Affricates
    {
      symbol: 'ch',
      arpabet: ['CH'],
      helper: 'ch',
      type: 'affricate',
    },
    {
      symbol: 'j',
      arpabet: ['JH'],
      helper: 'j',
      type: 'affricate',
    },

    // Approximants / liquids / glides
    {
      symbol: 'r',
      arpabet: ['R'],
      helper: 'r',
      type: 'approximant',
    },
    {
      symbol: 'l',
      arpabet: ['L'],
      helper: 'l',
      type: 'approximant',
    },
    {
      symbol: 'y',
      arpabet: ['Y'],
      helper: 'y',
      type: 'glide',
    },
    {
      symbol: 'w',
      arpabet: ['W'],
      helper: 'w',
      type: 'glide',
    },
  ],
};

export const phonemeLookup = (() => {
  const map = {};

  for (const phoneme of phonemeSystem.phonemes) {
    map[phoneme.symbol] = phoneme;
  }

  return map;
})();

export const arpabetLookup = (() => {
  const map = {};

  for (const phoneme of phonemeSystem.phonemes) {
    for (const code of phoneme.arpabet || []) {
      map[code] = phoneme.symbol;
    }
  }

  return map;
})();

export const helperLookup = (() => {
  const map = {};

  for (const phoneme of phonemeSystem.phonemes) {
    map[phoneme.symbol] = phoneme.helper;
  }

  return map;
})();

export const vowelSet = new Set(
  phonemeSystem.phonemes
    .filter((phoneme) => phoneme.type === 'vowel')
    .map((phoneme) => phoneme.symbol)
);

export function isVowel(symbol) {
  return vowelSet.has(symbol);
}

export function normalizeArpabet(symbol) {
  if (!symbol) return null;

  return (
    arpabetLookup[
      String(symbol).toUpperCase()
    ] ?? null
  );
}

export function helperForPhoneme(symbol) {
  return helperLookup[symbol] ?? symbol;
}

export default phonemeSystem;