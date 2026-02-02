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
  '': 0, 'neutral': 0, 'silence': 0, ' ': 0,
};

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

// Default practice words
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
