 /**
 * Chinese pack-owned pronunciation rules.
 *
 * These rules are learner-facing guidance only. They do not create AS timing
 * and they do not replace the resolver. The resolver remains the source of
 * expected phonemes for AS/UAS comparison.
 */

export const pronunciationRules = [
  {
    id: 'zh-initial-final',
    title: 'initials and finals',
    pattern: 'pinyin syllables',
    helper:
      'Mandarin syllables usually have an initial consonant and a final vowel part. Keep both parts clear.',
    examples: ['ni', 'hao', 'xie', 'zai'],
  },
  {
    id: 'zh-aspiration',
    title: 'aspirated sounds',
    pattern: 'p, t, k, q, ch, c',
    helper:
      'These sounds use a stronger puff of air than b, d, g, j, zh, and z.',
    examples: ['pa', 'ta', 'ka', 'qing', 'chi', 'ci'],
  },
  {
    id: 'zh-retroflex',
    title: 'zh / ch / sh / r',
    pattern: 'zh, ch, sh, r',
    helper:
      'Curl the tongue slightly back for zh, ch, sh, and r. These are different from z, c, and s.',
    examples: ['zhong', 'chi', 'shi', 'ren'],
  },
  {
    id: 'zh-z-c-s',
    title: 'z / c / s',
    pattern: 'z, c, s',
    helper:
      'Keep z, c, and s more forward with the tongue near the teeth. Do not curl the tongue back.',
    examples: ['zai', 'ci', 'san'],
  },
  {
    id: 'zh-j-q-x',
    title: 'j / q / x',
    pattern: 'j, q, x',
    helper:
      'These are made with the tongue forward and high. q has a stronger puff of air than j.',
    examples: ['ji', 'qi', 'xi', 'xie'],
  },
  {
    id: 'zh-ng-final',
    title: 'final ng',
    pattern: 'ang, eng, ing, ong',
    helper:
      'For final ng, let the sound close farther back in the mouth, like the end of “song.”',
    examples: ['bang', 'feng', 'ming', 'zhong'],
  },
  {
    id: 'zh-n-final',
    title: 'final n',
    pattern: 'an, en, in',
    helper:
      'For final n, close the sound at the front of the mouth with the tongue near the upper teeth.',
    examples: ['san', 'ren', 'xin'],
  },
  {
    id: 'zh-u-umlaut',
    title: 'ü',
    pattern: 'ü / v / yu',
    helper:
      'Round your lips like “oo,” but keep the tongue forward like “ee.”',
    examples: ['lü', 'nü', 'yu', 'xue'],
  },
  {
    id: 'zh-er',
    title: 'er',
    pattern: 'er',
    helper:
      'The er sound has an r-colored ending. Let the tongue move slightly back as the vowel finishes.',
    examples: ['er', 'erzi', 'naer'],
  },
  {
    id: 'zh-ai-ei-ao-ou',
    title: 'diphthongs',
    pattern: 'ai, ei, ao, ou',
    helper:
      'These finals glide smoothly from one vowel shape into another. Do not break them into two separate words.',
    examples: ['ai', 'bei', 'hao', 'kou'],
  },
  {
    id: 'zh-tones-general',
    title: 'tones',
    pattern: 'tone contour',
    helper:
      'Mandarin uses pitch movement to distinguish meaning. Keep the sound shape clear first; tone coaching can be refined separately.',
    examples: ['mā', 'má', 'mǎ', 'mà'],
  },
  {
    id: 'zh-neutral-tone',
    title: 'neutral tone',
    pattern: 'light syllable',
    helper:
      'A neutral-tone syllable is lighter and shorter than the main syllables around it.',
    examples: ['ma', 'de', 'le'],
  },
];

export default pronunciationRules;