// ========== SIMPLE PHONETIC ENGINE ==========
// Human-readable phonetics: "excuse" → "eks-kyooz", not ARPABET
// Fast, smooth animations

export const FRAME_WIDTH = 939;
export const FRAME_HEIGHT = 793;
export const TOTAL_FRAMES = 20;
export const TARGET_FPS = 30;
export const FRAME_DURATION_MS = 1000 / TARGET_FPS;

// Timing
export const LETTER_PRACTICE_DELAY_MS = 1000;

// Simple phoneme to frame mapping
const PHONEME_FRAMES = {
  // Vowels
  'a': 1, 'ah': 1, 'uh': 1,
  'ee': 3, 'i': 3,
  'oo': 4, 'o': 4, 'u': 4, 'w': 4,
  'e': 5, 'eh': 5,
  'y': 6,
  
  // Consonants
  'b': 2, 'p': 2, 'm': 2,
  'k': 7, 'g': 7, 'c': 7, 'q': 7,
  't': 8, 'd': 8,
  'n': 9,
  'ng': 10,
  's': 11, 'z': 11, 'x': 11,
  'sh': 12, 'zh': 12,
  'th': 13,
  'f': 14, 'v': 14,
  'h': 15,
  'ch': 16, 'j': 16,
  'r': 17,
  'l': 18,
  'll': 19,
  
  // Neutral
  '_': 0, ' ': 0,
};

// Simple word to phoneme breakdown (human readable)
const SIMPLE_PRONUNCIATIONS = {
  // Common words - simple phonetic spelling
  'the': ['th', 'uh'],
  'a': ['uh'],
  'an': ['a', 'n'],
  'is': ['i', 'z'],
  'are': ['ah', 'r'],
  'was': ['w', 'ah', 'z'],
  'were': ['w', 'er'],
  'be': ['b', 'ee'],
  'been': ['b', 'i', 'n'],
  'being': ['b', 'ee', 'i', 'ng'],
  'have': ['h', 'a', 'v'],
  'has': ['h', 'a', 'z'],
  'had': ['h', 'a', 'd'],
  'do': ['d', 'oo'],
  'does': ['d', 'uh', 'z'],
  'did': ['d', 'i', 'd'],
  'will': ['w', 'i', 'l'],
  'would': ['w', 'oo', 'd'],
  'could': ['k', 'oo', 'd'],
  'should': ['sh', 'oo', 'd'],
  'can': ['k', 'a', 'n'],
  'may': ['m', 'ay'],
  'might': ['m', 'ai', 't'],
  'must': ['m', 'uh', 's', 't'],
  'shall': ['sh', 'a', 'l'],
  
  // User's examples
  'excuse': ['x', 'k', 'y', 'oo', 'z'],
  'me': ['m', 'ee'],
  'hello': ['h', 'e', 'l', 'o'],
  'beautiful': ['b', 'y', 'oo', 't', 'i', 'f', 'oo', 'l'],
  'apple': ['a', 'p', 'l'],
  'pronunciation': ['p', 'r', 'o', 'n', 'uh', 'n', 's', 'ee', 'ay', 'sh', 'uh', 'n'],
  'thank': ['th', 'a', 'ng', 'k'],
  'you': ['y', 'oo'],
  'please': ['p', 'l', 'ee', 'z'],
  'sorry': ['s', 'ah', 'r', 'ee'],
  'yes': ['y', 'e', 's'],
  'no': ['n', 'o'],
  'good': ['g', 'oo', 'd'],
  'bad': ['b', 'a', 'd'],
  'great': ['g', 'r', 'ay', 't'],
  'nice': ['n', 'ai', 's'],
  'love': ['l', 'uh', 'v'],
  'like': ['l', 'ai', 'k'],
  'want': ['w', 'ah', 'n', 't'],
  'need': ['n', 'ee', 'd'],
  'know': ['n', 'o'],
  'think': ['th', 'i', 'ng', 'k'],
  'see': ['s', 'ee'],
  'look': ['l', 'oo', 'k'],
  'come': ['k', 'uh', 'm'],
  'go': ['g', 'o'],
  'get': ['g', 'e', 't'],
  'make': ['m', 'ay', 'k'],
  'take': ['t', 'ay', 'k'],
  'give': ['g', 'i', 'v'],
  'say': ['s', 'ay'],
  'tell': ['t', 'e', 'l'],
  'ask': ['a', 's', 'k'],
  'use': ['y', 'oo', 'z'],
  'find': ['f', 'ai', 'n', 'd'],
  'put': ['p', 'oo', 't'],
  'try': ['t', 'r', 'ai'],
  'leave': ['l', 'ee', 'v'],
  'call': ['k', 'ah', 'l'],
  'feel': ['f', 'ee', 'l'],
  'become': ['b', 'ee', 'k', 'uh', 'm'],
  'keep': ['k', 'ee', 'p'],
  'let': ['l', 'e', 't'],
  'begin': ['b', 'ee', 'g', 'i', 'n'],
  'seem': ['s', 'ee', 'm'],
  'help': ['h', 'e', 'l', 'p'],
  'show': ['sh', 'o'],
  'hear': ['h', 'ee', 'r'],
  'play': ['p', 'l', 'ay'],
  'run': ['r', 'uh', 'n'],
  'move': ['m', 'oo', 'v'],
  'live': ['l', 'i', 'v'],
  'believe': ['b', 'ee', 'l', 'ee', 'v'],
  'hold': ['h', 'o', 'l', 'd'],
  'bring': ['b', 'r', 'i', 'ng'],
  'happen': ['h', 'a', 'p', 'n'],
  'write': ['r', 'ai', 't'],
  'provide': ['p', 'r', 'o', 'v', 'ai', 'd'],
  'sit': ['s', 'i', 't'],
  'stand': ['s', 't', 'a', 'n', 'd'],
  'lose': ['l', 'oo', 'z'],
  'pay': ['p', 'ay'],
  'meet': ['m', 'ee', 't'],
  'include': ['i', 'n', 'k', 'l', 'oo', 'd'],
  'continue': ['k', 'uh', 'n', 't', 'i', 'n', 'y', 'oo'],
  'set': ['s', 'e', 't'],
  'learn': ['l', 'er', 'n'],
  'change': ['ch', 'ay', 'n', 'j'],
  'lead': ['l', 'ee', 'd'],
  'understand': ['uh', 'n', 'd', 'er', 's', 't', 'a', 'n', 'd'],
  'watch': ['w', 'ah', 'ch'],
  'follow': ['f', 'ah', 'l', 'o'],
  'stop': ['s', 't', 'ah', 'p'],
  'create': ['k', 'r', 'ee', 'ay', 't'],
  'speak': ['s', 'p', 'ee', 'k'],
  'read': ['r', 'ee', 'd'],
  'spend': ['s', 'p', 'e', 'n', 'd'],
  'grow': ['g', 'r', 'o'],
  'open': ['o', 'p', 'n'],
  'walk': ['w', 'ah', 'k'],
  'win': ['w', 'i', 'n'],
  'offer': ['ah', 'f', 'er'],
  'remember': ['r', 'ee', 'm', 'e', 'm', 'b', 'er'],
  'consider': ['k', 'uh', 'n', 's', 'i', 'd', 'er'],
  'appear': ['uh', 'p', 'ee', 'r'],
  'buy': ['b', 'ai'],
  'wait': ['w', 'ay', 't'],
  'serve': ['s', 'er', 'v'],
  'die': ['d', 'ai'],
  'send': ['s', 'e', 'n', 'd'],
  'expect': ['x', 'p', 'e', 'k', 't'],
  'build': ['b', 'i', 'l', 'd'],
  'stay': ['s', 't', 'ay'],
  'fall': ['f', 'ah', 'l'],
  'cut': ['k', 'uh', 't'],
  'reach': ['r', 'ee', 'ch'],
  'kill': ['k', 'i', 'l'],
  'remain': ['r', 'ee', 'm', 'ay', 'n'],
};

