// ========== UNIVERSAL VISEME ENGINE ==========
// 20 mouth shapes = COMPLETE library
// Every sound in ANY language maps to ONE of these

export const FRAME_WIDTH = 939;
export const FRAME_HEIGHT = 793;
export const TOTAL_FRAMES = 20;
export const TARGET_FPS = 30;
export const FRAME_DURATION_MS = 1000 / TARGET_FPS;
export const LETTER_PRACTICE_DELAY_MS = 1000;

// ========== THE 20 VISEME FRAMES ==========
export const VISEME_LIBRARY = {
  0:  { id: 'neutral', label: 'silence' },
  1:  { id: 'aa', label: 'ah/uh' },        // Open mouth - father, but
  2:  { id: 'bpm', label: 'b/p/m' },       // Lips closed
  3:  { id: 'ee', label: 'ee/i' },         // Wide smile - see, bit
  4:  { id: 'oo', label: 'oo/o/w' },       // Rounded - food, go, we
  5:  { id: 'eh', label: 'e' },            // Slightly open - bed
  6:  { id: 'y', label: 'y/ā' },           // Front rounded + long A diphthong
  7:  { id: 'kg', label: 'k/g' },          // Back tongue
  8:  { id: 'td', label: 't/d' },          // Tongue tip
  9:  { id: 'n', label: 'n' },             // Nasal
  10: { id: 'ng', label: 'ng' },           // Back nasal
  11: { id: 'sz', label: 's/z' },          // Hiss
  12: { id: 'sh', label: 'sh/zh' },        // Pushed out
  13: { id: 'th', label: 'th' },           // Tongue between teeth
  14: { id: 'fv', label: 'f/v' },          // Teeth on lip
  15: { id: 'h', label: 'h' },             // Open breath
  16: { id: 'ch', label: 'ch/j' },         // Affricate
  17: { id: 'r', label: 'r' },             // R sound
  18: { id: 'l', label: 'l' },             // Lateral
  19: { id: 'll', label: 'll/y' },         // Welsh ll / palatal
};

