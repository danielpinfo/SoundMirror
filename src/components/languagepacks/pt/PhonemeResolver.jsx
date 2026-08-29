import { buildPronunciationHelper } from './pronunciationHelper';
import { phonemeToFrameIndex } from './articulationMap';

const LEAD_IN_MS = 40;
const PAUSE_MS = 80;
const DEFAULT_HOLD = 130;
const VOWEL_HOLD = 160;
const VOWEL_FRAMES = new Set([1, 2, 3, 4, 5]);

function frameHold(frame) {
  return VOWEL_FRAMES.has(frame) ? VOWEL_HOLD : DEFAULT_HOLD;
}

function normalizePortuguese(input = '') {
  return String(input || '')
    .toLowerCase()
    .normalize('NFC');
}

function isVowel(ch = '') {
  return [
    'a',
    'e',
    'i',
    'o',
    'u',
    'á',
    'à',
    'â',
    'ã',
    'é',
    'ê',
    'í',
    'ó',
    'ô',
    'õ',
    'ú',
  ].includes(ch);
}

function isFrontVowel(ch = '') {
  return ['e', 'é', 'ê', 'i', 'í'].includes(ch);
}

function baseVowel(ch = '') {
  switch (ch) {
    case 'á':
    case 'à':
    case 'â':
    case 'ã':
      return 'a';

    case 'é':
    case 'ê':
      return 'e';

    case 'í':
      return 'i';

    case 'ó':
    case 'ô':
    case 'õ':
      return 'o';

    case 'ú':
      return 'u';

    default:
      return ch;
  }
}

function isVoicedConsonantLetter(ch = '') {
  return [
    'b',
    'd',
    'g',
    'j',
    'l',
    'm',
    'n',
    'r',
    'v',
    'z',
  ].includes(ch);
}

