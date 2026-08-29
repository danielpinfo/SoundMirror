const phonemeSystem = {
  system: 'phoneme',
  locale: 'ar-SA',

  consonants: [
    'ب', 'ت', 'ث', 'ج', 'ح', 'خ',
    'د', 'ذ', 'ر', 'ز', 'س', 'ش',
    'ص', 'ض', 'ط', 'ظ', 'ع', 'غ',
    'ف', 'ق', 'ك', 'ل', 'م', 'ن',
    'ه', 'و', 'ي', 'ء',
  ],

  vowels: [
    'a', 'e', 'i', 'o', 'u',
    'ا', 'و', 'ي',
  ],

  emphatics: [
    'ص', 'ض', 'ط', 'ظ',
  ],

  pharyngeals: [
    'ع', 'ح',
  ],

  uvulars: [
    'ق', 'غ', 'خ',
  ],

  glottals: [
    'ه', 'ء',
  ],

  glides: [
    'و', 'ي',
  ],
};

export default phonemeSystem;