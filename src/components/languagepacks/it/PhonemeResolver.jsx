/**
 * PhonemeResolver — Italian (it)
 *
 * Pack-owned deterministic resolver.
 *
 * Keeps the legacy timed resolve() path intact.
 * Adds resolveUntimed(text) for AS/UAS expected phoneme input.
 *
 * Visible helper text comes from pronunciationHelper.js.
 * Hidden phonemes, frames, timing, and trill behaviour remain
 * controlled by this resolver.
 */

import {
  buildPronunciationHelper,
} from './pronunciationHelper';

const WORD_PAUSE_MS = 80;
const PUNCT_PAUSE_MS = 100;
const DEFAULT_HOLD = 130;
const VOWEL_HOLD = 160;
const LEAD_IN_MS = 120;

const RR_PULSE_MS = 60;
const RR_OPEN_MS = 40;
const RR_FRAMES = [17, 1, 17];
const RR_TOTAL_MS =
  RR_PULSE_MS +
  RR_OPEN_MS +
  RR_PULSE_MS;

const VOWEL_FRAMES = new Set([
  1,
  2,
  3,
  5,
]);

function frameHold(frame) {
  return VOWEL_FRAMES.has(frame)
    ? VOWEL_HOLD
    : DEFAULT_HOLD;
}

function normalizeItalian(input = '') {
  return String(input)
    .toLowerCase()
    .normalize('NFC');
}

function baseVowel(ch) {
  switch (ch) {
    case 'à':
      return 'a';

    case 'è':
      return 'e';

    case 'é':
      return 'e';

    case 'ì':
      return 'i';

    case 'ò':
      return 'o';

    case 'ù':
      return 'u';

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
    'è',
    'é',
    'ì',
    'ò',
    'ù',
  ].includes(ch);
}

function isLetter(ch = '') {
  return /[a-zàèéìòù]/i.test(ch);
}

function isConsonant(ch = '') {
  return (
    isLetter(ch) &&
    !isVowel(ch)
  );
}

function isWhitespace(ch = '') {
  return /\s/.test(ch);
}

function isPausePunctuation(ch = '') {
  return /[.,;:!?]/.test(ch);
}

function isPalatalGli(
  text,
  index
) {
  if (
    text.slice(
      index,
      index + 3
    ) !== 'gli'
  ) {
    return false;
  }

  const after =
    text[index + 3] || '';

  return (
    !after ||
    isVowel(after)
  );
}

