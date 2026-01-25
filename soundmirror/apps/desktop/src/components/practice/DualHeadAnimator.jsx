/**
 * DualHeadAnimator - The Core Visualization Component
 * 
 * Renders synchronized Front (Master) and Side (Slave) sprite views.
 * Frame #5 of each 10-frame phoneme sequence is the articulation apex.
 * 
 * Animation flow:
 * - Frames 1-4: Ease-in to target mouth shape
 * - Frame 5: Hold/Peak position (the teaching moment)
 * - Frames 6-10: Ease-out transition to next phoneme
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Frame timing constants
const DEFAULT_FPS = 30;
const APEX_FRAME = 5; // The "teaching moment" frame
const FRAMES_PER_PHONEME = 10;

/**
 * Build sprite URL from frame index
 * Supports both local file:// paths (Tauri) and http:// paths (dev)
 */
function buildSpriteUrl(view, frameIndex, basePath = '/assets/sprites') {
  const paddedFrame = String(frameIndex).padStart(3, '0');
  return `${basePath}/${view}/frame_${paddedFrame}.png`;
}

/**
 * Easing function for smooth animation
 * Creates a slight hold at frame 5 (apex)
 */
function easeWithApex(progress, apexHold = 0.15) {
  // Slow down around the apex (40-60% of animation)
  if (progress > 0.4 && progress < 0.6) {
    return 0.4 + (progress - 0.4) * (1 - apexHold);
  }
  return progress;
}

