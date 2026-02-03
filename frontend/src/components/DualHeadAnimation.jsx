import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { SPRITE_URLS, PHONEME_FRAME_MAP } from '../lib/constants';
import { getLetterAudio } from '../lib/audio';
import { useLanguage } from '../context/LanguageContext';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gauge } from 'lucide-react';

// Animation speed settings - MUCH SLOWER for visual learning
const SPEED_SETTINGS = {
  slow: { frameDuration: 600, transitionDuration: 200, label: 'Slow' },
  normal: { frameDuration: 400, transitionDuration: 150, label: 'Normal' },
  fast: { frameDuration: 200, transitionDuration: 100, label: 'Fast' },
};
const DEFAULT_SPEED = 'slow';
const FRAME_DURATION = SPEED_SETTINGS[DEFAULT_SPEED].frameDuration;
const TRANSITION_DURATION = SPEED_SETTINGS[DEFAULT_SPEED].transitionDuration;

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

// Letter to phoneme mapping (what sound each letter makes)
const LETTER_PHONEME_MAP = {
  'a': 'ah', 'b': 'ba', 'c': 'ca', 'd': 'da', 'e': 'eh', 'f': 'fa', 'g': 'ga',
  'h': 'ha', 'i': 'ee', 'j': 'ja', 'k': 'ka', 'l': 'la', 'm': 'ma', 'n': 'na',
  'o': 'oh', 'p': 'pa', 'q': 'ka', 'r': 'ra', 's': 'sa', 't': 'ta', 'u': 'oo',
  'v': 'va', 'w': 'wa', 'x': 'za', 'y': 'ya', 'z': 'za',
  'ch': 'cha', 'sh': 'sha', 'th': 'tha',
};

// Generate frame sequence for a phoneme with extended hold times for learning
// Each phoneme position is held for multiple "beats" so users can see the mouth shape
const generatePhonemeSequence = (letter) => {
  const letterLower = letter.toLowerCase();
  const phoneme = LETTER_PHONEME_MAP[letterLower] || `${letterLower}a`;
  
  const frames = [];
  
  // Extended neutral start - helps user prepare
  frames.push({ frame: 0, type: 'prepare', duration: 1.5 });
  
  // Parse phoneme into individual sounds and create extended holds
  for (let i = 0; i < phoneme.length; i++) {
    const char = phoneme[i];
    const frame = PHONEME_FRAME_MAP[char];
    if (frame !== undefined) {
      // Transition IN to the phoneme position
      frames.push({ frame, type: 'transition-in', duration: 0.5 });
      // HOLD the position - this is the key learning moment
      frames.push({ frame, type: 'hold', duration: 2.0 });
      // Brief transition out before next sound
      frames.push({ frame, type: 'transition-out', duration: 0.3 });
    }
  }
  
  // Return to neutral with smooth transition
  frames.push({ frame: 0, type: 'return', duration: 1.0 });
  
  return frames;
};

// Convert text to frame sequence for words (TTS mode) - with extended holds for visual learning
const textToFrameSequence = (text) => {
  const frames = [];
  const lowerText = text.toLowerCase();
  
  // Start with extended neutral - user gets ready
  frames.push({ frame: 0, type: 'prepare', duration: 1.2 });
  
  let i = 0;
  while (i < lowerText.length) {
    // Check for digraphs first (ch, sh, th, etc.)
    if (i + 1 < lowerText.length) {
      const digraph = lowerText.slice(i, i + 2);
      if (PHONEME_FRAME_MAP[digraph] !== undefined) {
        const frame = PHONEME_FRAME_MAP[digraph];
        // Transition, hold, transition pattern for each sound
        frames.push({ frame, type: 'transition-in', duration: 0.3 });
        frames.push({ frame, type: 'hold', duration: 1.2 }); // Longer hold for visibility
        frames.push({ frame, type: 'transition-out', duration: 0.2 });
        i += 2;
        continue;
      }
    }
    
    const char = lowerText[i];
    if (char === ' ') {
      // Word break - longer neutral pause
      frames.push({ frame: 0, type: 'word-break', duration: 0.8 });
    } else if (char === ',' || char === '.') {
      // Punctuation - sentence pause
      frames.push({ frame: 0, type: 'pause', duration: 1.0 });
    } else if (PHONEME_FRAME_MAP[char] !== undefined) {
      const frame = PHONEME_FRAME_MAP[char];
      // Each character gets transition-hold-transition
      frames.push({ frame, type: 'transition-in', duration: 0.25 });
      frames.push({ frame, type: 'hold', duration: 0.9 }); // Main visual hold
      frames.push({ frame, type: 'transition-out', duration: 0.15 });
    } else if (char.match(/[a-z]/)) {
      // Unknown letters default to slight mouth opening
      frames.push({ frame: 1, type: 'transition-in', duration: 0.25 });
      frames.push({ frame: 1, type: 'hold', duration: 0.7 });
      frames.push({ frame: 1, type: 'transition-out', duration: 0.15 });
    }
    i++;
  }
  
  // End with neutral
  frames.push({ frame: 0, type: 'end', duration: 1.0 });
  
  return frames;
};

