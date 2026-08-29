const SLOT_MESSAGES = {
  mostly_clear:
    'One or two detected sounds differed from the target. Keep the parts that matched and repeat only the changed sound slowly.',
  sound_changed:
    'Some detected sounds differed from the target. Slow the word down, compare the changed sounds, then blend it together again.',
  hard_to_match:
    'Several detected sounds differed from the target. Say the target slowly, one sound at a time, then try the whole word again.',
  vowel_distortion:
    'A vowel changed from the target. Listen to that vowel by itself, repeat it slowly, then put it back into the word.',
  consonant_issue:
    'A consonant changed or was missing. Listen to that consonant by itself, make it cleanly, then reconnect it to the word.',
  unclear:
    'The phoneme results were too different to give one precise fallback tip. Say the target slowly, one sound at a time, then try again.',
};

const VOWEL_FAMILY = new Set([
  'a', 'e', 'i', 'o', 'u', 'oo', 'ue', 'uh', 'er', 'or', 'ar', 'ai', 'ei', 'ow', 'oh', 'ee',
]);

const CONSONANT_FAMILY = new Set([
  'b', 'p', 'm', 'd', 't', 'n', 'g', 'k', 'f', 'v', 's', 'z', 'sh', 'zh', 'ch', 'j', 'r', 'l', 'w', 'y', 'h', 'th', 'ng',
]);

const RAW_TO_DISPLAY_NORMALIZATION = {
  'ɡ': 'g',
  'uː': 'oo',
  'ʊ': 'u',
  'ʉ': 'u',
  'iː': 'ee',
  'ɪ': 'i',
  'ʌ': 'uh',
  'ə': 'uh',
  'ɐ': 'uh',
  'ɔːɹ': 'or',
  'oːɹ': 'or',
  'ɔ': 'or',
  'ɑːɹ': 'ar',
  'ɑ': 'ar',
  'ɚ': 'er',
  'ɜ': 'er',
  'ɜː': 'er',
  'ʃ': 'sh',
  'ʒ': 'zh',
  'θ': 'th',
  'ð': 'th',
  'ŋ': 'ng',
  'tʃ': 'ch',
  't͡ʃ': 'ch',
  'dʒ': 'j',
  'd͡ʒ': 'j',
};

const DISPLAY_ALIASES = {
  ue: 'oo',
};

const EQUIVALENCE_TABLE = {
  g: ['ɡ'],
  u: ['oo', 'uː', 'ʊ', 'ʉ', 'ue'],
  oo: ['u', 'uː', 'ʊ', 'ʉ', 'ue'],
  ue: ['u', 'oo', 'uː', 'ʊ', 'ʉ'],
  i: ['ɪ', 'ee', 'iː'],
  ee: ['i', 'ɪ', 'iː'],
  uh: ['ʌ', 'ə', 'ɐ'],
  or: ['ɔːɹ', 'oːɹ', 'ɔ'],
  ar: ['ɑːɹ', 'ɑ'],
  er: ['ɚ', 'ɜ', 'ɜː'],
  sh: ['ʃ'],
  zh: ['ʒ'],
  th: ['θ', 'ð'],
  ng: ['ŋ'],
  ch: ['tʃ', 't͡ʃ'],
  j: ['dʒ', 'd͡ʒ'],
};

const WEIGHTS = {
  exact_match: 1.0,
  near_match: 0.8,
  family_match: 0.45,
  changed_sound: 0.15,
  missing_sound: 0,
  extra_sound: 0,
};

function normalizeToken(token) {
  return String(token || '').trim().toLowerCase();
}

function normalizeDisplayToken(token, getDisplayToken) {
  const raw = normalizeToken(token);
  const display = normalizeToken(getDisplayToken?.(token) || token);
  const normalized =
    RAW_TO_DISPLAY_NORMALIZATION[display] ||
    RAW_TO_DISPLAY_NORMALIZATION[raw] ||
    display ||
    raw;

  return DISPLAY_ALIASES[normalized] || normalized;
}

