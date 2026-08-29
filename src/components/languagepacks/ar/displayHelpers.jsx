/**
 * Arabic learner-facing display helpers.
 *
 * Core rule:
 * The backend-detected phoneme must never silently disappear from the
 * “You sounded like” display unless it is a known non-speech/control token.
 *
 * Arabic pack owns Arabic display conventions.
 *
 * Main UAS display standard:
 * - Target stays Arabic script.
 * - “You sounded like” uses learner-facing Latin phonetics.
 * - Internal token order stays normal.
 * - RTL belongs to the UI/presentation layer, not to this sanitizer.
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
  // Arabic pack resolver consonant tokens -> learner-facing Latin phonetics
  'C:ا': 'a',
  'C:ء': 'ء',
  'C:ب': 'b',
  'C:ت': 't',
  'C:ث': 'th',
  'C:ج': 'j',
  'C:ح': 'ḥ',
  'C:خ': 'kh',
  'C:د': 'd',
  'C:ذ': 'dh',
  'C:ر': 'r',
  'C:ز': 'z',
  'C:س': 's',
  'C:ش': 'sh',
  'C:ص': 'ṣ',
  'C:ض': 'ḍ',
  'C:ط': 'ṭ',
  'C:ظ': 'ẓ',
  'C:ع': 'ع',
  'C:غ': 'gh',
  'C:ف': 'f',
  'C:ق': 'q',
  'C:ك': 'k',
  'C:ل': 'l',
  'C:م': 'm',
  'C:ن': 'n',
  'C:ه': 'h',
  'C:و': 'w',
  'C:ي': 'y',

  // Arabic pack resolver vowel tokens
  'V:a': 'a',
  'V:ا': 'a',
  'V:u': 'u',
  'V:و': 'u',
  'V:i': 'i',
  'V:ي': 'i',

  // Bare Arabic letters, in case backend or shell passes them through
  ا: 'a',
  ء: 'ء',
  أ: 'ء',
  إ: 'ء',
  آ: 'aa',
  ب: 'b',
  ت: 't',
  ث: 'th',
  ج: 'j',
  ح: 'ḥ',
  خ: 'kh',
  د: 'd',
  ذ: 'dh',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: 'sh',
  ص: 'ṣ',
  ض: 'ḍ',
  ط: 'ṭ',
  ظ: 'ẓ',
  ع: 'ع',
  غ: 'gh',
  ف: 'f',
  ق: 'q',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  و: 'w',
  ي: 'y',
  ى: 'a',
  ة: 'a',

  // Learner-facing Latin phoneme tokens that backend may return
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
  q: 'q',
  m: 'm',
  n: 'n',
  ng: 'ng',
  f: 'f',
  v: 'v',
  s: 's',
  z: 'z',
  sh: 'sh',
  h: 'h',
  r: 'r',
  l: 'l',
  y: 'y',
  w: 'w',

  // Arabic guttural / emphatic learner-facing tokens
  kh: 'kh',
  gh: 'gh',
  aa: 'aa',
  ay: 'ay',
  aw: 'aw',
  th: 'th',
  dh: 'dh',
  ch: 'ch',
  j: 'j',
  'ḥ': 'ḥ',
  'ṣ': 'ṣ',
  'ḍ': 'ḍ',
  'ṭ': 'ṭ',
  'ẓ': 'ẓ',
  emph_s: 'ṣ',
  emph_d: 'ḍ',
  emph_t: 'ṭ',
  emph_z: 'ẓ',
  ayn: 'ع',
  '3': 'ع',
  hamza: 'ء',
  '2': 'ء',
  '7': 'ḥ',
  '5': 'kh',

  // Common IPA/backend consonants
  'ɡ': 'g',
  'β': 'b',
  'ð': 'dh',
  'θ': 'th',
  'ɣ': 'gh',
  'χ': 'kh',
  x: 'kh',
  'ħ': 'ḥ',
  'ʕ': 'ع',
  'ʔ': 'ء',
  'ɾ': 'r',
  'ɹ': 'r',
  'ʁ': 'gh',
  'ʀ': 'r',
  'ŋ': 'ng',
  'ɲ': 'n',
  'ʃ': 'sh',
  'ʒ': 'j',
  'dʒ': 'j',
  'd͡ʒ': 'j',
  'd͜ʒ': 'j',
  'tʃ': 'ch',
  't͡ʃ': 'ch',
  't͜ʃ': 'ch',
  'sˤ': 'ṣ',
  'dˤ': 'ḍ',
  'tˤ': 'ṭ',
  'zˤ': 'ẓ',
  'ðˤ': 'ẓ',

  // Vowels and common IPA/backend variants.
  // Learner display must not show raw IPA vowel symbols.
  'ɑ': 'a',
  'ɑː': 'aa',
  'aː': 'aa',
  'æ': 'a',
  'ɐ': 'a',
  'ʌ': 'a',

  'ɛ': 'e',
  'eː': 'ee',
  'ə': 'a',

  'ɪ': 'i',
  'iː': 'ii',

  'ɔ': 'o',
  'oː': 'oo',

  'ʊ': 'u',
  'uː': 'uu',
  'ʉ': 'u',
  'ɯ': 'u',

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
};

/*
 * Convert the backend's Latin/IPA phone inventory into the Arabic resolver's
 * canonical C:/V: units before shared UAS alignment and grading. This is a
 * grading conversion, not a display conversion: collapsing these namespaces
 * later makes correct Arabic sounds such as C:ش versus sh look unrelated.
 */
