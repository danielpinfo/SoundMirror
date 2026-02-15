import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { SPRITE_URLS, getFrameForPhoneme } from '../lib/constants';
import { transliterateLetter, transliterate } from '../lib/phonemeRules';
import { analyzePhonemes, toAnimationSequence } from '../lib/phonemeAnalysis';
import { textToPhonetic, getLetterPhonetic, ipaSequenceToReadable, getFrameSoundName } from '../lib/phoneticDisplay';
import { getLetterAudio } from '../lib/audio';
import { useLanguage } from '../context/LanguageContext';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Play, Pause, Volume2, VolumeX, Gauge } from 'lucide-react';

/**
 * PHONEME-FIRST ARCHITECTURE
 * 
 * Animation is driven by phoneme analysis, NOT audio.
 * Audio (TTS/MP3) is reference-only - plays alongside but does not control timing.
 * 
 * UI DISPLAY: Uses user-friendly display format (sh, th, ee) - NEVER IPA symbols.
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

// Frame to phoneme display - use the imported function from phoneticDisplay.js

// Letter to phoneme mapping (for letter practice mode)
const LETTER_PHONEME_MAP = {
  'a': 'ah', 'b': 'buh', 'c': 'kuh', 'd': 'duh', 'e': 'eh', 'f': 'fuh', 'g': 'guh',
  'h': 'huh', 'i': 'ee', 'j': 'juh', 'k': 'kuh', 'l': 'luh', 'm': 'muh', 'n': 'nuh',
  'o': 'oh', 'p': 'puh', 'q': 'koo', 'r': 'ruh', 's': 'sss', 't': 'tuh', 'u': 'oo',
  'v': 'vuh', 'w': 'wuh', 'x': 'ks', 'y': 'yuh', 'z': 'zzz',
  'ch': 'chuh', 'sh': 'shuh', 'th': 'thuh',
};

/**
 * PHONEME-FIRST: Generate animation data from phoneme analysis
 * Consumes LOCKED CONTRACT: { ipaSequence, durationMs }
 * Now async to support optional PCM extraction
 * 
 * @param {string} text - Text to animate
 * @param {string} language - Language code
 * @param {string} mode - 'letter' or 'word'
 * @param {number} speedMultiplier - Speed adjustment (from SPEED_SETTINGS)
 * @param {Blob|null} audioBlob - Optional audio for future PCM-based detection
 * @returns {Promise<Object>} { frames, phonemeAnalysis, animationData }
 */
const generateAnimationFromPhonemes = async (text, language, mode, speedMultiplier = 1.0, audioBlob = null) => {
  // PHONEME ANALYSIS: Returns { ipaSequence, durationMs }
  // Now async to support optional PCM extraction
  const analysis = await analyzePhonemes(text, language, audioBlob, { 
    speedMultiplier 
  });
  
  // Convert to animation sequence (consumes ipaSequence)
  const animationData = toAnimationSequence(analysis);
  
  return {
    frames: animationData.frames,
    phonemeAnalysis: analysis,
    animationData,
  };
};

// Generate frame sequence for letter practice (async)
const generatePhonemeSequence = async (letter, language = 'english', speedMultiplier = 1.0) => {
  const letterLower = letter.toLowerCase();
  const phoneme = LETTER_PHONEME_MAP[letterLower] || `${letterLower}a`;
  
  const { frames, phonemeAnalysis } = await generateAnimationFromPhonemes(
    phoneme, 
    language, 
    'letter',
    speedMultiplier
  );
  
  return { frames, phonemeAnalysis };
};

// Convert text to frame sequence for word practice (async)
const textToFrameSequence = async (text, language, speedMultiplier = 1.0) => {
  const { frames, phonemeAnalysis, animationData } = await generateAnimationFromPhonemes(
    text,
    language,
    'word',
    speedMultiplier
  );
  
  return { frames, phonemeAnalysis, animationData };
};

