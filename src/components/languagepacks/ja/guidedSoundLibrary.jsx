/** Native Japanese cues for guided single-sound recovery. */

import PhonemeResolver, { initializeJapaneseResolver } from './PhonemeResolver';

const resolver = new PhonemeResolver();

const SOUND_CUES = Object.freeze({
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  k: 'か', g: 'が', s: 'さ', z: 'ざ', sh: 'しゃ', j: 'じゃ',
  t: 'た', d: 'だ', ch: 'ちゃ', ts: 'つ', n: 'な',
  h: 'ハ', f: 'ふ', b: 'ば', p: 'ぱ', m: 'ま',
  y: 'や', r: 'ら', w: 'わ', v: 'ヴァ',
  ng: 'ん', l: 'ら',
});

function normalizeTarget(rawPhoneme) {
  return String(rawPhoneme || '').trim().toLowerCase();
}

function buildCue(targetPhoneme, ttsText) {
  const resolved = resolver.resolveUntimed(ttsText, 'ja');
  const expectedPhonemes = Array.isArray(resolved?.expectedPhonemes)
    ? resolved.expectedPhonemes
    : [];
  const lookupTarget = targetPhoneme === 'ng'
    ? 'n'
    : targetPhoneme === 'l'
      ? 'r'
      : targetPhoneme;
  const targetExpectedIndex = expectedPhonemes.indexOf(lookupTarget);

  if (targetExpectedIndex < 0) return null;

  return {
    ttsText,
    displayText: ttsText,
    helperText: resolved.helperText,
    pronunciation: resolved.pronunciation,
    readingKana: resolved.readingKana,
    pronunciationKana: resolved.pronunciationKana,
    expectedPhonemes,
    targetPhoneme: lookupTarget,
    requestedPhoneme: targetPhoneme,
    targetExpectedIndex,
  };
}

export async function initializeJapaneseGuidedSoundLibrary(options = {}) {
  return initializeJapaneseResolver(options);
}

export function getGuidedSoundCue(rawPhoneme) {
  const targetPhoneme = normalizeTarget(rawPhoneme);
  const ttsText = SOUND_CUES[targetPhoneme] || null;
  return ttsText ? buildCue(targetPhoneme, ttsText) : null;
}

export function getJapaneseGuidedSoundInventory() {
  return Object.keys(SOUND_CUES);
}

export default SOUND_CUES;
