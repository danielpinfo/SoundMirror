/** Pack-private Hindi cues for guided single-sound recovery. */

import PhonemeResolver from './PhonemeResolver';

const resolver = new PhonemeResolver();

const SOUND_CUES = Object.freeze({
  a: 'अ', aa: 'आ', i: 'इ', ii: 'ई', u: 'उ', uu: 'ऊ', e: 'ए', ai: 'ऐ', o: 'ओ', au: 'औ',
  k: 'क', kh: 'ख', g: 'ग', gh: 'घ', ng: 'ङ',
  ch: 'च', chh: 'छ', j: 'ज', jh: 'झ', ny: 'ञ',
  tt: 'ट', tth: 'ठ', dd: 'ड', ddh: 'ढ', nn: 'ण',
  t: 'त', th: 'थ', d: 'द', dh: 'ध', n: 'न',
  p: 'प', ph: 'फ', b: 'ब', bh: 'भ', m: 'म',
  y: 'य', r: 'र', l: 'ल', v: 'व', sh: 'श', ssh: 'ष', s: 'स', h: 'ह',
  q: 'क़', x: 'ख़', ghh: 'ग़', z: 'ज़', rr: 'ड़', rrh: 'ढ़', f: 'फ़', zh: 'झ़',
});

export function getGuidedSoundCue(rawPhoneme) {
  const targetPhoneme = String(rawPhoneme || '').trim().toLowerCase();
  const ttsText = SOUND_CUES[targetPhoneme];
  if (!ttsText) return null;
  const resolved = resolver.resolveUntimed(ttsText);
  const targetExpectedIndex = resolved.expectedPhonemes.indexOf(targetPhoneme);
  if (targetExpectedIndex < 0) return null;
  return {
    ttsText,
    displayText: ttsText,
    helperText: resolved.helperText,
    pronunciation: resolved.pronunciation,
    expectedPhonemes: resolved.expectedPhonemes,
    targetPhoneme,
    requestedPhoneme: targetPhoneme,
    targetExpectedIndex,
  };
}

export function getHindiGuidedSoundInventory() {
  return Object.keys(SOUND_CUES);
}

export default SOUND_CUES;