const DETECTED_TO_ARABIC_CANONICAL = Object.freeze({
  // Short vowels.
  a: 'V:a',
  'æ': 'V:a',
  'ɑ': 'V:a',
  'ɐ': 'V:a',
  'ʌ': 'V:a',
  i: 'V:i',
  'ɪ': 'V:i',
  u: 'V:u',
  'ʊ': 'V:u',

  // Explicitly long detector vowels. Plain a/i/u remain short so the grader
  // can preserve Arabic vowel-length evidence when the backend provides it.
  aa: 'V:ا',
  'aː': 'V:ا',
  'ɑː': 'V:ا',
  ii: 'V:ي',
  'iː': 'V:ي',
  uu: 'V:و',
  'uː': 'V:و',

  b: 'C:ب',
  t: 'C:ت',
  th: 'C:ث',
  'θ': 'C:ث',
  j: 'C:ج',
  'ʒ': 'C:ج',
  'dʒ': 'C:ج',
  'd͡ʒ': 'C:ج',
  'd͜ʒ': 'C:ج',
  'ḥ': 'C:ح',
  'ħ': 'C:ح',
  '7': 'C:ح',
  kh: 'C:خ',
  x: 'C:خ',
  'χ': 'C:خ',
  '5': 'C:خ',
  d: 'C:د',
  dh: 'C:ذ',
  'ð': 'C:ذ',
  r: 'C:ر',
  'ɾ': 'C:ر',
  'ɹ': 'C:ر',
  z: 'C:ز',
  s: 'C:س',
  sh: 'C:ش',
  'ʃ': 'C:ش',
  'ṣ': 'C:ص',
  'sˤ': 'C:ص',
  'ḍ': 'C:ض',
  'dˤ': 'C:ض',
  'ṭ': 'C:ط',
  'tˤ': 'C:ط',
  'ẓ': 'C:ظ',
  'zˤ': 'C:ظ',
  'ðˤ': 'C:ظ',
  ayn: 'C:ع',
  'ʕ': 'C:ع',
  '3': 'C:ع',
  gh: 'C:غ',
  'ɣ': 'C:غ',
  'ʁ': 'C:غ',
  f: 'C:ف',
  q: 'C:ق',
  k: 'C:ك',
  l: 'C:ل',
  m: 'C:م',
  n: 'C:ن',
  h: 'C:ه',
  w: 'C:و',
  y: 'C:ي',
  hamza: 'C:ء',
  'ʔ': 'C:ء',
  '2': 'C:ء',

  // The backend may already return Arabic script.
  ب: 'C:ب', ت: 'C:ت', ث: 'C:ث', ج: 'C:ج', ح: 'C:ح', خ: 'C:خ',
  د: 'C:د', ذ: 'C:ذ', ر: 'C:ر', ز: 'C:ز', س: 'C:س', ش: 'C:ش',
  ص: 'C:ص', ض: 'C:ض', ط: 'C:ط', ظ: 'C:ظ', ع: 'C:ع', غ: 'C:غ',
  ف: 'C:ف', ق: 'C:ق', ك: 'C:ك', ل: 'C:ل', م: 'C:م', ن: 'C:ن',
  ه: 'C:ه', و: 'C:و', ي: 'C:ي', ء: 'C:ء', أ: 'C:ء', إ: 'C:ء',
});

