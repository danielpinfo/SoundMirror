/**
 * PHONETIC DISPLAY - BASE44-STYLE APPROACH
 * 
 * Core Philosophy:
 * - Show READABLE phonetics that match what users hear
 * - "What you see = what you hear"
 * - Simple, easy-to-pronounce representations
 * - NO complex IPA symbols exposed to users
 * 
 * Based on Base44 SoundMirror system:
 * - Letters show simple phonetics (A = "ah", B = "buh", M = "muh")
 * - Words show readable pronunciation (hello = "heh-loh")
 * - Detected speech shows what was heard in readable form
 */

// =============================================================================
// LETTER PHONETICS (for letter practice)
// =============================================================================

export const LETTER_PHONETICS = {
  'A': 'ah', 'B': 'buh', 'C': 'kuh', 'D': 'duh', 'E': 'eh',
  'F': 'fuh', 'G': 'guh', 'H': 'huh', 'I': 'ih', 'J': 'juh',
  'K': 'kuh', 'L': 'luh', 'M': 'muh', 'N': 'nuh', 'O': 'oh',
  'P': 'puh', 'Q': 'koo', 'R': 'ruh', 'S': 'sss', 'T': 'tuh',
  'U': 'oo', 'V': 'vuh', 'W': 'wuh', 'X': 'ks', 'Y': 'yuh', 'Z': 'zzz',
  // Special characters
  'Ñ': 'enye', 'LL': 'yeh', 'CH': 'chuh', 'SH': 'shuh', 'TH': 'thuh',
};

/**
 * Get phonetic for a letter (for Letter Practice mode)
 */
export function getLetterPhonetic(letter) {
  if (!letter) return '';
  const upper = letter.toUpperCase();
  return LETTER_PHONETICS[upper] || letter.toLowerCase();
}

// =============================================================================
// WORD/PHRASE PHONETIC DISPLAY
// =============================================================================

/**
 * Simple phonetic rules for English words
 * Maps common letter patterns to readable pronunciations
 */
const PHONETIC_PATTERNS = [
  // Special word replacements (handle these first)
  { word: "i'm", phonetic: "aym" },
  { word: "i", phonetic: "ay" },
  { word: "you", phonetic: "yoo" },
  { word: "the", phonetic: "thuh" },
  { word: "to", phonetic: "too" },
  { word: "are", phonetic: "ar" },
  { word: "is", phonetic: "iz" },
  { word: "fine", phonetic: "fyn" },
  { word: "hello", phonetic: "heh-loh" },
  { word: "water", phonetic: "wah-ter" },
  { word: "please", phonetic: "pleez" },
  { word: "thank", phonetic: "thank" },
  { word: "good", phonetic: "good" },
  { word: "morning", phonetic: "mor-ning" },
  { word: "how", phonetic: "how" },
  { word: "nice", phonetic: "nys" },
  { word: "meet", phonetic: "meet" },
  { word: "see", phonetic: "see" },
  { word: "later", phonetic: "lay-ter" },
  { word: "yes", phonetic: "yes" },
  { word: "no", phonetic: "noh" },
  { word: "food", phonetic: "food" },
  { word: "help", phonetic: "help" },
];

/**
 * Letter pattern replacements for phonetic conversion
 */
