// ========== UNIVERSAL VISEME ENGINE ==========
// 20 mouth shapes. That's ALL we have. Every sound maps to one of these.
// Language-agnostic: IPA → Viseme Frame
// Works for recognition too: heard sound → our phoneme library

export const FRAME_WIDTH = 939;
export const FRAME_HEIGHT = 793;
export const TOTAL_FRAMES = 20;
export const TARGET_FPS = 30;
export const FRAME_DURATION_MS = 1000 / TARGET_FPS;
export const LETTER_PRACTICE_DELAY_MS = 1000;

// ========== THE 20 VISEME FRAMES ==========
// This is our COMPLETE library. Every sound maps to ONE of these.
export const VISEME_LIBRARY = {
  0:  { id: 'neutral', shapes: ['silence', 'pause', 'rest'] },
  1:  { id: 'aa', shapes: ['a', 'ah', 'uh', 'ʌ', 'ɑ', 'æ', 'ə'] },           // Open mouth
  2:  { id: 'bpm', shapes: ['b', 'p', 'm'] },                                  // Lips closed/together
  3:  { id: 'ee', shapes: ['i', 'ee', 'ɪ', 'iː', 'e', 'ɛ'] },                 // Lips spread wide
  4:  { id: 'oo', shapes: ['u', 'oo', 'o', 'ʊ', 'oʊ', 'ɔ', 'w', 'aw'] },     // Lips rounded
  5:  { id: 'eh', shapes: ['e', 'ɛ', 'eɪ'] },                                  // Slightly open
  6:  { id: 'y', shapes: ['y', 'ü', 'ʏ', 'yː'] },                             // Rounded + front
  7:  { id: 'kg', shapes: ['k', 'g', 'c', 'q', 'x', 'ɡ', 'ŋ'] },             // Back tongue
  8:  { id: 'td', shapes: ['t', 'd', 'ɾ', 'ʈ', 'ɖ'] },                        // Tongue tip up
  9:  { id: 'n', shapes: ['n', 'ɲ', 'ɳ'] },                                    // Nasal, tongue up
  10: { id: 'ng', shapes: ['ŋ', 'ng'] },                                       // Back nasal
  11: { id: 'sz', shapes: ['s', 'z', 'ts', 'dz'] },                           // Teeth close, hiss
  12: { id: 'sh', shapes: ['ʃ', 'ʒ', 'sh', 'zh'] },                           // Lips pushed out
  13: { id: 'th', shapes: ['θ', 'ð', 'th'] },                                  // Tongue between teeth
  14: { id: 'fv', shapes: ['f', 'v'] },                                        // Teeth on lip
  15: { id: 'h', shapes: ['h', 'ɦ', 'x', 'χ'] },                              // Open breath
  16: { id: 'ch', shapes: ['tʃ', 'dʒ', 'ch', 'j', 'ʧ', 'ʤ'] },               // Affricate
  17: { id: 'r', shapes: ['r', 'ɹ', 'ɾ', 'ʀ', 'ɽ'] },                        // R sounds
  18: { id: 'l', shapes: ['l', 'ɫ', 'ɭ', 'ʎ'] },                              // Lateral
  19: { id: 'll', shapes: ['ɬ', 'ʎ', 'j', 'ʝ'] },                             // Welsh ll / palatal
};

