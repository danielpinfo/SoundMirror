const coachingRules = {
  locale: 'hi-IN',
  version: '1.0',
  rules: [
    { id: 'vowel_length', phonemes: ['a', 'aa', 'i', 'ii', 'u', 'uu'], tip: 'Keep short and long Hindi vowels distinct; do not stretch a short vowel into its long partner.' },
    { id: 'aspiration', phonemes: ['kh', 'gh', 'chh', 'jh', 'tth', 'ddh', 'th', 'dh', 'ph', 'bh'], tip: 'Release a clear breath after the consonant without inserting a new vowel.' },
    { id: 'dental_retroflex', phonemes: ['tt', 'tth', 'dd', 'ddh', 'nn', 't', 'th', 'd', 'dh', 'n'], tip: 'For retroflex sounds curl the tongue tip back; for dental sounds place it lightly against the upper teeth.' },
    { id: 'conjuncts', phonemes: [], tip: 'Join consonant clusters smoothly without adding an unwanted vowel between them.' },
  ],
};

export default coachingRules;
