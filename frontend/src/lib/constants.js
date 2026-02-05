// Local paths for sprite images (stored in /public/assets/heads/)
const LOCAL_SPRITE_BASE = '/assets/heads';

export const SPRITE_URLS = {
  front: {
    0: `${LOCAL_SPRITE_BASE}/front/frame_00_neutral.png`,
    1: `${LOCAL_SPRITE_BASE}/front/frame_01_a_u.png`,
    2: `${LOCAL_SPRITE_BASE}/front/frame_02_b_p_m.png`,
    3: `${LOCAL_SPRITE_BASE}/front/frame_03_ee_z_x.png`,
    4: `${LOCAL_SPRITE_BASE}/front/frame_04_oo_o_ou_w.png`,
    5: `${LOCAL_SPRITE_BASE}/front/frame_05_e.png`,
    6: `${LOCAL_SPRITE_BASE}/front/frame_06_ü.png`,
    7: `${LOCAL_SPRITE_BASE}/front/frame_07_c_k_q_g.png`,
    8: `${LOCAL_SPRITE_BASE}/front/frame_08_t_tsk_d_j.png`,
    9: `${LOCAL_SPRITE_BASE}/front/frame_09_n.png`,
    10: `${LOCAL_SPRITE_BASE}/front/frame_10_ng.png`,
    11: `${LOCAL_SPRITE_BASE}/front/frame_11_s.png`,
    12: `${LOCAL_SPRITE_BASE}/front/frame_12_sh.png`,
    13: `${LOCAL_SPRITE_BASE}/front/frame_13_th.png`,
    14: `${LOCAL_SPRITE_BASE}/front/frame_14_f_v.png`,
    15: `${LOCAL_SPRITE_BASE}/front/frame_15_h.png`,
    16: `${LOCAL_SPRITE_BASE}/front/frame_16_ch.png`,
    17: `${LOCAL_SPRITE_BASE}/front/frame_17_r.png`,
    18: `${LOCAL_SPRITE_BASE}/front/frame_18_L.png`,
    19: `${LOCAL_SPRITE_BASE}/front/frame_19_LL_y.png`,
  },
  side: {
    0: `${LOCAL_SPRITE_BASE}/side/frame_00_neutral.png`,
    1: `${LOCAL_SPRITE_BASE}/side/frame_01_a_u.png`,
    2: `${LOCAL_SPRITE_BASE}/side/frame_02_b_p_m.png`,
    3: `${LOCAL_SPRITE_BASE}/side/frame_03_ee_z_x.png`,
    4: `${LOCAL_SPRITE_BASE}/side/frame_04_oo_o_ou_w.png`,
    5: `${LOCAL_SPRITE_BASE}/side/frame_05_e.png`,
    6: `${LOCAL_SPRITE_BASE}/side/frame_06_ü.png`,
    7: `${LOCAL_SPRITE_BASE}/side/frame_07_c_k_q_g.png`,
    8: `${LOCAL_SPRITE_BASE}/side/frame_08_t_tsk_d_j.png`,
    9: `${LOCAL_SPRITE_BASE}/side/frame_09_n.png`,
    10: `${LOCAL_SPRITE_BASE}/side/frame_10_ng.png`,
    11: `${LOCAL_SPRITE_BASE}/side/frame_11_s.png`,
    12: `${LOCAL_SPRITE_BASE}/side/frame_12_sh.png`,
    13: `${LOCAL_SPRITE_BASE}/side/frame_13_th.png`,
    14: `${LOCAL_SPRITE_BASE}/side/frame_14_f_v.png`,
    15: `${LOCAL_SPRITE_BASE}/side/frame_15_h.png`,
    16: `${LOCAL_SPRITE_BASE}/side/frame_16_ch.png`,
    17: `${LOCAL_SPRITE_BASE}/side/frame_17_r.png`,
    18: `${LOCAL_SPRITE_BASE}/side/frame_18_L.png`,
    19: `${LOCAL_SPRITE_BASE}/side/frame_19_LL_y.png`,
  }
};

