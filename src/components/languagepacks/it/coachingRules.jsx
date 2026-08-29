const coachingRules = {
  locale: 'it-IT',
  version: '1.0',
  rules: [
    {
      id: 'geminate_consonants',
      phonemes: ['rr', 'r', 'l', 't', 's'],
      tip: 'Mantieni le consonanti doppie nette e ben separate, senza ridurle a un solo suono.',
    },
    {
      id: 'soft_cg',
      phonemes: ['ch', 'j'],
      tip: 'Per ce/ci e ge/gi usa un attacco morbido e pulito.',
    },
    {
      id: 'palatal_clusters',
      phonemes: ['ly', 'ny', 'sh'],
      tip: 'Mantieni chiari i gruppi palatali come gli, gn e sc davanti a e/i.',
    },
    {
      id: 'affricates',
      phonemes: ['ts', 'ch', 'j'],
      tip: 'Le affricate italiane iniziano con una breve chiusura seguita da rilascio controllato.',
    },
    {
      id: 'glides',
      phonemes: ['w'],
      tip: 'Mantieni una transizione rapida e leggera nei suoni scivolati.',
    },
    {
      id: 'vowels',
      phonemes: ['a', 'e', 'i', 'o', 'u'],
      tip: 'Mantieni le vocali pure e stabili, senza scivolare verso suoni inglesi.',
    },
  ],
};

export default coachingRules;