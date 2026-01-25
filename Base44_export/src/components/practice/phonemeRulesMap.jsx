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
    { pattern: "ai", phoneme: "ay" },
    { pattern: "ay", phoneme: "ay" },
    { pattern: "ei", phoneme: "ay" },
    { pattern: "ea", phoneme: "ee" },
    { pattern: "ee", phoneme: "ee" },
    { pattern: "ie", phoneme: "ee" },
    { pattern: "oa", phoneme: "o" },
    { pattern: "ow", phoneme: "o" },
    { pattern: "ew", phoneme: "oo" },
    { pattern: "ue", phoneme: "oo" },
    { pattern: "oo", phoneme: "oo" },
    { pattern: "ou", phoneme: "ow" },
    { pattern: "oi", phoneme: "oi" },
    { pattern: "oy", phoneme: "oi" },
    
    // R-controlled
    { pattern: "ar", phoneme: "ar" },
    { pattern: "or", phoneme: "or" },
    { pattern: "er", phoneme: "er" },
    { pattern: "ir", phoneme: "er" },
    { pattern: "ur", phoneme: "er" },
  ],
  
  es: [
    // Spanish special letters/combinations
    { pattern: "ll", phoneme: "ll" },
    { pattern: "ñ", phoneme: "ny" },
    { pattern: "ch", phoneme: "ch" },
    { pattern: "rr", phoneme: "rr" },
    { pattern: "qu", phoneme: "k" },
    { pattern: "z", phoneme: "th" },
    { pattern: "ce", phoneme: "th" },
    { pattern: "ci", phoneme: "th" },
    { pattern: "gü", phoneme: "g" },
    { pattern: "gu", phoneme: "g" },
    
    // Common vowel combos
    { pattern: "ai", phoneme: "ai" },
    { pattern: "ei", phoneme: "ei" },
    { pattern: "oi", phoneme: "oi" },
    { pattern: "au", phoneme: "au" },
    { pattern: "eu", phoneme: "eu" },
  ],
  
  fr: [
    // French digraphs (complex due to silent letters)
    { pattern: "ch", phoneme: "sh" },
    { pattern: "ph", phoneme: "f" },
    { pattern: "th", phoneme: "t" },
    { pattern: "qu", phoneme: "k" },
    { pattern: "c", phoneme: "k" }, // before a,o,u
    { pattern: "ç", phoneme: "s" },
    { pattern: "g", phoneme: "zh" }, // before e,i
    { pattern: "ge", phoneme: "zh" },
    { pattern: "gi", phoneme: "zh" },
    { pattern: "gn", phoneme: "ny" },
    { pattern: "ll", phoneme: "y" },
    { pattern: "ss", phoneme: "s" },
    
    // Vowel combinations
    { pattern: "ai", phoneme: "e" },
    { pattern: "ei", phoneme: "e" },
    { pattern: "eu", phoneme: "oe" },
    { pattern: "oe", phoneme: "oe" },
    { pattern: "ou", phoneme: "oo" },
    { pattern: "au", phoneme: "o" },
    { pattern: "aw", phoneme: "o" },
    { pattern: "oi", phoneme: "wa" },
    { pattern: "oy", phoneme: "wa" },
  ],
  
  de: [
    // German digraphs
    { pattern: "ch", phoneme: "kh" },
    { pattern: "chs", phoneme: "ks" },
    { pattern: "sch", phoneme: "sh" },
    { pattern: "st", phoneme: "sht" },
    { pattern: "sp", phoneme: "shp" },
    { pattern: "ph", phoneme: "f" },
    { pattern: "pf", phoneme: "pf" },
    { pattern: "qu", phoneme: "kv" },
    { pattern: "tsch", phoneme: "ch" },
    { pattern: "zsch", phoneme: "sh" },
    { pattern: "ß", phoneme: "s" },
    { pattern: "ss", phoneme: "s" },
    
    // Vowel combinations
    { pattern: "ei", phoneme: "ay" },
    { pattern: "ie", phoneme: "ee" },
    { pattern: "eu", phoneme: "oy" },
    { pattern: "äu", phoneme: "oy" },
    { pattern: "au", phoneme: "aw" },
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
    { pattern: "gi", phoneme: "gi" },
    { pattern: "ge", phoneme: "ge" },
    { pattern: "sc", phoneme: "sh" },
    { pattern: "sci", phoneme: "sh" },
    { pattern: "sce", phoneme: "sh" },
    { pattern: "gn", phoneme: "ny" },
    { pattern: "gl", phoneme: "ly" },
    { pattern: "gli", phoneme: "ly" },
    { pattern: "z", phoneme: "ts" },
    
    // Vowel combinations
    { pattern: "ai", phoneme: "ai" },
    { pattern: "ei", phoneme: "ei" },
    { pattern: "oi", phoneme: "oi" },
    { pattern: "ui", phoneme: "ui" },
    { pattern: "au", phoneme: "au" },
    { pattern: "eu", phoneme: "eu" },
  ],
  
  pt: [
    // Portuguese digraphs
    { pattern: "ch", phoneme: "sh" },
    { pattern: "nh", phoneme: "ny" },
    { pattern: "lh", phoneme: "ly" },
    { pattern: "rr", phoneme: "r" },
    { pattern: "ss", phoneme: "s" },
    { pattern: "sc", phoneme: "s" },
    { pattern: "sç", phoneme: "s" },
    { pattern: "xc", phoneme: "s" },
    { pattern: "x", phoneme: "sh" },
    { pattern: "z", phoneme: "z" },
    { pattern: "j", phoneme: "zh" },
    { pattern: "g", phoneme: "zh" }, // before e,i
    
    // Vowel combinations
    { pattern: "ai", phoneme: "ai" },
    { pattern: "ei", phoneme: "ei" },
    { pattern: "oi", phoneme: "oi" },
    { pattern: "ui", phoneme: "ui" },
    { pattern: "au", phoneme: "au" },
    { pattern: "eu", phoneme: "eu" },
    { pattern: "ou", phoneme: "o" },
  ],
  
  zh: [
    // Chinese Pinyin (Romanized)
    { pattern: "zh", phoneme: "zh" },
    { pattern: "ch", phoneme: "ch" },
    { pattern: "sh", phoneme: "sh" },
    { pattern: "q", phoneme: "ch" },
    { pattern: "x", phoneme: "sh" },
    { pattern: "z", phoneme: "dz" },
    { pattern: "c", phoneme: "ts" },
    { pattern: "s", phoneme: "s" },
    { pattern: "r", phoneme: "r" },
    { pattern: "ng", phoneme: "ng" },
    
    // Common syllable endings
    { pattern: "ang", phoneme: "ang" },
    { pattern: "eng", phoneme: "eng" },
    { pattern: "ing", phoneme: "ing" },
    { pattern: "ong", phoneme: "ong" },
    { pattern: "an", phoneme: "an" },
    { pattern: "en", phoneme: "en" },
    { pattern: "in", phoneme: "in" },
    { pattern: "un", phoneme: "un" },
    { pattern: "uan", phoneme: "uan" },
    { pattern: "uang", phoneme: "uang" },
  ],
  
  ja: [
    // Japanese Hiragana/Romaji (these work with romanized input)
    { pattern: "sh", phoneme: "sh" },
    { pattern: "ch", phoneme: "ch" },
    { pattern: "ts", phoneme: "ts" },
    { pattern: "zu", phoneme: "zu" },
    { pattern: "di", phoneme: "di" },
    { pattern: "du", phoneme: "du" },
    { pattern: "ye", phoneme: "ye" },
    { pattern: "wo", phoneme: "o" },
    { pattern: "fu", phoneme: "fu" },
    
    // Double consonants
    { pattern: "kk", phoneme: "k" },
    { pattern: "tt", phoneme: "t" },
    { pattern: "pp", phoneme: "p" },
    { pattern: "ss", phoneme: "s" },
  ],
  
  hi: [
    // Hindi Devanagari (when romanized as IAST/ITRANS)
    { pattern: "sh", phoneme: "sh" },
    { pattern: "ch", phoneme: "ch" },
    { pattern: "th", phoneme: "th" },
    { pattern: "dh", phoneme: "dh" },
    { pattern: "kh", phoneme: "kh" },
    { pattern: "gh", phoneme: "gh" },
    { pattern: "ph", phoneme: "ph" },
    { pattern: "bh", phoneme: "bh" },
    { pattern: "ñ", phoneme: "ny" },
    { pattern: "ng", phoneme: "ng" },
    
    // Vowel combinations
    { pattern: "ai", phoneme: "ai" },
    { pattern: "au", phoneme: "au" },
    { pattern: "aa", phoneme: "a" },
    { pattern: "ii", phoneme: "i" },
    { pattern: "uu", phoneme: "u" },
  ],
  
  ar: [
    // Arabic (when transliterated)
    { pattern: "sh", phoneme: "sh" },
    { pattern: "th", phoneme: "th" },
    { pattern: "gh", phoneme: "gh" },
    { pattern: "kh", phoneme: "kh" },
    { pattern: "dh", phoneme: "dh" },
    { pattern: "zh", phoneme: "zh" },
    { pattern: "dd", phoneme: "dd" },
    { pattern: "tt", phoneme: "tt" },
    { pattern: "ss", phoneme: "ss" },
    { pattern: "qq", phoneme: "q" },
    
    // Vowel combinations
    { pattern: "ai", phoneme: "ai" },
    { pattern: "au", phoneme: "au" },
  ]
};

/**
 * Parse a word into phonemes using language-specific rules
 * Checks longer patterns first (e.g., "ou" before "o")
 * @param {string} word - The word to parse
 * @param {string} lang - Language code (en, es, fr, de, it, pt, zh, ja, hi, ar)
 * @returns {string[]} Array of phonemes
 */
export function parseWordWithRules(word, lang = 'en') {
  const rules = PHONEME_RULES[lang] || PHONEME_RULES.en;
  const cleanWord = word.toLowerCase().replace(/[^a-zñçàâäéèêëïîôöûüœæ]/g, '');
  
  const phonemes = [];
  let i = 0;
  
  while (i < cleanWord.length) {
    let matched = false;
    
    // Try to match longest patterns first (3 letters, then 2, then 1)
    for (let len = 3; len >= 1; len--) {
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