export function getMoreWordsPageName(nativeLanguage) {
  return {
    es: 'MasPalabras',
    it: 'PiuParole',
    pt: 'MaisPalavras',
    de: 'MehrWorter',
    fr: 'PlusDeMots',
    ja: 'YoriOoiKotoba',
    zh: 'GengDuoDanCi',
    hi: 'ZyadaShabd',
    ar: 'KalimatArabia',
  }[nativeLanguage] || 'MorePracticeWords';
}

export function getMoreWordsLabel(nativeLanguage) {
  return {
    es: 'Más Palabras',
    it: 'Più Parole',
    pt: 'Mais Palavras',
    de: 'Mehr Wörter',
    fr: 'Plus de mots',
    ja: 'もっと単語',
    zh: '更多单词',
    hi: 'ज़्यादा शब्द',
    ar: 'كلمات أكثر',
  }[nativeLanguage] || 'More Practice Words';
}