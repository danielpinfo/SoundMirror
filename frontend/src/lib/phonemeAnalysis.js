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
 * HYBRID DETECTION BRIDGE:
 * - If audioBlob is provided AND hybrid mode is enabled,
 * - PCM is extracted and sent to native detection service
 * - Response is LOGGED ONLY (does not replace existing ipaSequence logic)
 */

import { transliterate } from './phonemeRules';
import { resolveViseme, getFrameForPhoneme, PHONEME_FRAME_MAP } from './constants';
import { extractPcmFromAudioBlob } from './audioPcmUtils';
import { detectPhonemesNative } from './nativeDetectionBridge';
import { textToPhonetic } from './phoneticDisplay';

// =============================================================================
// HYBRID DETECTION MODE FLAG
// When true, PCM is sent to native detection service (logged only)
// =============================================================================
const HYBRID_DETECTION_ENABLED = true;

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
  
  // IPA vowels
  'ɪ': 140, 'ɛ': 160, 'æ': 180, 'ə': 100, 'ʌ': 150,
  'ʊ': 140, 'ɔ': 170, 'ɑ': 190,
  
  // IPA diphthongs
  'eɪ': 200, 'aɪ': 210, 'ɔɪ': 210, 'oʊ': 200, 'aʊ': 210,
  
  // Plosives (short burst)
  'p': 80, 'b': 90, 't': 70, 'd': 80, 'k': 90, 'g': 100,
  
  // Fricatives (sustained)
  'f': 120, 'v': 130, 's': 140, 'z': 150, 'sh': 160, 'h': 100,
  'th': 130,
  
  // IPA fricatives
  'ʃ': 160,   // sh
  'ʒ': 160,   // zh
  'θ': 130,   // voiceless th
  'ð': 130,   // voiced th
  
  // Affricates
  'ch': 150, 'j': 160,
  
  // IPA affricates
  'tʃ': 150,  // ch
  'dʒ': 160,  // j
  
  // Nasals
  'm': 120, 'n': 110, 'ng': 130,
  
  // IPA nasals
  'ŋ': 130,   // ng
  
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
 * @param {Blob|null} audioBlob - Optional recorded audio for future PCM-based detection
 * @param {Object} options - Analysis options
 * @returns {Promise<PhonemeAnalysisResult>}
 */
export async function analyzePhonemes(text, language = 'english', audioBlob = null, options = {}) {
  const {
    speedMultiplier = 1.0,  // Animation speed adjustment
  } = options;
  
  // HYBRID DETECTION BRIDGE: If audioBlob provided AND hybrid mode enabled
  // Use REAL IPA detection from Allosaurus
  if (audioBlob && HYBRID_DETECTION_ENABLED) {
    try {
      // Step 1: Extract PCM from audio blob
      const { pcmData, sampleRate } = await extractPcmFromAudioBlob(audioBlob);
      console.log('[analyzePhonemes] PCM extracted:', {
        length: pcmData.length,
        sampleRate: sampleRate,
      });
      
      // Step 2: Send to native detection service (Allosaurus)
      const nativeResult = await detectPhonemesNative(pcmData, sampleRate, language);
      
      // Step 3: USE native detection result if phonemes were detected
      if (nativeResult.ipaSequence && nativeResult.ipaSequence.length > 0) {
        console.log('[analyzePhonemes] USING NATIVE DETECTION RESULT:');
        console.log('[analyzePhonemes] Detected symbols:', nativeResult.ipaSequence.map(p => p.symbol));
        console.log('[analyzePhonemes] Duration:', nativeResult.durationMs, 'ms');
        
        // Return native result directly (REPLACES text-based ipaSequence)
        return {
          ipaSequence: nativeResult.ipaSequence,
          durationMs: nativeResult.durationMs,
        };
      } else {
        console.log('[analyzePhonemes] Native detection returned empty, falling back to text-based analysis');
      }
      
    } catch (error) {
      console.error('[analyzePhonemes] Hybrid detection failed, falling back to text-based:', error);
    }
  }
  
  // FALLBACK: Text-based phoneme analysis (when no audioBlob or detection failed)
  // Step 1: Convert text to phonetic using the WORD_PHONETICS dictionary
  // This ensures "please" → "pleez", "food" → "food", etc.
  const phonetic = textToPhonetic(text, language);
  console.log('[analyzePhonemes] Text → Phonetic:', text, '→', phonetic);
  
  // Step 2: Transliterate non-Latin scripts (if any)
  const romanized = transliterate(phonetic, language);
  
  // Step 3: Parse into phoneme symbols
  const phonemeSymbols = parseToPhonemeSymbols(romanized, language);
  
  // Step 3: Build ipaSequence with LOCKED CONTRACT structure
  let currentMs = 0;
  const ipaSequence = phonemeSymbols.map((symbol) => {
    // Get features from ARTICULATORY_FEATURES schema
    const features = ARTICULATORY_FEATURES[symbol] || ARTICULATORY_FEATURES[symbol.toLowerCase()] || getDefaultFeatures(symbol);
    
    // Calculate timing (evenly distributed)
    const baseDuration = PHONEME_DURATIONS[symbol] || PHONEME_DURATIONS.default;
    const duration = Math.round(baseDuration / speedMultiplier);
    
    const phoneme = {
      symbol: symbol,                    // IPA symbol
      features: features,                // From ARTICULATORY_FEATURES
      startMs: currentMs,                // Estimated start time
      endMs: currentMs + duration,       // Estimated end time
      confidence: 1.0,                   // Text-based: always 1.0
    };
    
    currentMs += duration;
    return phoneme;
  });
  
  const result = {
    ipaSequence,
    durationMs: currentMs,
  };
  
  // Console log for debugging — shows ipaSequence objects
  console.log('[analyzePhonemes] Text-based analysis:');
  console.log('[analyzePhonemes] Input:', text, '→ Romanized:', romanized);
  console.log('[analyzePhonemes] ipaSequence:', ipaSequence);
  console.log('[analyzePhonemes] durationMs:', currentMs);
  
  return result;
}