export function resolveItalianUnits(
  segment
) {
  const text =
    normalizeItalian(segment);

  const units = [];
  let index = 0;

  const push = (
    key,
    label = key
  ) => {
    units.push({
      key,
      label,
    });
  };

  while (index < text.length) {
    const four =
      text.slice(
        index,
        index + 4
      );

    const triple =
      text.slice(
        index,
        index + 3
      );

    const pair =
      text.slice(
        index,
        index + 2
      );

    const current =
      text[index];

    const next =
      text[index + 1] || '';

    if (!isLetter(current)) {
      index += 1;
      continue;
    }

    /*
     * Italian palatal lateral.
     */
    if (
      isPalatalGli(
        text,
        index
      )
    ) {
      push('ly', 'ly');

      index += 3;
      continue;
    }

    /*
     * Italian palatal nasal.
     */
    if (pair === 'gn') {
      push('ny', 'ny');

      index += 2;
      continue;
    }

    /*
     * scia / scio / sciu.
     */
    if (
      four.startsWith('sci') &&
      [
        'a',
        'o',
        'u',
      ].includes(
        text[index + 3] || ''
      )
    ) {
      push('sh', 'sh');

      push(
        baseVowel(
          text[index + 3]
        ),
        baseVowel(
          text[index + 3]
        )
      );

      index += 4;
      continue;
    }

    if (triple === 'sce') {
      push('sh', 'sh');
      push('e', 'e');

      index += 3;
      continue;
    }

    if (triple === 'sci') {
      push('sh', 'sh');
      push('i', 'i');

      index += 3;
      continue;
    }

    /*
     * cia / cio / ciu.
     */
    if (
      [
        'cia',
        'cio',
        'ciu',
      ].includes(triple)
    ) {
      push('ch', 'ch');

      push(
        baseVowel(triple[2]),
        baseVowel(triple[2])
      );

      index += 3;
      continue;
    }

    /*
     * gia / gio / giu.
     */
    if (
      [
        'gia',
        'gio',
        'giu',
      ].includes(triple)
    ) {
      push('j', 'j');

      push(
        baseVowel(triple[2]),
        baseVowel(triple[2])
      );

      index += 3;
      continue;
    }

    /*
     * Hard c before e/i.
     */
    if (
      [
        'che',
        'chi',
      ].includes(triple)
    ) {
      push('k', 'k');

      index += 2;
      continue;
    }

    /*
     * Hard g before e/i.
     */
    if (
      [
        'ghe',
        'ghi',
      ].includes(triple)
    ) {
      push('g', 'g');

      index += 2;
      continue;
    }

    /*
     * qu = kw.
     */
    if (pair === 'qu') {
      push('k', 'k');
      push('w', 'w');

      index += 2;
      continue;
    }

    /*
     * buon / buona family.
     */
    if (triple === 'buo') {
      push('b', 'b');
      push('w', 'w');
      push('o', 'o');

      index += 3;
      continue;
    }

    /*
     * sc before e/i = sh.
     * Otherwise sc = sk.
     */
    if (pair === 'sc') {
      if (
        [
          'e',
          'i',
          'é',
          'è',
          'ì',
        ].includes(next)
      ) {
        push('sh', 'sh');
      } else {
        push('s', 's');
        push('k', 'k');
      }

      index += 2;
      continue;
    }

    /*
     * Doubled consonants.
     */
    if (
      pair.length === 2 &&
      pair[0] === pair[1] &&
      isConsonant(pair[0])
    ) {
      const doubled = pair[0];

      if (doubled === 'r') {
        push('rr', 'rr');

        index += 2;
        continue;
      }

      if (doubled === 'z') {
        push('ts', 'ts');
        push('ts', 'ts');

        index += 2;
        continue;
      }

      if (doubled === 'c') {
        if (
          [
            'e',
            'i',
            'é',
            'è',
            'ì',
          ].includes(
            text[index + 2] || ''
          )
        ) {
          push('ch', 'ch');
          push('ch', 'ch');
        } else {
          push('k', 'k');
          push('k', 'k');
        }

        index += 2;
        continue;
      }

      if (doubled === 'g') {
        if (
          [
            'e',
            'i',
            'é',
            'è',
            'ì',
          ].includes(
            text[index + 2] || ''
          )
        ) {
          push('j', 'j');
          push('j', 'j');
        } else {
          push('g', 'g');
          push('g', 'g');
        }

        index += 2;
        continue;
      }

      push(
        doubled,
        doubled
      );

      push(
        doubled,
        doubled
      );

      index += 2;
      continue;
    }

    /*
     * Single letters.
     */
    if (current === 'c') {
      if (
        [
          'e',
          'i',
          'é',
          'è',
          'ì',
        ].includes(next)
      ) {
        push('ch', 'ch');
      } else {
        push('k', 'k');
      }

      index += 1;
      continue;
    }

    if (current === 'g') {
      if (
        [
          'e',
          'i',
          'é',
          'è',
          'ì',
        ].includes(next)
      ) {
        push('j', 'j');
      } else {
        push('g', 'g');
      }

      index += 1;
      continue;
    }

    if (current === 'z') {
      push('ts', 'ts');

      index += 1;
      continue;
    }

    if (current === 'h') {
      index += 1;
      continue;
    }

    if (current === 'x') {
      push('k', 'k');
      push('s', 's');

      index += 1;
      continue;
    }

    if (current === 'q') {
      push('k', 'k');

      index += 1;
      continue;
    }

    if (current === 'y') {
      push('i', 'i');

      index += 1;
      continue;
    }

    if (isVowel(current)) {
      const vowel =
        baseVowel(current);

      push(vowel, vowel);

      index += 1;
      continue;
    }

    if (
      [
        'b',
        'd',
        'f',
        'l',
        'm',
        'n',
        'p',
        'r',
        's',
        't',
        'v',
        'w',
        'j',
      ].includes(current)
    ) {
      push(current, current);

      index += 1;
      continue;
    }

    index += 1;
  }

  return units;
}

