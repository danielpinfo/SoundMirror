/**
 * Chinese learner-facing display helpers.
 *
 * Core rule:
 * The backend-detected phoneme must never silently disappear from the
 * “You sounded like” display unless it is a known non-speech/control token.
 *
 * Chinese pack owns Chinese display conventions.
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
  // Mandarin pack units / learner-facing pinyin-style sounds
  a: 'a',
  e: 'e',
  i: 'i',
  o: 'o',
  u: 'u',
  v: 'ü',
  ü: 'ü',

  ai: 'ai',
  ei: 'ei',
  ao: 'ao',
  ou: 'ou',
  an: 'an',
  en: 'en',
  ang: 'ang',
  eng: 'eng',
  ong: 'ong',
  er: 'er',

  ia: 'ia',
  ie: 'ie',
  iao: 'iao',
  iu: 'iu',
  in: 'in',
  ing: 'ing',

  ua: 'ua',
  uo: 'uo',
  ue: 'üe',
  ve: 'üe',

  b: 'b',
  p: 'p',
  m: 'm',
  f: 'f',

  d: 'd',
  t: 't',
  n: 'n',
  ng: 'ng',
  l: 'l',

  g: 'g',
  k: 'k',
  h: 'h',

  j: 'j',
  q: 'q',
  x: 'x',

  zh: 'zh',
  ch: 'ch',
  sh: 'sh',
  r: 'r',

  z: 'z',
  c: 'c',
  s: 's',

  w: 'w',

  // Common IPA/backend consonants
  'ɡ': 'g',
  'ŋ': 'ng',
  'ɲ': 'n',
  'ɴ': 'ng',

  'ɕ': 'x',
  'ʃ': 'sh',
  'ʂ': 'sh',
  'ʑ': 'r',
  'ʒ': 'r',
  'ʐ': 'r',
  'tɕ': 'q',
  't͡ɕ': 'q',
  't͜ɕ': 'q',
  'dʑ': 'j',
  'd͡ʑ': 'j',
  'd͜ʑ': 'j',

  'ts': 'c',
  't͡s': 'c',
  't͜s': 'c',
  'dz': 'z',
  'd͡z': 'z',
  'd͜z': 'z',

  'tʂ': 'ch',
  't͡ʂ': 'ch',
  't͜ʂ': 'ch',
  'dʐ': 'zh',
  'd͡ʐ': 'zh',
  'd͜ʐ': 'zh',

  'ɾ': 'r',
  'ɹ': 'r',
  'ʁ': 'r',
  'ɻ': 'r',

  'β': 'b',
  'ð': 'd',
  'ɣ': 'g',
  'ɸ': 'f',
  'ç': 'x',
  // Vowels and common IPA/backend variants.
  // Learner display must not show IPA symbols.
  'ɑ': 'a',
  'ɑː': 'a',
  'aː': 'a',
  'æ': 'a',
  'ɐ': 'a',
  'ʌ': 'a',

  'ɛ': 'e',
  'eː': 'e',
  'ə': 'e',
  'ɤ': 'e',
  'ɚ': 'er',
  'ɝ': 'er',

  'ɪ': 'i',
  'iː': 'i',

  'ɔ': 'o',
  'oː': 'o',

  'ʊ': 'u',
  'uː': 'u',
  'ʉ': 'u',
  'ɯ': 'u',
  'ɯː': 'u',

  'y': 'ü',
  'yː': 'ü',
  'ʏ': 'ü',

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

  // Tone digits should not display as separate sounds.
  '1': '',
  '2': '',
  '3': '',
  '4': '',
  '5': '',

  // Marks that should not display by themselves
  'ː': '',
  'ˈ': '',
  'ˌ': '',
  '.': '',
};

function normalizeBackendArtifact(raw) {
  return String(raw || '')
    .trim()
    .replace(/^([aeiou])(?:\.?5)$/i, '$1')
    .replace(/[1-5]$/g, '')
    .toLowerCase();
}

function stripIpaMarks(text) {
  return String(text || '')
    .replace(/[ːˈˌ]/g, '')
    .replace(/[.]/g, '');
}

export function getDisplayToken(rawToken) {
  if (rawToken === null || rawToken === undefined) return '';

  const raw = String(rawToken).trim();

  if (NON_SPEECH_TOKENS.has(raw)) {
    return '';
  }

  // Full-token mapping first. This protects Mandarin units like zh, ch,
  // sh, ng, ang, eng, ong, er, and backend affricates like t͡ɕ.
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
    } else if (/[a-zü]/i.test(char)) {
      output += char.toLowerCase();
    } else {
      const ipaFallback = {
        ɑ: 'a',
        æ: 'a',
        ɐ: 'a',
        ʌ: 'a',
        ɛ: 'e',
        ə: 'e',
        ɤ: 'e',
        ɚ: 'er',
        ɝ: 'er',
        ɪ: 'i',
        ɔ: 'o',
        ʊ: 'u',
        ʉ: 'u',
        ɯ: 'u',
        y: 'ü',
        ʏ: 'ü',
        ŋ: 'ng',
        ɲ: 'n',
        ɴ: 'ng',
        ɕ: 'x',
        ʃ: 'sh',
        ʂ: 'sh',
        ʑ: 'r',
        ʒ: 'r',
        ʐ: 'r',
        ɾ: 'r',
        ɹ: 'r',
        ɻ: 'r',
        ɡ: 'g',
        ɸ: 'f',
        ç: 'x',
      }[char];

      output += ipaFallback || char;
    }
  }

  const cleaned = output.trim();

  return cleaned || raw;
}

const CANONICAL_DETECTED_MAP = Object.freeze({
  // Mandarin stop and affricate contrasts are primarily aspirated vs.
  // unaspirated, while the learner tokens use pinyin spelling.
  p: 'b',
  b: 'b',
  ph: 'p',
  'pʰ': 'p',
  t: 'd',
  d: 'd',
  th: 't',
  'tʰ': 't',
  k: 'g',
  g: 'g',
  'ɡ': 'g',
  kh: 'k',
  'kʰ': 'k',

  'tɕ': 'j',
  't͡ɕ': 'j',
  't͜ɕ': 'j',
  'dʑ': 'j',
  'd͡ʑ': 'j',
  tɕh: 'q',
  'tɕʰ': 'q',
  't͡ɕʰ': 'q',
  'ɕ': 'x',
  'ç': 'x',

  ts: 'z',
  't͡s': 'z',
  dz: 'z',
  tsh: 'c',
  'tsʰ': 'c',
  't͡sʰ': 'c',
  'cʰ': 'c',

  'tʂ': 'zh',
  't͡ʂ': 'zh',
  'dʐ': 'zh',
  'tʃ': 'zh',
  'dʒ': 'zh',
  tʂh: 'ch',
  'tʂʰ': 'ch',
  't͡ʂʰ': 'ch',
  'tʃʰ': 'ch',
  'ʂ': 'sh',
  'ʃ': 'sh',
  'ʐ': 'r',
  'ʒ': 'r',
  'ɻ': 'r',
  'ɹ': 'r',

  x: 'h',
  'χ': 'h',
  'ɣ': 'h',
  h: 'h',
  f: 'f',
  m: 'm',
  n: 'n',
  'ŋ': 'ng',
  'ɴ': 'ng',
  l: 'l',
  r: 'r',
  s: 's',
  z: 'z',

  a: 'a',
  'ɑ': 'a',
  'ɑː': 'a',
  'ɐ': 'a',
  'ä': 'a',
  e: 'e',
  'ɛ': 'e',
  'ə': 'e',
  'ɤ': 'e',
  'ɜ': 'e',
  i: 'i',
  'ɪ': 'i',
  'ɨ': 'i',
  'i̪': 'i',
  o: 'o',
  'ɔ': 'o',
  'ɵ': 'o',
  u: 'u',
  'ʊ': 'u',
  'ʉ': 'u',
  y: 'v',
  'yː': 'v',
  'ʏ': 'v',
  'ɚ': 'er',
  'ɝ': 'er',
  'ər': 'er',

  'aɪ': 'ai',
  'ɑi': 'ai',
  ai: 'ai',
  'eɪ': 'ei',
  'ɛɪ': 'ei',
  ei: 'ei',
  'aʊ': 'ao',
  'ɑu': 'ao',
  au: 'ao',
  'oʊ': 'ou',
  'əʊ': 'ou',
  ou: 'ou',
  'iɑ': 'ia',
  ia: 'ia',
  'iɛ': 'ie',
  ie: 'ie',
  iou: 'iu',
  'ɪu': 'iu',
  iu: 'iu',
  uei: 'ui',
  'uɪ': 'ui',
  ui: 'ui',
  ua: 'ua',
  uai: 'uai',
  uo: 'uo',
  'uə': 'uo',
  'onɡ': 'ong',
  'oŋ': 'ong',
  'yɛ': 've',
  'yə': 've',
  yu: 'v',
  'yæ': 'van',
});

/** Convert one backend IPA token into one canonical Mandarin pack token. */
export function normalizeDetectedPhoneme(rawToken) {
  const raw = String(rawToken ?? '').normalize('NFC').trim().toLowerCase();
  if (!raw || NON_SPEECH_TOKENS.has(raw)) return '';

  const withoutProsody = raw
    .replace(/[ːˈˌ]/g, '')
    .replace(/[.]/g, '')
    .replace(/[ʲ]/g, '');
  const withoutToneContour = withoutProsody.length > 1
    ? withoutProsody.replace(/(?:[0-5]|ɜ)$/g, '')
    : withoutProsody;

  return (
    CANONICAL_DETECTED_MAP[withoutToneContour] ||
    CANONICAL_DETECTED_MAP[withoutProsody] ||
    withoutToneContour
  );
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
