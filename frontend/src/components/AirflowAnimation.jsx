/**
 * AIRFLOW ANIMATION - Phoneme-Driven, Always-On, Realistic Breathing
 * 
 * Features:
 * - Always visible when needed (no toggle)
 * - Oral ribbons: 2 front + 2 back (staggered) + 2 at lips exit
 * - Nasal ribbons: Long external + 4 large internal cavity ribbons
 * - Idle breathing: In 2s, Out 2s cycle when neutral
 * - All airflow blows OUTWARD when speaking
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';

// =============================================================================
// PHONEME → ARTICULATORY CLASS MAPPING
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
  
  // PLOSIVES (Stops) - NO airflow during closure, burst on release
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
  
  // NASALS - Flow through NOSE only, NOT mouth
  'm': { class: 'nasal' },
  'n': { class: 'nasal' },
  'ng': { class: 'nasal' },
  'ŋ': { class: 'nasal' },
  
  // APPROXIMANTS & LATERALS - Low oral flow
  'l': { class: 'approximant' },
  'r': { class: 'approximant' },
  'w': { class: 'approximant' },
  'y': { class: 'approximant' },
  'j': { class: 'approximant' },
  
  // AFFRICATES - Burst + sustained
  'ch': { class: 'affricate', voiced: false },
  'tʃ': { class: 'affricate', voiced: false },
  'dʒ': { class: 'affricate', voiced: true },
};

// =============================================================================
// AIRFLOW CONFIGURATION BY CLASS
// =============================================================================

function getAirflowConfig(phonemeSymbol, isRelease = false) {
  const info = PHONEME_CLASSES[phonemeSymbol?.toLowerCase()] || PHONEME_CLASSES[phonemeSymbol];
  
  if (!info) {
    return { oral: 0.2, nasal: 0, turbulent: false, burst: false };
  }
  
  switch (info.class) {
    case 'vowel':
      const vowelIntensity = {
        'close': 0.3,
        'mid': 0.5,
        'open': 0.8,
      }[info.height] || 0.5;
      return { oral: vowelIntensity, nasal: 0, turbulent: false, burst: false };
      
    case 'plosive':
      if (isRelease) {
        return { 
          oral: info.voiced ? 0.4 : 0.7, 
          nasal: 0, 
          turbulent: !info.voiced, 
          burst: true 
        };
      }
      return { oral: 0, nasal: 0, turbulent: false, burst: false };
      
    case 'fricative':
      return { 
        oral: info.voiced ? 0.5 : 0.8, 
        nasal: 0, 
        turbulent: true, 
        burst: false 
      };
      
    case 'nasal':
      return { oral: 0, nasal: 0.8, turbulent: false, burst: false };
      
    case 'approximant':
      return { oral: 0.25, nasal: 0, turbulent: false, burst: false };
      
    case 'affricate':
      return { 
        oral: info.voiced ? 0.5 : 0.7, 
        nasal: 0, 
        turbulent: true, 
        burst: isRelease 
      };
      
    default:
      return { oral: 0.2, nasal: 0, turbulent: false, burst: false };
  }
}

// =============================================================================
// DRAWING FUNCTIONS - ALL FLOW OUTWARD
// =============================================================================

/**
 * Draw oral airflow ribbons - restructured with staggered positioning
 * 2 ribbons deep in mouth cavity (back)
 * 2 ribbons mid-mouth (front)
 * 2 ribbons at lip exit (smallest, into open air)
 */
