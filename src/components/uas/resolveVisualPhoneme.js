/**
 * resolveVisualPhoneme
 *
 * Conservatively reranks a very small set of visually distinct
 * phoneme confusions using:
 *
 * - backend topCandidates
 * - synchronized facial evidence
 *
 * Audio always remains primary.
 *
 * This helper:
 * - never uses targetText
 * - never guesses words
 * - never overwrites the canonical phoneme
 * - adds visualResolvedPhoneme separately
 * - only changes a result when audio is weak or closely contested
 * - logs every accepted or rejected visual proposal
 */

const AUDIO_STRONG_SCORE = 0.85;
const AUDIO_CLOSE_MARGIN = 0.12;
const MIN_ALTERNATE_SCORE = 0.02;

const W_PHONES = new Set([
  'w',
]);

const V_PHONES = new Set([
  'v',
]);

const TH_PHONES = new Set([
  'θ',
  'ð',
  'th',
  'dh',
]);

function clamp01(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, number)
  );
}

function normalizePhone(phone) {
  if (phone == null) {
    return '';
  }

  const normalized = String(phone)
    .trim()
    .toLowerCase();

  if (normalized === 'ɡ') {
    return 'g';
  }

  return normalized;
}

function normalizeCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const phone = normalizePhone(
    candidate.phone ??
    candidate.phoneme ??
    candidate.token
  );

  const score = Number(
    candidate.score ??
    candidate.confidence ??
    candidate.probability
  );

  if (!phone || !Number.isFinite(score)) {
    return null;
  }

  return {
    phone,
    score: clamp01(score),
    raw: candidate,
  };
}

function getCandidates(item) {
  const source =
    item?.backendTimestamp?.topCandidates ??
    item?.topCandidates ??
    [];

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map(normalizeCandidate)
    .filter(Boolean)
    .sort(
      (left, right) =>
        right.score - left.score
    );
}

function findCandidate(
  candidates,
  acceptedPhones
) {
  return candidates.find(
    (candidate) =>
      acceptedPhones.has(candidate.phone)
  ) ?? null;
}

function getAudioState(
  canonicalPhone,
  candidates
) {
  const top =
    candidates[0] ?? null;

  const canonicalCandidate =
    candidates.find(
      (candidate) =>
        candidate.phone === canonicalPhone
    ) ?? top;

  const second =
    candidates.find(
      (candidate) =>
        candidate !== canonicalCandidate
    ) ?? null;

  const canonicalScore =
    canonicalCandidate?.score ?? 0;

  const secondScore =
    second?.score ?? 0;

  const margin =
    canonicalScore - secondScore;

  const strong =
    canonicalScore >=
      AUDIO_STRONG_SCORE;

  const close =
    margin <=
      AUDIO_CLOSE_MARGIN;

  return {
    top,
    canonicalCandidate,
    second,
    canonicalScore,
    secondScore,
    margin,
    strong,
    close,
    rerankingAllowed:
      !strong || close,
  };
}

function getVisualEvidence(item) {
  const features =
    item?.visualEvidence?.avgFeatures ??
    {};

  return {
    frameCount:
      Number(
        item?.visualEvidence?.frameCount
      ) || 0,

    lipRounding: clamp01(
      features.lip_rounding
    ),

    lipSpread: clamp01(
      features.lip_spread
    ),

    lipClosure: clamp01(
      features.lip_closure
    ),

    mouthOpen: clamp01(
      features.mouth_open
    ),

    lowerLipRoll: clamp01(
      features.lower_lip_roll
    ),

    lowerLipShrug: clamp01(
      features.lower_lip_shrug
    ),

    upperLipRoll: clamp01(
      features.upper_lip_roll
    ),

    labiodentalProxy: clamp01(
      features.labiodental_contact_proxy
    ),

    bilabialProxy: clamp01(
      features.bilabial_closure_proxy
    ),

    tongueOut: clamp01(
      features.tongue_out
    ),
  };
}

