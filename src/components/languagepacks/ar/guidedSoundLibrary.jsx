/**
 * Arabic guided-sound cues.
 *
 * Arabic diacritics keep TTS on the sound instead of the alphabet name. Each
 * consonant uses a short fatha carrier; vowels use a hamza carrier so they can
 * be spoken and animated in isolation.
 */

const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';

const CONSONANT_CUES = Object.freeze({
  ب: `ب${FATHA}`,
  ت: `ت${FATHA}`,
  ث: `ث${FATHA}`,
  ج: `ج${FATHA}`,
  ح: `ح${FATHA}`,
  خ: `خ${FATHA}`,
  د: `د${FATHA}`,
  ذ: `ذ${FATHA}`,
  ر: `ر${FATHA}`,
  ز: `ز${FATHA}`,
  س: `س${FATHA}`,
  ش: `ش${FATHA}`,
  ص: `ص${FATHA}`,
  ض: `ض${FATHA}`,
  ط: `ط${FATHA}`,
  ظ: `ظ${FATHA}`,
  ع: `ع${FATHA}`,
  غ: `غ${FATHA}`,
  ف: `ف${FATHA}`,
  ق: `ق${FATHA}`,
  ك: `ك${FATHA}`,
  ل: `ل${FATHA}`,
  م: `م${FATHA}`,
  ن: `ن${FATHA}`,
  ه: `ه${FATHA}`,
  و: `و${FATHA}`,
  ي: `ي${FATHA}`,
  ء: `أ${FATHA}`,
});

const VOWEL_CUES = Object.freeze({
  'V:a': { ttsText: `أ${FATHA}`, expectedPhonemes: ['C:ء', 'V:a'] },
  'V:i': { ttsText: `إ${KASRA}`, expectedPhonemes: ['C:ء', 'V:i'] },
  'V:u': { ttsText: `أ${DAMMA}`, expectedPhonemes: ['C:ء', 'V:u'] },
  'V:ا': { ttsText: 'آ', expectedPhonemes: ['C:ء', 'V:ا'] },
  'V:و': { ttsText: `أ${DAMMA}و`, expectedPhonemes: ['C:ء', 'V:و'] },
  'V:ي': { ttsText: `إ${KASRA}ي`, expectedPhonemes: ['C:ء', 'V:ي'] },
});

function normalizeTarget(rawPhoneme) {
  const value = String(rawPhoneme || '').normalize('NFC').trim();
  if (!value) return null;
  const canonical = value.match(/^([cv]):(.+)$/i);
  if (canonical) {
    return `${canonical[1].toUpperCase()}:${canonical[2]}`;
  }
  if (Object.prototype.hasOwnProperty.call(CONSONANT_CUES, value)) {
    return `C:${value}`;
  }
  if (['a', 'i', 'u', 'ا', 'و', 'ي'].includes(value)) return `V:${value}`;
  return null;
}

export function getGuidedSoundCue(rawPhoneme) {
  const targetPhoneme = normalizeTarget(rawPhoneme);
  if (!targetPhoneme) return null;

  if (targetPhoneme.startsWith('C:')) {
    const consonant = targetPhoneme.slice(2);
    const ttsText = CONSONANT_CUES[consonant];
    if (!ttsText) return null;

    const expectedPhonemes = [targetPhoneme, 'V:a'];
    return {
      ttsText,
      displayText: ttsText,
      expectedPhonemes,
      targetPhoneme,
      targetExpectedIndex: 0,
      rtl: true,
    };
  }

  const cue = VOWEL_CUES[targetPhoneme];
  if (!cue) return null;

  return {
    ...cue,
    displayText: cue.ttsText,
    targetPhoneme,
    targetExpectedIndex: cue.expectedPhonemes.indexOf(targetPhoneme),
    rtl: true,
  };
}

export default {
  ...Object.fromEntries(
    Object.entries(CONSONANT_CUES).map(([consonant, ttsText]) => [
      `C:${consonant}`,
      {
        ttsText,
        displayText: ttsText,
        expectedPhonemes: [`C:${consonant}`, 'V:a'],
      },
    ])
  ),
  ...VOWEL_CUES,
};