function drawOralAirflow(ctx, mouthX, mouthY, intensity, turbulent, phase, width) {
  if (intensity <= 0) return;
  
  const baseOpacity = 0.5 + intensity * 0.4;
  const color = `rgba(0, 200, 255, ${baseOpacity})`;
  
  // Calculate ribbon lengths based on intensity
  const maxLength = 60 + intensity * 80;
  
  // Back ribbons (2) - deep in mouth cavity, start further left
  const backStartX = mouthX - 40;
  const backSpread = 8;
  for (let i = 0; i < 2; i++) {
    const offsetY = (i - 0.5) * backSpread;
    const ribbonPhase = (phase + i * 0.25) % 1;
    drawSingleRibbon(ctx, backStartX, mouthY + offsetY, maxLength * 0.7, 4, color, ribbonPhase, turbulent, true);
  }
  
  // Front ribbons (2) - mid mouth, slightly ahead
  const frontStartX = mouthX - 20;
  const frontSpread = 12;
  for (let i = 0; i < 2; i++) {
    const offsetY = (i - 0.5) * frontSpread;
    const ribbonPhase = (phase + 0.15 + i * 0.2) % 1;
    drawSingleRibbon(ctx, frontStartX, mouthY + offsetY, maxLength * 0.85, 3.5, color, ribbonPhase, turbulent, true);
  }
  
  // Lip exit ribbons (2) - at the lips, blowing into open air (smallest)
  const lipStartX = mouthX;
  const lipSpread = 6;
  for (let i = 0; i < 2; i++) {
    const offsetY = (i - 0.5) * lipSpread;
    const ribbonPhase = (phase + 0.3 + i * 0.15) % 1;
    drawSingleRibbon(ctx, lipStartX, mouthY + offsetY, maxLength, 2.5, color, ribbonPhase, turbulent, true);
  }
  
  // Add particles for high intensity
  if (intensity > 0.4) {
    drawAirParticles(ctx, mouthX, mouthY, intensity, phase);
  }
}

/**
 * Draw a single ribbon flowing OUTWARD (left to right)
 */
function drawSingleRibbon(ctx, startX, startY, length, width, color, phase, turbulent, outward = true) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width * (1 - phase * 0.3);
  ctx.lineCap = 'round';
  
  const direction = outward ? 1 : -1;
  const endX = startX + direction * length * (0.4 + phase * 0.6);
  
  let jitterY = 0;
  if (turbulent) {
    jitterY = Math.sin(phase * Math.PI * 8) * 5;
  }
  
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(
    startX + direction * length * 0.4, startY + jitterY,
    endX, startY + jitterY * 0.5
  );
  ctx.stroke();
}

/**
 * Draw floating air particles
 */
