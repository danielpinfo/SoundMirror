import { ArticulationComparator } from '../analysis/ArticulationComparator';
import { resolveVisualPhonemes } from './resolveVisualPhoneme';

const NON_SPEECH_PHONEMES = new Set([
  '',
  'neutral',
  'sil',
  'silence',
  'pause',
  'spacer',
  'word_gap',
  'silence_space',
  'blank',
  '<blank>',
]);

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function clamp01(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.max(0, Math.min(1, number));
}

function normalizePhoneme(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function safelyNormalizeDetectedPhoneme(
  value,
  normalizeDetectedPhoneme
) {
  const raw = normalizePhoneme(value);

  if (!raw) {
    return '';
  }

  if (typeof normalizeDetectedPhoneme !== 'function') {
    return raw;
  }

  try {
    const normalized = normalizePhoneme(
      normalizeDetectedPhoneme(raw)
    );

    /*
     * A real detector result must never silently disappear.
     * When the pack cannot normalize a token, retain the raw token.
     */
    return normalized || raw;
  } catch (error) {
    console.warn(
      '[UAS] detected phoneme normalization failed',
      {
        phoneme: raw,
        error,
      }
    );

    return raw;
  }
}

function isRealSpeechPhoneme(phoneme) {
  const normalized = normalizePhoneme(phoneme);

  return (
    normalized.length > 0 &&
    !NON_SPEECH_PHONEMES.has(normalized)
  );
}

function normalizeBackendTimestampItem(item) {
  if (item == null) {
    return null;
  }

  /*
   * Legacy shape:
   * timestamps: [120, 340, 560]
   */
  if (isFiniteNumber(item)) {
    return {
      startMs: Number(item),
      endMs: null,
      source: 'numeric',
      raw: item,
    };
  }

  /*
   * Canonical backend shape:
   *
   * {
   *   phone,
   *   startMs,
   *   endMs,
   *   durationMs,
   *   topCandidates
   * }
   */
  if (typeof item === 'object') {
    const startMs =
      isFiniteNumber(item.startMs)
        ? Number(item.startMs)
        : isFiniteNumber(item.start)
          ? Number(item.start)
          : isFiniteNumber(item.timeMs)
            ? Number(item.timeMs)
            : isFiniteNumber(item.time)
              ? Number(item.time)
              : null;

    const endMs =
      isFiniteNumber(item.endMs)
        ? Number(item.endMs)
        : isFiniteNumber(item.end)
          ? Number(item.end)
          : null;

    if (!isFiniteNumber(startMs)) {
      return null;
    }

    return {
      startMs: Number(startMs),
      endMs: isFiniteNumber(endMs)
        ? Number(endMs)
        : null,
      source: 'object',
      raw: item,
    };
  }

  return null;
}

function normalizeCandidateScore(candidate) {
  if (
    !candidate ||
    typeof candidate !== 'object'
  ) {
    return null;
  }

  const possibleValues = [
    candidate.score,
    candidate.probability,
    candidate.prob,
    candidate.confidence,
    candidate.posterior,
    candidate.p,
  ];

  for (const value of possibleValues) {
    const score = clamp01(value);

    if (score !== null) {
      return score;
    }
  }

  return null;
}

function normalizeCandidatePhone(
  candidate,
  normalizeDetectedPhoneme
) {
  if (
    !candidate ||
    typeof candidate !== 'object'
  ) {
    return '';
  }

  return safelyNormalizeDetectedPhoneme(
    candidate.phone ??
      candidate.phoneme ??
      candidate.symbol ??
      candidate.token ??
      '',
    normalizeDetectedPhoneme
  );
}

function normalizeTopCandidates(
  backendTimestamp,
  normalizeDetectedPhoneme
) {
  const rawCandidates =
    backendTimestamp?.topCandidates;

  if (!Array.isArray(rawCandidates)) {
    return [];
  }

  return rawCandidates
    .map((candidate) => ({
      phone: normalizeCandidatePhone(
        candidate,
        normalizeDetectedPhoneme
      ),
      score: normalizeCandidateScore(candidate),
      raw: candidate,
    }))
    .filter((candidate) => candidate.phone);
}

/*
 * Align expected phoneme truth with detected phoneme results.
 *
 * This avoids assuming:
 *
 * expected[3] === detected[3]
 *
 * after a phoneme was inserted, omitted, or substituted.
 */
function alignPhonemeSequences(
  expectedPhonemes,
  detectedPhonemes
) {
  const expected = expectedPhonemes.map(
    normalizePhoneme
  );

  const detected = detectedPhonemes.map(
    normalizePhoneme
  );

  const rows = expected.length + 1;
  const columns = detected.length + 1;

  const cost = Array.from(
    { length: rows },
    () => Array(columns).fill(0)
  );

  for (let i = 0; i < rows; i += 1) {
    cost[i][0] = i;
  }

  for (let j = 0; j < columns; j += 1) {
    cost[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < columns; j += 1) {
      const substitutionCost =
        expected[i - 1] === detected[j - 1]
          ? 0
          : 1;

      const diagonal =
        cost[i - 1][j - 1] +
        substitutionCost;

      const deletion =
        cost[i - 1][j] + 1;

      const insertion =
        cost[i][j - 1] + 1;

      cost[i][j] = Math.min(
        diagonal,
        deletion,
        insertion
      );
    }
  }

  const byDetectedIndex = Array(
    detected.length
  ).fill(null);

  const missingExpected = [];
  const steps = [];

  let i = expected.length;
  let j = detected.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same =
        expected[i - 1] === detected[j - 1];

      const substitutionCost = same ? 0 : 1;

      const diagonal =
        cost[i - 1][j - 1] +
        substitutionCost;

      if (cost[i][j] === diagonal) {
        const operation = same
          ? 'match'
          : 'substitution';

        const step = {
          operation,
          expectedIndex: i - 1,
          detectedIndex: j - 1,
          expectedPhoneme: expected[i - 1],
          detectedPhoneme: detected[j - 1],
        };

        byDetectedIndex[j - 1] = step;
        steps.push(step);

        i -= 1;
        j -= 1;
        continue;
      }
    }

    if (
      i > 0 &&
      cost[i][j] === cost[i - 1][j] + 1
    ) {
      const missing = {
        operation: 'deletion',
        expectedIndex: i - 1,
        detectedIndex: null,
        expectedPhoneme: expected[i - 1],
        detectedPhoneme: null,
      };

      missingExpected.push(missing);
      steps.push(missing);

      i -= 1;
      continue;
    }

    if (j > 0) {
      const inserted = {
        operation: 'insertion',
        expectedIndex: null,
        detectedIndex: j - 1,
        expectedPhoneme: null,
        detectedPhoneme: detected[j - 1],
      };

      byDetectedIndex[j - 1] = inserted;
      steps.push(inserted);

      j -= 1;
      continue;
    }

    break;
  }

  steps.reverse();
  missingExpected.reverse();

  return {
    expected,
    detected,
    byDetectedIndex,
    missingExpected,
    steps,
    editDistance:
      cost[expected.length][detected.length],
  };
}

