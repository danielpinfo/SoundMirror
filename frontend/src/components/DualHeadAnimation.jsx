import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { SPRITE_URLS, getFrameForPhoneme } from '../lib/constants';
import { transliterateLetter, transliterate } from '../lib/phonemeRules';
import { analyzePhonemes, toAnimationSequence } from '../lib/phonemeAnalysis';
import { getLetterAudio } from '../lib/audio';
import { useLanguage } from '../context/LanguageContext';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gauge } from 'lucide-react';

/**
 * PHONEME-FIRST ARCHITECTURE
 * 
 * Animation is driven by phoneme analysis, NOT audio.
 * Audio (TTS/MP3) is reference-only - plays alongside but does not control timing.
 * 
 * Pipeline:
 *   Text + Language → analyzePhonemes() → toAnimationSequence() → Frame Animation
 *                                      ↘ Audio plays as reference only
 */

// Animation speed settings - controls ANIMATION ONLY, not audio
const SPEED_SETTINGS = {
  slow: { frameDuration: 400, speedMultiplier: 0.5, label: 'Slow' },
  normal: { frameDuration: 250, speedMultiplier: 1.0, label: 'Normal' },
  fast: { frameDuration: 150, speedMultiplier: 1.5, label: 'Fast' },
  fastest: { frameDuration: 80, speedMultiplier: 2.5, label: 'Fastest' },
};
const DEFAULT_SPEED = 'fast';

// Letter to phoneme mapping (for letter practice mode)
const LETTER_PHONEME_MAP = {
  'a': 'ah', 'b': 'ba', 'c': 'ca', 'd': 'da', 'e': 'eh', 'f': 'fa', 'g': 'ga',
  'h': 'ha', 'i': 'ee', 'j': 'ja', 'k': 'ka', 'l': 'la', 'm': 'ma', 'n': 'na',
  'o': 'oh', 'p': 'pa', 'q': 'ka', 'r': 'ra', 's': 'sa', 't': 'ta', 'u': 'oo',
  'v': 'va', 'w': 'wa', 'x': 'za', 'y': 'ya', 'z': 'za',
  'ch': 'cha', 'sh': 'sha', 'th': 'tha',
};

// Special character combinations that should be treated as single sounds
// These are processed BEFORE regular character handling
const SPECIAL_COMBINATIONS = {
  // Double letters - animate as single
  'll': 'l',
  'ss': 's',
  'tt': 't',
  'ff': 'f',
  'pp': 'p',
  'bb': 'b',
  'dd': 'd',
  'gg': 'g',
  'mm': 'm',
  'nn': 'n',
  'rr': 'r',
  'cc': 'k',
  'zz': 'z',
  // Digraphs (two letters = one sound)
  'ch': 'ch',
  'sh': 'sh',
  'th': 'th',
  'ph': 'f',
  'wh': 'w',
  'ck': 'k',
  'ng': 'n',
  'qu': 'kw',
  // Silent letter combinations
  'ght': 't',
  'kn': 'n',
  'wr': 'r',
  'gn': 'n',
  'mb': 'm',
  // Vowel combinations
  'ee': 'ee',
  'oo': 'oo',
  'ea': 'ee',
  'ai': 'eh',
  'ay': 'eh',
  'oa': 'oh',
  'ou': 'ow',
  'ow': 'oh',
  'ie': 'ee',
  'ey': 'eh',
};

// Convert text to phonetic representation using comprehensive language rules
const textToPhonetic = (text, language) => {
  // Use the comprehensive language-specific phoneme parser
  return parseWordWithRules(text, language);
};

// Generate frame sequence using CLONING for duration
// Uses UNIVERSAL VISEME FALLBACK SYSTEM - always animates, never fails
const generatePhonemeSequence = (letter) => {
  const letterLower = letter.toLowerCase();
  const phoneme = LETTER_PHONEME_MAP[letterLower] || `${letterLower}a`;
  
  const frames = [];
  
  // Clone neutral frames for preparation
  for (let i = 0; i < 6; i++) frames.push(0);
  
  // Parse phoneme and clone each frame using VISEME RESOLUTION
  for (let i = 0; i < phoneme.length; i++) {
    const char = phoneme[i];
    // Use getFrameForPhoneme for MANDATORY viseme fallback
    const frame = getFrameForPhoneme(char);
    for (let j = 0; j < 8; j++) frames.push(frame);
  }
  
  // Clone neutral frames to return
  for (let i = 0; i < 4; i++) frames.push(0);
  
  return frames;
};