function evaluateWVisual(evidence) {
  const strongRounding =
    evidence.lipRounding >= 0.65;

  const lowLabiodental =
    evidence.labiodentalProxy <= 0.20;

  const lowLowerLipShrug =
    evidence.lowerLipShrug <= 0.20;

  const lowSpread =
    evidence.lipSpread <= 0.40;

  const supported =
    evidence.frameCount >= 2 &&
    strongRounding &&
    lowLabiodental &&
    lowLowerLipShrug &&
    lowSpread;

  const score = clamp01(
    evidence.lipRounding * 0.65 +
    (1 - evidence.labiodentalProxy) * 0.15 +
    (1 - evidence.lowerLipShrug) * 0.10 +
    (1 - evidence.lipSpread) * 0.10
  );

  return {
    supported,
    score,
    reasons: {
      strongRounding,
      lowLabiodental,
      lowLowerLipShrug,
      lowSpread,
    },
  };
}

function evaluateVVisual(evidence) {
  const lowRounding =
    evidence.lipRounding <= 0.25;

  const labiodentalSignal =
    evidence.labiodentalProxy >= 0.24;

  const lowerLipSignal =
    evidence.lowerLipShrug >= 0.20 ||
    evidence.lowerLipRoll >= 0.18;

  const notWideOpen =
    evidence.mouthOpen <= 0.45;

  const supported =
    evidence.frameCount >= 2 &&
    lowRounding &&
    labiodentalSignal &&
    lowerLipSignal &&
    notWideOpen;

  const lowerLipEvidence = Math.max(
    evidence.lowerLipShrug,
    evidence.lowerLipRoll
  );

  const score = clamp01(
    (1 - evidence.lipRounding) * 0.30 +
    evidence.labiodentalProxy * 0.35 +
    lowerLipEvidence * 0.25 +
    (1 - evidence.mouthOpen) * 0.10
  );

  return {
    supported,
    score,
    reasons: {
      lowRounding,
      labiodentalSignal,
      lowerLipSignal,
      notWideOpen,
    },
  };
}

function buildUnchangedResult({
  item,
  rawPhoneme,
  canonicalPhoneme,
  candidates,
  audioState,
  evidence,
  reason,
  proposal = null,
}) {
  return {
    ...item,

    rawPhoneme,
    canonicalPhoneme,

    visualResolvedPhoneme:
      canonicalPhoneme,

    visualResolution: {
      changed: false,
      reason,
      proposal,
      audioState,
      visualEvidence: evidence,
      candidates,
    },
  };
}

function buildChangedResult({
  item,
  rawPhoneme,
  canonicalPhoneme,
  resolvedPhoneme,
  candidates,
  audioState,
  evidence,
  reason,
  proposal,
}) {
  const result = {
    ...item,

    rawPhoneme,
    canonicalPhoneme,

    visualResolvedPhoneme:
      resolvedPhoneme,

    visualResolution: {
      changed: true,
      reason,
      proposal,
      audioState,
      visualEvidence: evidence,
      candidates,
    },
  };

  console.log(
    '[UAS VISUAL PHONEME RERANK]',
    {
      rawPhoneme,
      canonicalPhoneme,
      visualResolvedPhoneme:
        resolvedPhoneme,
      reason,
      proposal,
      audioState,
      visualEvidence: evidence,
      backendTimestamp:
        item?.backendTimestamp ?? null,
    }
  );

  return result;
}

/**
 * Resolves one articulation-analysis item.
 *
 * @param {object} item
 * @returns {object}
 */
