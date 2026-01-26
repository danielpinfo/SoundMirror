// ========== NEW 20-FRAME PHONEME SPRITE ENGINE ==========
// Single sprite sheet per view (front_master.png, side_master.png)
// 20 frames total (0-19), each representing specific phoneme groups
// Frame 00 = neutral (rest position)

export const FRAME_WIDTH = 939;
export const FRAME_HEIGHT = 793;
export const TOTAL_FRAMES = 20;

// Frame to phoneme mapping based on filename conventions
// Each frame can represent multiple phonemes with similar mouth shapes
export const FRAME_PHONEMES = {
  0:  { name: 'neutral', phonemes: ['_', ' '], description: 'Neutral/rest position' },
  1:  { name: 'a_u', phonemes: ['a', 'u', 'ah', 'uh'], description: 'Open vowels' },
  2:  { name: 'b_p_m', phonemes: ['b', 'p', 'm'], description: 'Bilabial stops' },
  3:  { name: 'ee_z_x', phonemes: ['i', 'ee', 'z', 'x'], description: 'Spread lips, front vowel' },
  4:  { name: 'oo_o_ou_w', phonemes: ['o', 'oo', 'ou', 'w'], description: 'Rounded lips' },
  5:  { name: 'e', phonemes: ['e', 'eh'], description: 'Mid front vowel' },
  6:  { name: 'ü', phonemes: ['ü', 'y'], description: 'German ü / French u' },
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

// Reverse mapping: phoneme/letter -> frame number
export const PHONEME_TO_FRAME = {};
Object.entries(FRAME_PHONEMES).forEach(([frameNum, data]) => {
  data.phonemes.forEach(phoneme => {
    PHONEME_TO_FRAME[phoneme.toLowerCase()] = parseInt(frameNum);
  });
});

// Letter to frame mapping (covers all alphabet letters)
export const LETTER_TO_FRAME = {
  'a': 1,   // a_u
  'b': 2,   // b_p_m
  'c': 7,   // c_k_q_g
  'd': 8,   // t_tsk_d_j
  'e': 5,   // e
  'f': 14,  // f_v
  'g': 7,   // c_k_q_g
  'h': 15,  // h
  'i': 3,   // ee_z_x
  'j': 8,   // t_tsk_d_j
  'k': 7,   // c_k_q_g
  'l': 18,  // L
  'm': 2,   // b_p_m
  'n': 9,   // n
  'o': 4,   // oo_o_ou_w
  'p': 2,   // b_p_m
  'q': 7,   // c_k_q_g
  'r': 17,  // r
  's': 11,  // s
  't': 8,   // t_tsk_d_j
  'u': 1,   // a_u
  'v': 14,  // f_v
  'w': 4,   // oo_o_ou_w
  'x': 3,   // ee_z_x
  'y': 19,  // LL_y
  'z': 3,   // ee_z_x
};

// Digraph detection - these letter combinations are single phonemes
export const DIGRAPHS = {
  'll': 19,  // LL_y frame
  'sh': 12,  // sh frame
  'ch': 16,  // ch frame
  'th': 13,  // th frame
  'ng': 10,  // ng frame
  'ph': 14,  // f_v frame (ph sounds like f)
  'wh': 4,   // oo_o_ou_w frame
  'ck': 7,   // c_k_q_g frame
  'gh': 0,   // silent - neutral
};

// Convert text to frame sequence (handles digraphs)
export const textToFrames = (text) => {
  const result = [];
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '');
  let i = 0;
  
  while (i < lower.length) {
    // Check for digraphs first (2-letter combinations)
    if (i < lower.length - 1) {
      const digraph = lower.substring(i, i + 2);
      if (DIGRAPHS[digraph] !== undefined) {
        result.push({ 
          frame: DIGRAPHS[digraph], 
          phoneme: digraph,
          isDigraph: true 
        });
        i += 2;
        continue;
      }
    }
    
    // Single character
    const char = lower[i];
    if (char === ' ') {
      result.push({ frame: 0, phoneme: '_', isDigraph: false }); // Word pause
    } else {
      const frame = LETTER_TO_FRAME[char] || 0;
      result.push({ frame, phoneme: char, isDigraph: false });
    }
    i++;
  }
  
  return result;
};

// Get frame number for a single phoneme
export const getFrameForPhoneme = (phoneme) => {
  const lower = phoneme.toLowerCase();
  
  // Check digraphs first
  if (DIGRAPHS[lower] !== undefined) {
    return DIGRAPHS[lower];
  }
  
  // Check letter mapping
  if (LETTER_TO_FRAME[lower] !== undefined) {
    return LETTER_TO_FRAME[lower];
  }
  
  // Check phoneme mapping
  if (PHONEME_TO_FRAME[lower] !== undefined) {
    return PHONEME_TO_FRAME[lower];
  }
  
  return 0; // Default to neutral
};

// Get frame info
export const getFrameInfo = (frameNum) => {
  return FRAME_PHONEMES[frameNum] || FRAME_PHONEMES[0];
};

// Phoneme audio path mapping (unchanged)
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

// For backwards compatibility - convert text to phoneme array
export const textToPhonemes = (text) => {
  const frames = textToFrames(text);
  return frames.map(f => f.phoneme);
};
