import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { SPRITE_URLS, PHONEME_FRAME_MAP, FRAME_DURATION } from '../lib/constants';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

// Preload images
const preloadImages = () => {
  const images = { front: {}, side: {} };
  
  Object.entries(SPRITE_URLS.front).forEach(([frame, url]) => {
    const img = new Image();
    img.src = url;
    images.front[frame] = img;
  });
  
  Object.entries(SPRITE_URLS.side).forEach(([frame, url]) => {
    const img = new Image();
    img.src = url;
    images.side[frame] = img;
  });
  
  return images;
};

// Convert text to frame sequence
const textToFrameSequence = (text) => {
  const frames = [0]; // Start with neutral
  const lowerText = text.toLowerCase();
  
  let i = 0;
  while (i < lowerText.length) {
    // Check for digraphs first (2 characters)
    if (i + 1 < lowerText.length) {
      const digraph = lowerText.slice(i, i + 2);
      if (PHONEME_FRAME_MAP[digraph] !== undefined) {
        frames.push(PHONEME_FRAME_MAP[digraph]);
        i += 2;
        continue;
      }
    }
    
    // Single character
    const char = lowerText[i];
    if (char === ' ' || char === ',' || char === '.') {
      frames.push(0); // Pause for spaces/punctuation
    } else if (PHONEME_FRAME_MAP[char] !== undefined) {
      frames.push(PHONEME_FRAME_MAP[char]);
    } else if (char.match(/[a-z]/)) {
      // Default for unknown letters
      frames.push(1);
    }
    i++;
  }
  
  frames.push(0); // End with neutral
  return frames;
};

export const DualHeadAnimation = forwardRef(({ 
  target = '', 
  onAnimationComplete,
  showControls = true,
  autoPlay = false,
}, ref) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameSequence, setFrameSequence] = useState([0]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const animationRef = useRef(null);
  const frameIndexRef = useRef(0);

  // Preload images on mount
  useEffect(() => {
    preloadImages();
    setImagesLoaded(true);
  }, []);

  // Update frame sequence when target changes
  useEffect(() => {
    if (target) {
      const sequence = textToFrameSequence(target);
      setFrameSequence(sequence);
      setCurrentFrame(0);
      frameIndexRef.current = 0;
    }
  }, [target]);

  // Animation loop
  const animate = useCallback(() => {
    if (frameIndexRef.current < frameSequence.length - 1) {
      frameIndexRef.current += 1;
      setCurrentFrame(frameSequence[frameIndexRef.current]);
      animationRef.current = setTimeout(animate, FRAME_DURATION);
    } else {
      setIsPlaying(false);
      if (onAnimationComplete) onAnimationComplete();
    }
  }, [frameSequence, onAnimationComplete]);

  // Play/Pause control
  const play = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    frameIndexRef.current = 0;
    setCurrentFrame(frameSequence[0]);
    animationRef.current = setTimeout(animate, FRAME_DURATION);
  }, [isPlaying, frameSequence, animate]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    frameIndexRef.current = 0;
    setCurrentFrame(0);
  }, [pause]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play,
    pause,
    reset,
    isPlaying,
    getCurrentFrame: () => currentFrame,
  }));

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay && target && imagesLoaded) {
      const timer = setTimeout(play, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, target, imagesLoaded, play]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Handle slider change
  const handleSliderChange = (value) => {
    const frameIndex = Math.round((value[0] / 100) * (frameSequence.length - 1));
    frameIndexRef.current = frameIndex;
    setCurrentFrame(frameSequence[frameIndex]);
  };

  const sliderValue = frameSequence.length > 1 
    ? [(frameIndexRef.current / (frameSequence.length - 1)) * 100] 
    : [0];

  return (
    <div data-testid="dual-head-animation" className="w-full">
      {/* Dual Head Display */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Front View (Master) */}
        <div className="relative">
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-sky-600/90 text-white text-xs font-semibold rounded">
            FRONT VIEW
          </div>
          <div 
            className="aspect-square bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl overflow-hidden border border-slate-200 shadow-lg"
            data-testid="front-view-container"
          >
            <img
              src={SPRITE_URLS.front[currentFrame] || SPRITE_URLS.front[0]}
              alt={`Front view frame ${currentFrame}`}
              className="w-full h-full object-cover frame-animate"
              data-testid="front-view-image"
            />
          </div>
        </div>

        {/* Side View (Slave) */}
        <div className="relative">
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-slate-600/90 text-white text-xs font-semibold rounded">
            SIDE VIEW
          </div>
          <div 
            className="aspect-square bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl overflow-hidden border border-slate-200 shadow-lg"
            data-testid="side-view-container"
          >
            <img
              src={SPRITE_URLS.side[currentFrame] || SPRITE_URLS.side[0]}
              alt={`Side view frame ${currentFrame}`}
              className="w-full h-full object-cover frame-animate"
              data-testid="side-view-image"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="mt-6 space-y-4">
          {/* Play/Pause/Reset buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="rounded-full w-10 h-10"
              data-testid="reset-animation-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={isPlaying ? pause : play}
              className="rounded-full w-14 h-14 bg-sky-600 hover:bg-sky-700 text-white shadow-lg"
              data-testid="play-pause-btn"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            
            <div className="w-10" /> {/* Spacer for symmetry */}
          </div>

          {/* Frame scrubber */}
          <div className="px-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 w-8">0</span>
              <Slider
                value={sliderValue}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                disabled={isPlaying}
                className="flex-1"
                data-testid="frame-scrubber"
              />
              <span className="text-xs text-slate-500 w-8 text-right">{frameSequence.length - 1}</span>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              Frame {frameIndexRef.current + 1} of {frameSequence.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

DualHeadAnimation.displayName = 'DualHeadAnimation';

export default DualHeadAnimation;
