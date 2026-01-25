/**
 * Practice Page - Core articulation visualization and practice
 * Dual-head animator with TTS playback and recording
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Square, RotateCcw } from 'lucide-react';
import DualHeadAnimator from '../components/practice/DualHeadAnimator';
import PhonemeTimeline from '../components/practice/PhonemeTimeline';
import PlaybackControls from '../components/practice/PlaybackControls';

// Simple text-to-phoneme mapping (will be replaced with langpack data)
const textToPhonemes = (text, lang = 'en') => {
  // Basic grapheme-to-phoneme for demo
  const phonemeMap = {
    a: { letter: 'A', phoneme: 'a', phonetic: 'ah' },
    b: { letter: 'B', phoneme: 'b', phonetic: 'buh' },
    c: { letter: 'C', phoneme: 'k', phonetic: 'kuh' },
    d: { letter: 'D', phoneme: 'd', phonetic: 'duh' },
    e: { letter: 'E', phoneme: 'e', phonetic: 'eh' },
    f: { letter: 'F', phoneme: 'f', phonetic: 'fff' },
    g: { letter: 'G', phoneme: 'g', phonetic: 'guh' },
    h: { letter: 'H', phoneme: 'h', phonetic: 'huh' },
    i: { letter: 'I', phoneme: 'i', phonetic: 'ee' },
    j: { letter: 'J', phoneme: 'dʒ', phonetic: 'juh' },
    k: { letter: 'K', phoneme: 'k', phonetic: 'kuh' },
    l: { letter: 'L', phoneme: 'l', phonetic: 'lll' },
    m: { letter: 'M', phoneme: 'm', phonetic: 'mmm' },
    n: { letter: 'N', phoneme: 'n', phonetic: 'nnn' },
    o: { letter: 'O', phoneme: 'o', phonetic: 'oh' },
    p: { letter: 'P', phoneme: 'p', phonetic: 'puh' },
    q: { letter: 'Q', phoneme: 'k', phonetic: 'kuh' },
    r: { letter: 'R', phoneme: 'r', phonetic: 'rrr' },
    s: { letter: 'S', phoneme: 's', phonetic: 'sss' },
    t: { letter: 'T', phoneme: 't', phonetic: 'tuh' },
    u: { letter: 'U', phoneme: 'u', phonetic: 'oo' },
    v: { letter: 'V', phoneme: 'v', phonetic: 'vvv' },
    w: { letter: 'W', phoneme: 'w', phonetic: 'wuh' },
    x: { letter: 'X', phoneme: 'ks', phonetic: 'ks' },
    y: { letter: 'Y', phoneme: 'j', phonetic: 'yuh' },
    z: { letter: 'Z', phoneme: 'z', phonetic: 'zzz' },
  };

  return text.toLowerCase().split('').filter(c => /[a-z]/.test(c)).map(c => phonemeMap[c] || { letter: c.toUpperCase(), phoneme: c, phonetic: c });
};

export default function Practice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const word = searchParams.get('word') || 'hello';
  const lang = searchParams.get('lang') || 'en';

  const [phonemes, setPhonemes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5); // Slower for teaching
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [practiceResults, setPracticeResults] = useState(null);

  // Load phonemes for the word
  useEffect(() => {
    const parsedPhonemes = textToPhonemes(word, lang);
    setPhonemes(parsedPhonemes);
    setCurrentPhonemeIndex(0);
    setPracticeResults(null);
  }, [word, lang]);

  // Handle TTS playback (using Web Speech API for now)
  const speakWord = useCallback(() => {
    if ('speechSynthesis' in window && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = lang === 'en' ? 'en-US' : lang;
      utterance.rate = playbackSpeed;
      window.speechSynthesis.speak(utterance);
    }
  }, [word, lang, playbackSpeed, isMuted]);

  const handlePlay = () => {
    setIsPlaying(true);
    speakWord();
  };

  const handlePause = () => {
    setIsPlaying(false);
    window.speechSynthesis?.cancel();
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentPhonemeIndex(0);
    window.speechSynthesis?.cancel();
  };

  const handleAnimationComplete = () => {
    setIsPlaying(false);
  };

  const handlePhonemeChange = (index, phoneme) => {
    setCurrentPhonemeIndex(index);
  };

  // Phoneme tokens for the animator
  const phonemeTokens = phonemes.map(p => p.phoneme);

  // Frame duration based on playback speed (slower = longer frames)
  const frameDuration = Math.round(150 / playbackSpeed);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-100">
              Practice: <span className="text-sky-400">{word}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Watch the articulation, then record yourself
            </p>
          </div>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Main Practice Area */}
        <div className="glass-card p-8 mb-6">
          {/* Dual Head Animator */}
          <DualHeadAnimator
            phonemeSequence={phonemeTokens}
            isPlaying={isPlaying}
            playbackRate={playbackSpeed}
            frameDuration={frameDuration}
            onPhonemeChange={handlePhonemeChange}
            onAnimationComplete={handleAnimationComplete}
            maxWidth={600}
            basePath="/assets/sprites"
          />

          {/* Phoneme Timeline */}
          <div className="mt-8">
            <PhonemeTimeline
              phonemes={phonemes}
              currentIndex={currentPhonemeIndex}
              results={practiceResults}
              onPhonemeClick={(index) => setCurrentPhonemeIndex(index)}
            />
          </div>

          {/* Playback Controls */}
          <div className="mt-6 flex justify-center">
            <PlaybackControls
              isPlaying={isPlaying}
              isMuted={isMuted}
              playbackSpeed={playbackSpeed}
              onPlay={handlePlay}
              onPause={handlePause}
              onReset={handleReset}
              onSpeedChange={setPlaybackSpeed}
              onMuteToggle={() => setIsMuted(!isMuted)}
            />
          </div>
        </div>

        {/* Recording Section */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center">
            Your Turn - Record Yourself
          </h3>
          
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={() => setIsRecording(true)}
                className="btn-glow flex items-center gap-3 px-8 py-4"
                data-testid="record-btn"
              >
                <Mic className="w-6 h-6" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={() => setIsRecording(false)}
                className="flex items-center gap-3 px-8 py-4 bg-rose-500 text-white rounded-xl
                          hover:bg-rose-400 transition-all shadow-[0_0_20px_rgba(251,113,133,0.4)]"
                data-testid="stop-btn"
              >
                <Square className="w-6 h-6" />
                Stop Recording
              </button>
            )}
          </div>

          {isRecording && (
            <div className="mt-4 flex items-center justify-center gap-2 text-rose-400">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-sm font-medium">Recording...</span>
            </div>
          )}

          <p className="text-center text-slate-500 text-sm mt-4">
            Record yourself saying "{word}" and compare with the model
          </p>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <p className="text-sky-300 text-sm text-center">
            <strong>Tip:</strong> Use 0.25x or 0.5x speed to clearly see each mouth position. 
            Frame #5 of each phoneme shows the ideal articulation point.
          </p>
        </div>
      </div>
    </div>
  );
}
