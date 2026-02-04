import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { SPRITE_URLS, PHONEME_FRAME_MAP } from '../lib/constants';
import { getLetterAudio } from '../lib/audio';
import { useLanguage } from '../context/LanguageContext';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gauge } from 'lucide-react';

// Animation speed settings - frame duration in ms (NO TRANSITIONS)
const SPEED_SETTINGS = {
  slow: { frameDuration: 400, label: 'Slow' },
  normal: { frameDuration: 250, label: 'Normal' },
  fast: { frameDuration: 150, label: 'Fast' },
};
const DEFAULT_SPEED = 'slow';

// Letter to phoneme mapping
const LETTER_PHONEME_MAP = {
  'a': 'ah', 'b': 'ba', 'c': 'ca', 'd': 'da', 'e': 'eh', 'f': 'fa', 'g': 'ga',
  'h': 'ha', 'i': 'ee', 'j': 'ja', 'k': 'ka', 'l': 'la', 'm': 'ma', 'n': 'na',
  'o': 'oh', 'p': 'pa', 'q': 'ka', 'r': 'ra', 's': 'sa', 't': 'ta', 'u': 'oo',
  'v': 'va', 'w': 'wa', 'x': 'za', 'y': 'ya', 'z': 'za',
  'ch': 'cha', 'sh': 'sha', 'th': 'tha',
};

// Generate frame sequence using CLONING for duration (NO FADING)
const generatePhonemeSequence = (letter) => {
  const letterLower = letter.toLowerCase();
  const phoneme = LETTER_PHONEME_MAP[letterLower] || `${letterLower}a`;
  
  const frames = [];
  
  // Clone neutral frames for preparation (6 clones = ~2.4s at slow speed)
  for (let i = 0; i < 6; i++) frames.push(0);
  
  // Parse phoneme and clone each frame for extended display
  for (let i = 0; i < phoneme.length; i++) {
    const char = phoneme[i];
    const frame = PHONEME_FRAME_MAP[char];
    if (frame !== undefined) {
      // Clone frame 8 times for longer hold (~3.2s at slow speed)
      for (let j = 0; j < 8; j++) frames.push(frame);
    }
  }
  
  // Clone neutral frames to return (4 clones)
  for (let i = 0; i < 4; i++) frames.push(0);
  
  return frames;
};

// Convert text to frame sequence using CLONING (NO FADING)
const textToFrameSequence = (text) => {
  const frames = [];
  const lowerText = text.toLowerCase();
  
  // Start with cloned neutral frames
  for (let i = 0; i < 4; i++) frames.push(0);
  
  let idx = 0;
  while (idx < lowerText.length) {
    // Check for digraphs first
    if (idx + 1 < lowerText.length) {
      const digraph = lowerText.slice(idx, idx + 2);
      if (PHONEME_FRAME_MAP[digraph] !== undefined) {
        const frame = PHONEME_FRAME_MAP[digraph];
        // Clone frame 5 times for visibility
        for (let j = 0; j < 5; j++) frames.push(frame);
        idx += 2;
        continue;
      }
    }
    
    const char = lowerText[idx];
    if (char === ' ' || char === ',' || char === '.') {
      // Clone neutral for pauses
      for (let j = 0; j < 3; j++) frames.push(0);
    } else if (PHONEME_FRAME_MAP[char] !== undefined) {
      const frame = PHONEME_FRAME_MAP[char];
      // Clone frame 4 times for each character
      for (let j = 0; j < 4; j++) frames.push(frame);
    } else if (char.match(/[a-z]/)) {
      // Unknown letters - use slight opening
      for (let j = 0; j < 3; j++) frames.push(1);
    }
    idx++;
  }
  
  // End with cloned neutral
  for (let i = 0; i < 4; i++) frames.push(0);
  
  return frames;
};

