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
// IPA ARTICULATORY FEATURE SCHEMA
// =============================================================================

export const ARTICULATORY_FEATURES = {
  // Bilabial
  'p': { type: 'consonant', place: 'bilabial', manner: 'plosive', voicing: false },
  'b': { type: 'consonant', place: 'bilabial', manner: 'plosive', voicing: true },
  'm': { type: 'consonant', place: 'bilabial', manner: 'nasal', voicing: true, nasal: true },

  // Labiodental
  'f': { type: 'consonant', place: 'labiodental', manner: 'fricative', voicing: false },
  'v': { type: 'consonant', place: 'labiodental', manner: 'fricative', voicing: true },

  // Alveolar
  't': { type: 'consonant', place: 'alveolar', manner: 'plosive', voicing: false },
  'd': { type: 'consonant', place: 'alveolar', manner: 'plosive', voicing: true },
  's': { type: 'consonant', place: 'alveolar', manner: 'fricative', voicing: false },
  'z': { type: 'consonant', place: 'alveolar', manner: 'fricative', voicing: true },
  'n': { type: 'consonant', place: 'alveolar', manner: 'nasal', voicing: true, nasal: true },
  'l': { type: 'consonant', place: 'alveolar', manner: 'lateral', voicing: true },
  'r': { type: 'consonant', place: 'alveolar', manner: 'approximant', voicing: true },

  // Velar
  'k': { type: 'consonant', place: 'velar', manner: 'plosive', voicing: false },
  'g': { type: 'consonant', place: 'velar', manner: 'plosive', voicing: true },
  'ŋ': { type: 'consonant', place: 'velar', manner: 'nasal', voicing: true, nasal: true },

  // Front vowels
  'i': { type: 'vowel', height: 'close', backness: 'front', rounding: false },
  'ɪ': { type: 'vowel', height: 'near-close', backness: 'front', rounding: false },
  'e': { type: 'vowel', height: 'close-mid', backness: 'front', rounding: false },
  'ɛ': { type: 'vowel', height: 'open-mid', backness: 'front', rounding: false },

  // Central vowels
  'ə': { type: 'vowel', height: 'mid', backness: 'central', rounding: false },
  'ʌ': { type: 'vowel', height: 'open-mid', backness: 'central', rounding: false },

  // Back vowels
  'u': { type: 'vowel', height: 'close', backness: 'back', rounding: true },
  'ʊ': { type: 'vowel', height: 'near-close', backness: 'back', rounding: true },
  'o': { type: 'vowel', height: 'close-mid', backness: 'back', rounding: true },
  'ɔ': { type: 'vowel', height: 'open-mid', backness: 'back', rounding: true },
  'ɑ': { type: 'vowel', height: 'open', backness: 'back', rounding: false },
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
// CORE PHONEME ANALYSIS — LOCKED OUTPUT CONTRACT
// =============================================================================

/**
 * @typedef {Object} IPAPhoneme
 * @property {string} symbol - IPA symbol, e.g. 'b', 'ɛ'
 * @property {Object} features - Articulatory features from ARTICULATORY_FEATURES
 * @property {number} startMs - Estimated start time in milliseconds
 * @property {number} endMs - Estimated end time in milliseconds
 * @property {number} confidence - Confidence score 0-1 (placeholder)
 */

/**
 * @typedef {Object} PhonemeAnalysisResult
 * @property {IPAPhoneme[]} ipaSequence - Array of IPA phoneme objects
 * @property {number} durationMs - Total duration in milliseconds
 */

/**
 * Analyze text and produce IPA phoneme sequence
 * LOCKED OUTPUT CONTRACT — Animation and grading consume this structure
 * 
 * @param {string} text - Input text to analyze
 * @param {string} language - Language code (english, japanese, etc.)
 * @param {Object} options - Analysis options
 * @returns {PhonemeAnalysisResult}
 */
export function analyzePhonemes(text, language = 'english', options = {}) {
  const {
    speedMultiplier = 1.0,  // Animation speed adjustment
  } = options;
  
  // Step 1: Transliterate non-Latin scripts
  const romanized = transliterate(text, language);
  
  // Step 2: Parse into phoneme symbols (PLACEHOLDER logic)
  const phonemeSymbols = parseToPhonemeSymbols(romanized, language);
  
  // Step 3: Build ipaSequence with LOCKED CONTRACT structure
  let currentMs = 0;
  const ipaSequence = phonemeSymbols.map((symbol) => {
    // Get features from ARTICULATORY_FEATURES schema
    const features = ARTICULATORY_FEATURES[symbol] || ARTICULATORY_FEATURES[symbol.toLowerCase()] || getDefaultFeatures(symbol);
    
    // Calculate timing (PLACEHOLDER: evenly distributed)
    const baseDuration = PHONEME_DURATIONS[symbol] || PHONEME_DURATIONS.default;
    const duration = Math.round(baseDuration / speedMultiplier);
    
    const phoneme = {
      symbol: symbol,                    // IPA symbol
      features: features,                // From ARTICULATORY_FEATURES
      startMs: currentMs,                // Estimated start time
      endMs: currentMs + duration,       // Estimated end time
      confidence: 1.0,                   // PLACEHOLDER: Always 1.0 for target analysis
    };
    
    currentMs += duration;
    return phoneme;
  });
  
  const result = {
    ipaSequence,
    durationMs: currentMs,
  };
  
  // Console log for debugging — shows ipaSequence objects
  console.log('[analyzePhonemes] Input:', text, '→ Romanized:', romanized);
  console.log('[analyzePhonemes] ipaSequence:', ipaSequence);
  console.log('[analyzePhonemes] durationMs:', currentMs);
  
  return result;
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
 * Get default features for unknown phonemes
 */
function getDefaultFeatures(symbol) {
  return {
    type: 'unknown',
    symbol: symbol,
  };
}

// =============================================================================
// ANIMATION INTERFACE — Consumes ipaSequence
// =============================================================================

/**
 * Convert phoneme analysis to animation frame sequence
 * Consumes ipaSequence.symbol + features from analyzePhonemes()
 * 
 * @param {PhonemeAnalysisResult} analysis - Result from analyzePhonemes()
 * @param {Object} options - Animation options
 * @returns {Object} Animation data
 */
export function toAnimationSequence(analysis, options = {}) {
  const {
    leadInFrames = 4,         // Neutral frames at start
    leadOutFrames = 6,        // Neutral frames at end
  } = options;
  
  const frames = [];
  const frameTimings = [];
  
  // Lead-in (neutral mouth)
  for (let i = 0; i < leadInFrames; i++) {
    frames.push(0);
    frameTimings.push({ frame: 0, symbol: null, type: 'lead-in' });
  }
  
  // Phoneme frames — uses ipaSequence.symbol + features
  for (const phoneme of analysis.ipaSequence) {
    // Get frame from viseme resolution using symbol
    const viseme = resolveViseme(phoneme.symbol);
    const frame = getFrameForPhoneme(phoneme.symbol);
    
    // Clone frames based on duration (normalized to frame count)
    const duration = phoneme.endMs - phoneme.startMs;
    const cloneCount = Math.max(1, Math.round(duration / 30)); // ~30ms per frame
    
    for (let i = 0; i < cloneCount; i++) {
      frames.push(frame);
      frameTimings.push({
        frame: frame,
        symbol: phoneme.symbol,
        features: phoneme.features,
        type: 'phoneme',
        isFirst: i === 0,
        isLast: i === cloneCount - 1,
      });
    }
  }
  
  // Lead-out (neutral mouth)
  for (let i = 0; i < leadOutFrames; i++) {
    frames.push(0);
    frameTimings.push({ frame: 0, symbol: null, type: 'lead-out' });
  }
  
  console.log('[toAnimationSequence] frames:', frames.length, 'phonemes:', analysis.ipaSequence.length);
  
  return {
    frames,
    frameTimings,
    totalFrames: frames.length,
    phonemeCount: analysis.ipaSequence.length,
    estimatedDuration: analysis.durationMs,
  };
}

// =============================================================================
// GRADING INTERFACE — Consumes ipaSequence (PLACEHOLDER)
// =============================================================================

/**
 * @typedef {Object} PhonemeGradingResult
 * @property {number} overallScore - 0-100 overall score
 * @property {Object[]} phonemeScores - Per-phoneme scores
 * @property {string[]} feedback - Feedback messages
 * @property {Object} analysis - Detailed analysis
 */

/**
 * Compare target ipaSequence with detected ipaSequence for grading
 * PLACEHOLDER: Detection logic will be provided later
 * 
 * @param {PhonemeAnalysisResult} targetAnalysis - Expected phoneme sequence (from analyzePhonemes)
 * @param {PhonemeAnalysisResult|null} detectedAnalysis - Detected phonemes from user (placeholder)
 * @returns {PhonemeGradingResult}
 */
export function gradePhonemes(targetAnalysis, detectedAnalysis = null) {
  // PLACEHOLDER: This will be replaced with actual detection comparison
  // Grading consumes ipaSequence as input
  
  console.log('[gradePhonemes] Target ipaSequence:', targetAnalysis.ipaSequence);
  console.log('[gradePhonemes] Detected ipaSequence:', detectedAnalysis?.ipaSequence || 'none');
  
  const phonemeScores = targetAnalysis.ipaSequence.map((target, index) => {
    // Placeholder: Use detected ipaSequence if provided
    const detected = detectedAnalysis?.ipaSequence?.[index] || {
      symbol: target.symbol,
      features: target.features,
      confidence: 0.0,  // No actual detection yet
    };
    
    return {
      position: index,
      target: {
        symbol: target.symbol,
        features: target.features,
        startMs: target.startMs,
        endMs: target.endMs,
      },
      detected: {
        symbol: detected.symbol,
        features: detected.features,
        confidence: detected.confidence,
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
      targetCount: targetAnalysis.ipaSequence.length,
      detectedCount: detectedAnalysis?.ipaSequence?.length || 0,
      matchRate: calculateMatchRate(phonemeScores),
    },
    // PLACEHOLDER fields for future implementation
    _placeholder: {
      note: 'Detection logic will be provided later',
      expectedDetectedFormat: {
        ipaSequence: [
          { symbol: 'string', features: 'object', startMs: 'number', endMs: 'number', confidence: 'number 0-1' }
        ],
        durationMs: 'number'
      },
    },
  };
}

/**
 * Generate feedback for a single phoneme comparison
 * Uses features from ARTICULATORY_FEATURES schema
 */
function generatePhonemeFeedback(target, detected) {
  if (!detected || detected.confidence === 0) {
    return `Practice the "${target.symbol}" sound`;
  }
  
  if (detected.symbol === target.symbol && detected.confidence > 0.8) {
    return null; // Good match, no feedback needed
  }
  
  const features = target.features;
  const tips = [];
  
  // Generate articulatory guidance based on IPA features schema
  if (features.type === 'vowel') {
    if (features.height === 'close') tips.push('Raise your tongue higher');
    if (features.height === 'open') tips.push('Open your mouth wider');
    if (features.rounding) tips.push('Round your lips');
    if (features.backness === 'front') tips.push('Move tongue forward');
    if (features.backness === 'back') tips.push('Pull tongue back');
  } else if (features.type === 'consonant') {
    if (features.manner === 'plosive') tips.push('Make a quick, explosive sound');
    if (features.manner === 'fricative') tips.push('Create friction with continuous airflow');
    if (features.manner === 'nasal') tips.push('Let air flow through your nose');
    if (features.place === 'bilabial') tips.push('Press your lips together');
    if (features.place === 'labiodental') tips.push('Touch teeth to lower lip');
    if (features.place === 'alveolar') tips.push('Touch tongue to ridge behind teeth');
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