export const DualHeadAnimation = forwardRef(({ 
  target = '', 
  mode = 'letter', // 'letter' for Letter Practice (S3 audio), 'word' for Word Practice (TTS)
  onAnimationComplete,
  showControls = true,
  autoPlay = false,
}, ref) => {
  const { language } = useLanguage();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameSequence, setFrameSequence] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [phonemeDisplay, setPhonemeDisplay] = useState('');
  const [currentStepInfo, setCurrentStepInfo] = useState({ type: '', duration: 0 });
  const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_SPEED);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);

  // Get current speed settings
  const speedSettings = SPEED_SETTINGS[animationSpeed];

  // Preload images on mount
  useEffect(() => {
    preloadImages();
    setImagesLoaded(true);
  }, []);

  // Update frame sequence and fetch audio when target changes
  useEffect(() => {
    if (target) {
      if (mode === 'letter') {
        const sequence = generatePhonemeSequence(target);
        setFrameSequence(sequence);
        setCurrentFrame(sequence[0]?.frame || 0);
        setCurrentIndex(0);
        setCurrentStepInfo(sequence[0] || { type: 'prepare', duration: 1 });
        
        const letterLower = target.toLowerCase();
        const phoneme = LETTER_PHONEME_MAP[letterLower] || `${letterLower}a`;
        setPhonemeDisplay(phoneme);
        
        fetchLetterAudio(target);
      } else {
        const sequence = textToFrameSequence(target);
        setFrameSequence(sequence);
        setCurrentFrame(sequence[0]?.frame || 0);
        setCurrentIndex(0);
        setCurrentStepInfo(sequence[0] || { type: 'prepare', duration: 1 });
        setPhonemeDisplay(target);
        setAudioUrl(null);
      }
    }
  }, [target, mode, language]);

  // Fetch S3 audio for letter
  const fetchLetterAudio = async (letter) => {
    setIsLoadingAudio(true);
    try {
      const data = await getLetterAudio(letter, language);
      if (data?.audio_url) {
        setAudioUrl(data.audio_url);
        // Preload the audio
        const audio = new Audio(data.audio_url);
        audio.preload = 'auto';
      }
    } catch (error) {
      console.error('Error fetching letter audio:', error);
      setAudioUrl(null);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Play S3 audio
  const playAudio = useCallback(() => {
    if (!audioEnabled || !audioUrl) return;
    
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play().catch(e => console.error('Audio play error:', e));
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [audioEnabled, audioUrl]);

  // Play TTS for word mode - with slower rate matching animation
  const playTTS = useCallback(() => {
    if (!audioEnabled || mode !== 'word' || !target) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(target);
      // Adjust TTS rate based on animation speed
      const rateMap = { slow: 0.35, normal: 0.5, fast: 0.7 };
      utterance.rate = rateMap[animationSpeed] || 0.5;
      utterance.pitch = 1;
      
      const langMap = {
        'english': 'en-US', 'spanish': 'es-ES', 'italian': 'it-IT',
        'portuguese': 'pt-BR', 'german': 'de-DE', 'french': 'fr-FR',
        'japanese': 'ja-JP', 'chinese': 'zh-CN', 'hindi': 'hi-IN', 'arabic': 'ar-SA'
      };
      utterance.lang = langMap[language] || 'en-US';
      
      window.speechSynthesis.speak(utterance);
    }
  }, [audioEnabled, mode, target, language, animationSpeed]);

  // NEW: Animation loop with timed frames
  const animate = useCallback(() => {
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < frameSequence.length) {
        const nextStep = frameSequence[nextIndex];
        setCurrentFrame(nextStep.frame);
        setCurrentStepInfo(nextStep);
        
        // Calculate duration based on step duration multiplied by speed factor
        const baseDuration = nextStep.duration * speedSettings.frameDuration;
        setProgress((nextIndex / (frameSequence.length - 1)) * 100);
        
        animationRef.current = setTimeout(() => animate(), baseDuration);
        return nextIndex;
      } else {
        setIsPlaying(false);
        setProgress(100);
        if (onAnimationComplete) onAnimationComplete();
        return prevIndex;
      }
    });
  }, [frameSequence, onAnimationComplete, speedSettings.frameDuration]);

  // Play control - updated
  const play = useCallback(() => {
    if (isPlaying) return;
    
    setCurrentIndex(0);
    setProgress(0);
    if (frameSequence.length > 0) {
      setCurrentFrame(frameSequence[0].frame);
      setCurrentStepInfo(frameSequence[0]);
    }
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    
    // Play audio based on mode
    if (mode === 'letter') {
      playAudio();
    } else {
      playTTS();
    }
    
    // Start animation after brief pause
    const firstDuration = frameSequence[0]?.duration * speedSettings.frameDuration || 500;
    animationRef.current = setTimeout(() => animate(), firstDuration);
  }, [isPlaying, frameSequence, mode, playAudio, playTTS, animate, speedSettings.frameDuration]);

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
    if (mode === 'word' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [mode]);

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
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
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
      {/* Phoneme Display */}
      {phonemeDisplay && (
        <div className="text-center mb-4">
          <span className="text-sm text-blue-400 uppercase tracking-wider">
            {mode === 'letter' ? 'Phoneme: ' : 'Word: '}
          </span>
          <span className="text-2xl font-bold text-white ml-2">{phonemeDisplay}</span>
        </div>
      )}

      {/* Dual Head Display */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Front View (Master) */}
        <div className="relative">
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-sky-600/90 text-white text-xs font-semibold rounded">
            FRONT VIEW
          </div>
          <div 
            className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg relative"
            data-testid="front-view-container"
          >
            {/* Render all frames and crossfade between them */}
            {Object.entries(SPRITE_URLS.front).map(([frame, url]) => (
              <img
                key={`front-${frame}`}
                src={url}
                alt={`Front view frame ${frame}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ 
                  opacity: parseInt(frame) === currentFrame ? 1 : 0,
                  transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
                  zIndex: parseInt(frame) === currentFrame ? 1 : 0,
                }}
                data-testid={parseInt(frame) === currentFrame ? "front-view-image" : undefined}
              />
            ))}
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
            className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg relative"
            data-testid="side-view-container"
          >
            {/* Render all frames and crossfade between them */}
            {Object.entries(SPRITE_URLS.side).map(([frame, url]) => (
              <img
                key={`side-${frame}`}
                src={url}
                alt={`Side view frame ${frame}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ 
                  opacity: parseInt(frame) === currentFrame ? 1 : 0,
                  transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
                  zIndex: parseInt(frame) === currentFrame ? 1 : 0,
                }}
                data-testid={parseInt(frame) === currentFrame ? "side-view-image" : undefined}
              />
            ))}
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
              disabled={isLoadingAudio && mode === 'letter'}
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
          {mode === 'letter' && (
            <p className="text-center text-xs text-blue-400">
              {isLoadingAudio ? 'Loading audio...' : 
               audioUrl ? (audioEnabled ? '🔊 S3 Audio ready' : '🔇 Audio muted') : 
               '⚠️ No audio available'}
            </p>
          )}
          {mode === 'word' && (
            <p className="text-center text-xs text-blue-400">
              {audioEnabled ? '🔊 TTS enabled' : '🔇 Audio muted'}
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
