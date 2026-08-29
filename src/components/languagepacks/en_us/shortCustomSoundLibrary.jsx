/**
 * English short custom carrier syllables.
 *
 * Two-letter consonant + a entries are teaching cues, not dictionary words.
 * Keeping helper text, canonical phonemes, and IPA together prevents TTS from
 * spelling the letters or applying another language's letter-to-sound rules.
 */
const CONSONANT_CARRIERS = Object.freeze({
  b: Object.freeze({ helperStem: 'b', phonemes: ['b'], ipa: 'b' }),
  c: Object.freeze({ helperStem: 'k', phonemes: ['k'], ipa: 'k' }),
  d: Object.freeze({ helperStem: 'd', phonemes: ['d'], ipa: 'd' }),
  f: Object.freeze({ helperStem: 'f', phonemes: ['f'], ipa: 'f' }),
  g: Object.freeze({ helperStem: 'g', phonemes: ['g'], ipa: 'ɡ' }),
  h: Object.freeze({ helperStem: 'h', phonemes: ['h'], ipa: 'h' }),
  j: Object.freeze({ helperStem: 'j', phonemes: ['j'], ipa: 'dʒ' }),
  k: Object.freeze({ helperStem: 'k', phonemes: ['k'], ipa: 'k' }),
  l: Object.freeze({ helperStem: 'l', phonemes: ['l'], ipa: 'l' }),
  m: Object.freeze({ helperStem: 'm', phonemes: ['m'], ipa: 'm' }),
  n: Object.freeze({ helperStem: 'n', phonemes: ['n'], ipa: 'n' }),
  p: Object.freeze({ helperStem: 'p', phonemes: ['p'], ipa: 'p' }),
  q: Object.freeze({ helperStem: 'k', phonemes: ['k'], ipa: 'k' }),
  r: Object.freeze({ helperStem: 'r', phonemes: ['r'], ipa: 'ɹ' }),
  s: Object.freeze({ helperStem: 's', phonemes: ['s'], ipa: 's' }),
  t: Object.freeze({ helperStem: 't', phonemes: ['t'], ipa: 't' }),
  v: Object.freeze({ helperStem: 'v', phonemes: ['v'], ipa: 'v' }),
  w: Object.freeze({ helperStem: 'w', phonemes: ['w'], ipa: 'w' }),
  x: Object.freeze({ helperStem: 'ks', phonemes: ['k', 's'], ipa: 'ks' }),
  y: Object.freeze({ helperStem: 'y', phonemes: ['y'], ipa: 'j' }),
  z: Object.freeze({ helperStem: 'z', phonemes: ['z'], ipa: 'z' }),
});

export function getShortCustomSoundCue(rawText) {
  const text = String(rawText || '').trim().toLowerCase();
  if (!/^[bcdfghjklmnpqrstvwxyz]a$/.test(text)) return null;

  const carrier = CONSONANT_CARRIERS[text[0]];
  if (!carrier) return null;

  const helperText = `${carrier.helperStem}ah`;
  const expectedPhonemes = [...carrier.phonemes, 'aa'];
  const ipa = `${carrier.ipa}ɑ`;

  return {
    text,
    helperText,
    expectedPhonemes,
    ipa,
    ttsSsml:
      `<speak><phoneme alphabet="ipa" ph="${ipa}">${text}</phoneme></speak>`,
  };
}

export default {
  getShortCustomSoundCue,
};