// Local audio paths (stored in /public/assets/audio/)
export const AUDIO_BASE_PATH = '/assets/audio';

// Language code mapping for audio files
export const LANGUAGE_AUDIO_CODES = {
  english: 'en',
  spanish: 'es',
  italian: 'it',
  portuguese: 'pt',
  german: 'de',
  french: 'fr',
  japanese: 'ja',
  chinese: 'zh',
  hindi: 'hi',
  arabic: 'ar',
};

// Get audio URL for a phoneme in a language
export const getPhonemeAudioUrl = (phoneme, languageCode) => {
  const langCode = LANGUAGE_AUDIO_CODES[languageCode] || 'en';
  return `${AUDIO_BASE_PATH}/${langCode}-${phoneme.toLowerCase()}.mp3`;
};

// Phoneme to frame mapping
export const PHONEME_FRAME_MAP = {
  // Vowels
  'a': 1, 'ah': 1, 'u': 1, 'uh': 1,
  'e': 5, 'eh': 5,
  'ee': 3, 'i': 3,
  'o': 4, 'oo': 4, 'ou': 4, 'w': 4,
  'ü': 6, 'ue': 6,
  
  // Consonants
  'b': 2, 'p': 2, 'm': 2,
  'z': 3, 'x': 3,
  'c': 7, 'k': 7, 'q': 7, 'g': 7,
  't': 8, 'd': 8, 'j': 8,
  'n': 9,
  'ng': 10,
  's': 11,
  'sh': 12,
  'th': 13,
  'f': 14, 'v': 14,
  'h': 15,
  'ch': 16,
  'r': 17,
  'l': 18,
  'll': 19, 'y': 19,
  
  // Neutral/default
  '': 0, 'neutral': 0, 'silence': 0, ' ': 0, 'rest': 0,
};

// UNIVERSAL VISEME FALLBACK MAP
// Maps unsupported phonemes to closest existing viseme based on articulatory similarity
// (lip rounding, jaw openness, tongue placement) - NOT spelling or script
export const VISEME_FALLBACK_MAP = {
  // Affricates / Fricatives (palatal / postalveolar) → Y frame (ll/y)
  'zh': 'y',      // voiced postalveolar fricative
  'dj': 'j',      // voiced palatal affricate
  
  // Japanese palatalized consonants
  'ky': 'y',      // palatalized k
  'gy': 'y',      // palatalized g
  'ry': 'l',      // palatalized r (Japanese r is similar to l)
  'ny': 'n',      // palatalized n
  'py': 'p',      // palatalized p
  'by': 'b',      // palatalized b
  'my': 'm',      // palatalized m
  'hy': 'h',      // palatalized h
  
  // Chinese (Pinyin) special consonants
  'q': 'ch',      // Pinyin q → ch (aspirated palatal affricate)
  'x': 'sh',      // Pinyin x → sh (voiceless alveolo-palatal fricative)
  'c': 's',       // Pinyin c → s (aspirated alveolar affricate)
  'r': 'r',       // Pinyin r (voiced retroflex)
  
  // Arabic emphatic/pharyngeal consonants
  'kh': 'k',      // voiceless uvular fricative → k
  'gh': 'g',      // voiced uvular fricative → g
  'ḥ': 'h',       // voiceless pharyngeal fricative → h
  'ʕ': 'a',       // voiced pharyngeal fricative → open vowel
  'ʔ': '',        // glottal stop → neutral
  'dh': 'd',      // emphatic d
  'ss': 's',      // emphatic s
  'tt': 't',      // emphatic t
  'zz': 'z',      // emphatic z
  'qq': 'k',      // uvular stop → k
  
  // Hindi retroflex/aspirated consonants
  'ṭ': 't',       // retroflex t → t
  'ḍ': 'd',       // retroflex d → d
  'ṇ': 'n',       // retroflex n → n
  'ś': 'sh',      // palatal fricative → sh
  'ṣ': 'sh',      // retroflex fricative → sh
  'kh': 'k',      // aspirated k → k
  'gh': 'g',      // aspirated g → g
  'ph': 'f',      // aspirated p → f (similar lip position)
  'bh': 'b',      // aspirated b → b
  'dh': 'd',      // aspirated d → d
  'th': 'th',     // aspirated t → th (dental)
  'jh': 'j',      // aspirated j → j
  'chh': 'ch',    // aspirated ch → ch
  
  // Common consonant clusters
  'ts': 's',      // voiceless alveolar affricate → s
  'dz': 'z',      // voiced alveolar affricate → z
  'ŋ': 'ng',      // velar nasal
  'ñ': 'n',       // palatal nasal → n
  'gn': 'n',      // palatalized n → n
  
  // Long vowels (same mouth shape as short)
  'aa': 'a',
  'ii': 'i',
  'uu': 'u',
  'oo': 'o',
  'ee': 'e',
  
  // Diphthongs fallback to primary vowel
  'ai': 'a',
  'au': 'a',
  'ei': 'e',
  'oi': 'o',
  'ou': 'o',
  
  // Double consonants → single consonant
  'pp': 'p',
  'bb': 'b',
  'tt': 't',
  'dd': 'd',
  'kk': 'k',
  'gg': 'g',
  'mm': 'm',
  'nn': 'n',
  'ss': 's',
  'ff': 'f',
  'rr': 'r',
  'll': 'l',
  
  // Spanish/Italian specific
  'ñ': 'n',
  'gl': 'l',
  'gli': 'l',
  'sc': 'sh',
  'sce': 'sh',
  'sci': 'sh',
  
  // Portuguese specific
  'nh': 'n',
  'lh': 'l',
  
  // German specific
  'ß': 's',
  'sch': 'sh',
  'pf': 'f',
  'tsch': 'ch',
  
  // French specific
  'gn': 'n',
  'ç': 's',
  'œ': 'e',
  'æ': 'a',
};

