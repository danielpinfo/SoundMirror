const coachingRules = {
  locale: 'fr-FR',
  version: '1.0',
  rules: [
    { 
      id: 'nasal_vowels', 
      phonemes: ['an', 'on', 'in', 'un'], 
      tip: 'Maintiens les voyelles nasales stables sans ajouter une consonne finale.' 
    },
    { 
      id: 'soft_hard_cg', 
      phonemes: ['s', 'k', 'zh', 'g'], 
      tip: 'Distingue bien c/g doux avant e/i/y et durs ailleurs.' 
    },
    { 
      id: 'oi_ou_eu', 
      phonemes: ['wa', 'oo', 'eu'], 
      tip: 'Garde les groupes oi, ou et eu comme unités vocaliques stables.' 
    },
    { 
      id: 'silent_h_finals', 
      phonemes: [], 
      tip: 'Le h reste muet et beaucoup de consonnes finales restent silencieuses dans l’aide.' 
    },
  ],
};

export default coachingRules;