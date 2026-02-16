/**
 * AIRFLOW ANIMATION - With Arrowheads and Refined Positioning
 * 
 * Changes:
 * - Arrowheads on all ribbons showing flow direction
 * - Nostril exit ribbons: Randomized start positions, further left when inhaling
 * - Lip exit ribbons: Lowered to align with lip center
 * - Nasal cavity ribbons: Keep as is (correctly positioned)
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';

// =============================================================================
// PHONEME CLASSIFICATION
// =============================================================================

const PHONEME_CLASSES = {
  'a': { class: 'vowel', height: 'open' },
  'ah': { class: 'vowel', height: 'open' },
  'e': { class: 'vowel', height: 'mid' },
  'eh': { class: 'vowel', height: 'mid' },
  'i': { class: 'vowel', height: 'close' },
  'ee': { class: 'vowel', height: 'close' },
  'o': { class: 'vowel', height: 'mid' },
  'oh': { class: 'vowel', height: 'mid' },
  'u': { class: 'vowel', height: 'close' },
  'oo': { class: 'vowel', height: 'close' },
  'uh': { class: 'vowel', height: 'mid' },
  'ɪ': { class: 'vowel', height: 'close' },
  'ɛ': { class: 'vowel', height: 'mid' },
  'æ': { class: 'vowel', height: 'open' },
  'ə': { class: 'vowel', height: 'mid' },
  'ʌ': { class: 'vowel', height: 'mid' },
  'ʊ': { class: 'vowel', height: 'close' },
  'ɔ': { class: 'vowel', height: 'mid' },
  'ɑ': { class: 'vowel', height: 'open' },
  'p': { class: 'plosive', voiced: false },
  'b': { class: 'plosive', voiced: true },
  't': { class: 'plosive', voiced: false },
  'd': { class: 'plosive', voiced: true },
  'k': { class: 'plosive', voiced: false },
  'g': { class: 'plosive', voiced: true },
  'f': { class: 'fricative', voiced: false },
  'v': { class: 'fricative', voiced: true },
  's': { class: 'fricative', voiced: false },
  'z': { class: 'fricative', voiced: true },
  'sh': { class: 'fricative', voiced: false },
  'ʃ': { class: 'fricative', voiced: false },
  'ʒ': { class: 'fricative', voiced: true },
  'th': { class: 'fricative', voiced: false },
  'θ': { class: 'fricative', voiced: false },
  'ð': { class: 'fricative', voiced: true },
  'h': { class: 'fricative', voiced: false },
  'm': { class: 'nasal' },
  'n': { class: 'nasal' },
  'ng': { class: 'nasal' },
  'ŋ': { class: 'nasal' },
  'l': { class: 'approximant' },
  'r': { class: 'approximant' },
  'w': { class: 'approximant' },
  'y': { class: 'approximant' },
  'j': { class: 'approximant' },
  'ch': { class: 'affricate', voiced: false },
  'tʃ': { class: 'affricate', voiced: false },
  'dʒ': { class: 'affricate', voiced: true },
};

function getAirflowConfig(phonemeSymbol, isRelease = false) {
  const info = PHONEME_CLASSES[phonemeSymbol?.toLowerCase()] || PHONEME_CLASSES[phonemeSymbol];
  if (!info) return { oral: 0.3, nasal: 0, turbulent: false, burst: false };
  
  switch (info.class) {
    case 'vowel':
      const vowelIntensity = { 'close': 0.4, 'mid': 0.6, 'open': 0.9 }[info.height] || 0.6;
      return { oral: vowelIntensity, nasal: 0, turbulent: false, burst: false };
    case 'plosive':
      if (isRelease) return { oral: info.voiced ? 0.5 : 0.8, nasal: 0, turbulent: !info.voiced, burst: true };
      return { oral: 0, nasal: 0, turbulent: false, burst: false };
    case 'fricative':
      return { oral: info.voiced ? 0.6 : 0.9, nasal: 0, turbulent: true, burst: false };
    case 'nasal':
      return { oral: 0, nasal: 0.85, turbulent: false, burst: false };
    case 'approximant':
      return { oral: 0.35, nasal: 0, turbulent: false, burst: false };
    case 'affricate':
      return { oral: info.voiced ? 0.6 : 0.8, nasal: 0, turbulent: true, burst: isRelease };
    default:
      return { oral: 0.3, nasal: 0, turbulent: false, burst: false };
  }
}

// =============================================================================
// HELPER: Draw arrowhead at end of ribbon
// =============================================================================

function drawArrowhead(ctx, x, y, angle, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.fillStyle = color;
  // Larger, more visible arrowhead
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 1.5, -size * 0.7);
  ctx.lineTo(-size * 1.5, size * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// =============================================================================
// DRAWING FUNCTIONS
// =============================================================================

/**
 * Draw oral airflow with arrowheads
 * - Mouth cavity ribbons: deep inside, staggered
 * - Lip exit ribbons: LOWERED to align with lip center, with arrows
 */
