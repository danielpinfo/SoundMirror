/**
 * Spanish learner-facing display helpers.
 *
 * Core rule:
 * The backend-detected phoneme must never silently disappear from the
 * “You sounded like” display unless it is a known non-speech/control token.
 *
 * Spanish pack owns Spanish display conventions.
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
  // Spanish pack units / learner-facing sounds
  a: 'a',
  e: 'e',
  i: 'i',
  o: 'o',
  u: 'u',

  b: 'b',
  v: 'v',
  p: 'p',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'g',
  m: 'm',
  n: 'n',
  ny: 'ñ',
  f: 'f',
  s: 's',
  h: 'h',
  ch: 'ch',
  r: 'r',
  rr: 'rr',
  l: 'l',
  y: 'y',
  w: 'w',

  // Common IPA/backend tokens that may appear from Wav2Vec2
  'ɡ': 'g',
  'β': 'b',
  'ð': 'd',
  'ɣ': 'g',
  'ɾ': 'r',
  'ɲ': 'ñ',
  'ŋ': 'n',
  'ʝ': 'y',
  'j': 'y',
  'x': 'h',
  'ʃ': 'sh',
  'tʃ': 'ch',
  't͡ʃ': 'ch',

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
};

export function getDisplayToken(rawToken) {
  if (rawToken === null || rawToken === undefined) return '';

  const raw = String(rawToken).trim();

  if (NON_SPEECH_TOKENS.has(raw)) {
    return '';
  }

  // Full-token mapping first. This protects Spanish units like ny, rr, ch.
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
    } else if (/[a-záéíóúüñ]/i.test(char)) {
      output += char.toLowerCase();
    } else {
      output += char;
    }
  }

  const cleaned = output.trim();

  return cleaned || raw;
}

/**
 * Convert detector output into the Spanish pack's canonical phoneme units.
 *
 * SoundMirror keeps detected b and v distinct so their separate mouth shapes,
 * guided cues, and grading targets are preserved throughout the app.
 */
export function normalizeDetectedPhoneme(rawToken) {
  const displayed = getDisplayToken(rawToken)
    .trim()
    .toLowerCase();

  if (!displayed) return '';

  if (displayed === 'ñ') return 'ny';

  return displayed;
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
