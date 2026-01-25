import React, { useState, useEffect, useRef } from 'react';
import { PHONEME_SPRITES, getPhonemeFrameUrl, getPhonemeFrameCount } from './phonemeSpriteLibrary';
import { parseWordWithRules } from './phonemeRulesMap';

export default function WordVisemeAnimator({ 
  word = '', 
  phonetic = '',
  language = 'en',
  isPlaying = false,
  onAnimationComplete,
  maxWidth = 520,
  showMissing = false
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [missingPhonemes, setMissingPhonemes] = useState([]);
  const [frameUrls, setFrameUrls] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const animationRef = useRef(null);
  const frameIdxRef = useRef(0);
  const cachedImagesRef = useRef({});

  // Build frame sequence from phonemes and preload all images
  useEffect(() => {
    const textToParse = word;
    const urls = [];
    const missing = new Set();

    // Split into words (by space) to handle pauses
    const words = textToParse.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    const closedUrl = getPhonemeFrameUrl('closed', 0);
    
    // Add two closed frames at very beginning
    if (closedUrl) {
      urls.push(closedUrl);
      urls.push(closedUrl);
    }

    words.forEach((wordText, wordIdx) => {
      const phonemes = [];
      
      // Remove non-alphabetic characters from word
      const cleanWord = wordText.replace(/[^a-zñ]/g, '');
      
      // Parse word into phonemes using language rules
      const ruleBasedPhonemes = parseWordWithRules(cleanWord, language);
      phonemes.push(...ruleBasedPhonemes);

      // Add all phoneme frames for this word
      phonemes.forEach((phoneme, idx) => {
        const frameCount = getPhonemeFrameCount(phoneme);
        if (frameCount === 0) {
          missing.add(phoneme);
          return;
        }

        // Add all frames for this phoneme
        for (let f = 0; f < frameCount; f++) {
          const url = getPhonemeFrameUrl(phoneme, f);
          if (url) urls.push(url);
        }
      });

      // Add pause between words (duplicate last phoneme's last frame)
      if (wordIdx < words.length - 1 && phonemes.length > 0) {
        const lastPhoneme = phonemes[phonemes.length - 1];
        const lastFrameIdx = getPhonemeFrameCount(lastPhoneme) - 1;
        const lastUrl = getPhonemeFrameUrl(lastPhoneme, lastFrameIdx);
        if (lastUrl) urls.push(lastUrl);
      }
    });

    // Last: add closed mouth frame at end
    if (closedUrl) urls.push(closedUrl);

    setFrameUrls(urls);
    setMissingPhonemes(Array.from(missing));
    setIsReady(false);
    cachedImagesRef.current = {};

    // Preload all images before allowing playback
    if (urls.length === 0) {
      setIsReady(true);
      return;
    }

    let loaded = 0;
    urls.forEach((url, idx) => {
      const img = new Image();
      img.onload = () => {
        cachedImagesRef.current[idx] = url;
        loaded++;
        if (loaded === urls.length) {
          setIsReady(true);
        }
      };
      img.onerror = () => {
        cachedImagesRef.current[idx] = url;
        loaded++;
        if (loaded === urls.length) {
          setIsReady(true);
        }
      };
      img.src = url;
    });
  }, [word, phonetic]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || frameUrls.length === 0 || !isReady) {
      if (animationRef.current) clearInterval(animationRef.current);
      return;
    }

    const minDuration = Math.max(600, word.length * 200);
    const frameInterval = Math.max(50, minDuration / frameUrls.length);

    frameIdxRef.current = 0;
    setFrameIndex(0);

    animationRef.current = setInterval(() => {
      frameIdxRef.current++;
      if (frameIdxRef.current >= frameUrls.length) {
        if (animationRef.current) clearInterval(animationRef.current);
        animationRef.current = null;
        setTimeout(() => {
          frameIdxRef.current = 0;
          setFrameIndex(0);
          onAnimationComplete?.();
        }, 300);
      } else {
        setFrameIndex(frameIdxRef.current);
      }
    }, frameInterval);

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
      animationRef.current = null;
    };
  }, [isPlaying, frameUrls.length, word, isReady, onAnimationComplete]);

  if (frameUrls.length === 0 || !isReady) {
    return <div className="text-sm text-slate-400">Loading frames...</div>;
  }

  const currentUrl = frameUrls[frameIndex];

  return (
    <div className="flex flex-col items-center gap-4">
      {currentUrl && (
        <img
          src={currentUrl}
          alt="mouth animation"
          style={{
            maxWidth: maxWidth,
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: 8
          }}
        />
      )}

      {frameUrls.length > 1 && (
        <div className="w-full max-w-xs px-4">
          <input
            type="range"
            min="0"
            max={frameUrls.length - 1}
            value={frameIndex}
            onChange={(e) => {
              setFrameIndex(Number(e.target.value));
              if (animationRef.current) clearInterval(animationRef.current);
            }}
            className="w-full"
          />
          <div className="text-center text-xs text-slate-400 mt-1">
            {frameIndex + 1} / {frameUrls.length}
          </div>
        </div>
      )}

      {showMissing && missingPhonemes.length > 0 && (
        <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
          Missing: {missingPhonemes.join(', ')}
        </div>
      )}
    </div>
  );
}