function drawOralAirflow(ctx, width, height, intensity, turbulent, phase) {
  if (intensity <= 0) return;
  
  const opacity = 0.75 + intensity * 0.2;
  
  // === MOUTH CAVITY INTERIOR - 4 ribbons with arrows ===
  const cavityStartX = width * 0.55;
  const cavityEndX = width * 0.32;
  const cavityY = height * 0.48;
  const cavitySpread = height * 0.028;
  const lengthMultipliers = [0.6, 0.8, 1.0, 0.75];
  
  for (let i = 0; i < 4; i++) {
    const yOffset = (i - 1.5) * cavitySpread;
    const ribbonPhase = (phase + i * 0.12) % 1;
    const lineY = cavityY + yOffset;
    const lengthMult = lengthMultipliers[i];
    const ribbonOpacity = opacity * (1 - ribbonPhase * 0.15);
    const color = `rgba(0, 210, 255, ${ribbonOpacity})`;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const waveAmp = turbulent ? 3 : 2;
    const baseLength = (cavityStartX - cavityEndX) * lengthMult;
    const startX = cavityStartX - (1 - lengthMult) * 20;
    const endX = startX - baseLength * (0.5 + ribbonPhase * 0.5);
    
    let lastX = startX, lastY = lineY;
    ctx.moveTo(startX, lineY);
    
    const steps = 15;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const x = startX + (endX - startX) * t;
      const wave = Math.sin((t * 3 + ribbonPhase * 2) * Math.PI) * waveAmp;
      ctx.lineTo(x, lineY + wave);
      lastX = x;
      lastY = lineY + wave;
    }
    ctx.stroke();
    
    // Arrowhead pointing LEFT (flow direction)
    drawArrowhead(ctx, lastX, lastY, Math.PI, 6, color);
  }
  
  // === LIP EXIT - 3 ribbons with arrows (reduced from 5) ===
  const lipExitStartX = width * 0.12;
  const lipExitY = height * 0.56;  // Aligned with lip center
  const lipSpread = height * 0.028;  // Increased spread for 3 ribbons
  const exitLengths = [45, 55, 40];  // 3 ribbons
  
  for (let i = 0; i < 3; i++) {
    const yOffset = (i - 1) * lipSpread;  // Center around middle ribbon
    const ribbonPhase = (phase + i * 0.1) % 1;
    const maxLen = exitLengths[i] + intensity * 20;
    const currentLen = maxLen * (0.5 + ribbonPhase * 0.5);
    const fadeOpacity = opacity * (1 - ribbonPhase * 0.25);
    const color = `rgba(0, 210, 255, ${fadeOpacity})`;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 * (1 - ribbonPhase * 0.15);
    ctx.lineCap = 'round';
    
    const startY = lipExitY + yOffset;
    const endX = lipExitStartX - currentLen;
    const wave = turbulent ? Math.sin(ribbonPhase * Math.PI * 3) * 2 : 0;
    const endY = startY + wave * 0.5;
    
    ctx.moveTo(lipExitStartX, startY);
    ctx.quadraticCurveTo(
      lipExitStartX - currentLen * 0.5, 
      startY + wave, 
      endX, 
      endY
    );
    ctx.stroke();
    
    // Arrowhead pointing LEFT
    drawArrowhead(ctx, endX, endY, Math.PI, 6, color);
  }
}

