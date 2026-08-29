/**
 * MouthQualityGate
 *
 * Evaluates whether one Face Landmarker frame contains enough usable mouth
 * evidence for visual articulation analysis.
 *
 * This module does NOT grade the learner. It only decides whether visual
 * evidence is trustworthy enough to be considered.
 */

const DEFAULT_THRESHOLDS = Object.freeze({
  // Minimum visible mouth size in the captured frame.
  minMouthPixelWidth: 90,
  minMouthPixelHeight: 35,
  minMouthFrameCoveragePercent: 0.35,

  // Preferred center zone for stable analysis.
  minCenterX: 0.18,
  maxCenterX: 0.82,
  minCenterY: 0.30,
  maxCenterY: 0.88,

  // Head pose limits in degrees.
  maxAbsYawDegrees: 22,
  maxAbsPitchDegrees: 20,
  maxAbsRollDegrees: 18,

  // Minimum tracking confidence where available.
  minTrackingConfidence: 0.55,

  // Recording-level requirements.
  minUsableFrameRatio: 0.70,
  minUsableFrames: 8,
});

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

function normalizeAngleDegrees(value) {
  if (!Number.isFinite(value)) return 0;
  let angle = value;
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
}

/**
 * Extract approximate yaw, pitch, and roll from a MediaPipe 4x4 facial
 * transformation matrix.
 *
 * The returned pose is intended for quality gating, not clinical measurement.
 */
export function extractHeadPoseDegrees(matrixLike) {
  const data =
    matrixLike?.data ||
    matrixLike?.matrix ||
    matrixLike;

  if (!data || data.length < 16) {
    return {
      available: false,
      yaw: 0,
      pitch: 0,
      roll: 0,
    };
  }

  // MediaPipe returns a column-major 4x4 transform matrix.
  const m00 = Number(data[0]);
  const m01 = Number(data[4]);
  const m02 = Number(data[8]);

  const m10 = Number(data[1]);
  const m11 = Number(data[5]);
  const m12 = Number(data[9]);

  const m20 = Number(data[2]);
  const m21 = Number(data[6]);
  const m22 = Number(data[10]);

  if (
    ![
      m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22,
    ].every(Number.isFinite)
  ) {
    return {
      available: false,
      yaw: 0,
      pitch: 0,
      roll: 0,
    };
  }

  const sy = Math.hypot(m00, m10);
  const singular = sy < 1e-6;

  let pitch;
  let yaw;
  let roll;

  if (!singular) {
    pitch = Math.atan2(m21, m22);
    yaw = Math.atan2(-m20, sy);
    roll = Math.atan2(m10, m00);
  } else {
    pitch = Math.atan2(-m12, m11);
    yaw = Math.atan2(-m20, sy);
    roll = 0;
  }

  return {
    available: true,
    yaw: normalizeAngleDegrees(toDegrees(yaw)),
    pitch: normalizeAngleDegrees(toDegrees(pitch)),
    roll: normalizeAngleDegrees(toDegrees(roll)),
  };
}

function buildGuidance(reasonCodes) {
  if (!reasonCodes.length) return 'Mouth evidence is usable.';

  if (reasonCodes.includes('no_face')) {
    return 'Center your face in the camera.';
  }

  if (
    reasonCodes.includes('mouth_too_small') ||
    reasonCodes.includes('mouth_resolution_too_low')
  ) {
    return 'Move closer so your mouth appears larger.';
  }

  if (reasonCodes.includes('mouth_off_center')) {
    return 'Keep your mouth near the center of the camera.';
  }

  if (
    reasonCodes.includes('head_turned') ||
    reasonCodes.includes('head_tilted')
  ) {
    return 'Face the camera directly and keep your head level.';
  }

  if (reasonCodes.includes('low_tracking_confidence')) {
    return 'Improve lighting and keep your face steady.';
  }

  return 'Adjust your position so your mouth is clearly visible.';
}

/**
 * Evaluate one analyzed frame.
 */
