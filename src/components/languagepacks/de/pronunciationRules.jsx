/**
 * German pack-owned pronunciation rules.
 *
 * These rules are learner-facing guidance only. They do not create AS timing
 * and they do not replace the resolver. The resolver remains the source of
 * expected phonemes for AS/UAS comparison.
 */

export const pronunciationRules = [
  {
    id: 'de-sch',
    title: 'sch',
    pattern: 'sch',
    helper: 'Sounds like “sh.” Keep the lips slightly rounded and the sound smooth.',
    examples: ['schön', 'Schule', 'Deutsch'],
  },
  {
    id: 'de-ch-front',
    title: 'soft ch',
    pattern: 'ch after e, i, ä, ö, ü',
    helper:
      'After front vowels, ch is lighter and more forward in the mouth, like the soft sound in ich.',
    examples: ['ich', 'nicht', 'lächeln'],
  },
  {
    id: 'de-ch-back',
    title: 'back ch',
    pattern: 'ch after a, o, u',
    helper:
      'After back vowels, ch is stronger and farther back in the throat, like the sound in Bach.',
    examples: ['Bach', 'Buch', 'doch'],
  },
  {
    id: 'de-ei',
    title: 'ei',
    pattern: 'ei',
    helper: 'Sounds like “ai,” similar to the English word “eye.”',
    examples: ['nein', 'mein', 'eins'],
  },
  {
    id: 'de-ie',
    title: 'ie',
    pattern: 'ie',
    helper: 'Usually sounds like a long “ee.”',
    examples: ['wie', 'Sie', 'Liebe'],
  },
  {
    id: 'de-eu-aeu',
    title: 'eu / äu',
    pattern: 'eu, äu',
    helper: 'Sounds like “oy.”',
    examples: ['Deutsch', 'Freund', 'Häuser'],
  },
  {
    id: 'de-au',
    title: 'au',
    pattern: 'au',
    helper: 'Sounds like “ow.” Open into the first vowel and glide into the second.',
    examples: ['Haus', 'auch', 'Frau'],
  },
  {
    id: 'de-umlaut-ue',
    title: 'ü',
    pattern: 'ü',
    helper:
      'Round your lips like “oo,” but place the tongue forward like “ee.”',
    examples: ['Tschüss', 'über', 'für'],
  },
  {
    id: 'de-umlaut-oe',
    title: 'ö',
    pattern: 'ö',
    helper:
      'Round your lips like “oh,” but keep the tongue more forward, near “eh.”',
    examples: ['schön', 'hören', 'Österreich'],
  },
  {
    id: 'de-z',
    title: 'z',
    pattern: 'z',
    helper: 'German z usually sounds like “ts.”',
    examples: ['Zeit', 'Zug', 'Zimmer'],
  },
  {
    id: 'de-pf',
    title: 'pf',
    pattern: 'pf',
    helper:
      'Start with closed lips for p, then release directly into f. It may feel like one combined sound.',
    examples: ['Pferd', 'Apfel', 'Pfanne'],
  },
  {
    id: 'de-w',
    title: 'w',
    pattern: 'w',
    helper: 'German w usually sounds like English v.',
    examples: ['willkommen', 'wie', 'Wasser'],
  },
  {
    id: 'de-j',
    title: 'j',
    pattern: 'j',
    helper: 'German j usually sounds like English y.',
    examples: ['ja', 'Jahr', 'jetzt'],
  },
  {
    id: 'de-final-devoicing',
    title: 'final b / d / g',
    pattern: 'b, d, g at the end of a word',
    helper:
      'At the end of a German word, b often sounds like p, d like t, and g like k.',
    examples: ['Tag', 'Hund', 'ab'],
  },
  {
    id: 'de-r',
    title: 'r',
    pattern: 'r',
    helper:
      'German r varies by region. It may be made in the throat or softened near the end of words.',
    examples: ['rot', 'Morgen', 'aber'],
  },
];

export default pronunciationRules;