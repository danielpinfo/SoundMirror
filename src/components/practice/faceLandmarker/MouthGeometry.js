/**
 * MouthGeometry
 *
 * Converts MediaPipe Face Landmarker landmarks into stable, normalized
 * mouth measurements suitable for diagnostics, quality checks, and later
 * scoring work.
 *
 * This module does NOT assign grades or correct phonemes.
 * It only measures geometry and exposes conservative visual proxies.
 */

// MediaPipe Face Landmarker / Face Mesh landmark indices.
const LM = Object.freeze({
  LEFT_MOUTH_CORNER: 61,
  RIGHT_MOUTH_CORNER: 291,

  OUTER_TOP: 0,
  OUTER_BOTTOM: 17,

  INNER_TOP: 13,
  INNER_BOTTOM: 14,

  UPPER_LIP_LEFT: 37,
  UPPER_LIP_RIGHT: 267,
  LOWER_LIP_LEFT: 84,
  LOWER_LIP_RIGHT: 314,

  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,

  NOSE_TIP: 1,
  CHIN: 152,

  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
});

const OUTER_LIP = Object.freeze([
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409,
  291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
]);

const INNER_LIP = Object.freeze([
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415,
  308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
]);

function safePoint(landmarks, index) {
  const point = landmarks?.[index];

  if (!point) {
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  return {
    x: Number.isFinite(point.x) ? point.x : 0,
    y: Number.isFinite(point.y) ? point.y : 0,
    z: Number.isFinite(point.z) ? point.z : 0,
  };
}

function distance2D(a, b) {
  return Math.hypot(
    b.x - a.x,
    b.y - a.y
  );
}

function distance3D(a, b) {
  return Math.hypot(
    b.x - a.x,
    b.y - a.y,
    b.z - a.z
  );
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  };
}

function polygonArea(points) {
  if (!points?.length) return 0;

  let sum = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];

    sum += (
      current.x * next.y -
      next.x * current.y
    );
  }

  return Math.abs(sum) / 2;
}

function boundsFor(points) {
  if (!points?.length) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
    };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;

  return Math.max(
    0,
    Math.min(1, value)
  );
}

function safeRatio(numerator, denominator) {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator <= 0
  ) {
    return 0;
  }

  return numerator / denominator;
}

function average(left, right) {
  return (
    (Number(left) || 0) +
    (Number(right) || 0)
  ) / 2;
}

/**
 * Returns normalized mouth geometry for one detected face.
 *
 * All coordinates are normalized to the source frame.
 */
