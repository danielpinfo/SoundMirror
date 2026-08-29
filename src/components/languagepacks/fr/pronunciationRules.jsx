/**
 * French pronunciation rules.
 *
 * Pack-owned reference rules for French spelling-to-sound behavior.
 * These mirror the French resolver’s broad logic and are safe for display,
 * documentation, or future helper use.
 */

export const pronunciationRules = [
  {
    id: 'silent_h',
    description: 'The letter h is usually silent in this French pack.',
    examples: ['homme', 'hôtel'],
  },
  {
    id: 'eau_au_as_o',
    description: 'eau and au are treated as an o sound.',
    examples: ['beau', 'eau', 'chaud'],
  },
  {
    id: 'nasal_in',
    description: 'ain, ein, in, im, yn, and ym can form the French nasal in sound.',
    examples: ['pain', 'vin', 'simple'],
  },
  {
    id: 'nasal_an',
    description: 'an, am, en, and em can form the French nasal an sound.',
    examples: ['dans', 'enfant', 'temps'],
  },
  {
    id: 'nasal_on',
    description: 'on and om can form the French nasal on sound.',
    examples: ['bon', 'nom'],
  },
  {
    id: 'nasal_un',
    description: 'un and um can form the French nasal un sound.',
    examples: ['un', 'parfum'],
  },
  {
    id: 'gn_as_ny',
    description: 'gn is treated like a ny / gn sound.',
    examples: ['montagne', 'ligne'],
  },
  {
    id: 'oi_as_wa',
    description: 'oi is treated as wa.',
    examples: ['moi', 'trois'],
  },
  {
    id: 'ou_as_oo',
    description: 'ou is treated as the French ou sound.',
    examples: ['vous', 'bonjour'],
  },
  {
    id: 'eu_oeu',
    description: 'eu and œu are treated as the French eu sound.',
    examples: ['peu', 'sœur'],
  },
  {
    id: 'ch_as_sh',
    description: 'ch is treated as a sh sound.',
    examples: ['chat', 'chose'],
  },
  {
    id: 'ph_as_f',
    description: 'ph is treated as f.',
    examples: ['photo', 'phrase'],
  },
  {
    id: 'qu_as_k',
    description: 'qu is treated as k.',
    examples: ['qui', 'quand'],
  },
  {
    id: 'soft_c',
    description: 'Before e, i, y, or accented front vowels, c is treated as s.',
    examples: ['ceci', 'cinq'],
  },
  {
    id: 'hard_c',
    description: 'Before a, o, u, or a consonant, c is treated as k.',
    examples: ['car', 'côté', 'cuisine'],
  },
  {
    id: 'cedilla_c',
    description: 'ç is treated as s.',
    examples: ['ça', 'français'],
  },
  {
    id: 'soft_g',
    description: 'Before e, i, y, or accented front vowels, g is treated as j / zh.',
    examples: ['général', 'girafe'],
  },
  {
    id: 'hard_g',
    description: 'Before a, o, u, or a consonant, g is treated as g.',
    examples: ['gare', 'gomme', 'guide'],
  },
  {
    id: 'j_as_zh',
    description: 'j is treated as the French j / zh sound.',
    examples: ['je', 'bonjour'],
  },
  {
    id: 's_between_vowels',
    description: 's between vowels is treated as z.',
    examples: ['maison', 'oiseau'],
  },
  {
    id: 'ss_as_s',
    description: 'ss is treated as s.',
    examples: ['poisson', 'dessert'],
  },
  {
    id: 'final_consonants',
    description: 'Some final consonants are silent unless liaison applies.',
    examples: ['salut', 'grand homme'],
  },
];

export default pronunciationRules;