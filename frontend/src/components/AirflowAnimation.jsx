/**
 * AIRFLOW ANIMATION - Based on Reference Image
 * 
 * Reference: Cyan ribbons flowing OUTWARD from mouth and nose
 * - Oral: ~10 parallel ribbons emanating from mouth cavity, flowing LEFT (outward from face)
 * - Nasal: ~5 ribbons from nasal cavity, flowing outward through nostrils
 * - Idle breathing: 2s inhale (ribbons flow inward), 2s exhale (ribbons flow outward) through nose
 * 
 * CRITICAL: All ribbons MUST flow OUTWARD (to the LEFT on side-view) when speaking/exhaling
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';

// =============================================================================
// PHONEME CLASSIFICATION
// =============================================================================

const PHONEME_CLASSES = {
  // VOWELS - Oral continuous flow
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
  
  // IPA vowels
  'ɪ': { class: 'vowel', height: 'close' },
  'ɛ': { class: 'vowel', height: 'mid' },
  'æ': { class: 'vowel', height: 'open' },
  'ə': { class: 'vowel', height: 'mid' },
  'ʌ': { class: 'vowel', height: 'mid' },
  'ʊ': { class: 'vowel', height: 'close' },
  'ɔ': { class: 'vowel', height: 'mid' },
  'ɑ': { class: 'vowel', height: 'open' },
  
  // PLOSIVES - NO airflow during closure, burst on release
  'p': { class: 'plosive', voiced: false },
  'b': { class: 'plosive', voiced: true },
  't': { class: 'plosive', voiced: false },
  'd': { class: 'plosive', voiced: true },
  'k': { class: 'plosive', voiced: false },
  'g': { class: 'plosive', voiced: true },
  
  // FRICATIVES - Sustained turbulent flow
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
  
  // NASALS - Flow through NOSE only
  'm': { class: 'nasal' },
  'n': { class: 'nasal' },
  'ng': { class: 'nasal' },
  'ŋ': { class: 'nasal' },
  
  // APPROXIMANTS - Low oral flow
  'l': { class: 'approximant' },
  'r': { class: 'approximant' },
  'w': { class: 'approximant' },
  'y': { class: 'approximant' },
  'j': { class: 'approximant' },
  
  // AFFRICATES
  'ch': { class: 'affricate', voiced: false },
  'tʃ': { class: 'affricate', voiced: false },
  'dʒ': { class: 'affricate', voiced: true },
};

// =============================================================================
// AIRFLOW CONFIG BY PHONEME CLASS
// =============================================================================

function getAirflowConfig(phonemeSymbol, isRelease = false) {
  const info = PHONEME_CLASSES[phonemeSymbol?.toLowerCase()] || PHONEME_CLASSES[phonemeSymbol];
  
  if (!info) {
    return { oral: 0.3, nasal: 0, turbulent: false, burst: false };
  }
  
  switch (info.class) {
    case 'vowel':
      const vowelIntensity = {
        'close': 0.4,
        'mid': 0.6,
        'open': 0.9,
      }[info.height] || 0.6;
      return { oral: vowelIntensity, nasal: 0, turbulent: false, burst: false };
      
    case 'plosive':
      if (isRelease) {
        return { oral: info.voiced ? 0.5 : 0.8, nasal: 0, turbulent: !info.voiced, burst: true };
      }
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
// DRAWING FUNCTIONS - RIBBONS FLOW OUTWARD (LEFT on side-view)
// =============================================================================

/**
 * Draw a single ribbon as an extending line
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} startX - Where ribbon originates
 * @param {number} startY - Y position
 * @param {number} length - Maximum length of ribbon
 * @param {number} thickness - Line width
 * @param {string} color - RGBA color string
 * @param {number} phase - Animation phase 0-1
 * @param {boolean} turbulent - Add waviness
 * @param {boolean} flowOutward - true = flow left (outward), false = flow right (inward)
 */
function drawRibbon(ctx, startX, startY, length, thickness, color, phase, turbulent, flowOutward) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness * (0.7 + (1 - phase) * 0.3); // Thicker at start, thinner at end
  ctx.lineCap = 'round';
  
  // Direction: -1 = flow LEFT (outward from face), +1 = flow RIGHT (into face)
  const direction = flowOutward ? -1 : 1;
  
  // Ribbon extends over time based on phase
  const currentLength = length * (0.3 + phase * 0.7);
  const endX = startX + direction * currentLength;
  
  // Add waviness for turbulent sounds
  let waveY = 0;
  if (turbulent) {
    waveY = Math.sin(phase * Math.PI * 6) * 4;
  }
  
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(
    startX + direction * currentLength * 0.5, 
    startY + waveY,
    endX, 
    startY + waveY * 0.5
  );
  ctx.stroke();
}

/**
 * Draw oral airflow - 10 ribbons flowing OUTWARD from mouth
 * Based on reference image: ribbons start inside mouth cavity and extend out through lips
 */
