// Unified sprite frame library
// Each mouth shape exists exactly ONCE, reused globally across all phonemes
// Like typewriter keys - no duplication, infinite combinations

export const FRAME_LIBRARY = {
  // Frame 0: Mouth completely closed (neutral/rest position)
  closed: 0,
  
  // Frames 1-3: Consonant contact frames (tongue/lips touching, minimal jaw)
  consonant_light: 1,
  consonant_medium: 2,
  consonant_heavy: 3,
  
  // Frames 4-6: Vowel frames (jaw and lip shapes vary)
  vowel_front_light: 4,   // /i/ /e/ - front vowels, spread lips
  vowel_front_open: 5,    // /æ/ - more jaw opening
  vowel_central: 6,       // /ə/ /ʌ/ - neutral schwa
  
  // Frames 7-9: Vowel back/round frames
  vowel_back_round: 7,    // /o/ /u/ - rounded, protruded lips
  vowel_back_open: 8,     // /ɑ/ - back vowel, wide open
  vowel_mid_round: 9,     // /ɔ/ - back rounded mid vowel
  
  // Frame 10: Transition/relaxation frame
  relax: 10,
};

// Phoneme-to-frame-sequence mapping
// Each phoneme is a sequence of frames from FRAME_LIBRARY
// The mouth shape flows through these frames during articulation
export const PHONEME_SEQUENCES = {
  // CONSONANTS - use consonant frames + adjacent vowel context
  h: [1, 2],                 // Light consonant contact
  b: [3, 3],                 // Heavy lip closure (bilabial)
  p: [3, 3],                 // Heavy lip closure (bilabial)
  m: [3, 3],                 // Heavy lip closure (bilabial nasal)
  
  d: [2, 2],                 // Medium tongue contact
  t: [2, 2],                 // Medium tongue contact
  n: [2, 2],                 // Medium tongue contact
  
  l: [1, 2, 1],              // Lighter tongue contact, gliding
  r: [1, 2, 1],              // Lighter tongue contact, gliding
  w: [1, 2, 1],              // Glide consonant
  y: [1, 2, 1],              // Glide consonant
  
  s: [1, 1],                 // Fricative (light contact)
  z: [1, 1],                 // Fricative (light contact)
  f: [1, 1],                 // Fricative (light contact)
  v: [1, 1],                 // Fricative (light contact)
  
  k: [2, 2],                 // Velar (back tongue contact)
  g: [2, 2],                 // Velar (back tongue contact)
  
  // VOWELS - sustained in frame, then close
  a: [5, 5, 5],              // Front vowel, open mouth
  e: [4, 4, 4],              // Front vowel, spread lips
  i: [4, 4, 4],              // Front vowel, high, spread
  
  o: [7, 7, 7],              // Back vowel, rounded
  u: [7, 7, 7],              // Back vowel, high, rounded
  
  ə: [6, 6, 6],              // Schwa - central, neutral
  ʌ: [6, 6, 6],              // Schwa variant
  
  ɑ: [8, 8, 8],              // Back vowel, very open
  ɔ: [9, 9, 9],              // Back vowel, mid-round
  
  // Diphthongs (gliding vowels)
  aɪ: [5, 5, 4, 4],          // /ai/ diphthong
  oʊ: [8, 8, 7, 7],          // /ou/ diphthong
  eɪ: [4, 4, 4, 4],          // /ay/ diphthong
  
  // SPECIAL/RARE
  ɲ: [2, 2],                 // Palatal nasal (Spanish ñ)
  ll: [2, 2],                // Spanish ll (palatal)
};

// Get the frame sequence for a phoneme
export function getPhonemeFrameSequence(phoneme) {
  const key = String(phoneme || '').toLowerCase().trim();
  return PHONEME_SEQUENCES[key] || [0]; // Default to closed mouth if unknown
}

// Get actual frame index from FRAME_LIBRARY
export function getFrameIndex(frameName) {
  return FRAME_LIBRARY[frameName] ?? 0;
}

// Get a sprite URL for a frame index (0-10)
// This will be called with the unified library index
export function getSpriteUrlForFrame(letter, frameIndex) {
  // Import from visemeUrls to get the actual image
  // For now, return null - will be integrated with visemeUrls
  return null;
}