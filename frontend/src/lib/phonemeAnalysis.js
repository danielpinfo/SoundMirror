/**
 * PHONEME ANALYSIS LAYER
 * 
 * Architecture: Phoneme-First
 * - This module is the SINGLE SOURCE OF TRUTH for animation and grading
 * - Audio sources (TTS/MP3) are reference-only, they do NOT drive timing
 * - Animation timing is driven by phoneme sequence and duration
 * - Grading compares target phonemes vs detected phonemes
 * 
 * Pipeline:
 *   Text + Language
 *        ↓
 *   PhonemeAnalysis (this module)
 *        ↓
 *   ┌────┴────┐
 *   ↓         ↓
 * Animation  Grading
 *   ↓
 * Audio (reference-only, plays alongside)
 * 
 * PLACEHOLDER: IPA specifics and detection logic will be provided later.
 * Current implementation uses romanization-based approximations.
 */

import { transliterate } from './phonemeRules';
import { resolveViseme, getFrameForPhoneme, PHONEME_FRAME_MAP } from './constants';

// =============================================================================
// PLACEHOLDER: Articulatory Features Database
// Will be replaced with proper IPA-based data
// =============================================================================

const ARTICULATORY_FEATURES = {
  // Vowels
  'a': { manner: 'vowel', place: 'low-central', voiced: true, rounded: false, ipa: 'ɑ' },
  'e': { manner: 'vowel', place: 'mid-front', voiced: true, rounded: false, ipa: 'ɛ' },
  'i': { manner: 'vowel', place: 'high-front', voiced: true, rounded: false, ipa: 'i' },
  'o': { manner: 'vowel', place: 'mid-back', voiced: true, rounded: true, ipa: 'o' },
  'u': { manner: 'vowel', place: 'high-back', voiced: true, rounded: true, ipa: 'u' },
  
  // Plosives
  'p': { manner: 'plosive', place: 'bilabial', voiced: false, ipa: 'p' },
  'b': { manner: 'plosive', place: 'bilabial', voiced: true, ipa: 'b' },
  't': { manner: 'plosive', place: 'alveolar', voiced: false, ipa: 't' },
  'd': { manner: 'plosive', place: 'alveolar', voiced: true, ipa: 'd' },
  'k': { manner: 'plosive', place: 'velar', voiced: false, ipa: 'k' },
  'g': { manner: 'plosive', place: 'velar', voiced: true, ipa: 'g' },
  
  // Fricatives
  'f': { manner: 'fricative', place: 'labiodental', voiced: false, ipa: 'f' },
  'v': { manner: 'fricative', place: 'labiodental', voiced: true, ipa: 'v' },
  's': { manner: 'fricative', place: 'alveolar', voiced: false, ipa: 's' },
  'z': { manner: 'fricative', place: 'alveolar', voiced: true, ipa: 'z' },
  'sh': { manner: 'fricative', place: 'postalveolar', voiced: false, ipa: 'ʃ' },
  'zh': { manner: 'fricative', place: 'postalveolar', voiced: true, ipa: 'ʒ' },
  'th': { manner: 'fricative', place: 'dental', voiced: false, ipa: 'θ' },
  'h': { manner: 'fricative', place: 'glottal', voiced: false, ipa: 'h' },
  
  // Affricates
  'ch': { manner: 'affricate', place: 'postalveolar', voiced: false, ipa: 'tʃ' },
  'j': { manner: 'affricate', place: 'postalveolar', voiced: true, ipa: 'dʒ' },
  
  // Nasals
  'm': { manner: 'nasal', place: 'bilabial', voiced: true, ipa: 'm' },
  'n': { manner: 'nasal', place: 'alveolar', voiced: true, ipa: 'n' },
  'ng': { manner: 'nasal', place: 'velar', voiced: true, ipa: 'ŋ' },
  
  // Liquids
  'l': { manner: 'lateral', place: 'alveolar', voiced: true, ipa: 'l' },
  'r': { manner: 'approximant', place: 'alveolar', voiced: true, ipa: 'ɹ' },
  
  // Glides
  'w': { manner: 'glide', place: 'bilabial-velar', voiced: true, ipa: 'w' },
  'y': { manner: 'glide', place: 'palatal', voiced: true, ipa: 'j' },
};

// =============================================================================
// PLACEHOLDER: Phoneme Duration Database (in milliseconds)
// Will be calibrated based on actual speech patterns
// =============================================================================