// Convert text to frame sequence with special character handling
// CRITICAL: Uses UNIVERSAL VISEME FALLBACK SYSTEM
// Pipeline: Text → Transliteration → Phoneme Parsing → Viseme Resolution → PNG Frames
const textToFrameSequence = (text, language) => {
  // Transliterate native scripts BEFORE processing
  const transliteratedText = transliterate(text, language);
  console.log(`[textToFrameSequence] "${text}" → "${transliteratedText}" (${language})`);
  
  const frames = [];
  
  // Start with cloned neutral frames
  for (let i = 0; i < 4; i++) frames.push(0);
  
  // Parse transliterated text into phonemes using comprehensive rules
  const phonemes = parseWordWithRules(transliteratedText, language);
  console.log(`[textToFrameSequence] Phonemes:`, phonemes);
  
  // Clone frames for each phoneme using MANDATORY VISEME RESOLUTION
  for (const phoneme of phonemes) {
    // Use getFrameForPhoneme for UNIVERSAL VISEME FALLBACK - NEVER fails
    const frame = getFrameForPhoneme(phoneme);
    // Clone frame 6 times for proper duration
    for (let j = 0; j < 6; j++) {
      frames.push(frame);
    }
  }
  
  // End with cloned neutral frames
  for (let i = 0; i < 6; i++) frames.push(0);
  
  return frames.length > 10 ? frames : [0];
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
  const [phoneticDisplay, setPhoneticDisplay] = useState('');
  const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_SPEED);
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);

  const speedSettings = SPEED_SETTINGS[animationSpeed];

  // Update frame sequence when target changes
  useEffect(() => {
    stopAnimation();
    
    if (target) {
      let sequence;
      if (mode === 'letter') {
        sequence = generatePhonemeSequence(target);
        const letterLower = target.toLowerCase();
        const phoneme = LETTER_PHONEME_MAP[letterLower] || `${letterLower}a`;
        setPhonemeDisplay(target.toUpperCase());
        setPhoneticDisplay(phoneme);
        fetchLetterAudio(target);
      } else {
        sequence = textToFrameSequence(target, language);
        setPhonemeDisplay(target);
        
        // For non-Latin scripts, show romanized version
        const transliteratedText = transliterate(target, language);
        if (transliteratedText !== target) {
          setPhoneticDisplay(transliteratedText);
        } else {
          setPhoneticDisplay(parseWordWithRules(target, language).join('-'));
        }
        
        setAudioUrl(null);
      }
      setFrameSequence(sequence);
      setCurrentFrame(sequence[0] || 0);
      setCurrentIndex(0);
    }
  }, [target, mode, language]);

  // Stop animation helper
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  // Fetch letter audio
  const fetchLetterAudio = async (letter) => {
    setIsLoadingAudio(true);
    try {
      // Transliterate non-Latin letters to romanized form for audio
      const romanizedLetter = transliterateLetter(letter, language);
      console.log(`[Audio] Letter: ${letter} → Romanized: ${romanizedLetter} (${language})`);
      const url = await getLetterAudio(romanizedLetter, language);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error fetching audio:', error);
      setAudioUrl(null);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Play audio - ALWAYS at slow speed regardless of animation speed
  const playAudio = useCallback(() => {
    if (audioUrl && audioEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = 1.0; // Always normal audio speed
      audioRef.current.play().catch(console.error);
    }
  }, [audioUrl, audioEnabled]);

  // Play TTS - ALWAYS at slow speed regardless of animation speed
  const playTTS = useCallback(() => {
    if (!audioEnabled || mode !== 'word' || !target) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(target);
      utterance.rate = 0.4; // ALWAYS slow for audio, regardless of animation speed
      utterance.pitch = 1;
      
      const langMap = {
        'english': 'en-US', 'spanish': 'es-ES', 'italian': 'it-IT',
        'portuguese': 'pt-BR', 'german': 'de-DE', 'french': 'fr-FR',
        'japanese': 'ja-JP', 'chinese': 'zh-CN', 'hindi': 'hi-IN', 'arabic': 'ar-SA'
      };
      utterance.lang = langMap[language] || 'en-US';
      
      window.speechSynthesis.speak(utterance);
    }
  }, [audioEnabled, mode, target, language]);

  // Run animation step
  const runAnimationStep = useCallback((index, sequence, duration) => {
    if (!isPlayingRef.current) return;
    
    if (index < sequence.length) {
      setCurrentIndex(index);
      setCurrentFrame(sequence[index]);
      
      animationRef.current = setTimeout(() => {
        runAnimationStep(index + 1, sequence, duration);
      }, duration);
    } else {
      stopAnimation();
      setCurrentIndex(0);
      setCurrentFrame(sequence[0] || 0);
      if (onAnimationComplete) onAnimationComplete();
    }
  }, [onAnimationComplete, stopAnimation]);

  // Play
  const play = useCallback(() => {
    if (isPlayingRef.current) return;
    
    stopAnimation();
    
    isPlayingRef.current = true;
    setIsPlaying(true);
    setCurrentIndex(0);
    setCurrentFrame(frameSequence[0] || 0);
    
    if (mode === 'letter') {
      playAudio();
    } else {
      playTTS();
    }
    
    animationRef.current = setTimeout(() => {
      runAnimationStep(1, frameSequence, speedSettings.frameDuration);
    }, speedSettings.frameDuration);
  }, [frameSequence, mode, playAudio, playTTS, runAnimationStep, speedSettings.frameDuration, stopAnimation]);

  // Pause
  const pause = useCallback(() => {
    stopAnimation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [stopAnimation]);

  // Reset
  const reset = useCallback(() => {
    stopAnimation();
    setCurrentIndex(0);
    setCurrentFrame(frameSequence[0] || 0);
  }, [stopAnimation, frameSequence]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
  }, []);

  // Cycle speed - controls ANIMATION ONLY
  const cycleSpeed = useCallback(() => {
    const speeds = ['slow', 'normal', 'fast', 'fastest'];
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
    isPlaying: () => isPlayingRef.current,
    getCurrentFrame: () => currentFrame,
    setSpeed: setAnimationSpeed,
    getSpeed: () => animationSpeed,
  }));

  // Auto-play
  useEffect(() => {
    if (autoPlay && target && frameSequence.length > 1 && !isPlayingRef.current) {
      const timer = setTimeout(() => play(), 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, target, frameSequence.length, play]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
      if (audioRef.current) audioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [stopAnimation]);

  // Slider change
  const handleSliderChange = (value) => {
    if (isPlayingRef.current) return;
    const frameIndex = Math.round((value[0] / 100) * (frameSequence.length - 1));
    setCurrentIndex(frameIndex);
    setCurrentFrame(frameSequence[frameIndex] || 0);
  };

  const sliderValue = frameSequence.length > 1 
    ? [(currentIndex / (frameSequence.length - 1)) * 100] 
    : [0];

  return (
    <div data-testid="dual-head-animation" className="w-full">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      {/* Word/Phrase Display with Phonetic */}
      {phonemeDisplay && (
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div>
              <span className="text-xs text-blue-400 uppercase tracking-wider block mb-1">
                {mode === 'letter' ? 'Letter' : 'Word/Phrase'}
              </span>
              <span className="text-2xl font-bold text-white">{phonemeDisplay}</span>
            </div>
            <div className="text-blue-400/50 text-2xl">|</div>
            <div>
              <span className="text-xs text-green-400 uppercase tracking-wider block mb-1">
                Phonetic
              </span>
              <span className="text-2xl font-bold text-green-300 font-mono">{phoneticDisplay}</span>
            </div>
          </div>
        </div>
      )}

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
            <img
              src={SPRITE_URLS.side[currentFrame] || SPRITE_URLS.side[0]}
              alt={`Side view frame ${currentFrame}`}
              className="w-full h-full object-cover"
              style={{ transform: 'scale(1.5)', transformOrigin: 'center center' }}
              data-testid="side-view-image"
            />
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
            Frame: {currentFrame}
          </div>
        </div>
      </div>

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
                animationSpeed === 'fastest' ? 'bg-red-600/20 border-red-500/50' :
                'bg-white/10'
              }`}
              data-testid="speed-control-btn"
              title="Animation speed (audio always slow)"
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

          <div className="flex justify-center gap-4 text-xs">
            <span className="text-blue-400">
              {mode === 'letter' 
                ? (isLoadingAudio ? 'Loading...' : audioUrl ? 'Audio ready' : 'No audio')
                : (audioEnabled ? 'TTS enabled' : 'Audio muted')}
            </span>
            <span className="text-blue-400/70">|</span>
            <span className="text-blue-400">Animation: {SPEED_SETTINGS[animationSpeed].label}</span>
            <span className="text-blue-400/70">|</span>
            <span className="text-green-400">Audio: Always Slow</span>
          </div>

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
