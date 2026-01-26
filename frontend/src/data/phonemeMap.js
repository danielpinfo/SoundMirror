// ========== PHONEME SPRITE ENGINE ==========
// P000-P024 Phoneme mapping with 10 frames per cluster
// Frame #5 of each cluster = sweet spot (apex articulation)

export const FRAME_SIZE = 512;
export const FRAMES_PER_SHEET = 50;
export const TOTAL_FRAMES = 250;
export const FRAMES_PER_PHONEME = 10;

// Each phoneme cluster has 10 frames (0-9), with frame 5 being the "sweet spot"
export const PHONEME_MAP = {
  // P000: Neutral (frames 0-9) - rest position
  '_': { cluster: 0, name: 'neutral', baseFrame: 0 },
  ' ': { cluster: 0, name: 'neutral', baseFrame: 0 },
  
  // VOWELS (P001-P006)
  'a': { cluster: 1, name: '/a/ ah', baseFrame: 10 },      // P001 father, spa
  'i': { cluster: 2, name: '/i/ ee', baseFrame: 20 },      // P002 see, machine
  'u': { cluster: 3, name: '/u/ oo', baseFrame: 30 },      // P003 food, blue
  'e': { cluster: 4, name: '/e/ eh', baseFrame: 40 },      // P004 bed, met
  'o': { cluster: 5, name: '/o/ oh', baseFrame: 50 },      // P005 go (pure)
  'y': { cluster: 6, name: '/y/ ü', baseFrame: 60 },       // P006 French tu
  
  // STOPS / CLOSURES (P007-P012)
  'p': { cluster: 7, name: '/p/', baseFrame: 70 },         // P007 pat
  'b': { cluster: 7, name: '/b/', baseFrame: 70 },         // Same as p
  't': { cluster: 8, name: '/t/', baseFrame: 80 },         // P008 top
  'd': { cluster: 9, name: '/d/', baseFrame: 90 },         // P009 dog
  'k': { cluster: 10, name: '/k/', baseFrame: 100 },       // P010 cat
  'c': { cluster: 10, name: '/k/', baseFrame: 100 },       // Same as k
  'q': { cluster: 10, name: '/k/', baseFrame: 100 },       // Same as k
  'g': { cluster: 11, name: '/g/', baseFrame: 110 },       // P011 go
  'glottal': { cluster: 12, name: '/ʔ/', baseFrame: 120 }, // P012 uh-oh
  
  // NASALS (P013-P014)
  'n': { cluster: 13, name: '/n/', baseFrame: 130 },       // P013 no
  'm': { cluster: 13, name: '/m/', baseFrame: 130 },       // Same mouth
  'ng': { cluster: 14, name: '/ŋ/', baseFrame: 140 },      // P014 sing
  
  // FRICATIVES / AFFRICATES (P015-P020)
  's': { cluster: 15, name: '/s/', baseFrame: 150 },       // P015 see
  'z': { cluster: 15, name: '/z/', baseFrame: 150 },       // Same as s
  'sh': { cluster: 16, name: '/ʃ/', baseFrame: 160 },      // P016 ship
  'th': { cluster: 17, name: '/θ/', baseFrame: 170 },      // P017 think
  'f': { cluster: 18, name: '/f/', baseFrame: 180 },       // P018 fan
  'v': { cluster: 18, name: '/v/', baseFrame: 180 },       // Same as f
  'h': { cluster: 19, name: '/h/', baseFrame: 190 },       // P019 hat
  'ch': { cluster: 20, name: '/tʃ/', baseFrame: 200 },     // P020 chair
  'j': { cluster: 20, name: '/dʒ/', baseFrame: 200 },      // Same as ch
  
  // LIQUIDS / LATERALS (P021-P023)
  'r': { cluster: 21, name: '/r/', baseFrame: 210 },       // P021 red
  'l': { cluster: 22, name: '/l/', baseFrame: 220 },       // P022 lip
  'll': { cluster: 22, name: '/l/', baseFrame: 220 },      // Double L = single phoneme
  'welsh_ll': { cluster: 23, name: '/ɬ/', baseFrame: 230 },// P023 Welsh ll
  'w': { cluster: 3, name: '/w/', baseFrame: 30 },         // Like /u/
  
  // CLICKS (P024)
  'click': { cluster: 24, name: '/ǀ/', baseFrame: 240 },   // P024 tsk
  'x': { cluster: 10, name: '/ks/', baseFrame: 100 },      // Like k+s
};

// Digraph detection - these letter combinations are single phonemes
export const DIGRAPHS = {
  'll': 'll',    // hello -> he-ll-o (3 phonemes, not 4)
  'sh': 'sh',    // ship -> sh-i-p
  'ch': 'ch',    // chair -> ch-ai-r
  'th': 'th',    // think -> th-i-nk
  'ng': 'ng',    // sing -> si-ng
  'ph': 'f',     // phone -> f-o-ne
  'wh': 'w',     // what -> w-a-t
  'ck': 'k',     // back -> ba-k
  'gh': '_',     // silent in "night"
};

// Convert text to phoneme sequence (handles digraphs)
export const textToPhonemes = (text) => {
  const result = [];
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '');
  let i = 0;
  
  while (i < lower.length) {
    // Check for digraphs first (2-letter combinations)
    if (i < lower.length - 1) {
      const digraph = lower.substring(i, i + 2);
      if (DIGRAPHS[digraph]) {
        result.push(DIGRAPHS[digraph]);
        i += 2;
        continue;
      }
    }
    
    // Single character
    const char = lower[i];
    if (char === ' ') {
      result.push('_'); // Word pause
    } else {
      result.push(char);
    }
    i++;
  }
  
  return result;
};

// Get the base frame for a phoneme
export const getPhonemeBaseFrame = (phoneme) => {
  const data = PHONEME_MAP[phoneme] || PHONEME_MAP['_'];
  return data.baseFrame;
};

// Get the sweet spot frame (frame #5 of the 10-frame cluster)
export const getSweetSpot = (phoneme) => {
  return getPhonemeBaseFrame(phoneme) + 5;
};

// Get phoneme display name
export const getPhonemeName = (phoneme) => {
  const data = PHONEME_MAP[phoneme] || PHONEME_MAP['_'];
  return data.name;
};

// Calculate which sprite sheet contains a frame
export const getSheetForFrame = (frameNum) => {
  return Math.floor(frameNum / FRAMES_PER_SHEET);
};

// Calculate the position within a sprite sheet
export const getFramePositionInSheet = (frameNum) => {
  return frameNum % FRAMES_PER_SHEET;
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
