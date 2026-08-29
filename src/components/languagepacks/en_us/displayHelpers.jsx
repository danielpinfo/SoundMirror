import {
  normalizeArpabet,
  helperForPhoneme,
} from './phonemeSystem';

/**
 * English learner-facing display helpers.
 *
 * Important distinctions:
 *
 * Raw detector IPA:
 *   j       = English Y glide
 *   dʒ/d͡ʒ  = English J sound
 *
 *   a / æ   = short A family, as in "jab"
 *   aː / ɑ  = open AH family, as in "job"
 *
 * SoundMirror canonical tokens:
 *   y  = English Y glide
 *   j  = English J sound
 *   a  = short A
 *   aa = open AH vowel
 *   ah = reduced UH/STRUT vowel
 *
 * Detector normalization and canonical display must remain
 * separate operations.
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

/**
 * Converts raw backend IPA into English SoundMirror tokens.
 *
 * This function is used only at the detector boundary.
 */
const DETECTED_IPA_TO_ENGLISH = Object.freeze({
  // Critical Y/J distinction
  'j': 'y',
  'dʒ': 'j',
  'd͡ʒ': 'j',

  // Affricates
  'tʃ': 'ch',
  't͡ʃ': 'ch',

  // Consonants
  'ʃ': 'sh',
  'ʒ': 'zh',
  'θ': 'th',
  'ð': 'dh',
  'ŋ': 'ng',
  'ɹ': 'r',
  'ɾ': 't',
  'ɡ': 'g',

  /*
   * Open-vowel distinction:
   *
   * a / æ     -> a
   * aː / ɑ    -> aa
   */
  'a': 'a',
  'æ': 'a',
  'aː': 'aa',
  'ɑ': 'aa',
  'ɑː': 'aa',
  'ɒ': 'aa',

  // Other English vowel equivalents
  'ɛ': 'e',
  'ɪ': 'i',
  'iː': 'ee',
  'ʊ': 'ue',
  'uː': 'oo',
  'ʌ': 'ah',
  'ə': 'ah',
  'ɐ': 'ah',
  'ɜ': 'er',
  'ɜː': 'er',
  'ɚ': 'er',

  // Diphthongs
  'aɪ': 'ai',
  'eɪ': 'ei',
  'aʊ': 'aw',
  'oʊ': 'ow',
  'ɔɪ': 'oi',

  // R-colored combinations
  'ɑːɹ': 'ar',
  'ɔːɹ': 'or',
  'oːɹ': 'or',

  // Common syllabic combination
  'əl': 'ah l',
});

/**
 * Display-only IPA fallback mappings.
 *
 * Raw IPA j is deliberately absent here because getDisplayToken()
 * normally receives canonical SoundMirror tokens during grading
 * and coaching. Canonical j must display as J, not Y.
 */
const IPA_HELPER_MAP = Object.freeze({
  // Consonants
  'ʃ': 'sh',
  'ʒ': 'zh',
  'θ': 'th',
  'ð': 'th',
  'ŋ': 'ng',
  'ɲ': 'n-y',
  'ɹ': 'r',
  'ʁ': 'r',
  'ɾ': 't',
  'ɡ': 'g',
  'β': 'b',
  'ɣ': 'g',
  'ç': 'h',
  'x': 'h',
  'ʋ': 'v',
  'ɕ': 'sh',
  'ʎ': 'ly',

  // Affricates
  't͡ʃ': 'ch',
  'd͡ʒ': 'j',
  'tʃ': 'ch',
  'dʒ': 'j',
  'ts': 'ts',

  // Short A versus open AH
  'a': 'a',
  'æ': 'a',
  'aː': 'ah',
  'ɑ': 'ah',
  'ɑː': 'ah',
  'ɒ': 'ah',

  // Other vowels
  'ɑ̃': 'an',
  'ɛ': 'e',
  'ɛ̃': 'en',
  'ɪ': 'i',
  'iː': 'ee',
  'ᵻ': 'i',
  'ɔ': 'o',
  'ɔː': 'or',
  'ɔ̃': 'on',
  'ʊ': 'u',
  'uː': 'oo',
  'ʉ': 'u',
  'ʌ': 'uh',
  'ə': 'uh',
  'ɐ': 'uh',
  'ɜ': 'er',
  'ɜː': 'er',
  'ɚ': 'er',
  'œ': 'uh',
  'ø': 'uh',

  // IPA y is a rounded vowel.
  'y': 'u',
  'yː': 'u',

  'eː': 'ay',
  'oː': 'oh',

  // Diphthongs
  'aɪ': 'ai',
  'eɪ': 'ei',
  'aʊ': 'ow',
  'oʊ': 'oh',
  'ɔɪ': 'oi',

  // R-colored combinations
  'ɑːɹ': 'ar',
  'ɔːɹ': 'or',
  'oːɹ': 'or',

  // Syllabic combinations
  'əl': 'uhl',

  // Marks that should not display alone
  'ː': '',
  'ˈ': '',
  'ˌ': '',
});

