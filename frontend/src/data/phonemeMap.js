// ========== SIMPLIFIED PHONEME-TO-VISEME ENGINE ==========
// Maps IPA phonemes to 20-frame viseme system
// Simpler word breakdown: "beautiful" → "b-ee-y-oo-t-i-f-ul"

import { dictionary as cmudict } from 'cmu-pronouncing-dictionary';

export const FRAME_WIDTH = 939;
export const FRAME_HEIGHT = 793;
export const TOTAL_FRAMES = 20;
export const TARGET_FPS = 30;
export const FRAME_DURATION_MS = 1000 / TARGET_FPS;

// Animation timing
export const LETTER_PRACTICE_DELAY_MS = 1000; // 1 second delay before animation starts
export const FRAMES_PER_PHONEME = 8; // Doubled from 4 for slower animation

// IPA/Phoneme to Frame mapping (based on your P000-P024 system mapped to 20 frames)
// Frame 0 = neutral, Frames 1-19 = phonemes
const PHONEME_TO_FRAME = {
  // NEUTRAL (P000)
  '_': 0, ' ': 0, 'SIL': 0,
  
  // VOWELS
  // /a/ - father, spa (Frame 1)
  'a': 1, 'ah': 1, 'ɑ': 1, 'AA': 1, 'AH': 1, 'AX': 1,
  
  // /i/ - see, machine (Frame 3 - ee position)
  'i': 3, 'ee': 3, 'ɪ': 3, 'iː': 3, 'IY': 3, 'IH': 3, 'EY': 3,
  
  // /u/ - food, blue (Frame 4 - oo position)
  'u': 4, 'oo': 4, 'ʊ': 4, 'uː': 4, 'UW': 4, 'UH': 4,
  
  // /e/ - bed, met (Frame 5)
  'e': 5, 'eh': 5, 'ɛ': 5, 'eː': 5, 'EH': 5, 'AE': 5,
  
  // /o/ - go, schwa (Frame 4 - rounded)
  'o': 4, 'oh': 4, 'ɔ': 4, 'oː': 4, 'ə': 4, 'OW': 4, 'AO': 4,
  
  // /y/ - French tu, German über (Frame 6)
  'y': 6, 'ü': 6, 'yː': 6, 'Y': 6,
  
  // STOPS/CLOSURES
  // /p/ - pat (Frame 2 - lips closed)
  'p': 2, 'P': 2,
  
  // /b/ - bat (Frame 2 - lips closed)
  'b': 2, 'B': 2,
  
  // /m/ - mom (Frame 2 - lips closed)
  'm': 2, 'M': 2,
  
  // /t/ - top (Frame 8)
  't': 8, 'T': 8,
  
  // /d/ - dog (Frame 8 - same as t)
  'd': 8, 'D': 8,
  
  // /k/ - cat (Frame 7)
  'k': 7, 'K': 7, 'c': 7,
  
  // /g/ - go (Frame 7 - same as k)
  'g': 7, 'G': 7,
  
  // /q/ - (Frame 7)
  'q': 7,
  
  // NASALS
  // /n/ - no (Frame 9)
  'n': 9, 'N': 9,
  
  // /ng/ - sing (Frame 10)
  'ng': 10, 'ŋ': 10, 'NG': 10,
  
  // FRICATIVES
  // /s/ - see (Frame 11)
  's': 11, 'S': 11,
  
  // /z/ - zoo (Frame 11 - same as s)
  'z': 11, 'Z': 11,
  
  // /sh/ - ship (Frame 12)
  'sh': 12, 'ʃ': 12, 'SH': 12,
  
  // /zh/ - vision (Frame 12 - same as sh)
  'zh': 12, 'ʒ': 12, 'ZH': 12,
  
  // /th/ - think (Frame 13)
  'th': 13, 'θ': 13, 'ð': 13, 'TH': 13, 'DH': 13,
  
  // /f/ - fan (Frame 14)
  'f': 14, 'F': 14,
  
  // /v/ - van (Frame 14 - same as f)
  'v': 14, 'V': 14,
  
  // /h/ - hat (Frame 15)
  'h': 15, 'ɦ': 15, 'HH': 15,
  
  // /ch/ - chair (Frame 16)
  'ch': 16, 't͡ʃ': 16, 'tʃ': 16, 'CH': 16,
  
  // /j/ - judge (Frame 16 - same as ch)
  'j': 16, 'dʒ': 16, 'JH': 16,
  
  // LIQUIDS/LATERALS
  // /r/ - red (Frame 17)
  'r': 17, 'ɹ': 17, 'ɾ': 17, 'R': 17, 'ER': 17,
  
  // /l/ - lip (Frame 18)
  'l': 18, 'ɫ': 18, 'ɭ': 18, 'L': 18,
  
  // /ll/ - Welsh ll (Frame 19)
  'll': 19, 'ɬ': 19,
  
  // /w/ - we (Frame 4 - rounded lips)
  'w': 4, 'W': 4,
  
  // Diphthongs map to primary vowel
  'AW': 4, 'AY': 1, 'OY': 4,
};

