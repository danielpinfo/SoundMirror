/**
 * English guided-sound teaching cues.
 *
 * An isolated consonant is not a useful TTS target: a speech engine may say
 * the letter name ("bee") or produce no usable audio at all.  These short
 * carrier syllables keep the coached sound first and add only enough vowel to
 * make it speakable and visible in the animation.
 *
 * This data is deliberately pack-owned.  Other languages must choose their
 * own carrier vowels, spelling, and canonical expected sounds.
 */
const guidedSoundLibrary = {
  // Vowels
  a:  { ttsText: 'at',  displayText: 'at',  expectedPhonemes: ['a', 't'] },
  aa: { ttsText: 'ah',  displayText: 'ah',  expectedPhonemes: ['aa'] },
  ah: { ttsText: 'up',  displayText: 'up',  expectedPhonemes: ['ah', 'p'] },
  e:  { ttsText: 'eh',  displayText: 'eh',  expectedPhonemes: ['e'] },
  ee: { ttsText: 'ee',  displayText: 'ee',  expectedPhonemes: ['ee'] },
  i:  { ttsText: 'it',  displayText: 'it',  expectedPhonemes: ['i', 't'] },
  ue: {
    ttsText: 'book',
    displayText: 'buhk',
    expectedPhonemes: ['b', 'ue', 'k'],

    /*
     * The compressed multilingual model consistently returns /o/ or /oo/
     * for its own 40%-speed "book" reference.  Guided recovery may accept
     * that beginner-close vowel after one retry; normal word grading remains
     * strict and continues to distinguish these English vowels.
     */
    acceptedTargetPhonemes: ['ue', 'o', 'oo'],
    closePassAfterFailures: 1,
    minCloseMouthScore: 0.55,
  },
  oo: { ttsText: 'ooh', displayText: 'oo',  expectedPhonemes: ['oo'] },
  o:  { ttsText: 'aw',  displayText: 'o',   expectedPhonemes: ['o'] },
  ow: { ttsText: 'oh',  displayText: 'oh',  expectedPhonemes: ['ow'] },
  aw: { ttsText: 'ow',  displayText: 'ow',  expectedPhonemes: ['aw'] },
  ai: { ttsText: 'eye', displayText: 'ai',  expectedPhonemes: ['ai'] },
  oi: { ttsText: 'oy',  displayText: 'oi',  expectedPhonemes: ['oi'] },
  er: { ttsText: 'err', displayText: 'er',  expectedPhonemes: ['er'] },
  ei: { ttsText: 'ay',  displayText: 'ei',  expectedPhonemes: ['ei'] },

  // Most consonants use AH as a carrier. English-only edge cases use a short
  // real word when the sound cannot occur naturally at the start of a syllable.
  b:  { ttsText: 'bah',   displayText: 'ba',   expectedPhonemes: ['b', 'aa'] },
  p:  { ttsText: 'pah',   displayText: 'pa',   expectedPhonemes: ['p', 'aa'] },
  t:  { ttsText: 'tah',   displayText: 'ta',   expectedPhonemes: ['t', 'aa'] },
  d:  { ttsText: 'dah',   displayText: 'da',   expectedPhonemes: ['d', 'aa'] },
  k:  { ttsText: 'kah',   displayText: 'ka',   expectedPhonemes: ['k', 'aa'] },
  g:  { ttsText: 'gah',   displayText: 'ga',   expectedPhonemes: ['g', 'aa'] },
  m:  { ttsText: 'mah',   displayText: 'ma',   expectedPhonemes: ['m', 'aa'] },
  n:  { ttsText: 'nah',   displayText: 'na',   expectedPhonemes: ['n', 'aa'] },
  ng: { ttsText: 'sing',  displayText: 'sing', expectedPhonemes: ['s', 'i', 'ng'] },
  f:  { ttsText: 'fah',   displayText: 'fa',   expectedPhonemes: ['f', 'aa'] },
  v:  { ttsText: 'vah',   displayText: 'va',   expectedPhonemes: ['v', 'aa'] },
  s:  { ttsText: 'sah',   displayText: 'sa',   expectedPhonemes: ['s', 'aa'] },
  z:  { ttsText: 'zah',   displayText: 'za',   expectedPhonemes: ['z', 'aa'] },
  sh: { ttsText: 'shah',  displayText: 'sha',  expectedPhonemes: ['sh', 'aa'] },
  zh: { ttsText: 'zhah',  displayText: 'zha',  expectedPhonemes: ['zh', 'aa'] },
  th: { ttsText: 'thaw',   displayText: 'tha',  expectedPhonemes: ['th', 'o'] },
  dh: { ttsText: 'that',   displayText: 'tha',  expectedPhonemes: ['dh', 'a', 't'] },
  h:  { ttsText: 'hah',   displayText: 'ha',   expectedPhonemes: ['h', 'aa'] },
  ch: { ttsText: 'chah',  displayText: 'cha',  expectedPhonemes: ['ch', 'aa'] },
  j:  { ttsText: 'jah',   displayText: 'ja',   expectedPhonemes: ['j', 'aa'] },
  r:  { ttsText: 'rah',   displayText: 'ra',   expectedPhonemes: ['r', 'aa'] },
  l:  { ttsText: 'lah',   displayText: 'la',   expectedPhonemes: ['l', 'aa'] },
  y:  { ttsText: 'yah',   displayText: 'ya',   expectedPhonemes: ['y', 'aa'] },
  w:  { ttsText: 'wah',   displayText: 'wa',   expectedPhonemes: ['w', 'aa'] },
};

Object.values(guidedSoundLibrary).forEach((cue) => {
  cue.helperText = cue.displayText;
  cue.pronunciation = cue.displayText;
});

export function getGuidedSoundCue(rawPhoneme) {
  const phoneme = String(rawPhoneme || '').trim().toLowerCase();
  const cue = guidedSoundLibrary[phoneme];

  if (!cue) return null;

  return {
    ...cue,
    targetPhoneme: phoneme,
    targetExpectedIndex: Math.max(0, cue.expectedPhonemes.indexOf(phoneme)),
  };
}

export default guidedSoundLibrary;
