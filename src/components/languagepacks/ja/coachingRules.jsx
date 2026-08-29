const coachingRules = {
  locale: 'ja-JP',
  version: '1.0',
  rules: [
    {
      id: 'mora_timing',
      phonemes: ['a', 'i', 'u', 'e', 'o', 'n', 'q'],
      tip: 'Keep each mora even and steady instead of stretching English-style syllables.',
    },
    {
      id: 'yoon',
      phonemes: [
        'kya','kyu','kyo',
        'gya','gyu','gyo',
        'sha','shu','sho',
        'ja','ju','jo',
        'cha','chu','cho',
        'nya','nyu','nyo',
        'hya','hyu','hyo',
        'bya','byu','byo',
        'pya','pyu','pyo',
        'mya','myu','myo',
        'rya','ryu','ryo'
      ],
      tip: 'Blend contracted kana combinations as one mora, not two separate beats.',
    },
    {
      id: 'long_vowels',
      phonemes: ['a', 'i', 'u', 'e', 'o'],
      tip: 'When a long vowel appears, sustain the vowel smoothly without adding extra consonants.',
    },
  ],
};

export default coachingRules;