// SoundMirror Phoneme Engine
// Maps sounds to the 20 viseme frames

export const FRAME_WIDTH = 939;
export const FRAME_HEIGHT = 793;
export const TOTAL_FRAMES = 20;
export const DISPLAY_SCALE = 0.35;

// The 20 viseme frames
export const VISEMES = {
  0:  { id: 'neutral', sounds: ['_', 'silence'] },
  1:  { id: 'aa', sounds: ['a', 'ah', 'uh', 'ə'] },
  2:  { id: 'bpm', sounds: ['b', 'p', 'm'] },
  3:  { id: 'ee', sounds: ['ee', 'i', 'ih', 'e'] },
  4:  { id: 'oo', sounds: ['oo', 'o', 'oh', 'w', 'u'] },
  5:  { id: 'eh', sounds: ['eh', 'ae'] },
  6:  { id: 'y', sounds: ['y', 'ay', 'ā'] },
  7:  { id: 'kg', sounds: ['k', 'g', 'c', 'q'] },
  8:  { id: 'td', sounds: ['t', 'd', 'j'] },
  9:  { id: 'n', sounds: ['n'] },
  10: { id: 'ng', sounds: ['ng'] },
  11: { id: 'sz', sounds: ['s', 'z', 'x'] },
  12: { id: 'sh', sounds: ['sh', 'zh'] },
  13: { id: 'th', sounds: ['th'] },
  14: { id: 'fv', sounds: ['f', 'v'] },
  15: { id: 'h', sounds: ['h'] },
  16: { id: 'ch', sounds: ['ch'] },
  17: { id: 'r', sounds: ['r'] },
  18: { id: 'l', sounds: ['l'] },
  19: { id: 'll', sounds: ['ll', 'y'] },
};

// Letter to frame mapping
export const LETTER_TO_FRAME = {
  a: 1, b: 2, c: 7, d: 8, e: 5, f: 14, g: 7, h: 15,
  i: 3, j: 8, k: 7, l: 18, m: 2, n: 9, o: 4, p: 2,
  q: 7, r: 17, s: 11, t: 8, u: 4, v: 14, w: 4, x: 11,
  y: 6, z: 11,
};

// Letter to audio file mapping
export const LETTER_TO_AUDIO = {
  a: 'ah', b: 'ba', c: 'ca', d: 'da', e: 'eh', f: 'fa', g: 'ga', h: 'ha',
  i: 'ih', j: 'ja', k: 'ka', l: 'la', m: 'ma', n: 'na', o: 'oh', p: 'pa',
  q: 'kwa', r: 'ra', s: 'sa', t: 'ta', u: 'uh', v: 'va', w: 'wa', x: 'sa',
  y: 'ya', z: 'za',
};

// Digraphs
export const DIGRAPHS = {
  'ch': { frame: 16, audio: 'cha' },
  'sh': { frame: 12, audio: 'sha' },
  'th': { frame: 13, audio: 'tha' },
  'ng': { frame: 10, audio: 'nga' },
  'll': { frame: 19, audio: 'la' },
  'wh': { frame: 4, audio: 'wa' },
};

// Get frame for a sound
export function getFrameForSound(sound) {
  const s = sound.toLowerCase();
  if (DIGRAPHS[s]) return DIGRAPHS[s].frame;
  if (LETTER_TO_FRAME[s] !== undefined) return LETTER_TO_FRAME[s];
  
  // Search visemes
  for (const [frame, viseme] of Object.entries(VISEMES)) {
    if (viseme.sounds.includes(s)) return parseInt(frame);
  }
  return 0;
}

// Get audio path for a letter
export function getAudioPath(letter, lang = 'en') {
  const l = letter.toLowerCase();
  const audio = DIGRAPHS[l]?.audio || LETTER_TO_AUDIO[l] || 'ah';
  return `/assets/audio/phonemes/${lang}-${audio}.mp3`;
}

// Convert text to phoneme sequence
export function textToPhonemes(text) {
  const result = [];
  const lower = text.toLowerCase();
  let i = 0;
  
  while (i < lower.length) {
    // Check digraphs first
    const twoChar = lower.slice(i, i + 2);
    if (DIGRAPHS[twoChar]) {
      result.push({ char: twoChar, frame: DIGRAPHS[twoChar].frame });
      i += 2;
      continue;
    }
    
    const char = lower[i];
    if (/[a-z]/.test(char)) {
      result.push({ char, frame: LETTER_TO_FRAME[char] || 0 });
    } else if (char === ' ') {
      result.push({ char: ' ', frame: 0, isPause: true });
    } else if (/[.,!?;:]/.test(char)) {
      result.push({ char, frame: 0, isPause: true, duration: 300 });
    }
    i++;
  }
  
  return result;
}

// Generate animation timeline for word
export function generateWordTimeline(text, msPerPhoneme = 150) {
  const phonemes = textToPhonemes(text);
  const timeline = [];
  let time = 0;
  
  // Start with neutral
  timeline.push({ frame: 0, start: 0, end: 100 });
  time = 100;
  
  for (const p of phonemes) {
    const duration = p.duration || msPerPhoneme;
    timeline.push({
      frame: p.frame,
      char: p.char,
      start: time,
      end: time + duration,
      isPause: p.isPause,
    });
    time += duration;
  }
  
  // End with neutral
  timeline.push({ frame: 0, start: time, end: time + 100 });
  
  return timeline;
}
