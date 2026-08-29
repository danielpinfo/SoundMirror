import universal500 from './universal500';
import { resolveHindiReading } from './hindiReadingEngine';

export const HINDI_PRESET_WORDS = Object.freeze([
  'नमस्ते', 'हाय', 'मुस्कान', 'धन्यवाद', 'माफ़ी',
  'हाँ', 'नहीं', 'स्वागत', 'अलविदा', 'चुंबन',
]);

export const HINDI_PRESET_PHRASES = Object.freeze([
  'सुप्रभात', 'माफ़ कीजिए', 'शुभ संध्या', 'आप कैसे हैं?',
  'मैं ठीक हूँ।', 'बहुत धन्यवाद।', 'फिर मिलेंगे', 'शुभ रात्रि',
]);

function collectUniversal500Words() {
  return Array.isArray(universal500)
    ? universal500.flatMap((group) =>
        Array.isArray(group?.words) ? group.words : []
      )
    : [];
}

export function buildPronunciationHelper(text = '') {
  const result = resolveHindiReading(text);
  const helperText = String(result.helperText || '').trim();
  const approved =
    result.approved === true &&
    helperText.length > 0 &&
    result.phonemes.length === result.helperTokens.length;

  return {
    ...result,
    kind: result.words.length > 1 ? 'phrase' : 'word',
    display: helperText,
    helperText,
    pronunciation: result.pronunciation,
    status: approved ? 'approved' : 'unresolved',
    approved,
    reviewRequired: !approved,
    unresolved: !approved,
    humanReviewed: result.approvalSource === 'reviewed-hindi-exception',
    mechanicallyValidated: approved,
  };
}

export function runPronunciationHelperAudit({
  presetWords = HINDI_PRESET_WORDS,
  presetPhrases = HINDI_PRESET_PHRASES,
  includeUniversal500 = true,
} = {}) {
  const libraryWords = includeUniversal500 ? collectUniversal500Words() : [];
  const entries = [
    ...presetWords.map((text) => ({ corpus: 'preset-word', text })),
    ...presetPhrases.map((text) => ({ corpus: 'preset-phrase', text })),
    ...libraryWords.map((text) => ({ corpus: 'universal500', text })),
  ];
  const items = entries.map((entry, index) => {
    const result = buildPronunciationHelper(entry.text);
    return {
      id: `hi-helper-${String(index + 1).padStart(4, '0')}`,
      ...entry,
      status: result.status,
      approved: result.approved,
      reviewRequired: result.reviewRequired,
      unresolved: result.unresolved,
      display: result.display,
      validation: result.validation,
      result,
    };
  });
  const approved = items.filter((item) => item.approved).length;
  const review = items.filter(
    (item) => item.reviewRequired && !item.unresolved
  ).length;
  const unresolved = items.filter((item) => item.unresolved).length;

  return {
    languageImplemented: true,
    language: 'hi',
    items,
    approvedItems: items.filter((item) => item.approved),
    reviewItems: items.filter((item) => item.status === 'review'),
    unresolvedItems: items.filter((item) => item.unresolved),
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
  buildPronunciationHelper,
  runPronunciationHelperAudit,
};
