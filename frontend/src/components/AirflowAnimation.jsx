/**
 * AIRFLOW ANIMATION - Exact Match to Reference Images
 * 
 * ORAL AIRFLOW (Speaking):
 * - 5 ribbons at LIP EXIT ONLY - flowing left (outward)
 * - NO ribbons inside mouth cavity
 * 
 * NASAL AIRFLOW (Idle breathing):
 * - 3 ribbons at NOSTRIL EXIT ONLY - flowing left/down (outward)
 * - NO ribbons inside nasal cavity
 * 
 * Physics: Direction correct (outward from face)
 * Visual: Match reference exactly
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
// DRAWING FUNCTIONS - EXACT MATCH TO REFERENCE
// =============================================================================

/**
 * Draw oral airflow - ONLY at lip exit, 5 ribbons
 * Reference: Ribbons start AT the lips, extend outward (left)
 * NO ribbons inside mouth cavity
 */
function drawOralAirflow(ctx, lipX, lipY, intensity, turbulent, phase) {
  if (intensity <= 0) return;
  
  const baseOpacity = 0.7 + intensity * 0.25;
  const color = `rgba(0, 200, 255, ${baseOpacity})`;
  
  // 5 ribbons at lip exit - matching reference exactly
  const ribbonCount = 5;
  const ribbonLength = 35 + intensity * 25; // Length of ribbons extending outward
  const spreadY = 18; // Vertical spread between ribbons
  const lineWidth = 2.5;
  
  for (let i = 0; i < ribbonCount; i++) {
    // Distribute ribbons vertically centered around lip position
    const offsetY = (i - (ribbonCount - 1) / 2) * (spreadY / (ribbonCount - 1) * 2);
    
    // Phase offset for animation (ribbons extend/contract)
    const ribbonPhase = (phase + i * 0.12) % 1;
    const currentLength = ribbonLength * (0.4 + ribbonPhase * 0.6);
    
    // Ribbon fades as it extends
    const ribbonOpacity = baseOpacity * (1 - ribbonPhase * 0.3);
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 200, 255, ${ribbonOpacity})`;
    ctx.lineWidth = lineWidth * (1 - ribbonPhase * 0.2);
    ctx.lineCap = 'round';
    
    // Start at lip, extend LEFT (outward from face)
    const startX = lipX;
    const startY = lipY + offsetY;
    const endX = lipX - currentLength; // Extend LEFT
    
    // Slight wave for turbulent sounds
    let waveY = 0;
    if (turbulent) {
      waveY = Math.sin(ribbonPhase * Math.PI * 4 + i) * 3;
    }
    
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX - currentLength * 0.5,
      startY + waveY,
      endX,
      startY + waveY * 0.5
    );
    ctx.stroke();
  }
}

/**
 * Draw nasal airflow - ONLY at nostril exit, 3 ribbons
 * Reference: Ribbons start AT nostrils, extend outward (left and slightly down)
 * NO ribbons inside nasal cavity
 */
function drawNasalAirflow(ctx, nostrilX, nostrilY, intensity, phase, isInhale = false) {
  if (intensity <= 0) return;
  
  const baseOpacity = 0.7 + intensity * 0.25;
  const color = `rgba(0, 200, 255, ${baseOpacity})`;
  
  // Direction: outward (exhale) = left/down, inward (inhale) = right/up
  const dirX = isInhale ? 1 : -1; // -1 = left (outward)
  const dirY = isInhale ? -1 : 1; // 1 = down (gravity), -1 = up (inhale)
  
  // 3 ribbons at nostril exit - matching reference exactly
  const ribbonCount = 3;
  const ribbonLength = 30 + intensity * 20;
  const spreadY = 8; // Vertical spread
  const lineWidth = 2.5;
  
  for (let i = 0; i < ribbonCount; i++) {
    // Distribute ribbons
    const offsetY = (i - 1) * spreadY;
    
    // Phase offset for animation
    const ribbonPhase = (phase + i * 0.15) % 1;
    const currentLength = ribbonLength * (0.4 + ribbonPhase * 0.6);
    
    // Ribbon fades as it extends
    const ribbonOpacity = baseOpacity * (1 - ribbonPhase * 0.3);
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 200, 255, ${ribbonOpacity})`;
    ctx.lineWidth = lineWidth * (1 - ribbonPhase * 0.2);
    ctx.lineCap = 'round';
    
    // Start at nostril, extend in direction
    const startX = nostrilX;
    const startY = nostrilY + offsetY;
    
    // Ribbons go left and slightly down when exhaling (like reference)
    const endX = startX + dirX * currentLength * 0.7;
    const endY = startY + dirY * currentLength * 0.5;
    
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + dirX * currentLength * 0.3,
      startY + dirY * currentLength * 0.2,
      endX,
      endY
    );
    ctx.stroke();
  }
}