// ========== COMPLETE IPA → FRAME MAPPING ==========
// Every IPA symbol used in all 10 languages maps to exactly ONE frame
const IPA_TO_FRAME = {
  // === VOWELS ===
  // Open vowels → Frame 1
  'a': 1, 'ɑ': 1, 'ɐ': 1, 'æ': 1, 'ʌ': 1, 'ə': 1, 'ɜ': 1, 'ɚ': 1,
  
  // Front high vowels → Frame 3
  'i': 3, 'ɪ': 3, 'e': 3, 'ɛ': 3, 'y': 3,
  
  // Rounded vowels → Frame 4
  'u': 4, 'ʊ': 4, 'o': 4, 'ɔ': 4, 'ø': 4, 'œ': 4,
  
  // Mid vowels → Frame 5 (can also use 3)
  'ɘ': 5, 'ɵ': 5,
  
  // Rounded front (German ü) → Frame 6
  'ʏ': 6,
  
  // === CONSONANTS ===
  // Bilabials (lips together) → Frame 2
  'p': 2, 'b': 2, 'm': 2, 'ɓ': 2, 'ʙ': 2,
  
  // Velars (back tongue) → Frame 7
  'k': 7, 'g': 7, 'ɡ': 7, 'x': 7, 'ɣ': 7, 'q': 7, 'ɢ': 7,
  
  // Alveolars (tongue tip) → Frame 8
  't': 8, 'd': 8, 'ɾ': 8, 'ʈ': 8, 'ɖ': 8, 'ɗ': 8,
  
  // Alveolar nasal → Frame 9
  'n': 9, 'ɳ': 9, 'ɲ': 9,
  
  // Velar nasal → Frame 10
  'ŋ': 10,
  
  // Alveolar fricatives → Frame 11
  's': 11, 'z': 11, 'ʦ': 11, 'ʣ': 11, 'c': 11, 'ɕ': 11, 'ʑ': 11,
  
  // Postalveolar fricatives → Frame 12
  'ʃ': 12, 'ʒ': 12, 'ʂ': 12, 'ʐ': 12,
  
  // Dental fricatives → Frame 13
  'θ': 13, 'ð': 13,
  
  // Labiodental fricatives → Frame 14
  'f': 14, 'v': 14, 'ʋ': 14,
  
  // Glottal → Frame 15
  'h': 15, 'ɦ': 15, 'ʔ': 15, 'χ': 15, 'ʁ': 15,
  
  // Affricates → Frame 16
  'ʧ': 16, 'ʤ': 16, 'tʃ': 16, 'dʒ': 16, 'ʨ': 16, 'ʥ': 16,
  
  // Rhotics → Frame 17
  'r': 17, 'ɹ': 17, 'ɻ': 17, 'ʀ': 17, 'ɽ': 17, 'ɺ': 17,
  
  // Laterals → Frame 18
  'l': 18, 'ɫ': 18, 'ɭ': 18, 'ʎ': 18, 'ɬ': 18,
  
  // Palatal approximant → Frame 19
  'j': 19, 'ʝ': 19, 'ɥ': 19,
  
  // Labial-velar approximant → Frame 4 (rounded)
  'w': 4, 'ʍ': 4,
};

// ========== SIMPLE LETTER → FRAME (fallback) ==========
const LETTER_TO_FRAME = {
  'a': 1, 'e': 3, 'i': 3, 'o': 4, 'u': 4,
  'b': 2, 'c': 7, 'd': 8, 'f': 14, 'g': 7,
  'h': 15, 'j': 16, 'k': 7, 'l': 18, 'm': 2,
  'n': 9, 'p': 2, 'q': 7, 'r': 17, 's': 11,
  't': 8, 'v': 14, 'w': 4, 'x': 11, 'y': 19, 'z': 11,
};

// ========== COMMON PATTERNS → FRAMES ==========
// Multi-letter patterns that represent single sounds
const PATTERNS_TO_FRAMES = {
  // Digraphs
  'th': [13],
  'sh': [12],
  'ch': [16],
  'ng': [10],
  'ph': [14],
  'wh': [4],
  'ck': [7],
  'qu': [7, 4],
  'gh': [],  // Usually silent
  
  // Vowel combinations
  'ee': [3],
  'ea': [3],
  'ie': [3],
  'ey': [3],
  'ai': [1],
  'ay': [1],
  'oo': [4],
  'ou': [4],
  'ow': [4],
  'oa': [4],
  'oe': [4],
  'ue': [4],
  'ew': [4],
  'au': [4],
  'aw': [4],
  
  // Endings
  'tion': [12, 9],      // sh-n
  'sion': [12, 9],      // sh-n  
  'ious': [3, 11],      // ee-s
  'eous': [3, 11],      // ee-s
  'ture': [16, 17],     // ch-r
  'sure': [12, 17],     // sh-r
  'ight': [1, 8],       // ai-t
  'ough': [4],          // varies but usually "o"
  'ould': [4, 8],       // oo-d
};