function drawOralAirflow(ctx, mouthX, mouthY, intensity, turbulent, phase, canvasWidth) {
  if (intensity <= 0) return;
  
  const baseOpacity = 0.55 + intensity * 0.4;
  const color = `rgba(0, 210, 255, ${baseOpacity})`;
  
  // Ribbon lengths based on intensity
  const maxLength = 50 + intensity * 70;
  
  // ========================================
  // BACK OF MOUTH - 4 ribbons (inside cavity)
  // Start further RIGHT (inside the mouth), flow LEFT (outward)
  // ========================================
  const backStartX = mouthX + 30; // Deep inside mouth
  const backSpread = 7;
  for (let i = 0; i < 4; i++) {
    const offsetY = (i - 1.5) * backSpread;
    const ribbonPhase = (phase + i * 0.15) % 1;
    drawRibbon(ctx, backStartX, mouthY + offsetY, maxLength * 0.6, 3.5, color, ribbonPhase, turbulent, true);
  }
  
  // ========================================
  // FRONT OF MOUTH - 4 ribbons (mid-mouth)
  // ========================================
  const frontStartX = mouthX + 15;
  const frontSpread = 9;
  for (let i = 0; i < 4; i++) {
    const offsetY = (i - 1.5) * frontSpread;
    const ribbonPhase = (phase + 0.1 + i * 0.12) % 1;
    drawRibbon(ctx, frontStartX, mouthY + offsetY, maxLength * 0.8, 3, color, ribbonPhase, turbulent, true);
  }
  
  // ========================================
  // LIP EXIT - 2 ribbons (at the lips, flowing into open air)
  // ========================================
  const lipStartX = mouthX;
  const lipSpread = 5;
  for (let i = 0; i < 2; i++) {
    const offsetY = (i - 0.5) * lipSpread;
    const ribbonPhase = (phase + 0.2 + i * 0.1) % 1;
    drawRibbon(ctx, lipStartX, mouthY + offsetY, maxLength, 2.5, color, ribbonPhase, turbulent, true);
  }
  
  // Add floating particles for high intensity
  if (intensity > 0.5) {
    drawParticles(ctx, mouthX, mouthY, intensity, phase);
  }
}

/**
 * Draw floating particles that drift outward
 */
