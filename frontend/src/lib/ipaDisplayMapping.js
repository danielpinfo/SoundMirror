/**
 * IPA TO DISPLAY MAPPING
 * 
 * Converts internal IPA symbols to user-friendly display representations.
 * NEVER expose IPA symbols (ʃ, θ, ɒ, etc.) in the UI.
 * ALWAYS show plain letters users would recognize (sh, th, ee, etc.)
 * 
 * Internal IPA is preserved for detection, alignment, animation, and grading.
 * This module handles UI-only display conversion.
 */

// =============================================================================
// IPA → DISPLAY MAPPING TABLE
// =============================================================================

const IPA_TO_DISPLAY = {
  // Consonants - Fricatives
  'ʃ': 'sh',      // voiceless postalveolar fricative
  'ʒ': 'zh',      // voiced postalveolar fricative
  'θ': 'th',      // voiceless dental fricative
  'ð': 'th',      // voiced dental fricative (same display as voiceless)
  
  // Consonants - Affricates
  'tʃ': 'ch',     // voiceless postalveolar affricate
  'dʒ': 'j',      // voiced postalveolar affricate
  
  // Consonants - Nasals
  'ŋ': 'ng',      // velar nasal
  'ɲ': 'ny',      // palatal nasal
  
  // Consonants - Approximants
  'ɹ': 'r',       // alveolar approximant
  'j': 'y',       // palatal approximant
  'w': 'w',       // labial-velar approximant
  
  // Consonants - Laterals
  'ɫ': 'l',       // velarized alveolar lateral
  'ʎ': 'ly',      // palatal lateral
  
  // Consonants - Stops (usually same as orthographic)
  'p': 'p',
  'b': 'b',
  't': 't',
  'd': 'd',
  'k': 'k',
  'g': 'g',
  'ʔ': '',        // glottal stop - silent
  
  // Consonants - Other
  'h': 'h',
  'f': 'f',
  'v': 'v',
  's': 's',
  'z': 'z',
  'm': 'm',
  'n': 'n',
  'l': 'l',
  'r': 'r',
  
  // Vowels - Front (FIXED: clearer display without diphthong confusion)
  'i': 'ee',      // close front unrounded (as in "see")
  'ɪ': 'i',       // near-close front unrounded (as in "sit")
  'e': 'e',       // close-mid front unrounded (as in "bed") - NOT "ay"
  'ɛ': 'e',       // open-mid front unrounded (as in "pet")
  'æ': 'a',       // near-open front unrounded (as in "cat")
  
  // Vowels - Central
  'ə': 'uh',      // schwa (as in "about")
  'ɜ': 'er',      // open-mid central (as in "bird")
  'ʌ': 'u',       // open-mid back unrounded (as in "cup")
  'ɐ': 'uh',      // near-open central
  
  // Vowels - Back
  'u': 'oo',      // close back rounded (as in "boot")
  'ʊ': 'oo',      // near-close back rounded (as in "put")
  'o': 'o',       // close-mid back rounded (as in "go")
  'ɔ': 'aw',      // open-mid back rounded (as in "law")
  'ɑ': 'ah',      // open back unrounded (as in "father")
  'ɒ': 'o',       // open back rounded (as in British "lot")
  'a': 'ah',      // open front unrounded
  
  // Diphthongs (only when specifically detected as diphthongs)
  'eɪ': 'ay',     // as in "say"
  'aɪ': 'eye',    // as in "my"
  'ɔɪ': 'oy',     // as in "boy"
  'oʊ': 'oh',     // as in "go"
  'aʊ': 'ow',     // as in "how"
  'ɪə': 'eer',    // as in "near"
  'eə': 'air',    // as in "care"
  'ʊə': 'oor',    // as in "tour"
  
  // Common variations
  'y': 'y',
  'x': 'kh',      // voiceless velar fricative
  'ɣ': 'gh',      // voiced velar fricative
  'ç': 'h',       // voiceless palatal fricative
  'ʁ': 'r',       // voiced uvular fricative
  'χ': 'kh',      // voiceless uvular fricative
};

