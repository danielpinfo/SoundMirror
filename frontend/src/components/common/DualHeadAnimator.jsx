import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  FRAME_SIZE, 
  FRAMES_PER_SHEET, 
  FRAMES_PER_PHONEME,
  textToPhonemes, 
  getPhonemeBaseFrame,
  getSheetForFrame,
  getFramePositionInSheet
} from '../../data/phonemeMap';

// Preload all sprite sheets once globally
const preloadedSheets = { front: [], side: [], loaded: false };

const preloadAllSheets = () => {
  if (preloadedSheets.loaded) return Promise.resolve();
  
  const promises = [];
  for (let i = 0; i < 5; i++) {
    ['front', 'side'].forEach(view => {
      const img = new Image();
      const promise = new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Still resolve on error to not block
      });
      img.src = `/assets/sprites/${view}_sheet_${i}.jpg`;
      preloadedSheets[view][i] = img;
      promises.push(promise);
    });
  }
  
  return Promise.all(promises).then(() => {
    preloadedSheets.loaded = true;
  });
};

// Start preloading immediately when module loads
preloadAllSheets();

/**
 * DualHeadAnimator - Clinical-grade sprite animation component
 * 
 * Animation algorithm:
 * - Each phoneme has 10 frames (0-9), with frame 5 being the "sweet spot"
 * - Animation ramps: neutral → approach (0-4) → sweet spot (5) → depart (6-9) → neutral
 * - Uses requestAnimationFrame for smooth, jitter-free animation
 */
