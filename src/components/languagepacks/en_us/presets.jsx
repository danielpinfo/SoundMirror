/**
 * Canonical English (US) practice presets.
 *
 * Runtime buttons and pronunciation-helper audits import these same arrays so
 * the visible presets cannot drift away from the certified helper corpus.
 */
export const ENGLISH_PRESET_WORDS = Object.freeze([
  { id: 'en-word-1', practice: 'Hello' },
  { id: 'en-word-2', practice: 'Hi' },
  { id: 'en-word-3', practice: 'Smile' },
  { id: 'en-word-4', practice: 'Thanks' },
  { id: 'en-word-5', practice: 'Sorry' },
  { id: 'en-word-6', practice: 'Yes' },
  { id: 'en-word-7', practice: 'No' },
  { id: 'en-word-8', practice: 'Welcome' },
  { id: 'en-word-9', practice: 'Goodbye' },
  { id: 'en-word-10', practice: 'Kiss' },
]);

export const ENGLISH_PRESET_PHRASES = Object.freeze([
  { id: 'en-phrase-1', practice: 'Good morning' },
  { id: 'en-phrase-2', practice: 'Excuse me' },
  { id: 'en-phrase-3', practice: 'Good evening' },
  { id: 'en-phrase-4', practice: 'How are you' },
  { id: 'en-phrase-5', practice: 'I am fine' },
  { id: 'en-phrase-6', practice: 'Thank you' },
  { id: 'en-phrase-7', practice: 'See you soon' },
  { id: 'en-phrase-8', practice: 'Good night' },
]);

export default {
  words: ENGLISH_PRESET_WORDS,
  phrases: ENGLISH_PRESET_PHRASES,
};
