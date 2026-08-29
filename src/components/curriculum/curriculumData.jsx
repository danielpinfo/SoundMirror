/**
 * Structured Lesson Curriculum
 * Organised by difficulty: Sounds → Syllables → Words → Phrases
 * Each lesson has a target, phoneme hints, and a pass threshold (0-100).
 */

export const CURRICULUM = [
  {
    level: 1,
    title: 'Single Sounds',
    description: 'Master individual vowels and consonants',
    color: '#34d399',
    lessons: [
      { id: 'l1-ah',  word: 'ah',   label: 'Open Vowel /ɑ/',    hint: 'Open your mouth wide like a doctor visit', passScore: 70 },
      { id: 'l1-ee',  word: 'ee',   label: 'Long E /iː/',        hint: 'Spread your lips like a big smile',        passScore: 70 },
      { id: 'l1-oo',  word: 'oo',   label: 'Long OO /uː/',       hint: 'Round your lips into a tight circle',      passScore: 70 },
      { id: 'l1-mm',  word: 'mmm',  label: 'Nasal /m/',          hint: 'Press lips together, hum gently',          passScore: 70 },
      { id: 'l1-ss',  word: 'sss',  label: 'Sibilant /s/',       hint: 'Air passes through your teeth',            passScore: 70 },
      { id: 'l1-sh',  word: 'shh',  label: 'Hushing /ʃ/',        hint: 'Lips slightly rounded, tongue raised',     passScore: 70 },
    ],
  },
  {
    level: 2,
    title: 'Syllables',
    description: 'Combine sounds into simple syllables',
    color: '#60a5fa',
    lessons: [
      { id: 'l2-ma',  word: 'ma',   label: '/m/ + /ɑ/',  hint: 'Close lips then open wide',          passScore: 72 },
      { id: 'l2-ba',  word: 'ba',   label: '/b/ + /ɑ/',  hint: 'Pop lips open for the B',            passScore: 72 },
      { id: 'l2-see', word: 'see',  label: '/s/ + /iː/', hint: 'Hiss then stretch your lips',        passScore: 72 },
      { id: 'l2-no',  word: 'no',   label: '/n/ + /oʊ/', hint: 'Tongue tip up then lips round',      passScore: 72 },
      { id: 'l2-hi',  word: 'hi',   label: '/h/ + /aɪ/', hint: 'Breathe out then open jaw',          passScore: 72 },
      { id: 'l2-go',  word: 'go',   label: '/ɡ/ + /oʊ/', hint: 'Back of tongue then lip rounding',   passScore: 72 },
    ],
  },
  {
    level: 3,
    title: 'Words',
    description: 'Practice common everyday words',
    color: '#f59e0b',
    lessons: [
      { id: 'l3-hello',     word: 'hello',     label: 'Greeting',    hint: 'heh-LOW — stress the second syllable',         passScore: 75 },
      { id: 'l3-water',     word: 'water',     label: 'Basic Noun',  hint: 'WAW-ter — open jaw for the W',                 passScore: 75 },
      { id: 'l3-please',    word: 'please',    label: 'Politeness',  hint: 'PLEEZ — hold the long E',                      passScore: 75 },
      { id: 'l3-thank',     word: 'thank',     label: 'Gratitude',   hint: 'th is a soft tongue-tip sound',                passScore: 75 },
      { id: 'l3-beautiful', word: 'beautiful', label: 'Adjective',   hint: 'BYOO-tih-ful — three syllables',               passScore: 75 },
      { id: 'l3-practice',  word: 'practice',  label: 'Action',      hint: 'PRAK-tis — two crisp syllables',               passScore: 75 },
      { id: 'l3-excellent', word: 'excellent', label: 'Praise Word', hint: 'EK-seh-lent — three syllables, stress first',  passScore: 75 },
    ],
  },
  {
    level: 4,
    title: 'Phrases',
    description: 'Put it all together in real sentences',
    color: '#a78bfa',
    lessons: [
      { id: 'l4-good-morning', word: 'good morning',       label: 'Morning Greeting',  hint: 'Soften the G, long O in morning',         passScore: 78 },
      { id: 'l4-thank-you',    word: 'thank you',           label: 'Thanks',            hint: 'Link the two words smoothly',             passScore: 78 },
      { id: 'l4-how-are-you',  word: 'how are you',         label: 'Asking / Caring',   hint: 'OW sound in how, relax the are',          passScore: 78 },
      { id: 'l4-i-love-you',   word: 'i love you',          label: 'Affection',         hint: 'Three clear words, stress love',           passScore: 78 },
      { id: 'l4-good-evening', word: 'good evening',        label: 'Evening Greeting',  hint: 'EEV-ning — long E start',                 passScore: 78 },
      { id: 'l4-sorry',        word: 'sorry',               label: 'Apology',           hint: 'SAW-ree — open O then long E',            passScore: 78 },
    ],
  },
];