function mergeAdjacentTokens(tokens) {
  const merged = [];
  let i = 0;

  while (i < tokens.length) {
    const current = normalizeToken(tokens[i]);
    const next = normalizeToken(tokens[i + 1]);

    if (
      (current === 'o' || current === 'a' || current === 'e') &&
      next === 'r'
    ) {
      merged.push(`${current}${next}`);
      i += 2;
      continue;
    }

    if (
      (current === 'n' && next === 'g') ||
      (current === 's' && next === 'h') ||
      (current === 'c' && next === 'h') ||
      (current === 't' && next === 'h')
    ) {
      merged.push(`${current}${next}`);
      i += 2;
      continue;
    }

    merged.push(current);
    i += 1;
  }

  return merged.map(
    (token) => DISPLAY_ALIASES[token] || token
  );
}

function buildSymmetricEquivalenceMap() {
  const map = new Map();

  const addLink = (a, b) => {
    if (!a || !b) return;
    if (!map.has(a)) map.set(a, new Set());
    map.get(a).add(b);
  };

  Object.entries(EQUIVALENCE_TABLE).forEach(([base, values]) => {
    const normalizedBase =
      DISPLAY_ALIASES[normalizeToken(base)] ||
      normalizeToken(base);

    addLink(normalizedBase, normalizedBase);

    values.forEach((value) => {
      const normalizedValue =
        DISPLAY_ALIASES[normalizeToken(value)] ||
        normalizeToken(value);

      addLink(normalizedBase, normalizedValue);
      addLink(normalizedValue, normalizedBase);

      values.forEach((otherValue) => {
        addLink(
          normalizedValue,
          DISPLAY_ALIASES[normalizeToken(otherValue)] ||
            normalizeToken(otherValue)
        );
      });
    });
  });

  return map;
}

const SYMMETRIC_EQUIVALENCE_MAP =
  buildSymmetricEquivalenceMap();

function areNearEquivalent(a, b) {
  const left =
    DISPLAY_ALIASES[normalizeToken(a)] ||
    normalizeToken(a);

  const right =
    DISPLAY_ALIASES[normalizeToken(b)] ||
    normalizeToken(b);

  if (!left || !right) return false;
  if (left === right) return true;

  return (
    SYMMETRIC_EQUIVALENCE_MAP
      .get(left)
      ?.has(right) || false
  );
}

function getFamily(token) {
  const normalized =
    DISPLAY_ALIASES[normalizeToken(token)] ||
    normalizeToken(token);

  if (VOWEL_FAMILY.has(normalized)) return 'vowel';
  if (CONSONANT_FAMILY.has(normalized)) return 'consonant';

  return 'other';
}

function getPairKind(expectedToken, detectedToken) {
  if (!expectedToken && !detectedToken) return 'none';
  if (expectedToken && !detectedToken) return 'missing_sound';
  if (!expectedToken && detectedToken) return 'extra_sound';

  const expected =
    DISPLAY_ALIASES[normalizeToken(expectedToken)] ||
    normalizeToken(expectedToken);

  const detected =
    DISPLAY_ALIASES[normalizeToken(detectedToken)] ||
    normalizeToken(detectedToken);

  if (expected === detected) {
    return 'exact_match';
  }

  if (areNearEquivalent(expected, detected)) {
    return 'near_match';
  }

  const expectedFamily = getFamily(expected);
  const detectedFamily = getFamily(detected);

  if (
    expectedFamily !== 'other' &&
    expectedFamily === detectedFamily
  ) {
    return 'family_match';
  }

  return 'changed_sound';
}