const PHONEME_DURATIONS = {
  // Vowels (longer)
  'a': 180, 'e': 160, 'i': 150, 'o': 170, 'u': 160,
  'ah': 200, 'eh': 180, 'ee': 170, 'oh': 190, 'oo': 180,
  
  // Plosives (short burst)
  'p': 80, 'b': 90, 't': 70, 'd': 80, 'k': 90, 'g': 100,
  
  // Fricatives (sustained)
  'f': 120, 'v': 130, 's': 140, 'z': 150, 'sh': 160, 'h': 100,
  'th': 130,
  
  // Affricates
  'ch': 150, 'j': 160,
  
  // Nasals
  'm': 120, 'n': 110, 'ng': 130,
  
  // Liquids/Glides
  'l': 100, 'r': 110, 'w': 90, 'y': 80,
  
  // Default
  'default': 120,
};

// =============================================================================
// CORE PHONEME ANALYSIS
// =============================================================================

/**
 * @typedef {Object} PhonemeData
 * @property {string} symbol - The phoneme symbol (romanized)
 * @property {string} ipa - IPA representation (placeholder)
 * @property {string} viseme - Mapped viseme for animation
 * @property {number} frame - PNG frame number (0-19)
 * @property {number} duration - Duration in ms
 * @property {number} startTime - Start time in ms (cumulative)
 * @property {number} endTime - End time in ms
 * @property {Object} articulatory - Articulatory features
 * @property {number} position - Position in original text
 */

/**
 * @typedef {Object} PhonemeAnalysisResult
 * @property {string} text - Original input text
 * @property {string} language - Language code
 * @property {string} romanized - Transliterated/romanized form
 * @property {PhonemeData[]} phonemes - Array of analyzed phonemes
 * @property {number} totalDuration - Total animation duration in ms
 * @property {Object} audioReference - Audio source info (reference only)
 * @property {Object} metadata - Additional metadata
 */

/**
 * Analyze text and produce phoneme sequence with timing and viseme data
 * This is the SINGLE SOURCE OF TRUTH for animation and grading
 * 
 * @param {string} text - Input text to analyze
 * @param {string} language - Language code (english, japanese, etc.)
 * @param {Object} options - Analysis options
 * @returns {PhonemeAnalysisResult}
 */
export function analyzePhonemes(text, language = 'english', options = {}) {
  const {
    speedMultiplier = 1.0,  // Animation speed adjustment
    mode = 'word',          // 'letter' or 'word'
  } = options;
  
  // Step 1: Transliterate non-Latin scripts
  const romanized = transliterate(text, language);
  
  // Step 2: Parse into phoneme symbols
  const phonemeSymbols = parseToPhonemeSymbols(romanized, language);
  
  // Step 3: Build phoneme data with timing
  let currentTime = 0;
  const phonemes = phonemeSymbols.map((symbol, index) => {
    const viseme = resolveViseme(symbol);
    const frame = getFrameForPhoneme(symbol);
    const baseDuration = PHONEME_DURATIONS[symbol] || PHONEME_DURATIONS[viseme] || PHONEME_DURATIONS.default;
    const duration = Math.round(baseDuration / speedMultiplier);
    const articulatory = ARTICULATORY_FEATURES[symbol] || ARTICULATORY_FEATURES[viseme] || getDefaultArticulatory(symbol);
    
    const phonemeData = {
      symbol,
      ipa: articulatory.ipa || symbol,
      viseme,
      frame,
      duration,
      startTime: currentTime,
      endTime: currentTime + duration,
      articulatory,
      position: index,
    };
    
    currentTime += duration;
    return phonemeData;
  });
  
  // Step 4: Build audio reference (reference-only, does NOT drive timing)
  const audioReference = buildAudioReference(text, language, mode);
  
  // Step 5: Build result
  return {
    text,
    language,
    romanized,
    phonemes,
    totalDuration: currentTime,
    audioReference,
    metadata: {
      analyzedAt: Date.now(),
      version: '1.0.0-placeholder',
      mode,
      speedMultiplier,
      phonemeCount: phonemes.length,
    },
  };
}

/**
 * Parse romanized text into phoneme symbols
 * PLACEHOLDER: Will be replaced with proper phoneme detection
 */