export default function DualHeadAnimator({
  phonemeSequence = [], // Array of phoneme tokens
  isPlaying = false,
  playbackRate = 1.0,
  frameDuration = 100, // ms per frame (slower = more teaching time)
  onFrameChange = null,
  onPhonemeChange = null,
  onAnimationComplete = null,
  showLabels = true,
  maxWidth = 600,
  basePath = '/assets/sprites',
}) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const preloadedFrames = useRef({ front: new Map(), side: new Map() });

  // Normalize sequence input
  const sequence = Array.isArray(phonemeSequence) 
    ? phonemeSequence.filter(Boolean) 
    : (phonemeSequence ? [phonemeSequence] : ['neutral']);

  // Total frames across all phonemes
  const totalFrames = sequence.length * FRAMES_PER_PHONEME;

  // Current phoneme token
  const currentPhoneme = sequence[currentPhonemeIndex] || 'neutral';

  // Calculate which global frame index corresponds to front/side sprite
  // Your sprites are frame_000 to frame_249 (250 total)
  const globalFrameIndex = currentPhonemeIndex * FRAMES_PER_PHONEME + currentFrameIndex;
  
  // Map to actual sprite frame (0-249)
  const spriteFrameIndex = Math.min(globalFrameIndex, 249);

  // Sprite URLs
  const frontSrc = buildSpriteUrl('front', spriteFrameIndex, basePath);
  const sideSrc = buildSpriteUrl('side', spriteFrameIndex, basePath);

  // Preload sprites
  useEffect(() => {
    if (sequence.length === 0) return;

    setIsLoaded(false);
    setLoadProgress(0);

    const framesToLoad = Math.min(totalFrames, 250);
    let loaded = 0;

    const loadFrame = (view, index) => {
      return new Promise((resolve) => {
        const url = buildSpriteUrl(view, index, basePath);
        
        if (preloadedFrames.current[view].has(index)) {
          loaded++;
          setLoadProgress(Math.round((loaded / (framesToLoad * 2)) * 100));
          resolve();
          return;
        }

        const img = new Image();
        img.onload = () => {
          preloadedFrames.current[view].set(index, img);
          loaded++;
          setLoadProgress(Math.round((loaded / (framesToLoad * 2)) * 100));
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load: ${url}`);
          loaded++;
          setLoadProgress(Math.round((loaded / (framesToLoad * 2)) * 100));
          resolve();
        };
        img.src = url;
      });
    };

    const preloadAll = async () => {
      const promises = [];
      for (let i = 0; i < framesToLoad; i++) {
        promises.push(loadFrame('front', i));
        promises.push(loadFrame('side', i));
      }
      await Promise.all(promises);
      setIsLoaded(true);
    };

    preloadAll();
  }, [sequence.join(','), basePath, totalFrames]);

  // Animation loop
  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = (timestamp - startTimeRef.current) * playbackRate;
    const adjustedFrameDuration = frameDuration / playbackRate;
    
    // Calculate current position in animation
    const rawFramePosition = elapsed / adjustedFrameDuration;
    const framePosition = Math.floor(rawFramePosition);

    // Check completion
    if (framePosition >= totalFrames) {
      setCurrentFrameIndex(0);
      setCurrentPhonemeIndex(0);
      startTimeRef.current = null;
      
      if (onAnimationComplete) {
        onAnimationComplete();
      }
      return;
    }

    // Calculate phoneme and frame within phoneme
    const phonemeIndex = Math.floor(framePosition / FRAMES_PER_PHONEME);
    const frameInPhoneme = framePosition % FRAMES_PER_PHONEME;

    // Update state if changed
    if (phonemeIndex !== currentPhonemeIndex) {
      setCurrentPhonemeIndex(phonemeIndex);
      if (onPhonemeChange) {
        onPhonemeChange(phonemeIndex, sequence[phonemeIndex]);
      }
    }

    if (frameInPhoneme !== currentFrameIndex) {
      setCurrentFrameIndex(frameInPhoneme);
      if (onFrameChange) {
        onFrameChange(frameInPhoneme, frameInPhoneme === APEX_FRAME - 1);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [playbackRate, frameDuration, totalFrames, currentPhonemeIndex, currentFrameIndex, onAnimationComplete, onPhonemeChange, onFrameChange, sequence]);

  // Start/stop animation
  useEffect(() => {
    if (isPlaying && isLoaded) {
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isLoaded, animate]);

  // Reset when sequence changes
  useEffect(() => {
    setCurrentFrameIndex(0);
    setCurrentPhonemeIndex(0);
    startTimeRef.current = null;
  }, [sequence.join(',')]);

  const containerWidth = Math.min(maxWidth, 600);
  const spriteSize = (containerWidth - 24) / 2; // Gap of 24px

  // Is current frame the apex (teaching moment)?
  const isApexFrame = currentFrameIndex === APEX_FRAME - 1;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Loading state */}
      {!isLoaded && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-500 transition-all duration-200"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="text-sm text-slate-400">Loading sprites... {loadProgress}%</span>
        </div>
      )}

      {/* Dual Head Display */}
      {isLoaded && (
        <div 
          className="flex gap-6 justify-center"
          style={{ maxWidth: containerWidth }}
        >
          {/* Master Head (Front View) */}
          <div className="flex flex-col items-center gap-2">
            {showLabels && (
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Front View
              </div>
            )}
            <div 
              className={`
                sprite-container transition-all duration-150
                ${isApexFrame ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900' : ''}
              `}
              style={{ 
                width: spriteSize, 
                height: spriteSize,
                boxShadow: isApexFrame ? '0 0 30px rgba(56, 189, 248, 0.4)' : 'none'
              }}
              data-testid="sprite-front"
            >
              <img 
                src={frontSrc} 
                alt="Front articulation view"
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Apex indicator */}
              {isApexFrame && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-sky-500/90 rounded text-[10px] font-bold text-slate-900 uppercase">
                  Apex
                </div>
              )}
            </div>
          </div>

          {/* Slave Head (Side View) */}
          <div className="flex flex-col items-center gap-2">
            {showLabels && (
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Side View
              </div>
            )}
            <div 
              className={`
                sprite-container transition-all duration-150
                ${isApexFrame ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}
              `}
              style={{ 
                width: spriteSize, 
                height: spriteSize,
                boxShadow: isApexFrame ? '0 0 30px rgba(34, 211, 238, 0.4)' : 'none'
              }}
              data-testid="sprite-side"
            >
              <img 
                src={sideSrc} 
                alt="Side articulation view"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Current phoneme indicator */}
      {isLoaded && showLabels && (
        <div className="flex items-center gap-3 mt-2">
          <div className="text-sm text-slate-400">
            Phoneme: <span className="font-mono text-sky-400">{currentPhoneme}</span>
          </div>
          <div className="text-sm text-slate-400">
            Frame: <span className="font-mono text-cyan-400">{currentFrameIndex + 1}/{FRAMES_PER_PHONEME}</span>
          </div>
          {isApexFrame && (
            <span className="px-2 py-0.5 bg-sky-500/20 border border-sky-400/50 rounded text-xs text-sky-300 font-medium">
              Teaching Point
            </span>
          )}
        </div>
      )}
    </div>
  );
}