// ========== GET FRAME FOR ANY SOUND ==========
export const getFrameForSound = (sound) => {
  if (!sound) return 0;
  const s = sound.toLowerCase();
  
  // Check IPA mapping first
  if (IPA_TO_FRAME[s] !== undefined) return IPA_TO_FRAME[s];
  
  // Check letter mapping
  if (LETTER_TO_FRAME[s] !== undefined) return LETTER_TO_FRAME[s];
  
  // Check if it's a simple phoneme name
  const phonemeMap = {
    'aa': 1, 'ah': 1, 'uh': 1,
    'ee': 3, 'ih': 3,
    'oo': 4, 'oh': 4,
    'eh': 5,
    'bpm': 2,
    'kg': 7,
    'td': 8,
    'sz': 11,
    'fv': 14,
  };
  if (phonemeMap[s] !== undefined) return phonemeMap[s];
  
  return 0; // Neutral for unknown
};

// ========== CONVERT ANY TEXT TO VISEME SEQUENCE ==========
export const textToVisemes = (text) => {
  const result = [];
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '');
  let i = 0;
  let prevFrame = -1;
  
  while (i < lower.length) {
    // Skip spaces
    if (lower[i] === ' ') {
      if (prevFrame !== 0) {
        result.push({ frame: 0, sound: '_' });
        prevFrame = 0;
      }
      i++;
      continue;
    }
    
    // Try patterns (longest first)
    let matched = false;
    for (let len = 4; len >= 2; len--) {
      if (i + len <= lower.length) {
        const pattern = lower.substring(i, i + len);
        if (PATTERNS_TO_FRAMES[pattern] !== undefined) {
          for (const frame of PATTERNS_TO_FRAMES[pattern]) {
            if (frame !== prevFrame) {
              result.push({ frame, sound: pattern });
              prevFrame = frame;
            }
          }
          i += len;
          matched = true;
          break;
        }
      }
    }
    
    if (!matched) {
      // Silent e at end
      if (lower[i] === 'e' && i === lower.length - 1 && i > 0) {
        i++;
        continue;
      }
      
      // Single letter
      const frame = LETTER_TO_FRAME[lower[i]] || 0;
      if (frame !== prevFrame && frame > 0) {
        result.push({ frame, sound: lower[i] });
        prevFrame = frame;
      }
      i++;
    }
  }
  
  return result;
};

// ========== BUILD ANIMATION TIMELINE ==========
export const buildWordTimeline = (text) => {
  const timeline = [];
  const visemes = textToVisemes(text);
  
  // Start neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'start' });
  
  for (const v of visemes) {
    if (v.frame === 0) {
      // Word break
      timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'space' });
    } else {
      const isVowel = [1, 3, 4, 5, 6].includes(v.frame);
      timeline.push({
        frame: v.frame,
        phoneme: v.sound,
        duration: isVowel ? 3 : 2,
        type: 'hold',
      });
    }
  }
  
  // End neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'end' });
  
  return timeline;
};

// ========== RECOGNITION: CONVERT HEARD SOUNDS TO OUR PHONEMES ==========
// When user speaks "woowwefool" trying to say "beautiful", 
// we capture exactly what we heard using our phoneme library
export const heardSoundToPhoneme = (sound) => {
  const frame = getFrameForSound(sound);
  const frameInfo = VISEME_LIBRARY[frame];
  return {
    frame,
    id: frameInfo?.id || 'neutral',
    original: sound,
  };
};

// Convert recognition result to our phoneme string
// Input: "woowwefool" → Output: "w_oo_w_w_ee_f_oo_l"
export const recognitionToPhonemeString = (heard) => {
  const visemes = textToVisemes(heard);
  return visemes.map(v => {
    const info = VISEME_LIBRARY[v.frame];
    return info?.id || '_';
  }).join('_');
};

