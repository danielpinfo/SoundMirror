const coachingRules = {
  locale: 'zh-CN',
  version: '1.0',
  rules: [
    {
      id: 'syllable_timing',
      phonemes: ['a', 'e', 'i', 'o', 'u', 'v', 'n', 'ng'],
      tip: 'Keep each syllable clear and even instead of blending them into English-like stress patterns.',
    },
    {
      id: 'aspiration_contrast',
      phonemes: ['p', 't', 'k', 'q', 'ch', 'c', 'b', 'd', 'g', 'j', 'zh', 'z'],
      tip: 'Keep aspirated and unaspirated sounds clearly distinct; the release and airflow matter.',
    },
    {
      id: 'retroflex_and_alveopalatal',
      phonemes: ['zh', 'ch', 'sh', 'r', 'j', 'q', 'x'],
      tip: 'Keep retroflex and fronted Mandarin tongue shapes distinct instead of collapsing them together.',
    },
    {
      id: 'nasal_finals',
      phonemes: ['n', 'ng'],
      tip: 'Finish nasal endings cleanly and do not let final -n and -ng blur together.',
    },
    {
      id: 'glides',
      phonemes: ['y', 'w'],
      tip: 'Use a light glide into the vowel instead of adding extra English-style consonant force.',
    },
    {
      id: 'tones_internal',
      phonemes: ['a', 'e', 'i', 'o', 'u', 'v'],
      tip: 'Tones may be tracked internally, but helper display stays fully Chinese.',
    },
  ],
};

export default coachingRules;