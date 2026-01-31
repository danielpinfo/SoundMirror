import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { SPRITE_URLS, PHONEME_FRAME_MAP } from '../lib/constants';
import { getLetterAudio, getWordAudio, playAudio } from '../lib/audio';
import { useLanguage } from '../context/LanguageContext';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

// Frame duration in milliseconds
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
  const frames = [0];
  const lowerText = text.toLowerCase();
  
  let i = 0;
  while (i < lowerText.length) {
    if (i + 1 < lowerText.length) {
      const digraph = lowerText.slice(i, i + 2);
      if (PHONEME_FRAME_MAP[digraph] !== undefined) {
        frames.push(PHONEME_FRAME_MAP[digraph]);
        i += 2;
        continue;
      }
    }
    
    const char = lowerText[i];
    if (char === ' ' || char === ',' || char === '.') {
      frames.push(0);
    } else if (PHONEME_FRAME_MAP[char] !== undefined) {
      frames.push(PHONEME_FRAME_MAP[char]);
    } else if (char.match(/[a-z]/)) {
      frames.push(1);
    }
    i++;
  }
  
  frames.push(0);
  return frames;
};

// Generate a demo sequence showing various mouth positions
const generateDemoSequence = (letter) => {
  const phoneme = letter.toLowerCase();
  const mainFrame = PHONEME_FRAME_MAP[phoneme] || 1;
  return [0, 0, mainFrame, mainFrame, mainFrame, 0, 0];
};

export const DualHeadAnimation = forwardRef(({ 
  target = '', 
  onAnimationComplete,
  showControls = true,
  autoPlay = false,
}, ref) => {
  const { language } = useLanguage();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameSequence, setFrameSequence] = useState([0]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioData, setAudioData] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const animationRef = useRef(null);
  const audioRef = useRef(null);

  // Preload images on mount
  useEffect(() => {
    preloadImages();
    setImagesLoaded(true);
  }, []);

  // Update frame sequence and fetch audio when target changes
  useEffect(() => {
    if (target) {
      let sequence;
      if (target.length <= 2) {
        sequence = generateDemoSequence(target);
      } else {
        sequence = textToFrameSequence(target);
      }
      setFrameSequence(sequence);
      setCurrentFrame(sequence[0]);
      setCurrentIndex(0);
      
      // Fetch audio data
      fetchAudioData(target);
    }
  }, [target, language]);

  // Fetch audio data from API
  const fetchAudioData = async (text) => {
    setIsLoadingAudio(true);
    try {
      if (text.length <= 2) {
        // Single letter - get letter audio
        const data = await getLetterAudio(text, language);
        setAudioData(data);
      } else {
        // Word - get word audio sequence
        const data = await getWordAudio(text, language);
        setAudioData(data);
      }
    } catch (error) {
      console.error('Error fetching audio:', error);
      setAudioData(null);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Play audio for single letter
  const playLetterAudio = useCallback(async () => {
    if (!audioEnabled || !audioData?.audio_url) return;
    
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioData.audio_url);
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [audioEnabled, audioData]);

  // Play audio sequence for word
  const playWordAudioSequence = useCallback(async (index) => {
    if (!audioEnabled || !audioData?.audio_sequence) return;
    
    const item = audioData.audio_sequence[index];
    if (item?.audio_url) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        audioRef.current = new Audio(item.audio_url);
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  }, [audioEnabled, audioData]);

  // Animation loop
  const animate = useCallback(() => {
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < frameSequence.length) {
        setCurrentFrame(frameSequence[nextIndex]);
        
        // Play audio for this frame (word mode)
        if (audioData?.audio_sequence && nextIndex < audioData.audio_sequence.length) {
          playWordAudioSequence(nextIndex);
        }
        
        animationRef.current = setTimeout(() => animate(), FRAME_DURATION);
        return nextIndex;
      } else {
        setIsPlaying(false);
        if (onAnimationComplete) onAnimationComplete();
        return prevIndex;
      }
    });
  }, [frameSequence, audioData, playWordAudioSequence, onAnimationComplete]);

  // Play control
  const play = useCallback(() => {
    if (isPlaying) return;
    
    setCurrentIndex(0);
    setCurrentFrame(frameSequence[0]);
    setIsPlaying(true);
    
    // Play audio for single letter
    if (target.length <= 2 && audioData?.audio_url) {
      playLetterAudio();
    }
    
    // Start animation after a delay (to sync with audio)
    animationRef.current = setTimeout(() => animate(), audioEnabled ? 500 : FRAME_DURATION);
  }, [isPlaying, frameSequence, target, audioData, audioEnabled, playLetterAudio, animate]);

  // Pause control
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
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

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
  }, []);

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
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Handle slider change
  const handleSliderChange = (value) => {
    if (isPlaying) return;
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
          {/* Play/Pause/Reset/Audio buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="rounded-full w-10 h-10 bg-white/10 border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
              data-testid="reset-animation-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
              disabled={isLoadingAudio}
              className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
              data-testid="play-pause-btn"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleAudio}
              className={`rounded-full w-10 h-10 border-blue-500/30 ${
                audioEnabled 
                  ? 'bg-blue-600/20 text-blue-300' 
                  : 'bg-white/10 text-blue-400/50'
              }`}
              data-testid="toggle-audio-btn"
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Audio status indicator */}
          {isLoadingAudio && (
            <p className="text-center text-xs text-blue-400">Loading audio...</p>
          )}
          {audioData && !isLoadingAudio && (
            <p className="text-center text-xs text-blue-400">
              {audioEnabled ? '🔊 Audio ready' : '🔇 Audio muted'}
            </p>
          )}

          {/* Frame scrubber */}
          <div className="px-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-blue-400 w-8">0</span>
              <Slider
                value={sliderValue}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                disabled={isPlaying}
                className="flex-1"
                data-testid="frame-scrubber"
              />
              <span className="text-xs text-blue-400 w-8 text-right">{frameSequence.length - 1}</span>
            </div>
            <p className="text-center text-xs text-blue-400 mt-2">
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
