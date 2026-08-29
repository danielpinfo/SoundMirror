/**
 * Arabic pack-owned pronunciation rules.
 *
 * These rules are learner-facing guidance only. They do not create AS timing
 * and they do not replace the resolver. The resolver remains the source of
 * expected phonemes for AS/UAS comparison.
 *
 * RTL is presentation-layer only. Internal rule order stays normal.
 */

export const pronunciationRules = [
  {
    id: 'ar-rtl-display-only',
    title: 'Arabic direction',
    pattern: 'RTL display',
    helper:
      'Arabic text is displayed right-to-left, but the practice sounds are still processed in their normal spoken order.',
    examples: ['مرحبا', 'شكرا', 'صباح الخير'],
  },
  {
    id: 'ar-short-vowels',
    title: 'short vowels',
    pattern: 'a, i, u',
    helper:
      'Arabic often writes consonants without all short vowels. In practice, keep the short vowel sound clear between consonants.',
    examples: ['مَرْحَبَا', 'شُكْرًا', 'نَعَم'],
  },
  {
    id: 'ar-long-vowels',
    title: 'long vowels',
    pattern: 'ا / و / ي',
    helper:
      'ا, و, and ي can act like long vowels. Hold them slightly longer than short vowels.',
    examples: ['لا', 'وداعا', 'بخير'],
  },
  {
    id: 'ar-final-n',
    title: 'final n',
    pattern: 'tanween / final ن',
    helper:
      'Some Arabic endings have an audible final n sound. Do not drop the final n in words like شكراً.',
    examples: ['شكراً', 'أهلاً', 'نعم'],
  },
  {
    id: 'ar-hamza',
    title: 'hamza',
    pattern: 'ء',
    helper:
      'Hamza is a small glottal stop, like a brief catch in the throat before a vowel.',
    examples: ['أهلا', 'أنا', 'آسف'],
  },
  {
    id: 'ar-ayn',
    title: 'ayn',
    pattern: 'ع',
    helper:
      'ع is made deeper in the throat. Keep it voiced and gentle, not like a hard English vowel.',
    examples: ['اعذرني', 'على', 'مع'],
  },
  {
    id: 'ar-haa',
    title: 'deep h',
    pattern: 'ح',
    helper:
      'ح is a breathy throat sound. It is stronger and deeper than regular h.',
    examples: ['مرحبا', 'صباح', 'حال'],
  },
  {
    id: 'ar-khaa-ghayn',
    title: 'kh and gh',
    pattern: 'خ / غ',
    helper:
      'خ is a rough back-of-the-throat kh sound. غ is similar but voiced, like a deeper gh.',
    examples: ['الخير', 'قريبا', 'غالي'],
  },
  {
    id: 'ar-qaf-kaf',
    title: 'q and k',
    pattern: 'ق / ك',
    helper:
      'ق is farther back in the mouth than ك. Try not to make ق too light.',
    examples: ['قريبا', 'قبلة', 'كيف'],
  },
  {
    id: 'ar-emphatics',
    title: 'emphatic sounds',
    pattern: 'ص / ض / ط / ظ',
    helper:
      'These sounds are heavier than س, د, ت, and ز. Keep the tongue slightly back and the mouth more open.',
    examples: ['صباح', 'ضوء', 'طعام', 'ظريف'],
  },
  {
    id: 'ar-th-dh',
    title: 'th and dh',
    pattern: 'ث / ذ',
    helper:
      'ث is like a soft th sound. ذ is the voiced version, like dh.',
    examples: ['ثلاثة', 'هذا', 'اعذرني'],
  },
  {
    id: 'ar-sh',
    title: 'sh',
    pattern: 'ش',
    helper:
      'ش is like sh. Keep it smooth and clear.',
    examples: ['شكرا', 'شمس', 'شيء'],
  },
  {
    id: 'ar-article-sun-letters',
    title: 'sun letters',
    pattern: 'ال + sun letter',
    helper:
      'With sun letters, the l sound in ال blends into the next consonant. The next consonant sounds stronger.',
    examples: ['الشمس', 'الليل', 'الناس'],
  },
  {
    id: 'ar-r',
    title: 'r',
    pattern: 'ر',
    helper:
      'Arabic ر is usually a tap or light trill. Keep it clear, especially near the end of a word.',
    examples: ['مرحبا', 'شكرا', 'أراك'],
  },
];

export default pronunciationRules;