function drawAirParticles(ctx, x, y, intensity, phase) {
  for (let p = 0; p < 5; p++) {
    const t = (phase + p * 0.15) % 1;
    const px = x + 80 * t;
    const py = y + Math.sin(t * Math.PI * 3 + p) * 10;
    ctx.beginPath();
    ctx.fillStyle = `rgba(100, 220, 255, ${(1 - t) * 0.5 * intensity})`;
    ctx.arc(px, py, 2 + intensity, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw nasal airflow - enhanced with interior cavity ribbons
 * - 4 large ribbons inside nasal cavity
 * - 2 long ribbons exiting nostrils
 */
function drawNasalAirflow(ctx, noseX, noseY, intensity, phase, isInhale = false) {
  if (intensity <= 0) return;
  
  const direction = isInhale ? -1 : 1; // -1 = inward, 1 = outward
  const baseOpacity = 0.5 + intensity * 0.4;
  
  // === INTERIOR NASAL CAVITY (4 large ribbons) ===
  // Draw cavity outline first
  const cavityX = noseX - 25;
  const cavityY = noseY - 15;
  const cavityWidth = 35;
  const cavityHeight = 30;
  
  // Subtle cavity indication
  ctx.beginPath();
  ctx.strokeStyle = `rgba(100, 180, 255, 0.15)`;
  ctx.lineWidth = 1;
  ctx.ellipse(cavityX, cavityY, cavityWidth, cavityHeight, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // 4 large interior ribbons (6x size of nostril ribbons)
  const interiorRibbonLength = 40;
  const interiorRibbonWidth = 6;
  const interiorColor = `rgba(0, 180, 255, ${baseOpacity * 0.7})`;
  
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI - Math.PI / 2; // Spread in semicircle
    const offsetX = Math.cos(angle) * 12;
    const offsetY = Math.sin(angle) * 8;
    const ribbonPhase = (phase + i * 0.2) % 1;
    
    ctx.beginPath();
    ctx.strokeStyle = interiorColor;
    ctx.lineWidth = interiorRibbonWidth * (1 - ribbonPhase * 0.2);
    ctx.lineCap = 'round';
    
    const sx = cavityX + offsetX;
    const sy = cavityY + offsetY;
    const ex = sx + direction * interiorRibbonLength * (0.3 + ribbonPhase * 0.7);
    
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + direction * interiorRibbonLength * 0.3, sy + Math.sin(ribbonPhase * Math.PI) * 5,
      ex, sy
    );
    ctx.stroke();
  }
  
  // === NOSTRIL EXIT RIBBONS (2, twice as long) ===
  const nostrilLength = 50; // Twice previous length
  const nostrilColor = `rgba(0, 220, 255, ${baseOpacity})`;
  
  for (let nostril = -1; nostril <= 1; nostril += 2) {
    const offsetX = nostril * 8;
    
    for (let r = 0; r < 2; r++) {
      const ribbonPhase = (phase + r * 0.25) % 1;
      
      ctx.beginPath();
      ctx.strokeStyle = nostrilColor;
      ctx.lineWidth = 2.5 + intensity;
      ctx.lineCap = 'round';
      
      const sx = noseX + offsetX;
      const sy = noseY + 5;
      
      // Flow outward and down when exhaling, inward and up when inhaling
      const endX = sx + direction * nostrilLength * (0.4 + ribbonPhase * 0.6) * 0.3;
      const endY = sy + direction * nostrilLength * (0.4 + ribbonPhase * 0.6);
      
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(
        sx + direction * nostrilLength * 0.15, sy + direction * nostrilLength * 0.3,
        endX, endY
      );
      ctx.stroke();
    }
  }
}

/**
 * Draw burst effect for plosives on release
 */
function drawBurst(ctx, x, y, intensity, phase) {
  if (phase > 0.3) return;
  
  const burstPhase = phase / 0.3;
  const radius = 8 + burstPhase * 30 * intensity;
  const opacity = (1 - burstPhase) * 0.5 * intensity;
  
  ctx.beginPath();
  ctx.strokeStyle = `rgba(150, 220, 255, ${opacity})`;
  ctx.lineWidth = 2;
  ctx.arc(x + 20, y, radius, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();
}

/**
 * Draw idle breathing animation - cycles between inhale and exhale
 * 2 seconds in, 2 seconds out
 */
function drawIdleBreathing(ctx, noseX, noseY, breathPhase) {
  // breathPhase cycles 0-1 over 4 seconds total
  // 0-0.5 = inhale (2 sec), 0.5-1 = exhale (2 sec)
  const isInhale = breathPhase < 0.5;
  const cyclePhase = isInhale ? breathPhase * 2 : (breathPhase - 0.5) * 2;
  
  // Breathing intensity rises and falls smoothly
  const intensity = Math.sin(cyclePhase * Math.PI) * 0.5 + 0.2;
  
  // Draw nasal airflow with direction based on inhale/exhale
  drawNasalAirflow(ctx, noseX, noseY, intensity, cyclePhase, isInhale);
}

// =============================================================================
// REACT COMPONENT - Always on, no toggle needed
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
  
  // Positions for mouth and nose on side-view sprite
  const mouthPos = { x: width * 0.24, y: height * 0.48 };
  const nosePos = { x: width * 0.15, y: height * 0.35 };
  
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    
    // Update animation phase
    phaseRef.current = (phaseRef.current + 0.025) % 1;
    const phase = phaseRef.current;
    
    // Calculate breath phase (4 second cycle: 2s in, 2s out)
    const elapsed = (Date.now() - breathTimeRef.current) / 1000;
    const breathPhase = (elapsed % 4) / 4;
    
    // Check if neutral/idle state
    const isNeutral = currentFrame === 0 && !isPlaying;
    
    if (isNeutral) {
      // IDLE BREATHING - show nasal breathing cycle
      drawIdleBreathing(ctx, nosePos.x, nosePos.y, breathPhase);
    } else if (isPlaying && phonemeSymbol) {
      // PHONEME-DRIVEN AIRFLOW
      const isRelease = isLastFrameOfPhoneme;
      const airflow = getAirflowConfig(phonemeSymbol, isRelease);
      
      // Draw oral airflow (if any) - blows OUTWARD
      if (airflow.oral > 0) {
        drawOralAirflow(ctx, mouthPos.x, mouthPos.y, airflow.oral, airflow.turbulent, phase, width);
      }
      
      // Draw nasal airflow (for nasals only) - blows OUTWARD
      if (airflow.nasal > 0) {
        drawNasalAirflow(ctx, nosePos.x, nosePos.y, airflow.nasal, phase, false);
      }
      
      // Draw burst (for plosives on release)
      if (airflow.burst) {
        drawBurst(ctx, mouthPos.x, mouthPos.y, airflow.oral, phase);
      }
    } else if (isPlaying && !phonemeSymbol) {
      // Playing but between phonemes - show gentle nasal breathing out
      drawNasalAirflow(ctx, nosePos.x, nosePos.y, 0.2, phase, false);
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
