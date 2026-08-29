/**
 * Italian UAS coaching resolver.
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
    'I tuoi suoni corrispondevano bene all’obiettivo. Mantieni la stessa forma della bocca e lo stesso ritmo.',

  mostly_clear:
    'La maggior parte dei suoni era chiara. Ripeti ancora una volta il suono indicato e mantieni gli altri suoni uguali.',

  sound_changed:
    'Alcuni suoni sono cambiati rispetto all’obiettivo. Dillo più lentamente e confronta i suoni dell’obiettivo con quelli che hai prodotto.',

  hard_to_match:
    'Questo tentativo era difficile da confrontare con l’obiettivo. Di’ l’obiettivo lentamente, un suono alla volta.',

  vowel_distortion:
    'Le vocali sono cambiate di più. Concentrati su vocali chiare e stabili: a, e, i, o, u.',

  consonant_issue:
    'Alcune consonanti sono cambiate o mancavano. Concentrati su dove iniziano e finiscono la lingua, le labbra e l’aria.',

  unclear:
    'Il sistema non ha potuto confrontare chiaramente questo tentativo con l’obiettivo. Di’ l’obiettivo lentamente, un suono alla volta.',
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

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
  'gli',
  'ly',
  'f',
  'v',
  's',
  'sh',
  'ch',
  'j',
  'ts',
  'dz',
  'r',
  'rr',
  'l',
  'w',
]);

const INTERNAL_WEIGHTS = {
  exact_match: 1.0,
  near_match: 0.8,
  family_match: 0.45,
  changed_sound: 0.15,
  missing_sound: 0,
};

/**
 * Italian-owned near-equivalence.
 *
 * These are not app-shell rules. They belong only to the Italian pack.
 * Keep them conservative.
 */
const ITALIAN_EQUIVALENCE = {
  gn: ['ny', 'ɲ'],
  ny: ['gn', 'ɲ'],

  gli: ['ly', 'ʎ'],
  ly: ['gli', 'ʎ'],

  g: ['ɡ'],
  r: ['ɾ', 'ɹ'],
  rr: ['r', 'ɾ'],

  sh: ['ʃ'],
  ch: ['tʃ', 't͡ʃ'],
  j: ['dʒ', 'd͡ʒ'],
  ts: ['t͡s'],
  dz: ['d͡z'],

  a: ['ɑ', 'ɑː', 'aː', 'ɐ', 'æ'],
  e: ['ɛ', 'eː'],
  i: ['ɪ', 'iː', 'j'],
  o: ['ɔ', 'oː', 'oʊ'],
  u: ['ʊ', 'uː', 'ʉ', 'w'],
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

function compactItalianTokens(tokens) {
  const out = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i];
    const next = tokens[i + 1];

    if (current === 'n' && next === 'y') {
      out.push('gn');
      i += 1;
      continue;
    }

    if (current === 'l' && next === 'y') {
      out.push('gli');
      i += 1;
      continue;
    }

    if (current === 'r' && next === 'r') {
      out.push('rr');
      i += 1;
      continue;
    }

    if (current === 't' && next === 's') {
      out.push('ts');
      i += 1;
      continue;
    }

    if (current === 'd' && next === 'z') {
      out.push('dz');
      i += 1;
      continue;
    }

    if (current === 's' && next === 'h') {
      out.push('sh');
      i += 1;
      continue;
    }

    if (current === 'c' && next === 'h') {
      out.push('ch');
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

  const aList = ITALIAN_EQUIVALENCE[a] || [];
  const bList = ITALIAN_EQUIVALENCE[b] || [];

  return aList.includes(b) || bList.includes(a);
}

function isFamilyMatch(a, b) {
  if (!a || !b) return false;

  if (isVowel(a) && isVowel(b)) return true;
  if (isConsonant(a) && isConsonant(b)) return true;

  return false;
}

function compareTokens(expected, detected) {
  if (!expected && !detected) {
    return { kind: 'empty', weight: 0 };
  }

  if (expected && !detected) {
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
    dp[i][0] = {
      score: dp[i - 1][0].score + INTERNAL_WEIGHTS.missing_sound - 0.25,
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
      const comparison = compareTokens(expectedTokens[i - 1], detectedTokens[j - 1]);

      const diagonal = {
        score: dp[i - 1][j - 1].score + comparison.weight,
        prev: [i - 1, j - 1, 'pair'],
      };

      const missing = {
        score: dp[i - 1][j].score - 0.25,
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
        ...compareTokens(expectedTokens[i - 1], detectedTokens[j - 1]),
      });
    } else if (action === 'missing') {
      aligned.push({
        expected: expectedTokens[i - 1],
        detected: null,
        kind: 'missing_sound',
        weight: INTERNAL_WEIGHTS.missing_sound,
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
    coverage: 0,
    weightedMatch: 0,
    anchorConsonantChanged: false,
  };

  let weightedTotal = 0;
  let coveredExpected = 0;
  let firstExpectedSoundSeen = false;

  for (const item of aligned) {
    if (item.expected) {
      if (item.detected) coveredExpected += 1;
      weightedTotal += item.weight || 0;
    }

    if (item.kind === 'exact_match') metrics.exactMatches += 1;
    else if (item.kind === 'near_match') metrics.nearMatches += 1;
    else if (item.kind === 'family_match') metrics.familyMatches += 1;
    else if (item.kind === 'changed_sound') metrics.changedSounds += 1;
    else if (item.kind === 'missing_sound') metrics.missingSounds += 1;
    else if (item.kind === 'extra_sound') metrics.extraSounds += 1;

    if (item.expected && item.kind !== 'exact_match' && item.kind !== 'near_match') {
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
    metrics.weightedMatch >= 0.75 &&
    metrics.missingSounds <= 1 &&
    metrics.changedSounds <= 1 &&
    noMajorConsonantProblem
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
  const expectedComparisonTokens = compactItalianTokens(
    normalizeSequence(expectedPhonemes, getDisplayToken)
  );

  const detectedComparisonTokens = compactItalianTokens(
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

    console.log('[IT UAS COACHING RESOLVER]', {
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

  console.log('[IT UAS COACHING RESOLVER]', {
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