/**
 * Italian pronunciation rules.
 *
 * Pack-owned reference rules for Italian spelling-to-sound behavior.
 * These mirror the Italian resolver’s broad logic and are safe for display,
 * documentation, or future helper use.
 */

export const pronunciationRules = [
  {
    id: 'pure_vowels',
    description: 'Italian vowels stay clear and stable: a, e, i, o, u.',
    examples: ['casa', 'bene', 'sì', 'no', 'tu'],
  },
  {
    id: 'silent_h',
    description: 'The letter h is silent by itself, but it can help make c or g hard before e or i.',
    examples: ['ho', 'che', 'chi', 'ghe', 'ghi'],
  },
  {
    id: 'gn_as_ny',
    description: 'gn is treated like the Italian gn / ny sound.',
    examples: ['gnocchi', 'bagno'],
  },
  {
    id: 'gli_as_ly',
    description: 'gli is treated like the Italian gli sound when followed by a vowel or at the end of a word.',
    examples: ['gli', 'famiglia'],
  },
  {
    id: 'sc_front_vowel',
    description: 'sc before e or i is treated as sh.',
    examples: ['scena', 'scimmia'],
  },
  {
    id: 'hard_sc',
    description: 'sc before a, o, u, or a consonant is treated as s plus k.',
    examples: ['scala', 'scuola'],
  },
  {
    id: 'soft_c',
    description: 'c before e or i is treated as ch.',
    examples: ['cena', 'ciao'],
  },
  {
    id: 'hard_c',
    description: 'c before a, o, u, or a consonant is treated as k.',
    examples: ['casa', 'cosa', 'cura'],
  },
  {
    id: 'hard_ch',
    description: 'ch before e or i is treated as k.',
    examples: ['che', 'chi'],
  },
  {
    id: 'soft_g',
    description: 'g before e or i is treated as j.',
    examples: ['gelato', 'giro'],
  },
  {
    id: 'hard_g',
    description: 'g before a, o, u, or a consonant is treated as g.',
    examples: ['gatto', 'gola', 'gusto'],
  },
  {
    id: 'hard_gh',
    description: 'gh before e or i is treated as g.',
    examples: ['spaghetti', 'ghiaccio'],
  },
  {
    id: 'qu_as_kw',
    description: 'qu is treated as k plus w.',
    examples: ['qui', 'quando'],
  },
  {
    id: 'z_as_ts',
    description: 'z is treated as ts in this Italian pack.',
    examples: ['pizza', 'zio'],
  },
  {
    id: 'double_consonants',
    description: 'Doubled consonants are held or repeated more strongly.',
    examples: ['pizza', 'bella', 'mamma'],
  },
  {
    id: 'double_r',
    description: 'rr is treated as a stronger rolled r.',
    examples: ['terra', 'carro'],
  },
  {
    id: 'x_as_ks',
    description: 'x is treated as k plus s.',
    examples: ['extra'],
  },
];

export default pronunciationRules;