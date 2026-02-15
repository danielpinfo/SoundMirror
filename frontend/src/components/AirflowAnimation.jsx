/**
 * AIRFLOW ANIMATION - Positioned to Avoid Anatomy Overlap
 * 
 * NASAL CAVITY INTERIOR:
 * - 4 ribbons positioned UP and BACK (right) in nasal cavity
 * - Staggered lengths to show air direction
 * - No overlap with non-nasal head structure
 * 
 * NOSTRIL EXIT:
 * - 5 ribbons positioned LEFT into white background
 * - Clear of nostril anatomy
 * 
 * MOUTH CAVITY INTERIOR:
 * - 4 ribbons positioned BACK (right) deep in mouth
 * - Over tongue (red) is OK, not through outlined mouth parts
 * - Staggered lengths
 * 
 * LIP EXIT:
 * - 5 ribbons positioned LEFT into white background
 * - Clear of lip anatomy
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
// DRAWING - Positioned to avoid anatomy overlap
// =============================================================================

/**
 * Draw oral airflow
 * - Mouth cavity ribbons: deep inside (right), over tongue area, staggered lengths
 * - Lip exit ribbons: far left in white background, clear of lips
 */
function drawOralAirflow(ctx, width, height, intensity, turbulent, phase) {
  if (intensity <= 0) return;
  
  const opacity = 0.75 + intensity * 0.2;
  
  // === MOUTH CAVITY INTERIOR - 4 ribbons deep in mouth ===
  // Position: Start deep inside mouth (far right), above tongue (red area)
  // End before the outlined mouth structure
  const cavityStartX = width * 0.55;  // Deep inside mouth (right side)
  const cavityEndX = width * 0.32;    // End before mouth outline
  const cavityY = height * 0.48;      // Above tongue level
  const cavitySpread = height * 0.028;
  
  // Staggered lengths - each ribbon different length to show direction
  const lengthMultipliers = [0.6, 0.8, 1.0, 0.75];
  
  for (let i = 0; i < 4; i++) {
    const yOffset = (i - 1.5) * cavitySpread;
    const ribbonPhase = (phase + i * 0.12) % 1;
    const lineY = cavityY + yOffset;
    const lengthMult = lengthMultipliers[i];
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 210, 255, ${opacity})`;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const waveAmp = turbulent ? 3 : 2;
    const baseLength = (cavityStartX - cavityEndX) * lengthMult;
    const startX = cavityStartX - (1 - lengthMult) * 20;
    const endX = startX - baseLength;
    
    ctx.moveTo(startX, lineY);
    
    const steps = 15;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const x = startX + (endX - startX) * t;
      const wave = Math.sin((t * 3 + ribbonPhase * 2) * Math.PI) * waveAmp;
      ctx.lineTo(x, lineY + wave);
    }
    ctx.stroke();
  }
  
  // === LIP EXIT - 5 ribbons in white background ===
  // Position: Start LEFT of lips, entirely in white background
  const lipExitStartX = width * 0.12;  // Left of lips, in white area
  const lipExitY = height * 0.52;
  const lipSpread = height * 0.022;
  
  // Staggered lengths for exit ribbons
  const exitLengths = [40, 55, 45, 60, 35];
  
  for (let i = 0; i < 5; i++) {
    const yOffset = (i - 2) * lipSpread;
    const ribbonPhase = (phase + i * 0.1) % 1;
    const maxLen = exitLengths[i] + intensity * 20;
    const currentLen = maxLen * (0.5 + ribbonPhase * 0.5);
    const fadeOpacity = opacity * (1 - ribbonPhase * 0.25);
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 210, 255, ${fadeOpacity})`;
    ctx.lineWidth = 2.5 * (1 - ribbonPhase * 0.15);
    ctx.lineCap = 'round';
    
    const startY = lipExitY + yOffset;
    const endX = lipExitStartX - currentLen;
    const wave = turbulent ? Math.sin(ribbonPhase * Math.PI * 3) * 2 : 0;
    
    ctx.moveTo(lipExitStartX, startY);
    ctx.quadraticCurveTo(
      lipExitStartX - currentLen * 0.5, 
      startY + wave, 
      endX, 
      startY + wave * 0.5
    );
    ctx.stroke();
  }
}

