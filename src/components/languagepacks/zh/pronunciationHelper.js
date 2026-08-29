/**
 * SoundMirror pronunciation helper — Mandarin Chinese (zh).
 *
 * Helpers are generated from complete words/phrases so polyphonic characters,
 * neutral tones, and connected-speech tone changes remain contextual.
 */

import PhonemeResolver from './PhonemeResolver';
import universal500 from './universal500';

export const CHINESE_PRESET_WORDS = Object.freeze([
  '你好',
  '嗨',
  '微笑',
  '谢谢',
  '对不起',
  '是',
  '不',
  '欢迎',
  '再见',
  '亲吻',
]);

export const CHINESE_PRESET_PHRASES = Object.freeze([
  '早上好',
  '不好意思',
  '晚上好',
  '你好吗',
  '我很好',
  '非常感谢',
  '回头见',
  '晚安',
]);

const resolver = new PhonemeResolver();

function collectUniversal500Words() {
  if (!Array.isArray(universal500)) return [];
  return universal500.flatMap((group) =>
    Array.isArray(group?.words) ? group.words : []
  );
}

export function buildPronunciationHelper(text = '') {
  const sourceText = String(text ?? '').normalize('NFC').trim();
  const resolved = resolver.resolveUntimed(sourceText, 'zh') || {};
  const helperText = String(resolved.helperText || '').trim();
  const phonemes = Array.isArray(resolved.expectedPhonemes)
    ? resolved.expectedPhonemes
    : [];
  const frames = Array.isArray(resolved.expectedFrames)
    ? resolved.expectedFrames
    : [];
  const tones = Array.isArray(resolved.tones) ? resolved.tones : [];
  const hasToneTruth =
    tones.length > 0 && tones.every((tone) => Number.isInteger(tone) && tone >= 0 && tone <= 4);
  const approved =
    resolved.approved === true &&
    Boolean(helperText) &&
    phonemes.length > 0 &&
    phonemes.length === frames.length &&
    hasToneTruth;

  return {
    language: 'zh',
    kind: sourceText.includes(' ') || Array.from(sourceText).length > 1 ? 'phrase' : 'word',
    text: sourceText,
    normalizedText: String(resolved.normalizedText || sourceText),
    display: helperText,
    helperText,
    pronunciation: helperText,
    pinyinNumbered: String(resolved.pinyinNumbered || ''),
    phonemes,
    frames,
    tones,
    surfaceTones: Array.isArray(resolved.surfaceTones)
      ? resolved.surfaceTones
      : [],
    acceptedToneSets: Array.isArray(resolved.acceptedToneSets)
      ? resolved.acceptedToneSets
      : [],
    syllables: Array.isArray(resolved.syllables) ? resolved.syllables : [],
    status: approved ? 'approved' : 'unresolved',
    approved,
    reviewRequired: !approved,
    unresolved: !approved,
    humanReviewed: false,
    mechanicallyValidated: approved,
    approvalSource: approved ? 'contextual-pinyin-pro-resolver' : null,
    validation: approved
      ? { valid: true, reason: null, issues: [] }
      : resolved.validation || {
          valid: false,
          reason: 'helper-not-produced',
          issues: [],
        },
  };
}

export function runPronunciationHelperAudit({
  presetWords = CHINESE_PRESET_WORDS,
  presetPhrases = CHINESE_PRESET_PHRASES,
  includeUniversal500 = true,
} = {}) {
  const entries = [
    ...presetWords.map((text) => ({ corpus: 'preset-word', text })),
    ...presetPhrases.map((text) => ({ corpus: 'preset-phrase', text })),
    ...(includeUniversal500 ? collectUniversal500Words() : []).map((text) => ({
      corpus: 'universal500',
      text,
    })),
  ];
  const items = entries.map((entry, index) => {
    const result = buildPronunciationHelper(entry.text);
    return {
      id: `zh-helper-${String(index + 1).padStart(4, '0')}`,
      ...entry,
      status: result.status,
      approved: result.approved,
      reviewRequired: result.reviewRequired,
      unresolved: result.unresolved,
      result,
      validation: result.validation,
    };
  });
  const approved = items.filter((item) => item.approved).length;
  const review = items.filter(
    (item) => item.reviewRequired && !item.unresolved
  ).length;
  const unresolved = items.filter((item) => item.unresolved).length;

  return {
    languageImplemented: true,
    language: 'zh',
    items,
    unresolvedItems: items.filter((item) => !item.approved),
    summary: {
      total: items.length,
      approved,
      review,
      unresolved,
      presetWords: presetWords.length,
      presetPhrases: presetPhrases.length,
      universal500: includeUniversal500
        ? collectUniversal500Words().length
        : 0,
    },
  };
}

export default {
  buildPronunciationHelper,
  runPronunciationHelperAudit,
};