// =============================================================================
// PHONEME NORMALIZATION RULES — LANGUAGE-SCOPED CONFIGURATION
// Transforms text into normalized phoneme tokens BEFORE IPA feature lookup
// =============================================================================

/**
 * Language-scoped normalization rules configuration
 * Structure: { languageCode: { digraphs, doubles, vowels } }
 * 
 * Rules are grouped by type for maintainability:
 * - digraphs: Multi-letter consonant combinations → single IPA symbol
 * - doubles: Double letters → single phoneme
 * - vowels: Vowel digraphs/diphthongs → single IPA symbol
 */
const NORMALIZATION_RULES = {
  // English normalization rules
  en: {
    // Digraphs → single IPA phoneme
    digraphs: {
      'ch': 'tʃ',   // voiceless postalveolar affricate
      'sh': 'ʃ',    // voiceless postalveolar fricative
      'th': 'θ',    // voiceless dental fricative (placeholder - could be ð for voiced)
      'ng': 'ŋ',    // velar nasal
      'zh': 'ʒ',    // voiced postalveolar fricative
      'ph': 'f',    // labiodental fricative (phonetic equivalent)
      'wh': 'w',    // bilabial approximant (in most dialects)
    },
    
    // Double letters → single phoneme (where doubling doesn't change pronunciation)
    doubles: {
      'll': 'l',
      'ss': 's',
      'tt': 't',
      'ff': 'f',
      'pp': 'p',
      'bb': 'b',
      'dd': 'd',
      'gg': 'g',
      'mm': 'm',
      'nn': 'n',
      'rr': 'r',
      'zz': 'z',
      'cc': 'k',    // typically /k/ sound
    },
    
    // Common vowel digraphs → single IPA vowel
    vowels: {
      'ee': 'i',    // long e
      'oo': 'u',    // long o (as in "food")
      'ea': 'i',    // as in "eat"
      'ai': 'eɪ',   // diphthong
      'ay': 'eɪ',   // diphthong
      'oa': 'oʊ',   // diphthong
      'ou': 'aʊ',   // diphthong (as in "out") - note: context matters for "you" vs "out"
      'ow': 'aʊ',   // diphthong (as in "how")
      'oi': 'ɔɪ',   // diphthong
      'oy': 'ɔɪ',   // diphthong
    },
    
    // Special word patterns (whole words)
    words: {
      'you': 'juː',  // "you" = yoo
      'your': 'jɔːr', // "your" = yor
    },
  },
  
  // Alias: 'english' → 'en'
  english: 'en',
};

