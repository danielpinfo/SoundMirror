/**
 * French UAS coaching resolver.
 *
 * Pack-owned, non-numeric, phoneme-based coaching.
 *
 * Core rule:
 * The user-facing message should be gentle and conservative.
 * Internal numbers only route the attempt into a coaching slot.
 * No percentages. No “perfect.”
 */

const NON_SPEECH_TOKENS = new Set([
  '<pad>',
  '[PAD]',
  '<s>',
  '</s>',
  '<unk>',
  '[UNK]',
  '',
]);

const SLOT_MESSAGES = {
  strong_match:
    'Tes sons correspondaient bien à l’objectif. Garde la même forme de bouche et le même rythme.',

  mostly_clear:
    'La plupart des sons étaient clairs. Répète encore une fois le son indiqué et garde les autres sons pareils.',

  sound_changed:
    'Certains sons ont changé par rapport à l’objectif. Dis-le plus lentement et compare les sons de l’objectif avec ceux que tu as produits.',

  hard_to_match:
    'Cet essai était difficile à comparer avec l’objectif. Dis l’objectif lentement, un son à la fois.',

  vowel_distortion:
    'Les voyelles ont le plus changé. Concentre-toi sur la forme de la bouche et la stabilité des voyelles.',

  consonant_issue:
    'Certaines consonnes ont changé ou manquaient. Concentre-toi sur le début et la fin du son avec la langue, les lèvres et l’air.',

  unclear:
    'Le système n’a pas pu comparer clairement cet essai avec l’objectif. Dis l’objectif lentement, un son à la fois.',
};

const VOWELS = new Set([
  'a',
  'e',
  'i',
  'o',
  'u',
  'an',
  'on',
  'in',
  'un',
  'eu',
  'ou',
  'oo',
  'wa',
]);

const CONSONANTS = new Set([
  'b',
  'p',
  't',
  'd',
  'k',
  'g',
  'm',
  'n',
  'gn',
  'ny',
  'f',
  'v',
  's',
  'z',
  'ch',
  'sh',
  'j',
  'zh',
  'r',
  'l',
  'y',
]);

const INTERNAL_WEIGHTS = {
  exact_match: 1.0,
  near_match: 0.8,
  family_match: 0.45,
  changed_sound: 0.15,
  missing_sound: 0,
  soft_final_r_missing: 0.7,
};

/**
 * French-owned near-equivalence.
 *
 * These are not app-shell rules. They belong only to the French pack.
 * Keep them conservative, but French needs tolerance for nasal vowels,
 * rounded vowels, and the final French r.
 */
const FRENCH_EQUIVALENCE = {
  gn: ['ny', 'ɲ'],
  ny: ['gn', 'ɲ'],

  g: ['ɡ'],

  // French r / American r / tapped r / uvular r.
  r: ['ʁ', 'ɹ', 'ɾ'],
  ch: ['sh', 'ʃ', 'tʃ', 't͡ʃ'],
  sh: ['ch', 'ʃ', 'tʃ', 't͡ʃ'],
  j: ['zh', 'ʒ', 'dʒ', 'd͡ʒ'],
  zh: ['j', 'ʒ', 'dʒ', 'd͡ʒ'],

  // French rounded vowel uncertainty from the backend.
  ou: ['oo', 'u', 'y', 'uː', 'ʊ'],
  oo: ['ou', 'u', 'y', 'uː', 'ʊ'],
  u: ['ou', 'oo', 'y', 'ʉ', 'yː'],
  y: ['u', 'ou', 'oo', 'ʉ', 'yː'],

  eu: ['ə', 'œ', 'ø', 'ɜ', 'ɜː'],

  a: ['ɑ', 'ɑː', 'aː', 'ɐ', 'æ'],
  e: ['ɛ', 'eː'],
  i: ['ɪ', 'iː'],
  o: ['ɔ', 'ɔː', 'oː', 'oʊ'],

  // Nasal vowels. Bonjour often lands as an/on/a depending backend confidence.
  an: ['ɑ̃', 'on', 'a'],
  on: ['ɔ̃', 'an', 'o', 'a'],
  in: ['ɛ̃'],
  un: ['œ̃'],
};

function normalizeToken(rawToken, getDisplayToken) {
  if (rawToken === null || rawToken === undefined) return '';

  const raw = String(rawToken).trim();

  if (NON_SPEECH_TOKENS.has(raw)) return '';

  const display = getDisplayToken ? getDisplayToken(raw) : raw;

  return String(display || raw)
    .trim()
    .toLowerCase();
}

function normalizeSequence(tokens, getDisplayToken) {
  if (!Array.isArray(tokens)) return [];

  return tokens
    .map((token) => normalizeToken(token, getDisplayToken))
    .filter(Boolean);
}

function compactFrenchTokens(tokens) {
  const out = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i];
    const next = tokens[i + 1];

    if (current === 'n' && next === 'y') {
      out.push('gn');
      i += 1;
      continue;
    }

    if (current === 's' && next === 'h') {
      out.push('ch');
      i += 1;
      continue;
    }

    if (current === 'z' && next === 'h') {
      out.push('j');
      i += 1;
      continue;
    }

    if (current === 'o' && next === 'o') {
      out.push('ou');
      i += 1;
      continue;
    }

    out.push(current);
  }

  return out;
}

