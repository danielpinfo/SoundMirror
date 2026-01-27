/**
 * DualHeadAnimator - Enhanced Movie-quality Sprite Animation
 * 
 * Features:
 * - Smooth crossfade transitions between frames
 * - Cubic easing for natural movement
 * - Timeline scrubbing support
 * - Dual-view synchronization
 * - Frame blending with configurable duration
 * 
 * Architecture:
 * - Phoneme Engine: Converts text to viseme sequence
 * - Timeline Builder: Creates timed animation sequence
 * - Renderer: Handles sprite display and blending
 * - Controller: Manages playback state
 */

import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { 
  FRAME_WIDTH, 
  FRAME_HEIGHT, 
  TOTAL_FRAMES,
  FRAME_DURATION_MS,
  LETTER_PRACTICE_DELAY_MS,
  buildLetterTimeline,
  buildWordTimeline,
  getFrameInfo
} from '../../data/phonemeMap';

// Preload sprite sheets
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

preloadSheets();

// Easing functions for smooth transitions
const easings = {
  linear: t => t,
  easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: t => t * (2 - t),
  easeIn: t => t * t,
  // Smooth start and end for speech-like movement
  speech: t => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

/**
 * DualHeadAnimator Component
 * 
 * @param {Array} phonemeSequence - Array of phoneme tokens for word practice
 * @param {string} letter - Single letter for letter practice
 * @param {boolean} isPlaying - Controls animation playback
 * @param {number} playbackRate - Speed multiplier (0.25 to 2.0)
 * @param {function} onAnimationComplete - Callback when animation finishes
 * @param {function} onTimeUpdate - Callback with current time in ms
 * @param {function} onFrameChange - Callback when frame changes
 * @param {string} size - Display size: 'large', 'medium', 'small'
 * @param {boolean} showDebug - Show debug information
 * @param {number} seekTime - External seek position in ms (for scrubbing)
 * @param {number} blendDuration - Frame blend duration in ms (default: 80)
 */
const DualHeadAnimator = forwardRef(function DualHeadAnimator({ 
  phonemeSequence = [], 
  letter = null,
  isPlaying = false, 
  playbackRate = 1.0, 
  onAnimationComplete, 
  onTimeUpdate,
  onFrameChange,
  size = 'large',
  showDebug = true,
  seekTime = null,
  blendDuration = 80,
}, ref) {
  // State
  const [currentFrame, setCurrentFrame] = useState(0);
  const [prevFrame, setPrevFrame] = useState(0);
  const [blendProgress, setBlendProgress] = useState(0);
  const [currentPhoneme, setCurrentPhoneme] = useState('_');
  const [currentType, setCurrentType] = useState('neutral');
  const [sheetsReady, setSheetsReady] = useState(preloadedSheets.loaded);
  const [isDelaying, setIsDelaying] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  
  // Refs
  const animationRef = useRef(null);
  const delayTimeoutRef = useRef(null);
  const timelineRef = useRef([]);
  const totalDurationRef = useRef(0);
  const lastFrameChangeRef = useRef(0);
  const blendStartRef = useRef(0);

  // Build timeline when inputs change
  useEffect(() => {
    if (letter) {
      timelineRef.current = buildLetterTimeline(letter);
    } else if (Array.isArray(phonemeSequence) && phonemeSequence.length > 0) {
      const text = phonemeSequence.join(' ');
      timelineRef.current = buildWordTimeline(text);
    } else {
      timelineRef.current = [{ frame: 0, phoneme: '_', duration: 3, type: 'neutral' }];
    }
    
    // Calculate total duration in ms
    const totalFrames = timelineRef.current.reduce((sum, item) => sum + (item.duration || 1), 0);
    totalDurationRef.current = totalFrames * FRAME_DURATION_MS;
  }, [letter, phonemeSequence]);

  // Ensure sheets are loaded
  useEffect(() => {
    if (!sheetsReady) {
      preloadSheets().then(() => setSheetsReady(true));
    }
  }, [sheetsReady]);

  // Get timeline item at specific time
  const getTimelineItemAtTime = useCallback((timeMs) => {
    const timeline = timelineRef.current;
    const frameTime = FRAME_DURATION_MS / playbackRate;
    let elapsed = 0;
    
    for (const item of timeline) {
      const itemDuration = item.duration * frameTime;
      if (timeMs < elapsed + itemDuration) {
        return { item, progress: (timeMs - elapsed) / itemDuration };
      }
      elapsed += itemDuration;
    }
    
    return { item: timeline[timeline.length - 1], progress: 1 };
  }, [playbackRate]);

  // Seek to specific time (for scrubbing)
  const seekToTime = useCallback((timeMs) => {
    const { item } = getTimelineItemAtTime(timeMs);
    
    if (item.frame !== currentFrame) {
      setPrevFrame(currentFrame);
      setBlendProgress(0);
      blendStartRef.current = performance.now();
    }
    
    setCurrentFrame(item.frame);
    setCurrentPhoneme(item.phoneme);
    setCurrentType(item.type);
    setAnimationTime(timeMs);
    
    onFrameChange?.(item.frame);
  }, [currentFrame, getTimelineItemAtTime, onFrameChange]);

  // External seek via prop
  useEffect(() => {
    if (seekTime !== null && !isPlaying) {
      seekToTime(seekTime);
    }
  }, [seekTime, isPlaying, seekToTime]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    seekTo: seekToTime,
    getTimeline: () => timelineRef.current,
    getDuration: () => totalDurationRef.current,
    getCurrentTime: () => animationTime,
  }), [seekToTime, animationTime]);

  // Animation loop
  useEffect(() => {
    // Cleanup
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (!isPlaying || !sheetsReady) {
      if (!isPlaying) {
        setIsDelaying(false);
        // Don't reset frame when stopping - keep current position
      }
      return;
    }

    // For Letter Practice, add delay
    if (letter) {
      setIsDelaying(true);
      delayTimeoutRef.current = setTimeout(() => {
        setIsDelaying(false);
        startAnimation();
      }, LETTER_PRACTICE_DELAY_MS);
    } else {
      startAnimation();
    }

    function startAnimation() {
      const startTime = performance.now();
      const timeline = timelineRef.current;
      const frameTime = FRAME_DURATION_MS / playbackRate;
      const totalDuration = timeline.reduce((sum, item) => sum + (item.duration || 1), 0) * frameTime;
      
      let lastDisplayFrame = currentFrame;
      
      const animate = (timestamp) => {
        const elapsed = timestamp - startTime;
        
        if (elapsed >= totalDuration) {
          // Animation complete
          animationRef.current = null;
          setCurrentFrame(0);
          setPrevFrame(0);
          setBlendProgress(0);
          setCurrentPhoneme('_');
          setCurrentType('neutral');
          setAnimationTime(0);
          onAnimationComplete?.();
          return;
        }
        
        // Find current timeline position
        let accumulatedTime = 0;
        let currentItem = timeline[0];
        
        for (const item of timeline) {
          const itemDuration = item.duration * frameTime;
          if (elapsed < accumulatedTime + itemDuration) {
            currentItem = item;
            break;
          }
          accumulatedTime += itemDuration;
        }
        
        // Handle frame transition with blending
        if (currentItem.frame !== lastDisplayFrame) {
          setPrevFrame(lastDisplayFrame);
          setBlendProgress(0);
          blendStartRef.current = timestamp;
          lastDisplayFrame = currentItem.frame;
          lastFrameChangeRef.current = timestamp;
          onFrameChange?.(currentItem.frame);
        }
        
        // Update blend progress with easing
        const blendElapsed = timestamp - blendStartRef.current;
        if (blendElapsed < blendDuration) {
          const rawProgress = blendElapsed / blendDuration;
          const easedProgress = easings.easeOut(rawProgress);
          setBlendProgress(easedProgress);
        } else {
          setBlendProgress(1);
        }
        
        setCurrentFrame(currentItem.frame);
        setCurrentPhoneme(currentItem.phoneme);
        setCurrentType(currentItem.type);
        setAnimationTime(elapsed);
        
        onTimeUpdate?.(elapsed);
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, sheetsReady, letter, playbackRate, onAnimationComplete, onTimeUpdate, onFrameChange, blendDuration, currentFrame]);

  // Reset when inputs change
  useEffect(() => {
    setCurrentFrame(0);
    setPrevFrame(0);
    setBlendProgress(0);
    setCurrentPhoneme('_');
    setCurrentType('neutral');
    setAnimationTime(0);
  }, [letter, phonemeSequence]);

  // Size mappings
  const sizeMultipliers = { large: 0.38, medium: 0.30, small: 0.22 };
  const multiplier = sizeMultipliers[size] || sizeMultipliers.large;
  const displayWidth = Math.round(FRAME_WIDTH * multiplier);
  const displayHeight = Math.round(FRAME_HEIGHT * multiplier);
  
  const frameInfo = getFrameInfo(currentFrame);
  const isPause = currentType === 'pause';

  if (!sheetsReady) {
    return (
      <div className="flex flex-col items-center gap-3" data-testid="dual-head-animator">
        <div className="text-xs text-sky-400 animate-pulse">Loading sprites...</div>
      </div>
    );
  }

  // Render sprite layer with smooth blending
  const renderSpriteLayer = (view, frame, opacity = 1, zIndex = 1) => {
    const yOffset = frame * FRAME_HEIGHT * multiplier;
    return (
      <div
        key={`${view}-${frame}-${zIndex}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: displayWidth,
          height: displayHeight,
          backgroundImage: `url(/assets/sprites/${view}_master.png)`,
          backgroundPosition: `0 -${yOffset}px`,
          backgroundSize: `${displayWidth}px ${TOTAL_FRAMES * displayHeight}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'auto',
          opacity,
          zIndex,
          // Smooth transition for opacity changes
          transition: `opacity ${blendDuration}ms ease-out`,
        }}
      />
    );
  };

  // Calculate blend opacity using easing
  const blendOpacity = blendProgress < 1 ? 1 - blendProgress : 0;

  return (
    <div className="flex flex-col items-center gap-3" data-testid="dual-head-animator">
      <div className="flex gap-4 justify-center">
        {['front', 'side'].map((view) => (
          <div key={view} className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {view === 'front' ? 'Front View' : 'Side View'}
            </div>
            <div 
              className="relative overflow-hidden rounded-xl border-2 border-slate-600"
              style={{ 
                width: displayWidth, 
                height: displayHeight,
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
              data-testid={`animator-${view}`}
            >
              {/* Previous frame for crossfade blending */}
              {blendOpacity > 0.01 && prevFrame !== currentFrame && (
                renderSpriteLayer(view, prevFrame, blendOpacity, 1)
              )}
              {/* Current frame */}
              {renderSpriteLayer(view, currentFrame, 1, 2)}
              
              {/* Delay indicator */}
              {isDelaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                  <div className="text-white text-sm font-semibold animate-pulse">Ready...</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {showDebug && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-mono">
            /{currentPhoneme}/ 
          </span>
          <span className="text-emerald-400 font-mono">
            F{currentFrame}
          </span>
          <span className="text-slate-600">
            {frameInfo?.label || frameInfo?.name || 'neutral'}
          </span>
          {isPause && <span className="text-slate-500">⏸</span>}
        </div>
      )}
    </div>
  );
});

export default DualHeadAnimator;
