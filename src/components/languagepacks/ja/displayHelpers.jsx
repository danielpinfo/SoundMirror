/**
 * Japanese learner-facing display helpers.
 *
 * Core rule:
 * The backend-detected phoneme must never silently disappear from the
 * “You sounded like” display unless it is a known non-speech/control token.
 *
 * Japanese pack owns Japanese display conventions.
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
  // Japanese pack units / learner-facing romanized sounds
  a: 'a',
  i: 'i',
  u: 'u',
  e: 'e',
  o: 'o',

  ka: 'ka',
  ki: 'ki',
  ku: 'ku',
  ke: 'ke',
  ko: 'ko',

  sa: 'sa',
  shi: 'shi',
  su: 'su',
  se: 'se',
  so: 'so',

  ta: 'ta',
  chi: 'chi',
  tsu: 'tsu',
  te: 'te',
  to: 'to',

  na: 'na',
  ni: 'ni',
  nu: 'nu',
  ne: 'ne',
  no: 'no',

  ha: 'ha',
  hi: 'hi',
  fu: 'fu',
  he: 'he',
  ho: 'ho',

  ma: 'ma',
  mi: 'mi',
  mu: 'mu',
  me: 'me',
  mo: 'mo',

  ya: 'ya',
  yu: 'yu',
  yo: 'yo',

  ra: 'ra',
  ri: 'ri',
  ru: 'ru',
  re: 're',
  ro: 'ro',

  wa: 'wa',
  wo: 'wo',
  n: 'n',
  ng: 'n',

  ga: 'ga',
  gi: 'gi',
  gu: 'gu',
  ge: 'ge',
  go: 'go',

  za: 'za',
  ji: 'ji',
  zu: 'zu',
  ze: 'ze',
  zo: 'zo',

  da: 'da',
  de: 'de',
  do: 'do',

  ba: 'ba',
  bi: 'bi',
  bu: 'bu',
  be: 'be',
  bo: 'bo',

  pa: 'pa',
  pi: 'pi',
  pu: 'pu',
  pe: 'pe',
  po: 'po',

  kya: 'kya',
  kyu: 'kyu',
  kyo: 'kyo',

  sha: 'sha',
  shu: 'shu',
  sho: 'sho',

  cha: 'cha',
  chu: 'chu',
  cho: 'cho',

  rya: 'rya',
  ryu: 'ryu',
  ryo: 'ryo',

  gya: 'gya',
  gyu: 'gyu',
  gyo: 'gyo',

  ja: 'ja',
  ju: 'ju',
  jo: 'jo',

  bya: 'bya',
  byu: 'byu',
  byo: 'byo',

  pya: 'pya',
  pyu: 'pyu',
  pyo: 'pyo',

  mya: 'mya',
  myu: 'myu',
  myo: 'myo',

  nya: 'nya',
  nyu: 'nyu',
  nyo: 'nyo',

  hya: 'hya',
  hyu: 'hyu',
  hyo: 'hyo',

  q: 'small pause',

  // Common IPA/backend tokens that may appear from Wav2Vec2
  'ɡ': 'g',
  'ɾ': 'r',
  'ɹ': 'r',
  'r': 'r',
  'l': 'r',
  'ɺ': 'r',
  'ɽ': 'r',
  'ŋ': 'n',
  'ɲ': 'ny',
  'ɴ': 'n',
  'm': 'm',

  'ɕ': 'sh',
  'ʃ': 'sh',
  'ʑ': 'j',
  'ʒ': 'j',
  'tɕ': 'ch',
  't͡ɕ': 'ch',
  't͜ɕ': 'ch',
  'dʑ': 'j',
  'd͡ʑ': 'j',
  'd͜ʑ': 'j',
  'ts': 'ts',
  't͡s': 'ts',
  't͜s': 'ts',
  'ɸ': 'f',
  'β': 'b',
  'ç': 'h',
  'x': 'h',
  'h': 'h',

  // Vowels and common variants
  'ɑ': 'a',
  'ɑː': 'a',
  'aː': 'a',
  'æ': 'a',
  'ɐ': 'a',
  'ʌ': 'a',

  'ɛ': 'e',
  'eː': 'e',
  'ə': 'e',

  'ɪ': 'i',
  'iː': 'i',

  'ɔ': 'o',
  'oː': 'o',

  'ɯ': 'u',
  'ɯː': 'u',
  'ʊ': 'u',
  'uː': 'u',
  'ʉ': 'u',

  // Backend artifact tokens observed in other packs
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

const CANONICAL_DETECTED_MAP = Object.freeze({
  'ɡ': 'g',
  'ŋ': 'n',
  'ɲ': 'n',
  'ɴ': 'n',
  'ɕ': 'sh',
  'ʃ': 'sh',
  'ʑ': 'j',
  'ʒ': 'j',
  'tɕ': 'ch',
  't͡ɕ': 'ch',
  't͜ɕ': 'ch',
  'dʑ': 'j',
  'd͡ʑ': 'j',
  'd͜ʑ': 'j',
  't͡s': 'ts',
  't͜s': 'ts',
  'ɸ': 'f',
  'β': 'b',
  'ç': 'h',
  x: 'h',
  'ɾ': 'r',
  'ɹ': 'r',
  l: 'r',
  'ɺ': 'r',
  'ɽ': 'r',
  'ɑ': 'a',
  'ɑː': 'a',
  'æ': 'a',
  'ɐ': 'a',
  'ʌ': 'a',
  'ɛ': 'e',
  'ə': 'e',
  'ɪ': 'i',
  'ɔ': 'o',
  'ɯ': 'u',
  'ɯː': 'u',
  'ʊ': 'u',
  'ʉ': 'u',
  j: 'y',
});

/** Convert one backend/IPA token into one canonical Japanese detector phone. */
export function normalizeDetectedPhoneme(rawToken) {
  const raw = String(rawToken ?? '').normalize('NFC').trim().toLowerCase();
  if (!raw || NON_SPEECH_TOKENS.has(raw)) return '';

  const cleaned = raw
    .replace(/[ːˈˌ]/g, '')
    .replace(/[.]/g, '')
    .replace(/[ʲ]/g, '')
    .replace(/(?:[0-5])$/g, '');

  return CANONICAL_DETECTED_MAP[cleaned] || cleaned;
}

export function getDisplayToken(rawToken) {
  if (rawToken === null || rawToken === undefined) return '';

  const raw = String(rawToken).trim();

  if (NON_SPEECH_TOKENS.has(raw)) {
    return '';
  }

  const canonical = normalizeDetectedPhoneme(raw);
  if (canonical && Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, canonical)) {
    return IPA_HELPER_MAP[canonical] || canonical;
  }

  // Full-token mapping first. This protects Japanese units like shi, chi,
  // tsu, kya, sha, ja, and backend affricates like t͡ɕ.
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
    } else if (/[a-z]/i.test(char)) {
      output += char.toLowerCase();
    } else {
      const ipaFallback = {
        ɑ: 'a',
        æ: 'a',
        ɐ: 'a',
        ʌ: 'a',
        ɛ: 'e',
        ə: 'e',
        ɪ: 'i',
        ɔ: 'o',
        ɯ: 'u',
        ʊ: 'u',
        ʉ: 'u',
        ŋ: 'n',
        ɲ: 'ny',
        ɴ: 'n',
        ɕ: 'sh',
        ʃ: 'sh',
        ʑ: 'j',
        ʒ: 'j',
        ɾ: 'r',
        ɹ: 'r',
        ɺ: 'r',
        ɽ: 'r',
        ɸ: 'f',
        ɡ: 'g',
        ç: 'h',
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
