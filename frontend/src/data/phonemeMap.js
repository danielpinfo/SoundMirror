// ========== PROFESSIONAL PHONEME-TO-VISEME ENGINE ==========
// Uses CMU Pronouncing Dictionary for accurate IPA-like pronunciation
// Maps ARPABET phonemes to 20-frame viseme system
// Supports 10 languages with special phoneme rules

import { dictionary as cmudict } from 'cmu-pronouncing-dictionary';

export const FRAME_WIDTH = 939;
export const FRAME_HEIGHT = 793;
export const TOTAL_FRAMES = 20;
export const TARGET_FPS = 30;
export const FRAME_DURATION_MS = 1000 / TARGET_FPS;

// Frame to viseme mapping
export const FRAME_PHONEMES = {
  0:  { name: 'neutral', phonemes: ['_', ' ', 'SIL'], description: 'Neutral/rest/silence' },
  1:  { name: 'a_u', phonemes: ['AA', 'AH', 'AX', 'a', 'u', 'ʌ', 'ɑ'], description: 'Open vowels (ah, uh)' },
  2:  { name: 'b_p_m', phonemes: ['B', 'P', 'M', 'b', 'p', 'm'], description: 'Bilabial stops' },
  3:  { name: 'ee_i', phonemes: ['IY', 'IH', 'EY', 'i', 'ɪ', 'ee'], description: 'Front high vowels (ee)' },
  4:  { name: 'oo_o_w', phonemes: ['OW', 'UW', 'UH', 'W', 'AW', 'o', 'u', 'w', 'ʊ', 'oʊ', 'oo'], description: 'Rounded vowels (oo, oh)' },
  5:  { name: 'e', phonemes: ['EH', 'AE', 'e', 'ɛ', 'æ'], description: 'Mid front vowel (eh)' },
  6:  { name: 'ü', phonemes: ['Y', 'ü', 'y'], description: 'German ü / French u' },
  7:  { name: 'k_g', phonemes: ['K', 'G', 'NG', 'k', 'g', 'ŋ'], description: 'Velar stops' },
  8:  { name: 't_d', phonemes: ['T', 'D', 'N', 't', 'd', 'n', 'ɾ'], description: 'Alveolar stops' },
  9:  { name: 'n', phonemes: ['N', 'n'], description: 'Alveolar nasal' },
  10: { name: 'ng', phonemes: ['NG', 'ng', 'ŋ'], description: 'Velar nasal' },
  11: { name: 's_z', phonemes: ['S', 'Z', 's', 'z'], description: 'Alveolar fricatives' },
  12: { name: 'sh_zh', phonemes: ['SH', 'ZH', 'sh', 'zh', 'ʃ', 'ʒ'], description: 'Postalveolar fricatives' },
  13: { name: 'th', phonemes: ['TH', 'DH', 'th', 'ð', 'θ'], description: 'Dental fricatives' },
  14: { name: 'f_v', phonemes: ['F', 'V', 'f', 'v'], description: 'Labiodental fricatives' },
  15: { name: 'h', phonemes: ['HH', 'h'], description: 'Glottal fricative' },
  16: { name: 'ch_j', phonemes: ['CH', 'JH', 'ch', 'j', 'dʒ', 'tʃ'], description: 'Affricates' },
  17: { name: 'r', phonemes: ['R', 'ER', 'r', 'ɹ', 'ɝ'], description: 'Rhotic' },
  18: { name: 'l', phonemes: ['L', 'l'], description: 'Lateral approximant' },
  19: { name: 'll_y', phonemes: ['Y', 'll', 'y', 'j'], description: 'Palatal / Welsh ll' },
};