// ========== LETTER PRACTICE ==========
export const LETTER_PRONUNCIATION = {
  'a': { frames: [1], audioLabel: 'ah', display: 'ah' },
  'b': { frames: [2, 1], audioLabel: 'ba', display: 'ba' },
  'c': { frames: [7, 1], audioLabel: 'ca', display: 'ca' },
  'd': { frames: [8, 1], audioLabel: 'da', display: 'da' },
  'e': { frames: [3], audioLabel: 'eh', display: 'eh' },
  'f': { frames: [14, 1], audioLabel: 'fa', display: 'fa' },
  'g': { frames: [7, 1], audioLabel: 'ga', display: 'ga' },
  'h': { frames: [15, 1], audioLabel: 'ha', display: 'ha' },
  'i': { frames: [3], audioLabel: 'ih', display: 'ih' },
  'j': { frames: [16, 1], audioLabel: 'ja', display: 'ja' },
  'k': { frames: [7, 1], audioLabel: 'ka', display: 'ka' },
  'l': { frames: [18, 1], audioLabel: 'la', display: 'la' },
  'm': { frames: [2, 1], audioLabel: 'ma', display: 'ma' },
  'n': { frames: [9, 1], audioLabel: 'na', display: 'na' },
  'o': { frames: [4], audioLabel: 'oh', display: 'oh' },
  'p': { frames: [2, 1], audioLabel: 'pa', display: 'pa' },
  'q': { frames: [7, 4, 1], audioLabel: 'kwa', display: 'kwa' },
  'r': { frames: [17, 1], audioLabel: 'ra', display: 'ra' },
  's': { frames: [11, 1], audioLabel: 'sa', display: 'sa' },
  't': { frames: [8, 1], audioLabel: 'ta', display: 'ta' },
  'u': { frames: [4], audioLabel: 'uh', display: 'uh' },
  'v': { frames: [14, 1], audioLabel: 'va', display: 'va' },
  'w': { frames: [4, 1], audioLabel: 'wa', display: 'wa' },
  'x': { frames: [3, 7, 11], audioLabel: 'xa', display: 'eks' },
  'y': { frames: [19, 1], audioLabel: 'ya', display: 'ya' },
  'z': { frames: [11, 1], audioLabel: 'za', display: 'za' },
};

export const buildLetterTimeline = (letter) => {
  const p = LETTER_PRONUNCIATION[letter.toLowerCase()];
  if (!p) return [{ frame: 0, phoneme: '_', duration: 10, type: 'neutral' }];

  const timeline = [];
  timeline.push({ frame: 0, phoneme: '_', duration: 3, type: 'start' });
  
  for (let i = 0; i < p.frames.length; i++) {
    const frame = p.frames[i];
    const isVowel = [1, 3, 4, 5, 6].includes(frame);
    const isLast = i === p.frames.length - 1;
    
    timeline.push({ frame, phoneme: p.display, duration: 3, type: 'approach' });
    timeline.push({ frame, phoneme: p.display, duration: isVowel || isLast ? 10 : 5, type: 'hold' });
  }
  
  timeline.push({ frame: 0, phoneme: '_', duration: 4, type: 'end' });
  return timeline;
};

// ========== EXPORTS ==========
export const FRAME_PHONEMES = VISEME_LIBRARY;
export const getFrameInfo = (f) => VISEME_LIBRARY[f] || VISEME_LIBRARY[0];
export const getLetterDisplay = (l) => LETTER_PRONUNCIATION[l.toLowerCase()]?.display || l;
export const getPhonemeAudioPath = (l, lang) => {
  const p = LETTER_PRONUNCIATION[l.toLowerCase()];
  return `/assets/audio/phonemes/${lang.split('-')[0]}-${p?.audioLabel || 'ah'}.mp3`;
};
export const getFrameForPhoneme = getFrameForSound;

// Legacy
export const textToPhonemes = (text) => textToVisemes(text).map(v => v.sound);
export const wordToPhonemes = textToPhonemes;
export const DIGRAPHS = { 'll': 19, 'sh': 12, 'ch': 16, 'th': 13, 'ng': 10, 'ph': 14, 'wh': 4, 'ck': 7 };
export { LETTER_TO_FRAME };