/**
 * Get flattened normalization rules for a language
 * Handles aliases and returns empty object for unknown languages
 * 
 * @param {string} language - Language code
 * @returns {Object} - Flattened rules { pattern: ipaSymbol }
 */
function getNormalizationRules(language) {
  const langKey = language?.toLowerCase() || '';
  
  // Resolve alias if needed
  let rules = NORMALIZATION_RULES[langKey];
  if (typeof rules === 'string') {
    rules = NORMALIZATION_RULES[rules];
  }
  
  // Return empty if no rules for this language
  if (!rules || typeof rules !== 'object') {
    return {};
  }
  
  // Flatten grouped rules into single object
  // Words first (for whole word matching), then digraphs, doubles, vowels
  return {
    ...(rules.words || {}),
    ...rules.digraphs,
    ...rules.doubles,
    ...rules.vowels,
  };
}

/**
 * Normalize text into phoneme tokens using language-specific rules
 * Runs BEFORE IPA feature lookup
 * 
 * @param {string} text - Input text (romanized)
 * @param {string} language - Language code
 * @returns {string[]} - Array of normalized phoneme tokens
 */
function normalizeToPhonemeTokens(text, language) {
  const input = text.toLowerCase();
  const tokens = [];
  let i = 0;
  
  // Get language-specific rules (returns empty object if not found)
  const rules = getNormalizationRules(language);
  
  // Sort rules by key length (longest first) for greedy matching
  const sortedRules = Object.entries(rules).sort((a, b) => b[0].length - a[0].length);
  
  while (i < input.length) {
    let matched = false;
    
    // Try to match normalization rules (longest first)
    for (const [pattern, ipaSymbol] of sortedRules) {
      if (input.substring(i, i + pattern.length) === pattern) {
        tokens.push(ipaSymbol);
        i += pattern.length;
        matched = true;
        break;
      }
    }
    
    // No rule matched - use single character
    if (!matched) {
      const char = input[i];
      // Skip non-alphabetic characters
      if (/[a-z]/.test(char)) {
        tokens.push(char);
      }
      i++;
    }
  }
  
  console.log(`[PhonemeNormalization] '${text}' → [${tokens.map(t => `'${t}'`).join(', ')}]`);
  
  return tokens;
}

/**
 * Parse romanized text into phoneme symbols
 * Now uses normalization layer for proper phoneme tokenization
 */
