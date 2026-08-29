/**
 * Spanish curriculum labels.
 *
 * Pack-owned labels for “More Words” navigation.
 * Kept simple and safe for now.
 */

export function getMoreWordsPageName(nativeLanguage) {
  switch (nativeLanguage) {
    case 'es':
      return 'Más palabras';
    case 'en':
    default:
      return 'More Spanish Words';
  }
}

export function getMoreWordsLabel(nativeLanguage) {
  switch (nativeLanguage) {
    case 'es':
      return 'Más palabras';
    case 'en':
    default:
      return 'More Words';
  }
}

export default {
  getMoreWordsPageName,
  getMoreWordsLabel,
};