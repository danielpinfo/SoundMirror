/**
 * Italian learner-facing display helpers.
 *
 * Core rule:
 * The backend-detected phoneme must never silently disappear from the
 * “You sounded like” display unless it is a known non-speech/control token.
 *
 * Italian pack owns Italian display conventions.
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
  // Italian pack units / learner-facing sounds
  a: 'a',
  e: 'e',
  i: 'i',
  o: 'o',
  u: 'u',

  b: 'b',
  p: 'p',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'g',
  m: 'm',
  n: 'n',
  ny: 'gn',
  ly: 'gli',
  f: 'f',
  v: 'v',
  s: 's',
  sh: 'sh',
  ch: 'ch',
  j: 'j',
  ts: 'ts',
  r: 'r',
  rr: 'rr',
  l: 'l',
  w: 'w',

  // Common IPA/backend consonants
  'ɡ': 'g',
  'ɲ': 'gn',
  'ʎ': 'gli',
  'ŋ': 'n',
  'ʃ': 'sh',
  'tʃ': 'ch',
  't͡ʃ': 'ch',
  'dʒ': 'j',
  'd͡ʒ': 'j',
  'ts': 'ts',
  't͡s': 'ts',
  'dz': 'dz',
  'd͡z': 'dz',
  'ɾ': 'r',
  'ɹ': 'r',

  // Vowels and common variants
  'ɑ': 'a',
  'ɑː': 'a',
  'aː': 'a',
  'ɐ': 'a',
  'æ': 'a',

  'ɛ': 'e',
  'eː': 'e',

  'ɪ': 'i',
  'iː': 'i',
  'j': 'i',

  'ɔ': 'o',
  'oː': 'o',
  'oʊ': 'o',

  'ʊ': 'u',
  'uː': 'u',
  'ʉ': 'u',

  // Marks that should not display by themselves
  'ː': '',
  'ˈ': '',
  'ˌ': '',
};

export function getDisplayToken(rawToken) {
  if (rawToken === null || rawToken === undefined) return '';

  const raw = String(rawToken).trim().normalize('NFC');

  if (NON_SPEECH_TOKENS.has(raw)) {
    return '';
  }

  // Full-token mapping first. This protects Italian units like ny, ly, rr, ch, ts.
  if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, raw)) {
    const mapped = IPA_HELPER_MAP[raw];
    return mapped || '';
  }

  // Then fall back to character-by-character conversion.
  // Unknown symbols are preserved instead of silently dropped.
  let output = '';

  for (const char of raw) {
    if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, char)) {
      output += IPA_HELPER_MAP[char];
    } else if (/[a-zàèéìòù]/i.test(char)) {
      output += char.toLowerCase();
    } else {
      output += char;
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