export const DualHeadAnimation = forwardRef(({ 
  target = '', 
  mode = 'letter',
  onAnimationComplete,
  onPhonemeAnalysis,  // Callback to expose phoneme analysis for grading
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
  const [ipaDisplay, setIpaDisplay] = useState('');  // NEW: IPA display
  const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_SPEED);
  const [currentPhonemeAnalysis, setCurrentPhonemeAnalysis] = useState(null);  // NEW: Store analysis
  const [frameTimings, setFrameTimings] = useState([]);  // Track phoneme at each frame position
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);

  const speedSettings = SPEED_SETTINGS[animationSpeed];

  // PHONEME-FIRST: Update animation when target changes
  // Consumes LOCKED CONTRACT: { ipaSequence, durationMs }
  // Now async to support optional PCM extraction
  useEffect(() => {
    stopAnimation();
    
    if (target) {
      const speedMultiplier = speedSettings.speedMultiplier;
      
      // Async wrapper for phoneme analysis
      const loadAnimation = async () => {
        let result;
        
        if (mode === 'letter') {
          // Letter practice - use simple letter phonetic
          result = await generatePhonemeSequence(target, language, speedMultiplier);
          const letterPhonetic = getLetterPhonetic(target);
          setPhonemeDisplay(target.toUpperCase());
          setPhoneticDisplay(letterPhonetic);
          fetchLetterAudio(target);
        } else {
          // Word practice - use readable phonetic display (BASE44 style)
          result = await textToFrameSequence(target, language, speedMultiplier);
          setPhonemeDisplay(target);
          
          // Use simple text-to-phonetic conversion (not complex IPA mapping)
          const readablePhonetic = textToPhonetic(target, language);
          setPhoneticDisplay(readablePhonetic);
          
          // Show individual sounds in readable format
          if (result.phonemeAnalysis?.ipaSequence) {
            const readableSounds = ipaSequenceToReadable(result.phonemeAnalysis.ipaSequence);
            setIpaDisplay(readableSounds.join(' '));
          } else {
            setIpaDisplay('');
          }
          
          // Store frame timings for Current Sound display
          if (result.animationData?.frameTimings) {
            setFrameTimings(result.animationData.frameTimings);
          }
          
          setAudioUrl(null);  // Word mode uses TTS
        }
        
        // Store phoneme analysis
        setCurrentPhonemeAnalysis(result.phonemeAnalysis || null);
        
        // Expose analysis to parent for grading
        if (onPhonemeAnalysis && result.phonemeAnalysis) {
          onPhonemeAnalysis(result.phonemeAnalysis);
        }
        
        // Set frame sequence
        const frames = result.frames || result;
        setFrameSequence(Array.isArray(frames) ? frames : [0]);
        setCurrentFrame(frames[0] || 0);
        setCurrentIndex(0);
      };
      
      loadAnimation();
    }
  }, [target, mode, language, speedSettings.speedMultiplier]);

  // Stop animation helper
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  // Fetch letter audio (REFERENCE ONLY - does not drive animation)
  const fetchLetterAudio = async (letter) => {
    setIsLoadingAudio(true);
    try {
      const romanizedLetter = transliterateLetter(letter, language);
      console.log(`[Audio Reference] Letter: ${letter} → Romanized: ${romanizedLetter} (${language})`);
      const url = await getLetterAudio(romanizedLetter, language);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error fetching audio:', error);
      setAudioUrl(null);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Play audio - REFERENCE ONLY, does NOT drive animation timing
  const playAudio = useCallback(() => {
    if (audioUrl && audioEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = 1.0;
      audioRef.current.play().catch(console.error);
    }
  }, [audioUrl, audioEnabled]);

  // Play TTS - REFERENCE ONLY, does NOT drive animation timing
  // Uses audioReference config from phoneme analysis
  const playTTS = useCallback(() => {
    if (!audioEnabled || mode !== 'word' || !target) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(target);
      
      // TTS is reference only - use config from phoneme analysis if available
      const ttsConfig = currentPhonemeAnalysis?.audioReference?.config;
      utterance.rate = ttsConfig?.rate || 0.4;
      utterance.pitch = ttsConfig?.pitch || 1;
      utterance.lang = ttsConfig?.lang || (() => {
        const langMap = {
          'english': 'en-US', 'spanish': 'es-ES', 'italian': 'it-IT',
          'portuguese': 'pt-BR', 'german': 'de-DE', 'french': 'fr-FR',
          'japanese': 'ja-JP', 'chinese': 'zh-CN', 'hindi': 'hi-IN', 'arabic': 'ar-SA'
        };
        return langMap[language] || 'en-US';
      })();
      
      console.log('[Audio Reference] TTS playing (reference only, not driving animation)');
      window.speechSynthesis.speak(utterance);
    }
  }, [audioEnabled, mode, target, language, currentPhonemeAnalysis]);

  // Run animation step - DRIVEN BY PHONEME TIMING, NOT AUDIO
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

  // Play - Animation driven by phoneme analysis, audio plays alongside
  const play = useCallback(() => {
    if (isPlayingRef.current) return;
    
    stopAnimation();
    
    isPlayingRef.current = true;
    setIsPlaying(true);
    setCurrentIndex(0);
    setCurrentFrame(frameSequence[0] || 0);
    
    // Audio is REFERENCE ONLY - plays alongside animation
    if (mode === 'letter') {
      playAudio();
    } else {
      playTTS();
    }
    
    // Animation timing is driven by phoneme analysis, NOT audio
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

  // Expose methods to parent - PHONEME-FIRST architecture
  useImperativeHandle(ref, () => ({
    // Playback controls
    play,
    pause,
    reset,
    togglePlay,
    isPlaying: () => isPlayingRef.current,
    getCurrentFrame: () => currentFrame,
    setSpeed: setAnimationSpeed,
    getSpeed: () => animationSpeed,
    
    // PHONEME-FIRST: Expose analysis for grading
    getPhonemeAnalysis: () => currentPhonemeAnalysis,
    getFrameSequence: () => frameSequence,
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

      {/* PHONEME-FIRST: Display with IPA (LOCKED CONTRACT) */}
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
            {/* Sounds Display - User-friendly format (NEVER IPA) */}
            {ipaDisplay && mode === 'word' && (
              <>
                <div className="text-blue-400/50 text-2xl">|</div>
                <div>
                  <span className="text-xs text-purple-400 uppercase tracking-wider block mb-1">
                    Sounds
                  </span>
                  <span className="text-lg font-bold text-purple-300 font-mono">{ipaDisplay}</span>
                </div>
              </>
            )}
          </div>
          {/* Phoneme count info */}
          {currentPhonemeAnalysis?.ipaSequence && (
            <div className="mt-2 text-xs text-blue-400/70">
              {currentPhonemeAnalysis.ipaSequence.length} sounds • {currentPhonemeAnalysis.durationMs}ms
            </div>
          )}
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

        {/* Side View - Zoomed out 25% for airflow animation space */}
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
              style={{ transform: 'scale(1.125)', transformOrigin: 'center center' }}
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
          {/* Current Phoneme Display - Large, prominent */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-2 border-blue-500/50 rounded-xl px-8 py-4 text-center min-w-[160px]">
              <span className="text-xs text-blue-300 uppercase tracking-wider block mb-1">Current Sound</span>
              <span className="text-3xl font-bold text-white font-mono" data-testid="current-phoneme-display">
                {(() => {
                  // Show actual phoneme from frame timings if available
                  const timing = frameTimings[currentIndex];
                  if (timing?.symbol) {
                    return ipaToReadable ? ipaToReadable(timing.symbol) : timing.symbol;
                  }
                  return getFrameSoundName(currentFrame);
                })()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
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
