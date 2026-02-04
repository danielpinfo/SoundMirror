import { ROMANIZATION_MAP } from './constants';

// Phoneme Rules Map for 10 Languages
// Maps letter combinations (graphemes) to phonemes for correct sprite sequencing
// Rules are checked in priority order (longest first) to handle "ou" before "o"

export const PHONEME_RULES = {
  en: [
    // Consonant digraphs/trigraphs (2-3 letters)
    { pattern: "ch", phoneme: "ch" },
    { pattern: "sh", phoneme: "sh" },
    { pattern: "th", phoneme: "th" },
    { pattern: "ph", phoneme: "f" },
    { pattern: "gh", phoneme: "f" },
    { pattern: "ng", phoneme: "ng" },
    { pattern: "nk", phoneme: "ng" },
    { pattern: "ck", phoneme: "k" },
    { pattern: "tch", phoneme: "ch" },
    { pattern: "dge", phoneme: "j" },
    { pattern: "wr", phoneme: "r" },
    { pattern: "kn", phoneme: "n" },
    { pattern: "mb", phoneme: "m" },
    { pattern: "mn", phoneme: "m" },
    { pattern: "ll", phoneme: "l" },
    
    // Long vowels
    { pattern: "ai", phoneme: "e" },
    { pattern: "ay", phoneme: "e" },
    { pattern: "ei", phoneme: "e" },
    { pattern: "ea", phoneme: "ee" },
    { pattern: "ee", phoneme: "ee" },
    { pattern: "ie", phoneme: "ee" },
    { pattern: "oa", phoneme: "o" },
    { pattern: "ow", phoneme: "o" },
    { pattern: "ew", phoneme: "oo" },
    { pattern: "ue", phoneme: "oo" },
    { pattern: "oo", phoneme: "oo" },
    { pattern: "ou", phoneme: "o" },
    { pattern: "oi", phoneme: "o" },
    { pattern: "oy", phoneme: "o" },
    
    // R-controlled
    { pattern: "ar", phoneme: "a" },
    { pattern: "or", phoneme: "o" },
    { pattern: "er", phoneme: "e" },
    { pattern: "ir", phoneme: "e" },
    { pattern: "ur", phoneme: "e" },
  ],
  
  es: [
    // Spanish special letters/combinations
    { pattern: "ll", phoneme: "ll" },
    { pattern: "ñ", phoneme: "n" },
    { pattern: "ch", phoneme: "ch" },
    { pattern: "rr", phoneme: "r" },
    { pattern: "qu", phoneme: "k" },
    { pattern: "z", phoneme: "s" },
    { pattern: "ce", phoneme: "s" },
    { pattern: "ci", phoneme: "s" },
    { pattern: "gü", phoneme: "g" },
    { pattern: "gu", phoneme: "g" },
    
    // Common vowel combos
    { pattern: "ai", phoneme: "a" },
    { pattern: "ei", phoneme: "e" },
    { pattern: "oi", phoneme: "o" },
    { pattern: "au", phoneme: "a" },
    { pattern: "eu", phoneme: "e" },
  ],
  
  fr: [
    // French digraphs
    { pattern: "ch", phoneme: "sh" },
    { pattern: "ph", phoneme: "f" },
    { pattern: "th", phoneme: "t" },
    { pattern: "qu", phoneme: "k" },
    { pattern: "ç", phoneme: "s" },
    { pattern: "ge", phoneme: "j" },
    { pattern: "gi", phoneme: "j" },
    { pattern: "gn", phoneme: "n" },
    { pattern: "ll", phoneme: "y" },
    { pattern: "ss", phoneme: "s" },
    
    // Vowel combinations
    { pattern: "ai", phoneme: "e" },
    { pattern: "ei", phoneme: "e" },
    { pattern: "eu", phoneme: "oo" },
    { pattern: "oe", phoneme: "oo" },
    { pattern: "ou", phoneme: "oo" },
    { pattern: "au", phoneme: "o" },
    { pattern: "aw", phoneme: "o" },
    { pattern: "oi", phoneme: "o" },
    { pattern: "oy", phoneme: "o" },
  ],
  
  de: [
    // German digraphs
    { pattern: "ch", phoneme: "ch" },
    { pattern: "chs", phoneme: "ch" },
    { pattern: "sch", phoneme: "sh" },
    { pattern: "st", phoneme: "sh" },
    { pattern: "sp", phoneme: "sh" },
    { pattern: "ph", phoneme: "f" },
    { pattern: "pf", phoneme: "f" },
    { pattern: "qu", phoneme: "k" },
    { pattern: "tsch", phoneme: "ch" },
    { pattern: "zsch", phoneme: "sh" },
    { pattern: "ß", phoneme: "s" },
    { pattern: "ss", phoneme: "s" },
    
    // Vowel combinations
    { pattern: "ei", phoneme: "e" },
    { pattern: "ie", phoneme: "ee" },
    { pattern: "eu", phoneme: "o" },
    { pattern: "äu", phoneme: "o" },
    { pattern: "au", phoneme: "o" },
    { pattern: "aa", phoneme: "a" },
    { pattern: "ee", phoneme: "e" },
    { pattern: "oo", phoneme: "o" },
  ],
  
  it: [
    // Italian digraphs
    { pattern: "ch", phoneme: "k" },
    { pattern: "gh", phoneme: "g" },
    { pattern: "ci", phoneme: "ch" },
    { pattern: "ce", phoneme: "ch" },
    { pattern: "gi", phoneme: "j" },
    { pattern: "ge", phoneme: "j" },
    { pattern: "sc", phoneme: "sh" },
    { pattern: "sci", phoneme: "sh" },
    { pattern: "sce", phoneme: "sh" },
    { pattern: "gn", phoneme: "n" },
    { pattern: "gl", phoneme: "l" },
    { pattern: "gli", phoneme: "l" },
    { pattern: "z", phoneme: "z" },
    
    // Vowel combinations
    { pattern: "ai", phoneme: "a" },
    { pattern: "ei", phoneme: "e" },
    { pattern: "oi", phoneme: "o" },
    { pattern: "ui", phoneme: "oo" },
    { pattern: "au", phoneme: "a" },
    { pattern: "eu", phoneme: "e" },
  ],
  
  pt: [
    // Portuguese digraphs
    { pattern: "ch", phoneme: "sh" },
    { pattern: "nh", phoneme: "n" },
    { pattern: "lh", phoneme: "l" },
    { pattern: "rr", phoneme: "r" },
    { pattern: "ss", phoneme: "s" },
    { pattern: "sc", phoneme: "s" },
    { pattern: "sç", phoneme: "s" },
    { pattern: "xc", phoneme: "s" },
    { pattern: "x", phoneme: "sh" },
    { pattern: "z", phoneme: "z" },
    { pattern: "j", phoneme: "j" },
    
    // Vowel combinations
    { pattern: "ai", phoneme: "a" },
    { pattern: "ei", phoneme: "e" },
    { pattern: "oi", phoneme: "o" },
    { pattern: "ui", phoneme: "oo" },
    { pattern: "au", phoneme: "a" },
    { pattern: "eu", phoneme: "e" },
    { pattern: "ou", phoneme: "o" },
  ],
  
  zh: [
    // Chinese Pinyin (Romanized)
    { pattern: "zh", phoneme: "j" },
    { pattern: "ch", phoneme: "ch" },
    { pattern: "sh", phoneme: "sh" },
    { pattern: "q", phoneme: "ch" },
    { pattern: "x", phoneme: "sh" },
    { pattern: "z", phoneme: "z" },
    { pattern: "c", phoneme: "s" },
    { pattern: "s", phoneme: "s" },
    { pattern: "r", phoneme: "r" },
    { pattern: "ng", phoneme: "ng" },
    
    // Common syllable endings
    { pattern: "ang", phoneme: "a" },
    { pattern: "eng", phoneme: "e" },
    { pattern: "ing", phoneme: "i" },
    { pattern: "ong", phoneme: "o" },
    { pattern: "an", phoneme: "a" },
    { pattern: "en", phoneme: "e" },
    { pattern: "in", phoneme: "i" },
    { pattern: "un", phoneme: "u" },
    { pattern: "uan", phoneme: "u" },
    { pattern: "uang", phoneme: "u" },
  ],
  
  ja: [
    // Japanese Hiragana/Romaji
    { pattern: "sh", phoneme: "sh" },
    { pattern: "ch", phoneme: "ch" },
    { pattern: "ts", phoneme: "s" },
    { pattern: "zu", phoneme: "z" },
    { pattern: "di", phoneme: "d" },
    { pattern: "du", phoneme: "d" },
    { pattern: "ye", phoneme: "y" },
    { pattern: "wo", phoneme: "o" },
    { pattern: "fu", phoneme: "f" },
    
    // Double consonants
    { pattern: "kk", phoneme: "k" },
    { pattern: "tt", phoneme: "t" },
    { pattern: "pp", phoneme: "p" },
    { pattern: "ss", phoneme: "s" },
  ],
  
  hi: [
    // Hindi Devanagari (romanized)
    { pattern: "sh", phoneme: "sh" },
    { pattern: "ch", phoneme: "ch" },
    { pattern: "th", phoneme: "th" },
    { pattern: "dh", phoneme: "d" },
    { pattern: "kh", phoneme: "k" },
    { pattern: "gh", phoneme: "g" },
    { pattern: "ph", phoneme: "f" },
    { pattern: "bh", phoneme: "b" },
    { pattern: "ñ", phoneme: "n" },
    { pattern: "ng", phoneme: "ng" },
    
    // Vowel combinations
    { pattern: "ai", phoneme: "a" },
    { pattern: "au", phoneme: "a" },
    { pattern: "aa", phoneme: "a" },
    { pattern: "ii", phoneme: "i" },
    { pattern: "uu", phoneme: "u" },
  ],
  
  ar: [
    // Arabic (transliterated)
    { pattern: "sh", phoneme: "sh" },
    { pattern: "th", phoneme: "th" },
    { pattern: "gh", phoneme: "g" },
    { pattern: "kh", phoneme: "k" },
    { pattern: "dh", phoneme: "d" },
    { pattern: "zh", phoneme: "j" },
    { pattern: "dd", phoneme: "d" },
    { pattern: "tt", phoneme: "t" },
    { pattern: "ss", phoneme: "s" },
    { pattern: "qq", phoneme: "k" },
    
    // Vowel combinations
    { pattern: "ai", phoneme: "a" },
    { pattern: "au", phoneme: "a" },
  ]
};