// Get frame for any phoneme/sound
export const getFrameForPhoneme = (phoneme) => {
  const p = phoneme.replace(/[0-2]$/, ''); // Remove stress markers
  return PHONEME_TO_FRAME[p] ?? PHONEME_TO_FRAME[p.toLowerCase()] ?? 0;
};

// Simplified word-to-phoneme using CMU dictionary
// Returns condensed phoneme sequence (not every ARPABET, just key sounds)
export const wordToSimplePhonemes = (word) => {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return [];
  
  const pronunciation = cmudict[cleaned];
  if (!pronunciation) {
    // Fallback: use simple letter mapping
    return fallbackWordToPhonemes(cleaned);
  }
  
  // Parse ARPABET and condense to simpler sequence
  const arpabet = pronunciation.split(' ');
  const result = [];
  let prevFrame = -1;
  
  for (const phone of arpabet) {
    const frame = getFrameForPhoneme(phone);
    // Skip consecutive same frames (condenses animation)
    if (frame !== prevFrame) {
      result.push({
        phoneme: phone.replace(/[0-2]$/, ''),
        frame,
        isVowel: /[AEIOU]/.test(phone),
      });
      prevFrame = frame;
    }
  }
  
  return result;
};

// Fallback for words not in dictionary
const fallbackWordToPhonemes = (word) => {
  const result = [];
  let i = 0;
  let prevFrame = -1;
  
  const patterns = {
    // Multi-letter sounds
    'tion': [{ phoneme: 'sh', frame: 12 }, { phoneme: 'u', frame: 4 }, { phoneme: 'n', frame: 9 }],
    'sion': [{ phoneme: 'zh', frame: 12 }, { phoneme: 'u', frame: 4 }, { phoneme: 'n', frame: 9 }],
    'ough': [{ phoneme: 'o', frame: 4 }],
    'ight': [{ phoneme: 'ai', frame: 1 }, { phoneme: 't', frame: 8 }],
    'th': [{ phoneme: 'th', frame: 13 }],
    'sh': [{ phoneme: 'sh', frame: 12 }],
    'ch': [{ phoneme: 'ch', frame: 16 }],
    'ng': [{ phoneme: 'ng', frame: 10 }],
    'ph': [{ phoneme: 'f', frame: 14 }],
    'wh': [{ phoneme: 'w', frame: 4 }],
    'ck': [{ phoneme: 'k', frame: 7 }],
    'ee': [{ phoneme: 'ee', frame: 3 }],
    'ea': [{ phoneme: 'ee', frame: 3 }],
    'oo': [{ phoneme: 'oo', frame: 4 }],
    'ou': [{ phoneme: 'ow', frame: 4 }],
    'ow': [{ phoneme: 'ow', frame: 4 }],
    'ai': [{ phoneme: 'ay', frame: 1 }],
    'ay': [{ phoneme: 'ay', frame: 1 }],
    'ie': [{ phoneme: 'ee', frame: 3 }],
    'qu': [{ phoneme: 'kw', frame: 7 }],
  };
  
  while (i < word.length) {
    let matched = false;
    
    for (let len = 4; len >= 2; len--) {
      if (i + len <= word.length) {
        const segment = word.substring(i, i + len);
        if (patterns[segment]) {
          for (const p of patterns[segment]) {
            if (p.frame !== prevFrame) {
              result.push({ ...p, isVowel: [1, 3, 4, 5, 6].includes(p.frame) });
              prevFrame = p.frame;
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
      if (word[i] === 'e' && i === word.length - 1 && i > 0) {
        i++;
        continue;
      }
      
      const frame = getFrameForPhoneme(word[i]);
      if (frame !== prevFrame && frame > 0) {
        result.push({
          phoneme: word[i],
          frame,
          isVowel: [1, 3, 4, 5, 6].includes(frame),
        });
        prevFrame = frame;
      }
      i++;
    }
  }
  
  return result;
};

// Punctuation pause durations (in frames at 30fps)
const PUNCTUATION_PAUSE = {
  ',': 10,  // ~333ms
  '.': 15,  // ~500ms
  '!': 15,
  '?': 15,
  ';': 12,
  ':': 10,
};

// Build animation timeline for word/sentence
export const buildWordTimeline = (text) => {
  const timeline = [];
  const words = text.split(/(\s+|[,.!?;:])/);
  
  // Start from neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 3, type: 'start' });
  
  for (const segment of words) {
    if (!segment) continue;
    
    const trimmed = segment.trim();
    
    // Punctuation pause
    if (PUNCTUATION_PAUSE[trimmed]) {
      timeline.push({
        frame: 0,
        phoneme: trimmed,
        duration: PUNCTUATION_PAUSE[trimmed],
        type: 'pause',
      });
      continue;
    }
    
    // Word space
    if (/^\s+$/.test(segment)) {
      timeline.push({ frame: 0, phoneme: '_', duration: 3, type: 'space' });
      continue;
    }
    
    // Get phonemes for word
    const phonemes = wordToSimplePhonemes(segment);
    
    for (const p of phonemes) {
      // Approach
      timeline.push({
        frame: p.frame,
        phoneme: p.phoneme,
        duration: 2,
        type: 'approach',
      });
      
      // Hold at phoneme (longer for vowels)
      const holdDuration = p.isVowel ? FRAMES_PER_PHONEME : Math.floor(FRAMES_PER_PHONEME / 2);
      timeline.push({
        frame: p.frame,
        phoneme: p.phoneme,
        duration: holdDuration,
        type: 'hold',
      });
    }
  }
  
  // Return to neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 4, type: 'end' });
  
  return timeline;
};

// Letter Practice pronunciation (unchanged structure but doubled durations)
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
  'u': { frames: [1], audioLabel: 'uh', display: 'uh' },
  'v': { frames: [14, 1], audioLabel: 'va', display: 'va' },
  'w': { frames: [4, 1], audioLabel: 'wa', display: 'wa' },
  'x': { frames: [5, 7, 11], audioLabel: 'xa', display: 'eks' },
  'y': { frames: [6, 1], audioLabel: 'ya', display: 'ya' },
  'z': { frames: [11, 1], audioLabel: 'za', display: 'za' },
};

// Build timeline for single letter (with doubled frame durations)
export const buildLetterTimeline = (letter) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  if (!pronunciation) {
    return [{ frame: 0, phoneme: '_', duration: 10, type: 'neutral' }];
  }

  const timeline = [];
  const { frames, display } = pronunciation;
  
  // Start from neutral (longer hold)
  timeline.push({ frame: 0, phoneme: '_', duration: 4, type: 'start' });
  
  frames.forEach((frame, idx) => {
    const isLast = idx === frames.length - 1;
    const isVowel = [1, 3, 4, 5, 6].includes(frame);
    
    // Approach (doubled)
    timeline.push({ frame, phoneme: display, duration: 4, type: 'approach' });
    
    // Hold at phoneme (doubled - vowels get extra)
    const holdDuration = isVowel || isLast ? 12 : 6;
    timeline.push({ frame, phoneme: display, duration: holdDuration, type: 'hold' });
  });
  
  // Return to neutral (longer)
  timeline.push({ frame: 0, phoneme: '_', duration: 6, type: 'end' });
  
  return timeline;
};

// Frame info
export const FRAME_PHONEMES = {
  0: { name: 'neutral', description: 'Rest position' },
  1: { name: 'a_ah', description: '/a/ - father, spa' },
  2: { name: 'b_p_m', description: '/b,p,m/ - lips closed' },
  3: { name: 'ee_i', description: '/i/ - see, machine' },
  4: { name: 'oo_o_w', description: '/u,o,w/ - rounded lips' },
  5: { name: 'e_eh', description: '/e/ - bed, met' },
  6: { name: 'y_ü', description: '/y/ - French tu' },
  7: { name: 'k_g_c', description: '/k,g/ - back tongue' },
  8: { name: 't_d', description: '/t,d/ - tongue to ridge' },
  9: { name: 'n', description: '/n/ - nasal' },
  10: { name: 'ng', description: '/ŋ/ - sing' },
  11: { name: 's_z', description: '/s,z/ - hiss' },
  12: { name: 'sh_zh', description: '/ʃ,ʒ/ - ship' },
  13: { name: 'th', description: '/θ,ð/ - think, this' },
  14: { name: 'f_v', description: '/f,v/ - lip-to-teeth' },
  15: { name: 'h', description: '/h/ - breath' },
  16: { name: 'ch_j', description: '/tʃ,dʒ/ - chair, judge' },
  17: { name: 'r', description: '/r/ - red' },
  18: { name: 'l', description: '/l/ - lip' },
  19: { name: 'll', description: '/ɬ/ - Welsh ll' },
};

export const getFrameInfo = (frameNum) => {
  return FRAME_PHONEMES[frameNum] || FRAME_PHONEMES[0];
};

export const getLetterDisplay = (letter) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  return pronunciation ? pronunciation.display : letter;
};

export const getPhonemeAudioPath = (letter, lang) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  const audioLabel = pronunciation ? pronunciation.audioLabel : 'ah';
  const langCode = lang.split('-')[0];
  return `/assets/audio/phonemes/${langCode}-${audioLabel}.mp3`;
};

// Legacy exports
export const textToPhonemes = (text) => {
  const words = text.split(/\s+/);
  const result = [];
  for (const word of words) {
    const phonemes = wordToSimplePhonemes(word);
    result.push(...phonemes.map(p => p.phoneme));
  }
  return result;
};

export const wordToPhonemes = textToPhonemes;

export const DIGRAPHS = {
  'll': 19, 'sh': 12, 'ch': 16, 'th': 13, 'ng': 10,
  'ph': 14, 'wh': 4, 'ck': 7,
};

export const LETTER_TO_FRAME = {
  'a': 1, 'b': 2, 'c': 7, 'd': 8, 'e': 5, 'f': 14, 'g': 7, 'h': 15,
  'i': 3, 'j': 16, 'k': 7, 'l': 18, 'm': 2, 'n': 9, 'o': 4, 'p': 2,
  'q': 7, 'r': 17, 's': 11, 't': 8, 'u': 1, 'v': 14, 'w': 4, 'x': 7,
  'y': 6, 'z': 11,
};