/**
 * Draw nasal airflow with arrowheads
 * - Nasal cavity ribbons: Keep current position (good)
 * - Nostril exit ribbons: RANDOMIZED start positions, further LEFT when inhaling
 */
function drawNasalAirflow(ctx, width, height, intensity, phase, isInhale = false) {
  if (intensity <= 0) return;
  
  const opacity = 0.75 + intensity * 0.2;
  const dir = isInhale ? 1 : -1;
  
  // === NASAL CAVITY INTERIOR - 4 ribbons with arrows (keep position) ===
  const nasalStartX = width * 0.52;
  const nasalEndX = width * 0.28;
  const nasalY = height * 0.24;
  const nasalSpread = height * 0.025;
  const lengthMultipliers = [0.7, 1.0, 0.85, 0.6];
  
  for (let i = 0; i < 4; i++) {
    const yOffset = (i - 1.5) * nasalSpread;
    const ribbonPhase = (phase + i * 0.15) % 1;
    const lineY = nasalY + yOffset;
    const lengthMult = lengthMultipliers[i];
    const ribbonOpacity = opacity * (1 - ribbonPhase * 0.15);
    const color = `rgba(0, 210, 255, ${ribbonOpacity})`;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const waveAmp = 2.5;
    const baseLength = (nasalStartX - nasalEndX) * lengthMult;
    const animOffset = isInhale ? ribbonPhase * 15 : -ribbonPhase * 15;
    const startX = nasalStartX + animOffset - (1 - lengthMult) * 15;
    const endX = startX - baseLength * (0.5 + ribbonPhase * 0.5);
    
    let lastX = startX, lastY = lineY;
    ctx.moveTo(startX, lineY);
    
    const steps = 12;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const x = startX + (endX - startX) * t;
      const wave = Math.sin((t * 2.5 + ribbonPhase * 2) * Math.PI) * waveAmp;
      ctx.lineTo(x, lineY + wave);
      lastX = x;
      lastY = lineY + wave;
    }
    ctx.stroke();
    
    // Arrowhead direction based on inhale/exhale
    const arrowAngle = isInhale ? 0 : Math.PI;  // Right for inhale, Left for exhale
    drawArrowhead(ctx, isInhale ? startX : lastX, isInhale ? lineY : lastY, arrowAngle, 6, color);
  }
  
  // === NOSTRIL EXIT - 5 ribbons, positioned lower/right to avoid nose tip ===
  // Randomized offsets for natural look
  const randomXOffsets = [3, 8, 5, 10, 6];   // All positive = more to the right
  const randomYOffsets = [2, -2, 4, 0, 3];   // Varied Y positions
  
  // Position: Lower (closer to top lip) and more to the right
  // Same position for inhale and exhale - just direction changes
  const nostrilBaseX = width * 0.12;  // More to the right, away from nose tip
  const nostrilExitY = height * 0.44;  // Lower, closer to top lip
  const nostrilSpread = height * 0.016;
  const nostrilExitLengths = [35, 50, 40, 55, 30];
  
  for (let i = 0; i < 5; i++) {
    // Apply random offsets for natural look
    const xOffset = randomXOffsets[i];
    const yRandom = randomYOffsets[i];
    const yOffset = (i - 2) * nostrilSpread + yRandom;
    
    const ribbonPhase = (phase + i * 0.12) % 1;
    const maxLen = nostrilExitLengths[i] + intensity * 15;
    const currentLen = maxLen * (0.5 + ribbonPhase * 0.5);
    const fadeOpacity = opacity * (1 - ribbonPhase * 0.25);
    const color = `rgba(0, 210, 255, ${fadeOpacity})`;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 * (1 - ribbonPhase * 0.15);
    ctx.lineCap = 'round';
    
    const startX = nostrilBaseX + xOffset;
    const startY = nostrilExitY + yOffset;
    
    // Angle varies per ribbon for natural look
    const angleVariation = (i - 2) * 0.1;
    const endX = startX + dir * currentLen * (0.5 + angleVariation);
    const endY = startY - dir * currentLen * (0.7 - Math.abs(angleVariation) * 0.2);
    
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + dir * currentLen * 0.25,
      startY - dir * currentLen * 0.3,
      endX, endY
    );
    ctx.stroke();
    
    // Arrowhead at leading edge
    const arrowAngle = Math.atan2(endY - startY, endX - startX);
    drawArrowhead(ctx, endX, endY, arrowAngle, 6, color);
  }
}

