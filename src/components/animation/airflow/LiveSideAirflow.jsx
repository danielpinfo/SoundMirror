import React, { useEffect, useId, useRef, useState } from 'react';
import { AIRFLOW_IDLE, AirflowEngine } from './AirflowEngine';

const CYAN = '#1296a3';
const CYAN_SOFT = '#2fb6c2';

const ORAL_CLIP = 'M 34 47 C 44 42.5 57 42.5 65 46.5 L 65 61 C 59 66 46 67 36 64 C 33 61.5 32 52 34 47 Z';
const NASAL_CLIP = 'M 29 27 C 39 23 58 24 67 30 L 66 40 C 57 45 40 45 31 41 C 27 38 26 31 29 27 Z';

const ORAL_INTERNAL_CURVES = [
  { p0: { x: 63, y: 48.4 }, cp1: { x: 57, y: 43.8 }, cp2: { x: 47, y: 43.6 }, p1: { x: 35, y: 48.8 } },
  { p0: { x: 62, y: 50.7 }, cp1: { x: 56, y: 46 }, cp2: { x: 46, y: 45.9 }, p1: { x: 35, y: 50.8 } },
  { p0: { x: 61, y: 53 }, cp1: { x: 55, y: 48.4 }, cp2: { x: 45, y: 48.2 }, p1: { x: 35, y: 52.8 } },
];

const ORAL_EXTERNAL_CURVES = [
  { p0: { x: 26, y: 56.2 }, cp1: { x: 21, y: 57 }, cp2: { x: 14, y: 59 }, p1: { x: 7, y: 62 } },
  { p0: { x: 26, y: 59.2 }, cp1: { x: 21, y: 60 }, cp2: { x: 14, y: 63 }, p1: { x: 8, y: 66 } },
  { p0: { x: 26, y: 53.2 }, cp1: { x: 21, y: 53.9 }, cp2: { x: 14, y: 55.8 }, p1: { x: 7, y: 57.8 } },
];

const NASAL_INTERNAL_CURVES = [
  { p0: { x: 64, y: 34 }, cp1: { x: 55, y: 27 }, cp2: { x: 42, y: 28 }, p1: { x: 30, y: 33.5 } },
  { p0: { x: 63, y: 36.5 }, cp1: { x: 54, y: 29 }, cp2: { x: 42, y: 30 }, p1: { x: 30, y: 36.5 } },
  { p0: { x: 62, y: 39 }, cp1: { x: 53, y: 31.5 }, cp2: { x: 41, y: 32.5 }, p1: { x: 30, y: 39.5 } },
];

const NASAL_EXTERNAL_CURVES = [
  { p0: { x: 28.5, y: 33 }, cp1: { x: 24, y: 35 }, cp2: { x: 20, y: 39 }, p1: { x: 17, y: 43 } },
  { p0: { x: 28.5, y: 35.5 }, cp1: { x: 24.5, y: 37.5 }, cp2: { x: 21, y: 41 }, p1: { x: 18, y: 45 } },
  { p0: { x: 28.5, y: 38 }, cp1: { x: 24.5, y: 40 }, cp2: { x: 21.5, y: 43.5 }, p1: { x: 19, y: 47 } },
];

const ORAL_INTERNAL_DELAYS = [0.2, 0.02, 0.48];
const NASAL_INTERNAL_DELAYS = [0.22, 0.04, 0.52];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cubicPoint(curve, t) {
  const mt = 1 - t;

  return {
    x:
      mt * mt * mt * curve.p0.x +
      3 * mt * mt * t * curve.cp1.x +
      3 * mt * t * t * curve.cp2.x +
      t * t * t * curve.p1.x,

    y:
      mt * mt * mt * curve.p0.y +
      3 * mt * mt * t * curve.cp1.y +
      3 * mt * t * t * curve.cp2.y +
      t * t * t * curve.p1.y,
  };
}

