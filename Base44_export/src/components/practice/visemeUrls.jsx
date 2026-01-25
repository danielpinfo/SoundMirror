/**
 * visemeUrls.js
 * Maps IPA phonemes to PNG frame sequences (0-249)
 * Uses the new 250-frame PNG library with front/side views
 */

import { FRAME_ASSETS, getPhonemeFrames as getPhonemeFramesAsset } from './soundmirrorAssets';

/**
 * Phoneme database mapping IPA symbols and variants to phoneme numbers (0-24)
 */
const PHONEME_DATABASE = {
  // Phoneme 0: Neutral (mouth closed)
  neutral: { phonemeNum: 0, label: 'Neutral - Mouth Closed', ipa: '∅' },
  
  // VOWELS
  // P001 /a/
  'a': { phonemeNum: 1, label: '/a/ - father, spa', ipa: 'a' },
  'ah': { phonemeNum: 1, label: '/a/ - father, spa', ipa: 'a' },
  'ɑ': { phonemeNum: 1, label: '/a/ - father, spa', ipa: 'ɑ' },
  
  // P002 /i/
  'i': { phonemeNum: 2, label: '/i/ - see, machine', ipa: 'i' },
  'ee': { phonemeNum: 2, label: '/i/ - see, machine', ipa: 'i' },
  'ɪ': { phonemeNum: 2, label: '/i/ - see, machine', ipa: 'ɪ' },
  'iː': { phonemeNum: 2, label: '/i/ - see, machine', ipa: 'iː' },
  
  // P003 /u/
  'u': { phonemeNum: 3, label: '/u/ - food, blue', ipa: 'u' },
  'oo': { phonemeNum: 3, label: '/u/ - food, blue', ipa: 'u' },
  'ʊ': { phonemeNum: 3, label: '/u/ - food, blue', ipa: 'ʊ' },
  'uː': { phonemeNum: 3, label: '/u/ - food, blue', ipa: 'uː' },
  
  // P004 /e/
  'e': { phonemeNum: 4, label: '/e/ - bed, met', ipa: 'e' },
  'eh': { phonemeNum: 4, label: '/e/ - bed, met', ipa: 'e' },
  'ɛ': { phonemeNum: 4, label: '/e/ - bed, met', ipa: 'ɛ' },
  'eː': { phonemeNum: 4, label: '/e/ - bed, met', ipa: 'eː' },
  
  // P005 /o/
  'o': { phonemeNum: 5, label: '/o/ - go (pure vowel)', ipa: 'o' },
  'oh': { phonemeNum: 5, label: '/o/ - go (pure vowel)', ipa: 'o' },
  'ɔ': { phonemeNum: 5, label: '/o/ - go (pure vowel)', ipa: 'ɔ' },
  'oː': { phonemeNum: 5, label: '/o/ - go (pure vowel)', ipa: 'oː' },
  'ə': { phonemeNum: 5, label: '/ə/ - schwa', ipa: 'ə' },
  
  // P006 /y/
  'y': { phonemeNum: 6, label: '/y/ - French tu, German über', ipa: 'y' },
  'ü': { phonemeNum: 6, label: '/y/ - French tu, German über', ipa: 'ü' },
  'yː': { phonemeNum: 6, label: '/y/ - French tu, German über', ipa: 'yː' },
  
  // STOPS/CLOSURES
  // P007 /p/
  'p': { phonemeNum: 7, label: '/p/ - pat (lip closure)', ipa: 'p' },
  
  // P008 /t/
  't': { phonemeNum: 8, label: '/t/ - top (tongue to ridge)', ipa: 't' },
  
  // P009 /d/
  'd': { phonemeNum: 9, label: '/d/ - dog (same mouth as /t/)', ipa: 'd' },
  
  // P010 /k/
  'k': { phonemeNum: 10, label: '/k/ - cat (back of tongue)', ipa: 'k' },
  
  // P011 /g/
  'g': { phonemeNum: 11, label: '/g/ - go (same mouth as /k/)', ipa: 'g' },
  
  // P012 /ʔ/
  'ʔ': { phonemeNum: 12, label: '/ʔ/ - glottal stop', ipa: 'ʔ' },
  
  // NASALS
  // P013 /n/
  'n': { phonemeNum: 13, label: '/n/ - no (same tongue as /t/)', ipa: 'n' },
  
  // P014 /ŋ/
  'ng': { phonemeNum: 14, label: '/ŋ/ - sing (back nasal)', ipa: 'ŋ' },
  'ŋ': { phonemeNum: 14, label: '/ŋ/ - sing (back nasal)', ipa: 'ŋ' },
  
  // FRICATIVES / AFFRICATES
  // P015 /s/
  's': { phonemeNum: 15, label: '/s/ - see', ipa: 's' },
  'z': { phonemeNum: 15, label: '/z/ - zoo (similar mouth)', ipa: 'z' },
  
  // P016 /ʃ/
  'sh': { phonemeNum: 16, label: '/ʃ/ - ship', ipa: 'ʃ' },
  'ʃ': { phonemeNum: 16, label: '/ʃ/ - ship', ipa: 'ʃ' },
  'ʒ': { phonemeNum: 16, label: '/ʒ/ - vision (similar mouth)', ipa: 'ʒ' },
  
  // P017 /θ/
  'th': { phonemeNum: 17, label: '/θ/ - think (voiceless)', ipa: 'θ' },
  'θ': { phonemeNum: 17, label: '/θ/ - think (voiceless)', ipa: 'θ' },
  'ð': { phonemeNum: 17, label: '/ð/ - this (similar mouth)', ipa: 'ð' },
  
  // P018 /f/
  'f': { phonemeNum: 18, label: '/f/ - fan (lip-to-teeth)', ipa: 'f' },
  'v': { phonemeNum: 18, label: '/v/ - van (similar mouth)', ipa: 'v' },
  
  // P019 /h/
  'h': { phonemeNum: 19, label: '/h/ - hat (open breath)', ipa: 'h' },
  'ɦ': { phonemeNum: 19, label: '/ɦ/ - similar to /h/', ipa: 'ɦ' },
  
  // P020 /t͡ʃ/
  'ch': { phonemeNum: 20, label: '/t͡ʃ/ - chair', ipa: 't͡ʃ' },
  't͡ʃ': { phonemeNum: 20, label: '/t͡ʃ/ - chair', ipa: 't͡ʃ' },
  'tʃ': { phonemeNum: 20, label: '/t͡ʃ/ - chair', ipa: 'tʃ' },
  
  // LIQUIDS / LATERALS
  // P021 /r/
  'r': { phonemeNum: 21, label: '/r/ - red (general rhotic)', ipa: 'r' },
  'ɹ': { phonemeNum: 21, label: '/ɹ/ - American r', ipa: 'ɹ' },
  'ɾ': { phonemeNum: 21, label: '/ɾ/ - flap r', ipa: 'ɾ' },
  
  // P022 /l/
  'l': { phonemeNum: 22, label: '/l/ - lip', ipa: 'l' },
  'ɫ': { phonemeNum: 22, label: '/ɫ/ - dark l', ipa: 'ɫ' },
  'ɭ': { phonemeNum: 22, label: '/ɭ/ - retroflex l', ipa: 'ɭ' },
  
  // P023 /ɬ/
  'll': { phonemeNum: 23, label: '/ɬ/ - Welsh ll', ipa: 'ɬ' },
  'ɬ': { phonemeNum: 23, label: '/ɬ/ - Welsh ll', ipa: 'ɬ' },
  
  // CLICKS
  // P024 /ǀ/
  'click': { phonemeNum: 24, label: '/ǀ/ - dental click', ipa: 'ǀ' },
  'ǀ': { phonemeNum: 24, label: '/ǀ/ - dental click', ipa: 'ǀ' },
};