function buildAlignment(
  expectedTokens,
  detectedTokens
) {
  const m = expectedTokens.length;
  const n = detectedTokens.length;

  const dp = Array.from(
    { length: m + 1 },
    () => Array(n + 1).fill(0)
  );

  const back = Array.from(
    { length: m + 1 },
    () => Array(n + 1).fill(null)
  );

  for (let i = 1; i <= m; i += 1) {
    dp[i][0] =
      dp[i - 1][0] +
      WEIGHTS.missing_sound;

    back[i][0] = 'up';
  }

  for (let j = 1; j <= n; j += 1) {
    dp[0][j] =
      dp[0][j - 1] +
      WEIGHTS.extra_sound;

    back[0][j] = 'left';
  }

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const pairKind = getPairKind(
        expectedTokens[i - 1],
        detectedTokens[j - 1]
      );

      const diag =
        dp[i - 1][j - 1] +
        (WEIGHTS[pairKind] ?? 0);

      const up =
        dp[i - 1][j] +
        WEIGHTS.missing_sound;

      const left =
        dp[i][j - 1] +
        WEIGHTS.extra_sound;

      if (diag >= up && diag >= left) {
        dp[i][j] = diag;
        back[i][j] = 'diag';
      } else if (up >= left) {
        dp[i][j] = up;
        back[i][j] = 'up';
      } else {
        dp[i][j] = left;
        back[i][j] = 'left';
      }
    }
  }

  const alignedPairs = [];

  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    const direction = back[i][j];

    if (direction === 'diag') {
      const expected =
        expectedTokens[i - 1];

      const detected =
        detectedTokens[j - 1];

      alignedPairs.push({
        expected,
        detected,
        kind: getPairKind(
          expected,
          detected
        ),
      });

      i -= 1;
      j -= 1;
    } else if (direction === 'up') {
      alignedPairs.push({
        expected:
          expectedTokens[i - 1],

        detected: null,

        kind:
          'missing_sound',
      });

      i -= 1;
    } else {
      alignedPairs.push({
        expected: null,

        detected:
          detectedTokens[j - 1],

        kind:
          'extra_sound',
      });

      j -= 1;
    }
  }

  alignedPairs.reverse();

  return {
    alignedPairs,
    totalWeight: dp[m][n],
  };
}

function buildMetrics(
  alignedPairs,
  expectedCount,
  detectedCount,
  totalWeight
) {
  const metrics = {
    expectedCount,
    detectedCount,
    exactMatches: 0,
    nearMatches: 0,
    familyMatches: 0,
    changedSounds: 0,
    missingSounds: 0,
    extraSounds: 0,
    vowelIssues: 0,
    consonantIssues: 0,
    coverage: 0,
    weightedMatch: 0,
  };

  alignedPairs.forEach(
    ({ expected, kind }) => {
      if (kind === 'exact_match') {
        metrics.exactMatches += 1;
      } else if (kind === 'near_match') {
        metrics.nearMatches += 1;
      } else if (kind === 'family_match') {
        metrics.familyMatches += 1;
      } else if (kind === 'changed_sound') {
        metrics.changedSounds += 1;
      } else if (kind === 'missing_sound') {
        metrics.missingSounds += 1;
      } else if (kind === 'extra_sound') {
        metrics.extraSounds += 1;
      }

      if (
        kind === 'changed_sound' ||
        kind === 'missing_sound'
      ) {
        const family =
          getFamily(expected);

        if (family === 'vowel') {
          metrics.vowelIssues += 1;
        } else if (
          family === 'consonant'
        ) {
          metrics.consonantIssues += 1;
        }
      }
    }
  );

  const covered =
    metrics.exactMatches +
    metrics.nearMatches +
    metrics.familyMatches;

  metrics.coverage =
    expectedCount > 0
      ? Number(
          (
            covered /
            expectedCount
          ).toFixed(3)
        )
      : 0;

  metrics.weightedMatch =
    expectedCount > 0
      ? Number(
          (
            totalWeight /
            expectedCount
          ).toFixed(3)
        )
      : 0;

  return metrics;
}

