/**
 * Fully vowelled Modern Standard Arabic truth for the fundraiser-demo presets.
 *
 * Visible preset spelling stays unchanged. These forms drive helper text,
 * expected phonemes, animation, grading, and TTS for the known demo targets.
 * Gendered second-person phrases use the masculine-singular teaching baseline.
 */

export const ARABIC_VOWELLED_PRESET_TRUTH = Object.freeze([
  { id: 'ar-word-1', source: 'مرحبا', vowelled: 'مَرْحَبًا' },
  { id: 'ar-word-2', source: 'أهلا', vowelled: 'أَهْلًا' },
  { id: 'ar-word-3', source: 'ابتسم', vowelled: 'اِبْتَسِمْ' },
  { id: 'ar-word-4', source: 'شكرا', vowelled: 'شُكْرًا' },
  { id: 'ar-word-5', source: 'آسف', vowelled: 'آسِف' },
  { id: 'ar-word-6', source: 'نعم', vowelled: 'نَعَمْ' },
  { id: 'ar-word-7', source: 'لا', vowelled: 'لَا' },
  { id: 'ar-word-8', source: 'أهلاً وسهلاً', vowelled: 'أَهْلًا وَسَهْلًا' },
  { id: 'ar-word-9', source: 'وداعا', vowelled: 'وَدَاعًا' },
  { id: 'ar-word-10', source: 'قبلة', vowelled: 'قُبْلَة' },

  { id: 'ar-phrase-1', source: 'صباح الخير', vowelled: 'صَبَاحُ الْخَيْر' },
  { id: 'ar-phrase-2', source: 'اعذرني', vowelled: 'اِعْذِرْنِي' },
  { id: 'ar-phrase-3', source: 'مساء الخير', vowelled: 'مَسَاءُ الْخَيْر' },
  {
    id: 'ar-phrase-4',
    source: 'كيف حالك',
    vowelled: 'كَيْفَ حَالُكَ',
    address: 'masculine-singular',
  },
  { id: 'ar-phrase-5', source: 'أنا بخير', vowelled: 'أَنَا بِخَيْر' },
  { id: 'ar-phrase-6', source: 'شكرا جزيلا', vowelled: 'شُكْرًا جَزِيلًا' },
  {
    id: 'ar-phrase-7',
    source: 'أراك قريبا',
    vowelled: 'أَرَاكَ قَرِيبًا',
    address: 'masculine-singular',
  },
  {
    id: 'ar-phrase-8',
    source: 'تصبح على خير',
    vowelled: 'تُصْبِحُ عَلَى خَيْر',
    address: 'masculine-singular',
  },
]);

const ARABIC_MARKS = /[\u064B-\u0652\u0670]/g;
const ARABIC_MARK_PRESENT = /[\u064B-\u0652\u0670]/;
const EDGE_PUNCTUATION = /^[\s،؛؟.!?]+|[\s،؛؟.!?]+$/g;

function normalizeExact(value = '') {
  return String(value || '')
    .normalize('NFC')
    .replace(/\u0640/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeBase(value = '') {
  return normalizeExact(value)
    .replace(ARABIC_MARKS, '')
    .replace(EDGE_PUNCTUATION, '')
    .trim();
}

const exactEntries = new Map(
  ARABIC_VOWELLED_PRESET_TRUTH.map((entry) => [normalizeExact(entry.source), entry])
);
const baseEntries = new Map(
  ARABIC_VOWELLED_PRESET_TRUTH.map((entry) => [normalizeBase(entry.source), entry])
);

export function getArabicVowelledPresetTruth(value = '') {
  const exact = normalizeExact(value);
  if (!exact) return null;

  const exactEntry = exactEntries.get(exact);
  if (exactEntry) return exactEntry;

  // Do not overwrite a learner's explicitly marked pronunciation with a
  // different preset reading. Base-form lookup is only for unvowelled input.
  if (ARABIC_MARK_PRESENT.test(exact)) return null;

  return baseEntries.get(normalizeBase(exact)) ?? null;
}

export default ARABIC_VOWELLED_PRESET_TRUTH;
