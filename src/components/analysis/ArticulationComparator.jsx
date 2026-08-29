import {
  PHONEME_RESULT_WEIGHT,
  MOUTH_MOVEMENT_WEIGHT,
  calibrateMouthEvidence,
} from '../../lib/practiceScoring';

/**
 * ArticulationComparator
 *
 * Compares already-produced phoneme detection RESULTS with synchronized
 * mouth-movement evidence.
 *
 * SoundMirror scoring contract:
 *   70% phoneme-result evidence
 *   30% mouth/articulation evidence
 *
 * Important:
 * - This class never calls the phoneme detector.
 * - Expected phoneme truth comes from the active language pack.
 * - Detected phoneme/result evidence comes from buildArticulationAnalysis.
 * - Mouth evidence helps score and diagnose; it does not invent an audio error.
 * - Corrective coaching requires a real expected-vs-detected phoneme mismatch.
 * - Correct/near-perfect work may earn positive feedback instead of silence.
 */

// ---------------------------------------------------------------------------
// Expected articulatory feature profiles per universal physical frame label.
// These are biomechanical targets. Language packs decide which phoneme maps
// to which frame label.
// ---------------------------------------------------------------------------
const FRAME_PROFILES = {
  neutral: {
    lip_closure: 0.3,
    lip_rounding: 0.1,
    lip_spread: 0.3,
    mouth_open: 0.1,
  },

  open_vowel: {
    lip_closure: 0.0,
    lip_rounding: 0.1,
    lip_spread: 0.4,
    mouth_open: 0.9,
  },

  mid_vowel: {
    lip_closure: 0.0,
    lip_rounding: 0.2,
    lip_spread: 0.5,
    mouth_open: 0.6,
  },

  front_vowel: {
    lip_closure: 0.1,
    lip_rounding: 0.0,
    lip_spread: 0.9,
    mouth_open: 0.4,
  },

  rounded_vowel_ue: {
    lip_closure: 0.1,
    lip_rounding: 0.9,
    lip_spread: 0.1,
    mouth_open: 0.4,
  },

  rounded_vowel_oo: {
    lip_closure: 0.0,
    lip_rounding: 0.9,
    lip_spread: 0.0,
    mouth_open: 0.5,
  },

  velar_stop: {
    lip_closure: 0.1,
    lip_rounding: 0.0,
    lip_spread: 0.3,
    mouth_open: 0.1,
  },

  alveolar_stop: {
    lip_closure: 0.1,
    lip_rounding: 0.0,
    lip_spread: 0.4,
    mouth_open: 0.1,
  },

  bilabial: {
    lip_closure: 1.0,
    lip_rounding: 0.0,
    lip_spread: 0.0,
    mouth_open: 0.0,
  },

  alveolar_nasal: {
    lip_closure: 0.2,
    lip_rounding: 0.0,
    lip_spread: 0.4,
    mouth_open: 0.1,
  },

  velar_nasal: {
    lip_closure: 0.1,
    lip_rounding: 0.0,
    lip_spread: 0.3,
    mouth_open: 0.1,
  },

  alveolar_fricative: {
    lip_closure: 0.1,
    lip_rounding: 0.0,
    lip_spread: 0.7,
    mouth_open: 0.2,
  },

  postalveolar_fricative: {
    lip_closure: 0.1,
    lip_rounding: 0.4,
    lip_spread: 0.3,
    mouth_open: 0.3,
  },

  dental_fricative: {
    lip_closure: 0.0,
    lip_rounding: 0.0,
    lip_spread: 0.5,
    mouth_open: 0.2,
  },

  labiodental_fricative: {
    lip_closure: 0.0,
    lip_rounding: 0.0,
    lip_spread: 0.4,
    mouth_open: 0.2,
  },

  affricate: {
    lip_closure: 0.2,
    lip_rounding: 0.3,
    lip_spread: 0.3,
    mouth_open: 0.3,
  },

  glottal: {
    lip_closure: 0.0,
    lip_rounding: 0.0,
    lip_spread: 0.4,
    mouth_open: 0.4,
  },

  rhotic: {
    lip_closure: 0.1,
    lip_rounding: 0.3,
    lip_spread: 0.2,
    mouth_open: 0.4,
  },

  lateral: {
    lip_closure: 0.1,
    lip_rounding: 0.0,
    lip_spread: 0.5,
    mouth_open: 0.3,
  },

  glide: {
    lip_closure: 0.0,
    lip_rounding: 0.2,
    lip_spread: 0.4,
    mouth_open: 0.3,
  },
};

