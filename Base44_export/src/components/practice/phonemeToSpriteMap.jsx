/**
 * Phoneme to Sprite File Mapping
 * Maps IPA/phoneme tokens to sprite sheet file names (p001-p024)
 * 
 * Structure: 512×512 per frame, 10 frames per sprite sheet (5120×512 PNG)
 * Frame 0 = neutral mouth, frames 1-9 = phoneme articulation + return to neutral
 */

export const PHONEME_SPRITE_MAP = {
  // Vowels
  'a': 'p001',    // /a/ "ah"
  'i': 'p002',    // /i/ "ee"
  'u': 'p003',    // /u/ "oo"
  'e': 'p004',    // /e/ "eh"
  'o': 'p005',    // /o/ "oh"
  'y': 'p006',    // /y/ "ü" (French/German)

  // Stops/Closures
  'p': 'p007',    // /p/ "p"
  't': 'p008',    // /t/ "t"
  'd': 'p009',    // /d/ "d"
  'k': 'p010',    // /k/ "k"
  'g': 'p011',    // /g/ "g"
  'ʔ': 'p012',    // /ʔ/ glottal stop

  // Nasals
  'n': 'p013',    // /n/ "n"
  'ŋ': 'p014',    // /ŋ/ "ng"

  // Fricatives/Affricates
  's': 'p015',    // /s/ "s"
  'ʃ': 'p016',    // /ʃ/ "sh"
  'θ': 'p017',    // /θ/ "th" voiceless
  'f': 'p018',    // /f/ "f"
  'h': 'p019',    // /h/ "h"
  'tʃ': 'p020',   // /tʃ/ "ch"

  // Liquids/Laterals
  'r': 'p021',    // /r/ "r"
  'l': 'p022',    // /l/ "l"
  'ɬ': 'p023',    // /ɬ/ Welsh "ll"

  // Approximants/Glides (additional)
  'w': 'p015',    // /w/ "w" (fallback to s for now)
  'j': 'p016',    // /j/ "y" (fallback to ʃ for now)

  // Common variant spellings
  'sh': 'p016',
  'ch': 'p020',
  'ng': 'p014',
  'th': 'p017',
};

/**
 * Get sprite file path for a phoneme
 * @param {string} phoneme - IPA phoneme or token
 * @returns {string} - Sprite file name (e.g., "p001")
 */
export function getPhonemeSprite(phoneme) {
  const token = String(phoneme || '').toLowerCase().trim();
  return PHONEME_SPRITE_MAP[token] || 'p001'; // Default to "ah" if not found
}

/**
 * Get full sprite URL for a phoneme
 * @param {string} phoneme - IPA phoneme or token
 * @param {string} basePath - Base path for sprites (default: /sprites)
 * @returns {string} - Full sprite sheet URL
 */
export function getPhonemeSpritePath(phoneme, basePath = '/sprites') {
  const spriteFile = getPhonemeSprite(phoneme);
  return `${basePath}/${spriteFile}.png`;
}

/**
 * Get sprite for a list of phonemes (for word/sentence animation)
 * @param {array} phonemes - Array of IPA phonemes
 * @returns {array} - Array of sprite file names
 */
export function getPhonemeSequenceSprites(phonemes) {
  return phonemes.map((p) => getPhonemeSprite(p));
}