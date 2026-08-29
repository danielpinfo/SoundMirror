/**
 * Pack-owned Hindi Devanagari reading engine.
 *
 * The shared shell never interprets Hindi text. This module converts
 * Devanagari orthographic syllables into canonical Hindi phones, applies the
 * Hindi-only schwa model, and produces learner-facing helper chunks.
 */

import { predictOrthographicSchwa } from './hindiSchwaModel';

const NUKTA = '़';
const VIRAMA = '्';
const ZWJ = '\u200d';
const ZWNJ = '\u200c';

const INDEPENDENT_VOWELS = Object.freeze({
  अ: ['a'],
  आ: ['aa'],
  इ: ['i'],
  ई: ['ii'],
  उ: ['u'],
  ऊ: ['uu'],
  ऋ: ['r', 'i'],
  ॠ: ['r', 'ii'],
  ऌ: ['l', 'i'],
  ए: ['e'],
  ऐ: ['ai'],
  ऍ: ['ai'],
  ओ: ['o'],
  औ: ['au'],
  ऑ: ['au'],
});

const VOWEL_SIGNS = Object.freeze({
  'ा': ['aa'],
  'ि': ['i'],
  'ी': ['ii'],
  'ु': ['u'],
  'ू': ['uu'],
  'ृ': ['r', 'i'],
  'ॄ': ['r', 'ii'],
  'ॢ': ['l', 'i'],
  'ॣ': ['l', 'ii'],
  'े': ['e'],
  'ै': ['ai'],
  'ॅ': ['ai'],
  'ो': ['o'],
  'ौ': ['au'],
  'ॉ': ['au'],
});

const CONSONANTS = Object.freeze({
  क: 'k', ख: 'kh', ग: 'g', घ: 'gh', ङ: 'ng',
  च: 'ch', छ: 'chh', ज: 'j', झ: 'jh', ञ: 'ny',
  ट: 'tt', ठ: 'tth', ड: 'dd', ढ: 'ddh', ण: 'nn',
  त: 't', थ: 'th', द: 'd', ध: 'dh', न: 'n',
  प: 'p', फ: 'ph', ब: 'b', भ: 'bh', म: 'm',
  य: 'y', र: 'r', ल: 'l', व: 'v',
  श: 'sh', ष: 'ssh', स: 's', ह: 'h',

  // Precomposed Hindi/Urdu loan consonants.
  क़: 'q', ख़: 'x', ग़: 'ghh', ज़: 'z',
  ड़: 'rr', ढ़: 'rrh', फ़: 'f', य़: 'y',
});

const NUKTA_TRANSFORMS = Object.freeze({
  k: 'q', kh: 'x', g: 'ghh', j: 'z', jh: 'zh',
  dd: 'rr', ddh: 'rrh', ph: 'f', y: 'y',
});

const DISPLAY_TOKENS = Object.freeze({
  a: 'uh', aa: 'aa', i: 'i', ii: 'ee', u: 'u', uu: 'oo',
  e: 'e', ai: 'ai', o: 'o', au: 'au',
  k: 'k', kh: 'kh', g: 'g', gh: 'gh', ng: 'ng',
  ch: 'ch', chh: 'chh', j: 'j', jh: 'jh', ny: 'ny',
  tt: 'tt', tth: 'tth', dd: 'dd', ddh: 'ddh', nn: 'nn',
  t: 't', th: 'th', d: 'd', dh: 'dh', n: 'n',
  p: 'p', ph: 'ph', b: 'b', bh: 'bh', m: 'm',
  y: 'y', r: 'r', l: 'l', v: 'v',
  sh: 'sh', ssh: 'sh', s: 's', h: 'h',
  q: 'q', x: 'kh', ghh: 'gh', z: 'z',
  rr: 'rr', rrh: 'rrh', f: 'f', zh: 'zh',
  '~': 'n',
});

