const phonemeSystem = {
  system: 'pack_units',
  locale: 'hi-IN',
  phonemes: [
    ...['a', 'aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au']
      .map((symbol) => ({ symbol, type: 'vowel' })),
    ...['k', 'kh', 'g', 'gh', 'tt', 'tth', 'dd', 'ddh', 't', 'th', 'd', 'dh', 'p', 'ph', 'b', 'bh', 'q']
      .map((symbol) => ({ symbol, type: 'stop' })),
    ...['ch', 'chh', 'j', 'jh'].map((symbol) => ({ symbol, type: 'affricate' })),
    ...['ng', 'ny', 'nn', 'n', 'm', '~'].map((symbol) => ({ symbol, type: 'nasal' })),
    ...['sh', 'ssh', 's', 'h', 'x', 'ghh', 'z', 'f', 'zh', 'v']
      .map((symbol) => ({ symbol, type: 'fricative' })),
    ...['y', 'r', 'l', 'rr', 'rrh'].map((symbol) => ({ symbol, type: 'approximant' })),
  ],
};

export default phonemeSystem;
