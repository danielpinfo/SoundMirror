/**
 * French learner-facing display helpers.
 *
 * Core rule:
 * The backend-detected phoneme must never silently disappear from the
 * “Tu as produit / You sounded like” display unless it is a known
 * non-speech/control token.
 *
 * French pack owns French display conventions.
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

const COMBINING_TILDE = '\u0303';

const IPA_HELPER_MAP = {
  // French pack units / learner-facing sounds
  a: 'a',
  e: 'e',
  i: 'i',
  o: 'o',
  u: 'u',

  an: 'an',
  on: 'on',
  in: 'in',
  un: 'un',
  eu: 'eu',
  oo: 'ou',
  ou: 'ou',
  wa: 'wa',

  b: 'b',
  p: 'p',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'g',
  m: 'm',
  n: 'n',
  ny: 'gn',
  gn: 'gn',
  f: 'f',
  v: 'v',
  s: 's',
  z: 'z',
  sh: 'ch',
  ch: 'ch',
  zh: 'j',
  j: 'j',
  r: 'r',
  l: 'l',
  y: 'u',

  // Common IPA/backend consonants
  'ɡ': 'g',
  'ɲ': 'gn',
  'ŋ': 'n',
  'ʃ': 'ch',
  'ʒ': 'j',
  'ʁ': 'r',
  'ɹ': 'r',
  'ɾ': 'r',

  // French-ish vowels and common variants
  'ɑ': 'a',
  'ɑː': 'a',
  'aː': 'a',
  'ɐ': 'a',
  'æ': 'a',

  'ɛ': 'e',
  'eː': 'e',
  'ə': 'eu',
  'œ': 'eu',
  'ø': 'eu',
  'ɜ': 'eu',
  'ɜː': 'eu',

  'ɪ': 'i',
  'iː': 'i',

  'ɔ': 'o',
  'ɔː': 'o',
  'oː': 'o',
  'oʊ': 'o',

  'ʊ': 'ou',
  'uː': 'ou',
  'ʉ': 'u',
  'yː': 'u',

  // Nasal vowels. These are stored as full token mappings first.
  'ɑ̃': 'an',
  [`ɑ${COMBINING_TILDE}`]: 'an',
  'ɔ̃': 'on',
  [`ɔ${COMBINING_TILDE}`]: 'on',
  'ɛ̃': 'in',
  [`ɛ${COMBINING_TILDE}`]: 'in',
  'œ̃': 'un',
  [`œ${COMBINING_TILDE}`]: 'un',

  // Affricates / foreign detections
  'tʃ': 'ch',
  't͡ʃ': 'ch',
  'dʒ': 'j',
  'd͡ʒ': 'j',

  // Marks that should not display by themselves
  'ː': '',
  'ˈ': '',
  'ˌ': '',
  [COMBINING_TILDE]: '',
};

function normalizeRawToken(rawToken) {
  return String(rawToken ?? '').trim().normalize('NFC');
}

function mapNasalToken(raw) {
  if (!raw) return '';

  // Handle decomposed or odd nasal-vowel tokens before character cleanup.
  if (raw.includes(COMBINING_TILDE) || raw.includes('̃')) {
    if (raw.includes('ɑ') || raw.includes('a')) return 'an';
    if (raw.includes('ɔ') || raw.includes('o')) return 'on';
    if (raw.includes('ɛ') || raw.includes('e') || raw.includes('i')) return 'in';
    if (raw.includes('œ') || raw.includes('ø') || raw.includes('u')) return 'un';
  }

  return '';
}

export function getDisplayToken(rawToken) {
  if (rawToken === null || rawToken === undefined) return '';

  const raw = normalizeRawToken(rawToken);

  if (NON_SPEECH_TOKENS.has(raw)) {
    return '';
  }

  const nasal = mapNasalToken(raw);
  if (nasal) return nasal;

  // Full-token mapping first. This protects French pack units like
  // an, on, in, un, eu, oo, wa, sh, zh, ny.
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
    } else if (/[a-zàâéèêëîïôùûüœç]/i.test(char)) {
      output += char.toLowerCase();
    } else if (char === COMBINING_TILDE || char === '̃') {
      // Already handled above when attached to a nasal vowel.
      output += '';
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