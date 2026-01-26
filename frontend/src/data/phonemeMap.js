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

// Letter pronunciations - each letter has a consonant + vowel sequence
// Format: [consonant_frame, vowel_frame] or just [vowel_frame] for vowels
// This creates natural "bah", "cah", "dah" pronunciations
export const LETTER_PRONUNCIATION = {
  'a': { frames: [1], phonemes: ['ah'], description: 'ah' },
  'b': { frames: [2, 1], phonemes: ['b', 'ah'], description: 'bah' },
  'c': { frames: [7, 1], phonemes: ['k', 'ah'], description: 'cah/kah' },
  'd': { frames: [8, 1], phonemes: ['d', 'ah'], description: 'dah' },
  'e': { frames: [5], phonemes: ['eh'], description: 'eh' },
  'f': { frames: [14, 1], phonemes: ['f', 'ah'], description: 'fah' },
  'g': { frames: [7, 1], phonemes: ['g', 'ah'], description: 'gah' },
  'h': { frames: [15, 1], phonemes: ['h', 'ah'], description: 'hah' },
  'i': { frames: [3], phonemes: ['ee'], description: 'ee' },
  'j': { frames: [8, 1], phonemes: ['j', 'ah'], description: 'jah' },
  'k': { frames: [7, 1], phonemes: ['k', 'ah'], description: 'kah' },
  'l': { frames: [18, 1], phonemes: ['l', 'ah'], description: 'lah' },
  'm': { frames: [2, 1], phonemes: ['m', 'ah'], description: 'mah' },
  'n': { frames: [9, 1], phonemes: ['n', 'ah'], description: 'nah' },
  'o': { frames: [4], phonemes: ['oh'], description: 'oh' },
  'p': { frames: [2, 1], phonemes: ['p', 'ah'], description: 'pah' },
  'q': { frames: [7, 4], phonemes: ['k', 'oo'], description: 'koo/kwah' },
  'r': { frames: [17, 1], phonemes: ['r', 'ah'], description: 'rah' },
  's': { frames: [11, 1], phonemes: ['s', 'ah'], description: 'sah' },
  't': { frames: [8, 1], phonemes: ['t', 'ah'], description: 'tah' },
  'u': { frames: [1], phonemes: ['uh'], description: 'uh' },
  'v': { frames: [14, 1], phonemes: ['v', 'ah'], description: 'vah' },
  'w': { frames: [4, 1], phonemes: ['w', 'ah'], description: 'wah' },
  'x': { frames: [3, 11], phonemes: ['e', 'ks'], description: 'eks' },
  'y': { frames: [19, 1], phonemes: ['y', 'ah'], description: 'yah' },
  'z': { frames: [3, 1], phonemes: ['z', 'ah'], description: 'zah' },
};

// Simple letter to single frame mapping (for word animation)
export const LETTER_TO_FRAME = {
  'a': 1, 'b': 2, 'c': 7, 'd': 8, 'e': 5, 'f': 14, 'g': 7, 'h': 15,
  'i': 3, 'j': 8, 'k': 7, 'l': 18, 'm': 2, 'n': 9, 'o': 4, 'p': 2,
  'q': 7, 'r': 17, 's': 11, 't': 8, 'u': 1, 'v': 14, 'w': 4, 'x': 3,
  'y': 19, 'z': 3,
};

// Digraph detection
export const DIGRAPHS = {
  'll': 19, 'sh': 12, 'ch': 16, 'th': 13, 'ng': 10,
  'ph': 14, 'wh': 4, 'ck': 7, 'gh': 0,
};

// Build animation timeline for a single letter (Letter Practice)
// Creates smooth: neutral → consonant → vowel → neutral
export const buildLetterTimeline = (letter) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  if (!pronunciation) {
    return [{ frame: 0, duration: 5 }]; // Just neutral
  }

  const timeline = [];
  const { frames, phonemes } = pronunciation;
  
  // Start from neutral with quick transition
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'start' });
  
  // For each sound in the pronunciation
  frames.forEach((frame, idx) => {
    const phoneme = phonemes[idx] || '_';
    const isVowel = [1, 3, 4, 5, 6].includes(frame); // Vowel frames
    
    // Approach frames (ramping into the phoneme)
    timeline.push({ frame: Math.floor(frame / 2), phoneme, duration: 2, type: 'approach' });
    
    // Main phoneme hold (longer for vowels)
    const holdDuration = isVowel ? 8 : 4;
    timeline.push({ frame, phoneme, duration: holdDuration, type: 'apex' });
    
    // Extra hold at apex for emphasis
    timeline.push({ frame, phoneme, duration: 3, type: 'hold' });
  });
  
  // Return to neutral smoothly
  const lastFrame = frames[frames.length - 1] || 0;
  timeline.push({ frame: Math.floor(lastFrame / 2), phoneme: '_', duration: 2, type: 'depart' });
  timeline.push({ frame: 0, phoneme: '_', duration: 3, type: 'end' });
  
  return timeline;
};