function resolveSubtype(
  slot,
  metrics
) {
  if (
    slot === 'strong_match' ||
    slot === 'mostly_clear'
  ) {
    return null;
  }

  if (
    slot === 'hard_to_match' &&
    metrics.coverage < 0.2
  ) {
    return 'unclear';
  }

  if (
    metrics.vowelIssues >
      metrics.consonantIssues &&
    metrics.vowelIssues >= 2
  ) {
    return 'vowel_distortion';
  }

  if (
    metrics.consonantIssues >
      metrics.vowelIssues &&
    metrics.consonantIssues >= 2
  ) {
    return 'consonant_issue';
  }

  return 'unclear';
}

function resolveSlot(metrics) {
  if (
    metrics.coverage >= 0.82 &&
    metrics.weightedMatch >= 0.75 &&
    metrics.missingSounds <= 1 &&
    metrics.changedSounds <= 1
  ) {
    return 'strong_match';
  }

  if (
    metrics.coverage >= 0.65 &&
    metrics.weightedMatch >= 0.55 &&
    metrics.missingSounds <= 2
  ) {
    return 'mostly_clear';
  }

  if (
    metrics.coverage >= 0.35 &&
    metrics.weightedMatch >= 0.30
  ) {
    return 'sound_changed';
  }

  return 'hard_to_match';
}

function getShortMessage(
  slot,
  subtype,
  hasMismatch
) {
  /*
   * This English resolver is no longer an attempt-level verdict engine.
   *
   * Praise, score bands, total-miss humour, and the official 50/50 verdict
   * are decided downstream from the combined phoneme + mouth evidence.
   *
   * This file may provide a fallback coaching sentence only after a real
   * detected-vs-expected phoneme mismatch exists.
   */
  if (!hasMismatch) return '';

  if (
    subtype &&
    SLOT_MESSAGES[subtype]
  ) {
    return SLOT_MESSAGES[subtype];
  }

  return (
    SLOT_MESSAGES[slot] ||
    SLOT_MESSAGES.hard_to_match
  );
}

function shouldForceStrongMatch(
  expectedTokens,
  detectedTokens
) {
  if (
    expectedTokens.length !==
    detectedTokens.length
  ) {
    return false;
  }

  return expectedTokens.every(
    (token, index) => {
      const kind = getPairKind(
        token,
        detectedTokens[index]
      );

      return (
        kind === 'exact_match' ||
        kind === 'near_match'
      );
    }
  );
}

