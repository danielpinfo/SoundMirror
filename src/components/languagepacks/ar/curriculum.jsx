/**
 * Arabic pack-owned curriculum labels.
 *
 * These labels are intentionally owned by the language pack so the app shell
 * does not need Arabic-specific naming logic.
 *
 * RTL is a presentation concern. These strings may be Arabic, but internal
 * pack logic must keep normal token/order processing.
 */

function normalizeNativeLanguage(nativeLanguage = '') {
  return String(nativeLanguage || '').trim().toLowerCase();
}

export function getMoreWordsPageName(nativeLanguage) {
  const lang = normalizeNativeLanguage(nativeLanguage);

  if (
    lang.startsWith('ar') ||
    lang.includes('arabic') ||
    lang.includes('العربية') ||
    lang.includes('عربي')
  ) {
    return 'كلمات عربية أكثر';
  }

  if (lang.startsWith('es') || lang.includes('spanish') || lang.includes('español')) {
    return 'Más palabras en árabe';
  }

  if (lang.startsWith('fr') || lang.includes('french') || lang.includes('français')) {
    return 'Plus de mots en arabe';
  }

  if (lang.startsWith('it') || lang.includes('italian') || lang.includes('italiano')) {
    return 'Altre parole in arabo';
  }

  if (lang.startsWith('pt') || lang.includes('portugu')) {
    return 'Mais palavras em árabe';
  }

  if (lang.startsWith('de') || lang.includes('german') || lang.includes('deutsch')) {
    return 'Weitere Wörter auf Arabisch';
  }

  if (lang.startsWith('ja') || lang.includes('japanese') || lang.includes('日本')) {
    return 'もっとアラビア語の言葉';
  }

  if (
    lang.startsWith('zh') ||
    lang.includes('chinese') ||
    lang.includes('mandarin') ||
    lang.includes('中文') ||
    lang.includes('普通话')
  ) {
    return '更多阿拉伯语词语';
  }

  return 'More Arabic Words';
}

export function getMoreWordsLabel(nativeLanguage) {
  const lang = normalizeNativeLanguage(nativeLanguage);

  if (
    lang.startsWith('ar') ||
    lang.includes('arabic') ||
    lang.includes('العربية') ||
    lang.includes('عربي')
  ) {
    return 'كلمات أكثر';
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

  if (
    lang.startsWith('zh') ||
    lang.includes('chinese') ||
    lang.includes('mandarin') ||
    lang.includes('中文') ||
    lang.includes('普通话')
  ) {
    return '更多词语';
  }

  return 'More Words';
}