/**
 * Draw nasal airflow
 * - Nasal cavity ribbons: UP and BACK (right), in nasal passage only, staggered lengths
 * - Nostril exit ribbons: far LEFT in white background, clear of nostrils
 */
function drawNasalAirflow(ctx, width, height, intensity, phase, isInhale = false) {
  if (intensity <= 0) return;
  
  const opacity = 0.75 + intensity * 0.2;
  const dir = isInhale ? 1 : -1;
  
  // === NASAL CAVITY INTERIOR - 4 ribbons UP and BACK ===
  // Position: High up in nasal passage, far right (deep in cavity)
  const nasalStartX = width * 0.52;   // Deep in nasal cavity (right)
  const nasalEndX = width * 0.28;     // End before anatomy
  const nasalY = height * 0.24;       // Higher up in nasal passage
  const nasalSpread = height * 0.025;
  
  // Staggered lengths to show direction
  const lengthMultipliers = [0.7, 1.0, 0.85, 0.6];
  
  for (let i = 0; i < 4; i++) {
    const yOffset = (i - 1.5) * nasalSpread;
    const ribbonPhase = (phase + i * 0.15) % 1;
    const lineY = nasalY + yOffset;
    const lengthMult = lengthMultipliers[i];
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 210, 255, ${opacity})`;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const waveAmp = 2.5;
    const baseLength = (nasalStartX - nasalEndX) * lengthMult;
    const animOffset = isInhale ? ribbonPhase * 15 : -ribbonPhase * 15;
    const startX = nasalStartX + animOffset - (1 - lengthMult) * 15;
    const endX = startX - baseLength;
    
    ctx.moveTo(startX, lineY);
    
    const steps = 12;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const x = startX + (endX - startX) * t;
      const wave = Math.sin((t * 2.5 + ribbonPhase * 2) * Math.PI) * waveAmp;
      ctx.lineTo(x, lineY + wave);
    }
    ctx.stroke();
  }
  
  // === NOSTRIL EXIT - 5 ribbons in white background ===
  // Position: Far LEFT of nostrils, entirely in white background
  const nostrilExitX = width * 0.08;  // Far left, clear of nostril anatomy
  const nostrilExitY = height * 0.38;
  const nostrilSpread = height * 0.018;
  
  // Staggered lengths
  const exitLengths = [35, 50, 40, 55, 30];
  
  for (let i = 0; i < 5; i++) {
    const yOffset = (i - 2) * nostrilSpread;
    const ribbonPhase = (phase + i * 0.12) % 1;
    const maxLen = exitLengths[i] + intensity * 15;
    const currentLen = maxLen * (0.5 + ribbonPhase * 0.5);
    const fadeOpacity = opacity * (1 - ribbonPhase * 0.25);
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 210, 255, ${fadeOpacity})`;
    ctx.lineWidth = 2.5 * (1 - ribbonPhase * 0.15);
    ctx.lineCap = 'round';
    
    const startY = nostrilExitY + yOffset;
    // Angle outward-left and slightly down when exhaling
    const endX = nostrilExitX + dir * currentLen * 0.5;
    const endY = startY - dir * currentLen * 0.7;
    
    ctx.moveTo(nostrilExitX, startY);
    ctx.quadraticCurveTo(
      nostrilExitX + dir * currentLen * 0.25,
      startY - dir * currentLen * 0.3,
      endX, endY
    );
    ctx.stroke();
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
 * Draw idle breathing - nasal cavity + nostril exit
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
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  
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
    
    const elapsed = (Date.now() - breathTimeRef.current) / 1000;
    const breathPhase = (elapsed % 4) / 4;
    
    const isNeutral = currentFrame === 0 && !isPlaying;
    
    if (isNeutral) {
      drawIdleBreathing(ctx, width, height, breathPhase);
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
        drawBurst(ctx, width * 0.10, height * 0.52, airflow.oral, phase);
      }
    } else if (isPlaying && !phonemeSymbol) {
      drawNasalAirflow(ctx, width, height, 0.3, phase, false);
    } else if (!isPlaying) {
      drawIdleBreathing(ctx, width, height, breathPhase);
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
