/**
 * Japanese pack-owned curriculum labels.
 *
 * These labels are intentionally owned by the language pack so the app shell
 * does not need language-specific naming logic.
 */

function normalizeNativeLanguage(nativeLanguage = '') {
  return String(nativeLanguage || '').trim().toLowerCase();
}

export function getMoreWordsPageName(nativeLanguage) {
  const lang = normalizeNativeLanguage(nativeLanguage);

  if (lang.startsWith('ja') || lang.includes('japanese') || lang.includes('日本')) {
    return 'もっと日本語の言葉';
  }

  if (lang.startsWith('es') || lang.includes('spanish') || lang.includes('español')) {
    return 'Más palabras en japonés';
  }

  if (lang.startsWith('fr') || lang.includes('french') || lang.includes('français')) {
    return 'Plus de mots en japonais';
  }

  if (lang.startsWith('it') || lang.includes('italian') || lang.includes('italiano')) {
    return 'Altre parole in giapponese';
  }

  if (lang.startsWith('pt') || lang.includes('portugu')) {
    return 'Mais palavras em japonês';
  }

  if (lang.startsWith('de') || lang.includes('german') || lang.includes('deutsch')) {
    return 'Weitere Wörter auf Japanisch';
  }

  return 'More Japanese Words';
}

export function getMoreWordsLabel(nativeLanguage) {
  const lang = normalizeNativeLanguage(nativeLanguage);

  if (lang.startsWith('ja') || lang.includes('japanese') || lang.includes('日本')) {
    return 'もっと言葉';
  }

  if (lang.startsWith('es') || lang.includes('spanish') || lang.includes('español')) {
    return 'Más palabras';
  }

  if (lang.startsWith('fr') || lang.includes('french') || lang.includes('français')) {
    return 'Plus de mots';
  }

  if (lang.startsWith('it') || lang.includes('italian') || lang.includes('italiano')) {
    return 'Altre parole';
  }

  if (lang.startsWith('pt') || lang.includes('portugu')) {
    return 'Mais palavras';
  }

  if (lang.startsWith('de') || lang.includes('german') || lang.includes('deutsch')) {
    return 'Weitere Wörter';
  }

  return 'More Words';
}