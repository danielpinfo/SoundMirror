/**
 * Portuguese learner-facing display helpers.
 *
 * Core rule:
 * The backend-detected phoneme must never silently disappear from the
 * “You sounded like” display unless it is a known non-speech/control token.
 *
 * Portuguese pack owns Portuguese display conventions.
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
  // Portuguese pack units / learner-facing sounds
  a: 'a',
  e: 'e',
  i: 'i',
  o: 'o',
  u: 'u',

  an: 'an',
  en: 'en',
  in: 'in',
  on: 'on',
  un: 'un',
  anw: 'ão',
  ane: 'ãe',
  one: 'õe',

  ei: 'ei',
  au: 'au',

  b: 'b',
  p: 'p',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'g',
  m: 'm',
  n: 'n',
  ny: 'nh',
  ly: 'lh',
  f: 'f',
  v: 'v',
  s: 's',
  z: 'z',
  sh: 'ch',
  zh: 'j',
  r: 'r',
  rr: 'rr',
  l: 'l',
  w: 'w',

  // Common IPA/backend tokens that may appear from Wav2Vec2
  'ɡ': 'g',
  'β': 'b',
  'ð': 'd',
  'ɣ': 'g',
  'ɾ': 'r',
  'ʁ': 'rr',
  'ʀ': 'rr',
  'ɹ': 'r',
  'ɲ': 'nh',
  'ʎ': 'lh',
  'ŋ': 'n',
  'ʒ': 'j',
  'ʃ': 'ch',
  'tʃ': 'ch',
  't͡ʃ': 'ch',
  'dʒ': 'j',
  'd͡ʒ': 'j',
  'j': 'y',
  'x': 'rr',
  'h': 'rr',

  // Portuguese nasal vowels and common decomposed backend variants
  'ɐ̃': 'an',
  'ã': 'an',
  'ẽ': 'en',
  'ĩ': 'in',
  'õ': 'on',
  'ũ': 'un',
  'ɑ̃': 'an',
  'ɛ̃': 'en',
  'ɔ̃': 'on',

  // Vowels and common variants
  'ɑ': 'a',
  'ɑː': 'a',
  'aː': 'a',
  'æ': 'a',
  'ɐ': 'a',
  'ɛ': 'e',
  'eː': 'e',
  'ɪ': 'i',
  'iː': 'i',
  'ɔ': 'o',
  'oː': 'o',
  'ʊ': 'u',
  'uː': 'u',
  'ʉ': 'u',
  'ə': 'a',
  'ʌ': 'a',

  // Marks that should not display by themselves
  'ː': '',
  'ˈ': '',
  'ˌ': '',
  '~': '',
  '̃': '',
};

export function getDisplayToken(rawToken) {
  if (rawToken === null || rawToken === undefined) return '';

  const raw = String(rawToken).trim();

  if (NON_SPEECH_TOKENS.has(raw)) {
    return '';
  }

  // Full-token mapping first. This protects Portuguese units like ny, ly,
  // rr, anw, ane, one, sh, zh.
  if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, raw)) {
    const mapped = IPA_HELPER_MAP[raw];
    return mapped || raw;
  }

  // Then fall back to character-by-character conversion.
  // Unknown symbols are preserved instead of silently dropped.
  let output = '';

  for (const char of raw) {
    if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, char)) {
      output += IPA_HELPER_MAP[char];
    } else if (/[a-záàâãéêíóôõúç]/i.test(char)) {
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