/**
 * Draw burst effect for plosives
 */
function drawBurst(ctx, x, y, intensity, phase) {
  if (phase > 0.35) return;
  const burstPhase = phase / 0.35;
  const radius = 8 + burstPhase * 25 * intensity;
  const opacity = (1 - burstPhase) * 0.5 * intensity;
  
  ctx.beginPath();
  ctx.strokeStyle = `rgba(0, 210, 255, ${opacity})`;
  ctx.lineWidth = 2;
  ctx.arc(x, y, radius, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
}

/**
 * Draw idle breathing
 */
function drawIdleBreathing(ctx, width, height, breathPhase) {
  const isInhale = breathPhase < 0.5;
  const cyclePhase = isInhale ? breathPhase * 2 : (breathPhase - 0.5) * 2;
  const intensity = Math.sin(cyclePhase * Math.PI) * 0.6 + 0.25;
  
  drawNasalAirflow(ctx, width, height, intensity, cyclePhase, isInhale);
}

// =============================================================================
// REACT COMPONENT
// =============================================================================

const AirflowAnimation = ({
  currentFrame = 0,
  phonemeSymbol = null,
  isPlaying = false,
  isLastFrameOfPhoneme = false,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const phaseRef = useRef(0);
  const breathTimeRef = useRef(Date.now());
  const wasPlayingRef = useRef(false);  // Track previous playing state
  const pauseUntilRef = useRef(0);  // Time when pause ends (3 sec pause after speech)
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  
  // Reset breath cycle to start with INHALE after 3-second pause when transitioning from speaking to idle
  useEffect(() => {
    if (wasPlayingRef.current && !isPlaying) {
      // Just finished speaking - set 3 second pause before breathing starts
      pauseUntilRef.current = Date.now() + 3000;
      // After pause ends, breath timer will start from 0 (inhale)
      breathTimeRef.current = Date.now() + 3000;
    }
    wasPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
      }
    };
    
    const timeoutId = setTimeout(updateDimensions, 100);
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);
  
  const { width, height } = dimensions;
  
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    
    phaseRef.current = (phaseRef.current + 0.02) % 1;
    const phase = phaseRef.current;
    
    // Check if we're in the 3-second pause period after speech
    const now = Date.now();
    const isPaused = now < pauseUntilRef.current;
    
    // Breath cycle: 3 seconds inhale + 3 seconds exhale = 6 seconds total
    const elapsed = (now - breathTimeRef.current) / 1000;
    const breathPhase = (elapsed % 6) / 6;  // 6 second cycle
    
    const isAtRest = currentFrame === 0 && !isPlaying;
    
    if (isAtRest) {
      // During pause: don't draw breathing, just wait
      if (!isPaused) {
        drawIdleBreathing(ctx, width, height, breathPhase);
      }
    } else if (isPlaying && phonemeSymbol) {
      const isRelease = isLastFrameOfPhoneme;
      const airflow = getAirflowConfig(phonemeSymbol, isRelease);
      
      if (airflow.oral > 0) {
        drawOralAirflow(ctx, width, height, airflow.oral, airflow.turbulent, phase);
      }
      
      if (airflow.nasal > 0) {
        drawNasalAirflow(ctx, width, height, airflow.nasal, phase, false);
      }
      
      if (airflow.burst) {
        drawBurst(ctx, width * 0.10, height * 0.56, airflow.oral, phase);
      }
    } else if (isPlaying && !phonemeSymbol) {
      drawNasalAirflow(ctx, width, height, 0.3, phase, false);
    } else if (!isPlaying) {
      // Not playing - show idle breathing (unless paused)
      if (!isPaused) {
        drawIdleBreathing(ctx, width, height, breathPhase);
      }
    }
    
    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, [width, height, currentFrame, isPlaying, phonemeSymbol, isLastFrameOfPhoneme]);
  
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [renderFrame]);
  
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 50, width: '100%', height: '100%' }}
      data-testid="airflow-animation-container"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        data-testid="airflow-animation-canvas"
      />
    </div>
  );
};

export default AirflowAnimation;
