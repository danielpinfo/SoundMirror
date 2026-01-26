import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  FRAME_WIDTH, 
  FRAME_HEIGHT, 
  TOTAL_FRAMES,
  TARGET_FPS,
  FRAME_DURATION_MS,
  buildLetterTimeline,
  buildWordTimeline,
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
      img.onerror = () => resolve();
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
 * DualHeadAnimator - Movie-quality 30fps sprite animation
 * 
 * Modes:
 * - Letter mode: Shows full consonant + vowel pronunciation (e.g., B = "bah")
 * - Word mode: Smooth flow through each phoneme with transitions
 */
function DualHeadAnimator({ 
  phonemeSequence = [], 
  letter = null,  // For Letter Practice - single letter pronunciation
  isPlaying = false, 
  playbackRate = 1.0, 
  onAnimationComplete, 
  size = 'large',
  showDebug = true 
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentPhoneme, setCurrentPhoneme] = useState('_');
  const [currentType, setCurrentType] = useState('neutral');
  const [sheetsReady, setSheetsReady] = useState(preloadedSheets.loaded);
  
  const animationRef = useRef(null);
  const frameIndexRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  // Build timeline based on input type
  const timeline = useMemo(() => {
    if (letter) {
      // Letter Practice mode - full pronunciation
      return buildLetterTimeline(letter);
    } else if (Array.isArray(phonemeSequence) && phonemeSequence.length > 0) {
      // Word Practice mode
      const text = phonemeSequence.join('');
      return buildWordTimeline(text);
    }
    return [{ frame: 0, phoneme: '_', duration: 3, type: 'neutral' }];
  }, [letter, phonemeSequence]);

  // Calculate total animation duration in frames
  const totalFrameCount = useMemo(() => {
    return timeline.reduce((sum, item) => sum + (item.duration || 1), 0);
  }, [timeline]);

  // Ensure sheets are loaded
  useEffect(() => {
    if (!sheetsReady) {
      preloadSheets().then(() => setSheetsReady(true));
    }
  }, [sheetsReady]);

  // Animation loop using requestAnimationFrame at 30fps
  useEffect(() => {
    if (!isPlaying || !sheetsReady) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      frameIndexRef.current = 0;
      setCurrentFrame(0);
      setCurrentPhoneme('_');
      setCurrentType('neutral');
      return;
    }

    frameIndexRef.current = 0;
    lastFrameTimeRef.current = performance.now();
    
    const animate = (timestamp) => {
      const elapsed = timestamp - lastFrameTimeRef.current;
      const frameInterval = FRAME_DURATION_MS / playbackRate;
      
      // Only advance frame at target FPS
      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);
        frameIndexRef.current++;
        
        // Find current timeline position
        let accumulatedFrames = 0;
        let currentTimelineItem = timeline[0];
        
        for (const item of timeline) {
          if (frameIndexRef.current <= accumulatedFrames + item.duration) {
            currentTimelineItem = item;
            break;
          }
          accumulatedFrames += item.duration;
        }
        
        setCurrentFrame(currentTimelineItem.frame);
        setCurrentPhoneme(currentTimelineItem.phoneme);
        setCurrentType(currentTimelineItem.type);
        
        // Check if animation complete
        if (frameIndexRef.current >= totalFrameCount) {
          animationRef.current = null;
          frameIndexRef.current = 0;
          setCurrentFrame(0);
          setCurrentPhoneme('_');
          setCurrentType('neutral');
          onAnimationComplete?.();
          return;
        }
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
  }, [isPlaying, sheetsReady, timeline, totalFrameCount, playbackRate, onAnimationComplete]);

  // Calculate sprite position
  const yOffset = currentFrame * FRAME_HEIGHT;
  
  // Size mappings - maintain aspect ratio
  const sizeMultipliers = { large: 0.38, medium: 0.30, small: 0.22 };
  const multiplier = sizeMultipliers[size] || sizeMultipliers.large;
  const displayWidth = Math.round(FRAME_WIDTH * multiplier);
  const displayHeight = Math.round(FRAME_HEIGHT * multiplier);
  
  const frameInfo = getFrameInfo(currentFrame);
  const isApex = currentType === 'apex';

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
          <span className="text-slate-500 text-[10px]">
            {currentType}
          </span>
          {isApex && <span className="text-amber-400">★</span>}
        </div>
      )}
    </div>
  );
}

export default DualHeadAnimator;