/**
 * Build VISEME_URLS from PNG frame assets
 * Maps each phoneme to an array of front and side view URLs
 */
export const VISEME_URLS = {};

for (const [token, phonemeInfo] of Object.entries(PHONEME_DATABASE)) {
  const frameAssets = getPhonemeFramesAsset(phonemeInfo.phonemeNum);
  
  const front = frameAssets.map(f => f.front);
  const side = frameAssets.map(f => f.side);
  
  VISEME_URLS[token] = {
    front,
    side,
    label: phonemeInfo.label,
    ipa: phonemeInfo.ipa,
    phonemeNum: phonemeInfo.phonemeNum
  };
}

/**
 * Get viseme frame URL(s) for a phoneme token
 * @param {string} token - Phoneme token (e.g., 'a', 'sh', 'click')
 * @param {number} frameIndex - 0-based frame index (0-9 within the phoneme's 10-frame sequence)
 * @param {string} view - 'front' or 'side' (default: 'front')
 * @returns {string|null} URL of the requested frame, or null if not found
 */
export function getVisemeUrl(token, frameIndex = 0, view = 'front') {
  const normalized = String(token || '').toLowerCase().trim();
  const phoneme = VISEME_URLS[normalized];
  
  if (!phoneme) {
    console.warn(`[getVisemeUrl] Unknown token: "${token}"`);
    return null;
  }
  
  const frames = phoneme[view] || phoneme.front;
  if (!Array.isArray(frames) || frames.length === 0) {
    return null;
  }
  
  const idx = Math.max(0, Math.min(frameIndex, frames.length - 1));
  return frames[idx] || null;
}

/**
 * Get all frame URLs for a phoneme (both views)
 * @param {string} token - Phoneme token
 * @returns {object|null} { front: [...urls], side: [...urls], label: string, ipa: string } or null
 */
export function getPhonemeFrames(token) {
  const normalized = String(token || '').toLowerCase().trim();
  return VISEME_URLS[normalized] || null;
}

/**
 * Check if a token has viseme frames
 * @param {string} token - Phoneme token
 * @returns {boolean}
 */
export function hasVisemeFrames(token) {
  const normalized = String(token || '').toLowerCase().trim();
  return !!VISEME_URLS[normalized];
}

/**
 * Get all available phoneme tokens
 * @returns {string[]} Array of token strings
 */
export function getAllPhonemeTokens() {
  return Object.keys(VISEME_URLS);
}

/**
 * Get all available phonemes with metadata
 * @returns {object[]} Array of { token, label, ipa, phonemeNum, frameCount }
 */
export function getAllPhonemes() {
  return Object.entries(VISEME_URLS).map(([token, data]) => ({
    token,
    label: data.label,
    ipa: data.ipa,
    phonemeNum: data.phonemeNum,
    frameCount: Array.isArray(data.front) ? data.front.length : 0,
  }));
}

export default VISEME_URLS;