// ARPABET to Frame mapping (CMU Dictionary uses ARPABET)
const ARPABET_TO_FRAME = {
  // Vowels
  'AA': 1, 'AA0': 1, 'AA1': 1, 'AA2': 1,  // odd, father
  'AE': 5, 'AE0': 5, 'AE1': 5, 'AE2': 5,  // at, bat
  'AH': 1, 'AH0': 1, 'AH1': 1, 'AH2': 1,  // hut, but
  'AO': 4, 'AO0': 4, 'AO1': 4, 'AO2': 4,  // ought, caught
  'AW': 4, 'AW0': 4, 'AW1': 4, 'AW2': 4,  // cow, how
  'AX': 1,                                  // schwa
  'AY': 1, 'AY0': 1, 'AY1': 1, 'AY2': 1,  // hide, my
  'EH': 5, 'EH0': 5, 'EH1': 5, 'EH2': 5,  // ed, red
  'ER': 17, 'ER0': 17, 'ER1': 17, 'ER2': 17,  // hurt, bird
  'EY': 3, 'EY0': 3, 'EY1': 3, 'EY2': 3,  // ate, say
  'IH': 3, 'IH0': 3, 'IH1': 3, 'IH2': 3,  // it, bit
  'IY': 3, 'IY0': 3, 'IY1': 3, 'IY2': 3,  // eat, see
  'OW': 4, 'OW0': 4, 'OW1': 4, 'OW2': 4,  // oat, show
  'OY': 4, 'OY0': 4, 'OY1': 4, 'OY2': 4,  // toy, boy
  'UH': 4, 'UH0': 4, 'UH1': 4, 'UH2': 4,  // hood, could
  'UW': 4, 'UW0': 4, 'UW1': 4, 'UW2': 4,  // two, you
  
  // Consonants
  'B': 2,   // be, rib
  'CH': 16, // cheese, church
  'D': 8,   // dee, odd
  'DH': 13, // thee, this
  'F': 14,  // fee, off
  'G': 7,   // green, bag
  'HH': 15, // he, ahead
  'JH': 16, // gee, judge
  'K': 7,   // key, ache
  'L': 18,  // lee, all
  'M': 2,   // me, him
  'N': 9,   // knee, on
  'NG': 10, // ping, sing
  'P': 2,   // pee, up
  'R': 17,  // read, car
  'S': 11,  // sea, miss
  'SH': 12, // she, ash
  'T': 8,   // tea, at
  'TH': 13, // theta, math
  'V': 14,  // vee, love
  'W': 4,   // we, away
  'Y': 19,  // yield, yes
  'Z': 11,  // zee, zoo
  'ZH': 12, // seizure, measure
};

// Special phonemes by language (from your Special phonemes.txt)
const LANGUAGE_SPECIAL_PHONEMES = {
  en: ['ch', 'sh', 'th', 'ng', 'oy', 'ow', 'ay', 'ee', 'oi', 'ar', 'or', 'er', 'aw'],
  es: ['ny', 'rr', 'eu'],  // ñ sound, rolled r
  fr: ['sh', 'ny', 'oe', 'wa', 'zh'],  // French sounds
  de: ['kh', 'sh', 'sht', 'shp', 'oy', 'aw'],  // German sounds
  it: ['ch', 'sh', 'ts', 'ny', 'ly', 'ai', 'ei', 'oi', 'ui', 'au', 'eu'],
  pt: ['sh', 'ny', 'ly', 'zh', 'ai', 'ei', 'oi', 'ui', 'au', 'eu'],
  zh: ['zh', 'ch', 'sh', 'dz', 'ts', 'ng', 'ang', 'eng', 'ing', 'ong'],
  ja: ['sh', 'ch', 'ts', 'zu', 'fu'],
  ar: ['sh', 'th', 'gh', 'kh', 'dh', 'zh', 'q', 'ai', 'au'],
  hi: ['sh', 'ch', 'th', 'dh', 'kh', 'gh', 'ph', 'bh', 'ny', 'ng', 'ai', 'au'],
};

// Punctuation pause durations (in animation frames at 30fps)
const PUNCTUATION_PAUSE = {
  ',': 6,   // ~200ms pause for comma
  '.': 10,  // ~333ms pause for period
  '!': 10,  // ~333ms pause for exclamation
  '?': 10,  // ~333ms pause for question
  ';': 8,   // ~266ms pause for semicolon
  ':': 6,   // ~200ms pause for colon
  '-': 3,   // ~100ms pause for hyphen
  '—': 6,   // ~200ms pause for em-dash
};

// Get pronunciation from CMU dictionary
export const getWordPronunciation = (word) => {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return null;
  
  // Check CMU dictionary
  const pronunciation = cmudict[cleaned];
  if (pronunciation) {
    return pronunciation.split(' ');
  }
  
  return null;
};

// Convert ARPABET phoneme to frame number
export const arpabetToFrame = (phoneme) => {
  // Remove stress markers (0, 1, 2)
  const base = phoneme.replace(/[0-2]$/, '');
  return ARPABET_TO_FRAME[base] ?? ARPABET_TO_FRAME[phoneme] ?? 0;
};

