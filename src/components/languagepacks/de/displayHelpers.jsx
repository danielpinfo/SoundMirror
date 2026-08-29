/**
 * German learner-facing display helpers.
 *
 * Core rule:
 * The backend-detected phoneme must never silently disappear from the
 * “You sounded like” display unless it is a known non-speech/control token.
 *
 * German pack owns German display conventions.
 */

const NON_SPEECH_TOKENS = new Set([
  '<pad>',
  '[PAD]',
  '<s>',
  '</s>',
  '<unk>',
  '[UNK]',
  '',
]);

const IPA_HELPER_MAP = {
  // German pack units / learner-facing sounds
  a: 'a',
  e: 'e',
  i: 'i',
  o: 'o',
  u: 'u',

  ai: 'ai',
  au: 'au',
  ee: 'ie',
  oe: 'ö',
  ue: 'ü',
  oy: 'eu',
  ng: 'ng',

  b: 'b',
  p: 'p',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'g',
  m: 'm',
  n: 'n',
  f: 'f',
  v: 'v',
  s: 's',
  z: 'z',
  sh: 'sch',
  ch: 'ch',
  kh: 'ch',
  ts: 'z',
  pf: 'pf',
  h: 'h',
  r: 'r',
  l: 'l',
  y: 'j',

  // Backend artifact tokens observed during German testing
  a5: 'a',
  'a.5': 'a',
  i5: 'i',
  'i.5': 'i',
  e5: 'e',
  'e.5': 'e',
  o5: 'o',
  'o.5': 'o',
  u5: 'u',
  'u.5': 'u',

  // Common IPA/backend consonants
  'ɡ': 'g',
  'β': 'b',
  'ð': 'd',
  'ɣ': 'g',
  'ɾ': 'r',
  'ʁ': 'r',
  'ʀ': 'r',
  'ɹ': 'r',
  'ŋ': 'ng',
  'ç': 'ch',
  'x': 'ch',
  'χ': 'ch',
  'ʃ': 'sch',
  'ʒ': 'sch',
  'tʃ': 'tsch',
  't͡ʃ': 'tsch',
  't͜ʃ': 'tsch',
  'ts': 'z',
  't͡s': 'z',
  't͜s': 'z',
  'pf': 'pf',
  'p͡f': 'pf',
  'p͜f': 'pf',
  'j': 'j',

  // German rounded/front vowels and common backend variants
  'y': 'ü',
  'yː': 'ü',
  'ʏ': 'ü',
  'ø': 'ö',
  'øː': 'ö',
  'œ': 'ö',

  // Vowels and common IPA/backend variants.
  // Learner display must not show IPA symbols.
  'ɑ': 'a',
  'ɑː': 'a',
  'aː': 'a',
  'æ': 'a',
  'ɐ': 'a',
  'ʌ': 'a',

  'ɛ': 'e',
  'ɛː': 'e',
  'eː': 'e',
  'ə': 'e',

  'ɪ': 'i',
  'iː': 'i',

  'ɔ': 'o',
  'oː': 'o',

  'ʊ': 'u',
  'uː': 'u',
  'ʉ': 'u',

  // Marks that should not display by themselves
  'ː': '',
  'ˈ': '',
  'ˌ': '',
  '.': '',
  '5': '',
};

function normalizeBackendArtifact(raw) {
  return String(raw || '')
    .trim()
    .replace(/^([aeiou])(?:\.?5)$/i, '$1')
    .toLowerCase();
}

function stripIpaMarks(text) {
  return String(text || '')
    .replace(/[ːˈˌ]/g, '')
    .replace(/[.5]/g, '');
}

export function getDisplayToken(rawToken) {
  if (rawToken === null || rawToken === undefined) return '';

  const raw = String(rawToken).trim();

  if (NON_SPEECH_TOKENS.has(raw)) {
    return '';
  }

  // Full-token mapping first. This protects German units like sch, ch,
  // kh, ts, pf, ai, au, eu/oy, ö/oe, ü/ue, and ng/ŋ.
  if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, raw)) {
    const mapped = IPA_HELPER_MAP[raw];
    return mapped || raw;
  }

  const normalizedArtifact = normalizeBackendArtifact(raw);

  if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, normalizedArtifact)) {
    const mapped = IPA_HELPER_MAP[normalizedArtifact];
    return mapped || normalizedArtifact;
  }

  const stripped = stripIpaMarks(raw);

  if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, stripped)) {
    const mapped = IPA_HELPER_MAP[stripped];
    return mapped || stripped;
  }

  // Then fall back to character-by-character conversion.
  // Unknown symbols are preserved, but known IPA symbols are converted.
  let output = '';

  for (const char of stripped) {
    if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, char)) {
      output += IPA_HELPER_MAP[char];
    } else if (/[a-zäöüß]/i.test(char)) {
      output += char.toLowerCase();
    } else {
      // Final safety: do not show raw IPA vowel symbols to learners.
      const ipaFallback = {
        'ɑ': 'a',
        'æ': 'a',
        'ɐ': 'a',
        'ʌ': 'a',
        'ɛ': 'e',
        'ə': 'e',
        'ɪ': 'i',
        'ɔ': 'o',
        'ʊ': 'u',
        'ʉ': 'u',
        'ŋ': 'ng',
        'ç': 'ch',
        'ʃ': 'sch',
        'ʒ': 'sch',
        'ʁ': 'r',
        'ʀ': 'r',
        'ɹ': 'r',
        'ɾ': 'r',
        'ɡ': 'g',
      }[char];

      output += ipaFallback || char;
    }
  }

  const cleaned = output.trim();

  return cleaned || raw;
}

export function sanitizeTranscript(text) {
  if (!text) return '';

  return String(text)
    .split(/\s+/)
    .map(getDisplayToken)
    .filter(Boolean)
    .join(' ');
}

export { IPA_HELPER_MAP };