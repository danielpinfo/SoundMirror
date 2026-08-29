/**
 * Portuguese pack-owned pronunciation rules.
 *
 * These rules are learner-facing guidance only. They do not create AS timing
 * and they do not replace the resolver. The resolver remains the source of
 * expected phonemes for AS/UAS comparison.
 */

export const pronunciationRules = [
  {
    id: 'pt-nasal-ao',
    title: 'ão',
    pattern: 'ão',
    helper: 'Sounds like a nasal “ow.” Keep the sound in the nose: ão.',
    examples: ['não', 'pão', 'coração'],
  },
  {
    id: 'pt-nasal-vowels',
    title: 'Nasal vowels',
    pattern: 'ã, õ, vowel + m/n',
    helper:
      'Portuguese often nasalizes vowels. Let some air resonate through the nose without adding a strong final n.',
    examples: ['sim', 'bom', 'bem', 'mãe'],
  },
  {
    id: 'pt-nh',
    title: 'nh',
    pattern: 'nh',
    helper: 'Sounds like a soft “ny,” similar to Spanish ñ.',
    examples: ['vinho', 'minha', 'amanhã'],
  },
  {
    id: 'pt-lh',
    title: 'lh',
    pattern: 'lh',
    helper: 'Sounds like a soft “ly” made with the middle of the tongue raised.',
    examples: ['olho', 'filho', 'trabalho'],
  },
  {
    id: 'pt-ch',
    title: 'ch',
    pattern: 'ch',
    helper: 'Usually sounds like “sh.”',
    examples: ['chave', 'chegar', 'chá'],
  },
  {
    id: 'pt-j-ge-gi',
    title: 'j / ge / gi',
    pattern: 'j, ge, gi',
    helper: 'Often sounds like the “s” in “measure,” shown here as j.',
    examples: ['já', 'beijo', 'gente', 'girar'],
  },
  {
    id: 'pt-ce-ci-ca-co-cu',
    title: 'c',
    pattern: 'ce, ci, ca, co, cu',
    helper:
      'Before e or i, c sounds like s. Before a, o, or u, c sounds like k.',
    examples: ['cinco', 'cedo', 'casa', 'como', 'cura'],
  },
  {
    id: 'pt-que-qui',
    title: 'que / qui',
    pattern: 'que, qui',
    helper: 'The u is usually silent: que sounds like ke, and qui sounds like ki.',
    examples: ['que', 'aqui', 'quero'],
  },
  {
    id: 'pt-gue-gui',
    title: 'gue / gui',
    pattern: 'gue, gui',
    helper:
      'The u is usually silent: gue sounds like ge, and gui sounds like gi with a hard g.',
    examples: ['guerra', 'guitarra', 'seguir'],
  },
  {
    id: 'pt-s-between-vowels',
    title: 's between vowels',
    pattern: 'vowel + s + vowel',
    helper: 'Between vowels, s often sounds like z.',
    examples: ['casa', 'mesa', 'presente'],
  },
  {
    id: 'pt-rr-initial-r',
    title: 'rr and starting r',
    pattern: 'rr, word-start r',
    helper:
      'A starting r or rr is usually stronger than a single r between vowels. Regional accents vary.',
    examples: ['rua', 'rápido', 'carro'],
  },
  {
    id: 'pt-single-r',
    title: 'single r between vowels',
    pattern: 'vowel + r + vowel',
    helper: 'A single r between vowels is lighter and quicker.',
    examples: ['caro', 'agora', 'marido'],
  },
  {
    id: 'pt-ti-di',
    title: 'ti / di',
    pattern: 'ti, di',
    helper:
      'In many Brazilian accents, ti can sound close to “chee,” and di can sound close to “jee.”',
    examples: ['dia', 'cidade', 'tipo'],
  },
];

export default pronunciationRules;