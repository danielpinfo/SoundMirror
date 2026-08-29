/**
 * Italian curriculum labels.
 *
 * Pack-owned labels for “More Words” navigation.
 * Kept simple and safe for now.
 */

export function getMoreWordsPageName(nativeLanguage) {
  switch (nativeLanguage) {
    case 'it':
      return 'Altre parole';
    case 'en':
    default:
      return 'More Italian Words';
  }
}

export function getMoreWordsLabel(nativeLanguage) {
  switch (nativeLanguage) {
    case 'it':
      return 'Altre parole';
    case 'en':
    default:
      return 'More Words';
  }
}

export default {
  getMoreWordsPageName,
  getMoreWordsLabel,
};