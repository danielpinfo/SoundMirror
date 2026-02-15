/**
 * AIRFLOW OVERLAY - Phoneme-Driven Airflow Visualization
 * 
 * Contract (NON-NEGOTIABLE):
 *   "Airflow visualization is a direct function of phoneme articulation,
 *    synchronized to sprite frames, independent of language, spelling, or word meaning."
 * 
 * Renders on a canvas overlaid on the side-view head sprite.
 * Three channels: oral (mouth), nasal (nose), breath (idle).
 * Driven by phoneme class from ARTICULATORY_FEATURES.
 */

import React, { useRef, useEffect, useCallback } from 'react';

// =============================================================================
// PHONEME → AIRFLOW MAPPING
// =============================================================================

/**
 * Get airflow configuration for a phoneme based on its articulatory features.
 * Returns { oral, nasal, turbulent, burst } intensities (0-1).
 */
function getAirflowForPhoneme(symbol, features) {
  if (!features) {
    // Unknown phoneme fallback: oral low
    return { oral: 0.2, nasal: 0, turbulent: false, burst: false };
  }

  const { type, manner, voicing, nasal, height } = features;

  // === NASALS: mandatory nasal flow, no/minimal oral ===
  if (nasal || manner === 'nasal') {
    return { oral: 0.05, nasal: 0.8, turbulent: false, burst: false };
  }

  // === VOWELS: oral continuous, scaled by openness ===
  if (type === 'vowel') {
    const intensityMap = {
      'close': 0.3,       // /i u/
      'near-close': 0.35,
      'close-mid': 0.5,   // /e o/
      'mid': 0.5,
      'open-mid': 0.65,
      'near-open': 0.7,
      'open': 0.85,       // /a/
    };
    const intensity = intensityMap[height] || 0.5;
    return { oral: intensity, nasal: 0, turbulent: false, burst: false };
  }

  // === PLOSIVES (STOPS): burst on release ===
  if (manner === 'plosive') {
    return {
      oral: voicing ? 0.4 : 0.6,
      nasal: 0,
      turbulent: !voicing,
      burst: true,
    };
  }

  // === FRICATIVES: sustained high oral ===
  if (manner === 'fricative') {
    return {
      oral: voicing ? 0.6 : 0.8,
      nasal: 0,
      turbulent: true,
      burst: false,
    };
  }

  // === AFFRICATES: burst + sustained ===
  if (manner === 'affricate') {
    return {
      oral: voicing ? 0.5 : 0.7,
      nasal: 0,
      turbulent: true,
      burst: true,
    };
  }

  // === LATERALS & APPROXIMANTS: low oral ===
  if (manner === 'lateral' || manner === 'approximant') {
    return { oral: 0.25, nasal: 0, turbulent: false, burst: false };
  }

  // Default fallback: low oral
  return { oral: 0.2, nasal: 0, turbulent: false, burst: false };
}

// =============================================================================
// AIRFLOW RENDERER (Canvas-based)
// =============================================================================

/**
 * Draw a smooth airflow ribbon using bezier curves.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} startX - Start X position
 * @param {number} startY - Start Y position  
 * @param {number} intensity - Flow intensity 0-1
 * @param {boolean} turbulent - Add visual jitter
 * @param {number} phase - Animation phase (0-1 cycling)
 * @param {string} direction - 'out' or 'in' for flow direction
 * @param {boolean} isNasal - Whether this is nasal flow
 */
