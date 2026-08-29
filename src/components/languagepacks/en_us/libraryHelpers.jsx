import { buildEnglishPronunciationHelper } from './pronunciationHelper';

// Pack-owned learner-facing helper text for the English 500+ library UI.

export function getWordLibraryHelper(word) {
  const result = buildEnglishPronunciationHelper(word);
  return String(result?.helperText || '').trim() || null;
}

export default getWordLibraryHelper;
