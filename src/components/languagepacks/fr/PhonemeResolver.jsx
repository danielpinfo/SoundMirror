import { buildPronunciationHelper } from './pronunciationHelper';

const LEAD_IN_MS = 40;
const PAUSE_MS = 80;
const DEFAULT_HOLD = 130;
const VOWEL_HOLD = 160;
const VOWEL_FRAMES = new Set([1, 2, 3, 4, 5]);

function frameHold(frame) {
  return VOWEL_FRAMES.has(frame) ? VOWEL_HOLD : DEFAULT_HOLD;
}

function normalizeFrench(input = '') {
  return String(input || '').toLowerCase().normalize('NFC');
}

function baseVowel(ch = '') {
  switch (ch) {
    case 'à':
    case 'â':
      return 'a';
    case 'é':
    case 'è':
    case 'ê':
    case 'ë':
      return 'e';
    case 'î':
    case 'ï':
      return 'i';
    case 'ô':
      return 'o';
    case 'ù':
    case 'û':
    case 'ü':
      return 'u';
    case 'œ':
      return 'eu';
    default:
      return ch;
  }
}

function isVowel(ch = '') {
  return [
    'a',
    'e',
    'i',
    'o',
    'u',
    'à',
    'â',
    'é',
    'è',
    'ê',
    'ë',
    'î',
    'ï',
    'ô',
    'ù',
    'û',
    'ü',
    'y',
    'œ',
  ].includes(ch);
}

function startsWithAny(source, index, patterns) {
  return patterns.find((pattern) => source.startsWith(pattern, index)) || null;
}

function isNasalBlocked(nextChar = '') {
  return isVowel(nextChar) || nextChar === 'n' || nextChar === 'm';
}

function startsWithLiaisonVowel(word = '') {
  const first = word[0] || '';
  return isVowel(first) || first === 'h';
}

export function resolveFrenchUnits(text) {
  const words = normalizeFrench(text).split(/\s+/).filter(Boolean);

  const resolvedWords = words.map((word, wordIndex) => {
    const nextWord = words[wordIndex + 1] || '';
    const units = [];
    let i = 0;

    const push = (key, label = key) => units.push({ key, label });

    while (i < word.length) {
      const c3 = word.slice(i, i + 3);
      const c2 = word.slice(i, i + 2);
      const c1 = word[i];
      const next = word[i + 1] || '';
      const prev = word[i - 1] || '';
      const isFinal = i === word.length - 1;

      if (c3 === 'eau') {
        push('o', 'o');
        i += 3;
        continue;
      }

      if (c2 === 'au') {
        push('o', 'o');
        i += 2;
        continue;
      }

      const inPattern = startsWithAny(word, i, [
        'ain',
        'ein',
        'in',
        'im',
        'yn',
        'ym',
      ]);

      if (
        inPattern &&
        !isNasalBlocked(word[i + inPattern.length] || '')
      ) {
        push('in', 'in');
        i += inPattern.length;
        continue;
      }

      const anPattern = startsWithAny(word, i, [
        'an',
        'am',
        'en',
        'em',
      ]);

      if (
        anPattern &&
        !isNasalBlocked(word[i + anPattern.length] || '')
      ) {
        push('an', 'an');
        i += anPattern.length;
        continue;
      }

      const onPattern = startsWithAny(word, i, ['on', 'om']);

      if (
        onPattern &&
        !isNasalBlocked(word[i + onPattern.length] || '')
      ) {
        push('on', 'on');
        i += onPattern.length;
        continue;
      }

      const unPattern = startsWithAny(word, i, ['un', 'um']);

      if (
        unPattern &&
        !isNasalBlocked(word[i + unPattern.length] || '')
      ) {
        push('un', 'un');
        i += unPattern.length;
        continue;
      }

      if (c2 === 'gn') {
        push('ny', 'ny');
        i += 2;
        continue;
      }

      if (c2 === 'oi') {
        push('wa', 'wa');
        i += 2;
        continue;
      }

      if (c2 === 'ou') {
        push('oo', 'oo');
        i += 2;
        continue;
      }

      if (c2 === 'eu' || c2 === 'œu') {
        push('eu', 'eu');
        i += 2;
        continue;
      }

      if (c2 === 'ch') {
        push('sh', 'sh');
        i += 2;
        continue;
      }

      if (c2 === 'ph') {
        push('f', 'f');
        i += 2;
        continue;
      }

      if (c2 === 'qu') {
        push('k', 'k');
        i += 2;
        continue;
      }

      if (c1 === 'ç') {
        push('s', 's');
        i += 1;
        continue;
      }

      if (c1 === 'c') {
        if (
          [
            'e',
            'i',
            'y',
            'é',
            'è',
            'ê',
            'ë',
            'î',
            'ï',
          ].includes(next)
        ) {
          push('s', 's');
        } else {
          push('k', 'k');
        }

        i += 1;
        continue;
      }

      if (c1 === 'g') {
        if (
          [
            'e',
            'i',
            'y',
            'é',
            'è',
            'ê',
            'ë',
            'î',
            'ï',
          ].includes(next)
        ) {
          push('zh', 'zh');
        } else {
          push('g', 'g');
        }

        i += 1;
        continue;
      }

      if (c1 === 'h') {
        i += 1;
        continue;
      }

      if (c1 === 'j') {
        push('zh', 'zh');
        i += 1;
        continue;
      }

      if (c1 === 's') {
        if (c2 === 'ss') {
          push('s', 's');
          i += 2;
          continue;
        }

        if (isVowel(prev) && isVowel(next)) {
          push('z', 'z');
          i += 1;
          continue;
        }

        if (isFinal) {
          if (startsWithLiaisonVowel(nextWord)) {
            push('s', 's');
          }

          i += 1;
          continue;
        }

        push('s', 's');
        i += 1;
        continue;
      }

      if (['t', 'd', 'p', 'x'].includes(c1) && isFinal) {
        if (startsWithLiaisonVowel(nextWord)) {
          push(c1, c1);
        }

        i += 1;
        continue;
      }

      if (isVowel(c1)) {
        const v = baseVowel(c1);
        push(v, v);
        i += 1;
        continue;
      }

      push(c1, c1);
      i += 1;
    }

    return {
      raw: word,
      units,
    };
  });

  return { resolvedWords };
}