function parseToPhonemeSymbols(romanized, language) {
  const text = romanized.toLowerCase();
  const symbols = [];
  let i = 0;
  
  // Multi-character phonemes (check longest first)
  const multiCharPhonemes = ['ng', 'ch', 'sh', 'th', 'zh', 'ph', 'wh'];
  
  while (i < text.length) {
    let matched = false;
    
    // Try multi-character phonemes first
    for (const phoneme of multiCharPhonemes) {
      if (text.substring(i, i + phoneme.length) === phoneme) {
        symbols.push(phoneme);
        i += phoneme.length;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      const char = text[i];
      // Skip non-alphabetic characters
      if (/[a-z]/.test(char)) {
        symbols.push(char);
      }
      i++;
    }
  }
  
  return symbols;
}

/**
 * Build audio reference info (reference-only, does NOT drive animation)
 */
function buildAudioReference(text, language, mode) {
  const langMap = {
    'english': 'en-US', 'spanish': 'es-ES', 'italian': 'it-IT',
    'portuguese': 'pt-BR', 'german': 'de-DE', 'french': 'fr-FR',
    'japanese': 'ja-JP', 'chinese': 'zh-CN', 'hindi': 'hi-IN', 'arabic': 'ar-SA'
  };
  
  if (mode === 'letter') {
    return {
      type: 'mp3',
      source: `/assets/audio/${language}-${text.toLowerCase()}.mp3`,
      fallback: 'tts',
    };
  }
  
  return {
    type: 'tts',
    config: {
      text,
      lang: langMap[language] || 'en-US',
      rate: 0.4,  // Slow for clarity
      pitch: 1.0,
    },
    fallback: null,
  };
}

/**
 * Get default articulatory features for unknown phonemes
 */
function getDefaultArticulatory(symbol) {
  return {
    manner: 'unknown',
    place: 'unknown',
    voiced: true,
    ipa: symbol,
  };
}

// =============================================================================
// ANIMATION INTERFACE
// =============================================================================

/**
 * Convert phoneme analysis to animation frame sequence
 * @param {PhonemeAnalysisResult} analysis - Result from analyzePhonemes()
 * @param {Object} options - Animation options
 * @returns {Object} Animation data
 */
export function toAnimationSequence(analysis, options = {}) {
  const {
    frameCloneCount = 6,      // How many times to clone each frame for duration
    leadInFrames = 4,         // Neutral frames at start
    leadOutFrames = 6,        // Neutral frames at end
  } = options;
  
  const frames = [];
  const frameTimings = [];
  
  // Lead-in (neutral mouth)
  for (let i = 0; i < leadInFrames; i++) {
    frames.push(0);
    frameTimings.push({ frame: 0, phoneme: null, type: 'lead-in' });
  }
  
  // Phoneme frames
  for (const phoneme of analysis.phonemes) {
    // Clone frames based on duration (normalized to frame count)
    const cloneCount = Math.max(1, Math.round(phoneme.duration / 30)); // ~30ms per frame
    
    for (let i = 0; i < cloneCount; i++) {
      frames.push(phoneme.frame);
      frameTimings.push({
        frame: phoneme.frame,
        phoneme: phoneme.symbol,
        ipa: phoneme.ipa,
        type: 'phoneme',
        isFirst: i === 0,
        isLast: i === cloneCount - 1,
      });
    }
  }
  
  // Lead-out (neutral mouth)
  for (let i = 0; i < leadOutFrames; i++) {
    frames.push(0);
    frameTimings.push({ frame: 0, phoneme: null, type: 'lead-out' });
  }
  
  return {
    frames,
    frameTimings,
    totalFrames: frames.length,
    phonemeCount: analysis.phonemes.length,
    estimatedDuration: analysis.totalDuration,
  };
}

// =============================================================================
// GRADING INTERFACE
// =============================================================================

/**
 * @typedef {Object} PhonemeGradingResult
 * @property {number} overallScore - 0-100 overall score
 * @property {Object[]} phonemeScores - Per-phoneme scores
 * @property {string[]} feedback - Feedback messages
 * @property {Object} analysis - Detailed analysis
 */

/**
 * Compare target phonemes with detected phonemes for grading
 * PLACEHOLDER: Detection logic will be provided later
 * 
 * @param {PhonemeAnalysisResult} targetAnalysis - Expected phoneme sequence
 * @param {Object} detectedData - Detected phonemes from user (placeholder structure)
 * @returns {PhonemeGradingResult}
 */
export function gradePhonemes(targetAnalysis, detectedData = null) {
  // PLACEHOLDER: This will be replaced with actual detection comparison
  // For now, return structure showing the interface
  
  const phonemeScores = targetAnalysis.phonemes.map((target, index) => {
    // Placeholder: Generate mock detected data
    const detected = detectedData?.phonemes?.[index] || {
      symbol: target.symbol,
      confidence: 0.0,  // No actual detection yet
    };
    
    return {
      position: index,
      target: {
        symbol: target.symbol,
        ipa: target.ipa,
        articulatory: target.articulatory,
      },
      detected: {
        symbol: detected.symbol,
        confidence: detected.confidence,
        // PLACEHOLDER: Will include actual detected features
      },
      match: detected.symbol === target.symbol,
      score: detected.confidence * 100,
      feedback: generatePhonemeFeedback(target, detected),
    };
  });
  
  // Calculate overall score
  const totalScore = phonemeScores.reduce((sum, ps) => sum + ps.score, 0);
  const overallScore = phonemeScores.length > 0 
    ? Math.round(totalScore / phonemeScores.length) 
    : 0;
  
  // Generate overall feedback
  const feedback = generateOverallFeedback(phonemeScores, targetAnalysis);
  
  return {
    overallScore,
    phonemeScores,
    feedback,
    analysis: {
      targetCount: targetAnalysis.phonemes.length,
      detectedCount: detectedData?.phonemes?.length || 0,
      matchRate: calculateMatchRate(phonemeScores),
    },
    // PLACEHOLDER fields for future implementation
    _placeholder: {
      note: 'Detection logic will be provided later',
      expectedInputFormat: {
        phonemes: [
          { symbol: 'string', confidence: 'number 0-1', timing: 'optional' }
        ],
        audioFeatures: 'optional - spectral data, formants, etc.',
        visualFeatures: 'optional - lip tracking data',
      },
    },
  };
}

/**
 * Generate feedback for a single phoneme comparison
 * PLACEHOLDER: Will be enhanced with IPA-specific guidance
 */
function generatePhonemeFeedback(target, detected) {
  if (!detected || detected.confidence === 0) {
    return `Practice the "${target.symbol}" sound (${target.ipa})`;
  }
  
  if (detected.symbol === target.symbol && detected.confidence > 0.8) {
    return null; // Good match, no feedback needed
  }
  
  const art = target.articulatory;
  
  // Generate articulatory guidance based on features
  const tips = [];
  
  if (art.manner === 'vowel') {
    if (art.place.includes('high')) tips.push('Raise your tongue');
    if (art.place.includes('low')) tips.push('Lower your jaw');
    if (art.rounded) tips.push('Round your lips');
  } else if (art.manner === 'plosive') {
    tips.push('Make a quick, explosive sound');
    if (art.place === 'bilabial') tips.push('Press your lips together');
  } else if (art.manner === 'fricative') {
    tips.push('Create friction with continuous airflow');
    if (art.place === 'labiodental') tips.push('Touch teeth to lower lip');
  } else if (art.manner === 'nasal') {
    tips.push('Let air flow through your nose');
  }
  
  return tips.length > 0 ? tips.join('. ') : `Focus on the "${target.symbol}" sound`;
}

/**
 * Generate overall grading feedback
 */
function generateOverallFeedback(phonemeScores, analysis) {
  const feedback = [];
  
  // Find problem areas
  const lowScores = phonemeScores.filter(ps => ps.score < 60);
  const mediumScores = phonemeScores.filter(ps => ps.score >= 60 && ps.score < 80);
  
  if (lowScores.length === 0 && mediumScores.length === 0) {
    feedback.push('Excellent pronunciation!');
  } else {
    if (lowScores.length > 0) {
      const problemSounds = [...new Set(lowScores.map(ps => ps.target.symbol))];
      feedback.push(`Focus on these sounds: ${problemSounds.join(', ')}`);
    }
    
    if (mediumScores.length > 0) {
      feedback.push('Good progress! Keep practicing for clarity.');
    }
  }
  
  return feedback;
}

/**
 * Calculate match rate between target and detected
 */
function calculateMatchRate(phonemeScores) {
  if (phonemeScores.length === 0) return 0;
  const matches = phonemeScores.filter(ps => ps.match).length;
  return Math.round((matches / phonemeScores.length) * 100);
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

/**
 * Get phoneme info for display purposes
 */
export function getPhonemeDisplayInfo(symbol) {
  const viseme = resolveViseme(symbol);
  const frame = getFrameForPhoneme(symbol);
  const art = ARTICULATORY_FEATURES[symbol] || ARTICULATORY_FEATURES[viseme] || getDefaultArticulatory(symbol);
  
  return {
    symbol,
    ipa: art.ipa,
    viseme,
    frame,
    manner: art.manner,
    place: art.place,
    voiced: art.voiced,
  };
}

/**
 * Check if a phoneme symbol is valid/known
 */
export function isKnownPhoneme(symbol) {
  return PHONEME_FRAME_MAP[symbol] !== undefined || 
         ARTICULATORY_FEATURES[symbol] !== undefined;
}

export default {
  analyzePhonemes,
  toAnimationSequence,
  gradePhonemes,
  getPhonemeDisplayInfo,
  isKnownPhoneme,
};
