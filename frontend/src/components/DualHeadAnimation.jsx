import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { SPRITE_URLS, PHONEME_FRAME_MAP } from '../lib/constants';
import { getLetterAudio } from '../lib/audio';
import { useLanguage } from '../context/LanguageContext';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

// Frame duration in milliseconds - faster for smoother animation
const FRAME_DURATION = 150; // Reduced from 250ms for smoother playback
const TRANSITION_DURATION = 100; // CSS transition time in ms

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

// Generate frame sequence for a phoneme (e.g., "ba" -> [0, b_frame, a_frame, 0])
const generatePhonemeSequence = (letter) => {
  const letterLower = letter.toLowerCase();
  const phoneme = LETTER_PHONEME_MAP[letterLower] || `${letterLower}a`;
  
  const frames = [0]; // Start neutral
  
  // Parse phoneme into individual sounds and get frames
  for (let i = 0; i < phoneme.length; i++) {
    const char = phoneme[i];
    const frame = PHONEME_FRAME_MAP[char];
    if (frame !== undefined) {
      // Add frame multiple times for longer display
      frames.push(frame);
      frames.push(frame);
    }
  }
  
  frames.push(0); // End neutral
  return frames;
};

// Convert text to frame sequence for words (TTS mode) - with frame cloning for slower animation
const textToFrameSequence = (text) => {
  const frames = [0, 0]; // Start with neutral (doubled)
  const lowerText = text.toLowerCase();
  
  let i = 0;
  while (i < lowerText.length) {
    if (i + 1 < lowerText.length) {
      const digraph = lowerText.slice(i, i + 2);
      if (PHONEME_FRAME_MAP[digraph] !== undefined) {
        const frame = PHONEME_FRAME_MAP[digraph];
        // Clone frame 3 times for longer display
        frames.push(frame, frame, frame);
        i += 2;
        continue;
      }
    }
    
    const char = lowerText[i];
    if (char === ' ' || char === ',' || char === '.') {
      // Longer pause for spaces/punctuation
      frames.push(0, 0, 0);
    } else if (PHONEME_FRAME_MAP[char] !== undefined) {
      const frame = PHONEME_FRAME_MAP[char];
      // Clone frame 3 times for longer display
      frames.push(frame, frame, frame);
    } else if (char.match(/[a-z]/)) {
      // Default frame cloned
      frames.push(1, 1, 1);
    }
    i++;
  }
  
  frames.push(0, 0); // End with neutral (doubled)
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
  const [frameSequence, setFrameSequence] = useState([0]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [phonemeDisplay, setPhonemeDisplay] = useState('');
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
      if (mode === 'letter') {
        // Letter Practice mode - use S3 audio and phoneme animation
        const sequence = generatePhonemeSequence(target);
        setFrameSequence(sequence);
        setCurrentFrame(sequence[0]);
        setCurrentIndex(0);
        
        // Set phoneme display
        const letterLower = target.toLowerCase();
        const phoneme = LETTER_PHONEME_MAP[letterLower] || `${letterLower}a`;
        setPhonemeDisplay(phoneme);
        
        // Fetch S3 audio
        fetchLetterAudio(target);
      } else {
        // Word Practice mode - use TTS and text-based animation
        const sequence = textToFrameSequence(target);
        setFrameSequence(sequence);
        setCurrentFrame(sequence[0]);
        setCurrentIndex(0);
        setPhonemeDisplay(target);
        setAudioUrl(null); // TTS will be handled separately
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

  // Play TTS for word mode
  const playTTS = useCallback(() => {
    if (!audioEnabled || mode !== 'word' || !target) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(target);
      utterance.rate = 0.5; // Slower rate for clearer pronunciation
      utterance.pitch = 1;
      
      // Try to match language
      const langMap = {
        'english': 'en-US', 'spanish': 'es-ES', 'italian': 'it-IT',
        'portuguese': 'pt-BR', 'german': 'de-DE', 'french': 'fr-FR',
        'japanese': 'ja-JP', 'chinese': 'zh-CN', 'hindi': 'hi-IN', 'arabic': 'ar-SA'
      };
      utterance.lang = langMap[language] || 'en-US';
      
      window.speechSynthesis.speak(utterance);
    }
  }, [audioEnabled, mode, target, language]);

  // Animation loop
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
    
    setCurrentIndex(0);
    setCurrentFrame(frameSequence[0]);
    setIsPlaying(true);
    
    // Play audio based on mode
    if (mode === 'letter') {
      playAudio();
    } else {
      playTTS();
    }
    
    // Start animation with delay to sync with audio
    animationRef.current = setTimeout(() => animate(), 300);
  }, [isPlaying, frameSequence, mode, playAudio, playTTS, animate]);

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
