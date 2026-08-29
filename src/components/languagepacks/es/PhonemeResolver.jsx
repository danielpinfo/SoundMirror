/**
 * PhonemeResolver — Spanish (es)
 *
 * Pack-owned deterministic resolver.
 *
 * Keeps the legacy timed resolve() path intact.
 * Adds resolveUntimed(text) for AS/UAS expected phoneme input.
 *
 * Visible helper text comes from pronunciationHelper.js.
 * Hidden phonemes, frames, timing, and trill behavior remain
 * controlled by this resolver.
 */

import {
  buildPronunciationHelper,
} from './pronunciationHelper';

const LEAD_IN_MS = 40;
const WORD_PAUSE_MS = 80;
const PUNCT_PAUSE_MS = 100;
const DEFAULT_HOLD = 130;
const VOWEL_HOLD = 160;

const TRILL_PULSES = 3;
const TRILL_PULSE_MS = 60;
const TRILL_OPEN_MS = 40;
const TRILL_FRAMES = [17, 1, 17, 1, 17];

const TRILL_TOTAL_MS =
  TRILL_PULSES * TRILL_PULSE_MS +
  (TRILL_PULSES - 1) * TRILL_OPEN_MS;

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

function normalizeSpanish(input = '') {
  return String(input)
    .toLowerCase()
    .normalize('NFC');
}

function baseVowel(ch) {
  switch (ch) {
    case 'á':
      return 'a';

    case 'é':
      return 'e';

    case 'í':
      return 'i';

    case 'ó':
      return 'o';

    case 'ú':
      return 'u';

    case 'ü':
      return 'u';

    default:
      return ch;
  }
}

function isVowel(ch) {
  return [
    'a',
    'e',
    'i',
    'o',
    'u',
    'á',
    'é',
    'í',
    'ó',
    'ú',
    'ü',
  ].includes(ch);
}

function isLetter(ch) {
  return /[a-záéíóúüñ]/i.test(
    ch || ''
  );
}

function isWhitespace(ch) {
  return /\s/.test(ch || '');
}

function isPausePunctuation(ch) {
  return /[.,;:!?¿¡]/.test(
    ch || ''
  );
}

function isStrongRPosition(
  text,
  index
) {
  const previous =
    text[index - 1] || '';

  const atStart =
    index === 0;

  const afterWhitespace =
    isWhitespace(previous);

  const afterPausePunctuation =
    isPausePunctuation(previous);

  if (
    atStart ||
    afterWhitespace ||
    afterPausePunctuation
  ) {
    return true;
  }

  if (
    ['n', 'l', 's'].includes(
      previous
    )
  ) {
    return true;
  }

  return false;
}

function resolveSpanishUnits(
  segment
) {
  const text =
    normalizeSpanish(segment);

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
    const current =
      text[index];

    const pair =
      text.slice(
        index,
        index + 2
      );

    const triple =
      text.slice(
        index,
        index + 3
      );

    const next =
      text[index + 1] || '';

    if (!isLetter(current)) {
      index += 1;
      continue;
    }

    if (triple === 'güe') {
      push('g');
      push('w');
      push('e');

      index += 3;
      continue;
    }

    if (triple === 'güi') {
      push('g');
      push('w');
      push('i');

      index += 3;
      continue;
    }

    if (triple === 'gue') {
      push('g');
      push('e');

      index += 3;
      continue;
    }

    if (triple === 'gui') {
      push('g');
      push('i');

      index += 3;
      continue;
    }

    if (pair === 'qu') {
      push('k');

      index += 2;
      continue;
    }

    if (pair === 'ch') {
      push('ch');

      index += 2;
      continue;
    }

    if (pair === 'll') {
      push('y');

      index += 2;
      continue;
    }

    if (pair === 'rr') {
      push('rr');

      index += 2;
      continue;
    }

    if (current === 'ñ') {
      push('ny');

      index += 1;
      continue;
    }

    if (current === 'h') {
      index += 1;
      continue;
    }

    if (current === 'j') {
      push('h');

      index += 1;
      continue;
    }

    if (current === 'z') {
      push('s');

      index += 1;
      continue;
    }

    if (current === 'v') {
      push('v');

      index += 1;
      continue;
    }

    if (current === 'c') {
      if (
        [
          'e',
          'é',
          'i',
          'í',
        ].includes(next)
      ) {
        push('s');
      } else {
        push('k');
      }

      index += 1;
      continue;
    }

    if (current === 'g') {
      if (
        [
          'e',
          'é',
          'i',
          'í',
        ].includes(next)
      ) {
        push('h');
      } else {
        push('g');
      }

      index += 1;
      continue;
    }

    if (current === 'r') {
      if (
        isStrongRPosition(
          text,
          index
        )
      ) {
        push('rr');
      } else {
        push('r');
      }

      index += 1;
      continue;
    }

    if (current === 'y') {
      if (
        index ===
        text.length - 1
      ) {
        push('i');
      } else {
        push('y');
      }

      index += 1;
      continue;
    }

    if (current === 'x') {
      push('k');
      push('s');

      index += 1;
      continue;
    }

    if (current === 'w') {
      push('w');

      index += 1;
      continue;
    }

    if (isVowel(current)) {
      push(
        baseVowel(current)
      );

      index += 1;
      continue;
    }

    if (
      [
        'b',
        'd',
        'f',
        'k',
        'l',
        'm',
        'n',
        'p',
        's',
        't',
        'g',
      ].includes(current)
    ) {
      push(current);

      index += 1;
      continue;
    }

    if (current === 'q') {
      push('k');

      index += 1;
      continue;
    }

    if (current === 'ç') {
      push('s');

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
      holdMs: TRILL_TOTAL_MS,
      trill: true,
      trillFrames: TRILL_FRAMES,
      trillHoldMs:
        TRILL_PULSE_MS,
      trillOpenMs:
        TRILL_OPEN_MS,
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
    f: 14,
    v: 14,
    ch: 15,
    h: 16,
    r: 17,
    l: 18,
    y: 19,
  }[unit.key];

  if (
    typeof frame !== 'number'
  ) {
    return {
      phoneme: unit.key,
      label: unit.label,
      frame: 0,
      holdMs: DEFAULT_HOLD,
      skipped: true,
    };
  }

  return {
    phoneme: unit.key,
    label: unit.label,
    frame,
    holdMs:
      frameHold(frame),
  };
}