export function buildUASCoachingResult({
  targetText,
  expectedPhonemes,
  detectedPhonemes,
  getDisplayToken,
  sanitizeTranscript,
}) {
  const expectedRaw =
    Array.isArray(expectedPhonemes)
      ? expectedPhonemes.filter(Boolean)
      : [];

  const detectedRaw =
    Array.isArray(detectedPhonemes)
      ? detectedPhonemes.filter(Boolean)
      : [];

  const expectedNormalized =
    mergeAdjacentTokens(
      expectedRaw
        .map((token) =>
          normalizeDisplayToken(
            token,
            getDisplayToken
          )
        )
        .filter(Boolean)
    );

  const detectedNormalized =
    mergeAdjacentTokens(
      detectedRaw
        .map((token) =>
          normalizeDisplayToken(
            token,
            getDisplayToken
          )
        )
        .filter(Boolean)
    );

  const expectedDisplay =
    expectedNormalized.join(' ');

  const detectedDisplay =
    sanitizeTranscript
      ? (
          sanitizeTranscript(
            detectedRaw.join(' ')
          ) ||
          detectedNormalized.join(' ')
        )
      : detectedNormalized.join(' ');

  /*
   * If either side is unavailable, do not manufacture a pronunciation
   * judgement here. Practice/CoachingBox owns the neutral no-attempt or
   * incomplete-evidence response.
   */
  if (
    !expectedNormalized.length ||
    !detectedNormalized.length
  ) {
    const metrics = {
      expectedCount:
        expectedNormalized.length,

      detectedCount:
        detectedNormalized.length,

      exactMatches: 0,
      nearMatches: 0,
      familyMatches: 0,
      changedSounds: 0,

      missingSounds:
        expectedNormalized.length,

      extraSounds:
        detectedNormalized.length,

      vowelIssues: 0,
      consonantIssues: 0,
      coverage: 0,
      weightedMatch: 0,
    };

    const result = {
      slot:
        'unscored',

      subtype:
        'unclear',

      expectedDisplay,
      detectedDisplay,

      /*
       * Deliberately blank.
       * A missing side is not evidence for coaching.
       */
      shortMessage: '',

      hasMismatch: false,
      mismatchCount: 0,

      alignedPairs: [],

      metrics,

      role:
        'english-display-and-mismatch-fallback-only',

      officialVerdictSource:
        'combined-phoneme-and-mouth-70-30',
    };

    console.log(
      '[EN UAS COACHING RESOLVER]',
      {
        targetText,
        expectedDisplay,
        detectedDisplay,

        expectedComparisonTokens:
          expectedNormalized,

        detectedComparisonTokens:
          detectedNormalized,

        slot:
          result.slot,

        subtype:
          result.subtype,

        hasMismatch:
          result.hasMismatch,

        mismatchCount:
          result.mismatchCount,

        metrics,
      }
    );

    return result;
  }

  const {
    alignedPairs,
    totalWeight,
  } = buildAlignment(
    expectedNormalized,
    detectedNormalized
  );

  const metrics = buildMetrics(
    alignedPairs,
    expectedNormalized.length,
    detectedNormalized.length,
    totalWeight
  );

  /*
   * Exact and approved near-equivalent display tokens do not count as a
   * fallback mismatch in this English display resolver.
   *
   * The official phoneme mismatch truth still comes from the comparator's
   * expected-vs-detected evidence. This helper does not override it.
   */
  const mismatchPairs =
    alignedPairs.filter(
      (pair) =>
        pair.kind !==
          'exact_match' &&
        pair.kind !==
          'near_match'
    );

  const hasMismatch =
    mismatchPairs.length > 0;

  const mismatchCount =
    mismatchPairs.length;

  const forcedStrongMatch =
    shouldForceStrongMatch(
      expectedNormalized,
      detectedNormalized
    );

  const slot =
    forcedStrongMatch
      ? 'strong_match'
      : resolveSlot(metrics);

  const subtype =
    forcedStrongMatch
      ? null
      : resolveSubtype(
          slot,
          metrics
        );

  /*
   * IMPORTANT:
   * This message is only a language-pack fallback used when the richer
   * mismatch-gated coaching library cannot produce a specific card.
   *
   * It must never praise, grade, joke, or create an error on its own.
   */
  const shortMessage =
    getShortMessage(
      slot,
      subtype,
      hasMismatch
    );

  console.log(
    '[EN UAS COACHING RESOLVER]',
    {
      targetText,
      expectedDisplay,
      detectedDisplay,

      expectedComparisonTokens:
        expectedNormalized,

      detectedComparisonTokens:
        detectedNormalized,

      slot,
      subtype,
      hasMismatch,
      mismatchCount,
      metrics,
      mismatchPairs,
    }
  );

  return {
    slot,
    subtype,
    expectedDisplay,
    detectedDisplay,
    shortMessage,

    hasMismatch,
    mismatchCount,
    alignedPairs,
    mismatchPairs,
    metrics,

    /*
     * Explicit contract marker for future pack audits.
     *
     * This file provides English display normalization + an audio-mismatch
     * fallback only. The official learner verdict lives in the 50/50
     * phoneme-result + mouth-articulation pipeline.
     */
    role:
      'english-display-and-mismatch-fallback-only',

    officialVerdictSource:
      'combined-phoneme-and-mouth-70-30',
  };
}