function parseToPhonemeSymbols(romanized, language) {
  // Use normalization layer for English
  if (language === 'english' || language === 'en') {
    return normalizeToPhonemeTokens(romanized, language);
  }
  
  // Fallback: original parsing for other languages
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
// GRADING INTERFACE — Consumes aligned ipaSequence
// =============================================================================

/**
 * @typedef {Object} PhonemeGradingResult
 * @property {number} overallScore - 0-100 overall score
 * @property {Object[]} phonemeScores - Per-phoneme scores with feature breakdown
 * @property {string[]} feedback - Feedback messages
 * @property {Object} analysis - Detailed analysis
 */

/**
 * ARTICULATORY FEATURE WEIGHTS
 * These weights determine how much each feature contributes to the phoneme score.
 * Features are weighted based on their perceptual importance in speech.
 */
const FEATURE_WEIGHTS = {
  // Consonant features
  place: 30,      // Place of articulation (bilabial, alveolar, velar, etc.)
  manner: 30,     // Manner of articulation (plosive, fricative, nasal, etc.)
  voicing: 20,    // Voiced vs voiceless
  nasal: 10,      // Nasal feature
  
  // Vowel features
  height: 30,     // Tongue height (close, mid, open)
  backness: 30,   // Tongue backness (front, central, back)
  rounding: 20,   // Lip rounding
  
  // Base score for matching type (consonant/vowel)
  typeMatch: 10,
};

/**
 * Compare two articulatory feature sets and return a detailed score breakdown
 * 
 * @param {Object} targetFeatures - Features from ARTICULATORY_FEATURES
 * @param {Object} detectedFeatures - Features from ARTICULATORY_FEATURES
 * @returns {Object} - Score breakdown with total and per-feature scores
 */
function compareFeatures(targetFeatures, detectedFeatures) {
  const breakdown = {
    total: 0,
    maxPossible: 0,
    features: {},
    explanation: [],
  };
  
  // Handle missing features
  if (!targetFeatures || !detectedFeatures) {
    return {
      ...breakdown,
      total: 0,
      maxPossible: 100,
      explanation: ['Unable to compare features'],
    };
  }
  
  const targetType = targetFeatures.type;
  const detectedType = detectedFeatures.type;
  
  // Type match check (consonant vs vowel)
  breakdown.maxPossible += FEATURE_WEIGHTS.typeMatch;
  if (targetType === detectedType) {
    breakdown.total += FEATURE_WEIGHTS.typeMatch;
    breakdown.features.typeMatch = { score: FEATURE_WEIGHTS.typeMatch, max: FEATURE_WEIGHTS.typeMatch, match: true };
  } else {
    breakdown.features.typeMatch = { score: 0, max: FEATURE_WEIGHTS.typeMatch, match: false };
    breakdown.explanation.push(`Type mismatch: expected ${targetType}, detected ${detectedType}`);
  }
  
  // Compare based on phoneme type
  if (targetType === 'consonant') {
    // Place of articulation
    breakdown.maxPossible += FEATURE_WEIGHTS.place;
    if (targetFeatures.place === detectedFeatures.place) {
      breakdown.total += FEATURE_WEIGHTS.place;
      breakdown.features.place = { score: FEATURE_WEIGHTS.place, max: FEATURE_WEIGHTS.place, match: true, value: targetFeatures.place };
    } else {
      // Partial credit for nearby places
      const placeScore = getPartialPlaceScore(targetFeatures.place, detectedFeatures.place);
      breakdown.total += placeScore;
      breakdown.features.place = { 
        score: placeScore, 
        max: FEATURE_WEIGHTS.place, 
        match: false, 
        target: targetFeatures.place, 
        detected: detectedFeatures.place 
      };
      if (placeScore < FEATURE_WEIGHTS.place) {
        breakdown.explanation.push(`Place: ${detectedFeatures.place || 'unknown'} → ${targetFeatures.place}`);
      }
    }
    
    // Manner of articulation
    breakdown.maxPossible += FEATURE_WEIGHTS.manner;
    if (targetFeatures.manner === detectedFeatures.manner) {
      breakdown.total += FEATURE_WEIGHTS.manner;
      breakdown.features.manner = { score: FEATURE_WEIGHTS.manner, max: FEATURE_WEIGHTS.manner, match: true, value: targetFeatures.manner };
    } else {
      // Partial credit for similar manners
      const mannerScore = getPartialMannerScore(targetFeatures.manner, detectedFeatures.manner);
      breakdown.total += mannerScore;
      breakdown.features.manner = { 
        score: mannerScore, 
        max: FEATURE_WEIGHTS.manner, 
        match: false, 
        target: targetFeatures.manner, 
        detected: detectedFeatures.manner 
      };
      if (mannerScore < FEATURE_WEIGHTS.manner) {
        breakdown.explanation.push(`Manner: ${detectedFeatures.manner || 'unknown'} → ${targetFeatures.manner}`);
      }
    }
    
    // Voicing
    breakdown.maxPossible += FEATURE_WEIGHTS.voicing;
    if (targetFeatures.voicing === detectedFeatures.voicing) {
      breakdown.total += FEATURE_WEIGHTS.voicing;
      breakdown.features.voicing = { score: FEATURE_WEIGHTS.voicing, max: FEATURE_WEIGHTS.voicing, match: true };
    } else {
      breakdown.features.voicing = { 
        score: 0, 
        max: FEATURE_WEIGHTS.voicing, 
        match: false,
        target: targetFeatures.voicing,
        detected: detectedFeatures.voicing
      };
      breakdown.explanation.push(targetFeatures.voicing ? 'Add voice' : 'Remove voice');
    }
    
    // Nasal feature (if applicable)
    if (targetFeatures.nasal !== undefined) {
      breakdown.maxPossible += FEATURE_WEIGHTS.nasal;
      if (targetFeatures.nasal === detectedFeatures.nasal) {
        breakdown.total += FEATURE_WEIGHTS.nasal;
        breakdown.features.nasal = { score: FEATURE_WEIGHTS.nasal, max: FEATURE_WEIGHTS.nasal, match: true };
      } else {
        breakdown.features.nasal = { score: 0, max: FEATURE_WEIGHTS.nasal, match: false };
        breakdown.explanation.push(targetFeatures.nasal ? 'Let air through nose' : 'Block nasal airflow');
      }
    }
    
  } else if (targetType === 'vowel') {
    // Tongue height
    breakdown.maxPossible += FEATURE_WEIGHTS.height;
    if (targetFeatures.height === detectedFeatures.height) {
      breakdown.total += FEATURE_WEIGHTS.height;
      breakdown.features.height = { score: FEATURE_WEIGHTS.height, max: FEATURE_WEIGHTS.height, match: true, value: targetFeatures.height };
    } else {
      const heightScore = getPartialHeightScore(targetFeatures.height, detectedFeatures.height);
      breakdown.total += heightScore;
      breakdown.features.height = { 
        score: heightScore, 
        max: FEATURE_WEIGHTS.height, 
        match: false,
        target: targetFeatures.height,
        detected: detectedFeatures.height
      };
      if (heightScore < FEATURE_WEIGHTS.height) {
        breakdown.explanation.push(getHeightTip(targetFeatures.height, detectedFeatures.height));
      }
    }
    
    // Tongue backness
    breakdown.maxPossible += FEATURE_WEIGHTS.backness;
    if (targetFeatures.backness === detectedFeatures.backness) {
      breakdown.total += FEATURE_WEIGHTS.backness;
      breakdown.features.backness = { score: FEATURE_WEIGHTS.backness, max: FEATURE_WEIGHTS.backness, match: true, value: targetFeatures.backness };
    } else {
      const backnessScore = getPartialBacknessScore(targetFeatures.backness, detectedFeatures.backness);
      breakdown.total += backnessScore;
      breakdown.features.backness = { 
        score: backnessScore, 
        max: FEATURE_WEIGHTS.backness, 
        match: false,
        target: targetFeatures.backness,
        detected: detectedFeatures.backness
      };
      if (backnessScore < FEATURE_WEIGHTS.backness) {
        breakdown.explanation.push(getBacknessTip(targetFeatures.backness, detectedFeatures.backness));
      }
    }
    
    // Lip rounding
    breakdown.maxPossible += FEATURE_WEIGHTS.rounding;
    if (targetFeatures.rounding === detectedFeatures.rounding) {
      breakdown.total += FEATURE_WEIGHTS.rounding;
      breakdown.features.rounding = { score: FEATURE_WEIGHTS.rounding, max: FEATURE_WEIGHTS.rounding, match: true };
    } else {
      breakdown.features.rounding = { 
        score: 0, 
        max: FEATURE_WEIGHTS.rounding, 
        match: false,
        target: targetFeatures.rounding,
        detected: detectedFeatures.rounding
      };
      breakdown.explanation.push(targetFeatures.rounding ? 'Round your lips' : 'Spread your lips');
    }
  } else {
    // Unknown type - give base score only
    breakdown.maxPossible = 100;
    breakdown.total = 50; // Neutral score for unknown types
    breakdown.explanation.push('Unknown phoneme type');
  }
  
  return breakdown;
}

/**
 * Get partial score for place of articulation based on articulatory distance
 */
function getPartialPlaceScore(target, detected) {
  if (!target || !detected) return 0;
  
  // Place adjacency map (closer places get more partial credit)
  const placeOrder = ['bilabial', 'labiodental', 'dental', 'alveolar', 'postalveolar', 'palatal', 'velar', 'uvular', 'glottal'];
  const targetIdx = placeOrder.indexOf(target);
  const detectedIdx = placeOrder.indexOf(detected);
  
  if (targetIdx === -1 || detectedIdx === -1) return 0;
  
  const distance = Math.abs(targetIdx - detectedIdx);
  // Adjacent places get 70%, 2 away gets 40%, further gets 0%
  if (distance === 1) return Math.round(FEATURE_WEIGHTS.place * 0.7);
  if (distance === 2) return Math.round(FEATURE_WEIGHTS.place * 0.4);
  return 0;
}

/**
 * Get partial score for manner of articulation
 */
function getPartialMannerScore(target, detected) {
  if (!target || !detected) return 0;
  
  // Manner similarity groups
  const mannerGroups = {
    obstruent: ['plosive', 'fricative', 'affricate'],
    sonorant: ['nasal', 'approximant', 'lateral', 'trill', 'flap'],
  };
  
  // Same group gets partial credit
  for (const group of Object.values(mannerGroups)) {
    if (group.includes(target) && group.includes(detected)) {
      return Math.round(FEATURE_WEIGHTS.manner * 0.5);
    }
  }
  
  return 0;
}

/**
 * Get partial score for vowel height
 */
function getPartialHeightScore(target, detected) {
  if (!target || !detected) return 0;
  
  const heightOrder = ['close', 'near-close', 'close-mid', 'mid', 'open-mid', 'near-open', 'open'];
  const targetIdx = heightOrder.indexOf(target);
  const detectedIdx = heightOrder.indexOf(detected);
  
  if (targetIdx === -1 || detectedIdx === -1) return 0;
  
  const distance = Math.abs(targetIdx - detectedIdx);
  if (distance === 1) return Math.round(FEATURE_WEIGHTS.height * 0.7);
  if (distance === 2) return Math.round(FEATURE_WEIGHTS.height * 0.4);
  return 0;
}

/**
 * Get partial score for vowel backness
 */
function getPartialBacknessScore(target, detected) {
  if (!target || !detected) return 0;
  
  const backnessOrder = ['front', 'near-front', 'central', 'near-back', 'back'];
  const targetIdx = backnessOrder.indexOf(target);
  const detectedIdx = backnessOrder.indexOf(detected);
  
  if (targetIdx === -1 || detectedIdx === -1) return 0;
  
  const distance = Math.abs(targetIdx - detectedIdx);
  if (distance === 1) return Math.round(FEATURE_WEIGHTS.backness * 0.7);
  return 0;
}

/**
 * Get user-friendly tip for height adjustment
 */
function getHeightTip(target, detected) {
  const heightOrder = ['close', 'near-close', 'close-mid', 'mid', 'open-mid', 'near-open', 'open'];
  const targetIdx = heightOrder.indexOf(target);
  const detectedIdx = heightOrder.indexOf(detected);
  
  if (targetIdx < detectedIdx) {
    return 'Raise your tongue higher';
  } else if (targetIdx > detectedIdx) {
    return 'Lower your tongue / open mouth more';
  }
  return '';
}

/**
 * Get user-friendly tip for backness adjustment
 */
function getBacknessTip(target, detected) {
  const backnessOrder = ['front', 'near-front', 'central', 'near-back', 'back'];
  const targetIdx = backnessOrder.indexOf(target);
  const detectedIdx = backnessOrder.indexOf(detected);
  
  if (targetIdx < detectedIdx) {
    return 'Move tongue forward';
  } else if (targetIdx > detectedIdx) {
    return 'Pull tongue back';
  }
  return '';
}

/**
 * Align target and detected sequences using simple index-based alignment
 * Returns pairs of (target, detected) phonemes for comparison
 * 
 * @param {IPAPhoneme[]} targetSeq - Target phoneme sequence
 * @param {IPAPhoneme[]} detectedSeq - Detected phoneme sequence
 * @returns {Array<{target: IPAPhoneme|null, detected: IPAPhoneme|null}>}
 */
function alignPhonemeSequences(targetSeq, detectedSeq) {
  const maxLen = Math.max(targetSeq.length, detectedSeq.length);
  const aligned = [];
  
  for (let i = 0; i < maxLen; i++) {
    aligned.push({
      target: targetSeq[i] || null,
      detected: detectedSeq[i] || null,
    });
  }
  
  return aligned;
}

/**
 * Compare target ipaSequence with detected ipaSequence for grading
 * Uses articulatory feature comparison for interpretable, explainable scoring.
 * 
 * @param {PhonemeAnalysisResult} targetAnalysis - Expected phoneme sequence (from analyzePhonemes)
 * @param {PhonemeAnalysisResult|null} detectedAnalysis - Detected phonemes from user's speech
 * @returns {PhonemeGradingResult}
 */
export function gradePhonemes(targetAnalysis, detectedAnalysis = null) {
  console.log('[gradePhonemes] Target ipaSequence:', targetAnalysis.ipaSequence);
  console.log('[gradePhonemes] Detected ipaSequence:', detectedAnalysis?.ipaSequence || 'none');
  
  const targetSeq = targetAnalysis.ipaSequence || [];
  const detectedSeq = detectedAnalysis?.ipaSequence || [];
  
  // Handle case with no detection
  if (detectedSeq.length === 0) {
    return {
      overallScore: 0,
      phonemeScores: targetSeq.map((target, index) => ({
        position: index,
        target: { symbol: target.symbol, features: target.features },
        detected: null,
        score: 0,
        featureBreakdown: null,
        feedback: `No sound detected for "${target.symbol}"`,
      })),
      feedback: ['No speech detected. Please try recording again.'],
      analysis: {
        targetCount: targetSeq.length,
        detectedCount: 0,
        matchRate: 0,
        alignmentQuality: 'none',
      },
    };
  }
  
  // Align target and detected sequences
  const aligned = alignPhonemeSequences(targetSeq, detectedSeq);
  
  // Score each aligned pair using articulatory feature comparison
  const phonemeScores = aligned.map((pair, index) => {
    const { target, detected } = pair;
    
    // Case: Missing detection for this position
    if (!detected) {
      return {
        position: index,
        target: target ? { symbol: target.symbol, features: target.features } : null,
        detected: null,
        score: 0,
        featureBreakdown: null,
        feedback: target ? `Missing sound: "${target.symbol}"` : null,
      };
    }
    
    // Case: Extra detected sound (no target)
    if (!target) {
      return {
        position: index,
        target: null,
        detected: { symbol: detected.symbol, features: detected.features, confidence: detected.confidence },
        score: 0,
        featureBreakdown: null,
        feedback: `Extra sound detected: "${detected.symbol}"`,
      };
    }
    
    // Case: Both exist - compare features
    const targetFeatures = target.features || ARTICULATORY_FEATURES[target.symbol] || getDefaultFeatures(target.symbol);
    const detectedFeatures = detected.features || ARTICULATORY_FEATURES[detected.symbol] || getDefaultFeatures(detected.symbol);
    
    // Exact symbol match = 100%
    if (target.symbol === detected.symbol) {
      return {
        position: index,
        target: { symbol: target.symbol, features: targetFeatures },
        detected: { symbol: detected.symbol, features: detectedFeatures, confidence: detected.confidence },
        score: 100,
        featureBreakdown: {
          total: 100,
          maxPossible: 100,
          features: { exactMatch: { score: 100, max: 100, match: true } },
          explanation: [],
        },
        feedback: null, // Perfect match, no feedback needed
      };
    }
    
    // Compare articulatory features
    const featureBreakdown = compareFeatures(targetFeatures, detectedFeatures);
    
    // Calculate percentage score
    const score = featureBreakdown.maxPossible > 0 
      ? Math.round((featureBreakdown.total / featureBreakdown.maxPossible) * 100)
      : 0;
    
    // Generate feedback based on feature breakdown
    const feedback = featureBreakdown.explanation.length > 0
      ? featureBreakdown.explanation[0] // Most important tip
      : null;
    
    return {
      position: index,
      target: { symbol: target.symbol, features: targetFeatures },
      detected: { symbol: detected.symbol, features: detectedFeatures, confidence: detected.confidence },
      score,
      featureBreakdown,
      feedback,
    };
  });
  
  // Calculate overall score (average of all phoneme scores)
  const validScores = phonemeScores.filter(ps => ps.target !== null);
  const totalScore = validScores.reduce((sum, ps) => sum + ps.score, 0);
  const overallScore = validScores.length > 0 
    ? Math.round(totalScore / validScores.length) 
    : 0;
  
  // Generate overall feedback
  const feedback = generateOverallFeedback(phonemeScores, targetAnalysis);
  
  // Calculate alignment quality
  const matchCount = phonemeScores.filter(ps => ps.score === 100).length;
  const alignmentQuality = targetSeq.length === detectedSeq.length ? 'good' : 
    Math.abs(targetSeq.length - detectedSeq.length) <= 2 ? 'fair' : 'poor';
  
  return {
    overallScore,
    phonemeScores,
    feedback,
    analysis: {
      targetCount: targetSeq.length,
      detectedCount: detectedSeq.length,
      matchRate: validScores.length > 0 ? Math.round((matchCount / validScores.length) * 100) : 0,
      alignmentQuality,
      perfectMatches: matchCount,
      partialMatches: validScores.filter(ps => ps.score > 0 && ps.score < 100).length,
      misses: phonemeScores.filter(ps => !ps.detected).length,
      extras: phonemeScores.filter(ps => !ps.target).length,
    },
  };
}

/**
 * Generate overall grading feedback based on phoneme scores
 * Provides actionable, user-friendly feedback
 */
function generateOverallFeedback(phonemeScores, analysis) {
  const feedback = [];
  
  // Filter to only scored phonemes (with targets)
  const scoredPhonemes = phonemeScores.filter(ps => ps.target !== null);
  
  // Categorize by score
  const excellent = scoredPhonemes.filter(ps => ps.score >= 90);
  const good = scoredPhonemes.filter(ps => ps.score >= 70 && ps.score < 90);
  const needsWork = scoredPhonemes.filter(ps => ps.score >= 40 && ps.score < 70);
  const poor = scoredPhonemes.filter(ps => ps.score < 40);
  
  // Overall assessment
  if (poor.length === 0 && needsWork.length === 0) {
    if (excellent.length === scoredPhonemes.length) {
      feedback.push('Perfect pronunciation! Excellent work.');
    } else {
      feedback.push('Great pronunciation! Minor refinements possible.');
    }
  } else if (poor.length > scoredPhonemes.length / 2) {
    feedback.push('Keep practicing - focus on the basics first.');
  } else {
    // Identify specific problem areas
    const problemPhonemes = [...poor, ...needsWork];
    
    // Group by feature issues
    const placeIssues = problemPhonemes.filter(ps => 
      ps.featureBreakdown?.features?.place?.match === false
    );
    const mannerIssues = problemPhonemes.filter(ps => 
      ps.featureBreakdown?.features?.manner?.match === false
    );
    const voicingIssues = problemPhonemes.filter(ps => 
      ps.featureBreakdown?.features?.voicing?.match === false
    );
    const heightIssues = problemPhonemes.filter(ps => 
      ps.featureBreakdown?.features?.height?.match === false
    );
    
    // Prioritize feedback by most common issue
    if (placeIssues.length >= 2) {
      feedback.push('Focus on tongue and lip positioning.');
    }
    if (voicingIssues.length >= 2) {
      feedback.push('Pay attention to voiced vs. voiceless sounds.');
    }
    if (heightIssues.length >= 2) {
      feedback.push('Work on mouth openness for vowels.');
    }
    
    // Specific sounds to practice
    const uniqueProblemSymbols = [...new Set(problemPhonemes.map(ps => ps.target?.symbol).filter(Boolean))];
    if (uniqueProblemSymbols.length > 0 && uniqueProblemSymbols.length <= 3) {
      feedback.push(`Practice these sounds: ${uniqueProblemSymbols.join(', ')}`);
    }
  }
  
  // Check for missing/extra sounds
  const missing = phonemeScores.filter(ps => !ps.detected);
  const extras = phonemeScores.filter(ps => !ps.target);
  
  if (missing.length > 0) {
    feedback.push(`${missing.length} sound(s) not detected - speak more clearly.`);
  }
  if (extras.length > 2) {
    feedback.push('Extra sounds detected - try to be more precise.');
  }
  
  // Default if no specific feedback generated
  if (feedback.length === 0) {
    feedback.push('Good effort! Keep practicing.');
  }
  
  return feedback;
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
  const art = ARTICULATORY_FEATURES[symbol] || ARTICULATORY_FEATURES[viseme] || getDefaultFeatures(symbol);
  
  return {
    symbol,
    ipa: art.ipa,
    viseme,
    frame,
    manner: art.manner,
    place: art.place,
    voiced: art.voicing,
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
