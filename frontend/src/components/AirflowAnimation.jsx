/**
 * AIRFLOW ANIMATION - Phoneme-Driven, Sprite-Safe, Language-Agnostic
 * 
 * Contract (NON-NEGOTIABLE):
 *   "Airflow visualization is a direct function of phoneme articulation,
 *    synchronized to sprite frames, independent of language, spelling, or word meaning."
 * 
 * Three channels: Oral (mouth), Nasal (nose), Breath (idle)
 * Driven by phoneme articulatory class, NOT by letters/words/language
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
    // Fallback: low oral airflow, log internally
    console.log(`[Airflow] Unknown phoneme "${phonemeSymbol}" - defaulting to low oral`);
    return { oral: 0.2, nasal: 0, turbulent: false, burst: false };
  }
  
  switch (info.class) {
    case 'vowel':
      // Vowels: Oral ON, Nasal OFF, continuous smooth flow
      // Intensity scales with mouth openness
      const vowelIntensity = {
        'close': 0.3,   // /i u/
        'mid': 0.5,     // /e o/
        'open': 0.8,    // /a/
      }[info.height] || 0.5;
      return { oral: vowelIntensity, nasal: 0, turbulent: false, burst: false };
      
    case 'plosive':
      // Plosives: NO airflow during closure, burst on release only
      if (isRelease) {
        return { 
          oral: info.voiced ? 0.4 : 0.7, 
          nasal: 0, 
          turbulent: !info.voiced, 
          burst: true 
        };
      }
      // During closure: NO AIRFLOW
      return { oral: 0, nasal: 0, turbulent: false, burst: false };
      
    case 'fricative':
      // Fricatives: High oral, continuous, turbulent
      return { 
        oral: info.voiced ? 0.5 : 0.8, 
        nasal: 0, 
        turbulent: true, 
        burst: false 
      };
      
    case 'nasal':
      // Nasals: Nasal ON, Oral OFF (flow through nose only!)
      return { oral: 0, nasal: 0.7, turbulent: false, burst: false };
      
    case 'approximant':
      // Approximants: Low oral flow
      return { oral: 0.25, nasal: 0, turbulent: false, burst: false };
      
    case 'affricate':
      // Affricates: Burst + sustained turbulent
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
// DRAWING FUNCTIONS
// =============================================================================

/**
 * Draw oral airflow ribbons from mouth
 */
function drawOralAirflow(ctx, x, y, intensity, turbulent, phase) {
  if (intensity <= 0) return;
  
  const ribbonCount = Math.max(3, Math.floor(intensity * 5));
  const maxLength = 50 + intensity * 60;
  const baseWidth = 3 + intensity * 4;
  
  for (let r = 0; r < ribbonCount; r++) {
    const spread = (r - (ribbonCount - 1) / 2) * (6 + intensity * 10);
    const ribbonPhase = (phase + r * 0.15) % 1;
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 200, 255, ${0.5 + intensity * 0.45})`;
    ctx.lineWidth = baseWidth * (1 - ribbonPhase * 0.3);
    ctx.lineCap = 'round';
    
    const sx = x;
    const sy = y + spread;
    
    // Add turbulence jitter for fricatives
    let jitterY = 0;
    if (turbulent) {
      jitterY = Math.sin(phase * Math.PI * 8 + r * 3) * (4 + intensity * 6);
    }
    
    const endX = sx + maxLength * (0.4 + ribbonPhase * 0.6);
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + maxLength * 0.4, sy + jitterY,
      endX, sy + jitterY * 0.5 + spread * 0.2
    );
    ctx.stroke();
    
    // Add particles for higher intensity
    if (intensity > 0.4) {
      for (let p = 0; p < 3; p++) {
        const t = (ribbonPhase + p * 0.2) % 1;
        const px = sx + maxLength * t * 0.8;
        const py = sy + spread * 0.3 + jitterY * t;
        ctx.beginPath();
        ctx.fillStyle = `rgba(100, 220, 255, ${(1 - t) * 0.6})`;
        ctx.arc(px, py, 2 + intensity, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Draw nasal airflow from nostrils
 */
function drawNasalAirflow(ctx, x, y, intensity, phase) {
  if (intensity <= 0) return;
  
  // Draw from both nostrils
  for (let nostril = -1; nostril <= 1; nostril += 2) {
    const offsetX = nostril * 6;
    
    for (let r = 0; r < 3; r++) {
      const ribbonPhase = (phase + r * 0.2) % 1;
      
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 220, 255, ${0.5 + intensity * 0.4})`;
      ctx.lineWidth = 2 + intensity * 1.5;
      ctx.lineCap = 'round';
      
      const sx = x + offsetX;
      const sy = y;
      const len = 25 + intensity * 30;
      
      // Nasal flow goes outward and slightly down/forward
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(
        sx + len * 0.4, sy - len * 0.2,
        sx + len * 0.6 * ribbonPhase, sy - len * 0.3 * ribbonPhase
      );
      ctx.stroke();
    }
  }
}