function drawAirflowRibbon(ctx, startX, startY, intensity, turbulent, phase, direction, isNasal) {
  if (intensity <= 0.02) return;

  const ribbonCount = Math.max(2, Math.floor(intensity * 4));
  const maxLength = 40 + intensity * 60;
  const baseWidth = 2 + intensity * 4;
  const dirMul = direction === 'out' ? 1 : -1;

  for (let r = 0; r < ribbonCount; r++) {
    const spread = (r - (ribbonCount - 1) / 2) * (5 + intensity * 8);
    const ribbonPhase = (phase + r * 0.2) % 1;

    ctx.beginPath();
    // More visible colors with higher opacity
    ctx.strokeStyle = isNasal
      ? `rgba(50, 180, 255, ${0.5 + intensity * 0.4})`
      : `rgba(30, 160, 255, ${0.45 + intensity * 0.45})`;
    ctx.lineWidth = baseWidth * (1 - ribbonPhase * 0.3);
    ctx.lineCap = 'round';

    const sx = startX;
    const sy = startY + spread;

    // Bezier control points for smooth ribbon
    let jitterY = 0;
    if (turbulent) {
      jitterY = Math.sin(phase * Math.PI * 6 + r * 2) * (4 + intensity * 6);
    }

    const endX = sx + dirMul * maxLength * (0.5 + ribbonPhase * 0.5);
    const cpX1 = sx + dirMul * maxLength * 0.3;
    const cpY1 = sy + jitterY * 0.5;
    const cpX2 = sx + dirMul * maxLength * 0.6;
    const cpY2 = sy + jitterY;

    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, endX, sy + jitterY * 0.3 + spread * 0.3);
    ctx.stroke();

    // Particle dots along the ribbon for visual richness
    if (intensity > 0.25) {
      const particleCount = Math.floor(intensity * 5);
      for (let p = 0; p < particleCount; p++) {
        const t = (ribbonPhase + p * 0.15) % 1;
        const px = sx + dirMul * maxLength * t;
        const py = sy + Math.sin(t * Math.PI * 3 + phase * 4) * jitterY * 0.5;
        const particleSize = (1 - t) * (1.5 + intensity * 1.5);

        ctx.beginPath();
        ctx.fillStyle = isNasal
          ? `rgba(80, 200, 255, ${(1 - t) * 0.6})`
          : `rgba(60, 180, 255, ${(1 - t) * 0.55})`;
        ctx.arc(px, py, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Draw a burst effect for plosives.
 */
function drawBurstEffect(ctx, x, y, intensity, phase) {
  if (phase > 0.4) return; // Burst is short-lived

  const burstPhase = phase / 0.4; // Normalize to 0-1 within burst window
  const radius = 5 + burstPhase * 25 * intensity;
  const opacity = (1 - burstPhase) * 0.4 * intensity;

  ctx.beginPath();
  ctx.strokeStyle = `rgba(150, 220, 255, ${opacity})`;
  ctx.lineWidth = 1.5;
  ctx.arc(x + 10, y, radius, -Math.PI * 0.3, Math.PI * 0.3);
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.strokeStyle = `rgba(180, 240, 255, ${opacity * 0.6})`;
  ctx.lineWidth = 1;
  ctx.arc(x + 8, y, radius * 0.6, -Math.PI * 0.25, Math.PI * 0.25);
  ctx.stroke();
}

/**
 * Draw breathing animation during neutral frames.
 * @param {string} breathPhase - 'inhale' or 'exhale'
 */
function drawBreathing(ctx, noseX, noseY, phase, breathPhase) {
  const isInhale = breathPhase === 'inhale';
  const dirMul = isInhale ? -1 : 1;
  const intensity = 0.15 + Math.sin(phase * Math.PI) * 0.1;

  // Gentle nasal ribbons
  for (let r = 0; r < 2; r++) {
    const spread = (r - 0.5) * 4;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(100, 190, 255, ${intensity})`;
    ctx.lineWidth = 0.8;
    ctx.lineCap = 'round';

    const sx = noseX;
    const sy = noseY + spread;
    const len = 15 + phase * 10;

    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + dirMul * len * 0.5,
      sy - 2 + Math.sin(phase * Math.PI * 2) * 2,
      sx + dirMul * len,
      sy - 3
    );
    ctx.stroke();
  }
}

// =============================================================================
// REACT COMPONENT
// =============================================================================

const AirflowOverlay = ({
  currentFrame = 0,
  phonemeSymbol = null,
  phonemeFeatures = null,
  isPlaying = false,
  isNeutral = false,
  animationPhase = 'idle', // 'start', 'playing', 'end', 'idle'
  enabled = true,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const phaseRef = useRef(0);
  const breathCycleRef = useRef(0);
  const [dimensions, setDimensions] = React.useState({ width: 300, height: 300 });

  // Observe container size changes and update canvas dimensions
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    // Initial measurement
    updateDimensions();

    // Use ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;

  // Mouth and nose positions relative to side-view sprite (approximate)
  // Adjusted for the scaled sprite (1.125x) - positions tuned for visual accuracy
  const mouthPos = { x: width * 0.22, y: height * 0.58 };
  const nosePos = { x: width * 0.24, y: height * 0.38 };

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!enabled) return;

    // Update animation phase
    phaseRef.current = (phaseRef.current + 0.02) % 1;
    const phase = phaseRef.current;

    if (isNeutral || (!isPlaying && animationPhase === 'idle')) {
      // === BREATHING MODE ===
      breathCycleRef.current = (breathCycleRef.current + 0.008) % 1;
      const bc = breathCycleRef.current;

      if (animationPhase === 'start' || bc < 0.4) {
        // Inhale at start
        drawBreathing(ctx, nosePos.x, nosePos.y, bc < 0.4 ? bc / 0.4 : bc, 'inhale');
      } else if (animationPhase === 'end' || bc >= 0.6) {
        // Exhale at end
        drawBreathing(ctx, nosePos.x, nosePos.y, bc >= 0.6 ? (bc - 0.6) / 0.4 : bc, 'exhale');
      }
    } else if (isPlaying) {
      // === PHONEME-DRIVEN AIRFLOW ===
      const airflow = getAirflowForPhoneme(phonemeSymbol, phonemeFeatures);

      // Oral airflow
      if (airflow.oral > 0.02) {
        drawAirflowRibbon(
          ctx, mouthPos.x, mouthPos.y,
          airflow.oral, airflow.turbulent,
          phase, 'out', false
        );
      }

      // Nasal airflow
      if (airflow.nasal > 0.02) {
        drawAirflowRibbon(
          ctx, nosePos.x, nosePos.y,
          airflow.nasal, false,
          phase, 'out', true
        );
      }

      // Burst effect for plosives
      if (airflow.burst) {
        drawBurstEffect(ctx, mouthPos.x, mouthPos.y, airflow.oral, phase);
      }
    }

    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, [width, height, enabled, isPlaying, isNeutral, phonemeSymbol, phonemeFeatures, animationPhase, mouthPos.x, mouthPos.y, nosePos.x, nosePos.y]);

  useEffect(() => {
    if (enabled && (isPlaying || isNeutral || animationPhase !== 'idle')) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [enabled, isPlaying, isNeutral, animationPhase, renderFrame]);

  if (!enabled) return null;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
      data-testid="airflow-overlay-container"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
        data-testid="airflow-overlay-canvas"
      />
    </div>
  );
};

AirflowOverlay.displayName = 'AirflowOverlay';

export default AirflowOverlay;
