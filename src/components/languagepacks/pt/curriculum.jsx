/**
 * Portuguese pack-owned curriculum labels.
 *
 * These labels are intentionally owned by the language pack so the app shell
 * does not need language-specific naming logic.
 */

function normalizeNativeLanguage(nativeLanguage = '') {
  return String(nativeLanguage || '').trim().toLowerCase();
}

export function getMoreWordsPageName(nativeLanguage) {
  const lang = normalizeNativeLanguage(nativeLanguage);

  if (lang.startsWith('pt') || lang.includes('portugu')) {
    return 'Mais palavras em português';
  }

  if (lang.startsWith('es') || lang.includes('spanish') || lang.includes('español')) {
    return 'Más palabras en portugués';
  }

  if (lang.startsWith('fr') || lang.includes('french') || lang.includes('français')) {
    return 'Plus de mots en portugais';
  }

  if (lang.startsWith('it') || lang.includes('italian') || lang.includes('italiano')) {
    return 'Altre parole in portoghese';
  }

  if (lang.startsWith('de') || lang.includes('german') || lang.includes('deutsch')) {
    return 'Weitere Wörter auf Portugiesisch';
  }

  return 'More Portuguese Words';
}

export function getMoreWordsLabel(nativeLanguage) {
  const lang = normalizeNativeLanguage(nativeLanguage);

  if (lang.startsWith('pt') || lang.includes('portugu')) {
    return 'Mais palavras';
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

  if (lang.startsWith('de') || lang.includes('german') || lang.includes('deutsch')) {
    return 'Weitere Wörter';
  }

  return 'More Words';
}