/*
 * Build the audio half of SoundMirror's verdict using only
 * already-produced phoneme detection results.
 *
 * No detector is called here.
 */
function buildAudioEvidence({
  expectedPhoneme,
  detectedPhoneme,
  operation,
  backendTimestamp,
  normalizeDetectedPhoneme,
}) {
  const expected = normalizePhoneme(
    expectedPhoneme
  );

  const detected = normalizePhoneme(
    detectedPhoneme
  );

  const candidates = normalizeTopCandidates(
    backendTimestamp,
    normalizeDetectedPhoneme
  );

  const exactMatch = Boolean(
    expected &&
      detected &&
      expected === detected
  );

  const expectedCandidate = expected
    ? candidates.find(
        (candidate) =>
          candidate.phone === expected
      ) ?? null
    : null;

  const detectedCandidate = detected
    ? candidates.find(
        (candidate) =>
          candidate.phone === detected
      ) ?? null
    : null;

  let score = null;
  let scoreSource = 'unavailable';

  if (!expected) {
    /*
     * Detected extra phoneme with no aligned target.
     */
    score = 0;
    scoreSource = 'sequence-insertion';
  } else if (exactMatch) {
    /*
     * The detector's selected result is the phoneme outcome this grader is
     * evaluating. A matching selected result is exact evidence; its internal
     * posterior is model confidence, not learner pronunciation accuracy.
     */
    score = 1;
    scoreSource = 'exact-detected-result';
  } else if (
    expectedCandidate?.score !== null &&
    expectedCandidate?.score !== undefined
  ) {
    score = expectedCandidate.score;
    scoreSource =
      'backend-expected-candidate-score';
  } else {
    score = 0;
    scoreSource = 'detected-result-mismatch';
  }

  return {
    available: Boolean(expected),
    expectedPhoneme: expected || null,
    detectedPhoneme: detected || null,
    exactMatch,
    mismatch: Boolean(
      expected && !exactMatch
    ),
    operation: operation ?? null,
    score: clamp01(score) ?? 0,
    scoreSource,
    expectedCandidateScore:
      expectedCandidate?.score ?? null,
    detectedCandidateScore:
      detectedCandidate?.score ?? null,
    topCandidates: candidates,
  };
}

