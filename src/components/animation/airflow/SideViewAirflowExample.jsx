import React, { useEffect, useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';

const CYAN = '#27c7cf';
const CYAN_SOFT = '#74e4e8';

const PATTERNS = {
  oral: { label: 'Oral flow', oralInside: 1, oralOutside: 1, nasalInside: 0.08, nasalOutside: 0 },
  nasal: { label: 'Nasal flow', oralInside: 0.25, oralOutside: 0.12, nasalInside: 1, nasalOutside: 1 },
  split: { label: 'Split flow', oralInside: 0.85, oralOutside: 0.7, nasalInside: 0.9, nasalOutside: 0.9 },
  fricative: { label: 'Fricative', oralInside: 1, oralOutside: 1, nasalInside: 0.05, nasalOutside: 0, turbulent: true },
};

const ORAL_CLIP = 'M 34 47 C 44 42.5 57 42.5 65 46.5 L 65 61 C 59 66 46 67 36 64 C 33 61.5 32 52 34 47 Z';
const NASAL_CLIP = 'M 29 27 C 39 23 58 24 67 30 L 66 40 C 57 45 40 45 31 41 C 27 38 26 31 29 27 Z';
const PHARYNX_CLIP = 'M 58 28 C 64 29 70 35 71 45 L 69 73 C 64 76 58 73 56 66 L 56 35 C 56 31 57 29 58 28 Z';

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

const ORAL_INTERNAL_DELAYS = [0.2, 0.02, 0.48];
const NASAL_INTERNAL_DELAYS = [0.22, 0.04, 0.52];

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

const SPLIT_CURVES = [
  { p0: { x: 60, y: 51 }, cp1: { x: 56, y: 46 }, cp2: { x: 50, y: 41 }, p1: { x: 43, y: 38 } },
  { p0: { x: 57, y: 54 }, cp1: { x: 54, y: 49 }, cp2: { x: 49, y: 44 }, p1: { x: 44, y: 41 } },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cubicPoint(curve, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * curve.p0.x + 3 * mt * mt * t * curve.cp1.x + 3 * mt * t * t * curve.cp2.x + t * t * t * curve.p1.x,
    y: mt * mt * mt * curve.p0.y + 3 * mt * mt * t * curve.cp1.y + 3 * mt * t * t * curve.cp2.y + t * t * t * curve.p1.y,
  };
}

function cubicTangent(curve, t) {
  const mt = 1 - t;
  const tx = 3 * mt * mt * (curve.cp1.x - curve.p0.x) + 6 * mt * t * (curve.cp2.x - curve.cp1.x) + 3 * t * t * (curve.p1.x - curve.cp2.x);
  const ty = 3 * mt * mt * (curve.cp1.y - curve.p0.y) + 6 * mt * t * (curve.cp2.y - curve.cp1.y) + 3 * t * t * (curve.p1.y - curve.cp2.y);
  const len = Math.hypot(tx, ty) || 1;
  return { x: tx / len, y: ty / len };
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
  const normal = { x: -tangent.y, y: tangent.x };
  const size = width * 1.3;
  const tip = point;
  const base = { x: point.x - tangent.x * size * 1.25, y: point.y - tangent.y * size * 1.25 };
  const left = { x: base.x + normal.x * size * 0.55, y: base.y + normal.y * size * 0.55 };
  const right = { x: base.x - normal.x * size * 0.55, y: base.y - normal.y * size * 0.55 };
  return `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`;
}

function AirRibbon({ curve, progress, width, opacity, clipPathId, turbulent = false, reverse = false }) {
  const cappedProgress = clamp(progress, 0, 1);
  const coreOpacity = opacity * 0.58;
  const glowOpacity = opacity * 0.12;
  const headTravel = cappedProgress * 100;
  const tailTravel = cappedProgress <= 0.5 ? 0 : ((cappedProgress - 0.5) / 0.5) * 52;
  const visibleTravel = headTravel - tailTravel;
  const dash = `${visibleTravel} 100`;
  const dashOffset = -tailTravel;
  const endT = clamp(cappedProgress, 0.06, 1);
  const baseCurve = reverse ? reverseCurve(curve) : curve;
  const wobble = turbulent ? Math.sin(cappedProgress * Math.PI * 10) * 0.3 : 0;
  const animatedCurve = {
    ...baseCurve,
    cp1: { ...baseCurve.cp1, y: baseCurve.cp1.y + wobble },
    cp2: { ...baseCurve.cp2, y: baseCurve.cp2.y - wobble },
  };
  const d = curveToD(animatedCurve);

  if (visibleTravel < 2.5) {
    return null;
  }

  return (
    <g clipPath={clipPathId ? `url(#${clipPathId})` : undefined}>
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
        strokeOpacity={opacity * 0.55}
        strokeWidth={Math.max(0.8, width * 0.18)}
        strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset={dashOffset}
      />
      {cappedProgress > 0.1 && (
        <polygon
          points={arrowPoints(animatedCurve, endT, width)}
          fill={CYAN_SOFT}
          fillOpacity={opacity}
        />
      )}
    </g>
  );
}

export default function SideViewAirflowExample({ frameUrls = [] }) {
  const [patternKey, setPatternKey] = useState('split');
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0.75);
  const [frameIndex, setFrameIndex] = useState(1);
  const oralClipId = useId();
  const nasalClipId = useId();
  const pharynxClipId = useId();

  const availableFrames = useMemo(
    () => frameUrls.map((url, index) => ({ url, index })).filter((item) => Boolean(item.url)),
    [frameUrls]
  );

  const safeFrameIndex = availableFrames.some((item) => item.index === frameIndex)
    ? frameIndex
    : availableFrames[0]?.index ?? 0;

  const imageUrl = frameUrls[safeFrameIndex] || availableFrames[0]?.url || '';
  const pattern = PATTERNS[patternKey];

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let start = 0;

    const tick = (ts) => {
      if (!start) start = ts;
      const loop = 1350;
      setPhase(((ts - start) % loop) / loop);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const grow = (delay = 0) => clamp((phase - delay) / 0.72, 0, 1);

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="rounded-xl border p-5 space-y-4" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(0,188,212,0.3)' }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-cyan-300 font-bold text-lg">Side View Airflow Example</h2>
          <p className="text-sm text-cyan-100/70">Thick growing ribbons with arrow tips, clipped to the mouth and nasal cavities only.</p>
        </div>
        <Button
          onClick={() => setPlaying((value) => !value)}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
        >
          {playing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {playing ? 'Pause flow' : 'Play flow'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(PATTERNS).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setPatternKey(key)}
            className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: key === patternKey ? CYAN : 'rgba(255,255,255,0.06)',
              color: key === patternKey ? '#08263f' : '#d5fbff',
              border: `1px solid ${key === patternKey ? CYAN : 'rgba(0,188,212,0.35)'}`,
            }}
          >
            {value.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-cyan-100/75">
          <span>Side frame</span>
          <span>{safeFrameIndex}</span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(frameUrls.length - 1, 0)}
          value={safeFrameIndex}
          onChange={(e) => setFrameIndex(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
      </div>

      <div className="relative mx-auto w-full max-w-[540px] aspect-square rounded-xl overflow-hidden border border-cyan-500/25 bg-white">
        <img src={imageUrl} alt="Side articulation frame" className="absolute inset-0 w-full h-full object-contain" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <clipPath id={oralClipId}><path d={ORAL_CLIP} /></clipPath>
            <clipPath id={nasalClipId}><path d={NASAL_CLIP} /></clipPath>
            <clipPath id={pharynxClipId}><path d={PHARYNX_CLIP} /></clipPath>
          </defs>

          {ORAL_INTERNAL_CURVES.map((curve, index) => (
            <AirRibbon
              key={`oral-in-${index}`}
              curve={curve}
              progress={grow(ORAL_INTERNAL_DELAYS[index])}
              width={2}
              opacity={0.46 * pattern.oralInside}
              clipPathId={oralClipId}
              turbulent={pattern.turbulent}
              reverse
            />
          ))}

          {NASAL_INTERNAL_CURVES.map((curve, index) => (
            <AirRibbon
              key={`nasal-in-${index}`}
              curve={curve}
              progress={grow(NASAL_INTERNAL_DELAYS[index])}
              width={2.1}
              opacity={0.45 * pattern.nasalInside}
              clipPathId={nasalClipId}
              reverse
            />
          ))}

          {ORAL_EXTERNAL_CURVES.map((curve, index) => (
            <AirRibbon
              key={`oral-out-${index}`}
              curve={curve}
              progress={grow(0.18 + index * 0.08)}
              width={2.5}
              opacity={0.42 * pattern.oralOutside}
              turbulent={pattern.turbulent}
              reverse
            />
          ))}

          {NASAL_EXTERNAL_CURVES.map((curve, index) => (
            <AirRibbon
              key={`nasal-out-${index}`}
              curve={curve}
              progress={grow(0.22 + index * 0.08)}
              width={2.1}
              opacity={0.38 * pattern.nasalOutside}
              reverse
            />
          ))}
        </svg>
      </div>
    </div>
  );
}