// Simple letter-based fallback
const letterToPhoneme = (word) => {
  const result = [];
  const lower = word.toLowerCase();
  let i = 0;
  
  // Common patterns
  const patterns = {
    'tion': ['sh', 'n'],
    'sion': ['zh', 'n'],
    'ough': ['o'],
    'ight': ['ai', 't'],
    'ould': ['oo', 'd'],
    'th': ['th'],
    'sh': ['sh'],
    'ch': ['ch'],
    'ng': ['ng'],
    'ph': ['f'],
    'wh': ['w'],
    'ck': ['k'],
    'qu': ['k', 'w'],
    'ee': ['ee'],
    'ea': ['ee'],
    'oo': ['oo'],
    'ou': ['ow'],
    'ow': ['o'],
    'ai': ['ay'],
    'ay': ['ay'],
    'ey': ['ay'],
    'ie': ['ee'],
    'oa': ['o'],
    'ue': ['oo'],
    'au': ['aw'],
    'aw': ['aw'],
  };
  
  while (i < lower.length) {
    let matched = false;
    
    for (let len = 4; len >= 2; len--) {
      if (i + len <= lower.length) {
        const seg = lower.substring(i, i + len);
        if (patterns[seg]) {
          result.push(...patterns[seg]);
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
      const c = lower[i];
      if (c !== ' ' && PHONEME_FRAMES[c] !== undefined) {
        result.push(c);
      } else if (c === 'x') {
        result.push('x');
      }
      i++;
    }
  }
  
  return result;
};

// Get phonemes for a word
export const getWordPhonemes = (word) => {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!lower) return [];
  
  // Check our simple dictionary first
  if (SIMPLE_PRONUNCIATIONS[lower]) {
    return SIMPLE_PRONUNCIATIONS[lower];
  }
  
  // Fallback to letter-based
  return letterToPhoneme(lower);
};

// Get frame for phoneme
export const getFrameForPhoneme = (phoneme) => {
  return PHONEME_FRAMES[phoneme] ?? PHONEME_FRAMES[phoneme.toLowerCase()] ?? 0;
};

// Punctuation pauses (in frames)
const PUNCTUATION_PAUSE = {
  ',': 6,
  '.': 8,
  '!': 8,
  '?': 8,
};

// Build Word Practice timeline - FAST version
export const buildWordTimeline = (text) => {
  const timeline = [];
  const words = text.split(/(\s+|[,.!?])/);
  
  // Start neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'start' });
  
  for (const segment of words) {
    if (!segment) continue;
    const trimmed = segment.trim();
    
    // Punctuation
    if (PUNCTUATION_PAUSE[trimmed]) {
      timeline.push({
        frame: 0,
        phoneme: trimmed,
        duration: PUNCTUATION_PAUSE[trimmed],
        type: 'pause',
      });
      continue;
    }
    
    // Space between words
    if (/^\s+$/.test(segment)) {
      timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'space' });
      continue;
    }
    
    // Get phonemes
    const phonemes = getWordPhonemes(segment);
    let prevFrame = -1;
    
    for (const p of phonemes) {
      const frame = getFrameForPhoneme(p);
      
      // Skip if same frame as previous (condense)
      if (frame === prevFrame) continue;
      
      const isVowel = [1, 3, 4, 5, 6].includes(frame);
      
      // Quick hold - vowels 3 frames, consonants 2 frames
      timeline.push({
        frame,
        phoneme: p,
        duration: isVowel ? 3 : 2,
        type: 'hold',
      });
      
      prevFrame = frame;
    }
  }
  
  // End neutral
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'end' });
  
  return timeline;
};

