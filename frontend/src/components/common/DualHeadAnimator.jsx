import React, { useState, useEffect, useRef } from 'react';
import { 
  FRAME_WIDTH, 
  FRAME_HEIGHT, 
  TOTAL_FRAMES,
  FRAME_DURATION_MS,
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

/**
 * DualHeadAnimator - Movie-quality 30fps sprite animation with frame blending
 * 
 * Uses dual-layer rendering for smooth transitions:
 * - Current frame layer (solid)
 * - Previous frame layer (fading out)
 * This creates visual interpolation between frames
 */
function DualHeadAnimator({ 
  phonemeSequence = [], 
  letter = null,
  isPlaying = false, 
  playbackRate = 1.0, 
  onAnimationComplete, 
  size = 'large',
  showDebug = true 
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [prevFrame, setPrevFrame] = useState(0);
  const [blendOpacity, setBlendOpacity] = useState(0);
  const [currentPhoneme, setCurrentPhoneme] = useState('_');
  const [currentType, setCurrentType] = useState('neutral');
  const [sheetsReady, setSheetsReady] = useState(preloadedSheets.loaded);
  
  const animationRef = useRef(null);
  const timelineRef = useRef([]);
  const totalFramesRef = useRef(0);

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
    totalFramesRef.current = timelineRef.current.reduce((sum, item) => sum + (item.duration || 1), 0);
  }, [letter, phonemeSequence]);

  useEffect(() => {
    if (!sheetsReady) {
      preloadSheets().then(() => setSheetsReady(true));
    }
  }, [sheetsReady]);

  // Animation loop with frame blending
  useEffect(() => {
    if (!isPlaying || !sheetsReady) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setCurrentFrame(0);
      setPrevFrame(0);
      setBlendOpacity(0);
      setCurrentPhoneme('_');
      setCurrentType('neutral');
      return;
    }

    let frameIndex = 0;
    let lastFrameTime = performance.now();
    let subFrameProgress = 0;
    const timeline = timelineRef.current;
    const totalFrameCount = totalFramesRef.current;
    let lastDisplayFrame = 0;
    
    const animate = (timestamp) => {
      const elapsed = timestamp - lastFrameTime;
      const frameInterval = FRAME_DURATION_MS / playbackRate;
      
      // Accumulate sub-frame progress for smoother blending
      subFrameProgress += elapsed / frameInterval;
      
      if (subFrameProgress >= 1) {
        subFrameProgress -= 1;
        lastFrameTime = timestamp;
        frameIndex++;
        
        // Find current timeline position
        let accumulatedFrames = 0;
        let currentTimelineItem = timeline[0];
        
        for (const item of timeline) {
          if (frameIndex <= accumulatedFrames + item.duration) {
            currentTimelineItem = item;
            break;
          }
          accumulatedFrames += item.duration;
        }
        
        // Handle frame change with blending
        if (currentTimelineItem.frame !== lastDisplayFrame) {
          setPrevFrame(lastDisplayFrame);
          setBlendOpacity(1); // Start fade
          lastDisplayFrame = currentTimelineItem.frame;
        }
        
        setCurrentFrame(currentTimelineItem.frame);
        setCurrentPhoneme(currentTimelineItem.phoneme);
        setCurrentType(currentTimelineItem.type);
        
        // Check completion
        if (frameIndex >= totalFrameCount) {
          animationRef.current = null;
          setCurrentFrame(0);
          setPrevFrame(0);
          setBlendOpacity(0);
          setCurrentPhoneme('_');
          setCurrentType('neutral');
          onAnimationComplete?.();
          return;
        }
      }
      
      // Fade out previous frame for smooth blending
      setBlendOpacity(prev => Math.max(0, prev - 0.15));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, sheetsReady, playbackRate, onAnimationComplete]);

  // Size mappings
  const sizeMultipliers = { large: 0.38, medium: 0.30, small: 0.22 };
  const multiplier = sizeMultipliers[size] || sizeMultipliers.large;
  const displayWidth = Math.round(FRAME_WIDTH * multiplier);
  const displayHeight = Math.round(FRAME_HEIGHT * multiplier);
  
  const frameInfo = getFrameInfo(currentFrame);
  const isApex = currentType === 'apex';
  const isPause = currentType === 'pause';

  if (!sheetsReady) {
    return (
      <div className="flex flex-col items-center gap-3" data-testid="dual-head-animator">
        <div className="text-xs text-sky-400 animate-pulse">Loading sprites...</div>
      </div>
    );
  }

  // Render a sprite layer
  const renderSpriteLayer = (view, frame, opacity = 1, zIndex = 1) => {
    const yOffset = frame * FRAME_HEIGHT * multiplier;
    return (
      <div
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
          transition: 'opacity 0.05s ease-out',
        }}
      />
    );
  };

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
                  : isPause
                    ? 'border-slate-500'
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
              {/* Previous frame (fading out for smooth blend) */}
              {blendOpacity > 0 && prevFrame !== currentFrame && (
                renderSpriteLayer(view, prevFrame, blendOpacity, 1)
              )}
              {/* Current frame */}
              {renderSpriteLayer(view, currentFrame, 1, 2)}
              
              {isApex && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-amber-500 rounded text-[9px] font-bold text-slate-900 uppercase shadow z-10">
                  ★
                </div>
              )}
              {isPause && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-slate-600 rounded text-[9px] font-bold text-slate-300 z-10">
                  ⏸
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
            {frameInfo.name}
          </span>
          <span className={`text-[10px] ${isPause ? 'text-slate-500' : 'text-slate-500'}`}>
            {currentType}
          </span>
          {isApex && <span className="text-amber-400">★</span>}
        </div>
      )}
    </div>
  );
}

export default DualHeadAnimator;