function drawParticles(ctx, x, y, intensity, phase) {
  const particleCount = Math.floor(3 + intensity * 4);
  for (let p = 0; p < particleCount; p++) {
    const t = (phase + p * 0.12) % 1;
    // Particles flow LEFT (outward)
    const px = x - 80 * t;
    const py = y + Math.sin(t * Math.PI * 3 + p) * 12;
    ctx.beginPath();
    ctx.fillStyle = `rgba(100, 230, 255, ${(1 - t) * 0.5 * intensity})`;
    ctx.arc(px, py, 2 + intensity, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw nasal airflow - ribbons from nasal cavity through nostrils
 * Based on reference: 5 ribbons in nasal area, flowing outward/downward
 */
function drawNasalAirflow(ctx, noseX, noseY, intensity, phase, isInhale = false) {
  if (intensity <= 0) return;
  
  const baseOpacity = 0.55 + intensity * 0.4;
  const flowOutward = !isInhale; // Exhale = outward (left/down), Inhale = inward (right/up)
  
  // ========================================
  // INTERIOR NASAL CAVITY - 4 large ribbons
  // ========================================
  const cavityX = noseX + 20; // Inside the nasal cavity
  const cavityY = noseY - 10;
  const cavityColor = `rgba(0, 180, 255, ${baseOpacity * 0.7})`;
  const interiorLength = 35;
  
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 0.6 - Math.PI * 0.3;
    const offsetX = Math.cos(angle) * 8;
    const offsetY = Math.sin(angle) * 12;
    const ribbonPhase = (phase + i * 0.18) % 1;
    
    ctx.beginPath();
    ctx.strokeStyle = cavityColor;
    ctx.lineWidth = 5 * (0.7 + (1 - ribbonPhase) * 0.3);
    ctx.lineCap = 'round';
    
    const sx = cavityX + offsetX;
    const sy = cavityY + offsetY;
    
    // Direction based on inhale/exhale
    const dir = flowOutward ? -1 : 1;
    const ex = sx + dir * interiorLength * (0.3 + ribbonPhase * 0.7);
    const ey = sy + (flowOutward ? 1 : -1) * 10 * ribbonPhase;
    
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + dir * interiorLength * 0.4, 
      sy + (flowOutward ? 5 : -5),
      ex, ey
    );
    ctx.stroke();
  }
  
  // ========================================
  // NOSTRIL EXIT - 2 ribbons per nostril (total 4)
  // Flow outward and downward when exhaling
  // ========================================
  const nostrilColor = `rgba(0, 220, 255, ${baseOpacity})`;
  const nostrilLength = 45;
  
  // Two nostrils
  for (let nostril = -1; nostril <= 1; nostril += 2) {
    const nostrilOffsetX = nostril * 6;
    
    // 2 ribbons per nostril
    for (let r = 0; r < 2; r++) {
      const ribbonPhase = (phase + r * 0.2 + (nostril > 0 ? 0.1 : 0)) % 1;
      const vertOffset = (r - 0.5) * 4;
      
      ctx.beginPath();
      ctx.strokeStyle = nostrilColor;
      ctx.lineWidth = 2.5 + intensity;
      ctx.lineCap = 'round';
      
      const sx = noseX + nostrilOffsetX;
      const sy = noseY + 8 + vertOffset;
      
      // Flow direction
      const dirX = flowOutward ? -0.4 : 0.4;
      const dirY = flowOutward ? 1 : -1;
      
      const currentLength = nostrilLength * (0.3 + ribbonPhase * 0.7);
      const ex = sx + dirX * currentLength;
      const ey = sy + dirY * currentLength;
      
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(
        sx + dirX * currentLength * 0.5,
        sy + dirY * currentLength * 0.4,
        ex, ey
      );
      ctx.stroke();
    }
  }
}

/**
 * Draw burst effect for plosives
 */
function drawBurst(ctx, x, y, intensity, phase) {
  if (phase > 0.35) return;
  
  const burstPhase = phase / 0.35;
  const radius = 10 + burstPhase * 35 * intensity;
  const opacity = (1 - burstPhase) * 0.6 * intensity;
  
  ctx.beginPath();
  ctx.strokeStyle = `rgba(150, 230, 255, ${opacity})`;
  ctx.lineWidth = 2;
  // Arc extends LEFT (outward from face)
  ctx.arc(x - 20, y, radius, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
}

/**
 * Draw idle breathing animation - cycles through nose
 * 2 seconds inhale (ribbons flow IN), 2 seconds exhale (ribbons flow OUT)
 */
function drawIdleBreathing(ctx, noseX, noseY, breathPhase) {
  // breathPhase: 0-1 over 4 seconds (0-0.5 = inhale, 0.5-1 = exhale)
  const isInhale = breathPhase < 0.5;
  const cyclePhase = isInhale ? breathPhase * 2 : (breathPhase - 0.5) * 2;
  
  // Smooth intensity rise and fall
  const intensity = Math.sin(cyclePhase * Math.PI) * 0.45 + 0.15;
  
  // Draw nasal airflow with direction
  drawNasalAirflow(ctx, noseX, noseY, intensity, cyclePhase, isInhale);
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
  
  // Observe container size
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
  
  // Position calibration for side-view sprite
  // Mouth (lips): approximately at x: 28%, y: 56%
  // Nose tip: approximately at x: 18%, y: 38%
  const mouthPos = { x: width * 0.28, y: height * 0.56 };
  const nosePos = { x: width * 0.18, y: height * 0.38 };
  
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    
    // Update animation phase (controls ribbon extension)
    phaseRef.current = (phaseRef.current + 0.02) % 1;
    const phase = phaseRef.current;
    
    // Calculate breath phase (4 second cycle)
    const elapsed = (Date.now() - breathTimeRef.current) / 1000;
    const breathPhase = (elapsed % 4) / 4;
    
    // Determine state: neutral (idle breathing) or phoneme-driven
    const isNeutral = currentFrame === 0 && !isPlaying;
    
    if (isNeutral) {
      // IDLE STATE: Show breathing through nose
      drawIdleBreathing(ctx, nosePos.x, nosePos.y, breathPhase);
    } else if (isPlaying && phonemeSymbol) {
      // PHONEME STATE: Show appropriate airflow
      const isRelease = isLastFrameOfPhoneme;
      const airflow = getAirflowConfig(phonemeSymbol, isRelease);
      
      // Draw oral airflow (mouth) - flows OUTWARD
      if (airflow.oral > 0) {
        drawOralAirflow(ctx, mouthPos.x, mouthPos.y, airflow.oral, airflow.turbulent, phase, width);
      }
      
      // Draw nasal airflow (nose) - flows OUTWARD
      if (airflow.nasal > 0) {
        drawNasalAirflow(ctx, nosePos.x, nosePos.y, airflow.nasal, phase, false);
      }
      
      // Draw burst for plosives on release
      if (airflow.burst) {
        drawBurst(ctx, mouthPos.x, mouthPos.y, airflow.oral, phase);
      }
    } else if (isPlaying && !phonemeSymbol) {
      // Playing but between phonemes - gentle nasal exhale
      drawNasalAirflow(ctx, nosePos.x, nosePos.y, 0.25, phase, false);
    } else if (!isPlaying) {
      // Not playing at all - show idle breathing
      drawIdleBreathing(ctx, nosePos.x, nosePos.y, breathPhase);
    }
    
    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, [width, height, currentFrame, isPlaying, phonemeSymbol, isLastFrameOfPhoneme, mouthPos.x, mouthPos.y, nosePos.x, nosePos.y]);
  
  // Start animation loop
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
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          width: '100%',
          height: '100%'
        }}
        data-testid="airflow-animation-canvas"
      />
    </div>
  );
};

export default AirflowAnimation;