export function evaluateMouthFrameQuality({
  faceDetected = false,
  geometry = null,
  transformationMatrix = null,
  trackingConfidence = null,
  frameWidth = 0,
  frameHeight = 0,
  thresholds = {},
} = {}) {
  const limits = {
    ...DEFAULT_THRESHOLDS,
    ...thresholds,
  };

  const reasons = [];
  const pose = extractHeadPoseDegrees(transformationMatrix);

  if (!faceDetected || !geometry?.valid) {
    reasons.push('no_face');
  }

  const centerX = geometry?.center?.x ?? null;
  const centerY = geometry?.center?.y ?? null;

  const pixelWidth =
    geometry?.coverage?.pixelWidth ??
    (
      geometry?.bounds?.normalized?.width && frameWidth
        ? geometry.bounds.normalized.width * frameWidth
        : 0
    );

  const pixelHeight =
    geometry?.coverage?.pixelHeight ??
    (
      geometry?.bounds?.normalized?.height && frameHeight
        ? geometry.bounds.normalized.height * frameHeight
        : 0
    );

  const coveragePercent =
    geometry?.coverage?.percentOfFrame ?? 0;

  if (
    faceDetected &&
    (
      pixelWidth < limits.minMouthPixelWidth ||
      pixelHeight < limits.minMouthPixelHeight
    )
  ) {
    reasons.push('mouth_resolution_too_low');
  }

  if (
    faceDetected &&
    coveragePercent < limits.minMouthFrameCoveragePercent
  ) {
    reasons.push('mouth_too_small');
  }

  if (
    faceDetected &&
    (
      centerX == null ||
      centerY == null ||
      centerX < limits.minCenterX ||
      centerX > limits.maxCenterX ||
      centerY < limits.minCenterY ||
      centerY > limits.maxCenterY
    )
  ) {
    reasons.push('mouth_off_center');
  }

  if (pose.available) {
    if (Math.abs(pose.yaw) > limits.maxAbsYawDegrees) {
      reasons.push('head_turned');
    }

    if (
      Math.abs(pose.pitch) > limits.maxAbsPitchDegrees ||
      Math.abs(pose.roll) > limits.maxAbsRollDegrees
    ) {
      reasons.push('head_tilted');
    }
  }

  if (
    Number.isFinite(Number(trackingConfidence)) &&
    Number(trackingConfidence) < limits.minTrackingConfidence
  ) {
    reasons.push('low_tracking_confidence');
  }

  const uniqueReasons = [...new Set(reasons)];
  const usable = uniqueReasons.length === 0;

  const mouthSizeScore = clamp01(
    Math.min(
      pixelWidth / limits.minMouthPixelWidth,
      pixelHeight / limits.minMouthPixelHeight,
      coveragePercent / limits.minMouthFrameCoveragePercent
    )
  );

  const centeringScore =
    centerX == null || centerY == null
      ? 0
      : clamp01(
          1 -
          (
            Math.abs(centerX - 0.5) +
            Math.abs(centerY - 0.62)
          )
        );

  const poseScore = pose.available
    ? clamp01(
        1 -
        Math.max(
          Math.abs(pose.yaw) / limits.maxAbsYawDegrees,
          Math.abs(pose.pitch) / limits.maxAbsPitchDegrees,
          Math.abs(pose.roll) / limits.maxAbsRollDegrees
        )
      )
    : 0.5;

  const confidenceScore = Number.isFinite(Number(trackingConfidence))
    ? clamp01(Number(trackingConfidence))
    : 0.5;

  const qualityScore = clamp01(
    (
      mouthSizeScore * 0.40 +
      centeringScore * 0.20 +
      poseScore * 0.25 +
      confidenceScore * 0.15
    )
  );

  return {
    usable,
    qualityScore,
    reasons: uniqueReasons,
    guidance: buildGuidance(uniqueReasons),

    measurements: {
      mouthPixelWidth: pixelWidth,
      mouthPixelHeight: pixelHeight,
      mouthFrameCoveragePercent: coveragePercent,
      centerX,
      centerY,
      frameWidth,
      frameHeight,
      trackingConfidence:
        Number.isFinite(Number(trackingConfidence))
          ? Number(trackingConfidence)
          : null,
    },

    pose,

    thresholds: limits,
  };
}

/**
 * Tracks frame quality throughout one recording.
 */
export class MouthQualityAccumulator {
  constructor(thresholds = {}) {
    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...thresholds,
    };
    this.reset();
  }

  reset() {
    this.totalFrames = 0;
    this.usableFrames = 0;
    this.qualitySum = 0;
    this.reasonCounts = {};
    this.firstTimestampMs = null;
    this.lastTimestampMs = null;
  }

  add(frameQuality, timestampMs = null) {
    if (!frameQuality) return;

    this.totalFrames += 1;

    if (frameQuality.usable) {
      this.usableFrames += 1;
    }

    this.qualitySum += Number(frameQuality.qualityScore) || 0;

    for (const reason of frameQuality.reasons || []) {
      this.reasonCounts[reason] =
        (this.reasonCounts[reason] || 0) + 1;
    }

    if (Number.isFinite(timestampMs)) {
      if (this.firstTimestampMs == null) {
        this.firstTimestampMs = timestampMs;
      }
      this.lastTimestampMs = timestampMs;
    }
  }

  getSummary() {
    const usableFrameRatio = this.totalFrames
      ? this.usableFrames / this.totalFrames
      : 0;

    const averageQualityScore = this.totalFrames
      ? this.qualitySum / this.totalFrames
      : 0;

    const visualEvidenceUsable =
      this.usableFrames >= this.thresholds.minUsableFrames &&
      usableFrameRatio >= this.thresholds.minUsableFrameRatio;

    const dominantReasons = Object.entries(this.reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => ({
        reason,
        count,
        ratio: this.totalFrames ? count / this.totalFrames : 0,
      }));

    return {
      visualEvidenceUsable,
      totalFrames: this.totalFrames,
      usableFrames: this.usableFrames,
      unusableFrames: this.totalFrames - this.usableFrames,
      usableFrameRatio,
      averageQualityScore,
      dominantReasons,
      durationMs:
        this.firstTimestampMs != null &&
        this.lastTimestampMs != null
          ? Math.max(
              0,
              this.lastTimestampMs - this.firstTimestampMs
            )
          : null,
      thresholds: this.thresholds,
    };
  }
}

export function createMouthQualityAccumulator(thresholds = {}) {
  return new MouthQualityAccumulator(thresholds);
}

export {
  DEFAULT_THRESHOLDS,
};