function buildTimestampTimeline({
  rawPhonemes,
  normalizedPhonemes,
  timestamps,
  durationMs,
  finalFacialTime,
}) {
  const normalizedTimestamps = timestamps.map(
    normalizeBackendTimestampItem
  );

  const valid =
    normalizedTimestamps.length ===
      normalizedPhonemes.length &&
    normalizedTimestamps.every(
      (item) =>
        item &&
        isFiniteNumber(item.startMs)
    );

  if (!valid) {
    return null;
  }

  return normalizedPhonemes.map(
    (phoneme, index) => {
      const current =
        normalizedTimestamps[index];

      const next =
        normalizedTimestamps[index + 1] ||
        null;

      const startMs = Math.max(
        0,
        Number(current.startMs)
      );

      let endMs = null;

      if (
        isFiniteNumber(current.endMs) &&
        Number(current.endMs) > startMs
      ) {
        endMs = Number(current.endMs);
      } else if (
        next &&
        isFiniteNumber(next.startMs) &&
        Number(next.startMs) > startMs
      ) {
        endMs = Number(next.startMs);
      } else if (
        isFiniteNumber(durationMs) &&
        Number(durationMs) > startMs
      ) {
        endMs = Number(durationMs);
      } else if (
        isFiniteNumber(finalFacialTime) &&
        Number(finalFacialTime) > startMs
      ) {
        endMs = Number(finalFacialTime);
      } else {
        endMs = startMs + 200;
      }

      return {
        phoneme,
        detectedPhoneme: phoneme,
        rawPhoneme:
          rawPhonemes[index] ?? phoneme,
        start: startMs / 1000,
        end: endMs / 1000,
        startMs,
        endMs,
        durationMs: Math.max(
          0,
          endMs - startMs
        ),
        timestampSource: current.source,
        backendTimestamp: current.raw,
      };
    }
  );
}

function buildEstimatedTimeline({
  rawPhonemes,
  normalizedPhonemes,
  totalDurationMs,
}) {
  const phonemeDurationMs =
    totalDurationMs /
    normalizedPhonemes.length;

  return normalizedPhonemes.map(
    (phoneme, index) => {
      const startMs =
        index * phonemeDurationMs;

      const endMs =
        (index + 1) * phonemeDurationMs;

      return {
        phoneme,
        detectedPhoneme: phoneme,
        rawPhoneme:
          rawPhonemes[index] ?? phoneme,
        start: startMs / 1000,
        end: endMs / 1000,
        startMs,
        endMs,
        durationMs: Math.max(
          0,
          endMs - startMs
        ),
        timestampSource: 'estimated-even',
        backendTimestamp: null,
      };
    }
  );
}

