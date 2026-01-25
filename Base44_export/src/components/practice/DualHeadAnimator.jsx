import React, { useState, useEffect, useRef } from 'react';
import { getPhonemeFrames } from './visemeUrls';

/**
 * DualHeadAnimator
 * Animates through a sequence of phoneme tokens
 * Both front (Master) and side (Slave) heads display the same sequence animation
 */
export default function DualHeadAnimator({
  phonemeTokens = [], // Array of phoneme tokens to cycle through, or single token string
  isPlaying = false,
  playbackRate = 1.0,
  frameDuration = 100,
  onAnimationComplete = null,
  maxWidth = 356,
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const completedRef = useRef(false);

  // Normalize input: accept single token string or array
  const tokens = Array.isArray(phonemeTokens) 
    ? phonemeTokens.filter(t => t) 
    : (phonemeTokens ? [phonemeTokens] : []);

  // Get frames for current phoneme
  const currentToken = tokens[currentPhonemeIndex] || 'neutral';
  const phonemeData = getPhonemeFrames(currentToken);
  const frontFrames = phonemeData?.front || [];
  const sideFrames = phonemeData?.side || [];

  // Debug: Log state changes
  useEffect(() => {
    if (tokens.length > 0) {
      console.log(`[DualHeadAnimator] Tokens: [${tokens.join(', ')}], Current: "${currentToken}" (${currentPhonemeIndex + 1}/${tokens.length}), Frames: ${frontFrames.length}`);
    }
  }, [currentToken, currentPhonemeIndex, tokens, frontFrames.length]);

  // Preload all frames for all tokens
  useEffect(() => {
    if (tokens.length === 0) {
      setFramesLoaded(false);
      return;
    }

    let loadedCount = 0;
    let totalToLoad = 0;

    // Count total frames to load
    tokens.forEach(token => {
      const data = getPhonemeFrames(token);
      if (data?.front) totalToLoad += data.front.length;
      if (data?.side) totalToLoad += data.side.length;
    });

    if (totalToLoad === 0) {
      setFramesLoaded(false);
      return;
    }

    const onFrameLoad = () => {
      loadedCount++;
      if (loadedCount === totalToLoad) {
        setFramesLoaded(true);
      }
    };

    // Preload all frames for all tokens
    tokens.forEach(token => {
      const data = getPhonemeFrames(token);
      if (data?.front) {
        data.front.forEach(url => {
          const img = new Image();
          img.onload = onFrameLoad;
          img.onerror = onFrameLoad;
          img.src = url;
        });
      }
      if (data?.side) {
        data.side.forEach(url => {
          const img = new Image();
          img.onload = onFrameLoad;
          img.onerror = onFrameLoad;
          img.src = url;
        });
      }
    });
  }, [tokens]);

  // Animation loop - cycle through phoneme tokens
  useEffect(() => {
    if (!isPlaying || !framesLoaded || tokens.length === 0 || frontFrames.length === 0) return;

    completedRef.current = false;
    let animationFrameId;
    let lastFrameIndex = -1;
    let lastPhonemeIndex = 0;

    const animate = () => {
      const elapsed = Date.now();
      // Total frames = all phonemes × their frame counts
      const frameIndex = Math.floor((elapsed / frameDuration) * playbackRate);
      
      // Calculate total frames across all phonemes
      let totalFrames = 0;
      let phonemeToShow = 0;
      let frameInPhoneme = 0;
      let accumulatedFrames = 0;

      for (let i = 0; i < tokens.length; i++) {
        const data = getPhonemeFrames(tokens[i]);
        const numFrames = data?.front?.length || 10;
        totalFrames += numFrames;

        if (frameIndex < accumulatedFrames + numFrames) {
          phonemeToShow = i;
          frameInPhoneme = frameIndex - accumulatedFrames;
          break;
        }
        accumulatedFrames += numFrames;
      }

      // Check if animation is complete
      if (frameIndex >= totalFrames) {
        if (!completedRef.current) {
          completedRef.current = true;
          setCurrentPhonemeIndex(0);
          setCurrentFrame(0);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
        return;
      }

      // Update phoneme and frame if changed
      if (phonemeToShow !== lastPhonemeIndex || frameInPhoneme !== lastFrameIndex) {
        setCurrentPhonemeIndex(phonemeToShow);
        setCurrentFrame(frameInPhoneme);
        lastPhonemeIndex = phonemeToShow;
        lastFrameIndex = frameInPhoneme;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, framesLoaded, playbackRate, frameDuration, tokens, onAnimationComplete]);

  const displayWidth = Math.min(512, maxWidth * 0.42);
  const displayHeight = displayWidth;

  return (
    <div className="flex gap-3 justify-center items-start">
      {/* Master Head (Front) */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          Master
        </div>
        <div
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600 rounded-lg overflow-hidden"
          style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
        >
          {framesLoaded && frontFrames[currentFrame] ? (
            <img src={frontFrames[currentFrame]} alt="master" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
              {framesLoaded ? 'Ready' : 'Loading...'}
            </div>
          )}
        </div>
      </div>

      {/* Slave Head (Side) */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          Slave
        </div>
        <div
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600 rounded-lg overflow-hidden"
          style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
        >
          {framesLoaded && sideFrames[currentFrame] ? (
            <img src={sideFrames[currentFrame]} alt="slave" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
              {framesLoaded ? 'Ready' : 'Loading...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}