// Fallback: Convert a single letter/sound to frame
const simpleLetterToFrame = (char) => {
  const map = {
    'a': 1, 'e': 5, 'i': 3, 'o': 4, 'u': 1,
    'b': 2, 'c': 7, 'd': 8, 'f': 14, 'g': 7,
    'h': 15, 'j': 16, 'k': 7, 'l': 18, 'm': 2,
    'n': 9, 'p': 2, 'q': 7, 'r': 17, 's': 11,
    't': 8, 'v': 14, 'w': 4, 'x': 7, 'y': 19, 'z': 11,
  };
  return map[char.toLowerCase()] ?? 0;
};

// Fallback phonetic rules for words not in CMU dictionary
const fallbackToPhonemes = (word) => {
  const result = [];
  const lower = word.toLowerCase();
  let i = 0;
  
  // Common patterns
  const patterns = {
    'tion': [12, 1, 9],     // sh-uh-n
    'sion': [12, 1, 9],     // sh-uh-n
    'ious': [3, 1, 11],     // ee-uh-s
    'eous': [3, 1, 11],     // ee-uh-s
    'ough': [4],            // oh (though), or [1, 14] (cough)
    'ight': [1, 8],         // ai-t
    'ould': [4, 8],         // oo-d
    'ness': [9, 5, 11],     // n-eh-s
    'ment': [2, 5, 9, 8],   // m-eh-n-t
    'able': [1, 2, 18],     // uh-b-l
    'ible': [3, 2, 18],     // ih-b-l
    'ture': [16, 17],       // ch-er
    'sure': [12, 17],       // zh-er
    'th': [13],
    'sh': [12],
    'ch': [16],
    'ph': [14],
    'wh': [4],
    'ck': [7],
    'ng': [10],
    'qu': [7, 4],           // kw
    'ee': [3],
    'ea': [3],
    'oo': [4],
    'ou': [4],
    'ow': [4],
    'ai': [1],
    'ay': [1],
    'ey': [3],
    'ie': [3],
    'oa': [4],
    'oe': [4],
    'ue': [4],
    'au': [4],
    'aw': [4],
  };
  
  while (i < lower.length) {
    let matched = false;
    
    // Try matching patterns (longest first)
    for (let len = 4; len >= 2; len--) {
      if (i + len <= lower.length) {
        const segment = lower.substring(i, i + len);
        if (patterns[segment]) {
          result.push(...patterns[segment]);
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
      const frame = simpleLetterToFrame(lower[i]);
      if (frame > 0) {
        result.push(frame);
      }
      i++;
    }
  }
  
  return result;
};

// Convert text to phoneme/frame sequence using CMU dictionary
export const textToVisemeSequence = (text) => {
  const result = [];
  const words = text.split(/(\s+|[,.!?;:—-])/);
  
  for (const segment of words) {
    if (!segment) continue;
    
    // Check for punctuation
    const trimmed = segment.trim();
    if (PUNCTUATION_PAUSE[trimmed]) {
      result.push({
        type: 'pause',
        duration: PUNCTUATION_PAUSE[trimmed],
        frame: 0,
        phoneme: trimmed,
      });
      continue;
    }
    
    // Skip whitespace
    if (/^\s+$/.test(segment)) {
      // Small pause between words
      result.push({
        type: 'pause',
        duration: 2,
        frame: 0,
        phoneme: '_',
      });
      continue;
    }
    
    // Get pronunciation from CMU dictionary
    const pronunciation = getWordPronunciation(segment);
    
    if (pronunciation) {
      // CMU dictionary has this word
      for (const arpabet of pronunciation) {
        const frame = arpabetToFrame(arpabet);
        const isVowel = /[AEIOU]/.test(arpabet);
        result.push({
          type: 'phoneme',
          frame,
          phoneme: arpabet,
          isVowel,
          duration: isVowel ? 4 : 2, // Vowels hold longer
        });
      }
    } else {
      // Fallback to rule-based conversion
      const frames = fallbackToPhonemes(segment);
      for (const frame of frames) {
        const isVowel = [1, 3, 4, 5, 6].includes(frame);
        result.push({
          type: 'phoneme',
          frame,
          phoneme: segment,
          isVowel,
          duration: isVowel ? 4 : 2,
        });
      }
    }
  }
  
  return result;
};

// Build animation timeline from viseme sequence
export const buildAnimationTimeline = (visemeSequence) => {
  const timeline = [];
  
  // Start from neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'start' });
  
  let prevFrame = 0;
  
  for (const item of visemeSequence) {
    if (item.type === 'pause') {
      // Hold at neutral for punctuation pause
      timeline.push({
        frame: 0,
        phoneme: item.phoneme,
        duration: item.duration,
        type: 'pause',
      });
      prevFrame = 0;
      continue;
    }
    
    // Add smooth transition if frame changes significantly
    if (Math.abs(item.frame - prevFrame) > 3 && prevFrame !== 0) {
      // Add intermediate transition frame
      timeline.push({
        frame: item.frame,
        phoneme: item.phoneme,
        duration: 1,
        type: 'transition',
      });
    }
    
    // Approach
    timeline.push({
      frame: item.frame,
      phoneme: item.phoneme,
      duration: 1,
      type: 'approach',
    });
    
    // Apex - hold at the phoneme
    timeline.push({
      frame: item.frame,
      phoneme: item.phoneme,
      duration: item.duration,
      type: 'apex',
    });
    
    prevFrame = item.frame;
  }
  
  // Return to neutral
  if (prevFrame !== 0) {
    timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'depart' });
  }
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'end' });
  
  return timeline;
};