const LETTER_PATTERN_RULES = [
  // Vowel digraphs (longer patterns first)
  { pattern: 'ough', replace: 'oh' },
  { pattern: 'tion', replace: 'shun' },
  { pattern: 'sion', replace: 'zhun' },
  { pattern: 'ight', replace: 'yt' },
  { pattern: 'ould', replace: 'ood' },
  { pattern: 'ough', replace: 'uf' },
  
  // Common digraphs
  { pattern: 'th', replace: 'th' },
  { pattern: 'ch', replace: 'ch' },
  { pattern: 'sh', replace: 'sh' },
  { pattern: 'ng', replace: 'ng' },
  { pattern: 'ck', replace: 'k' },
  { pattern: 'ph', replace: 'f' },
  { pattern: 'wh', replace: 'w' },
  { pattern: 'wr', replace: 'r' },
  { pattern: 'kn', replace: 'n' },
  { pattern: 'gn', replace: 'n' },
  { pattern: 'mb', replace: 'm' },
  
  // Vowel patterns
  { pattern: 'ee', replace: 'ee' },
  { pattern: 'ea', replace: 'ee' },
  { pattern: 'oo', replace: 'oo' },
  { pattern: 'ou', replace: 'ow' },
  { pattern: 'ow', replace: 'oh' },
  { pattern: 'ai', replace: 'ay' },
  { pattern: 'ay', replace: 'ay' },
  { pattern: 'ei', replace: 'ay' },
  { pattern: 'ey', replace: 'ee' },
  { pattern: 'ie', replace: 'ee' },
  { pattern: 'oa', replace: 'oh' },
  { pattern: 'oi', replace: 'oy' },
  { pattern: 'oy', replace: 'oy' },
  { pattern: 'au', replace: 'aw' },
  { pattern: 'aw', replace: 'aw' },
  
  // Double consonants (simplify)
  { pattern: 'll', replace: 'l' },
  { pattern: 'ss', replace: 's' },
  { pattern: 'tt', replace: 't' },
  { pattern: 'ff', replace: 'f' },
  { pattern: 'rr', replace: 'r' },
  { pattern: 'nn', replace: 'n' },
  { pattern: 'mm', replace: 'm' },
  { pattern: 'pp', replace: 'p' },
  { pattern: 'bb', replace: 'b' },
  { pattern: 'dd', replace: 'd' },
  { pattern: 'gg', replace: 'g' },
  { pattern: 'cc', replace: 'k' },
  { pattern: 'zz', replace: 'z' },
];

/**
 * Convert text to readable phonetic display
 * 
 * @param {string} text - Input text (word or phrase)
 * @param {string} language - Language code
 * @returns {string} - Readable phonetic representation
 */
export function textToPhonetic(text, language = 'english') {
  if (!text) return '';
  
  const words = text.toLowerCase().trim().split(/\s+/);
  const phoneticWords = words.map(word => {
    // Check for exact word match first
    const exactMatch = PHONETIC_PATTERNS.find(p => p.word === word);
    if (exactMatch) return exactMatch.phonetic;
    
    // Apply letter pattern rules
    let phonetic = word;
    for (const rule of LETTER_PATTERN_RULES) {
      phonetic = phonetic.replace(new RegExp(rule.pattern, 'g'), rule.replace);
    }
    
    return phonetic;
  });
  
  return phoneticWords.join(' ');
}

// =============================================================================
// IPA TO READABLE DISPLAY
// =============================================================================

/**
 * Map IPA symbols to readable display
 * Used when converting detected phonemes to user-friendly format
 */
const IPA_TO_READABLE = {
  // Vowels - simple, readable
  'i': 'ee', 'iː': 'ee', 'ɪ': 'i',
  'e': 'e', 'eː': 'e', 'ɛ': 'e',
  'æ': 'a', 'a': 'ah', 'aː': 'ah',
  'ə': 'uh', 'ɜ': 'er', 'ʌ': 'uh', 'ɐ': 'uh',
  'u': 'oo', 'uː': 'oo', 'ʊ': 'oo',
  'o': 'oh', 'oː': 'oh', 'ɔ': 'aw', 'ɒ': 'o',
  'ɑ': 'ah',
  
  // Diphthongs
  'eɪ': 'ay', 'aɪ': 'ai', 'ɔɪ': 'oy',
  'oʊ': 'oh', 'əʊ': 'oh', 'aʊ': 'ow',
  'ɪə': 'eer', 'eə': 'air', 'ʊə': 'oor',
  'juː': 'yoo', 'ju': 'yoo',
  
  // Consonants - keep simple
  'p': 'p', 'b': 'b', 't': 't', 'd': 'd', 'k': 'k', 'g': 'g',
  'f': 'f', 'v': 'v', 's': 's', 'z': 'z', 'h': 'h',
  'ʃ': 'sh', 'ʒ': 'zh', 'θ': 'th', 'ð': 'th',
  'tʃ': 'ch', 'dʒ': 'j',
  'm': 'm', 'n': 'n', 'ŋ': 'ng',
  'l': 'l', 'r': 'r', 'ɹ': 'r', 'ɾ': 'r',
  'j': 'y', 'w': 'w',
  
  // Special
  'ʔ': '', 'ˈ': '', 'ˌ': '', 'ː': '',
};

