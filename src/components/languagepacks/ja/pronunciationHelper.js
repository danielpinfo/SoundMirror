/** Contextual Japanese helper generation backed by the pack-local resolver. */

import PhonemeResolver, { initializeJapaneseResolver } from './PhonemeResolver';
import universal500 from './universal500';

export const JAPANESE_PRESET_WORDS = Object.freeze([
  'こんにちは', 'やあ', '笑顔', 'ありがとう', 'ごめん',
  'はい', 'いいえ', 'ようこそ', 'さようなら', 'キス',
]);

export const JAPANESE_PRESET_PHRASES = Object.freeze([
  'おはようございます', 'すみません', 'こんばんは', 'お元気ですか',
  '元気です', 'ありがとうございます', 'またね', 'おやすみなさい',
]);

const resolver = new PhonemeResolver();

function collectUniversal500Words() {
  return Array.isArray(universal500)
    ? universal500.flatMap((group) =>
        Array.isArray(group?.words) ? group.words : []
      )
    : [];
}

export async function initializeJapanesePronunciationHelper(options = {}) {
  return initializeJapaneseResolver(options);
}

export function buildPronunciationHelper(text = '') {
  const sourceText = String(text ?? '').normalize('NFC').trim();
  const resolved = /** @type {any} */ (
    resolver.resolveUntimed(sourceText, 'ja') || {}
  );
  const helperText = String(resolved.helperText || '').trim();
  const phonemes = Array.isArray(resolved.expectedPhonemes)
    ? resolved.expectedPhonemes
    : [];
  const frames = Array.isArray(resolved.expectedFrames)
    ? resolved.expectedFrames
    : [];
  const morae = Array.isArray(resolved.morae) ? resolved.morae : [];
  const approved =
    resolved.approved === true &&
    Boolean(helperText) &&
    morae.length > 0 &&
    phonemes.length > 0 &&
    phonemes.length === frames.length;

  return {
    language: 'ja',
    kind: Array.from(sourceText).length > 1 ? 'phrase' : 'word',
    text: sourceText,
    normalizedText: String(resolved.normalizedText || sourceText),
    display: helperText,
    helperText,
    pronunciation: helperText,
    readingKana: String(resolved.readingKana || ''),
    pronunciationKana: String(resolved.pronunciationKana || ''),
    morae,
    phonemes,
    frames,
    status: approved ? 'approved' : 'unresolved',
    approved,
    reviewRequired: !approved,
    unresolved: !approved,
    humanReviewed: false,
    mechanicallyValidated: approved,
    approvalSource: approved ? 'contextual-kuromoji-resolver' : null,
    validation: approved
      ? { valid: true, reason: null, issues: [] }
      : resolved.validation || {
          valid: false,
          reason: 'helper-not-produced',
          issues: [],
        },
  };
}

/**
 * @param {{
 *   presetWords?: readonly string[],
 *   presetPhrases?: readonly string[],
 *   includeUniversal500?: boolean,
 *   dicPath?: string,
 * }} [options]
 */
export async function runPronunciationHelperAudit({
  presetWords = JAPANESE_PRESET_WORDS,
  presetPhrases = JAPANESE_PRESET_PHRASES,
  includeUniversal500 = true,
  dicPath,
} = {}) {
  await initializeJapanesePronunciationHelper(dicPath ? { dicPath } : {});

  const libraryWords = includeUniversal500 ? collectUniversal500Words() : [];
  const entries = [
    ...presetWords.map((text) => ({ corpus: 'preset-word', text })),
    ...presetPhrases.map((text) => ({ corpus: 'preset-phrase', text })),
    ...libraryWords.map((text) => ({ corpus: 'universal500', text })),
  ];
  const items = entries.map((entry, index) => {
    const result = buildPronunciationHelper(entry.text);
    return {
      id: `ja-helper-${String(index + 1).padStart(4, '0')}`,
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
    language: 'ja',
    items,
    unresolvedItems: items.filter((item) => !item.approved),
    summary: {
      total: items.length,
      approved,
      review,
      unresolved,
      presetWords: presetWords.length,
      presetPhrases: presetPhrases.length,
      universal500: libraryWords.length,
    },
  };
}

export default {
  initializeJapanesePronunciationHelper,
  buildPronunciationHelper,
  runPronunciationHelperAudit,
};