function cubicTangent(curve, t) {
  const mt = 1 - t;

  const tx =
    3 * mt * mt * (curve.cp1.x - curve.p0.x) +
    6 * mt * t * (curve.cp2.x - curve.cp1.x) +
    3 * t * t * (curve.p1.x - curve.cp2.x);

  const ty =
    3 * mt * mt * (curve.cp1.y - curve.p0.y) +
    6 * mt * t * (curve.cp2.y - curve.cp1.y) +
    3 * t * t * (curve.p1.y - curve.cp2.y);

  const len = Math.hypot(tx, ty) || 1;

  return {
    x: tx / len,
    y: ty / len,
  };
}

function curveToD(curve) {
  return `M ${curve.p0.x} ${curve.p0.y} C ${curve.cp1.x} ${curve.cp1.y}, ${curve.cp2.x} ${curve.cp2.y}, ${curve.p1.x} ${curve.p1.y}`;
}

function reverseCurve(curve) {
  return {
    p0: curve.p1,
    cp1: curve.cp2,
    cp2: curve.cp1,
    p1: curve.p0,
  };
}

function arrowPoints(curve, t, width) {
  const point = cubicPoint(curve, t);
  const tangent = cubicTangent(curve, t);
  const normal = {
    x: -tangent.y,
    y: tangent.x,
  };

  const size = width * 1.3;

  const tip = point;

  const base = {
    x: point.x - tangent.x * size * 1.25,
    y: point.y - tangent.y * size * 1.25,
  };

  const left = {
    x: base.x + normal.x * size * 0.55,
    y: base.y + normal.y * size * 0.55,
  };

  const right = {
    x: base.x - normal.x * size * 0.55,
    y: base.y - normal.y * size * 0.55,
  };

  return `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`;
}

function AirRibbon({
  curve,
  progress,
  width,
  opacity,
  clipPathId,
  turbulent = false,
  reverse = false,
}) {
  const cappedProgress = clamp(progress, 0, 1);
  const safeOpacity = clamp(opacity, 0, 1);

  const coreOpacity = safeOpacity * 0.85;
  const glowOpacity = safeOpacity * 0.22;

  const headTravel = cappedProgress * 100;

  const tailTravel =
    cappedProgress <= 0.5
      ? 0
      : ((cappedProgress - 0.5) / 0.5) * 52;

  const visibleTravel =
    headTravel - tailTravel;

  const dash =
    `${visibleTravel} 100`;

  const dashOffset =
    -tailTravel;

  const endT =
    clamp(cappedProgress, 0.06, 1);

  const baseCurve =
    reverse
      ? reverseCurve(curve)
      : curve;

  const wobble =
    turbulent
      ? Math.sin(cappedProgress * Math.PI * 10) * 0.3
      : 0;

  const animatedCurve = {
    ...baseCurve,

    cp1: {
      ...baseCurve.cp1,
      y: baseCurve.cp1.y + wobble,
    },

    cp2: {
      ...baseCurve.cp2,
      y: baseCurve.cp2.y - wobble,
    },
  };

  const d =
    curveToD(animatedCurve);

  if (
    visibleTravel < 2.5 ||
    safeOpacity < 0.01
  ) {
    return null;
  }

  return (
    <g
      clipPath={
        clipPathId
          ? `url(#${clipPathId})`
          : undefined
      }
    >
      <path
        d={d}
        pathLength="100"
        fill="none"
        stroke={CYAN}
        strokeOpacity={glowOpacity}
        strokeWidth={width + 3.5}
        strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset={dashOffset}
      />

      <path
        d={d}
        pathLength="100"
        fill="none"
        stroke={CYAN}
        strokeOpacity={coreOpacity}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset={dashOffset}
      />

      <path
        d={d}
        pathLength="100"
        fill="none"
        stroke={CYAN_SOFT}
        strokeOpacity={safeOpacity * 0.55}
        strokeWidth={Math.max(0.8, width * 0.18)}
        strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset={dashOffset}
      />

      {cappedProgress > 0.1 && (
        <polygon
          points={arrowPoints(
            animatedCurve,
            endT,
            width
          )}
          fill={CYAN_SOFT}
          fillOpacity={safeOpacity}
        />
      )}
    </g>
  );
}

