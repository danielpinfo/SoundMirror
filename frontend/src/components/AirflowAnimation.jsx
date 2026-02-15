/**
 * AIRFLOW ANIMATION - Exact Match to Reference Image
 * 
 * Reference image shows:
 * 
 * NASAL CAVITY (interior):
 * - 4 wavy horizontal ribbons INSIDE the nasal passage
 * - Running through the light grey nasal cavity area
 * 
 * NOSTRIL EXIT:
 * - 5 ribbons exiting nostrils, angled outward/down
 * 
 * MOUTH CAVITY (interior):
 * - 4 ribbons ABOVE the tongue, in air space between palate and tongue
 * - Running horizontally through mouth interior
 * 
 * LIP EXIT:
 * - 5 ribbons exiting lips, going outward (left)
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
  'ɪ': { class: 'vowel', height: 'close' },
  'ɛ': { class: 'vowel', height: 'mid' },
  'æ': { class: 'vowel', height: 'open' },
  'ə': { class: 'vowel', height: 'mid' },
  'ʌ': { class: 'vowel', height: 'mid' },
  'ʊ': { class: 'vowel', height: 'close' },
  'ɔ': { class: 'vowel', height: 'mid' },
  'ɑ': { class: 'vowel', height: 'open' },
  
  // PLOSIVES
  'p': { class: 'plosive', voiced: false },
  'b': { class: 'plosive', voiced: true },
  't': { class: 'plosive', voiced: false },
  'd': { class: 'plosive', voiced: true },
  'k': { class: 'plosive', voiced: false },
  'g': { class: 'plosive', voiced: true },
  
  // FRICATIVES
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
  
  // NASALS
  'm': { class: 'nasal' },
  'n': { class: 'nasal' },
  'ng': { class: 'nasal' },
  'ŋ': { class: 'nasal' },
  
  // APPROXIMANTS
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

function getAirflowConfig(phonemeSymbol, isRelease = false) {
  const info = PHONEME_CLASSES[phonemeSymbol?.toLowerCase()] || PHONEME_CLASSES[phonemeSymbol];
  
  if (!info) {
    return { oral: 0.3, nasal: 0, turbulent: false, burst: false };
  }
  
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
// DRAWING - EXACT MATCH TO REFERENCE IMAGE
// =============================================================================

/**
 * Draw oral airflow - BOTH cavity interior AND lip exit
 * Reference shows:
 * - 4 ribbons inside mouth (above tongue, between palate and tongue)
 * - 5 ribbons at lip exit
 */
