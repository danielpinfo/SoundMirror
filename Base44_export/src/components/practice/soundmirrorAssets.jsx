/**
 * soundmirrorAssets.js
 * Maps 250 PNG frames (front & side) to frame indices 0-249
 * 
 * Frame Organization:
 * - Frames 0-9: Neutral (mouth closed)
 * - Frames 10-19: P001 /a/ (ah)
 * - Frames 20-29: P002 /i/ (ee)
 * - Frames 30-39: P003 /u/ (oo)
 * - Frames 40-49: P004 /e/ (eh)
 * - Frames 50-59: P005 /o/ (oh)
 * - Frames 60-69: P006 /y/ (ü)
 * - Frames 70-79: P007 /p/
 * - Frames 80-89: P008 /t/
 * - Frames 90-99: P009 /d/
 * - Frames 100-109: P010 /k/
 * - Frames 110-119: P011 /g/
 * - Frames 120-129: P012 /ʔ/
 * - Frames 130-139: P013 /n/
 * - Frames 140-149: P014 /ŋ/
 * - Frames 150-159: P015 /s/
 * - Frames 160-169: P016 /ʃ/
 * - Frames 170-179: P017 /θ/
 * - Frames 180-189: P018 /f/
 * - Frames 190-199: P019 /h/
 * - Frames 200-209: P020 /t͡ʃ/
 * - Frames 210-219: P021 /r/
 * - Frames 220-229: P022 /l/
 * - Frames 230-239: P023 /ɬ/
 * - Frames 240-249: P024 /ǀ/
 */

// Base URL for PNG assets
const ASSETS_BASE = '/assets/mouth-frames';

/**
 * Build frame asset array with front and side PNG URLs
 * @returns {Array} Array of 250 frame objects with front/side URLs
 */
function buildFrameAssets() {
  const frames = [];
  
  for (let i = 0; i < 250; i++) {
    // Pad frame number to 3 digits (000-249)
    const frameNum = String(i).padStart(3, '0');
    
    frames.push({
      front: `${ASSETS_BASE}/front/${frameNum}.png`,
      side: `${ASSETS_BASE}/side/${frameNum}.png`,
      index: i
    });
  }
  
  return frames;
}

// Export frame assets (250 frames × 2 views)
export const FRAME_ASSETS = buildFrameAssets();

/**
 * Get a single frame by index
 * @param {number} index - Frame index 0-249
 * @returns {object|null} Frame object with front/side URLs, or null if invalid
 */
export function getFrame(index) {
  if (index < 0 || index >= FRAME_ASSETS.length) {
    console.warn(`[soundmirrorAssets] Invalid frame index: ${index}`);
    return null;
  }
  return FRAME_ASSETS[index];
}

/**
 * Get frame range for a phoneme
 * @param {number} phonemeNumber - Phoneme number 0-24 (0=neutral, 1-24=P001-P024)
 * @returns {object} { start, end, count }
 */
export function getPhonemeFrameRange(phonemeNumber) {
  if (phonemeNumber < 0 || phonemeNumber > 24) {
    console.warn(`[soundmirrorAssets] Invalid phoneme number: ${phonemeNumber}`);
    return null;
  }
  
  const start = phonemeNumber * 10;
  const end = start + 9;
  
  return {
    start,
    end,
    count: 10,
    phonemeNumber
  };
}

/**
 * Get frames for a phoneme as array
 * @param {number} phonemeNumber - Phoneme number 0-24
 * @returns {Array} Array of 10 frame objects
 */
export function getPhonemeFrames(phonemeNumber) {
  const range = getPhonemeFrameRange(phonemeNumber);
  if (!range) return [];
  
  const frames = [];
  for (let i = range.start; i <= range.end; i++) {
    frames.push(FRAME_ASSETS[i]);
  }
  return frames;
}

export default FRAME_ASSETS;