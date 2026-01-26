// ========== NEW 20-FRAME PHONEME SPRITE ENGINE ==========
// Single sprite sheet per view (front_master.png, side_master.png)
// 20 frames total (0-19), each representing specific phoneme groups
// Frame 00 = neutral (rest position)

export const FRAME_WIDTH = 939;
export const FRAME_HEIGHT = 793;
export const TOTAL_FRAMES = 20;
export const TARGET_FPS = 30;
export const FRAME_DURATION_MS = 1000 / TARGET_FPS; // ~33ms per frame

// Frame to phoneme mapping based on filename conventions
export const FRAME_PHONEMES = {
  0:  { name: 'neutral', phonemes: ['_', ' '], description: 'Neutral/rest position' },
  1:  { name: 'a_u', phonemes: ['a', 'u', 'ah', 'uh'], description: 'Open vowels' },
  2:  { name: 'b_p_m', phonemes: ['b', 'p', 'm'], description: 'Bilabial stops' },
  3:  { name: 'ee_z_x', phonemes: ['i', 'ee', 'z', 'x'], description: 'Spread lips, front vowel' },
  4:  { name: 'oo_o_ou_w', phonemes: ['o', 'oo', 'ou', 'w'], description: 'Rounded lips' },
  5:  { name: 'e', phonemes: ['e', 'eh'], description: 'Mid front vowel' },
  6:  { name: 'ü', phonemes: ['ü', 'y_vowel'], description: 'German ü / French u' },
  7:  { name: 'c_k_q_g', phonemes: ['c', 'k', 'q', 'g'], description: 'Velar stops' },
  8:  { name: 't_tsk_d_j', phonemes: ['t', 'd', 'j', 'tsk'], description: 'Alveolar/palatal' },
  9:  { name: 'n', phonemes: ['n'], description: 'Alveolar nasal' },
  10: { name: 'ng', phonemes: ['ng'], description: 'Velar nasal' },
  11: { name: 's', phonemes: ['s'], description: 'Alveolar fricative' },
  12: { name: 'sh', phonemes: ['sh'], description: 'Postalveolar fricative' },
  13: { name: 'th', phonemes: ['th'], description: 'Dental fricative' },
  14: { name: 'f_v', phonemes: ['f', 'v'], description: 'Labiodental fricatives' },
  15: { name: 'h', phonemes: ['h'], description: 'Glottal fricative' },
  16: { name: 'ch', phonemes: ['ch'], description: 'Affricate' },
  17: { name: 'r', phonemes: ['r'], description: 'Rhotic' },
  18: { name: 'L', phonemes: ['l'], description: 'Lateral approximant' },
  19: { name: 'LL_y', phonemes: ['ll', 'y'], description: 'Welsh LL / palatal' },
};

// Letter pronunciations - 2-letter phonemes matching MP3 file labels
// Format: { frames: [consonant, vowel], audioLabel: 'xx' }
// audioLabel MUST match the MP3 filename: {lang}-{audioLabel}.mp3
export const LETTER_PRONUNCIATION = {
  'a': { frames: [1], audioLabel: 'ah', display: 'ah' },
  'b': { frames: [2, 1], audioLabel: 'ba', display: 'ba' },
  'c': { frames: [7, 1], audioLabel: 'ca', display: 'ca' },
  'd': { frames: [8, 1], audioLabel: 'da', display: 'da' },
  'e': { frames: [5], audioLabel: 'eh', display: 'eh' },
  'f': { frames: [14, 1], audioLabel: 'fa', display: 'fa' },
  'g': { frames: [7, 1], audioLabel: 'ga', display: 'ga' },
  'h': { frames: [15, 1], audioLabel: 'ha', display: 'ha' },
  'i': { frames: [3], audioLabel: 'ih', display: 'ih' },
  'j': { frames: [8, 1], audioLabel: 'ja', display: 'ja' },
  'k': { frames: [7, 1], audioLabel: 'ka', display: 'ka' },
  'l': { frames: [18, 1], audioLabel: 'la', display: 'la' },
  'm': { frames: [2, 1], audioLabel: 'ma', display: 'ma' },
  'n': { frames: [9, 1], audioLabel: 'na', display: 'na' },
  'o': { frames: [4], audioLabel: 'oh', display: 'oh' },
  'p': { frames: [2, 1], audioLabel: 'pa', display: 'pa' },
  'q': { frames: [7, 4, 1], audioLabel: 'kwa', display: 'kwa' },  // 3-letter
  'r': { frames: [17, 1], audioLabel: 'ra', display: 'ra' },
  's': { frames: [11, 1], audioLabel: 'sa', display: 'sa' },
  't': { frames: [8, 1], audioLabel: 'ta', display: 'ta' },
  'u': { frames: [1], audioLabel: 'uh', display: 'uh' },
  'v': { frames: [14, 1], audioLabel: 'va', display: 'va' },
  'w': { frames: [4, 1], audioLabel: 'wa', display: 'wa' },
  'x': { frames: [3, 11], audioLabel: 'xa', display: 'xa' },
  'y': { frames: [19, 1], audioLabel: 'ya', display: 'ya' },
  'z': { frames: [3, 1], audioLabel: 'za', display: 'za' },
};