/**
 * Draw burst effect for plosives on release
 */
function drawBurst(ctx, x, y, intensity, phase) {
  if (phase > 0.3) return; // Burst is short-lived
  
  const burstPhase = phase / 0.3;
  const radius = 8 + burstPhase * 30 * intensity;
  const opacity = (1 - burstPhase) * 0.5 * intensity;
  
  ctx.beginPath();
  ctx.strokeStyle = `rgba(150, 220, 255, ${opacity})`;
  ctx.lineWidth = 2;
  ctx.arc(x + 15, y, radius, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();
}

/**
 * Draw breathing animation during neutral frame
 */
function drawBreathing(ctx, noseX, noseY, phase, isInhale) {
  const direction = isInhale ? -1 : 1;
  const intensity = 0.3 + Math.sin(phase * Math.PI) * 0.2;
  
  for (let nostril = -1; nostril <= 1; nostril += 2) {
    const offsetX = nostril * 8;
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(100, 180, 255, ${intensity * 0.6})`;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    
    const sx = noseX + offsetX;
    const sy = noseY;
    const len = 12 + phase * 8;
    
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + len * 0.2 * nostril, sy + direction * len * 0.3,
      sx + len * 0.3 * nostril, sy + direction * len
    );
    ctx.stroke();
  }
}

// =============================================================================
// REACT COMPONENT
// =============================================================================

const AirflowAnimation = ({
  currentFrame = 0,
  phonemeSymbol = null,
  isPlaying = false,
  isLastFrameOfPhoneme = false, // For burst timing on plosive release
  enabled = true,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const phaseRef = useRef(0);
  const breathPhaseRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  
  // Observe container size - with retry logic for initial render
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
      }
    };
    
    // Initial update with small delay to ensure layout is complete
    const timeoutId = setTimeout(updateDimensions, 100);
    
    // Also observe for changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [enabled]); // Re-run when enabled changes
  
  const { width, height } = dimensions;
  
  // Positions for mouth and nose on side-view sprite
  // The sprite is scaled 1.125x (transform: scale(1.125)) and centered
  // Looking at the side-view anatomy sprite:
  // - The lip opening is at the front of the mouth, approximately x: 24%, y: 48%
  // - Airflow should emerge from the lip opening going rightward (outward from face)
  const mouthPos = { x: width * 0.24, y: height * 0.48 };
  const nosePos = { x: width * 0.15, y: height * 0.35 };
  
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    
    if (!enabled) return;
    
    // Update animation phase
    phaseRef.current = (phaseRef.current + 0.03) % 1;
    const phase = phaseRef.current;
    
    // Check if neutral frame (side_00) and not playing
    const isNeutral = currentFrame === 0 && !isPlaying;
    
    // Log state for debugging
    console.log('[Airflow] enabled:', enabled, 'isPlaying:', isPlaying, 'phoneme:', phonemeSymbol, 'frame:', currentFrame);
    
    if (isNeutral) {
      // BREATHING MODE - only during neutral frame when not playing
      breathPhaseRef.current = (breathPhaseRef.current + 0.008) % 1;
      const bp = breathPhaseRef.current;
      
      // Inhale for first half, exhale for second half
      const isInhale = bp < 0.5;
      const breathProgress = isInhale ? bp / 0.5 : (bp - 0.5) / 0.5;
      
      drawBreathing(ctx, nosePos.x, nosePos.y, breathProgress, isInhale);
      
    } else if (isPlaying && phonemeSymbol) {
      // PHONEME-DRIVEN AIRFLOW
      const isRelease = isLastFrameOfPhoneme;
      const airflow = getAirflowConfig(phonemeSymbol, isRelease);
      
      // Draw oral airflow (if any)
      if (airflow.oral > 0) {
        drawOralAirflow(ctx, mouthPos.x, mouthPos.y, airflow.oral, airflow.turbulent, phase);
      }
      
      // Draw nasal airflow (for nasals only)
      if (airflow.nasal > 0) {
        drawNasalAirflow(ctx, nosePos.x, nosePos.y, airflow.nasal, phase);
      }
      
      // Draw burst (for plosives on release)
      if (airflow.burst) {
        drawBurst(ctx, mouthPos.x, mouthPos.y, airflow.oral, phase);
      }
    }
    
    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, [width, height, enabled, currentFrame, isPlaying, phonemeSymbol, isLastFrameOfPhoneme, mouthPos.x, mouthPos.y, nosePos.x, nosePos.y]);
  
  useEffect(() => {
    if (enabled) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [enabled, renderFrame]);
  
  if (!enabled) return null;
  
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