export function resolveVisualPhoneme(
  item
) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const canonicalPhoneme =
    normalizePhone(item.phoneme);

  const rawPhoneme =
    normalizePhone(
      item.rawPhoneme ??
      item.backendTimestamp?.rawPhone ??
      item.backendTimestamp?.phone ??
      item.phoneme
    );

  const candidates =
    getCandidates(item);

  const evidence =
    getVisualEvidence(item);

  const audioState =
    getAudioState(
      canonicalPhoneme,
      candidates
    );

  if (!canonicalPhoneme) {
    return buildUnchangedResult({
      item,
      rawPhoneme,
      canonicalPhoneme,
      candidates,
      audioState,
      evidence,
      reason:
        'missing-canonical-phoneme',
    });
  }

  if (evidence.frameCount < 2) {
    return buildUnchangedResult({
      item,
      rawPhoneme,
      canonicalPhoneme,
      candidates,
      audioState,
      evidence,
      reason:
        'insufficient-visual-frames',
    });
  }

  if (!audioState.rerankingAllowed) {
    return buildUnchangedResult({
      item,
      rawPhoneme,
      canonicalPhoneme,
      candidates,
      audioState,
      evidence,
      reason:
        'audio-confidence-strong',
    });
  }

  const wVisual =
    evaluateWVisual(evidence);

  const vVisual =
    evaluateVVisual(evidence);

  /*
   * W → V
   *
   * Only permitted when:
   * - backend included V as a plausible candidate
   * - V visual evidence is strong
   * - W visual evidence is not strong
   */
  if (W_PHONES.has(canonicalPhoneme)) {
    const vCandidate =
      findCandidate(
        candidates,
        V_PHONES
      );

    if (
      vCandidate &&
      vCandidate.score >=
        MIN_ALTERNATE_SCORE &&
      vVisual.supported &&
      !wVisual.supported
    ) {
      return buildChangedResult({
        item,
        rawPhoneme,
        canonicalPhoneme,
        resolvedPhoneme: 'v',
        candidates,
        audioState,
        evidence,
        reason:
          'audio-ambiguous-visual-supports-v-over-w',
        proposal: {
          from: canonicalPhoneme,
          to: 'v',
          alternateAudioScore:
            vCandidate.score,
          wVisual,
          vVisual,
        },
      });
    }
  }

  /*
   * V → W
   *
   * Only permitted when:
   * - backend included W as a plausible candidate
   * - W visual evidence is strong
   * - V visual evidence is not strong
   */
  if (V_PHONES.has(canonicalPhoneme)) {
    const wCandidate =
      findCandidate(
        candidates,
        W_PHONES
      );

    if (
      wCandidate &&
      wCandidate.score >=
        MIN_ALTERNATE_SCORE &&
      wVisual.supported &&
      !vVisual.supported
    ) {
      return buildChangedResult({
        item,
        rawPhoneme,
        canonicalPhoneme,
        resolvedPhoneme: 'w',
        candidates,
        audioState,
        evidence,
        reason:
          'audio-ambiguous-visual-supports-w-over-v',
        proposal: {
          from: canonicalPhoneme,
          to: 'w',
          alternateAudioScore:
            wCandidate.score,
          wVisual,
          vVisual,
        },
      });
    }
  }

  /*
   * TH → V
   *
   * This is intentionally one-directional for now.
   *
   * We only replace θ/ð with V when:
   * - backend explicitly included V in topCandidates
   * - audio was weak or close
   * - strong labiodental visual evidence supports V
   *
   * We do not currently convert V to TH because MediaPipe's tongueOut
   * signal is not reliable enough by itself to prove a dental gesture.
   */
  if (TH_PHONES.has(canonicalPhoneme)) {
    const vCandidate =
      findCandidate(
        candidates,
        V_PHONES
      );

    if (
      vCandidate &&
      vCandidate.score >=
        MIN_ALTERNATE_SCORE &&
      vVisual.supported
    ) {
      return buildChangedResult({
        item,
        rawPhoneme,
        canonicalPhoneme,
        resolvedPhoneme: 'v',
        candidates,
        audioState,
        evidence,
        reason:
          'audio-ambiguous-visual-supports-v-over-th',
        proposal: {
          from: canonicalPhoneme,
          to: 'v',
          alternateAudioScore:
            vCandidate.score,
          vVisual,
        },
      });
    }
  }

  return buildUnchangedResult({
    item,
    rawPhoneme,
    canonicalPhoneme,
    candidates,
    audioState,
    evidence,
    reason:
      'no-safe-visual-rerank',
    proposal: {
      wVisual,
      vVisual,
    },
  });
}

/**
 * Resolves a complete articulation-analysis array.
 *
 * The array length and item order are preserved.
 */
export function resolveVisualPhonemes(
  analysisItems
) {
  if (!Array.isArray(analysisItems)) {
    return [];
  }

  const resolved =
    analysisItems.map(
      resolveVisualPhoneme
    );

  const changed =
    resolved.filter(
      (item) =>
        item?.visualResolution?.changed
    );

  console.log(
    '[UAS VISUAL RERANK SUMMARY]',
    {
      itemCount: resolved.length,
      changedCount: changed.length,
      changes: changed.map(
        (item) => ({
          rawPhoneme:
            item.rawPhoneme,
          canonicalPhoneme:
            item.canonicalPhoneme,
          visualResolvedPhoneme:
            item.visualResolvedPhoneme,
          reason:
            item.visualResolution?.reason,
        })
      ),
    }
  );

  return resolved;
}

export default resolveVisualPhonemes;