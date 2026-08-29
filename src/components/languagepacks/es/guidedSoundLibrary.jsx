/**
 * Spanish guided-sound cues.
 *
 * Spanish consonants are taught with the pack-native /a/ carrier. Each cue
 * owns an explicit IPA pronunciation so TTS cannot reinterpret a short cue as
 * alphabet names. The visible cue, animation phonemes, and grading truth stay
 * simple: ah, ba, ca, da, eh, fa, ga, ra, and so on.
 */
function buildCue(displayText, expectedPhonemes, ipa) {
  return {
    ttsText: displayText,
    displayText,
    helperText: displayText,
    pronunciation: displayText,
    expectedPhonemes,
    ttsSsml:
      `<speak><phoneme alphabet="ipa" ph="${ipa}">${displayText}</phoneme></speak>`,
  };
}

const guidedSoundLibrary = {
  a: buildCue('ah', ['a'], 'a'),
  e: buildCue('eh', ['e'], 'e'),
  i: buildCue('ee', ['i'], 'i'),
  o: buildCue('oh', ['o'], 'o'),
  u: buildCue('oo', ['u'], 'u'),

  b: buildCue('ba', ['b', 'a'], 'ba'),
  v: buildCue('va', ['v', 'a'], 'va'),
  p: buildCue('pa', ['p', 'a'], 'pa'),
  t: buildCue('ta', ['t', 'a'], 'ta'),
  d: buildCue('da', ['d', 'a'], 'da'),
  k: buildCue('ca', ['k', 'a'], 'ka'),
  g: buildCue('ga', ['g', 'a'], 'ga'),
  m: buildCue('ma', ['m', 'a'], 'ma'),
  n: buildCue('na', ['n', 'a'], 'na'),
  ny: buildCue('ña', ['ny', 'a'], 'ɲa'),
  f: buildCue('fa', ['f', 'a'], 'fa'),
  s: buildCue('sa', ['s', 'a'], 'sa'),
  h: buildCue('ja', ['h', 'a'], 'xa'),
  ch: buildCue('cha', ['ch', 'a'], 'tʃa'),
  r: buildCue('ra', ['r', 'a'], 'ɾa'),
  rr: buildCue('rra', ['rr', 'a'], 'ra'),
  l: buildCue('la', ['l', 'a'], 'la'),
  y: buildCue('ya', ['y', 'a'], 'ja'),
  w: buildCue('gua', ['g', 'w', 'a'], 'gwa'),
};

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