const AUDIO_WEIGHT = PHONEME_RESULT_WEIGHT;
const ARTICULATION_WEIGHT = MOUTH_MOVEMENT_WEIGHT;

// Per-phoneme performance bands. The attempt-level message can later use
// these results to choose Great Job / almost there / playful total-miss copy.
const EXCELLENT_THRESHOLD = 0.93;
const STRONG_THRESHOLD = 0.82;
const CLOSE_THRESHOLD = 0.65;
const DEVELOPING_THRESHOLD = 0.35;
const TOTAL_MISS_CANDIDATE_MAX = 0.05;

// Exact CTC phone windows can be extremely short.
// Face analysis is lower frequency, so use a visual evidence window.
const VISUAL_WINDOW_PAD_MS = 120;
const VISUAL_NEAREST_MAX_DISTANCE_MS = 160;
const MIN_VISUAL_WINDOW_MS = 180;

/*
 * These four features remain the validated mouth-scoring inputs.
 * They collectively form the articulation half of the 50/50 verdict.
 */
const SCORE_FEATURE_KEYS = [
  'lip_closure',
  'lip_rounding',
  'lip_spread',
  'mouth_open',
];

/*
 * Additional measurements are diagnostic evidence for coaching selection.
 * They do not independently increase the mouth-scoring weight.
 */
const EVIDENCE_FEATURE_KEYS = [
  ...SCORE_FEATURE_KEYS,

  'lower_lip_roll',
  'upper_lip_roll',
  'lower_lip_shrug',
  'upper_lip_shrug',

  'labiodental_contact_proxy',
  'bilabial_closure_proxy',
  'tongue_out',
  'teeth_visibility',
];

function clamp01(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(1, number));
}

function finiteNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function normalizePhoneme(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function getNestedNumber(object, path) {
  let current = object;

  for (const key of path) {
    if (current == null) {
      return null;
    }

    current = current[key];
  }

  return finiteNumber(current);
}

function maxFinite(values) {
  const numbers = values
    .map((value) => finiteNumber(value))
    .filter((value) => Number.isFinite(value));

  if (!numbers.length) {
    return null;
  }

  return Math.max(...numbers);
}

/*
 * Returns both value and availability.
 * This is important for coaching proxies: a missing feature must never be
 * interpreted as a real zero and accidentally trigger a correction.
 */
function getFeatureReading(features, key) {
  if (!features) {
    return {
      available: false,
      value: 0,
    };
  }

  if (key === 'mouth_open') {
    const value = maxFinite([
      features.mouth_open,
      features.mouthOpen,
      getNestedNumber(features, ['geometry', 'mouthOpen']),
      getNestedNumber(features, ['geometry', 'jawOpen']),
      getNestedNumber(features, ['blendshapes', 'jawOpen']),
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'lip_spread') {
    const value = maxFinite([
      features.lip_spread,
      features.lipSpread,
      getNestedNumber(features, ['geometry', 'lipSpread']),
      getNestedNumber(features, ['blendshapes', 'mouthSmileLeft']),
      getNestedNumber(features, ['blendshapes', 'mouthSmileRight']),
      getNestedNumber(features, ['blendshapes', 'mouthStretchLeft']),
      getNestedNumber(features, ['blendshapes', 'mouthStretchRight']),
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'lip_rounding') {
    const value = maxFinite([
      features.lip_rounding,
      features.lipRounding,
      features.rounding,
      getNestedNumber(features, ['geometry', 'lipRounding']),
      getNestedNumber(features, ['blendshapes', 'mouthPucker']),
      getNestedNumber(features, ['blendshapes', 'mouthFunnel']),
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'lip_closure') {
    const direct = maxFinite([
      features.lip_closure,
      features.lipClosure,
      getNestedNumber(features, ['geometry', 'lipClosure']),
      getNestedNumber(features, ['blendshapes', 'mouthClose']),
    ]);

    if (direct != null) {
      return {
        available: true,
        value: clamp01(direct),
      };
    }

    // Conservative fallback: low mouth opening is evidence of closure.
    const openReading = getFeatureReading(features, 'mouth_open');

    if (openReading.available) {
      return {
        available: true,
        value: clamp01(1 - openReading.value),
      };
    }

    return {
      available: false,
      value: 0,
    };
  }

  if (key === 'lower_lip_roll') {
    const value = maxFinite([
      features.lower_lip_roll,
      features.lowerLipRoll,
      getNestedNumber(features, ['blendshapes', 'mouthRollLower']),
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'upper_lip_roll') {
    const value = maxFinite([
      features.upper_lip_roll,
      features.upperLipRoll,
      getNestedNumber(features, ['blendshapes', 'mouthRollUpper']),
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'lower_lip_shrug') {
    const value = maxFinite([
      features.lower_lip_shrug,
      features.lowerLipShrug,
      getNestedNumber(features, ['blendshapes', 'mouthShrugLower']),
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'upper_lip_shrug') {
    const value = maxFinite([
      features.upper_lip_shrug,
      features.upperLipShrug,
      getNestedNumber(features, ['blendshapes', 'mouthShrugUpper']),
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'labiodental_contact_proxy') {
    const value = maxFinite([
      features.labiodental_contact_proxy,
      features.labiodentalContactProxy,
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'bilabial_closure_proxy') {
    const value = maxFinite([
      features.bilabial_closure_proxy,
      features.bilabialClosureProxy,
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'tongue_out') {
    const value = maxFinite([
      features.tongue_out,
      features.tongueOut,
      getNestedNumber(features, ['blendshapes', 'tongueOut']),
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  if (key === 'teeth_visibility') {
    const value = maxFinite([
      features.teeth_visibility,
      features.teethVisibility,
    ]);

    return {
      available: value != null,
      value: clamp01(value ?? 0),
    };
  }

  const direct = finiteNumber(features[key]);

  return {
    available: direct != null,
    value: clamp01(direct ?? 0),
  };
}

function averageFeatureEvidence(
  frameFeatures,
  featureKeys = EVIDENCE_FEATURE_KEYS
) {
  const profile = {};
  const counts = {};

  for (const key of featureKeys) {
    const readings = frameFeatures
      .map((features) => getFeatureReading(features, key))
      .filter((reading) => reading.available);

    counts[key] = readings.length;

    profile[key] = readings.length
      ? readings.reduce(
          (sum, reading) => sum + reading.value,
          0
        ) / readings.length
      : 0;
  }

  return {
    profile,
    counts,
    availableKeys: featureKeys.filter(
      (key) => (counts[key] ?? 0) > 0
    ),
  };
}

function averageFeatureProfile(
  frameFeatures,
  featureKeys = EVIDENCE_FEATURE_KEYS
) {
  return averageFeatureEvidence(
    frameFeatures,
    featureKeys
  ).profile;
}

function estimateSampleIntervalMs(videoTimeline) {
  if (
    !Array.isArray(videoTimeline) ||
    videoTimeline.length < 2
  ) {
    return null;
  }

  const deltas = [];

  for (
    let index = 1;
    index < videoTimeline.length;
    index += 1
  ) {
    const previous = finiteNumber(
      videoTimeline[index - 1]?.time
    );

    const next = finiteNumber(
      videoTimeline[index]?.time
    );

    if (
      Number.isFinite(previous) &&
      Number.isFinite(next) &&
      next > previous
    ) {
      deltas.push(next - previous);
    }
  }

  if (!deltas.length) {
    return null;
  }

  deltas.sort((left, right) => left - right);

  return deltas[
    Math.floor(deltas.length / 2)
  ];
}

function getPerformanceBand(finalScore) {
  if (!Number.isFinite(finalScore)) {
    return 'unscored';
  }

  if (finalScore >= EXCELLENT_THRESHOLD) {
    return 'excellent';
  }

  if (finalScore >= STRONG_THRESHOLD) {
    return 'strong';
  }

  if (finalScore >= CLOSE_THRESHOLD) {
    return 'close';
  }

  if (finalScore >= DEVELOPING_THRESHOLD) {
    return 'developing';
  }

  return 'miss';
}

export class ArticulationComparator {
  /**
   * @param {object} articulationMap — from PluginContext
   * @param {object} coachingRules   — from PluginContext
   */
  constructor(
    articulationMap,
    coachingRules
  ) {
    this.articulationMap = articulationMap;
    this.coachingRules = coachingRules;

    // Build normalized phoneme → frame label lookup from the language pack.
    this._phonemeToLabel = {};

    for (
      const frame of articulationMap?.frames ?? []
    ) {
      for (
        const phoneme of frame.phonemes ?? []
      ) {
        this._phonemeToLabel[
          normalizePhoneme(phoneme)
        ] = frame.label;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Main compare entry point
  // -------------------------------------------------------------------------

  /**
   * @param {Array<object>} phonemeTimeline
   *   Timeline entries created from DETECTED phoneme results and aligned
   *   expected phoneme truth.
   *
   * @param {Array<{time, features}>} videoTimeline
   *
   * @param {object|null} sequenceEvidence
   *   Alignment/attempt metadata from buildArticulationAnalysis.
   *
   * @returns {Array<object>}
   */
  compare(
    phonemeTimeline,
    videoTimeline,
    sequenceEvidence = null
  ) {
    const sampleIntervalMs =
      estimateSampleIntervalMs(videoTimeline);

    const attemptDetected =
      sequenceEvidence?.attemptDetected === true ||
      phonemeTimeline.some(
        (entry) => entry?.attemptDetected === true
      );

    return phonemeTimeline.map((entry) => {
      const detectedPhoneme = normalizePhoneme(
        entry.detectedPhoneme ?? entry.phoneme
      );

      const expectedPhoneme = normalizePhoneme(
        entry.expectedPhoneme ?? ''
      );

      /*
       * Mouth scoring must compare the user's mouth to the EXPECTED sound,
       * not to the sound that happened to be detected.
       */
      const expectedLabel = expectedPhoneme
        ? this._phonemeToLabel[expectedPhoneme] ?? null
        : null;

      const expectedProfile = expectedLabel
        ? FRAME_PROFILES[expectedLabel] ?? null
        : null;

      const visualWindow =
        this._buildVisualWindow(
          entry,
          sampleIntervalMs
        );

      const relevant =
        this._selectVideoFrames(
          videoTimeline,
          visualWindow
        );

      const frameFeatures = relevant.map(
        (frame) => frame.features
      );

      const visualEvidenceBundle =
        relevant.length > 0
          ? averageFeatureEvidence(
              frameFeatures,
              EVIDENCE_FEATURE_KEYS
            )
          : {
              profile: null,
              counts: {},
              availableKeys: [],
            };

      const articulationScore =
        relevant.length > 0 && expectedProfile
          ? this._averageFeatureScore(
              frameFeatures,
              expectedProfile
            )
          : null;

      /*
       * AUDIO HALF:
       * Consume the result evidence already prepared upstream.
       * Never invent audioScore = 1 merely because a phone exists.
       */
      const rawAudioScore = finiteNumber(
        entry.audioEvidence?.score
      );

      const audioScore =
        entry.audioEvidence?.available === false ||
        rawAudioScore == null
          ? null
          : clamp01(rawAudioScore);

      /*
       * Phoneme evidence leads the verdict; synchronized mouth movement
       * remains meaningful supporting evidence.
       * If either half is unavailable, this phone is not given a fake
       * full verdict.
       */
      const finalScore =
        audioScore != null &&
        articulationScore != null
          ? clamp01(
              audioScore * AUDIO_WEIGHT +
              articulationScore * ARTICULATION_WEIGHT
            )
          : null;

      const performanceBand =
        getPerformanceBand(finalScore);

      const audioMismatch =
        entry.audioEvidence?.mismatch === true;

      const coaching =
        this._selectCoaching({
          expectedPhoneme,
          detectedPhoneme,
          audioMismatch,
          expectedProfile,
          avgFeatures:
            visualEvidenceBundle.profile,
          featureCounts:
            visualEvidenceBundle.counts,
        });

      const feedback =
        this._generateFeedback({
          attemptDetected,
          audioMismatch,
          exactMatch:
            entry.audioEvidence?.exactMatch === true,
          performanceBand,
          finalScore,
          coaching,
        });

      return {
        /*
         * Keep phoneme for backward compatibility: it remains the raw/canonical
         * DETECTED result. Expected truth is explicit beside it.
         */
        phoneme: detectedPhoneme,
        detectedPhoneme,
        expectedPhoneme:
          expectedPhoneme || null,

        expectedFrameLabel:
          expectedLabel,

        audioScore,
        articulationScore,
        finalScore,

        scoreWeights: {
          audio: AUDIO_WEIGHT,
          articulation: ARTICULATION_WEIGHT,
        },

        scoreReady:
          audioScore != null &&
          articulationScore != null,

        performanceBand,

        /*
         * Corrective coaching is mismatch-gated.
         * Positive feedback may still be returned for a correct attempt.
         */
        feedback,
        coaching,

        audioMismatch,
        exactPhonemeMatch:
          entry.audioEvidence?.exactMatch === true,

        audioEvidence:
          entry.audioEvidence ?? null,

        sequenceOperation:
          entry.sequenceOperation ?? null,

        expectedIndex:
          entry.expectedIndex ?? null,

        detectedIndex:
          entry.detectedIndex ?? null,

        attemptDetected,

        /*
         * This is only a flag for the later ATTEMPT-level response layer.
         * Do not render the playful total-miss line once per phoneme.
         */
        totalMissCandidate:
          attemptDetected &&
          audioMismatch &&
          finalScore != null &&
          finalScore <= TOTAL_MISS_CANDIDATE_MAX,

        visualWindow,

        visualEvidence: {
          frameCount:
            relevant.length,

          sampleIntervalMs,

          avgFeatures:
            visualEvidenceBundle.profile,

          featureAvailability:
            visualEvidenceBundle.counts,

          availableFeatureKeys:
            visualEvidenceBundle.availableKeys,

          evidenceType:
            'mediapipe-mouth-geometry-and-blendshape-proxies',

          scoreFeatureKeys:
            SCORE_FEATURE_KEYS,

          evidenceFeatureKeys:
            EVIDENCE_FEATURE_KEYS,
        },

        timing: {
          startMs:
            visualWindow.phoneStartMs,

          endMs:
            visualWindow.phoneEndMs,

          source:
            entry.timestampSource ?? null,
        },

        backendTimestamp:
          entry.backendTimestamp ?? null,

        attemptContext: {
          expectedAvailable:
            sequenceEvidence?.expectedAvailable ??
            Boolean(expectedPhoneme),

          editDistance:
            sequenceEvidence?.editDistance ?? null,

          missingExpectedCount:
            Array.isArray(
              sequenceEvidence?.missingExpected
            )
              ? sequenceEvidence.missingExpected.length
              : 0,

          missingExpected:
            Array.isArray(
              sequenceEvidence?.missingExpected
            )
              ? sequenceEvidence.missingExpected
              : [],
        },
      };
    });
  }

  _buildVisualWindow(
    entry,
    sampleIntervalMs
  ) {
    const explicitStartMs =
      finiteNumber(entry.startMs);

    const explicitEndMs =
      finiteNumber(entry.endMs);

    const phoneStartMs =
      explicitStartMs != null
        ? explicitStartMs
        : Number(entry.start || 0) * 1000;

    const phoneEndMs =
      explicitEndMs != null
        ? explicitEndMs
        : Number(entry.end || 0) * 1000;

    const safeStartMs =
      Math.max(0, phoneStartMs);

    const safeEndMs =
      Math.max(
        safeStartMs,
        phoneEndMs
      );

    const phoneDurationMs =
      Math.max(
        0,
        safeEndMs - safeStartMs
      );

    const samplePad =
      Number.isFinite(sampleIntervalMs) &&
      sampleIntervalMs > 0
        ? Math.ceil(sampleIntervalMs * 1.5)
        : 0;

    const padMs = Math.max(
      VISUAL_WINDOW_PAD_MS,
      samplePad
    );

    let windowStartMs = Math.max(
      0,
      safeStartMs - padMs
    );

    let windowEndMs =
      safeEndMs + padMs;

    const windowDurationMs =
      windowEndMs - windowStartMs;

    if (
      windowDurationMs <
      MIN_VISUAL_WINDOW_MS
    ) {
      const center =
        safeStartMs +
        phoneDurationMs / 2;

      windowStartMs = Math.max(
        0,
        center -
          MIN_VISUAL_WINDOW_MS / 2
      );

      windowEndMs =
        windowStartMs +
        MIN_VISUAL_WINDOW_MS;
    }

    return {
      phoneStartMs: safeStartMs,
      phoneEndMs: safeEndMs,
      phoneDurationMs,
      windowStartMs,
      windowEndMs,
      padMs,
    };
  }

  _selectVideoFrames(
    videoTimeline,
    visualWindow
  ) {
    if (
      !Array.isArray(videoTimeline) ||
      !videoTimeline.length
    ) {
      return [];
    }

    const inWindow =
      videoTimeline.filter((frame) => {
        const time =
          finiteNumber(frame?.time);

        return (
          time != null &&
          time >= visualWindow.windowStartMs &&
          time <= visualWindow.windowEndMs
        );
      });

    if (inWindow.length > 0) {
      return inWindow;
    }

    const centerMs =
      visualWindow.phoneStartMs +
      visualWindow.phoneDurationMs / 2;

    let best = null;
    let bestDistance =
      Number.POSITIVE_INFINITY;

    for (const frame of videoTimeline) {
      const time =
        finiteNumber(frame?.time);

      if (time == null) {
        continue;
      }

      const distance = Math.abs(
        time - centerMs
      );

      if (distance < bestDistance) {
        best = frame;
        bestDistance = distance;
      }
    }

    if (
      best &&
      bestDistance <=
        VISUAL_NEAREST_MAX_DISTANCE_MS
    ) {
      return [best];
    }

    return [];
  }

  // -------------------------------------------------------------------------
  // Mouth scoring — supporting evidence in the 70/30 final verdict
  // -------------------------------------------------------------------------

  _averageFeatureScore(
    frameFeatures,
    expectedProfile
  ) {
    if (!frameFeatures.length) {
      return null;
    }

    const evidence =
      averageFeatureEvidence(
        frameFeatures,
        SCORE_FEATURE_KEYS
      );

    const usableKeys =
      SCORE_FEATURE_KEYS.filter(
        (key) =>
          (evidence.counts[key] ?? 0) > 0 &&
          Number.isFinite(
            expectedProfile[key]
          )
      );

    if (!usableKeys.length) {
      return null;
    }

    let total = 0;

    for (const key of usableKeys) {
      const difference = Math.abs(
        (evidence.profile[key] ?? 0) -
        (expectedProfile[key] ?? 0)
      );

      total += 1 - difference;
    }

    return calibrateMouthEvidence(
      clamp01(total / usableKeys.length)
    );
  }

  // -------------------------------------------------------------------------
  // Mismatch-gated coaching selection
  // -------------------------------------------------------------------------

  _selectCoaching({
    expectedPhoneme,
    detectedPhoneme,
    audioMismatch,
    expectedProfile,
    avgFeatures,
    featureCounts,
  }) {
    const policy =
      this.coachingRules?.policy ?? {};

    const library =
      this.coachingRules?.coachingLibrary ?? null;

    const cards =
      library?.cards ?? {};

    const triggers =
      Array.isArray(library?.triggers)
        ? library.triggers
        : [];

    /*
     * Core contract: no corrective coaching without a real phoneme mismatch.
     */
    if (!audioMismatch) {
      return {
        allowed: false,
        reason: 'phoneme-match-no-correction-needed',
        primary: null,
        secondary: [],
        matchedTriggerIds: [],
      };
    }

    const matches = [];

    for (const trigger of triggers) {
      if (
        trigger.requireAudioMismatch === true &&
        !audioMismatch
      ) {
        continue;
      }

      if (
        Array.isArray(trigger.expectedPhonemes) &&
        trigger.expectedPhonemes.length > 0
      ) {
        const expectedSet = new Set(
          trigger.expectedPhonemes.map(
            normalizePhoneme
          )
        );

        if (!expectedSet.has(expectedPhoneme)) {
          continue;
        }
      }

      if (
        Array.isArray(trigger.confusionPairs) &&
        trigger.confusionPairs.length > 0
      ) {
        const pairMatch =
          trigger.confusionPairs.some(
            (pair) =>
              Array.isArray(pair) &&
              normalizePhoneme(pair[0]) === expectedPhoneme &&
              normalizePhoneme(pair[1]) === detectedPhoneme
          );

        if (!pairMatch) {
          continue;
        }
      }

      if (
        Array.isArray(trigger.visualAny) &&
        trigger.visualAny.length > 0
      ) {
        const visualMatch =
          trigger.visualAny.some(
            (condition) =>
              this._matchesVisualCondition(
                condition,
                expectedProfile,
                avgFeatures,
                featureCounts
              )
          );

        if (!visualMatch) {
          continue;
        }
      } else if (
        trigger.requireVisualCondition === true
      ) {
        continue;
      }

      const card =
        cards[trigger.cardId];

      if (!card) {
        continue;
      }

      matches.push({
        trigger,
        card,
        priority:
          Number(trigger.priority) || 0,
      });
    }

    matches.sort(
      (left, right) =>
        right.priority - left.priority
    );

    const unique = [];
    const seenCardIds = new Set();

    for (const match of matches) {
      const cardId =
        match.trigger.cardId;

      if (seenCardIds.has(cardId)) {
        continue;
      }

      seenCardIds.add(cardId);
      unique.push(match);
    }

    const maxPrimary = Math.max(
      0,
      Number(policy.maxPrimaryCards ?? 1)
    );

    const maxSecondary = Math.max(
      0,
      Number(policy.maxSecondaryCards ?? 1)
    );

    const primaryMatch =
      maxPrimary > 0
        ? unique[0] ?? null
        : null;

    const secondaryMatches =
      unique.slice(
        primaryMatch ? 1 : 0,
        (primaryMatch ? 1 : 0) +
          maxSecondary
      );

    return {
      allowed: true,
      reason:
        primaryMatch
          ? 'mismatch-with-supported-coaching'
          : 'mismatch-no-specific-card',

      primary:
        primaryMatch
          ? {
              cardId:
                primaryMatch.trigger.cardId,
              triggerId:
                primaryMatch.trigger.id,
              priority:
                primaryMatch.priority,
              ...primaryMatch.card,
            }
          : null,

      secondary:
        secondaryMatches.map(
          (match) => ({
            cardId:
              match.trigger.cardId,
            triggerId:
              match.trigger.id,
            priority:
              match.priority,
            ...match.card,
          })
        ),

      matchedTriggerIds:
        unique.map(
          (match) => match.trigger.id
        ),
    };
  }

  _matchesVisualCondition(
    condition,
    expectedProfile,
    avgFeatures,
    featureCounts
  ) {
    if (!condition?.feature) {
      return false;
    }

    const feature =
      condition.feature;

    /*
     * Missing evidence is unknown, not zero.
     */
    if (
      !avgFeatures ||
      (featureCounts?.[feature] ?? 0) <= 0
    ) {
      return false;
    }

    const actual =
      finiteNumber(
        avgFeatures[feature]
      );

    if (actual == null) {
      return false;
    }

    const relation =
      condition.relation;

    const minDelta = Math.max(
      0,
      Number(condition.minDelta) || 0
    );

    const absoluteValue =
      finiteNumber(condition.value);

    const expectedValue =
      finiteNumber(
        expectedProfile?.[feature]
      );

    if (relation === 'below_expected') {
      return (
        expectedValue != null &&
        actual <= expectedValue - minDelta
      );
    }

    if (relation === 'above_expected') {
      return (
        expectedValue != null &&
        actual >= expectedValue + minDelta
      );
    }

    if (relation === 'outside_expected') {
      return (
        expectedValue != null &&
        Math.abs(actual - expectedValue) >= minDelta
      );
    }

    if (relation === 'below_absolute') {
      return (
        absoluteValue != null &&
        actual < absoluteValue
      );
    }

    if (relation === 'above_absolute') {
      return (
        absoluteValue != null &&
        actual > absoluteValue
      );
    }

    return false;
  }

  // -------------------------------------------------------------------------
  // Learner-facing per-phoneme feedback
  // -------------------------------------------------------------------------

  _generateFeedback({
    attemptDetected,
    audioMismatch,
    exactMatch,
    performanceBand,
    finalScore,
    coaching,
  }) {
    if (!attemptDetected) {
      return [];
    }

    const feedback = [];

    /*
     * Positive acknowledgement is allowed even when no correction is needed.
     * The playful total-miss line belongs to the later attempt-level layer so
     * it can appear once, not once per failed phoneme.
     */
    if (!audioMismatch && exactMatch) {
      if (performanceBand === 'excellent') {
        feedback.push('Great job!');
      } else if (performanceBand === 'strong') {
        feedback.push('Nice work — that was strong.');
      } else if (performanceBand === 'close') {
        feedback.push('Good job — I heard the right sound.');
      }

      return feedback;
    }

    if (!audioMismatch) {
      return feedback;
    }

    if (performanceBand === 'excellent') {
      feedback.push('Great effort — that was extremely close.');
    } else if (performanceBand === 'strong') {
      feedback.push('Nice work — you’re very close.');
    } else if (performanceBand === 'close') {
      feedback.push('Good effort — you’re close.');
    } else if (performanceBand === 'developing') {
      feedback.push('Good attempt — let’s tighten up one thing.');
    } else if (
      Number.isFinite(finalScore)
    ) {
      feedback.push('Let’s try that sound again.');
    }

    if (coaching?.primary?.tip) {
      feedback.push(
        coaching.primary.tip
      );
    }

    for (
      const secondary of coaching?.secondary ?? []
    ) {
      if (secondary?.tip) {
        feedback.push(secondary.tip);
      }
    }

    return [
      ...new Set(feedback),
    ];
  }
}