const VELAR_PHONES = new Set(['k', 'kh', 'g', 'gh', 'ng', 'q', 'x', 'ghh']);
const PALATAL_PHONES = new Set(['ch', 'chh', 'j', 'jh', 'ny', 'sh', 'ssh', 'zh']);
const RETROFLEX_PHONES = new Set(['tt', 'tth', 'dd', 'ddh', 'nn', 'rr', 'rrh']);
const DENTAL_PHONES = new Set(['t', 'th', 'd', 'dh', 'n', 's', 'z']);
const LABIAL_PHONES = new Set(['p', 'ph', 'b', 'bh', 'm', 'f', 'v']);

/**
 * Small reviewed layer for pronunciations whose morphology or loan history is
 * not recoverable from bare spelling. It supplements the model; it does not
 * replace arbitrary-word generation.
 */
const REVIEWED_PRONUNCIATIONS = Object.freeze({
  धन्यवाद: ['dh', 'a', 'n', 'y', 'a', 'v', 'aa', 'd'],
  सुप्रभात: ['s', 'u', 'p', 'r', 'a', 'bh', 'aa', 't'],
  नमस्ते: ['n', 'a', 'm', 'a', 's', 't', 'e'],
  नहीं: ['n', 'a', 'h', 'ii', '~'],
  फिर: ['f', 'i', 'r'],
});

function isDevanagari(value) {
  return /[\u0900-\u097f]/u.test(value);
}

function isIgnoredFormatMark(value) {
  return value === ZWJ || value === ZWNJ;
}

function clonePhone(phone, overrides = {}) {
  return { ...phone, ...overrides };
}

function makePhone(token, source, overrides = {}) {
  return {
    token,
    source,
    inherent: false,
    kind: 'phone',
    ...overrides,
  };
}

function findNextConsonantToken(phones, startIndex) {
  for (let index = startIndex + 1; index < phones.length; index += 1) {
    const token = phones[index]?.token;
    if (!token || token === 'a' || ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au', '~'].includes(token)) {
      continue;
    }
    return token;
  }
  return null;
}

function resolveAnusvara(nextToken) {
  if (!nextToken) return '~';
  if (VELAR_PHONES.has(nextToken)) return 'ng';
  if (PALATAL_PHONES.has(nextToken)) return 'ny';
  if (RETROFLEX_PHONES.has(nextToken)) return 'nn';
  if (DENTAL_PHONES.has(nextToken)) return 'n';
  if (LABIAL_PHONES.has(nextToken)) return 'm';
  return '~';
}

function parseOrthographicWord(rawWord) {
  const word = String(rawWord || '').normalize('NFC');
  const chars = Array.from(word);
  const phones = [];
  const issues = [];

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];

    if (isIgnoredFormatMark(char)) continue;

    if (INDEPENDENT_VOWELS[char]) {
      for (const token of INDEPENDENT_VOWELS[char]) {
        phones.push(makePhone(token, char, { kind: 'vowel' }));
      }
      continue;
    }

    if (CONSONANTS[char]) {
      let consonant = CONSONANTS[char];
      let source = char;

      if (chars[index + 1] === NUKTA) {
        consonant = NUKTA_TRANSFORMS[consonant] || consonant;
        source += NUKTA;
        index += 1;
      }

      phones.push(makePhone(consonant, source, { kind: 'consonant' }));

      const next = chars[index + 1];
      if (next === VIRAMA) {
        index += 1;
        while (isIgnoredFormatMark(chars[index + 1])) index += 1;
        continue;
      }

      if (VOWEL_SIGNS[next]) {
        for (const token of VOWEL_SIGNS[next]) {
          phones.push(makePhone(token, next, { kind: 'vowel' }));
        }
        index += 1;
        continue;
      }

      phones.push(makePhone('a', '', {
        kind: 'vowel',
        inherent: true,
        carrier: source,
      }));
      continue;
    }

    if (char === 'ं') {
      phones.push(makePhone('__anusvara__', char, { kind: 'modifier' }));
      continue;
    }

    if (char === 'ँ') {
      phones.push(makePhone('~', char, { kind: 'modifier' }));
      continue;
    }

    if (char === 'ः') {
      phones.push(makePhone('h', char, { kind: 'modifier' }));
      continue;
    }

    if (char === 'ऽ' || /[\s\p{P}\p{N}]/u.test(char)) continue;

    if (isDevanagari(char)) {
      issues.push({ code: 'unsupported-devanagari', character: char });
    } else if (/\p{L}/u.test(char)) {
      issues.push({ code: 'non-devanagari-letter', character: char });
    }
  }

  const assimilated = phones.map((phone, index) => {
    if (phone.token !== '__anusvara__') return phone;
    return clonePhone(phone, {
      token: resolveAnusvara(findNextConsonantToken(phones, index)),
    });
  });

  const reviewed = REVIEWED_PRONUNCIATIONS[word];
  if (reviewed) {
    return {
      word,
      phones: reviewed.map((token) => makePhone(token, '', {
        kind: ['a', 'aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au'].includes(token)
          ? 'vowel'
          : 'phone',
        reviewed: true,
      })),
      issues,
      approvalSource: 'reviewed-hindi-exception',
    };
  }

  const tokenSequence = assimilated.map((phone) => phone.token);
  const filtered = assimilated.filter((phone, index) => {
    if (!phone.inherent || phone.token !== 'a') return true;

    // Spoken Hindi overwhelmingly suppresses a word-final orthographic schwa.
    if (index === assimilated.length - 1) return false;

    return predictOrthographicSchwa(tokenSequence, index).retain;
  });

  return {
    word,
    phones: filtered,
    issues,
    approvalSource: 'hindi-orthographic-schwa-model',
  };
}