/**
 * MANDATORY Viseme Resolution Function
 * All animation frame selection MUST pass through this logic
 * @param {string} phoneme - The phoneme to resolve
 * @returns {string} - The resolved viseme (phoneme that maps to a frame)
 */
export function resolveViseme(phoneme) {
  if (!phoneme) return 'rest';
  
  const normalizedPhoneme = phoneme.toLowerCase().trim();
  
  // Direct match in PHONEME_FRAME_MAP
  if (PHONEME_FRAME_MAP[normalizedPhoneme] !== undefined) {
    return normalizedPhoneme;
  }
  
  // Fallback match
  if (VISEME_FALLBACK_MAP[normalizedPhoneme]) {
    const fallback = VISEME_FALLBACK_MAP[normalizedPhoneme];
    // Recursively resolve in case fallback also needs resolution
    return resolveViseme(fallback);
  }
  
  // Character-by-character fallback for unknown multi-char sequences
  if (normalizedPhoneme.length > 1) {
    // Try first character
    const firstChar = normalizedPhoneme[0];
    if (PHONEME_FRAME_MAP[firstChar] !== undefined) {
      return firstChar;
    }
  }
  
  // Last resort: return 'rest' (neutral mouth) - NEVER fail silently
  console.warn(`[resolveViseme] Unknown phoneme "${phoneme}" → falling back to REST`);
  return 'rest';
}

/**
 * Get frame number for a phoneme using the viseme resolution system
 * @param {string} phoneme - The phoneme to get frame for
 * @returns {number} - Frame number (0-19)
 */
export function getFrameForPhoneme(phoneme) {
  const resolvedViseme = resolveViseme(phoneme);
  const frame = PHONEME_FRAME_MAP[resolvedViseme];
  return frame !== undefined ? frame : 0; // Default to neutral (0) if somehow undefined
}

// Frame timing in milliseconds per phoneme
export const FRAME_DURATION = 200;