function isIgnorableCharacter(ch = '') {
  return /[-‐-–—'’.,!?;:()[\]{}"]/u.test(ch);
}

function resolveXSound(word, index, push) {
  /*
   * Portuguese X is language- and word-dependent.
   * Resolve known Portuguese patterns here rather than assigning X
   * directly to a universal physical frame.
   */

  const prev = word[index - 1] || '';
  const next = word[index + 1] || '';

  // Common SH-family words/stems.
  if (
    word.startsWith('caix') ||
    word.startsWith('baix') ||
    word.startsWith('deix')
  ) {
    push('sh', 'sh');
    return;
  }

  // Common S-family words/stems.
  if (
    word.startsWith('próxim') ||
    word.startsWith('proxim') ||
    word.startsWith('máxim') ||
    word.startsWith('maxim')
  ) {
    push('s', 's');
    return;
  }

  // Initial X is commonly the SH-family articulation.
  if (index === 0) {
    push('sh', 'sh');
    return;
  }

  // ENX- commonly uses the SH-family articulation.
  if (
    index >= 2 &&
    word[index - 2] === 'e' &&
    prev === 'n'
  ) {
    push('sh', 'sh');
    return;
  }

  /*
   * Initial EX-:
   * before a vowel, use the voiced Z-family articulation;
   * before a consonant, use the S-family articulation.
   */
  if (index === 1 && word[0] === 'e') {
    if (isVowel(next)) {
      push('z', 'z');
    } else {
      push('s', 's');
    }
    return;
  }

  /*
   * Remaining X cases use the common KS sequence rather than
   * inventing a single X frame.
   */
  push('k', 'k');
  push('s', 's');
}

export function resolvePortugueseUnits(word) {
  const s = normalizePortuguese(word);
  const units = [];
  let i = 0;

  const push = (key, label = key) => {
    units.push({ key, label });
  };

  while (i < s.length) {
    const c2 = s.slice(i, i + 2);
    const c1 = s[i];
    const next = s[i + 1] || '';
    const prev = s[i - 1] || '';
    const next2 = s[i + 2] || '';

    // -----------------------------------------------------------------------
    // Portuguese digraphs
    // -----------------------------------------------------------------------

    if (c2 === 'nh') {
      push('ny', 'ny');
      i += 2;
      continue;
    }

    if (c2 === 'lh') {
      push('ly', 'ly');
      i += 2;
      continue;
    }

    if (c2 === 'ch') {
      push('sh', 'sh');
      i += 2;
      continue;
    }

    if (c2 === 'rr') {
      push('rr', 'rr');
      i += 2;
      continue;
    }

    if (c2 === 'ss') {
      push('s', 's');
      i += 2;
      continue;
    }

    /*
     * SC before E/I represents one S-family articulation.
     * Do not generate two S frames.
     */
    if (
      c2 === 'sc' &&
      isFrontVowel(next2)
    ) {
      push('s', 's');
      i += 2;
      continue;
    }

    if (c2 === 'sç') {
      push('s', 's');
      i += 2;
      continue;
    }

    /*
     * XC before E/I, as in excelente, represents one S-family
     * articulation here rather than X + soft C as separate frames.
     */
    if (
      c2 === 'xc' &&
      isFrontVowel(next2)
    ) {
      push('s', 's');
      i += 2;
      continue;
    }

    // -----------------------------------------------------------------------
    // QU / GU
    // -----------------------------------------------------------------------

    if (
      c1 === 'q' &&
      next === 'u' &&
      isFrontVowel(next2)
    ) {
      push('k', 'k');
      push(baseVowel(next2), baseVowel(next2));
      i += 3;
      continue;
    }

    if (
      c1 === 'g' &&
      next === 'u' &&
      isFrontVowel(next2)
    ) {
      push('g', 'g');
      push(baseVowel(next2), baseVowel(next2));
      i += 3;
      continue;
    }

    // -----------------------------------------------------------------------
    // Portuguese nasal vowel units
    // -----------------------------------------------------------------------

    if (c2 === 'ão') {
      push('anw', 'anw');
      i += 2;
      continue;
    }

    if (c2 === 'ãe') {
      push('ane', 'ane');
      i += 2;
      continue;
    }

    if (c2 === 'õe') {
      push('one', 'one');
      i += 2;
      continue;
    }

    if (c1 === 'ã') {
      push('an', 'an');
      i += 1;
      continue;
    }

    if (c1 === 'õ') {
      push('on', 'on');
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // Q
    // -----------------------------------------------------------------------

    if (c1 === 'q') {
      if (
        next === 'u' &&
        ['a', 'á', 'à', 'â', 'ã', 'o', 'ó', 'ô', 'õ'].includes(next2)
      ) {
        push('k', 'k');
        push('w', 'w');
        i += 2;
        continue;
      }

      push('k', 'k');
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // Brazilian Portuguese palatalisation
    // -----------------------------------------------------------------------

    if (
      c1 === 'd' &&
      ['i', 'í'].includes(next)
    ) {
      push('zh', 'zh');
      i += 1;
      continue;
    }

    if (
      c1 === 't' &&
      ['i', 'í'].includes(next)
    ) {
      push('sh', 'sh');
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // G / C
    // -----------------------------------------------------------------------

    if (c1 === 'g') {
      if (isFrontVowel(next)) {
        push('zh', 'zh');
        i += 1;
        continue;
      }

      push('g', 'g');
      i += 1;
      continue;
    }

    if (c1 === 'c') {
      if (isFrontVowel(next)) {
        push('s', 's');
        i += 1;
        continue;
      }

      push('k', 'k');
      i += 1;
      continue;
    }

    if (c1 === 'ç') {
      push('s', 's');
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // X
    // -----------------------------------------------------------------------

    if (c1 === 'x') {
      resolveXSound(s, i, push);
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // S / Z / J
    // -----------------------------------------------------------------------

    if (c1 === 's') {
      if (
        isVowel(prev) &&
        isVowel(next)
      ) {
        push('z', 'z');
        i += 1;
        continue;
      }

      /*
       * S before a voiced consonant inside a word is voiced.
       * Examples include the sound pattern found in mesmo,
       * desde and desligado.
       */
      if (
        i > 0 &&
        isVoicedConsonantLetter(next)
      ) {
        push('z', 'z');
        i += 1;
        continue;
      }

      push('s', 's');
      i += 1;
      continue;
    }

    if (c1 === 'z') {
      push('z', 'z');
      i += 1;
      continue;
    }

    if (c1 === 'j') {
      push('zh', 'zh');
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // R
    // -----------------------------------------------------------------------

    if (c1 === 'r') {
      if (i === 0) {
        push('rr', 'rr');
        i += 1;
        continue;
      }

      if (
        isVowel(prev) &&
        isVowel(next)
      ) {
        push('r', 'r');
        i += 1;
        continue;
      }

      push('r', 'r');
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // L
    // Brazilian Portuguese syllable-final L uses the W-family articulation.
    // -----------------------------------------------------------------------

    if (c1 === 'l') {
      if (
        !next ||
        !isVowel(next)
      ) {
        push('w', 'w');
        i += 1;
        continue;
      }

      push('l', 'l');
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // H
    // -----------------------------------------------------------------------

    if (c1 === 'h') {
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // Vowels / diphthongs / nasalisation
    // -----------------------------------------------------------------------

    if (isVowel(c1)) {
      const vowel = baseVowel(c1);

      if (
        vowel === 'e' &&
        next === 'i'
      ) {
        push('ei', 'ei');
        i += 2;
        continue;
      }

      if (
        vowel === 'a' &&
        next === 'u'
      ) {
        push('au', 'au');
        i += 2;
        continue;
      }

      /*
       * A vowel followed by M/N in syllable-coda position is treated
       * as a nasal vowel unit. Do not consume N when it begins NH.
       */
      const nasalCoda =
        (next === 'm' || next === 'n') &&
        !(next === 'n' && next2 === 'h') &&
        (!next2 || !isVowel(next2));

      if (nasalCoda) {
        const nasalMap = {
          a: 'an',
          e: 'en',
          i: 'in',
          o: 'on',
          u: 'un',
        };

        const nasal = nasalMap[vowel];

        if (nasal) {
          push(nasal, nasal);
          i += 2;
          continue;
        }
      }

      push(vowel, vowel);
      i += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // Common literal consonants already represented by Portuguese frame truth
    // -----------------------------------------------------------------------

    if (c1 === 'k') {
      push('k', 'k');
      i += 1;
      continue;
    }

    if (c1 === 'w') {
      push('w', 'w');
      i += 1;
      continue;
    }

    /*
     * Punctuation and hyphens are not spoken articulation frames.
     * They must never create accidental frame-00 flashes inside a word.
     */
    if (isIgnorableCharacter(c1)) {
      i += 1;
      continue;
    }

    /*
     * Preserve any remaining literal unit for diagnostics.
     * unitToToken will refuse to silently convert an unmapped sound
     * into frame 00.
     */
    if (c1.trim()) {
      push(c1, c1);
    }

    i += 1;
  }

  return units;
}

function unitToToken(unit) {
  const frame = phonemeToFrameIndex[unit.key];

  if (!Number.isInteger(frame)) {
    console.warn(
      '[PT PhonemeResolver] Unmapped Portuguese unit ignored:',
      unit.key
    );

    return null;
  }

  return {
    phoneme: unit.key,
    label: unit.label,
    frame,
    holdMs: frameHold(frame),
    trill: false,
  };
}

function resolveVisibleHelperText(
  text,
  fallbackText = ''
) {
  const helperResult =
    buildPronunciationHelper(text);

  const helperText = String(
    helperResult?.helperText ||
      helperResult?.display ||
      helperResult?.pronunciation ||
      ''
  ).trim();

  return helperText || fallbackText;
}

function resolveUntimedPortuguese(text = '') {
  const word = String(text || '').trim();

  if (!word) {
    return {
      word: '',
      normalizedText: '',
      helperText: '',
      phonemes: [],
      expectedPhonemes: [],
      frames: [0, 0],
      expectedFrames: [0, 0],
      pronunciation: '',
      ipaPhonemes: [],
      tokenGroups: [],
    };
  }

  const words =
    word.split(/\s+/).filter(Boolean);

  const resolvedWords = words.map(
    (rawWord) => {
      const units =
        resolvePortugueseUnits(rawWord);

      const tokens = units
        .map(unitToToken)
        .filter(Boolean);

      return {
        rawText: rawWord,
        units,
        tokens,

        helperText:
          units
            .map((unit) => unit.label)
            .join('-'),

        phonemes:
          tokens.map(
            (token) => token.phoneme
          ),

        frames:
          tokens.map(
            (token) => token.frame
          ),
      };
    }
  );

  const tokens =
    resolvedWords.flatMap(
      (group) => group.tokens
    );

  const phonemes =
    tokens.map(
      (token) => token.phoneme
    );

  const innerFrames =
    tokens.map(
      (token) => token.frame
    );

  const fallbackHelperText =
    resolvedWords
      .map(
        (group) => group.helperText
      )
      .join(' ');

  const helperText =
    resolveVisibleHelperText(
      word,
      fallbackHelperText
    );

  const pronunciation =
    helperText;

  return {
    word,
    normalizedText:
      normalizePortuguese(word),

    helperText,

    phonemes,
    expectedPhonemes: phonemes,

    frames: [
      0,
      ...innerFrames,
      0,
    ],

    expectedFrames: [
      0,
      ...innerFrames,
      0,
    ],

    pronunciation,
    ipaPhonemes: [],

    tokenGroups:
      resolvedWords.map(
        (group) => ({
          rawText: group.rawText,
          word: group.rawText,

          helperText:
            group.helperText,

          phonemes:
            group.phonemes,

          expectedPhonemes:
            group.phonemes,

          frames:
            group.frames,

          expectedFrames:
            group.frames,
        })
      ),
  };
}

export class PhonemeResolver {
  resolveUntimed(text, lang = 'pt') {
    return resolveUntimedPortuguese(
      text,
      lang
    );
  }

  resolve(text, lang = 'pt') {
    const word =
      String(text || '').trim();

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

    const words =
      word.split(/\s+/).filter(Boolean);

    const resolvedWords =
      words.map(resolvePortugueseUnits);

    const allTokens = [];

    resolvedWords.forEach(
      (units, wordIndex) => {
        if (wordIndex > 0) {
          allTokens.push(null);
        }

        units.forEach((unit) => {
          const token =
            unitToToken(unit);

          if (token) {
            allTokens.push(token);
          }
        });
      }
    );

    const fallbackHelperText =
      resolvedWords
        .map(
          (units) =>
            units
              .map(
                (unit) => unit.label
              )
              .join('-')
        )
        .join(' ');

    const helperText =
      resolveVisibleHelperText(
        word,
        fallbackHelperText
      );

    const pronunciation =
      helperText;

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
          kind: 'spacer',
          frame: 0,
          startMs: cursor,
          endMs: cursor + PAUSE_MS,
        });

        cursor += PAUSE_MS;
        continue;
      }

      frameSequence.push(
        token.frame
      );

      phonemeTimeline.push({
        phoneme:
          token.phoneme,

        label:
          token.label,

        kind: 'speech',

        frame:
          token.frame,

        startMs:
          cursor,

        endMs:
          cursor +
          token.holdMs,
      });

      phonemes.push(
        token.phoneme
      );

      cursor +=
        token.holdMs;
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