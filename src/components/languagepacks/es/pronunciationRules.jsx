/**
 * Spanish pronunciation rules.
 *
 * Pack-owned reference rules for Spanish spelling-to-sound behavior.
 * These mirror the Spanish resolver’s broad logic and are safe for display,
 * documentation, or future helper use.
 */

export const pronunciationRules = [
  {
    id: 'pure_vowels',
    description: 'Spanish vowels stay clear and stable: a, e, i, o, u.',
    examples: ['casa', 'mesa', 'sí', 'no', 'tú'],
  },
  {
    id: 'silent_h',
    description: 'The letter h is silent in Spanish.',
    examples: ['hola', 'hasta'],
  },
  {
    id: 'll_as_y',
    description: 'The letters ll are treated as a y sound in this pack.',
    examples: ['llama', 'calle'],
  },
  {
    id: 'ñ_as_ny',
    description: 'The letter ñ is treated as the Spanish ny sound.',
    examples: ['niño', 'mañana'],
  },
  {
    id: 'distinct_v',
    description: 'SoundMirror keeps v distinct from b for visual practice and grading.',
    examples: ['vaca', 'vida'],
  },
  {
    id: 'j_as_h',
    description: 'The letter j is treated as an h-like Spanish sound.',
    examples: ['jugar', 'rojo'],
  },
  {
    id: 'soft_c',
    description: 'Before e or i, c is treated as s in this Spanish pack.',
    examples: ['cena', 'cinco'],
  },
  {
    id: 'hard_c',
    description: 'Before a, o, u, or a consonant, c is treated as k.',
    examples: ['casa', 'copa', 'cuna'],
  },
  {
    id: 'qu_as_k',
    description: 'The letters qu are treated as k.',
    examples: ['que', 'quiero'],
  },
  {
    id: 'soft_g',
    description: 'Before e or i, g is treated as an h-like Spanish sound.',
    examples: ['gente', 'girar'],
  },
  {
    id: 'hard_g',
    description: 'Before a, o, u, or a consonant, g is treated as g.',
    examples: ['gato', 'goma', 'gusto'],
  },
  {
    id: 'gue_gui',
    description: 'In gue and gui, the u is silent and g stays hard.',
    examples: ['guerra', 'guitarra'],
  },
  {
    id: 'gue_gui_diaeresis',
    description: 'In güe and güi, the ü is pronounced as w/u.',
    examples: ['vergüenza', 'pingüino'],
  },
  {
    id: 'rr_trill',
    description: 'rr is treated as the Spanish trill.',
    examples: ['perro', 'carro'],
  },
  {
    id: 'strong_initial_r',
    description: 'Initial r and r after n, l, or s are treated as the stronger rr sound.',
    examples: ['rosa', 'enredo', 'alrededor'],
  },
  {
    id: 'x_as_ks',
    description: 'The letter x is treated as k plus s.',
    examples: ['examen', 'éxito'],
  },
];

export default pronunciationRules;