export default function LiveSideAirflow({
  currentFrame = 0,
  timelineEntry = null,
  posMs = null,
  isPlaying = false,
  airflowMap = null,
}) {
  const oralClipId = useId();
  const nasalClipId = useId();

  const engineRef = useRef(null);

  const [airflowState, setAirflowState] =
    useState(AIRFLOW_IDLE);

  const [phase, setPhase] =
    useState(0);

  useEffect(() => {
    engineRef.current =
      new AirflowEngine(airflowMap);
  }, [airflowMap]);

  useEffect(() => {
    if (
      !isPlaying ||
      !engineRef.current
    ) {
      setAirflowState(AIRFLOW_IDLE);
      setPhase(0);
      return;
    }

    const entry =
      timelineEntry ?? {
        frame: currentFrame,
      };

    const nextState =
      engineRef.current.update(
        entry,
        performance.now(),
        posMs
      );

    const loopMs =
      Math.max(
        700,
        1400 -
          nextState.velocity * 520
      );

    const phaseValue =
      ((posMs ?? 0) % loopMs) /
      loopMs;

    setAirflowState(nextState);
    setPhase(phaseValue);
  }, [
    posMs,
    timelineEntry,
    currentFrame,
    isPlaying,
  ]);

  if (!isPlaying) {
    return null;
  }

  const widthScale =
    {
      narrow: 0.95,
      medium: 1.08,
      wide: 1.2,
    }[airflowState.width] ?? 1.08;

  const inhale =
    airflowState.exit === 'lungs' ||
    airflowState.origin === 'nose';

  const oralInside =
    clamp(
      Number(airflowState.oral) || 0,
      0,
      1
    );

  const oralOutside =
    airflowState.exit === 'mouth'
      ? oralInside
      : oralInside * 0.18;

  const nasalInside =
    clamp(
      Number(airflowState.nasal) || 0,
      0,
      1
    );

  const nasalOutside =
    airflowState.exit === 'nose' ||
    airflowState.split ||
    airflowState.pattern === 'breathing'
      ? nasalInside
      : nasalInside * 0.18;

  const grow = (delay = 0) =>
    clamp(
      (phase - delay) / 0.72,
      0,
      1
    );

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <defs>
        <clipPath id={oralClipId}>
          <path d={ORAL_CLIP} />
        </clipPath>

        <clipPath id={nasalClipId}>
          <path d={NASAL_CLIP} />
        </clipPath>
      </defs>

      {ORAL_INTERNAL_CURVES.map(
        (curve, index) => (
          <AirRibbon
            key={`oral-in-${index}`}
            curve={curve}
            progress={grow(
              ORAL_INTERNAL_DELAYS[index]
            )}
            width={2.2 * widthScale}
            opacity={0.52 * oralInside}
            clipPathId={oralClipId}
            turbulent={
              airflowState.turbulent
            }
            reverse={inhale}
          />
        )
      )}

      {NASAL_INTERNAL_CURVES.map(
        (curve, index) => (
          <AirRibbon
            key={`nasal-in-${index}`}
            curve={curve}
            progress={grow(
              NASAL_INTERNAL_DELAYS[index]
            )}
            width={2.2 * widthScale}
            opacity={0.5 * nasalInside}
            clipPathId={nasalClipId}
            reverse={inhale}
          />
        )
      )}

      {ORAL_EXTERNAL_CURVES.map(
        (curve, index) => (
          <AirRibbon
            key={`oral-out-${index}`}
            curve={curve}
            progress={grow(
              0.18 + index * 0.08
            )}
            width={2.5 * widthScale}
            opacity={0.46 * oralOutside}
            turbulent={
              airflowState.turbulent
            }
            reverse={inhale}
          />
        )
      )}

      {NASAL_EXTERNAL_CURVES.map(
        (curve, index) => (
          <AirRibbon
            key={`nasal-out-${index}`}
            curve={curve}
            progress={grow(
              0.22 + index * 0.08
            )}
            width={2.1 * widthScale}
            opacity={0.42 * nasalOutside}
            reverse={inhale}
          />
        )
      )}
    </svg>
  );
}