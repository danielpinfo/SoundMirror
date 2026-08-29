export function buildPronunciationHelper(text = '') {
  const normalizedText = String(text ?? '').trim();

  return {
    text: normalizedText,
    normalizedText,
    display: '',
    helperText: '',
    status: 'unresolved',
    approved: false,
    reviewRequired: true,
    unresolved: true,
    words: [],
    validation: {
      valid: false,
      reason: 'Language-specific pronunciation helper not implemented yet',
    },
  };
}

export function runPronunciationHelperAudit() {
  return {
    languageImplemented: false,
    items: [],
    unresolvedItems: [],
    summary: {
      total: 0,
      approved: 0,
      review: 0,
      unresolved: 0,
      presetWords: 0,
      presetPhrases: 0,
      universal500: 0,
    },
  };
}

export default {
  buildPronunciationHelper,
  runPronunciationHelperAudit,
};