export const DualHeadAnimation = forwardRef(({ 
  target = '', 
  mode = 'letter',
  onAnimationComplete,
  showControls = true,
  autoPlay = false,
  hideViewLabels = false,
}, ref) => {
  const { language } = useLanguage();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameSequence, setFrameSequence] = useState([0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [phonemeDisplay, setPhonemeDisplay] = useState('');
  const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_SPEED);
  const animationRef = useRef(null);
  const audioRef = useRef(null);

  // Get current speed settings
  const speedSettings = SPEED_SETTINGS[animationSpeed];

  // Update frame sequence when target changes
  useEffect(() => {
    if (target) {
      if (mode === 'letter') {
        const sequence = generatePhonemeSequence(target);
        setFrameSequence(sequence);
        setCurrentFrame(sequence[0]);
        setCurrentIndex(0);
        
        const letterLower = target.toLowerCase();
        const phoneme = LETTER_PHONEME_MAP[letterLower] || `${letterLower}a`;
        setPhonemeDisplay(phoneme);
        
        fetchLetterAudio(target);
      } else {
        const sequence = textToFrameSequence(target);
        setFrameSequence(sequence);
        setCurrentFrame(sequence[0]);
        setCurrentIndex(0);
        setPhonemeDisplay(target);
        setAudioUrl(null);
      }
    }
  }, [target, mode, language]);

  // Fetch letter audio
  const fetchLetterAudio = async (letter) => {
    setIsLoadingAudio(true);
    try {
      const url = await getLetterAudio(letter, language);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error fetching audio:', error);
      setAudioUrl(null);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Play audio
  const playAudio = useCallback(() => {
    if (audioUrl && audioEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  }, [audioUrl, audioEnabled]);

  // Play TTS for word mode
  const playTTS = useCallback(() => {
    if (!audioEnabled || mode !== 'word' || !target) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(target);
      const rateMap = { slow: 0.4, normal: 0.6, fast: 0.8 };
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

  // Animation loop - simple frame stepping (NO FADING)
  const animate = useCallback(() => {
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < frameSequence.length) {
        setCurrentFrame(frameSequence[nextIndex]);
        animationRef.current = setTimeout(() => animate(), speedSettings.frameDuration);
        return nextIndex;
      } else {
        setIsPlaying(false);
        // Auto-reset to beginning
        setCurrentIndex(0);
        setCurrentFrame(frameSequence[0] || 0);
        if (onAnimationComplete) onAnimationComplete();
        return 0;
      }
    });
  }, [frameSequence, onAnimationComplete, speedSettings.frameDuration]);

  // Play
  const play = useCallback(() => {
    if (isPlaying) return;
    
    setCurrentIndex(0);
    setCurrentFrame(frameSequence[0] || 0);
    setIsPlaying(true);
    
    if (mode === 'letter') {
      playAudio();
    } else {
      playTTS();
    }
    
    animationRef.current = setTimeout(() => animate(), speedSettings.frameDuration);
  }, [isPlaying, frameSequence, mode, playAudio, playTTS, animate, speedSettings.frameDuration]);

  // Pause
  const pause = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsPlaying(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Reset
  const reset = useCallback(() => {
    pause();
    setCurrentIndex(0);
    setCurrentFrame(frameSequence[0] || 0);
  }, [pause, frameSequence]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
  }, []);

  // Cycle speed
  const cycleSpeed = useCallback(() => {
    const speeds = ['slow', 'normal', 'fast'];
    const currentIdx = speeds.indexOf(animationSpeed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    setAnimationSpeed(speeds[nextIdx]);
  }, [animationSpeed]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play,
    pause,
    reset,
    togglePlay,
    isPlaying,
    getCurrentFrame: () => currentFrame,
    setSpeed: setAnimationSpeed,
    getSpeed: () => animationSpeed,
  }));

  // Auto-play
  useEffect(() => {
    if (autoPlay && target && frameSequence.length > 1 && !isPlaying) {
      const timer = setTimeout(() => play(), 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, target, frameSequence.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
      if (audioRef.current) audioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Slider change
  const handleSliderChange = (value) => {
    if (isPlaying) return;
    const frameIndex = Math.round((value[0] / 100) * (frameSequence.length - 1));
    setCurrentIndex(frameIndex);
    setCurrentFrame(frameSequence[frameIndex] || 0);
  };

  const sliderValue = frameSequence.length > 1 
    ? [(currentIndex / (frameSequence.length - 1)) * 100] 
    : [0];

  return (
    <div data-testid="dual-head-animation" className="w-full">
      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      {/* Phoneme Display */}
      {phonemeDisplay && (
        <div className="text-center mb-4">
          <span className="text-sm text-blue-400 uppercase tracking-wider">
            {mode === 'letter' ? 'Phoneme: ' : 'Word: '}
          </span>
          <span className="text-2xl font-bold text-white ml-2">{phonemeDisplay}</span>
        </div>
      )}

      {/* Dual Head Display - NO FADING, just show/hide */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Front View */}
        <div className="relative">
          {!hideViewLabels && (
            <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-sky-600/90 text-white text-xs font-semibold rounded">
              FRONT VIEW
            </div>
          )}
          <div 
            className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg"
            data-testid="front-view-container"
          >
            {/* Show ONLY the current frame - no stacking, no opacity transitions */}
            <img
              src={SPRITE_URLS.front[currentFrame] || SPRITE_URLS.front[0]}
              alt={`Front view frame ${currentFrame}`}
              className="w-full h-full object-cover"
              data-testid="front-view-image"
            />
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
            Frame: {currentFrame}
          </div>
        </div>

        {/* Side View */}
        <div className="relative">
          {!hideViewLabels && (
            <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-slate-600/90 text-white text-xs font-semibold rounded">
              SIDE VIEW
            </div>
          )}
          <div 
            className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg"
            data-testid="side-view-container"
          >
            {/* Show ONLY the current frame - no stacking, no opacity transitions */}
            <img
              src={SPRITE_URLS.side[currentFrame] || SPRITE_URLS.side[0]}
              alt={`Side view frame ${currentFrame}`}
              className="w-full h-full object-cover"
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
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="rounded-full w-10 h-10 bg-white/10 border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
              data-testid="reset-animation-btn"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
              disabled={isLoadingAudio && mode === 'letter'}
              className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
              data-testid="play-pause-btn"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={cycleSpeed}
              className={`rounded-full px-3 h-10 border-blue-500/30 text-blue-300 hover:bg-blue-600/20 ${
                animationSpeed === 'slow' ? 'bg-green-600/20 border-green-500/50' : 
                animationSpeed === 'fast' ? 'bg-orange-600/20 border-orange-500/50' : 
                'bg-white/10'
              }`}
              data-testid="speed-control-btn"
              title="Change speed"
            >
              <Gauge className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">{SPEED_SETTINGS[animationSpeed].label}</span>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleAudio}
              className={`rounded-full w-10 h-10 border-blue-500/30 ${
                audioEnabled ? 'bg-blue-600/20 text-blue-300' : 'bg-white/10 text-blue-400/50'
              }`}
              data-testid="toggle-audio-btn"
              title={audioEnabled ? 'Mute' : 'Unmute'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>

          {/* Status */}
          <div className="flex justify-center gap-4 text-xs">
            <span className="text-blue-400">
              {mode === 'letter' 
                ? (isLoadingAudio ? 'Loading...' : audioUrl ? 'Audio ready' : 'No audio')
                : (audioEnabled ? 'TTS enabled' : 'Audio muted')}
            </span>
            <span className="text-blue-400/70">|</span>
            <span className="text-blue-400">Speed: {SPEED_SETTINGS[animationSpeed].label}</span>
          </div>

          {/* Scrubber */}
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
