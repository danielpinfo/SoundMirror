import kuromojiBrowserRuntime from './vendor/kuromojiBrowserRuntime';

let tokenizer = null;
let initializationPromise = null;
let initializationError = null;

function browserDictionaryPath() {
  return '/languagepacks/ja/kuromoji/dict/';
}

function resolveBuilder(candidate) {
  if (!candidate?.builder) {
    throw new Error('Kuromoji builder is unavailable');
  }

  return candidate.builder.bind(candidate);
}

export async function initializeJapaneseReadingEngine(options = {}) {
  if (tokenizer) return tokenizer;
  if (initializationPromise) return initializationPromise;

  const dicPath = String(
    options.dicPath || browserDictionaryPath()
  );
  const kuromojiRuntime = typeof window === 'undefined'
    ? (await import('kuromoji')).default
    : kuromojiBrowserRuntime;

  initializationPromise = new Promise((resolve, reject) => {
    try {
      resolveBuilder(kuromojiRuntime)({ dicPath }).build((error, readyTokenizer) => {
        if (error) {
          initializationError = error;
          initializationPromise = null;
          reject(error);
          return;
        }

        tokenizer = readyTokenizer;
        initializationError = null;
        resolve(tokenizer);
      });
    } catch (error) {
      initializationError = error;
      initializationPromise = null;
      reject(error);
    }
  });

  return initializationPromise;
}

export function isJapaneseReadingEngineReady() {
  return Boolean(tokenizer);
}

export function getJapaneseReadingEngineError() {
  return initializationError;
}

function isUsableDictionaryValue(value) {
  const normalized = String(value || '').trim();
  return Boolean(normalized && normalized !== '*');
}

function isJapanesePunctuation(value) {
  return /^[\s\p{P}\p{S}。、・「」『』【】（）［］｛｝！？〜ー]*$/u.test(
    String(value || '')
  );
}

const FIXED_CONTEXTUAL_PRONUNCIATIONS = Object.freeze({
  こんにちは: 'コンニチワ',
  こんばんは: 'コンバンワ',
});

export function readJapaneseText(text = '') {
  const sourceText = String(text || '').normalize('NFC').trim();

  if (!sourceText) {
    return {
      sourceText: '',
      reading: '',
      pronunciation: '',
      tokens: [],
      unresolvedTokens: [],
      ready: Boolean(tokenizer),
    };
  }

  if (!tokenizer) {
    return {
      sourceText,
      reading: '',
      pronunciation: '',
      tokens: [],
      unresolvedTokens: [sourceText],
      ready: false,
      error:
        initializationError?.message ||
        'Japanese reading engine is not initialized',
    };
  }

  const analyzed = tokenizer.tokenize(sourceText);
  const unresolvedTokens = [];
  const tokens = analyzed.map((token, tokenIndex) => {
    const surface = String(token?.surface_form || '');
    const reading = isUsableDictionaryValue(token?.reading)
      ? String(token.reading)
      : '';
    const pronunciation = isUsableDictionaryValue(token?.pronunciation)
      ? String(token.pronunciation)
      : reading;
    const fallbackKana = /^[\p{Script=Hiragana}\p{Script=Katakana}ー]+$/u.test(
      surface
    )
      ? surface
      : '';
    // The dictionary pronunciation field can reinterpret an isolated kana
    // word as historical grammar (さいふ -> サイウ) or split it into a
    // leading particle (はち -> ワチ). The reading field preserves the
    // written morae and is the safer default for a pronunciation trainer.
    let resolvedPronunciation =
      (pronunciation.includes('ー') ? pronunciation : reading) ||
      pronunciation ||
      fallbackKana;

    // Apply the three spelling/pronunciation particle exceptions only when
    // Kuromoji has found an actual contextual particle. A leading は/へ is
    // kept literal so isolated words such as はち are not corrupted.
    if (String(token?.pos || '') === '助詞') {
      if (surface === 'を') resolvedPronunciation = 'オ';
      if (tokenIndex > 0 && surface === 'は') resolvedPronunciation = 'ワ';
      if (tokenIndex > 0 && surface === 'へ') resolvedPronunciation = 'エ';
    }

    if (!resolvedPronunciation && !isJapanesePunctuation(surface)) {
      unresolvedTokens.push(surface);
    }

    return {
      surface,
      reading: reading || fallbackKana,
      pronunciation: resolvedPronunciation,
      partOfSpeech: String(token?.pos || ''),
      wordType: String(token?.word_type || ''),
    };
  });

  const fixedPronunciation = FIXED_CONTEXTUAL_PRONUNCIATIONS[sourceText];
  if (fixedPronunciation && tokens.length === 1) {
    tokens[0] = { ...tokens[0], pronunciation: fixedPronunciation };
  }

  return {
    sourceText,
    reading: tokens.map((token) => token.reading).join(''),
    pronunciation: tokens
      .map((token) => token.pronunciation)
      .join(''),
    tokens,
    unresolvedTokens,
    ready: true,
  };
}

export default {
  initializeJapaneseReadingEngine,
  isJapaneseReadingEngineReady,
  getJapaneseReadingEngineError,
  readJapaneseText,
};
