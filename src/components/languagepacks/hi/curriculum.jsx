export function getMoreWordsPageName(nativeLanguage) {
  const lang = String(nativeLanguage || '').toLowerCase();
  if (lang.startsWith('hi') || lang.includes('hindi') || lang.includes('हिन्दी')) return 'और हिंदी शब्द';
  if (lang.startsWith('es') || lang.includes('spanish')) return 'Más palabras en hindi';
  return 'More Hindi Words';
}

export function getMoreWordsLabel(nativeLanguage) {
  const lang = String(nativeLanguage || '').toLowerCase();
  if (lang.startsWith('hi') || lang.includes('hindi') || lang.includes('हिन्दी')) return 'और शब्द';
  if (lang.startsWith('es') || lang.includes('spanish')) return 'Más palabras';
  return 'More Words';
}
