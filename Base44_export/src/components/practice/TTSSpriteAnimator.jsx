import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import OptimizedSpriteEngine from "./OptimizedSpriteEngine";
import { Button } from "@/components/ui/button";
import { Volume2, Square } from "lucide-react";

/**
 * TTS SPRITE ANIMATOR
 * 
 * Combines text-to-speech with the optimized sprite catalogue system
 * for perfectly synced, movie-quality lip animations.
 * 
 * Features:
 * - Auto-calculates phoneme timing from text
 * - Uses catalogue system (no redundant frames)
 * - Multi-language support via lang prop
 * - Play/stop controls
 * 
 * Usage:
 *   <TTSSpriteAnimator
 *     text="hello"
 *     phonemes={["h", "e", "l", "o"]}
 *     lang="en-US"
 *   />
 */

export default function TTSSpriteAnimator({
  text = "",
  phonemes = [],
  lang = "en-US",
  autoPlay = false,
  onComplete,
  maxWidth = 520,
  showDebug = false,
  hideControls = false,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDurations, setAudioDurations] = useState([]);
  const cancelRef = useRef(null);
  
  // Calculate phoneme durations based on text length and phoneme count
  useEffect(() => {
    if (phonemes.length === 0) {
      setAudioDurations([]);
      return;
    }
    
    // Strategy: estimate total duration, then distribute across phonemes
    // Average speaking rate: ~150 words/min = ~2.5 words/sec
    // Average word length: 5 chars
    // So roughly: 200ms per character
    
    const estimatedTotalMs = text.length * 250; // 250ms per character (slower)
    const baseTimePerPhoneme = estimatedTotalMs / phonemes.length;
    
    // Vary durations slightly for natural feel
    // - Vowels: longer (1.3x)
    // - Consonants: shorter (0.9x)
    // - First/last: slightly longer (1.2x)
    
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    
    const durations = phonemes.map((p, idx) => {
      let duration = baseTimePerPhoneme;
      
      const isVowel = vowels.includes(p.toLowerCase());
      if (isVowel) {
        duration *= 1.3;
      } else {
        duration *= 0.9;
      }
      
      // First and last phonemes get extra hold time
      if (idx === 0 || idx === phonemes.length - 1) {
        duration *= 1.2;
      }
      
      return Math.round(duration);
    });
    
    setAudioDurations(durations);
  }, [phonemes, text]);
  
  // Auto-play if requested
  useEffect(() => {
    if (autoPlay && phonemes.length > 0) {
      console.log('[TTSSpriteAnimator] Auto-play triggered for:', text);
      handlePlay();
    }
  }, [autoPlay]);
  
  const handlePlay = async () => {
    if (isPlaying) return;
    
    console.log('[TTSSpriteAnimator] Starting playback:', { text, lang, phonemes, audioDurations });
    setIsPlaying(true);
    
    try {
        // Synthesize audio from phoneme files (S3 audio sprites)
        console.log('[TTSSpriteAnimator] Synthesizing from phonemes:', phonemes);

        const { synthesizeFromPhonemes, playAudioBuffer } = await import('../practice/audioSpriteEngine');

        // Map language code to S3 folder name
        const langCode = lang.split('-')[0]; // en-US -> en

        const audioBuffer = await synthesizeFromPhonemes(phonemes, langCode);
        console.log('[TTSSpriteAnimator] Audio synthesized, duration:', audioBuffer.duration);

        // Store cancel function
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let source = null;

        cancelRef.current = () => {
          console.log('[TTSSpriteAnimator] Cancelling...');
          if (source) {
            source.stop();
            source.disconnect();
          }
          setIsPlaying(false);
        };

        // Play audio buffer
        source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        await new Promise((resolve) => {
          source.onended = () => {
            console.log('[TTSSpriteAnimator] Audio ended');
            resolve();
          };
          source.start(0);
        });

        console.log('[TTSSpriteAnimator] Audio complete');
      
    } catch (err) {
      console.error("[TTSSpriteAnimator] Playback failed:", err);
      console.error("[TTSSpriteAnimator] Error stack:", err.stack);
      alert('Audio playback failed: ' + err.message);
    } finally {
      setIsPlaying(false);
      cancelRef.current = null;
      onComplete?.();
    }
  };
  
  const handleStop = () => {
    if (cancelRef.current) {
      cancelRef.current();
    }
    setIsPlaying(false);
  };
  
  return (
    <div className="space-y-4">
      {/* Controls */}
      {!hideControls && (
        <div className="flex items-center gap-2 justify-center">
          <Button
            onClick={handlePlay}
            disabled={isPlaying || phonemes.length === 0}
            size="lg"
            className="gap-2"
          >
            <Volume2 className="h-5 w-5" />
            {isPlaying ? "Playing..." : "Play"}
          </Button>
          
          {isPlaying && (
            <Button
              onClick={handleStop}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
        </div>
      )}
      
      {/* Animated Sprite */}
      <OptimizedSpriteEngine
        phonemes={phonemes}
        audioDurations={audioDurations}
        isPlaying={isPlaying}
        onComplete={() => {
          setIsPlaying(false);
          onComplete?.();
        }}
        maxWidth={maxWidth}
        showDebug={showDebug}
      />
      
      {/* Text Display */}
      {!hideControls && (
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-100">
            {text}
          </div>
          <div className="text-sm text-slate-400 font-mono mt-1">
            {phonemes.join(" · ")}
          </div>
        </div>
      )}
    </div>
  );
}