export function buildArticulationAnalysis({
  /*
   * Detected phoneme results from the backend.
   */
  phonemes,

  /*
   * Expected phoneme truth from the active language pack.
   */
  expectedPhonemes = [],

  timestamps,
  facialTimeline,
  articulationMap,
  coachingRules,
  durationMs = null,

  /*
   * Optional active-pack-owned conversion from detector IPA into
   * that language pack's SoundMirror tokens.
   *
   * Shared UAS does not invent language rules.
   *
   * English example:
   * IPA j       -> SoundMirror y
   * IPA dʒ/d͡ʒ  -> SoundMirror j
   */
  normalizeDetectedPhoneme = null,
} = {}) {
  if (
    !Array.isArray(phonemes) ||
    phonemes.length === 0
  ) {
    /*
     * No detected speech result means there is no pronunciation verdict
     * and therefore no criticism or joke.
     */
    return [];
  }

  if (!articulationMap) {
    return [];
  }

  if (!coachingRules) {
    return [];
  }

  const rawDetectedPhonemes =
    phonemes.map(normalizePhoneme);

  const videoTimeline = Array.isArray(facialTimeline)
    ? facialTimeline
    : [];

  const detectedPhonemes =
    rawDetectedPhonemes.map((phoneme) =>
      safelyNormalizeDetectedPhoneme(
        phoneme,
        normalizeDetectedPhoneme
      )
    );

  const normalizedExpected =
    Array.isArray(expectedPhonemes)
      ? expectedPhonemes
          .map(normalizePhoneme)
          .filter(Boolean)
      : [];

  const attemptDetected =
    detectedPhonemes.some(
      isRealSpeechPhoneme
    );

  /*
   * If the backend returned only control/non-speech tokens,
   * this is not considered a genuine spoken attempt.
   */
  if (!attemptDetected) {
    return [];
  }

  const finalFacialTime = Number(
    videoTimeline[
      videoTimeline.length - 1
    ]?.time
  );

  const totalDurationMs =
    Number.isFinite(Number(durationMs)) &&
    Number(durationMs) > 0
      ? Number(durationMs)
      : Number.isFinite(finalFacialTime) &&
          finalFacialTime > 0
        ? finalFacialTime
        : detectedPhonemes.length * 200;

  const timestampTimeline =
    Array.isArray(timestamps) &&
    timestamps.length ===
      detectedPhonemes.length
      ? buildTimestampTimeline({
          rawPhonemes:
            rawDetectedPhonemes,
          normalizedPhonemes:
            detectedPhonemes,
          timestamps,
          durationMs: totalDurationMs,
          finalFacialTime,
        })
      : null;

  const basePhonemeTimeline =
    timestampTimeline ||
    buildEstimatedTimeline({
      rawPhonemes:
        rawDetectedPhonemes,
      normalizedPhonemes:
        detectedPhonemes,
      totalDurationMs,
    });

  /*
   * Only align against expected truth when the caller has supplied it.
   * Until then, this file refuses to invent a match or mismatch.
   */
  const alignment =
    normalizedExpected.length > 0
      ? alignPhonemeSequences(
          normalizedExpected,
          detectedPhonemes
        )
      : {
          expected: [],
          detected: detectedPhonemes,
          byDetectedIndex:
            detectedPhonemes.map(() => null),
          missingExpected: [],
          steps: [],
          editDistance: null,
        };

  const phonemeTimeline =
    basePhonemeTimeline.map(
      (entry, index) => {
        const aligned =
          alignment.byDetectedIndex[index] ??
          null;

        const expectedPhoneme =
          aligned?.expectedPhoneme ??
          null;

        const sequenceOperation =
          aligned?.operation ??
          null;

        const audioEvidence =
          normalizedExpected.length > 0
            ? buildAudioEvidence({
                expectedPhoneme,
                detectedPhoneme:
                  entry.phoneme,
                operation:
                  sequenceOperation,
                backendTimestamp:
                  entry.backendTimestamp,
                normalizeDetectedPhoneme,
              })
            : {
                available: false,
                expectedPhoneme: null,
                detectedPhoneme:
                  entry.phoneme,
                exactMatch: false,
                mismatch: false,
                operation: null,
                score: null,
                scoreSource:
                  'expected-phoneme-not-supplied',
                expectedCandidateScore: null,
                detectedCandidateScore: null,
                topCandidates:
                  normalizeTopCandidates(
                    entry.backendTimestamp,
                    normalizeDetectedPhoneme
                  ),
              };

        return {
          ...entry,
          expectedPhoneme,
          detectedPhoneme:
            entry.phoneme,
          expectedIndex:
            aligned?.expectedIndex ??
            null,
          detectedIndex: index,
          sequenceOperation,
          audioEvidence,
          attemptDetected: true,
        };
      }
    );

  const timingSource =
    timestampTimeline
      ? Array.isArray(timestamps) &&
        timestamps.some(
          (item) =>
            item &&
            typeof item === 'object'
        )
        ? 'canonical-timestamp-objects'
        : 'backend-numeric-timestamps'
      : 'estimated-even';

  const sequenceEvidence = {
    attemptDetected: true,
    expectedAvailable:
      normalizedExpected.length > 0,
    expectedPhonemes:
      alignment.expected,
    detectedPhonemes:
      alignment.detected,
    rawDetectedPhonemes,
    alignment: alignment.steps,
    missingExpected:
      alignment.missingExpected,
    editDistance:
      alignment.editDistance,
  };

  const normalizationChanges =
    rawDetectedPhonemes
      .map((rawPhoneme, index) => ({
        index,
        rawPhoneme,
        normalizedPhoneme:
          detectedPhonemes[index],
      }))
      .filter(
        (item) =>
          item.rawPhoneme !==
          item.normalizedPhoneme
      );

  console.log(
    '[UAS ARTICULATION TIMING]',
    {
      timingSource,
      phonemeCount:
        detectedPhonemes.length,
      expectedPhonemeCount:
        normalizedExpected.length,
      timestampCount:
        Array.isArray(timestamps)
          ? timestamps.length
          : null,
      totalDurationMs,
      attemptDetected,
      editDistance:
        alignment.editDistance,
      detectorNormalizationEnabled:
        typeof normalizeDetectedPhoneme ===
        'function',
      normalizationChanges,
      first3Timeline:
        phonemeTimeline
          .slice(0, 3)
          .map((item) => ({
            rawPhoneme:
              item.rawPhoneme,
            expectedPhoneme:
              item.expectedPhoneme,
            detectedPhoneme:
              item.detectedPhoneme,
            audioScore:
              item.audioEvidence?.score ??
              null,
            audioScoreSource:
              item.audioEvidence
                ?.scoreSource ??
              null,
            startMs: Number(
              item.startMs?.toFixed
                ? item.startMs.toFixed(1)
                : item.startMs
            ),
            endMs: Number(
              item.endMs?.toFixed
                ? item.endMs.toFixed(1)
                : item.endMs
            ),
            timestampSource:
              item.timestampSource,
          })),
    }
  );

  try {
    const comparator =
      new ArticulationComparator(
        articulationMap,
        coachingRules
      );

    /*
     * The comparator uses:
     *
     * 70% phoneme-result evidence
     * 30% mouth/articulation evidence
     *
     * with mismatch-gated coaching.
     */
    const comparisonResults =
      comparator.compare(
        phonemeTimeline,
        videoTimeline,
        sequenceEvidence
      );

    /*
     * Visual reranking remains downstream from the raw comparator.
     * It may refine ambiguous interpretation without replacing the
     * original backend result retained in rawPhoneme.
     */
    const visuallyResolvedResults =
      resolveVisualPhonemes(
        comparisonResults
      );

    if (
      !Array.isArray(
        visuallyResolvedResults
      )
    ) {
      return [];
    }

    return visuallyResolvedResults.map(
      (item) => ({
        ...item,
        attemptDetected: true,
      })
    );
  } catch (error) {
    console.warn(
      '[UAS] articulation analysis failed',
      error
    );

    return [];
  }
}