// Letter Practice - pronunciation for individual letters
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
  'y': { frames: [19, 1], audioLabel: 'ya', display: 'ya' },
  'z': { frames: [11, 1], audioLabel: 'za', display: 'za' },
};

// Build timeline for single letter
export const buildLetterTimeline = (letter) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  if (!pronunciation) {
    return [{ frame: 0, phoneme: '_', duration: 5, type: 'neutral' }];
  }

  const timeline = [];
  const { frames, display } = pronunciation;
  
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'start' });
  
  frames.forEach((frame, idx) => {
    const isLast = idx === frames.length - 1;
    const isVowel = [1, 3, 4, 5, 6].includes(frame);
    
    timeline.push({ frame, phoneme: display, duration: 2, type: 'approach' });
    
    const holdDuration = isVowel || isLast ? 6 : 3;
    timeline.push({ frame, phoneme: display, duration: holdDuration, type: 'apex' });
  });
  
  timeline.push({ frame: 0, phoneme: '_', duration: 3, type: 'end' });
  
  return timeline;
};

// Build timeline for word/sentence (Word Practice)
export const buildWordTimeline = (text) => {
  const visemeSequence = textToVisemeSequence(text);
  return buildAnimationTimeline(visemeSequence);
};

// Get display label for a letter
export const getLetterDisplay = (letter) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  return pronunciation ? pronunciation.display : letter;
};

// Audio path for letter pronunciation
export const getPhonemeAudioPath = (letter, lang) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  const audioLabel = pronunciation ? pronunciation.audioLabel : 'ah';
  const langCode = lang.split('-')[0];
  return `/assets/audio/phonemes/${langCode}-${audioLabel}.mp3`;
};

// Frame info lookup
export const getFrameInfo = (frameNum) => {
  return FRAME_PHONEMES[frameNum] || FRAME_PHONEMES[0];
};

// Legacy compatibility
export const textToPhonemes = (text) => {
  const sequence = textToVisemeSequence(text);
  return sequence.filter(s => s.type !== 'pause').map(s => s.phoneme);
};

export const wordToPhonemes = textToPhonemes;

// Digraph mapping for display
export const DIGRAPHS = {
  'll': 19, 'sh': 12, 'ch': 16, 'th': 13, 'ng': 10,
  'ph': 14, 'wh': 4, 'ck': 7, 'gh': 0,
};

export const LETTER_TO_FRAME = {
  'a': 1, 'b': 2, 'c': 7, 'd': 8, 'e': 5, 'f': 14, 'g': 7, 'h': 15,
  'i': 3, 'j': 16, 'k': 7, 'l': 18, 'm': 2, 'n': 9, 'o': 4, 'p': 2,
  'q': 7, 'r': 17, 's': 11, 't': 8, 'u': 1, 'v': 14, 'w': 4, 'x': 7,
  'y': 19, 'z': 11,
};