function isVowel(token) {
  return VOWELS.has(token);
}

function isConsonant(token) {
  return CONSONANTS.has(token);
}

function isEquivalent(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;

  const aList = FRENCH_EQUIVALENCE[a] || [];
  const bList = FRENCH_EQUIVALENCE[b] || [];

  return aList.includes(b) || bList.includes(a);
}

function isFamilyMatch(a, b) {
  if (!a || !b) return false;

  if (isVowel(a) && isVowel(b)) return true;
  if (isConsonant(a) && isConsonant(b)) return true;

  return false;
}

function isSoftFinalFrenchR(expectedTokens, index, detected) {
  const isFinalExpected = index === expectedTokens.length - 1;
  return isFinalExpected && expectedTokens[index] === 'r' && !detected;
}

function compareTokens(expected, detected, expectedTokens = [], expectedIndex = -1) {
  if (!expected && !detected) {
    return { kind: 'empty', weight: 0 };
  }

  if (expected && !detected) {
    if (isSoftFinalFrenchR(expectedTokens, expectedIndex, detected)) {
      return {
        kind: 'near_match',
        weight: INTERNAL_WEIGHTS.soft_final_r_missing,
        softFinalR: true,
      };
    }

    return { kind: 'missing_sound', weight: INTERNAL_WEIGHTS.missing_sound };
  }

  if (!expected && detected) {
    return { kind: 'extra_sound', weight: 0 };
  }

  if (expected === detected) {
    return { kind: 'exact_match', weight: INTERNAL_WEIGHTS.exact_match };
  }

  if (isEquivalent(expected, detected)) {
    return { kind: 'near_match', weight: INTERNAL_WEIGHTS.near_match };
  }

  if (isFamilyMatch(expected, detected)) {
    return { kind: 'family_match', weight: INTERNAL_WEIGHTS.family_match };
  }

  return { kind: 'changed_sound', weight: INTERNAL_WEIGHTS.changed_sound };
}

function alignSequences(expectedTokens, detectedTokens) {
  const m = expectedTokens.length;
  const n = detectedTokens.length;

  const dp = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({ score: 0, prev: null }))
  );

  for (let i = 1; i <= m; i += 1) {
    const comparison = compareTokens(
      expectedTokens[i - 1],
      null,
      expectedTokens,
      i - 1
    );

    dp[i][0] = {
      score: dp[i - 1][0].score + comparison.weight - 0.25,
      prev: [i - 1, 0, 'missing'],
    };
  }

  for (let j = 1; j <= n; j += 1) {
    dp[0][j] = {
      score: dp[0][j - 1].score - 0.2,
      prev: [0, j - 1, 'extra'],
    };
  }

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const comparison = compareTokens(
        expectedTokens[i - 1],
        detectedTokens[j - 1],
        expectedTokens,
        i - 1
      );

      const diagonal = {
        score: dp[i - 1][j - 1].score + comparison.weight,
        prev: [i - 1, j - 1, 'pair'],
      };

      const missingComparison = compareTokens(
        expectedTokens[i - 1],
        null,
        expectedTokens,
        i - 1
      );

      const missing = {
        score: dp[i - 1][j].score + missingComparison.weight - 0.25,
        prev: [i - 1, j, 'missing'],
      };

      const extra = {
        score: dp[i][j - 1].score - 0.2,
        prev: [i, j - 1, 'extra'],
      };

      dp[i][j] = [diagonal, missing, extra].sort((a, b) => b.score - a.score)[0];
    }
  }

  const aligned = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    const cell = dp[i][j];
    const prev = cell.prev;

    if (!prev) break;

    const [pi, pj, action] = prev;

    if (action === 'pair') {
      aligned.push({
        expected: expectedTokens[i - 1],
        detected: detectedTokens[j - 1],
        ...compareTokens(
          expectedTokens[i - 1],
          detectedTokens[j - 1],
          expectedTokens,
          i - 1
        ),
      });
    } else if (action === 'missing') {
      aligned.push({
        expected: expectedTokens[i - 1],
        detected: null,
        ...compareTokens(expectedTokens[i - 1], null, expectedTokens, i - 1),
      });
    } else if (action === 'extra') {
      aligned.push({
        expected: null,
        detected: detectedTokens[j - 1],
        kind: 'extra_sound',
        weight: 0,
      });
    }

    i = pi;
    j = pj;
  }

  return aligned.reverse();
}