// Build animation timeline for a word (Word Practice)
// Creates smooth flow through each phoneme with vowel connections
export const buildWordTimeline = (text) => {
  const frames = textToFrames(text);
  if (frames.length === 0) {
    return [{ frame: 0, phoneme: '_', duration: 3, type: 'neutral' }];
  }

  const timeline = [];
  
  // Start from neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'start' });
  
  let prevFrame = 0;
  
  frames.forEach((item, idx) => {
    const { frame, phoneme } = item;
    const isVowel = [1, 3, 4, 5, 6].includes(frame);
    const isLastPhoneme = idx === frames.length - 1;
    
    // Smooth transition from previous frame
    if (prevFrame !== frame) {
      // Add intermediate frame for smoother transition
      const midFrame = Math.round((prevFrame + frame) / 2);
      if (midFrame !== prevFrame && midFrame !== frame) {
        timeline.push({ frame: midFrame, phoneme, duration: 1, type: 'transition' });
      }
    }
    
    // Approach the target frame
    timeline.push({ frame, phoneme, duration: 2, type: 'approach' });
    
    // Hold at apex (longer for vowels, shorter for consonants)
    const holdDuration = isVowel ? 5 : 3;
    timeline.push({ frame, phoneme, duration: holdDuration, type: 'apex' });
    
    // For consonants, add a brief vowel connection (natural speech)
    if (!isVowel && !isLastPhoneme) {
      // Quick schwa/neutral vowel between consonants
      const nextItem = frames[idx + 1];
      const nextIsVowel = nextItem && [1, 3, 4, 5, 6].includes(nextItem.frame);
      if (!nextIsVowel) {
        // Add brief neutral between consonants
        timeline.push({ frame: 1, phoneme: 'ə', duration: 2, type: 'connector' });
      }
    }
    
    prevFrame = frame;
  });
  
  // Return to neutral smoothly
  timeline.push({ frame: Math.floor(prevFrame / 2), phoneme: '_', duration: 2, type: 'depart' });
  timeline.push({ frame: 0, phoneme: '_', duration: 3, type: 'end' });
  
  return timeline;
};

// Convert text to frame sequence (handles digraphs)
export const textToFrames = (text) => {
  const result = [];
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '');
  let i = 0;
  
  while (i < lower.length) {
    // Check for digraphs first
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

// Phoneme audio path mapping
export const getPhonemeAudioPath = (letter, lang) => {
  const phonemeMap = {
    'a': 'ah', 'b': 'ba', 'c': 'ca', 'd': 'da', 'e': 'eh', 'f': 'fa', 'g': 'ga',
    'h': 'ha', 'i': 'ih', 'j': 'ja', 'k': 'ka', 'l': 'la', 'm': 'ma', 'n': 'na',
    'o': 'oh', 'p': 'pa', 'q': 'kwa', 'r': 'ra', 's': 'sa', 't': 'ta', 'u': 'uh',
    'v': 'va', 'w': 'wa', 'x': 'xa', 'y': 'ya', 'z': 'za'
  };
  const langCode = lang.split('-')[0];
  const phoneme = phonemeMap[letter.toLowerCase()] || 'ah';
  return `/assets/audio/phonemes/${langCode}-${phoneme}.mp3`;
};

// For backwards compatibility
export const textToPhonemes = (text) => {
  const frames = textToFrames(text);
  return frames.map(f => f.phoneme);
};

// Reverse mapping
export const PHONEME_TO_FRAME = {};
Object.entries(FRAME_PHONEMES).forEach(([frameNum, data]) => {
  data.phonemes.forEach(phoneme => {
    PHONEME_TO_FRAME[phoneme.toLowerCase()] = parseInt(frameNum);
  });
});
