import { buildPronunciationHelper } from './pronunciationHelper';

// Pack-owned learner-facing helper text for word-library UI (Spanish native).
export function getWordLibraryHelper(word) {
  const result = buildPronunciationHelper(word);
  return String(result?.helperText || '').trim() || null;
}
export default getWordLibraryHelper;
