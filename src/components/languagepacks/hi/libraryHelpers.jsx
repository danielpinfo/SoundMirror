import { buildPronunciationHelper } from './pronunciationHelper';

export function getWordLibraryHelper(word) {
  const result = buildPronunciationHelper(word);
  return result.approved ? result.helperText : null;
}
export default getWordLibraryHelper;