function unitToToken(unit) {
  if (unit.key === 'rr') {
    return {
      phoneme: 'rr',
      label: unit.label,
      frame: 17,
      holdMs: RR_TOTAL_MS,
      trill: true,
      trillFrames: RR_FRAMES,
      trillHoldMs: RR_PULSE_MS,
      trillOpenMs: RR_OPEN_MS,
    };
  }

  const frame = {
    a: 1,
    e: 2,
    i: 3,
    o: 5,
    u: 5,
    w: 5,
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
    sh: 12,
    f: 14,
    v: 14,
    ch: 15,
    j: 15,
    ts: 15,
    r: 17,
    l: 18,
    ly: 18,
  }[unit.key];

  if (
    typeof frame !== 'number'
  ) {
    return {
      phoneme: unit.key,
      label: unit.label,
      frame: 0,
      holdMs: DEFAULT_HOLD,
      trill: false,
      skipped: true,
    };
  }

  return {
    phoneme: unit.key,
    label: unit.label,
    frame,
    holdMs:
      frameHold(frame),
    trill: false,
  };
}

function tokenizeText(text) {
  const normalizedText =
    normalizeItalian(text);

  const parts = [];
  let index = 0;

  while (
    index <
    normalizedText.length
  ) {
    const current =
      normalizedText[index];

    if (
      isWhitespace(current)
    ) {
      while (
        index <
          normalizedText.length &&
        isWhitespace(
          normalizedText[index]
        )
      ) {
        index += 1;
      }

      parts.push({
        type: 'word_gap',
      });

      continue;
    }

    if (
      isPausePunctuation(
        current
      )
    ) {
      parts.push({
        type: 'punct_pause',
        char: current,
      });

      index += 1;
      continue;
    }

    let endIndex = index;

    while (
      endIndex <
        normalizedText.length &&
      !isWhitespace(
        normalizedText[endIndex]
      ) &&
      !isPausePunctuation(
        normalizedText[endIndex]
      )
    ) {
      endIndex += 1;
    }

    const raw =
      normalizedText.slice(
        index,
        endIndex
      );

    parts.push({
      type: 'word',
      raw,
      units:
        resolveItalianUnits(raw),
    });

    index = endIndex;
  }

  const cleanedParts = [];

  for (const part of parts) {
    const previous =
      cleanedParts[
        cleanedParts.length - 1
      ];

    if (
      part.type === 'word_gap'
    ) {
      if (!previous) {
        continue;
      }

      if (
        previous.type ===
          'word_gap' ||
        previous.type ===
          'punct_pause'
      ) {
        continue;
      }
    }

    if (
      part.type ===
      'punct_pause'
    ) {
      if (!previous) {
        continue;
      }

      if (
        previous.type ===
        'word_gap'
      ) {
        cleanedParts.pop();
      }

      if (
        cleanedParts[
          cleanedParts.length - 1
        ]?.type ===
        'punct_pause'
      ) {
        continue;
      }
    }

    cleanedParts.push(part);
  }

  while (
    cleanedParts.length &&
    (
      cleanedParts[
        cleanedParts.length - 1
      ].type === 'word_gap' ||
      cleanedParts[
        cleanedParts.length - 1
      ].type ===
        'punct_pause'
    )
  ) {
    cleanedParts.pop();
  }

  return cleanedParts;
}

/**
 * Resolver-built helper fallback.
 *
 * This is used only if pronunciationHelper.js cannot
 * produce visible learner guidance.
 */