// Simple letter to single frame mapping (for individual phoneme display)
export const LETTER_TO_FRAME = {
  'a': 1, 'b': 2, 'c': 7, 'd': 8, 'e': 5, 'f': 14, 'g': 7, 'h': 15,
  'i': 3, 'j': 8, 'k': 7, 'l': 18, 'm': 2, 'n': 9, 'o': 4, 'p': 2,
  'q': 7, 'r': 17, 's': 11, 't': 8, 'u': 1, 'v': 14, 'w': 4, 'x': 3,
  'y': 19, 'z': 3,
};

// Digraph to frame mapping
export const DIGRAPHS = {
  'll': 19, 'sh': 12, 'ch': 16, 'th': 13, 'ng': 10,
  'ph': 14, 'wh': 4, 'ck': 7, 'gh': 0,
};

// ========== PHONETIC WORD BREAKDOWN ==========
// Common English phonetic patterns for word-to-phoneme conversion
// This converts words to phonetic syllables, not literal letters

const PHONETIC_RULES = {
  // Common word endings
  'tion': ['sh', 'u', 'n'],
  'sion': ['zh', 'u', 'n'],
  'ious': ['ee', 'u', 's'],
  'eous': ['ee', 'u', 's'],
  'ous': ['u', 's'],
  'ious': ['ee', 'u', 's'],
  'ing': ['i', 'ng'],
  'ight': ['ai', 't'],
  'ough': ['o'],
  'ould': ['oo', 'd'],
  'ness': ['n', 'e', 's'],
  'ment': ['m', 'e', 'n', 't'],
  'able': ['a', 'b', 'l'],
  'ible': ['i', 'b', 'l'],
  'ure': ['y', 'oo', 'r'],
  'ture': ['ch', 'e', 'r'],
  'sure': ['zh', 'e', 'r'],
  
  // Common digraphs and letter combos
  'th': ['th'],
  'sh': ['sh'],
  'ch': ['ch'],
  'ph': ['f'],
  'wh': ['w'],
  'ck': ['k'],
  'ng': ['ng'],
  'll': ['l'],
  'ss': ['s'],
  'ff': ['f'],
  'tt': ['t'],
  'dd': ['d'],
  'bb': ['b'],
  'pp': ['p'],
  'mm': ['m'],
  'nn': ['n'],
  'rr': ['r'],
  'gh': [],  // Usually silent
  'kn': ['n'],
  'wr': ['r'],
  'mb': ['m'],
  
  // Vowel combinations
  'ea': ['ee'],
  'ee': ['ee'],
  'oo': ['oo'],
  'ou': ['ow'],
  'ow': ['ow'],
  'ai': ['ay'],
  'ay': ['ay'],
  'ey': ['ay'],
  'ie': ['ee'],
  'ei': ['ay'],
  'oa': ['o'],
  'oe': ['o'],
  'ue': ['oo'],
  'ui': ['oo', 'ee'],
  'au': ['aw'],
  'aw': ['aw'],
  
  // Silent e handling is done separately
};

// Convert a word to phonetic breakdown
export const wordToPhonemes = (word) => {
  const result = [];
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  let i = 0;
  
  while (i < lower.length) {
    let matched = false;
    
    // Try matching longest patterns first (4, 3, 2 letters)
    for (let len = 4; len >= 2; len--) {
      if (i + len <= lower.length) {
        const segment = lower.substring(i, i + len);
        if (PHONETIC_RULES[segment]) {
          result.push(...PHONETIC_RULES[segment]);
          i += len;
          matched = true;
          break;
        }
      }
    }
    
    if (!matched) {
      // Handle silent 'e' at end of word
      if (lower[i] === 'e' && i === lower.length - 1 && i > 0) {
        // Silent e - skip
        i++;
        continue;
      }
      
      // Single letter
      const char = lower[i];
      if (char !== ' ') {
        result.push(char);
      }
      i++;
    }
  }
  
  return result;
};

// Get frame for a phonetic sound
export const getFrameForSound = (sound) => {
  const s = sound.toLowerCase();
  
  // Check special sounds first
  const soundMap = {
    'th': 13, 'sh': 12, 'ch': 16, 'ng': 10, 'll': 19,
    'zh': 8,   // Like 'j' in "measure"
    'ee': 3, 'ih': 3, 'i': 3,
    'oo': 4, 'oh': 4, 'o': 4, 'ow': 4, 'aw': 4,
    'ah': 1, 'uh': 1, 'a': 1, 'u': 1,
    'eh': 5, 'e': 5,
    'ay': 1,  // Long A
    'ai': 1,
  };
  
  if (soundMap[s] !== undefined) return soundMap[s];
  if (LETTER_TO_FRAME[s] !== undefined) return LETTER_TO_FRAME[s];
  if (DIGRAPHS[s] !== undefined) return DIGRAPHS[s];
  
  return 0; // Neutral for unknown
};