function tokenizeText(text) {
  const normalized =
    normalizeSpanish(text);

  const parts = [];

  let index = 0;

  while (
    index < normalized.length
  ) {
    const current =
      normalized[index];

    if (
      isWhitespace(current)
    ) {
      while (
        index <
          normalized.length &&
        isWhitespace(
          normalized[index]
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
        normalized.length &&
      !isWhitespace(
        normalized[endIndex]
      ) &&
      !isPausePunctuation(
        normalized[endIndex]
      )
    ) {
      endIndex += 1;
    }

    const raw =
      normalized.slice(
        index,
        endIndex
      );

    parts.push({
      type: 'word',
      raw,
      units:
        resolveSpanishUnits(raw),
    });

    index = endIndex;
  }

  return parts;
}

/**
 * Resolver-built helper fallback.
 *
 * This remains available only if pronunciationHelper.js
 * cannot produce visible guidance.
 */
function partsToFallbackHelperText(
  parts
) {
  return parts
    .filter(
      (part) =>
        part.type === 'word'
    )
    .map((part) =>
      part.units
        .map(
          (unit) =>
            unit.label
        )
        .join('-')
    )
    .join(' ');
}

/**
 * Visible helper-text authority.
 *
 * pronunciationHelper.js controls the learner-facing
 * helper. Resolver units remain the hidden phoneme
 * and animation truth.
 */
function resolveVisibleHelperText(
  text,
  parts
) {
  const helperResult =
    buildPronunciationHelper(
      text
    );

  const reviewedHelper =
    String(
      helperResult?.helperText ||
      helperResult?.display ||
      helperResult?.pronunciation ||
      ''
    ).trim();

  if (reviewedHelper) {
    return reviewedHelper;
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
   * Untimed Spanish learning input for AS/UAS.
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
      normalizeSpanish(
        original
      );

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
    _lang = 'es'
  ) {
    const original =
      String(text || '').trim();

    if (!original) {
      return {
        word: '',
        helperText: '',
        helperChunks: [],
        phonemeTimeline: [],
        pronunciation: '',
        phonemes: [],
        frames: [0, 0],
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

    const phonemeTimeline = [];
    const helperChunks = [];
    const phonemes = [];
    const frames = [0];

    let cursor = 0;

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: 0,
      endMs: LEAD_IN_MS,
    });

    cursor = LEAD_IN_MS;

    for (const part of parts) {
      if (
        part.type ===
        'word_gap'
      ) {
        phonemeTimeline.push({
          phoneme: 'pause',
          frame: 0,
          startMs: cursor,
          endMs:
            cursor +
            WORD_PAUSE_MS,
        });

        cursor +=
          WORD_PAUSE_MS;

        frames.push(0);

        continue;
      }

      if (
        part.type ===
        'punct_pause'
      ) {
        phonemeTimeline.push({
          phoneme: 'pause',
          frame: 0,
          startMs: cursor,
          endMs:
            cursor +
            PUNCT_PAUSE_MS,
        });

        cursor +=
          PUNCT_PAUSE_MS;

        frames.push(0);

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

        const start = cursor;

        const end =
          cursor +
          token.holdMs;

        phonemeTimeline.push({
          phoneme:
            token.phoneme,

          label:
            token.label,

          frame:
            token.frame,

          startMs:
            start,

          endMs:
            end,
        });

        helperChunks.push({
          text:
            token.label,

          startMs:
            start,

          endMs:
            end,
        });

        phonemes.push(
          token.phoneme
        );

        frames.push(
          token.frame
        );

        cursor = end;
      }
    }

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: cursor,
      endMs:
        cursor +
        LEAD_IN_MS,
    });

    frames.push(0);

    return {
      word: original,
      helperText,
      helperChunks,
      phonemeTimeline,
      pronunciation,
      phonemes,
      frames,
    };
  }
}

export default PhonemeResolver;