/**
 * Draw burst effect for plosives on release
 */
function drawBurst(ctx, x, y, intensity, phase) {
  if (phase > 0.35) return;
  
  const burstPhase = phase / 0.35;
  const radius = 8 + burstPhase * 25 * intensity;
  const opacity = (1 - burstPhase) * 0.5 * intensity;
  
  ctx.beginPath();
  ctx.strokeStyle = `rgba(0, 200, 255, ${opacity})`;
  ctx.lineWidth = 2;
  ctx.arc(x - 15, y, radius, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
}

/**
 * Draw idle breathing - nasal airflow cycling in/out
 * 2 seconds inhale, 2 seconds exhale
 */
function drawIdleBreathing(ctx, nostrilX, nostrilY, breathPhase) {
  // breathPhase: 0-1 over 4 seconds (0-0.5 = inhale, 0.5-1 = exhale)
  const isInhale = breathPhase < 0.5;
  const cyclePhase = isInhale ? breathPhase * 2 : (breathPhase - 0.5) * 2;
  
  // Smooth intensity rise and fall
  const intensity = Math.sin(cyclePhase * Math.PI) * 0.6 + 0.2;
  
  // Draw nasal airflow at nostril exit only
  drawNasalAirflow(ctx, nostrilX, nostrilY, intensity, cyclePhase, isInhale);
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
  // LIP POSITION: Where the lips meet the open air (left edge of mouth opening)
  // NOSTRIL POSITION: Where the nostrils meet the open air
  const lipPos = { x: width * 0.22, y: height * 0.54 };
  const nostrilPos = { x: width * 0.16, y: height * 0.40 };
  
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    
    // Update animation phase
    phaseRef.current = (phaseRef.current + 0.025) % 1;
    const phase = phaseRef.current;
    
    // Calculate breath phase (4 second cycle)
    const elapsed = (Date.now() - breathTimeRef.current) / 1000;
    const breathPhase = (elapsed % 4) / 4;
    
    // Determine state
    const isNeutral = currentFrame === 0 && !isPlaying;
    
    if (isNeutral) {
      // IDLE: Breathing through nostrils
      drawIdleBreathing(ctx, nostrilPos.x, nostrilPos.y, breathPhase);
    } else if (isPlaying && phonemeSymbol) {
      // SPEAKING: Show airflow based on phoneme
      const isRelease = isLastFrameOfPhoneme;
      const airflow = getAirflowConfig(phonemeSymbol, isRelease);
      
      // Oral airflow at lips
      if (airflow.oral > 0) {
        drawOralAirflow(ctx, lipPos.x, lipPos.y, airflow.oral, airflow.turbulent, phase);
      }
      
      // Nasal airflow at nostrils
      if (airflow.nasal > 0) {
        drawNasalAirflow(ctx, nostrilPos.x, nostrilPos.y, airflow.nasal, phase, false);
      }
      
      // Burst for plosives
      if (airflow.burst) {
        drawBurst(ctx, lipPos.x, lipPos.y, airflow.oral, phase);
      }
    } else if (isPlaying && !phonemeSymbol) {
      // Between phonemes - gentle nasal exhale
      drawNasalAirflow(ctx, nostrilPos.x, nostrilPos.y, 0.3, phase, false);
    } else if (!isPlaying) {
      // Not playing - idle breathing
      drawIdleBreathing(ctx, nostrilPos.x, nostrilPos.y, breathPhase);
    }
    
    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, [width, height, currentFrame, isPlaying, phonemeSymbol, isLastFrameOfPhoneme, lipPos.x, lipPos.y, nostrilPos.x, nostrilPos.y]);
  
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