/**
 * Convert an IPA symbol to user-friendly display representation
 * 
 * @param {string} symbol - IPA symbol (e.g., 'ʃ', 'θ', 'ɒ')
 * @param {string} language - Language code (for future language-specific mappings)
 * @returns {string} - Display representation (e.g., 'sh', 'th', 'ah')
 */
export function ipaToDisplay(symbol, language = 'english') {
  if (!symbol) return '';
  
  // Check direct mapping first
  if (IPA_TO_DISPLAY[symbol]) {
    return IPA_TO_DISPLAY[symbol];
  }
  
  // Check lowercase version
  const lower = symbol.toLowerCase();
  if (IPA_TO_DISPLAY[lower]) {
    return IPA_TO_DISPLAY[lower];
  }
  
  // For unknown symbols, return the symbol if it's a basic letter
  if (/^[a-z]$/i.test(symbol)) {
    return symbol.toLowerCase();
  }
  
  // For multi-character unknown symbols, try to map each character
  if (symbol.length > 1) {
    return symbol.split('').map(c => ipaToDisplay(c, language)).join('');
  }
  
  // Last resort: return as-is (shouldn't happen with proper IPA)
  console.warn(`[ipaToDisplay] Unknown IPA symbol: ${symbol}`);
  return symbol;
}

/**
 * Convert an entire IPA sequence to display sequence
 * 
 * @param {Array<{symbol: string}>} ipaSequence - Array of IPA phoneme objects
 * @param {string} language - Language code
 * @returns {string[]} - Array of display strings
 */
export function ipaSequenceToDisplay(ipaSequence, language = 'english') {
  if (!ipaSequence || !Array.isArray(ipaSequence)) {
    return [];
  }
  
  return ipaSequence.map(phoneme => {
    const symbol = phoneme.symbol || phoneme;
    return ipaToDisplay(symbol, language);
  }).filter(s => s.length > 0);  // Remove empty strings (e.g., glottal stops)
}

/**
 * Align target and detected sequences for comparison
 * Simple left-to-right alignment by index
 * 
 * @param {string[]} targetDisplay - Target display sequence
 * @param {string[]} detectedDisplay - Detected display sequence
 * @returns {Object} - Alignment result with matched, extra, and missed phonemes
 */
export function alignSequences(targetDisplay, detectedDisplay) {
  const maxLength = Math.max(targetDisplay.length, detectedDisplay.length);
  const alignment = [];
  
  for (let i = 0; i < maxLength; i++) {
    const target = targetDisplay[i] || null;
    const detected = detectedDisplay[i] || null;
    
    let status;
    if (target && detected) {
      // Both exist - check if they match
      status = target.toLowerCase() === detected.toLowerCase() ? 'match' : 'different';
    } else if (target && !detected) {
      // Target exists but detected is missing
      status = 'missed';
    } else if (!target && detected) {
      // Detected exists but no target (extra sound)
      status = 'extra';
    }
    
    alignment.push({
      index: i,
      target,
      detected,
      status,
    });
  }
  
  return {
    alignment,
    targetLength: targetDisplay.length,
    detectedLength: detectedDisplay.length,
    matchCount: alignment.filter(a => a.status === 'match').length,
    differentCount: alignment.filter(a => a.status === 'different').length,
    missedCount: alignment.filter(a => a.status === 'missed').length,
    extraCount: alignment.filter(a => a.status === 'extra').length,
  };
}

/**
 * Log both IPA and display sequences for debugging
 * 
 * @param {Array<{symbol: string}>} ipaSequence - IPA sequence
 * @param {string} label - Label for the log
 * @param {string} language - Language code
 */
export function logPhonemeSequences(ipaSequence, label = 'Phonemes', language = 'english') {
  const ipaSymbols = ipaSequence.map(p => p.symbol || p);
  const displaySymbols = ipaSequenceToDisplay(ipaSequence, language);
  
  console.log(`[${label}] IPA:`, ipaSymbols);
  console.log(`[${label}] Display:`, displaySymbols);
}

export default {
  ipaToDisplay,
  ipaSequenceToDisplay,
  alignSequences,
  logPhonemeSequences,
};
