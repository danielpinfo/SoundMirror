/**
 * IPA TO DISPLAY MAPPING
 * 
 * EMERGENT IPA → TTS PRONUNCIATION RULE SHEET
 * "If IPA is supplied, Emergent must render exactly those sounds—no more, no less—
 * regardless of language, spelling, or English bias."
 * 
 * Converts internal IPA symbols to user-friendly display representations.
 * NEVER expose IPA symbols (ʃ, θ, ɒ, ʔ, ŋ, etc.) in the UI.
 * ALWAYS show plain letters users would recognize (sh, th, ng, etc.)
 * 
 * Core Philosophy:
 * - What you see must equal what you hear
 * - No guessing, only exactly what is heard
 * - One glyph = one sound
 */

// =============================================================================
// IPA → DISPLAY MAPPING TABLE (User-Friendly Alphabet)
// =============================================================================

const IPA_TO_DISPLAY = {
  // =========================================================================
  // VOWELS - Pure, No Drift (following rule sheet)
  // =========================================================================
  
  // Close front
  'i': 'ee',      // Always "ee" (machine-pure, no glide) - as in "see"
  'iː': 'ee',     // Long ee
  'ɪ': 'i',       // Short i - as in "sit"
  
  // Close-mid front  
  'e': 'eh',      // Pure "eh", NEVER "ay" - as in "bed"
  'eː': 'eh',     // Long eh
  'ɛ': 'eh',      // Open-mid front - as in "pet"
  
  // Open front
  'æ': 'a',       // Near-open front - as in "cat"
  'a': 'ah',      // Open front - pure "ah", NEVER "uh"
  'aː': 'ah',     // Long ah
  
  // Central vowels
  'ə': 'uh',      // Schwa - as in "about"
  'ɜ': 'er',      // Open-mid central - as in "bird"
  'ɜː': 'er',     // Long er
  'ʌ': 'uh',      // Open-mid back unrounded - as in "cup"
  'ɐ': 'uh',      // Near-open central
  
  // Close back
  'u': 'oo',      // Pure "oo", NEVER centralized - as in "boot"
  'uː': 'oo',     // Long oo
  'ʊ': 'oo',      // Near-close back - as in "put"
  
  // Close-mid back
  'o': 'oh',      // Pure "oh", NEVER "ow" - as in "go"
  'oː': 'oh',     // Long oh
  'ɔ': 'aw',      // Open-mid back - as in "law"
  'ɔː': 'aw',     // Long aw
  
  // Open back
  'ɑ': 'ah',      // Open back unrounded - as in "father"
  'ɑː': 'ah',     // Long ah
  'ɒ': 'o',       // Open back rounded - British "lot"
  
  // =========================================================================
  // DIPHTHONGS (English-specific combinations)
  // =========================================================================
  'eɪ': 'ay',     // as in "say"
  'aɪ': 'ai',     // as in "my" 
  'ɔɪ': 'oy',     // as in "boy"
  'oʊ': 'oh',     // as in "go" - NOT "ow"
  'əʊ': 'oh',     // British variant - as in "go"
  'aʊ': 'ow',     // as in "how", "cow"
  'ɪə': 'eer',    // as in "near"
  'eə': 'air',    // as in "care"
  'ʊə': 'oor',    // as in "tour"
  'juː': 'yoo',   // as in "you", "use" - CRITICAL FIX
  'ju': 'yoo',    // Short version
  
  // =========================================================================
  // CONSONANTS - Fricatives
  // =========================================================================
  'ʃ': 'sh',      // voiceless postalveolar fricative
  'ʒ': 'zh',      // voiced postalveolar fricative  
  'θ': 'th',      // voiceless dental fricative - as in "think"
  'ð': 'th',      // voiced dental fricative - as in "this"
  'f': 'f',
  'v': 'v',
  's': 's',
  'z': 'z',
  'h': 'h',       // Always audible
  'x': 'kh',      // voiceless velar fricative
  'ɣ': 'gh',      // voiced velar fricative
  'ç': 'h',       // voiceless palatal fricative (German ich)
  'ʁ': 'r',       // voiced uvular fricative (French R)
  'χ': 'kh',      // voiceless uvular fricative
  'ħ': 'h',       // voiceless pharyngeal (Arabic)
  'ʕ': 'ah',      // voiced pharyngeal (Arabic)
  
  // =========================================================================
  // CONSONANTS - Affricates
  // =========================================================================
  'tʃ': 'ch',     // voiceless postalveolar affricate - as in "church"
  'dʒ': 'j',      // voiced postalveolar affricate - as in "judge"
  'ts': 'ts',     // voiceless alveolar affricate
  'dz': 'dz',     // voiced alveolar affricate
  
  // =========================================================================
  // CONSONANTS - Nasals
  // =========================================================================
  'ŋ': 'ng',      // velar nasal - as in "sing"
  'ɲ': 'ny',      // palatal nasal - Spanish ñ
  'm': 'm',
  'n': 'n',
  'n̩': 'n',       // syllabic n - display as plain n
  'm̩': 'm',       // syllabic m - display as plain m
  
  // =========================================================================
  // CONSONANTS - Stops/Plosives
  // =========================================================================
  'p': 'p',
  'b': 'b',
  't': 't',
  'd': 'd',
  'k': 'k',
  'g': 'g',
  'ʔ': '',        // glottal stop - audible but no letter display
  'pʰ': 'p',      // aspirated p
  'tʰ': 't',      // aspirated t
  'kʰ': 'k',      // aspirated k
  
  // =========================================================================
  // CONSONANTS - Approximants
  // =========================================================================
  'ɹ': 'r',       // alveolar approximant (English R)
  'r': 'r',       // trilled r
  'ɾ': 'r',       // alveolar tap (Spanish single r)
  'j': 'y',       // palatal approximant - as in "yes"
  'w': 'w',       // labial-velar approximant
  'ʍ': 'wh',      // voiceless labial-velar (some dialects)
  
  // =========================================================================
  // CONSONANTS - Laterals
  // =========================================================================
  'l': 'l',
  'ɫ': 'l',       // velarized lateral (dark L)
  'ʎ': 'ly',      // palatal lateral
  'ɬ': 'l',       // voiceless lateral fricative
  
  // =========================================================================
  // CONSONANTS - Retroflex (Hindi, etc.)
  // =========================================================================
  'ʈ': 't',       // retroflex t
  'ɖ': 'd',       // retroflex d
  'ɳ': 'n',       // retroflex n
  'ɽ': 'r',       // retroflex flap
  
  // =========================================================================
  // Special markers (display as empty or minimal)
  // =========================================================================
  'ˈ': '',        // primary stress marker - don't display
  'ˌ': '',        // secondary stress marker - don't display
  'ː': '',        // length marker (handled in vowel mapping)
  '.': '',        // syllable break
  ' ': ' ',       // space preserved
};

// =============================================================================
// LANGUAGE-SPECIFIC OVERRIDES
// =============================================================================

const LANGUAGE_OVERRIDES = {
  english: {
    // English-specific rules
    'juː': 'yoo',  // "you"
    'oʊ': 'oh',    // "go" - not "ow"
  },
  spanish: {
    // 5 pure vowels only, rolled r vs tapped r
    'r': 'rr',     // trilled
    'ɾ': 'r',      // tapped
  },
  german: {
    'y': 'ue',     // ü
    'ø': 'oe',     // ö
    'ç': 'ch',     // ich-sound
  },
  french: {
    'ɑ̃': 'an',     // nasal ah
    'ɔ̃': 'on',     // nasal aw
    'ɛ̃': 'an',     // nasal eh
    'œ̃': 'un',     // nasal oe
  },
  japanese: {
    'ɾ': 'r',      // tap, not R or L
  },
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