/**
 * Transliterate non-Latin scripts to romanized form
 * @param {string} text - The text to transliterate
 * @param {string} language - Language code
 * @returns {string} Romanized text
 */
export function transliterate(text, language) {
  const langMap = {
    'japanese': 'japanese',
    'chinese': 'chinese',
    'hindi': 'hindi',
    'arabic': 'arabic'
  };
  
  const lang = langMap[language];
  if (!lang || !ROMANIZATION_MAP[lang]) {
    return text; // No transliteration needed for Latin-script languages
  }
  
  // Check if we have a direct mapping for this text
  const romanizationMap = ROMANIZATION_MAP[lang];
  if (romanizationMap[text]) {
    return romanizationMap[text];
  }
  
  // If no direct mapping, return as-is (may need external library for full transliteration)
  return text;
}

/**
 * Parse a word into phonemes using language-specific rules
 * Checks longer patterns first (e.g., "ou" before "o")
 * @param {string} word - The word to parse
 * @param {string} lang - Language code (english, spanish, etc.)
 * @returns {string[]} Array of phonemes
 */
export function parseWordWithRules(word, language = 'english') {
  // First, transliterate non-Latin scripts
  const romanizedWord = transliterate(word, language);
  
  // Map full language names to short codes
  const langMap = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'chinese': 'zh',
    'japanese': 'ja',
    'hindi': 'hi',
    'arabic': 'ar'
  };
  
  const lang = langMap[language] || 'en';
  const rules = PHONEME_RULES[lang] || PHONEME_RULES.en;
  const cleanWord = romanizedWord.toLowerCase().replace(/[^a-zñçàâäéèêëïîôöûüœæßぁ-んァ-ヶー一-龯\u0900-\u097F\u0600-\u06FF]/g, '');
  
  const phonemes = [];
  let i = 0;
  
  while (i < cleanWord.length) {
    let matched = false;
    
    // Try to match longest patterns first (4 letters, then 3, then 2, then 1)
    for (let len = 4; len >= 1; len--) {
      if (i + len <= cleanWord.length) {
        const pattern = cleanWord.substring(i, i + len);
        const rule = rules.find(r => r.pattern === pattern);
        
        if (rule) {
          phonemes.push(rule.phoneme);
          i += len;
          matched = true;
          break;
        }
      }
    }
    
    // If no rule matched, use the single character
    if (!matched) {
      phonemes.push(cleanWord[i]);
      i++;
    }
  }
  
  return phonemes;
}