function partsToFallbackHelperText(
  parts
) {
  return parts
    .map((part) => {
      if (
        part.type !== 'word'
      ) {
        return '';
      }

      return part.units
        .map(
          (unit) =>
            unit.label
        )
        .join('-');
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Visible helper-text authority.
 *
 * pronunciationHelper.js controls the learner-facing helper.
 * Resolver units remain the hidden phoneme and animation truth.
 */
function resolveVisibleHelperText(
  text,
  parts
) {
  const helperResult =
    buildPronunciationHelper(
      text
    );

  const helperText =
    String(
      helperResult?.helperText ||
      helperResult?.display ||
      helperResult?.pronunciation ||
      ''
    ).trim();

  if (helperText) {
    return helperText;
  }

  return partsToFallbackHelperText(
    parts
  );
}

function partsToUntimedLearning(
  parts
) {
  const expectedPhonemes = [];
  const expectedFrames = [];
  const tokens = [];
  const tokenGroups = [];

  for (const part of parts) {
    if (
      part.type !== 'word'
    ) {
      continue;
    }

    const groupTokens = [];

    for (
      const unit of part.units
    ) {
      const token =
        unitToToken(unit);

      if (token.skipped) {
        continue;
      }

      const entry = {
        phoneme:
          token.phoneme,

        label:
          token.label,

        frame:
          token.frame,
      };

      expectedPhonemes.push(
        token.phoneme
      );

      expectedFrames.push(
        token.frame
      );

      tokens.push(entry);
      groupTokens.push(entry);
    }

    tokenGroups.push({
      raw: part.raw,
      tokens: groupTokens,

      expectedPhonemes:
        groupTokens.map(
          (token) =>
            token.phoneme
        ),

      expectedFrames:
        groupTokens.map(
          (token) =>
            token.frame
        ),
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
  /**
   * Untimed Italian learning input for AS/UAS.
   *
   * This intentionally returns no startMs/endMs timing.
   * Timing should be built by AS from real teaching
   * audio duration.
   */
  resolveUntimed(text) {
    const original =
      String(text || '').trim();

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

    const normalizedText =
      normalizeItalian(original);

    const parts =
      tokenizeText(original);

    const helperText =
      resolveVisibleHelperText(
        original,
        parts
      );

    const pronunciation =
      helperText;

    const untimed =
      partsToUntimedLearning(
        parts
      );

    return {
      normalizedText,
      helperText,
      pronunciation,

      expectedPhonemes:
        untimed.expectedPhonemes,

      expectedFrames:
        untimed.expectedFrames,

      tokens:
        untimed.tokens,

      tokenGroups:
        untimed.tokenGroups,
    };
  }

  /**
   * Legacy timed resolver path.
   *
   * Kept intact for backward compatibility with
   * preparePlayback().
   */
  resolve(
    text,
    _lang = 'it'
  ) {
    const original =
      String(text || '').trim();

    if (!original) {
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

    const parts =
      tokenizeText(original);

    const helperText =
      resolveVisibleHelperText(
        original,
        parts
      );

    const pronunciation =
      helperText;

    const frameSequence = [0];
    const phonemeTimeline = [];
    const phonemes = [];

    let cursor =
      LEAD_IN_MS;

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: 0,
      endMs: LEAD_IN_MS,
    });

    for (const part of parts) {
      if (
        part.type ===
        'word_gap'
      ) {
        frameSequence.push(0);

        phonemeTimeline.push({
          phoneme: 'pause',
          label: '',
          frame: 0,
          startMs: cursor,
          endMs:
            cursor +
            WORD_PAUSE_MS,
        });

        cursor +=
          WORD_PAUSE_MS;

        continue;
      }

      if (
        part.type ===
        'punct_pause'
      ) {
        frameSequence.push(0);

        phonemeTimeline.push({
          phoneme: 'pause',
          label: part.char,
          frame: 0,
          startMs: cursor,
          endMs:
            cursor +
            PUNCT_PAUSE_MS,
        });

        cursor +=
          PUNCT_PAUSE_MS;

        continue;
      }

      for (
        const unit of part.units
      ) {
        const token =
          unitToToken(unit);

        if (token.skipped) {
          continue;
        }

        if (
          token.trill &&
          token.trillFrames
        ) {
          for (
            const frame of
            token.trillFrames
          ) {
            frameSequence.push(
              frame
            );
          }
        } else {
          frameSequence.push(
            token.frame
          );
        }

        phonemeTimeline.push({
          phoneme:
            token.phoneme,

          label:
            token.label,

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
    }

    frameSequence.push(0);

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: cursor,
      endMs:
        cursor +
        LEAD_IN_MS,
    });

    return {
      word: original,
      helperText,
      phonemes,
      frames:
        frameSequence,
      pronunciation,
      phonemeTimeline,
      ipaPhonemes: [],
    };
  }
}

export default PhonemeResolver;