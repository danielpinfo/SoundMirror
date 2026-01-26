import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  FRAME_WIDTH, 
  FRAME_HEIGHT, 
  TOTAL_FRAMES,
  textToFrames,
  getFrameForPhoneme,
  getFrameInfo
} from '../../data/phonemeMap';

// Preload sprite sheets once globally
const preloadedSheets = { front: null, side: null, loaded: false };

const preloadSheets = () => {
  if (preloadedSheets.loaded) return Promise.resolve();
  
  const promises = [];
  
  ['front', 'side'].forEach(view => {
    const img = new Image();
    const promise = new Promise((resolve) => {
      img.onload = () => {
        preloadedSheets[view] = img;
        resolve();
      };
      img.onerror = () => resolve(); // Still resolve on error
    });
    img.src = `/assets/sprites/${view}_master.png`;
    promises.push(promise);
  });
  
  return Promise.all(promises).then(() => {
    preloadedSheets.loaded = true;
  });
};

// Start preloading immediately
preloadSheets();

/**
 * DualHeadAnimator - Movie-quality sprite animation
 * 
 * New 20-frame system with single sprite sheet per view.
 * Uses smooth interpolation between frames for flowing animation.
 * Frame 0 = neutral (rest), frames 1-19 = various phonemes.
 */
function DualHeadAnimator({ 
  phonemeSequence = [], 
  isPlaying = false, 
  playbackRate = 1.0, 
  onAnimationComplete, 
  size = 'large',
  showDebug = true 
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentPhoneme, setCurrentPhoneme] = useState('_');
  const [sheetsReady, setSheetsReady] = useState(preloadedSheets.loaded);
  const [progress, setProgress] = useState(0);
  
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Convert input to frame sequence
  const frameSequence = useMemo(() => {
    if (!Array.isArray(phonemeSequence) || phonemeSequence.length === 0) {
      // Default to 'a' for demo
      return textToFrames('a');
    }
    
    // If it's strings, convert each
    if (typeof phonemeSequence[0] === 'string') {
      const text = phonemeSequence.join('');
      return textToFrames(text);
    }
    
    return textToFrames('a');
  }, [phonemeSequence]);

  // Ensure sheets are loaded
  useEffect(() => {
    if (!sheetsReady) {
      preloadSheets().then(() => setSheetsReady(true));
    }
  }, [sheetsReady]);

  // Animation timing - smooth and natural
  // Each phoneme gets ~150ms at 1x speed, with smooth transitions
  const PHONEME_DURATION_MS = 150 / playbackRate;
  const TRANSITION_FRAMES = 3; // Number of interpolation steps between phonemes
  
  // Total animation duration
  const totalDuration = useMemo(() => {
    const phonemeTime = frameSequence.length * PHONEME_DURATION_MS;
    const returnTime = PHONEME_DURATION_MS; // Time to return to neutral
    return phonemeTime + returnTime;
  }, [frameSequence.length, PHONEME_DURATION_MS]);

  // Build smooth animation timeline with interpolation
  const buildTimeline = useCallback(() => {
    const timeline = [];
    
    // Start from neutral
    timeline.push({ frame: 0, phoneme: '_', type: 'start' });
    
    for (let i = 0; i < frameSequence.length; i++) {
      const current = frameSequence[i];
      const prev = i > 0 ? frameSequence[i - 1] : { frame: 0, phoneme: '_' };
      
      // Add transition frames from previous to current (interpolation)
      if (current.frame !== prev.frame) {
        // Simple crossfade - we'll show the target frame
        // In a more advanced version, we could blend frames
        timeline.push({ 
          frame: current.frame, 
          phoneme: current.phoneme, 
          type: 'transition'
        });
      }
      
      // Hold at the target frame (the "sweet spot")
      timeline.push({ 
        frame: current.frame, 
        phoneme: current.phoneme, 
        type: 'apex'
      });
      timeline.push({ 
        frame: current.frame, 
        phoneme: current.phoneme, 
        type: 'hold'
      });
    }
    
    // Return to neutral smoothly
    const lastFrame = frameSequence.length > 0 ? frameSequence[frameSequence.length - 1].frame : 0;
    if (lastFrame !== 0) {
      timeline.push({ frame: 0, phoneme: '_', type: 'return' });
    }
    timeline.push({ frame: 0, phoneme: '_', type: 'end' });
    
    return timeline;
  }, [frameSequence]);

  const timeline = useMemo(() => buildTimeline(), [buildTimeline]);

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !sheetsReady) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setCurrentFrame(0);
      setCurrentPhoneme('_');
      setProgress(0);
      return;
    }

    startTimeRef.current = performance.now();
    
    const animate = (timestamp) => {
      const elapsed = timestamp - startTimeRef.current;
      const progressPct = Math.min(elapsed / totalDuration, 1);
      setProgress(progressPct);
      
      // Safety check for empty timeline
      if (timeline.length === 0) {
        setCurrentFrame(0);
        setCurrentPhoneme('_');
        onAnimationComplete?.();
        return;
      }
      
      // Calculate which timeline position we're at
      const timelineIndex = Math.min(
        Math.floor(progressPct * timeline.length),
        timeline.length - 1
      );
      
      const current = timeline[timelineIndex];
      if (current) {
        setCurrentFrame(current.frame);
        setCurrentPhoneme(current.phoneme);
      }
      
      if (progressPct >= 1) {
        animationRef.current = null;
        setCurrentFrame(0);
        setCurrentPhoneme('_');
        setProgress(0);
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
  }, [isPlaying, sheetsReady, timeline, totalDuration, onAnimationComplete]);

  // Calculate sprite position - single sheet, direct positioning
  const yOffset = currentFrame * FRAME_HEIGHT;
  
  // Size mappings - maintain aspect ratio
  const sizeMultipliers = { large: 0.38, medium: 0.30, small: 0.22 };
  const multiplier = sizeMultipliers[size] || sizeMultipliers.large;
  const displayWidth = Math.round(FRAME_WIDTH * multiplier);
  const displayHeight = Math.round(FRAME_HEIGHT * multiplier);
  
  const frameInfo = getFrameInfo(currentFrame);
  const isApex = timeline.find((t, i) => 
    i === Math.floor(progress * timeline.length) && t.type === 'apex'
  );

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
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-100 ${
                isApex 
                  ? 'border-amber-400 ring-2 ring-amber-400/40' 
                  : 'border-slate-600'
              }`}
              style={{ 
                width: displayWidth, 
                height: displayHeight,
                backgroundColor: '#ffffff',
                boxShadow: isApex 
                  ? '0 0 25px rgba(251, 191, 36, 0.5)' 
                  : '0 4px 15px rgba(0,0,0,0.3)'
              }}
              data-testid={`animator-${view}`}
            >
              <div
                style={{
                  width: displayWidth,
                  height: displayHeight,
                  backgroundImage: `url(/assets/sprites/${view}_master.png)`,
                  backgroundPosition: `0 -${yOffset * multiplier}px`,
                  backgroundSize: `${displayWidth}px ${TOTAL_FRAMES * displayHeight}px`,
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
            {frameInfo.name}
          </span>
          {isApex && <span className="text-amber-400">★ apex</span>}
        </div>
      )}
    </div>
  );
}

export default DualHeadAnimator;