function DualHeadAnimator({ 
  phonemeSequence = [], 
  isPlaying = false, 
  playbackRate = 1.0, 
  onAnimationComplete, 
  size = 'large',
  showDebug = true 
}) {
  const [currentFrame, setCurrentFrame] = useState(5); // Start at neutral sweet spot
  const [currentPhoneme, setCurrentPhoneme] = useState('_');
  const [isApex, setIsApex] = useState(false);
  const [sheetsReady, setSheetsReady] = useState(preloadedSheets.loaded);
  
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Convert input to phoneme array
  const phonemes = useMemo(() => {
    if (!Array.isArray(phonemeSequence) || phonemeSequence.length === 0) {
      return ['a'];
    }
    // If it's an array of strings (like words), convert each
    if (typeof phonemeSequence[0] === 'string') {
      return phonemeSequence.flatMap(item => textToPhonemes(item));
    }
    return phonemeSequence;
  }, [phonemeSequence]);

  // Ensure sheets are loaded
  useEffect(() => {
    if (!sheetsReady) {
      preloadAllSheets().then(() => setSheetsReady(true));
    }
  }, [sheetsReady]);

  // Animation timing constants
  const PHONEME_DURATION_MS = 200 / playbackRate; // ~200ms per phoneme at 1x speed
  const FRAME_DURATION_MS = PHONEME_DURATION_MS / FRAMES_PER_PHONEME;
  
  // Total animation duration
  const totalDuration = useMemo(() => {
    return phonemes.length * PHONEME_DURATION_MS + PHONEME_DURATION_MS; // Extra for return to neutral
  }, [phonemes.length, PHONEME_DURATION_MS]);

  // Calculate frame for a given timestamp
  const calculateFrame = useCallback((elapsedMs) => {
    const totalPhonemes = phonemes.length;
    const animationLength = totalPhonemes * PHONEME_DURATION_MS;
    
    // Return to neutral phase
    if (elapsedMs >= animationLength) {
      const returnProgress = (elapsedMs - animationLength) / PHONEME_DURATION_MS;
      if (returnProgress >= 1) {
        return { frame: 5, phoneme: '_', isApex: false, done: true };
      }
      // Smoothly return to neutral (frame 5)
      const lastPhoneme = phonemes[totalPhonemes - 1] || '_';
      const lastBase = getPhonemeBaseFrame(lastPhoneme);
      const lastSweetSpot = lastBase + 5;
      
      // Interpolate from last sweet spot back to neutral sweet spot (5)
      const localFrame = Math.floor(returnProgress * FRAMES_PER_PHONEME);
      const frame = localFrame < 5 ? lastSweetSpot - localFrame : 5;
      return { frame: Math.max(5, frame), phoneme: '_', isApex: false, done: false };
    }
    
    // Which phoneme are we on?
    const phonemeIndex = Math.floor(elapsedMs / PHONEME_DURATION_MS);
    const phoneme = phonemes[Math.min(phonemeIndex, totalPhonemes - 1)] || '_';
    const baseFrame = getPhonemeBaseFrame(phoneme);
    
    // Progress within this phoneme (0-1)
    const phonemeProgress = (elapsedMs % PHONEME_DURATION_MS) / PHONEME_DURATION_MS;
    
    // Local frame within the 10-frame sequence (0-9)
    // Use smooth interpolation: 0→1→2→3→4→5→6→7→8→9
    const localFrame = Math.floor(phonemeProgress * FRAMES_PER_PHONEME);
    const clampedLocal = Math.min(localFrame, 9);
    
    // Calculate actual sprite frame
    const frame = baseFrame + clampedLocal;
    
    // Is this the sweet spot? (frame 5 of the sequence, or localFrame 4-6)
    const atApex = clampedLocal >= 4 && clampedLocal <= 6;
    
    return { frame, phoneme, isApex: atApex, done: false };
  }, [phonemes, PHONEME_DURATION_MS]);

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !sheetsReady) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Reset to neutral when not playing
      setCurrentFrame(5);
      setCurrentPhoneme('_');
      setIsApex(false);
      return;
    }

    startTimeRef.current = performance.now();
    
    const animate = (timestamp) => {
      const elapsed = timestamp - startTimeRef.current;
      const result = calculateFrame(elapsed);
      
      setCurrentFrame(result.frame);
      setCurrentPhoneme(result.phoneme);
      setIsApex(result.isApex);
      
      if (result.done) {
        animationRef.current = null;
        setCurrentFrame(5);
        setCurrentPhoneme('_');
        setIsApex(false);
        onAnimationComplete?.();
        return;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, sheetsReady, calculateFrame, onAnimationComplete]);

  // Calculate sprite sheet positioning
  const sheetIndex = getSheetForFrame(currentFrame);
  const frameInSheet = getFramePositionInSheet(currentFrame);
  
  // Size mappings
  const spriteSize = size === 'large' ? 300 : size === 'medium' ? 240 : 180;
  const yOffset = (frameInSheet * spriteSize);

  if (!sheetsReady) {
    return (
      <div className="flex flex-col items-center gap-3" data-testid="dual-head-animator">
        <div className="text-xs text-sky-400 animate-pulse">Loading sprites...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3" data-testid="dual-head-animator">
      <div className="flex gap-4 justify-center">
        {['front', 'side'].map((view) => (
          <div key={view} className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {view === 'front' ? 'Front View' : 'Side View'}
            </div>
            <div 
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-75 ${
                isApex 
                  ? 'border-amber-400 ring-2 ring-amber-400/40' 
                  : 'border-slate-600'
              }`}
              style={{ 
                width: spriteSize, 
                height: spriteSize,
                backgroundColor: '#ffffff',
                boxShadow: isApex 
                  ? '0 0 25px rgba(251, 191, 36, 0.5)' 
                  : '0 4px 15px rgba(0,0,0,0.3)'
              }}
              data-testid={`animator-${view}`}
            >
              <div
                style={{
                  width: spriteSize,
                  height: spriteSize,
                  backgroundImage: `url(/assets/sprites/${view}_sheet_${sheetIndex}.jpg)`,
                  backgroundPosition: `0 -${yOffset}px`,
                  backgroundSize: `${spriteSize}px ${FRAMES_PER_SHEET * spriteSize}px`,
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'auto'
                }}
              />
              {isApex && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-amber-500 rounded text-[9px] font-bold text-slate-900 uppercase shadow">
                  ★
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {showDebug && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            /{currentPhoneme}/ 
          </span>
          <span className="text-emerald-400 font-mono">
            F{currentFrame}
          </span>
          <span className="text-slate-600">
            (sheet {sheetIndex}, pos {frameInSheet})
          </span>
          {isApex && <span className="text-amber-400">★ sweet spot</span>}
        </div>
      )}
    </div>
  );
}

export default DualHeadAnimator;
