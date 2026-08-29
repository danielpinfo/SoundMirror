/**
 * Chinese pack-owned curriculum labels.
 *
 * These labels are intentionally owned by the language pack so the app shell
 * does not need language-specific naming logic.
 */

function normalizeNativeLanguage(nativeLanguage = '') {
  return String(nativeLanguage || '').trim().toLowerCase();
}

export function getMoreWordsPageName(nativeLanguage) {
  const lang = normalizeNativeLanguage(nativeLanguage);

  if (
    lang.startsWith('zh') ||
    lang.includes('chinese') ||
    lang.includes('mandarin') ||
    lang.includes('中文') ||
    lang.includes('普通话')
  ) {
    return '更多中文词语';
  }

  if (lang.startsWith('es') || lang.includes('spanish') || lang.includes('español')) {
    return 'Más palabras en chino';
  }

  if (lang.startsWith('fr') || lang.includes('french') || lang.includes('français')) {
    return 'Plus de mots en chinois';
  }

  if (lang.startsWith('it') || lang.includes('italian') || lang.includes('italiano')) {
    return 'Altre parole in cinese';
  }

  if (lang.startsWith('pt') || lang.includes('portugu')) {
    return 'Mais palavras em chinês';
  }

  if (lang.startsWith('de') || lang.includes('german') || lang.includes('deutsch')) {
    return 'Weitere Wörter auf Chinesisch';
  }

  if (lang.startsWith('ja') || lang.includes('japanese') || lang.includes('日本')) {
    return 'もっと中国語の言葉';
  }

  return 'More Chinese Words';
}

export function getMoreWordsLabel(nativeLanguage) {
  const lang = normalizeNativeLanguage(nativeLanguage);

  if (
    lang.startsWith('zh') ||
    lang.includes('chinese') ||
    lang.includes('mandarin') ||
    lang.includes('中文') ||
    lang.includes('普通话')
  ) {
    return '更多词语';
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

  if (lang.startsWith('ja') || lang.includes('japanese') || lang.includes('日本')) {
    return 'もっと言葉';
  }

  return 'More Words';
}