export function normalizeDetectedPhoneme(
  rawToken
) {
  if (
    rawToken === null ||
    rawToken === undefined
  ) {
    return '';
  }

  const raw = String(rawToken).trim();

  if (NON_SPEECH_TOKENS.has(raw)) {
    return '';
  }

  /*
   * Raw IPA recognition must happen before normalizeArpabet.
   *
   * Otherwise distinctions such as:
   *
   *   a  -> a
   *   aː -> aa
   *
   * could be flattened into the same canonical token.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      DETECTED_IPA_TO_ENGLISH,
      raw
    )
  ) {
    return DETECTED_IPA_TO_ENGLISH[raw];
  }

  const normalized = normalizeArpabet(raw);

  return normalized || raw;
}

/**
 * Display a canonical SoundMirror token.
 */
export function getDisplayToken(rawToken) {
  if (
    rawToken === null ||
    rawToken === undefined
  ) {
    return '';
  }

  const raw = String(rawToken).trim();

  if (NON_SPEECH_TOKENS.has(raw)) {
    return '';
  }

  /*
   * Handle raw IPA symbols that cannot be safely treated
   * as SoundMirror canonical tokens.
   */
  if (
    raw === 'aː' ||
    raw === 'ɑ' ||
    raw === 'ɑː' ||
    raw === 'ɒ'
  ) {
    return 'ah';
  }

  const normalized = normalizeArpabet(raw);

  if (normalized) {
    const helper =
      helperForPhoneme(normalized);

    if (helper) {
      return helper;
    }
  }

  /*
   * Canonical SoundMirror tokens such as aa, ah, j, and y
   * are resolved here after the ARPABET check.
   */
  const canonicalHelper =
    helperForPhoneme(raw);

  if (
    canonicalHelper &&
    canonicalHelper !== raw
  ) {
    return canonicalHelper;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      IPA_HELPER_MAP,
      raw
    )
  ) {
    const mapped = IPA_HELPER_MAP[raw];

    return mapped || raw;
  }

  let output = '';

  for (const char of raw) {
    if (
      Object.prototype.hasOwnProperty.call(
        IPA_HELPER_MAP,
        char
      )
    ) {
      output += IPA_HELPER_MAP[char];
    } else if (/[a-z]/i.test(char)) {
      output += char.toLowerCase();
    } else {
      output += char;
    }
  }

  const cleaned = output.trim();

  return cleaned || raw;
}

/**
 * The transcript supplied by Practice contains raw backend IPA.
 *
 * Normalize each detector token first, then display the resulting
 * canonical SoundMirror token.
 */
export function sanitizeTranscript(text) {
  if (!text) return '';

  return String(text)
    .split(/\s+/)
    .map((rawToken) =>
      normalizeDetectedPhoneme(rawToken)
    )
    .filter(Boolean)
    .map((canonicalToken) =>
      getDisplayToken(canonicalToken)
    )
    .filter(Boolean)
    .join(' ');
}

export {
  IPA_HELPER_MAP,
  DETECTED_IPA_TO_ENGLISH,
};