export function computeMouthGeometry(
  landmarks,
  frame = {}
) {
  if (
    !Array.isArray(landmarks) ||
    landmarks.length < 468
  ) {
    return {
      valid: false,
      reason: 'insufficient_landmarks',
    };
  }

  const leftCorner = safePoint(
    landmarks,
    LM.LEFT_MOUTH_CORNER
  );

  const rightCorner = safePoint(
    landmarks,
    LM.RIGHT_MOUTH_CORNER
  );

  const outerTop = safePoint(
    landmarks,
    LM.OUTER_TOP
  );

  const outerBottom = safePoint(
    landmarks,
    LM.OUTER_BOTTOM
  );

  const innerTop = safePoint(
    landmarks,
    LM.INNER_TOP
  );

  const innerBottom = safePoint(
    landmarks,
    LM.INNER_BOTTOM
  );

  const leftCheek = safePoint(
    landmarks,
    LM.LEFT_CHEEK
  );

  const rightCheek = safePoint(
    landmarks,
    LM.RIGHT_CHEEK
  );

  const leftEyeOuter = safePoint(
    landmarks,
    LM.LEFT_EYE_OUTER
  );

  const rightEyeOuter = safePoint(
    landmarks,
    LM.RIGHT_EYE_OUTER
  );

  const noseTip = safePoint(
    landmarks,
    LM.NOSE_TIP
  );

  const chin = safePoint(
    landmarks,
    LM.CHIN
  );

  const upperLeft = safePoint(
    landmarks,
    LM.UPPER_LIP_LEFT
  );

  const upperRight = safePoint(
    landmarks,
    LM.UPPER_LIP_RIGHT
  );

  const lowerLeft = safePoint(
    landmarks,
    LM.LOWER_LIP_LEFT
  );

  const lowerRight = safePoint(
    landmarks,
    LM.LOWER_LIP_RIGHT
  );

  const outerLipPoints = OUTER_LIP.map(
    (index) => safePoint(landmarks, index)
  );

  const innerLipPoints = INNER_LIP.map(
    (index) => safePoint(landmarks, index)
  );

  const outerBounds = boundsFor(
    outerLipPoints
  );

  const innerBounds = boundsFor(
    innerLipPoints
  );

  const mouthWidth = distance2D(
    leftCorner,
    rightCorner
  );

  const mouthWidth3D = distance3D(
    leftCorner,
    rightCorner
  );

  const outerLipHeight = distance2D(
    outerTop,
    outerBottom
  );

  const innerMouthHeight = distance2D(
    innerTop,
    innerBottom
  );

  const faceWidth = distance2D(
    leftCheek,
    rightCheek
  );

  const interEyeDistance = distance2D(
    leftEyeOuter,
    rightEyeOuter
  );

  const noseToChin = distance2D(
    noseTip,
    chin
  );

  // Inter-eye distance is usually more stable than cheek width
  // under mild head rotation.
  const scale =
    interEyeDistance ||
    faceWidth ||
    1;

  const mouthCenter = midpoint(
    leftCorner,
    rightCorner
  );

  const upperLipMid = midpoint(
    upperLeft,
    upperRight
  );

  const lowerLipMid = midpoint(
    lowerLeft,
    lowerRight
  );

  const upperLipThickness = distance2D(
    outerTop,
    upperLipMid
  );

  const lowerLipThickness = distance2D(
    outerBottom,
    lowerLipMid
  );

  const leftVertical = distance2D(
    upperLeft,
    lowerLeft
  );

  const rightVertical = distance2D(
    upperRight,
    lowerRight
  );

  const verticalAsymmetry = safeRatio(
    Math.abs(leftVertical - rightVertical),
    Math.max(leftVertical, rightVertical)
  );

  const outerArea = polygonArea(
    outerLipPoints
  );

  const innerArea = polygonArea(
    innerLipPoints
  );

  const mouthAspectRatio = safeRatio(
    innerMouthHeight,
    mouthWidth
  );

  const outerAspectRatio = safeRatio(
    outerLipHeight,
    mouthWidth
  );

  const normalizedMouthWidth = safeRatio(
    mouthWidth,
    scale
  );

  const normalizedInnerHeight = safeRatio(
    innerMouthHeight,
    scale
  );

  const normalizedOuterHeight = safeRatio(
    outerLipHeight,
    scale
  );

  const normalizedInnerArea = safeRatio(
    innerArea,
    scale * scale
  );

  const normalizedOuterArea = safeRatio(
    outerArea,
    scale * scale
  );

  const frameWidth = Number(frame.width) || 0;
  const frameHeight = Number(frame.height) || 0;

  const pixelBounds =
    frameWidth > 0 && frameHeight > 0
      ? {
          x: outerBounds.minX * frameWidth,
          y: outerBounds.minY * frameHeight,
          width: outerBounds.width * frameWidth,
          height: outerBounds.height * frameHeight,
          centerX: outerBounds.centerX * frameWidth,
          centerY: outerBounds.centerY * frameHeight,
        }
      : null;

  const mouthFrameCoverage = clamp01(
    outerBounds.width *
    outerBounds.height
  );

  return {
    valid: true,

    center: {
      x: mouthCenter.x,
      y: mouthCenter.y,
      z: mouthCenter.z,
    },

    bounds: {
      normalized: outerBounds,
      pixels: pixelBounds,
    },

    raw: {
      mouthWidth,
      mouthWidth3D,
      outerLipHeight,
      innerMouthHeight,
      upperLipThickness,
      lowerLipThickness,
      outerArea,
      innerArea,
      faceWidth,
      interEyeDistance,
      noseToChin,
      leftVertical,
      rightVertical,
    },

    normalized: {
      mouthWidth: normalizedMouthWidth,
      innerMouthHeight: normalizedInnerHeight,
      outerLipHeight: normalizedOuterHeight,
      innerMouthArea: normalizedInnerArea,
      outerMouthArea: normalizedOuterArea,
    },

    ratios: {
      mouthAspectRatio,
      outerAspectRatio,

      lipClosureRatio: clamp01(
        1 -
        safeRatio(
          innerMouthHeight,
          Math.max(outerLipHeight, 1e-6)
        )
      ),

      verticalAsymmetry: clamp01(
        verticalAsymmetry
      ),

      upperToLowerLipThickness: safeRatio(
        upperLipThickness,
        lowerLipThickness
      ),
    },

    coverage: {
      normalizedFrameArea: mouthFrameCoverage,
      percentOfFrame: mouthFrameCoverage * 100,
      pixelWidth: pixelBounds?.width ?? null,
      pixelHeight: pixelBounds?.height ?? null,
      pixelArea: pixelBounds
        ? (
            pixelBounds.width *
            pixelBounds.height
          )
        : null,
    },

    landmarks: {
      outerLip: OUTER_LIP,
      innerLip: INNER_LIP,
    },
  };
}

/**
 * Reads the most useful MediaPipe mouth blendshapes from a
 * normalized name-to-score map.
 */
export function extractMouthBlendshapes(
  blendshapeMap = {}
) {
  const read = (name) => {
    const value = Number(
      blendshapeMap?.[name]
    );

    return Number.isFinite(value)
      ? clamp01(value)
      : 0;
  };

  return {
    jawOpen: read('jawOpen'),
    mouthClose: read('mouthClose'),

    mouthFunnel: read('mouthFunnel'),
    mouthPucker: read('mouthPucker'),

    mouthSmileLeft: read('mouthSmileLeft'),
    mouthSmileRight: read('mouthSmileRight'),

    mouthStretchLeft: read('mouthStretchLeft'),
    mouthStretchRight: read('mouthStretchRight'),

    mouthPressLeft: read('mouthPressLeft'),
    mouthPressRight: read('mouthPressRight'),

    mouthRollLower: read('mouthRollLower'),
    mouthRollUpper: read('mouthRollUpper'),

    mouthShrugUpper: read('mouthShrugUpper'),
    mouthShrugLower: read('mouthShrugLower'),

    mouthDimpleLeft: read('mouthDimpleLeft'),
    mouthDimpleRight: read('mouthDimpleRight'),

    mouthLeft: read('mouthLeft'),
    mouthRight: read('mouthRight'),

    tongueOut: read('tongueOut'),
  };
}