function unitToToken(unit) {
  const frame = {
    a: 1,
    an: 1,
    e: 2,
    o: 2,
    on: 2,
    wa: 2,
    eu: 4,
    i: 3,
    in: 3,
    un: 3,
    u: 5,
    oo: 5,
    k: 6,
    g: 6,
    t: 7,
    d: 7,
    b: 8,
    p: 8,
    m: 8,
    n: 9,
    ny: 9,
    s: 11,
    z: 11,
    sh: 12,
    zh: 12,
    f: 14,
    v: 14,
    r: 17,
    l: 18,
    y: 19,
  }[unit.key] ?? 0;

  return {
    phoneme: unit.key,
    label: unit.label,
    frame,
    holdMs: frameHold(frame),
    trill: false,
  };
}

function buildHelperText(text, resolvedWords) {
  const helperResult = buildPronunciationHelper(text);

  const helperText = String(
    helperResult?.helperText ||
      helperResult?.display ||
      helperResult?.pronunciation ||
      ''
  ).trim();

  if (helperText) {
    return helperText;
  }

  return resolvedWords
    .map((wordEntry) =>
      wordEntry.units.map((u) => u.label).join('-')
    )
    .join(' ');
}

function buildUntimedLearning(resolvedWords) {
  const expectedPhonemes = [];
  const expectedFrames = [];
  const tokens = [];
  const tokenGroups = [];

  for (const wordEntry of resolvedWords) {
    const groupTokens = [];

    for (const unit of wordEntry.units) {
      const token = unitToToken(unit);

      const entry = {
        phoneme: token.phoneme,
        label: token.label,
        frame: token.frame,
      };

      expectedPhonemes.push(token.phoneme);
      expectedFrames.push(token.frame);
      tokens.push(entry);
      groupTokens.push(entry);
    }

    tokenGroups.push({
      raw: wordEntry.raw,
      tokens: groupTokens,
      expectedPhonemes: groupTokens.map((t) => t.phoneme),
      expectedFrames: groupTokens.map((t) => t.frame),
    });
  }

  return {
    expectedPhonemes,
    expectedFrames,
    tokens,
    tokenGroups,
  };
}

export class PhonemeResolver {
  resolveUntimed(text) {
    const original = String(text || '').trim();

    if (!original) {
      return {
        normalizedText: '',
        helperText: '',
        pronunciation: '',
        expectedPhonemes: [],
        expectedFrames: [],
        tokens: [],
        tokenGroups: [],
      };
    }

    const normalizedText = normalizeFrench(original);
    const { resolvedWords } = resolveFrenchUnits(original);

    const helperText = buildHelperText(
      original,
      resolvedWords
    );

    const pronunciation = helperText;
    const untimed = buildUntimedLearning(resolvedWords);

    return {
      normalizedText,
      helperText,
      pronunciation,
      expectedPhonemes: untimed.expectedPhonemes,
      expectedFrames: untimed.expectedFrames,
      tokens: untimed.tokens,
      tokenGroups: untimed.tokenGroups,
    };
  }

  resolve(text, lang = 'fr') {
    const word = String(text || '').trim();

    if (!word) {
      return {
        word: '',
        helperText: '',
        phonemes: [],
        frames: [0, 0],
        pronunciation: '',
        phonemeTimeline: [],
        ipaPhonemes: [],
      };
    }

    const { resolvedWords } = resolveFrenchUnits(word);
    const allTokens = [];

    resolvedWords.forEach((wordEntry, wi) => {
      if (wi > 0) {
        allTokens.push(null);
      }

      wordEntry.units.forEach((unit) =>
        allTokens.push(unitToToken(unit))
      );
    });

    const helperText = buildHelperText(
      word,
      resolvedWords
    );

    const pronunciation = helperText;
    const frameSequence = [0];
    const phonemeTimeline = [];
    const phonemes = [];
    let cursor = LEAD_IN_MS;

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: 0,
      endMs: LEAD_IN_MS,
    });

    for (const token of allTokens) {
      if (token === null) {
        frameSequence.push(0);

        phonemeTimeline.push({
          phoneme: 'pause',
          label: '',
          frame: 0,
          startMs: cursor,
          endMs: cursor + PAUSE_MS,
        });

        cursor += PAUSE_MS;
        continue;
      }

      frameSequence.push(token.frame);

      phonemeTimeline.push({
        phoneme: token.phoneme,
        label: token.label,
        frame: token.frame,
        startMs: cursor,
        endMs: cursor + token.holdMs,
      });

      phonemes.push(token.phoneme);
      cursor += token.holdMs;
    }

    frameSequence.push(0);

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: cursor,
      endMs: cursor + LEAD_IN_MS,
    });

    return {
      word,
      helperText,
      phonemes,
      frames: frameSequence,
      pronunciation,
      phonemeTimeline,
      ipaPhonemes: [],
    };
  }
}

export default PhonemeResolver;