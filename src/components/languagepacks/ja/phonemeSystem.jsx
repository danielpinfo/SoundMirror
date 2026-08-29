const phonemeSystem = {
  system: 'japanese-mora-and-phone',
  locale: 'ja-JP',
  unit: 'mora',
  phonemes: [
    ...['a', 'i', 'u', 'e', 'o'].map((symbol) => ({ symbol, type: 'vowel' })),
    ...[
      'k', 'g', 's', 'z', 'sh', 'j', 't', 'd', 'ch', 'ts',
      'n', 'h', 'f', 'b', 'p', 'm', 'y', 'r', 'w', 'v', 'ng', 'l',
    ].map((symbol) => ({ symbol, type: 'consonant' })),
  ],
  moraInventory: [
    { symbol: 'a', type: 'mora' },
    { symbol: 'i', type: 'mora' },
    { symbol: 'u', type: 'mora' },
    { symbol: 'e', type: 'mora' },
    { symbol: 'o', type: 'mora' },

    { symbol: 'ka', type: 'mora' },
    { symbol: 'ki', type: 'mora' },
    { symbol: 'ku', type: 'mora' },
    { symbol: 'ke', type: 'mora' },
    { symbol: 'ko', type: 'mora' },

    { symbol: 'sa', type: 'mora' },
    { symbol: 'shi', type: 'mora' },
    { symbol: 'su', type: 'mora' },
    { symbol: 'se', type: 'mora' },
    { symbol: 'so', type: 'mora' },

    { symbol: 'ta', type: 'mora' },
    { symbol: 'chi', type: 'mora' },
    { symbol: 'tsu', type: 'mora' },
    { symbol: 'te', type: 'mora' },
    { symbol: 'to', type: 'mora' },

    { symbol: 'na', type: 'mora' },
    { symbol: 'ni', type: 'mora' },
    { symbol: 'nu', type: 'mora' },
    { symbol: 'ne', type: 'mora' },
    { symbol: 'no', type: 'mora' },

    { symbol: 'ha', type: 'mora' },
    { symbol: 'hi', type: 'mora' },
    { symbol: 'fu', type: 'mora' },
    { symbol: 'he', type: 'mora' },
    { symbol: 'ho', type: 'mora' },

    { symbol: 'ma', type: 'mora' },
    { symbol: 'mi', type: 'mora' },
    { symbol: 'mu', type: 'mora' },
    { symbol: 'me', type: 'mora' },
    { symbol: 'mo', type: 'mora' },

    { symbol: 'ya', type: 'mora' },
    { symbol: 'yu', type: 'mora' },
    { symbol: 'yo', type: 'mora' },

    { symbol: 'ra', type: 'mora' },
    { symbol: 'ri', type: 'mora' },
    { symbol: 'ru', type: 'mora' },
    { symbol: 're', type: 'mora' },
    { symbol: 'ro', type: 'mora' },

    { symbol: 'wa', type: 'mora' },
    { symbol: 'wo', type: 'mora' },

    { symbol: 'n', type: 'mora' },
    { symbol: 'q', type: 'mora' },

    { symbol: 'ga', type: 'mora' },
    { symbol: 'gi', type: 'mora' },
    { symbol: 'gu', type: 'mora' },
    { symbol: 'ge', type: 'mora' },
    { symbol: 'go', type: 'mora' },

    { symbol: 'za', type: 'mora' },
    { symbol: 'ji', type: 'mora' },
    { symbol: 'zu', type: 'mora' },
    { symbol: 'ze', type: 'mora' },
    { symbol: 'zo', type: 'mora' },

    { symbol: 'da', type: 'mora' },
    { symbol: 'de', type: 'mora' },
    { symbol: 'do', type: 'mora' },

    { symbol: 'ba', type: 'mora' },
    { symbol: 'bi', type: 'mora' },
    { symbol: 'bu', type: 'mora' },
    { symbol: 'be', type: 'mora' },
    { symbol: 'bo', type: 'mora' },

    { symbol: 'pa', type: 'mora' },
    { symbol: 'pi', type: 'mora' },
    { symbol: 'pu', type: 'mora' },
    { symbol: 'pe', type: 'mora' },
    { symbol: 'po', type: 'mora' },

    { symbol: 'kya', type: 'mora' },
    { symbol: 'kyu', type: 'mora' },
    { symbol: 'kyo', type: 'mora' },

    { symbol: 'gya', type: 'mora' },
    { symbol: 'gyu', type: 'mora' },
    { symbol: 'gyo', type: 'mora' },

    { symbol: 'sha', type: 'mora' },
    { symbol: 'shu', type: 'mora' },
    { symbol: 'sho', type: 'mora' },

    { symbol: 'ja', type: 'mora' },
    { symbol: 'ju', type: 'mora' },
    { symbol: 'jo', type: 'mora' },

    { symbol: 'cha', type: 'mora' },
    { symbol: 'chu', type: 'mora' },
    { symbol: 'cho', type: 'mora' },

    { symbol: 'nya', type: 'mora' },
    { symbol: 'nyu', type: 'mora' },
    { symbol: 'nyo', type: 'mora' },

    { symbol: 'hya', type: 'mora' },
    { symbol: 'hyu', type: 'mora' },
    { symbol: 'hyo', type: 'mora' },

    { symbol: 'bya', type: 'mora' },
    { symbol: 'byu', type: 'mora' },
    { symbol: 'byo', type: 'mora' },

    { symbol: 'pya', type: 'mora' },
    { symbol: 'pyu', type: 'mora' },
    { symbol: 'pyo', type: 'mora' },

    { symbol: 'mya', type: 'mora' },
    { symbol: 'myu', type: 'mora' },
    { symbol: 'myo', type: 'mora' },

    { symbol: 'rya', type: 'mora' },
    { symbol: 'ryu', type: 'mora' },
    { symbol: 'ryo', type: 'mora' },

    { symbol: 'long_vowel', type: 'modifier' },
  ],
};

export default phonemeSystem;