// Letter Practice
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

export const buildLetterTimeline = (letter) => {
  const pronunciation = LETTER_PRONUNCIATION[letter.toLowerCase()];
  if (!pronunciation) {
    return [{ frame: 0, phoneme: '_', duration: 10, type: 'neutral' }];
  }

  const timeline = [];
  const { frames, display } = pronunciation;
  
  timeline.push({ frame: 0, phoneme: '_', duration: 3, type: 'start' });
  
  frames.forEach((frame, idx) => {
    const isLast = idx === frames.length - 1;
    const isVowel = [1, 3, 4, 5, 6].includes(frame);
    
    timeline.push({ frame, phoneme: display, duration: 3, type: 'approach' });
    
    const holdDuration = isVowel || isLast ? 10 : 5;
    timeline.push({ frame, phoneme: display, duration: holdDuration, type: 'hold' });
  });
  
  timeline.push({ frame: 0, phoneme: '_', duration: 4, type: 'end' });
  
  return timeline;
};

// Frame info
export const FRAME_PHONEMES = {
  0: { name: 'neutral', description: 'Rest' },
  1: { name: 'a', description: '/a/ ah' },
  2: { name: 'b_p_m', description: '/b,p,m/' },
  3: { name: 'ee', description: '/ee/' },
  4: { name: 'oo', description: '/oo,o/' },
  5: { name: 'e', description: '/e/' },
  6: { name: 'y', description: '/y/' },
  7: { name: 'k_g', description: '/k,g/' },
  8: { name: 't_d', description: '/t,d/' },
  9: { name: 'n', description: '/n/' },
  10: { name: 'ng', description: '/ng/' },
  11: { name: 's_z', description: '/s,z/' },
  12: { name: 'sh', description: '/sh/' },
  13: { name: 'th', description: '/th/' },
  14: { name: 'f_v', description: '/f,v/' },
  15: { name: 'h', description: '/h/' },
  16: { name: 'ch_j', description: '/ch,j/' },
  17: { name: 'r', description: '/r/' },
  18: { name: 'l', description: '/l/' },
  19: { name: 'll', description: '/ll/' },
};

export const getFrameInfo = (frameNum) => FRAME_PHONEMES[frameNum] || FRAME_PHONEMES[0];
export const getLetterDisplay = (letter) => LETTER_PRONUNCIATION[letter.toLowerCase()]?.display || letter;
export const getPhonemeAudioPath = (letter, lang) => {
  const p = LETTER_PRONUNCIATION[letter.toLowerCase()];
  return `/assets/audio/phonemes/${lang.split('-')[0]}-${p?.audioLabel || 'ah'}.mp3`;
};

// Legacy exports
export const textToPhonemes = (text) => {
  const words = text.split(/\s+/);
  return words.flatMap(w => getWordPhonemes(w));
};
export const wordToPhonemes = textToPhonemes;
export const DIGRAPHS = { 'll': 19, 'sh': 12, 'ch': 16, 'th': 13, 'ng': 10, 'ph': 14, 'wh': 4, 'ck': 7 };
export const LETTER_TO_FRAME = { 'a': 1, 'b': 2, 'c': 7, 'd': 8, 'e': 5, 'f': 14, 'g': 7, 'h': 15, 'i': 3, 'j': 16, 'k': 7, 'l': 18, 'm': 2, 'n': 9, 'o': 4, 'p': 2, 'q': 7, 'r': 17, 's': 11, 't': 8, 'u': 1, 'v': 14, 'w': 4, 'x': 11, 'y': 6, 'z': 11 };
