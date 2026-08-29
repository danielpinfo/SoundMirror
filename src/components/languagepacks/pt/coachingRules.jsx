const coachingRules = {
  locale: 'pt-BR',
  version: '1.0',
  rules: [
    { id: 'nasal_vowels', phonemes: ['an', 'en', 'in', 'on', 'un', 'anw', 'ane', 'one'], tip: 'Mantenha a nasalização estável sem adicionar uma consoante final.' },
    { id: 'soft_cg', phonemes: ['s', 'zh'], tip: 'Use c suave em ce/ci e g suave em ge/gi com fluxo de ar contínuo.' },
    { id: 'palatal_clusters', phonemes: ['ny', 'ly', 'sh'], tip: 'Mantenha claros os grupos nh, lh e ch.' },
    { id: 'r_contrasts', phonemes: ['r', 'rr'], tip: 'Diferencie o r simples entre vogais do r forte no início e em rr.' },
  ],
};

export default coachingRules;