// Languages configuration
export const LANGUAGES = [
  { code: 'english', name: 'English', native: 'English', dir: 'ltr' },
  { code: 'spanish', name: 'Spanish', native: 'Español', dir: 'ltr' },
  { code: 'italian', name: 'Italian', native: 'Italiano', dir: 'ltr' },
  { code: 'portuguese', name: 'Portuguese', native: 'Português', dir: 'ltr' },
  { code: 'german', name: 'German', native: 'Deutsch', dir: 'ltr' },
  { code: 'french', name: 'French', native: 'Français', dir: 'ltr' },
  { code: 'japanese', name: 'Japanese', native: '日本語', dir: 'ltr' },
  { code: 'chinese', name: 'Chinese', native: '中文', dir: 'ltr' },
  { code: 'hindi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { code: 'arabic', name: 'Arabic', native: 'العربية', dir: 'rtl' },
];

// Default practice words - expanded with more options
export const DEFAULT_PRACTICE_WORDS = {
  english: ['Hello', 'Goodbye', 'Please', 'Thank You', 'Yes', 'No', 'Water', 'Friend', 'Happy', 'Love'],
  spanish: ['Hola', 'Adiós', 'Por favor', 'Gracias', 'Sí', 'No', 'Agua', 'Amigo', 'Feliz', 'Amor'],
  italian: ['Ciao', 'Arrivederci', 'Per favore', 'Grazie', 'Sì', 'No', 'Acqua', 'Amico', 'Felice', 'Amore'],
  portuguese: ['Olá', 'Adeus', 'Por favor', 'Obrigado', 'Sim', 'Não', 'Água', 'Amigo', 'Feliz', 'Amor'],
  german: ['Hallo', 'Auf Wiedersehen', 'Bitte', 'Danke', 'Ja', 'Nein', 'Wasser', 'Freund', 'Glücklich', 'Liebe'],
  french: ['Bonjour', 'Au revoir', "S'il vous plaît", 'Merci', 'Oui', 'Non', 'Eau', 'Ami', 'Heureux', 'Amour'],
  japanese: ['こんにちは', 'さようなら', 'お願いします', 'ありがとう', 'はい', 'いいえ', '水', '友達', '嬉しい', '愛'],
  chinese: ['你好', '再见', '请', '谢谢', '是', '不', '水', '朋友', '快乐', '爱'],
  hindi: ['नमस्ते', 'अलविदा', 'कृपया', 'धन्यवाद', 'हाँ', 'नहीं', 'पानी', 'दोस्त', 'खुश', 'प्यार'],
  arabic: ['مرحبا', 'وداعا', 'من فضلك', 'شكرا', 'نعم', 'لا', 'ماء', 'صديق', 'سعيد', 'حب'],
};

// Letter romanization for non-Latin alphabets
export const LETTER_ROMANIZATION = {
  japanese: {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
  },
  chinese: {
    // Common pinyin initials - use phonetic representation
    'b': 'ba', 'p': 'pa', 'm': 'ma', 'f': 'fa',
    'd': 'da', 't': 'ta', 'n': 'na', 'l': 'la',
    'g': 'ga', 'k': 'ka', 'h': 'ha',
    'j': 'ji', 'q': 'qi', 'x': 'xi',
    'z': 'za', 'c': 'ca', 's': 'sa',
    'r': 'ra', 'y': 'ya', 'w': 'wa',
  },
  hindi: {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha',
    'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha',
    'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha',
    'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha',
    'न': 'na', 'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha',
    'म': 'ma', 'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
    'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
  },
  arabic: {
    'ا': 'a', 'ب': 'ba', 'ت': 'ta', 'ث': 'tha', 'ج': 'ja',
    'ح': 'ha', 'خ': 'kha', 'د': 'da', 'ذ': 'dha', 'ر': 'ra',
    'ز': 'za', 'س': 'sa', 'ش': 'sha', 'ص': 'sa', 'ض': 'da',
    'ط': 'ta', 'ظ': 'za', 'ع': 'a', 'غ': 'gha', 'ف': 'fa',
    'ق': 'qa', 'ك': 'ka', 'ل': 'la', 'م': 'ma', 'ن': 'na',
    'ه': 'ha', 'و': 'wa', 'ي': 'ya',
  },
};

// Romanization mappings for non-Latin script languages
// CRITICAL: This map must include ALL words from QUICK_PRACTICE_WORDS and PRACTICE_PHRASES
export const ROMANIZATION_MAP = {
  japanese: {
    // QUICK_PRACTICE_WORDS
    'こんにちは': 'konnichiwa',
    'はい': 'hai',
    'いいえ': 'iie',
    '水': 'mizu',
    '食べ物': 'tabemono',
    '良い': 'yoi',
    '助けて': 'tasukete',
    'ありがとう': 'arigatou',
    // PRACTICE_PHRASES
    'ありがとうございます': 'arigatougozaimasu',
    '元気です': 'genkidesu',
    'おはようございます': 'ohayougozaimasu',
    'お元気ですか': 'ogenkidesuka',
    'はじめまして': 'hajimemashite',
    'また後で': 'mato atode',
    // DEFAULT_PRACTICE_WORDS (legacy)
    'さようなら': 'sayonara',
    'お願いします': 'onegaishimasu',
    '友達': 'tomodachi',
    '嬉しい': 'ureshii',
    '愛': 'ai',
    'またね': 'matane',
  },
  chinese: {
    // QUICK_PRACTICE_WORDS
    '你好': 'nihao',
    '是': 'shi',
    '不': 'bu',
    '水': 'shui',
    '食物': 'shiwu',
    '好': 'hao',
    '帮助': 'bangzhu',
    '谢谢': 'xiexie',
    // PRACTICE_PHRASES
    '非常感谢': 'feichang ganxie',
    '我很好': 'wo hen hao',
    '早上好': 'zaoshang hao',
    '你好吗': 'ni hao ma',
    '很高兴认识你': 'hen gaoxing renshi ni',
    '回头见': 'huitou jian',
    // DEFAULT_PRACTICE_WORDS (legacy)
    '再见': 'zaijian',
    '请': 'qing',
    '朋友': 'pengyou',
    '快乐': 'kuaile',
    '爱': 'ai',
    '谢谢你': 'xiexieni',
  },
  hindi: {
    // QUICK_PRACTICE_WORDS
    'नमस्ते': 'namaste',
    'हाँ': 'haan',
    'नहीं': 'nahin',
    'पानी': 'paani',
    'खाना': 'khaana',
    'अच्छा': 'achha',
    'मदद': 'madad',
    'धन्यवाद': 'dhanyavad',
    // PRACTICE_PHRASES
    'बहुत धन्यवाद': 'bahut dhanyavad',
    'मैं ठीक हूँ': 'main theek hoon',
    'सुप्रभात': 'suprabhat',
    'आप कैसे हैं': 'aap kaise hain',
    'आपसे मिलकर अच्छा लगा': 'aapse milkar achha laga',
    'फिर मिलेंगे': 'phir milenge',
    // DEFAULT_PRACTICE_WORDS (legacy)
    'अलविदा': 'alvida',
    'कृपया': 'kripaya',
    'दोस्त': 'dost',
    'खुश': 'khush',
    'प्यार': 'pyaar',
    'आपसे मिलकर खुशी हुई': 'aapse milkar khushi hui',
  },
  arabic: {
    // QUICK_PRACTICE_WORDS
    'مرحبا': 'marhaba',
    'نعم': 'naam',
    'لا': 'la',
    'ماء': 'maa',
    'طعام': 'taam',
    'جيد': 'jayyid',
    'مساعدة': 'musaada',
    'شكرا': 'shukran',
    // PRACTICE_PHRASES
    'شكرا جزيلا': 'shukran jazeelan',
    'أنا بخير': 'ana bikhayr',
    'صباح الخير': 'sabah alkhayr',
    'كيف حالك': 'kayfa halak',
    'سعيد بلقائك': 'saeed biliqaak',
    'أراك لاحقا': 'araak lahiqan',
    // DEFAULT_PRACTICE_WORDS (legacy)
    'وداعا': 'wadaan',
    'من فضلك': 'min fadlak',
    'صديق': 'sadiq',
    'سعيد': 'saeed',
    'حب': 'hubb',
    'شكرا لك': 'shukran lak',
    'تشرفت بمعرفتك': 'tasharraftu bimarifatik',
    'إلى اللقاء': 'ila alliqa',
  },
};

// Extended practice words - organized by category for speech therapy
export const PRACTICE_WORDS_BY_CATEGORY = {
  english: {
    greetings: ['Hello', 'Hi', 'Good Morning', 'Good Night', 'Goodbye', 'See You', 'Nice to meet you'],
    basics: ['Yes', 'No', 'Please', 'Thank You', 'Sorry', 'Excuse Me', 'Help'],
    family: ['Mother', 'Father', 'Sister', 'Brother', 'Baby', 'Family', 'Grandma', 'Grandpa'],
    food: ['Water', 'Milk', 'Bread', 'Apple', 'Banana', 'Hungry', 'Thirsty', 'Eat', 'Drink'],
    emotions: ['Happy', 'Sad', 'Angry', 'Scared', 'Tired', 'Love', 'Like', 'Want'],
    actions: ['Go', 'Stop', 'Run', 'Walk', 'Sit', 'Stand', 'Sleep', 'Play', 'Read', 'Write'],
    colors: ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Black', 'White'],
    numbers: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
    body: ['Head', 'Hand', 'Foot', 'Eye', 'Ear', 'Nose', 'Mouth', 'Teeth', 'Tongue'],
    difficult_sounds: ['Squirrel', 'Strawberry', 'Spaghetti', 'Refrigerator', 'Thermometer', 'Chrysanthemum'],
  },
  spanish: {
    greetings: ['Hola', 'Buenos días', 'Buenas noches', 'Adiós', 'Hasta luego'],
    basics: ['Sí', 'No', 'Por favor', 'Gracias', 'Lo siento', 'Ayuda'],
    family: ['Madre', 'Padre', 'Hermana', 'Hermano', 'Bebé', 'Familia', 'Abuela', 'Abuelo'],
    food: ['Agua', 'Leche', 'Pan', 'Manzana', 'Plátano', 'Hambre', 'Sed', 'Comer', 'Beber'],
    emotions: ['Feliz', 'Triste', 'Enojado', 'Asustado', 'Cansado', 'Amor', 'Querer'],
    actions: ['Ir', 'Parar', 'Correr', 'Caminar', 'Sentar', 'Dormir', 'Jugar', 'Leer', 'Escribir'],
    colors: ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Negro', 'Blanco'],
    numbers: ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'],
  },
  french: {
    greetings: ['Bonjour', 'Bonsoir', 'Bonne nuit', 'Au revoir', 'Salut'],
    basics: ['Oui', 'Non', "S'il vous plaît", 'Merci', 'Pardon', 'Aide'],
    family: ['Mère', 'Père', 'Sœur', 'Frère', 'Bébé', 'Famille', 'Grand-mère', 'Grand-père'],
    food: ['Eau', 'Lait', 'Pain', 'Pomme', 'Banane', 'Faim', 'Soif', 'Manger', 'Boire'],
    emotions: ['Heureux', 'Triste', 'Fâché', 'Effrayé', 'Fatigué', 'Amour', 'Aimer'],
    colors: ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet', 'Noir', 'Blanc'],
    numbers: ['Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix'],
  },
  german: {
    greetings: ['Hallo', 'Guten Morgen', 'Gute Nacht', 'Auf Wiedersehen', 'Tschüss'],
    basics: ['Ja', 'Nein', 'Bitte', 'Danke', 'Entschuldigung', 'Hilfe'],
    family: ['Mutter', 'Vater', 'Schwester', 'Bruder', 'Baby', 'Familie', 'Oma', 'Opa'],
    food: ['Wasser', 'Milch', 'Brot', 'Apfel', 'Banane', 'Hunger', 'Durst', 'Essen', 'Trinken'],
    emotions: ['Glücklich', 'Traurig', 'Wütend', 'Angst', 'Müde', 'Liebe', 'Mögen'],
    colors: ['Rot', 'Blau', 'Grün', 'Gelb', 'Orange', 'Lila', 'Schwarz', 'Weiß'],
    numbers: ['Eins', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht', 'Neun', 'Zehn'],
  },
};

// Phoneme-focused practice sentences for speech therapy
export const PHONEME_PRACTICE_SENTENCES = {
  's': ['Sally sells seashells', 'Six slippery snails', 'The sun sets slowly'],
  'r': ['Red roses are rare', 'Robert ran rapidly', 'Around the rugged rock'],
  'l': ['Little lambs leap lightly', 'Lovely lilies bloom', 'Look at the lake'],
  'th': ['The three brothers think', 'This is that thing', 'Through thick and thin'],
  'sh': ['She sells shiny shoes', 'Shelly should share', 'Show me the ship'],
  'ch': ['Charlie chose chocolate', 'Children cheer cheerfully', 'Chop the cherries'],
  'f': ['Five funny frogs', 'Fresh fish for Friday', 'Feel the fluffy fabric'],
  'v': ['Very vivid violets', 'Victor visits Venice', 'Vivian loves vegetables'],
  'k': ['Kate kicks the can', 'Keep the kite flying', 'Quick! Catch the cat'],
  'g': ['Good green grapes', 'Go get the gold', 'Gabby giggles gladly'],
  'b': ['Big blue balloons', 'Bobby bought bananas', 'Beautiful butterflies'],
  'p': ['Peter picked peppers', 'Pretty pink poppies', 'Please pass the plate'],
  'm': ['Many merry men', 'Mom made muffins', 'Marching music plays'],
  'n': ['Nine nice knights', 'Nancy needs napkins', 'No noise at night'],
};

// Default alphabets
export const ALPHABETS = {
  english: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'CH', 'SH', 'TH'],
  spanish: [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', 'CH', 'LL', 'RR'],
  italian: [...'ABCDEFGHILMNOPQRSTUVZ', 'GL', 'GN', 'SC'],
  portuguese: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Ç', 'CH', 'LH', 'NH'],
  german: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß', 'CH', 'SCH'],
  french: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Ç', 'CH', 'GN', 'OI'],
  japanese: ['A', 'I', 'U', 'E', 'O', 'KA', 'KI', 'KU', 'KE', 'KO', 'SA', 'SHI', 'SU', 'SE', 'SO', 
             'TA', 'CHI', 'TSU', 'TE', 'TO', 'NA', 'NI', 'NU', 'NE', 'NO', 'HA', 'HI', 'FU', 'HE', 'HO',
             'MA', 'MI', 'MU', 'ME', 'MO', 'YA', 'YU', 'YO', 'RA', 'RI', 'RU', 'RE', 'RO', 'WA', 'WO', 'N'],
  chinese: ['A', 'O', 'E', 'I', 'U', 'Ü', 'B', 'P', 'M', 'F', 'D', 'T', 'N', 'L', 'G', 'K', 'H', 
            'J', 'Q', 'X', 'ZH', 'CH', 'SH', 'R', 'Z', 'C', 'S'],
  hindi: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ',
          'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'स', 'ह'],
  arabic: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
};

// Bug report options
export const BUG_REPORT_OPTIONS = {
  platforms: ['Windows', 'Mac', 'iOS', 'Android', 'Linux', 'Other'],
  pages: ['Home', 'Letter Practice', 'Word Practice', 'History', 'Bug Report'],
  severities: ['Low', 'Medium', 'High', 'Critical'],
  featureAreas: ['Animation', 'Recording', 'Grading', 'UI', 'Audio', 'Video', 'Other'],
};
