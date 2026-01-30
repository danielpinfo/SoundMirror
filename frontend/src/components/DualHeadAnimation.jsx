import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { SPRITE_URLS, PHONEME_FRAME_MAP } from '../lib/constants';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

// Frame duration in milliseconds - slower for better visibility
const FRAME_DURATION = 300;

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

// Convert text to frame sequence with better phoneme mapping
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
      // Default vowel sound for unknown letters
      frames.push(1);
    }
    i++;
  }
  
  frames.push(0); // End with neutral
  return frames;
};

// Generate a demo sequence showing various mouth positions
const generateDemoSequence = (letter) => {
  // For single letters, show a more dramatic animation
  const phoneme = letter.toLowerCase();
  const mainFrame = PHONEME_FRAME_MAP[phoneme] || 1;
  
  // Create a sequence: neutral -> build up -> main phoneme -> hold -> release -> neutral
  return [0, 0, mainFrame, mainFrame, mainFrame, 0, 0];
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationRef = useRef(null);

  // Preload images on mount
  useEffect(() => {
    preloadImages();
    setImagesLoaded(true);
  }, []);

  // Update frame sequence when target changes
  useEffect(() => {
    if (target) {
      let sequence;
      if (target.length <= 2) {
        // For single letters or short digraphs, use demo sequence
        sequence = generateDemoSequence(target);
      } else {
        // For words, use text to frame conversion
        sequence = textToFrameSequence(target);
      }
      console.log('Frame sequence for', target, ':', sequence);
      setFrameSequence(sequence);
      setCurrentFrame(sequence[0]);
      setCurrentIndex(0);
    }
  }, [target]);

  // Animation loop using requestAnimationFrame for smoother animation
  const animate = useCallback(() => {
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < frameSequence.length) {
        setCurrentFrame(frameSequence[nextIndex]);
        animationRef.current = setTimeout(() => animate(), FRAME_DURATION);
        return nextIndex;
      } else {
        setIsPlaying(false);
        if (onAnimationComplete) onAnimationComplete();
        return prevIndex;
      }
    });
  }, [frameSequence, onAnimationComplete]);

  // Play control
  const play = useCallback(() => {
    if (isPlaying) return;
    
    // Reset to start
    setCurrentIndex(0);
    setCurrentFrame(frameSequence[0]);
    setIsPlaying(true);
    
    // Start animation after a small delay
    animationRef.current = setTimeout(() => animate(), FRAME_DURATION);
  }, [isPlaying, frameSequence, animate]);

  // Pause control
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Reset control
  const reset = useCallback(() => {
    pause();
    setCurrentIndex(0);
    setCurrentFrame(frameSequence[0] || 0);
  }, [pause, frameSequence]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play,
    pause,
    reset,
    togglePlay,
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
    if (isPlaying) return; // Don't allow slider during playback
    const frameIndex = Math.round((value[0] / 100) * (frameSequence.length - 1));
    setCurrentIndex(frameIndex);
    setCurrentFrame(frameSequence[frameIndex]);
  };

  const sliderValue = frameSequence.length > 1 
    ? [(currentIndex / (frameSequence.length - 1)) * 100] 
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
            className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg"
            data-testid="front-view-container"
          >
            <img
              src={SPRITE_URLS.front[currentFrame] || SPRITE_URLS.front[0]}
              alt={`Front view frame ${currentFrame}`}
              className="w-full h-full object-cover"
              style={{ transition: 'opacity 0.1s ease-in-out' }}
              data-testid="front-view-image"
            />
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
            Frame: {currentFrame}
          </div>
        </div>

        {/* Side View (Slave) */}
        <div className="relative">
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-slate-600/90 text-white text-xs font-semibold rounded">
            SIDE VIEW
          </div>
          <div 
            className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg"
            data-testid="side-view-container"
          >
            <img
              src={SPRITE_URLS.side[currentFrame] || SPRITE_URLS.side[0]}
              alt={`Side view frame ${currentFrame}`}
              className="w-full h-full object-cover"
              style={{ transition: 'opacity 0.1s ease-in-out' }}
              data-testid="side-view-image"
            />
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
            Frame: {currentFrame}
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
              className="rounded-full w-10 h-10 bg-white"
              data-testid="reset-animation-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
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
              <span className="text-xs text-slate-400 w-8">0</span>
              <Slider
                value={sliderValue}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                disabled={isPlaying}
                className="flex-1"
                data-testid="frame-scrubber"
              />
              <span className="text-xs text-slate-400 w-8 text-right">{frameSequence.length - 1}</span>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              Frame {currentIndex + 1} of {frameSequence.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

DualHeadAnimation.displayName = 'DualHeadAnimation';

export default DualHeadAnimation;