// ========== PHONEME TO FRAME ==========
const SOUND_TO_FRAME = {
  // Vowels
  'a': 1, 'ah': 1, 'uh': 1, 'ə': 1,
  'aa': 1,
  'ee': 3, 'i': 3, 'ih': 3,
  'oo': 4, 'o': 4, 'oh': 4, 'w': 4,
  'e': 5, 'eh': 5,
  'y': 6, 'ā': 6, 'ay': 6,  // Long A maps here (diphthong ay)
  
  // Consonants
  'b': 2, 'p': 2, 'm': 2,
  'k': 7, 'g': 7, 'c': 7, 'q': 7,
  't': 8, 'd': 8,
  'n': 9,
  'ng': 10,
  's': 11, 'z': 11,
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

// ========== WORD-SPECIFIC PRONUNCIATIONS ==========
// Correct phonetic breakdowns for common words
const WORD_PRONUNCIATIONS = {
  // Words with tricky spellings
  'pronunciation': ['p', 'r', 'o', 'n', 'uh', 'n', 's', 'ee', 'ay', 'sh', 'n'],
  'beautiful': ['b', 'y', 'oo', 't', 'ih', 'f', 'oo', 'l'],
  'excuse': ['eh', 'k', 's', 'k', 'y', 'oo', 'z'],
  'nation': ['n', 'ay', 'sh', 'n'],
  'station': ['s', 't', 'ay', 'sh', 'n'],
  'education': ['eh', 'd', 'y', 'oo', 'k', 'ay', 'sh', 'n'],
  'information': ['ih', 'n', 'f', 'r', 'm', 'ay', 'sh', 'n'],
  'communication': ['k', 'uh', 'm', 'y', 'oo', 'n', 'ih', 'k', 'ay', 'sh', 'n'],
  'situation': ['s', 'ih', 'ch', 'oo', 'ay', 'sh', 'n'],
  'application': ['ah', 'p', 'l', 'ih', 'k', 'ay', 'sh', 'n'],
  'question': ['k', 'w', 'eh', 's', 'ch', 'n'],
  'special': ['s', 'p', 'eh', 'sh', 'l'],
  'social': ['s', 'o', 'sh', 'l'],
  'official': ['o', 'f', 'ih', 'sh', 'l'],
  'essential': ['eh', 's', 'eh', 'n', 'sh', 'l'],
  'potential': ['p', 'o', 't', 'eh', 'n', 'sh', 'l'],
  'initial': ['ih', 'n', 'ih', 'sh', 'l'],
  'financial': ['f', 'ih', 'n', 'ah', 'n', 'sh', 'l'],
  'commercial': ['k', 'uh', 'm', 'r', 'sh', 'l'],
  'ancient': ['ay', 'n', 'sh', 'n', 't'],
  'patient': ['p', 'ay', 'sh', 'n', 't'],
  'efficient': ['eh', 'f', 'ih', 'sh', 'n', 't'],
  'sufficient': ['s', 'uh', 'f', 'ih', 'sh', 'n', 't'],
  'science': ['s', 'ai', 'n', 's'],
  'ocean': ['o', 'sh', 'n'],
  'machine': ['m', 'uh', 'sh', 'ee', 'n'],
  'sure': ['sh', 'oo', 'r'],
  'sugar': ['sh', 'oo', 'g', 'r'],
  'measure': ['m', 'eh', 'zh', 'r'],
  'pleasure': ['p', 'l', 'eh', 'zh', 'r'],
  'treasure': ['t', 'r', 'eh', 'zh', 'r'],
  'vision': ['v', 'ih', 'zh', 'n'],
  'decision': ['d', 'ih', 's', 'ih', 'zh', 'n'],
  'television': ['t', 'eh', 'l', 'ih', 'v', 'ih', 'zh', 'n'],
  'conclusion': ['k', 'n', 'k', 'l', 'oo', 'zh', 'n'],
  'confusion': ['k', 'n', 'f', 'y', 'oo', 'zh', 'n'],
  
  // Words with silent letters
  'know': ['n', 'o'],
  'knife': ['n', 'ai', 'f'],
  'knight': ['n', 'ai', 't'],
  'write': ['r', 'ai', 't'],
  'wrong': ['r', 'ah', 'ng'],
  'listen': ['l', 'ih', 's', 'n'],
  'castle': ['k', 'ah', 's', 'l'],
  'island': ['ai', 'l', 'n', 'd'],
  'debris': ['d', 'uh', 'b', 'r', 'ee'],
  'subtle': ['s', 'uh', 't', 'l'],
  'doubt': ['d', 'ow', 't'],
  'debt': ['d', 'eh', 't'],
  'climb': ['k', 'l', 'ai', 'm'],
  'comb': ['k', 'o', 'm'],
  'thumb': ['th', 'uh', 'm'],
  'lamb': ['l', 'ah', 'm'],
  'salmon': ['s', 'ah', 'm', 'n'],
  'column': ['k', 'ah', 'l', 'm'],
  'autumn': ['ah', 't', 'm'],
  'hymn': ['h', 'ih', 'm'],
  
  // Common words
  'the': ['th', 'uh'],
  'a': ['uh'],
  'is': ['ih', 'z'],
  'are': ['ah', 'r'],
  'was': ['w', 'ah', 'z'],
  'were': ['w', 'r'],
  'have': ['h', 'ah', 'v'],
  'has': ['h', 'ah', 'z'],
  'do': ['d', 'oo'],
  'does': ['d', 'uh', 'z'],
  'would': ['w', 'oo', 'd'],
  'could': ['k', 'oo', 'd'],
  'should': ['sh', 'oo', 'd'],
  'you': ['y', 'oo'],
  'your': ['y', 'oo', 'r'],
  'they': ['th', 'ay'],
  'their': ['th', 'eh', 'r'],
  'there': ['th', 'eh', 'r'],
  'what': ['w', 'ah', 't'],
  'where': ['w', 'eh', 'r'],
  'when': ['w', 'eh', 'n'],
  'which': ['w', 'ih', 'ch'],
  'who': ['h', 'oo'],
  'how': ['h', 'ow'],
  'why': ['w', 'ai'],
  'this': ['th', 'ih', 's'],
  'that': ['th', 'ah', 't'],
  'these': ['th', 'ee', 'z'],
  'those': ['th', 'o', 'z'],
  'come': ['k', 'uh', 'm'],
  'some': ['s', 'uh', 'm'],
  'one': ['w', 'uh', 'n'],
  'once': ['w', 'uh', 'n', 's'],
  'only': ['o', 'n', 'l', 'ee'],
  'other': ['uh', 'th', 'r'],
  'people': ['p', 'ee', 'p', 'l'],
  'because': ['b', 'ee', 'k', 'ah', 'z'],
  'through': ['th', 'r', 'oo'],
  'thought': ['th', 'ah', 't'],
  'though': ['th', 'o'],
  'enough': ['ee', 'n', 'uh', 'f'],
  'tough': ['t', 'uh', 'f'],
  'cough': ['k', 'ah', 'f'],
  'laugh': ['l', 'ah', 'f'],
  'daughter': ['d', 'ah', 't', 'r'],
  'caught': ['k', 'ah', 't'],
  'taught': ['t', 'ah', 't'],
  'bought': ['b', 'ah', 't'],
  'brought': ['b', 'r', 'ah', 't'],
  'thought': ['th', 'ah', 't'],
  'fought': ['f', 'ah', 't'],
  'sought': ['s', 'ah', 't'],
  'eight': ['ay', 't'],
  'weight': ['w', 'ay', 't'],
  'height': ['h', 'ai', 't'],
  'neighbor': ['n', 'ay', 'b', 'r'],
  'weigh': ['w', 'ay'],
  'sleigh': ['s', 'l', 'ay'],
  'receive': ['r', 'ee', 's', 'ee', 'v'],
  'believe': ['b', 'ee', 'l', 'ee', 'v'],
  'achieve': ['uh', 'ch', 'ee', 'v'],
  'friend': ['f', 'r', 'eh', 'n', 'd'],
  'piece': ['p', 'ee', 's'],
  'chief': ['ch', 'ee', 'f'],
  'field': ['f', 'ee', 'l', 'd'],
  'yield': ['y', 'ee', 'l', 'd'],
  'shield': ['sh', 'ee', 'l', 'd'],
  'weird': ['w', 'ee', 'r', 'd'],
  'either': ['ee', 'th', 'r'],
  'neither': ['n', 'ee', 'th', 'r'],
  'foreign': ['f', 'ah', 'r', 'n'],
  'sovereign': ['s', 'ah', 'v', 'r', 'n'],
  'leisure': ['l', 'ee', 'zh', 'r'],
  'seizure': ['s', 'ee', 'zh', 'r'],
  
  // Me, hello, etc.
  'me': ['m', 'ee'],
  'be': ['b', 'ee'],
  'he': ['h', 'ee'],
  'she': ['sh', 'ee'],
  'we': ['w', 'ee'],
  'hello': ['h', 'eh', 'l', 'o'],
  'hi': ['h', 'ai'],
  'yes': ['y', 'eh', 's'],
  'no': ['n', 'o'],
  'thank': ['th', 'ah', 'ng', 'k'],
  'thanks': ['th', 'ah', 'ng', 'k', 's'],
  'please': ['p', 'l', 'ee', 'z'],
  'sorry': ['s', 'ah', 'r', 'ee'],
  'good': ['g', 'oo', 'd'],
  'great': ['g', 'r', 'ay', 't'],
  'nice': ['n', 'ai', 's'],
  'love': ['l', 'uh', 'v'],
  'like': ['l', 'ai', 'k'],
  'want': ['w', 'ah', 'n', 't'],
  'need': ['n', 'ee', 'd'],
  'make': ['m', 'ay', 'k'],
  'take': ['t', 'ay', 'k'],
  'give': ['g', 'ih', 'v'],
  'say': ['s', 'ay'],
  'said': ['s', 'eh', 'd'],
  'go': ['g', 'o'],
  'went': ['w', 'eh', 'n', 't'],
  'gone': ['g', 'ah', 'n'],
  'see': ['s', 'ee'],
  'saw': ['s', 'ah'],
  'seen': ['s', 'ee', 'n'],
  'look': ['l', 'oo', 'k'],
  'find': ['f', 'ai', 'n', 'd'],
  'found': ['f', 'ow', 'n', 'd'],
  'use': ['y', 'oo', 'z'],
  'used': ['y', 'oo', 'z', 'd'],
};

// ========== PHONETIC PATTERNS ==========
// Order matters - longer patterns first
const PHONETIC_PATTERNS = [
  // Word endings (check first)
  ['tion', ['sh', 'n']],
  ['sion', ['zh', 'n']],
  ['cian', ['sh', 'n']],
  ['cial', ['sh', 'l']],
  ['tial', ['sh', 'l']],
  ['cious', ['sh', 's']],
  ['tious', ['sh', 's']],
  ['ious', ['ee', 's']],
  ['eous', ['ee', 's']],
  ['ture', ['ch', 'r']],
  ['sure', ['zh', 'r']],
  
  // Soft C and G
  ['ce', ['s']],
  ['ci', ['s']],
  ['cy', ['s']],
  ['ge', ['j']],
  ['gi', ['j']],
  ['gy', ['j']],
  
  // Digraphs
  ['th', ['th']],
  ['sh', ['sh']],
  ['ch', ['ch']],
  ['ph', ['f']],
  ['wh', ['w']],
  ['ck', ['k']],
  ['ng', ['ng']],
  ['qu', ['k', 'w']],
  ['gh', []],  // Usually silent
  ['kn', ['n']],
  ['wr', ['r']],
  ['gn', ['n']],
  ['mb', ['m']],
  ['mn', ['m']],
  
  // Long vowels with silent e (handled contextually)
  ['a_e', ['ay']],
  ['e_e', ['ee']],
  ['i_e', ['ai']],
  ['o_e', ['o']],
  ['u_e', ['oo']],
  
  // Vowel combinations
  ['ea', ['ee']],
  ['ee', ['ee']],
  ['ie', ['ee']],
  ['ei', ['ay']],
  ['ey', ['ay']],
  ['ai', ['ay']],
  ['ay', ['ay']],
  ['oa', ['o']],
  ['oe', ['o']],
  ['oo', ['oo']],
  ['ou', ['ow']],
  ['ow', ['ow']],
  ['ue', ['oo']],
  ['ew', ['oo']],
  ['au', ['ah']],
  ['aw', ['ah']],
  ['oi', ['oy']],
  ['oy', ['oy']],
  
  // ough patterns
  ['ough', ['o']],
  ['ight', ['ai', 't']],
  ['ould', ['oo', 'd']],
];

// ========== GET FRAME FOR SOUND ==========
export const getFrameForSound = (sound) => {
  if (!sound) return 0;
  const s = sound.toLowerCase();
  
  // Direct lookup
  if (SOUND_TO_FRAME[s] !== undefined) return SOUND_TO_FRAME[s];
  
  // Special cases
  if (s === 'ai' || s === 'ay' || s === 'ā') return 6;  // Long A
  if (s === 'ow' || s === 'ou') return 4;  // "ow" sound
  if (s === 'oy' || s === 'oi') return 4;  // "oy" sound
  
  return 0;
};

// ========== CONVERT WORD TO PHONEME SEQUENCE ==========
export const wordToPhonemeSequence = (word) => {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!lower) return [];
  
  // Check word dictionary first
  if (WORD_PRONUNCIATIONS[lower]) {
    return WORD_PRONUNCIATIONS[lower];
  }
  
  // Pattern-based conversion
  const result = [];
  let i = 0;
  
  while (i < lower.length) {
    let matched = false;
    
    // Try patterns (longest first handled by array order)
    for (const [pattern, sounds] of PHONETIC_PATTERNS) {
      if (lower.substring(i).startsWith(pattern)) {
        if (sounds.length > 0) {
          result.push(...sounds);
        }
        i += pattern.length;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // Silent e at end
      if (lower[i] === 'e' && i === lower.length - 1 && i > 0) {
        // Check if previous vowel should be long
        // (simplified - just skip the e)
        i++;
        continue;
      }
      
      // Single letter
      const char = lower[i];
      if (SOUND_TO_FRAME[char] !== undefined) {
        result.push(char);
      }
      i++;
    }
  }
  
  return result;
};

// ========== CONVERT TEXT TO VISEME SEQUENCE ==========
export const textToVisemes = (text) => {
  const result = [];
  const words = text.split(/\s+/);
  
  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi].replace(/[^a-zA-Z]/g, '');
    if (!word) continue;
    
    const phonemes = wordToPhonemeSequence(word);
    let prevFrame = -1;
    
    for (const p of phonemes) {
      const frame = getFrameForSound(p);
      
      // Skip consecutive same frames
      if (frame !== prevFrame) {
        result.push({ frame, sound: p });
        prevFrame = frame;
      }
    }
    
    // Add word break (but not after last word)
    if (wi < words.length - 1) {
      result.push({ frame: 0, sound: '_' });
    }
  }
  
  return result;
};

// ========== BUILD ANIMATION TIMELINE ==========
export const buildWordTimeline = (text) => {
  const timeline = [];
  const visemes = textToVisemes(text);
  
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'start' });
  
  for (const v of visemes) {
    if (v.frame === 0) {
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
  
  timeline.push({ frame: 0, phoneme: '_', duration: 2, type: 'end' });
  return timeline;
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
  'y': { frames: [6, 1], audioLabel: 'ya', display: 'ya' },
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
export const LETTER_TO_FRAME = {
  'a': 1, 'b': 2, 'c': 7, 'd': 8, 'e': 3, 'f': 14, 'g': 7, 'h': 15,
  'i': 3, 'j': 16, 'k': 7, 'l': 18, 'm': 2, 'n': 9, 'o': 4, 'p': 2,
  'q': 7, 'r': 17, 's': 11, 't': 8, 'u': 4, 'v': 14, 'w': 4, 'x': 11,
  'y': 6, 'z': 11,
};