// Build animation timeline for a single letter (Letter Practice)
// Uses exactly 2 frames for consonant+vowel: consonant → vowel
export const buildLetterTimeline = (letter) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  if (!pronunciation) {
    return [{ frame: 0, phoneme: '_', duration: 5, type: 'neutral' }];
  }

  const timeline = [];
  const { frames, display } = pronunciation;
  
  // Start from neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'start' });
  
  // Animate each frame in sequence
  frames.forEach((frame, idx) => {
    const isLast = idx === frames.length - 1;
    const isVowel = [1, 3, 4, 5, 6].includes(frame);
    
    // Approach
    timeline.push({ frame, phoneme: display, duration: 2, type: 'approach' });
    
    // Apex - hold longer for vowels and last frame
    const holdDuration = isVowel || isLast ? 6 : 3;
    timeline.push({ frame, phoneme: display, duration: holdDuration, type: 'apex' });
  });
  
  // Return to neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 3, type: 'end' });
  
  return timeline;
};

// Build animation timeline for a word (Word Practice)
// Uses phonetic breakdown, not literal spelling
export const buildWordTimeline = (text) => {
  const phonemes = wordToPhonemes(text);
  
  if (phonemes.length === 0) {
    return [{ frame: 0, phoneme: '_', duration: 3, type: 'neutral' }];
  }

  const timeline = [];
  
  // Start from neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'start' });
  
  let prevFrame = 0;
  
  phonemes.forEach((phoneme, idx) => {
    const frame = getFrameForSound(phoneme);
    const isVowel = [1, 3, 4, 5, 6].includes(frame);
    
    // Add smooth transition if frame changes
    if (frame !== prevFrame && prevFrame !== 0) {
      timeline.push({ frame, phoneme, duration: 1, type: 'transition' });
    }
    
    // Approach
    timeline.push({ frame, phoneme, duration: 2, type: 'approach' });
    
    // Apex - longer for vowels
    const holdDuration = isVowel ? 4 : 2;
    timeline.push({ frame, phoneme, duration: holdDuration, type: 'apex' });
    
    prevFrame = frame;
  });
  
  // Return to neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 3, type: 'end' });
  
  return timeline;
};

// Legacy function for text to frames (literal letters)
export const textToFrames = (text) => {
  const result = [];
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '');
  let i = 0;
  
  while (i < lower.length) {
    if (i < lower.length - 1) {
      const digraph = lower.substring(i, i + 2);
      if (DIGRAPHS[digraph] !== undefined) {
        result.push({ frame: DIGRAPHS[digraph], phoneme: digraph, isDigraph: true });
        i += 2;
        continue;
      }
    }
    
    const char = lower[i];
    if (char === ' ') {
      result.push({ frame: 0, phoneme: '_', isDigraph: false });
    } else {
      const frame = LETTER_TO_FRAME[char] || 0;
      result.push({ frame, phoneme: char, isDigraph: false });
    }
    i++;
  }
  
  return result;
};

// Get frame info
export const getFrameInfo = (frameNum) => {
  return FRAME_PHONEMES[frameNum] || FRAME_PHONEMES[0];
};

// Get frame for a phoneme
export const getFrameForPhoneme = (phoneme) => {
  const lower = phoneme.toLowerCase();
  if (DIGRAPHS[lower] !== undefined) return DIGRAPHS[lower];
  if (LETTER_TO_FRAME[lower] !== undefined) return LETTER_TO_FRAME[lower];
  return 0;
};

// Phoneme audio path - uses audioLabel from LETTER_PRONUNCIATION
export const getPhonemeAudioPath = (letter, lang) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  const audioLabel = pronunciation ? pronunciation.audioLabel : 'ah';
  const langCode = lang.split('-')[0];
  return `/assets/audio/phonemes/${langCode}-${audioLabel}.mp3`;
};

// Get display label for a letter
export const getLetterDisplay = (letter) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  return pronunciation ? pronunciation.display : letter;
};

// For backwards compatibility
export const textToPhonemes = (text) => {
  return wordToPhonemes(text);
};

// Reverse mapping
export const PHONEME_TO_FRAME = {};
Object.entries(FRAME_PHONEMES).forEach(([frameNum, data]) => {
  data.phonemes.forEach(phoneme => {
    PHONEME_TO_FRAME[phoneme.toLowerCase()] = parseInt(frameNum);
  });
});