function calculateMetrics(aligned, expectedCount, detectedCount) {
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
    softFinalR: false,
    coverage: 0,
    weightedMatch: 0,
    anchorConsonantChanged: false,
  };

  let weightedTotal = 0;
  let coveredExpected = 0;
  let firstExpectedSoundSeen = false;

  for (const item of aligned) {
    if (item.expected) {
      if (item.detected || item.softFinalR) coveredExpected += 1;
      weightedTotal += item.weight || 0;
    }

    if (item.softFinalR) {
      metrics.softFinalR = true;
    }

    if (item.kind === 'exact_match') metrics.exactMatches += 1;
    else if (item.kind === 'near_match') metrics.nearMatches += 1;
    else if (item.kind === 'family_match') metrics.familyMatches += 1;
    else if (item.kind === 'changed_sound') metrics.changedSounds += 1;
    else if (item.kind === 'missing_sound') metrics.missingSounds += 1;
    else if (item.kind === 'extra_sound') metrics.extraSounds += 1;

    if (
      item.expected &&
      item.kind !== 'exact_match' &&
      item.kind !== 'near_match'
    ) {
      if (isVowel(item.expected)) metrics.vowelIssues += 1;
      if (isConsonant(item.expected)) metrics.consonantIssues += 1;
    }

    if (!firstExpectedSoundSeen && item.expected) {
      firstExpectedSoundSeen = true;

      if (
        isConsonant(item.expected) &&
        item.detected &&
        isConsonant(item.detected) &&
        item.kind !== 'exact_match' &&
        item.kind !== 'near_match'
      ) {
        metrics.anchorConsonantChanged = true;
      }
    }
  }

  metrics.coverage = expectedCount
    ? Number((coveredExpected / expectedCount).toFixed(3))
    : 0;

  metrics.weightedMatch = expectedCount
    ? Number((weightedTotal / expectedCount).toFixed(3))
    : 0;

  return metrics;
}

function chooseSlot(metrics) {
  const noMajorConsonantProblem =
    !metrics.anchorConsonantChanged && metrics.consonantIssues === 0;

  if (
    metrics.coverage >= 0.82 &&
    metrics.weightedMatch >= 0.7 &&
    metrics.missingSounds <= 1 &&
    metrics.changedSounds <= 1 &&
    noMajorConsonantProblem
  ) {
    return 'strong_match';
  }

  if (
    metrics.coverage >= 0.65 &&
    metrics.weightedMatch >= 0.5 &&
    metrics.missingSounds <= 2
  ) {
    return 'mostly_clear';
  }

  if (metrics.coverage >= 0.35 && metrics.weightedMatch >= 0.3) {
    return 'sound_changed';
  }

  return 'hard_to_match';
}

function chooseSubtype(slot, metrics) {
  if (slot === 'strong_match' || slot === 'mostly_clear') return null;

  if (metrics.coverage < 0.25) return 'unclear';

  if (metrics.vowelIssues > metrics.consonantIssues && metrics.vowelIssues >= 2) {
    return 'vowel_distortion';
  }

  if (metrics.consonantIssues > metrics.vowelIssues && metrics.consonantIssues >= 2) {
    return 'consonant_issue';
  }

  return 'unclear';
}

function messageFor(slot, subtype) {
  if (subtype && SLOT_MESSAGES[subtype]) return SLOT_MESSAGES[subtype];
  return SLOT_MESSAGES[slot] || SLOT_MESSAGES.hard_to_match;
}

export function buildUASCoachingResult({
  targetText,
  expectedPhonemes,
  detectedPhonemes,
  getDisplayToken,
  sanitizeTranscript,
} = {}) {
  const expectedComparisonTokens = compactFrenchTokens(
    normalizeSequence(expectedPhonemes, getDisplayToken)
  );

  const detectedComparisonTokens = compactFrenchTokens(
    normalizeSequence(detectedPhonemes, getDisplayToken)
  );

  const expectedDisplay = expectedComparisonTokens.join(' ');

  const detectedDisplay =
    typeof sanitizeTranscript === 'function'
      ? sanitizeTranscript((detectedPhonemes || []).join(' '))
      : detectedComparisonTokens.join(' ');

  if (!expectedComparisonTokens.length || !detectedComparisonTokens.length) {
    const result = {
      slot: 'hard_to_match',
      subtype: 'unclear',
      expectedDisplay,
      detectedDisplay,
      shortMessage: SLOT_MESSAGES.unclear,
    };

    console.log('[FR UAS COACHING RESOLVER]', {
      targetText,
      expectedDisplay,
      detectedDisplay,
      expectedComparisonTokens,
      detectedComparisonTokens,
      slot: result.slot,
      subtype: result.subtype,
      metrics: {
        expectedCount: expectedComparisonTokens.length,
        detectedCount: detectedComparisonTokens.length,
        coverage: 0,
        weightedMatch: 0,
      },
    });

    return result;
  }

  const aligned = alignSequences(expectedComparisonTokens, detectedComparisonTokens);
  const metrics = calculateMetrics(
    aligned,
    expectedComparisonTokens.length,
    detectedComparisonTokens.length
  );

  const slot = chooseSlot(metrics);
  const subtype = chooseSubtype(slot, metrics);
  const shortMessage = messageFor(slot, subtype);

  console.log('[FR UAS COACHING RESOLVER]', {
    targetText,
    expectedDisplay,
    detectedDisplay,
    expectedComparisonTokens,
    detectedComparisonTokens,
    aligned,
    slot,
    subtype,
    metrics,
  });

  return {
    slot,
    subtype,
    expectedDisplay,
    detectedDisplay,
    shortMessage,
  };
}

export default buildUASCoachingResult;