function splitWords(text) {
  return String(text || '')
    .normalize('NFC')
    .split(/\s+/u)
    .map((word) => word.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, ''))
    .filter(Boolean);
}

export function displayHindiToken(token) {
  return DISPLAY_TOKENS[token] || String(token || '');
}

export function resolveHindiReading(text = '') {
  const sourceText = String(text || '').normalize('NFC').trim();
  const sourceWords = splitWords(sourceText);
  const words = sourceWords.map(parseOrthographicWord);
  const issues = words.flatMap((word) => word.issues);
  const phones = words.flatMap((word) => word.phones);
  const phonemes = phones.map((phone) => phone.token);
  const helperTokens = phonemes.map(displayHindiToken);
  const helperText = words
    .map((word) => word.phones.map((phone) => displayHindiToken(phone.token)).join('-'))
    .filter(Boolean)
    .join(' ');
  const approved = Boolean(sourceText) && phonemes.length > 0 && issues.length === 0;

  return {
    language: 'hi',
    text: sourceText,
    normalizedText: sourceText,
    words,
    phones,
    phonemes,
    expectedPhonemes: phonemes,
    helperTokens,
    helperText,
    pronunciation: helperTokens.join(' '),
    approved,
    unresolved: !approved,
    reviewRequired: !approved,
    status: approved ? 'approved' : 'unresolved',
    approvalSource: words.every((word) => word.approvalSource === 'reviewed-hindi-exception')
      ? 'reviewed-hindi-exception'
      : 'hindi-pack-g2p-v1',
    validation: approved
      ? { valid: true, reason: null, issues: [] }
      : {
          valid: false,
          reason: !sourceText
            ? 'empty-input'
            : phonemes.length === 0
              ? 'no-hindi-phones'
              : 'unsupported-input',
          issues,
        },
  };
}

export function getHindiReadingControls() {
  return Object.freeze({
    नमस्ते: ['n', 'a', 'm', 'a', 's', 't', 'e'],
    धन्यवाद: ['dh', 'a', 'n', 'y', 'a', 'v', 'aa', 'd'],
    माफ़ी: ['m', 'aa', 'f', 'ii'],
    स्वागत: ['s', 'v', 'aa', 'g', 'a', 't'],
    अच्छा: ['a', 'ch', 'chh', 'aa'],
    कृपया: ['k', 'r', 'i', 'p', 'a', 'y', 'aa'],
    भारत: ['bh', 'aa', 'r', 'a', 't'],
    कमल: ['k', 'a', 'm', 'a', 'l'],
    शक्ति: ['sh', 'a', 'k', 't', 'i'],
    अंगूर: ['a', 'ng', 'g', 'uu', 'r'],
    अंडा: ['a', 'nn', 'dd', 'aa'],
  });
}

export default resolveHindiReading;
