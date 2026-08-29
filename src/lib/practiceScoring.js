export const PHONEME_RESULT_WEIGHT = 0.7;
export const MOUTH_MOVEMENT_WEIGHT = 0.3;

/*
 * MediaPipe mouth features occupy a much narrower real-camera range than the
 * theoretical 0..1 geometry profiles. Repeated, phonemically exact attempts
 * plateaued around 0.58 raw similarity, so that observed ceiling is calibrated
 * to 0.95. The low range stays unchanged; only credible articulation evidence
 * is expanded into the learner-facing 35..100 range.
 */
const MOUTH_RAW_LOW_ANCHOR = 0.35;
const MOUTH_RAW_STRONG_ANCHOR = 0.58;
const MOUTH_CALIBRATED_STRONG_ANCHOR = 0.95;

function clamp01(value) {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(1, numeric));
}

export function calibrateMouthEvidence(rawScore) {
  const raw = clamp01(rawScore);
  if (raw == null) return null;

  if (raw <= MOUTH_RAW_LOW_ANCHOR) {
    return raw;
  }

  if (raw <= MOUTH_RAW_STRONG_ANCHOR) {
    const progress =
      (raw - MOUTH_RAW_LOW_ANCHOR) /
      (MOUTH_RAW_STRONG_ANCHOR - MOUTH_RAW_LOW_ANCHOR);

    return clamp01(
      MOUTH_RAW_LOW_ANCHOR +
      progress *
        (MOUTH_CALIBRATED_STRONG_ANCHOR - MOUTH_RAW_LOW_ANCHOR)
    );
  }

  const progress =
    (raw - MOUTH_RAW_STRONG_ANCHOR) /
    (1 - MOUTH_RAW_STRONG_ANCHOR);

  return clamp01(
    MOUTH_CALIBRATED_STRONG_ANCHOR +
    progress * (1 - MOUTH_CALIBRATED_STRONG_ANCHOR)
  );
}

export function combinePronunciationEvidence(
  phonemeScore,
  mouthScore
) {
  const phoneme = clamp01(phonemeScore);
  const mouth = clamp01(mouthScore);

  if (phoneme == null) return null;

  /*
   * Mouth movement supports the verdict; it never blocks a valid phoneme
   * result. When synchronized visual evidence is unavailable, preserve the
   * real speech score instead of fabricating a mouth score or withholding the
   * attempt grade.
   */
  if (mouth == null) return phoneme;

  return clamp01(
    phoneme * PHONEME_RESULT_WEIGHT +
    mouth * MOUTH_MOVEMENT_WEIGHT
  );
}