function drawOralAirflow(ctx, width, height, intensity, turbulent, phase) {
  if (intensity <= 0) return;
  
  const opacity = 0.7 + intensity * 0.25;
  const color = `rgba(0, 210, 255, ${opacity})`;
  
  // === MOUTH CAVITY INTERIOR - 4 ribbons above tongue ===
  // These run horizontally through the mouth space (above the red tongue area)
  // Position: roughly in the upper half of mouth opening
  const cavityStartX = width * 0.42;  // Start inside mouth (right side)
  const cavityEndX = width * 0.22;    // End at lip area (left side)
  const cavityY = height * 0.50;      // Vertical center of mouth cavity
  const cavitySpread = height * 0.04; // Vertical spread between ribbons
  
  for (let i = 0; i < 4; i++) {
    const yOffset = (i - 1.5) * cavitySpread;
    const ribbonPhase = (phase + i * 0.1) % 1;
    const lineY = cavityY + yOffset;
    
    // Wavy horizontal line through cavity
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const waveAmp = turbulent ? 4 : 2;
    const startX = cavityStartX - ribbonPhase * 20;
    const endX = cavityEndX;
    
    ctx.moveTo(startX, lineY);
    
    // Draw wavy line from inside mouth to lip area
    const steps = 20;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const x = startX + (endX - startX) * t;
      const wave = Math.sin((t * 4 + ribbonPhase * 2) * Math.PI) * waveAmp;
      ctx.lineTo(x, lineY + wave);
    }
    ctx.stroke();
  }
  
  // === LIP EXIT - 5 ribbons exiting mouth ===
  // These extend outward (left) from the lips
  const lipX = width * 0.20;          // Lip edge position
  const lipY = height * 0.52;         // Lip vertical center
  const lipSpread = height * 0.025;   // Spread between exit ribbons
  const exitLength = 35 + intensity * 25;
  
  for (let i = 0; i < 5; i++) {
    const yOffset = (i - 2) * lipSpread;
    const ribbonPhase = (phase + i * 0.12) % 1;
    const currentLen = exitLength * (0.4 + ribbonPhase * 0.6);
    const fadeOpacity = opacity * (1 - ribbonPhase * 0.3);
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 210, 255, ${fadeOpacity})`;
    ctx.lineWidth = 2.5 * (1 - ribbonPhase * 0.2);
    ctx.lineCap = 'round';
    
    const startY = lipY + yOffset;
    const endX = lipX - currentLen;
    const wave = turbulent ? Math.sin(ribbonPhase * Math.PI * 4) * 3 : 0;
    
    ctx.moveTo(lipX, startY);
    ctx.quadraticCurveTo(lipX - currentLen * 0.5, startY + wave, endX, startY + wave * 0.5);
    ctx.stroke();
  }
}

/**
 * Draw nasal airflow - BOTH cavity interior AND nostril exit
 * Reference shows:
 * - 4 wavy ribbons inside nasal cavity
 * - 5 ribbons at nostril exit
 */
function drawNasalAirflow(ctx, width, height, intensity, phase, isInhale = false) {
  if (intensity <= 0) return;
  
  const opacity = 0.7 + intensity * 0.25;
  const color = `rgba(0, 210, 255, ${opacity})`;
  const dir = isInhale ? 1 : -1; // -1 = outward (exhale), 1 = inward (inhale)
  
  // === NASAL CAVITY INTERIOR - 4 wavy ribbons ===
  // These run horizontally through the nasal passage (the light area above mouth)
  const nasalStartX = width * 0.38;   // Start inside nasal cavity (right)
  const nasalEndX = width * 0.18;     // End at nostril area (left)
  const nasalY = height * 0.32;       // Vertical center of nasal cavity
  const nasalSpread = height * 0.035; // Spread between ribbons
  
  for (let i = 0; i < 4; i++) {
    const yOffset = (i - 1.5) * nasalSpread;
    const ribbonPhase = (phase + i * 0.15) % 1;
    const lineY = nasalY + yOffset;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    // Wavy horizontal line through nasal cavity
    const waveAmp = 3;
    const animOffset = isInhale ? ribbonPhase * 20 : -ribbonPhase * 20;
    const startX = nasalStartX + animOffset;
    const endX = nasalEndX;
    
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
  
  // === NOSTRIL EXIT - 5 ribbons ===
  // These exit the nostrils and angle outward/down
  const nostrilX = width * 0.16;      // Nostril position
  const nostrilY = height * 0.40;     // Nostril vertical position
  const nostrilSpread = height * 0.02;
  const exitLength = 30 + intensity * 20;
  
  for (let i = 0; i < 5; i++) {
    const yOffset = (i - 2) * nostrilSpread;
    const ribbonPhase = (phase + i * 0.1) % 1;
    const currentLen = exitLength * (0.4 + ribbonPhase * 0.6);
    const fadeOpacity = opacity * (1 - ribbonPhase * 0.3);
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 210, 255, ${fadeOpacity})`;
    ctx.lineWidth = 2.5 * (1 - ribbonPhase * 0.2);
    ctx.lineCap = 'round';
    
    const startY = nostrilY + yOffset;
    // Angle: outward (left) and down when exhaling
    const endX = nostrilX + dir * currentLen * 0.6;
    const endY = startY - dir * currentLen * 0.8;
    
    ctx.moveTo(nostrilX, startY);
    ctx.quadraticCurveTo(
      nostrilX + dir * currentLen * 0.3,
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
  ctx.arc(x - 15, y, radius, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
}

/**
 * Draw idle breathing - nasal cavity + nostril exit
 * 2 seconds inhale, 2 seconds exhale
 */
function drawIdleBreathing(ctx, width, height, breathPhase) {
  const isInhale = breathPhase < 0.5;
  const cyclePhase = isInhale ? breathPhase * 2 : (breathPhase - 0.5) * 2;
  const intensity = Math.sin(cyclePhase * Math.PI) * 0.6 + 0.2;
  
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
      // Idle breathing through nose
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
        drawBurst(ctx, width * 0.20, height * 0.52, airflow.oral, phase);
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