function normalizeResolverPrefix(raw = '') {
  return String(raw || '')
    .replace(/^c:/i, 'C:')
    .replace(/^v:/i, 'V:');
}

function normalizeBackendArtifact(raw) {
  return String(raw || '')
    .trim()
    .replace(/^([aeiou])(?:\.?5)$/i, '$1')
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

  const canonicalRaw = normalizeResolverPrefix(raw);

  // Full-token mapping first. This protects Arabic resolver units like C:ش,
  // C:ن, V:ا, as well as backend IPA tokens like ʕ, ʔ, ħ, x, χ, and ð.
  if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, canonicalRaw)) {
    const mapped = IPA_HELPER_MAP[canonicalRaw];
    return mapped || canonicalRaw;
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
  // Unknown symbols are preserved, but known Arabic/IPA symbols are converted.
  let output = '';

  for (const char of stripped) {
    if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, char)) {
      output += IPA_HELPER_MAP[char];
    } else if (/[a-zḥṣḍṭẓ]/i.test(char)) {
      output += char.toLowerCase();
    } else {
      const ipaFallback = {
        ɑ: 'a',
        æ: 'a',
        ɐ: 'a',
        ʌ: 'a',
        ɛ: 'e',
        ə: 'a',
        ɪ: 'i',
        ɔ: 'o',
        ʊ: 'u',
        ʉ: 'u',
        ɯ: 'u',
        ŋ: 'ng',
        ɲ: 'n',
        ʃ: 'sh',
        ʒ: 'j',
        ɾ: 'r',
        ɹ: 'r',
        ʁ: 'gh',
        ɡ: 'g',
        θ: 'th',
        ð: 'dh',
        ɣ: 'gh',
        χ: 'kh',
        ħ: 'ḥ',
        ʕ: 'ع',
        ʔ: 'ء',
      }[char];

      output += ipaFallback || char;
    }
  }

  const cleaned = output.trim();

  return cleaned || raw;
}

/**
 * Convert detector output to the Arabic pack's canonical resolver inventory.
 * Unknown phones remain visible and therefore remain honest mismatches.
 */
export function normalizeDetectedPhoneme(rawToken) {
  if (rawToken === null || rawToken === undefined) return '';

  const raw = String(rawToken).trim();
  if (NON_SPEECH_TOKENS.has(raw)) return '';

  const canonicalRaw = normalizeResolverPrefix(raw);
  if (/^[CV]:/.test(canonicalRaw)) return canonicalRaw;

  if (
    Object.prototype.hasOwnProperty.call(
      DETECTED_TO_ARABIC_CANONICAL,
      raw
    )
  ) {
    return DETECTED_TO_ARABIC_CANONICAL[raw];
  }

  const normalizedArtifact = normalizeBackendArtifact(raw);
  if (
    Object.prototype.hasOwnProperty.call(
      DETECTED_TO_ARABIC_CANONICAL,
      normalizedArtifact
    )
  ) {
    return DETECTED_TO_ARABIC_CANONICAL[normalizedArtifact];
  }

  return normalizedArtifact || raw.toLowerCase();
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