/**
 * Convert IPA symbol to readable display
 * 
 * @param {string} ipa - IPA symbol
 * @returns {string} - Readable representation
 */
export function ipaToReadable(ipa) {
  if (!ipa) return '';
  
  // Clean input
  const clean = ipa.replace(/[ˈˌː.]/g, '').trim();
  if (!clean) return '';
  
  // Direct lookup
  if (IPA_TO_READABLE[clean]) {
    return IPA_TO_READABLE[clean];
  }
  
  // Try lowercase
  if (IPA_TO_READABLE[clean.toLowerCase()]) {
    return IPA_TO_READABLE[clean.toLowerCase()];
  }
  
  // For simple letters, return as-is
  if (/^[a-z]$/i.test(clean)) {
    return clean.toLowerCase();
  }
  
  // For multi-character, try character by character
  if (clean.length > 1) {
    let result = '';
    let i = 0;
    while (i < clean.length) {
      // Try 2-char combos first
      if (i + 1 < clean.length) {
        const twoChar = clean.slice(i, i + 2);
        if (IPA_TO_READABLE[twoChar]) {
          result += IPA_TO_READABLE[twoChar];
          i += 2;
          continue;
        }
      }
      // Single char
      const oneChar = clean[i];
      result += IPA_TO_READABLE[oneChar] || oneChar;
      i++;
    }
    return result;
  }
  
  return clean;
}

/**
 * Convert IPA sequence to readable display
 * 
 * @param {Array} ipaSequence - Array of IPA phoneme objects
 * @returns {string[]} - Array of readable strings
 */
export function ipaSequenceToReadable(ipaSequence) {
  if (!ipaSequence || !Array.isArray(ipaSequence)) return [];
  
  return ipaSequence
    .map(p => ipaToReadable(p.symbol || p))
    .filter(s => s.length > 0);
}

/**
 * Join IPA sequence as readable phonetic string
 * 
 * @param {Array} ipaSequence - Array of IPA phoneme objects
 * @returns {string} - Readable phonetic string
 */
export function ipaSequenceToPhoneticString(ipaSequence) {
  const readable = ipaSequenceToReadable(ipaSequence);
  return readable.join('');
}

// =============================================================================
// FRAME TO SOUND NAME (for animation display)
// =============================================================================

/**
 * Frame index to readable sound name
 * Shows what sound the mouth shape represents
 */
export const FRAME_TO_SOUND_NAME = {
  0: 'neutral',
  1: 'ah/oo',      // a, u
  2: 'eh',         // e
  3: 'ee',         // ee, z, x
  4: 'ue',         // ü
  5: 'oh',         // oo, o, ou, w
  6: 'k/g',        // c, k, q, g
  7: 't/d',        // t, tsk, d, j
  8: 'p/b/m',      // b, p, m
  9: 'n',          // n
  10: 'ng',        // ng
  11: 's',         // s
  12: 'sh',        // sh
  13: 'th',        // th
  14: 'f/v',       // f, v
  15: 'ch',        // ch
  16: 'h',         // h
  17: 'r',         // r
  18: 'l',         // L
  19: 'y',         // LL, y
};

/**
 * Get readable sound name for a frame index
 */
export function getFrameSoundName(frameIndex) {
  return FRAME_TO_SOUND_NAME[frameIndex] || 'neutral';
}

export default {
  getLetterPhonetic,
  textToPhonetic,
  ipaToReadable,
  ipaSequenceToReadable,
  ipaSequenceToPhoneticString,
  getFrameSoundName,
  LETTER_PHONETICS,
  FRAME_TO_SOUND_NAME,
};
