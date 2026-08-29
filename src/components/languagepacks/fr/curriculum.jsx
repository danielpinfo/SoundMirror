/**
 * French curriculum labels.
 *
 * Pack-owned labels for “More Words” navigation.
 * Kept simple and safe for now.
 */

export function getMoreWordsPageName(nativeLanguage) {
  switch (nativeLanguage) {
    case 'fr':
      return 'Plus de mots';
    case 'en':
    default:
      return 'More French Words';
  }
}

export function getMoreWordsLabel(nativeLanguage) {
  switch (nativeLanguage) {
    case 'fr':
      return 'Plus de mots';
    case 'en':
    default:
      return 'More Words';
  }
}

export default {
  getMoreWordsPageName,
  getMoreWordsLabel,
};