/**
 * Temporary compatibility mapping for the current SoundMirror
 * facial timeline.
 *
 * These fields preserve downstream compatibility while using
 * independent Face Landmarker signals instead of the old
 * "round = 1 - spread" formula.
 *
 * The proxy fields are diagnostic evidence only. They are not
 * direct tooth-contact measurements and must not be treated as
 * validated learner grades.
 */
export function buildLegacyCompatibleFeatures({
  geometry,
  blendshapes,
}) {
  const smile = average(
    blendshapes?.mouthSmileLeft,
    blendshapes?.mouthSmileRight
  );

  const stretch = average(
    blendshapes?.mouthStretchLeft,
    blendshapes?.mouthStretchRight
  );

  const press = average(
    blendshapes?.mouthPressLeft,
    blendshapes?.mouthPressRight
  );

  const mouthOpen = clamp01(
    Math.max(
      blendshapes?.jawOpen || 0,

      clamp01(
        (
          geometry?.ratios
            ?.mouthAspectRatio || 0
        ) / 0.6
      )
    )
  );

  const lipSpread = clamp01(
    Math.max(
      smile,
      stretch
    )
  );

  const lipRounding = clamp01(
    Math.max(
      blendshapes?.mouthPucker || 0,
      blendshapes?.mouthFunnel || 0
    )
  );

  const lipClosure = clamp01(
    Math.max(
      blendshapes?.mouthClose || 0,
      geometry?.ratios
        ?.lipClosureRatio || 0,
      press
    )
  );

  const lowerLipRoll = clamp01(
    blendshapes?.mouthRollLower || 0
  );

  const upperLipRoll = clamp01(
    blendshapes?.mouthRollUpper || 0
  );

  const lowerLipShrug = clamp01(
    blendshapes?.mouthShrugLower || 0
  );

  const upperLipShrug = clamp01(
    blendshapes?.mouthShrugUpper || 0
  );

  const limitedOpening = clamp01(
    1 - mouthOpen
  );

  const lowRounding = clamp01(
    1 - lipRounding
  );

  /*
   * Labiodental-contact proxy
   *
   * MediaPipe does not provide direct upper-teeth landmarks.
   * This value therefore represents only a conservative pattern:
   *
   * - lower lip rolling inward
   * - lower lip elevation
   * - some lip pressure
   * - little W-like rounding
   * - limited jaw opening
   *
   * It must never be described as confirmed tooth contact.
   */
  const labiodentalCore = clamp01(
    (
      lowerLipRoll * 0.55
    ) +
    (
      lowerLipShrug * 0.20
    ) +
    (
      press * 0.15
    ) +
    (
      lipClosure * 0.10
    )
  );

  const labiodentalContactProxy = clamp01(
    labiodentalCore *
    (
      0.65 +
      lowRounding * 0.35
    ) *
    (
      0.60 +
      limitedOpening * 0.40
    )
  );

  /*
   * Bilabial-closure proxy
   *
   * This estimates a closed/pressed two-lip gesture useful for
   * later separating likely B/P/M-style closure from W rounding.
   * It does not determine which bilabial phoneme was spoken.
   */
  const bilabialClosureCore = clamp01(
    Math.max(
      blendshapes?.mouthClose || 0,
      press,
      geometry?.ratios
        ?.lipClosureRatio || 0
    )
  );

  const bilabialClosureProxy = clamp01(
    (
      bilabialClosureCore * 0.70 +
      lipClosure * 0.30
    ) *
    (
      0.70 +
      limitedOpening * 0.30
    )
  );

  const tongueOut = clamp01(
    blendshapes?.tongueOut || 0
  );

  return {
    mouth_open: mouthOpen,
    lip_spread: lipSpread,
    lip_rounding: lipRounding,
    lip_closure: lipClosure,

    lower_lip_roll: lowerLipRoll,
    upper_lip_roll: upperLipRoll,
    lower_lip_shrug: lowerLipShrug,
    upper_lip_shrug: upperLipShrug,

    labiodental_contact_proxy:
      labiodentalContactProxy,

    bilabial_closure_proxy:
      bilabialClosureProxy,

    tongue_out: tongueOut,

    // Kept only so old consumers do not break.
    // This is not true tooth detection.
    teeth_visibility: clamp01(
      geometry?.normalized
        ?.innerMouthHeight || 0
    ),

    blendshapes,
    geometry,
  };
}

export {
  LM,
  OUTER_LIP,
  INNER_LIP,
};