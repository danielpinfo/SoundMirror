import React, { useEffect, useRef, useState, useMemo } from "react";
import { getVisemeUrl } from "./visemeUrls";

/**
 * UNIVERSAL VISEME SPRITE ENGINE
 * 
 * Handles all 10 languages with audio-driven, movie-quality animations.
 * Uses existing 00-09 JPG frames with tongue movements included.
 * 
 * Key Features:
 * - Audio-length-driven (not fixed 900ms)
 * - Dynamic frame selection (only uses needed frames)
 * - Spanish ñ/ll support (nye/ya visemes)
 * - Works with phoneme tokens from any language
 * 
 * Usage:
 *   <VisemeSpriteEngine
 *     phonemes={["ah", "ba", "ca"]}
 *     audioDurations={[450, 380, 520]} // ms per phoneme
 *     isPlaying={true}
 *     onComplete={() => {}}
 *   />
 */

// Spanish special phoneme mappings
const SPECIAL_PHONEME_MAP = {
  "ñ": "n", // Uses 'nye' viseme (already mapped in visemeUrls)
  "ña": "n",
  "ll": "y", // Uses 'ya' viseme
};

// Normalize phoneme to viseme key
function phonemeToViseme(phoneme) {
  const raw = String(phoneme || "").trim().toLowerCase();
  
  // Check special mappings first
  if (SPECIAL_PHONEME_MAP[raw]) {
    return SPECIAL_PHONEME_MAP[raw];
  }
  
  // Strip trailing 'a' if present (ba -> b, ca -> c)
  if (raw.length === 2 && raw.endsWith("a")) {
    return raw[0];
  }
  
  return raw;
}

// Calculate optimal frames for a given duration
function calculateFrameSequence(durationMs, isFirst = false) {
  // Frame timing rules:
  // - First phoneme: 00 (hold), then 01-06 (motion)
  // - Other phonemes: 01-06 (motion only)
  // - Final hold: repeat last frame
  
  const minFrameMs = 50; // Minimum time per frame
  const motionFrames = [1, 2, 3, 4, 5, 6]; // Core motion sequence
  
  const frames = [];
  
  if (isFirst) {
    frames.push(0); // Opening hold
  }
  
  // Distribute motion frames across duration
  const availableMs = isFirst ? durationMs - minFrameMs : durationMs;
  const msPerFrame = Math.max(minFrameMs, availableMs / motionFrames.length);
  
  for (const f of motionFrames) {
    frames.push(f);
  }
  
  return { frames, msPerFrame };
}

export default function VisemeSpriteEngine({
  phonemes = [],
  audioDurations = [], // Duration in ms for each phoneme
  isPlaying = false,
  onComplete,
  onPhonemeChange, // Callback when active phoneme changes
  fps = 30, // Target frame rate
  maxWidth = 520,
}) {
  const [activePhonemeIndex, setActivePhonemeIndex] = useState(-1);
  const [activeFrame, setActiveFrame] = useState(0);
  const [imgError, setImgError] = useState(false);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  
  // Precompute frame sequences for all phonemes
  const frameSequences = useMemo(() => {
    return phonemes.map((phoneme, idx) => {
      const duration = audioDurations[idx] || 400; // Default 400ms
      const isFirst = idx === 0;
      return calculateFrameSequence(duration, isFirst);
    });
  }, [phonemes, audioDurations]);
  
  // Stop animation
  const stopAnimation = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    setActivePhonemeIndex(-1);
    setActiveFrame(0);
  };
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying || phonemes.length === 0) {
      stopAnimation();
      return;
    }
    
    startTimeRef.current = performance.now();
    let currentPhonemeIdx = 0;
    let currentFrameIdx = 0;
    let phonemeStartTime = startTimeRef.current;
    
    setActivePhonemeIndex(0);
    onPhonemeChange?.(0);
    
    const animate = (timestamp) => {
      if (!isPlaying) {
        stopAnimation();
        return;
      }
      
      const elapsed = timestamp - phonemeStartTime;
      const currentSeq = frameSequences[currentPhonemeIdx];
      
      if (!currentSeq) {
        stopAnimation();
        onComplete?.();
        return;
      }
      
      const { frames, msPerFrame } = currentSeq;
      const expectedFrameIdx = Math.min(
        Math.floor(elapsed / msPerFrame),
        frames.length - 1
      );
      
      // Update frame if changed
      if (expectedFrameIdx !== currentFrameIdx) {
        currentFrameIdx = expectedFrameIdx;
        setActiveFrame(frames[currentFrameIdx]);
      }
      
      // Check if phoneme is complete
      const phonemeDuration = audioDurations[currentPhonemeIdx] || 400;
      if (elapsed >= phonemeDuration) {
        // Move to next phoneme
        currentPhonemeIdx++;
        
        if (currentPhonemeIdx >= phonemes.length) {
          // Animation complete
          stopAnimation();
          onComplete?.();
          return;
        }
        
        currentFrameIdx = 0;
        phonemeStartTime = timestamp;
        setActivePhonemeIndex(currentPhonemeIdx);
        setActiveFrame(frameSequences[currentPhonemeIdx].frames[0]);
        onPhonemeChange?.(currentPhonemeIdx);
      }
      
      timerRef.current = requestAnimationFrame(animate);
    };
    
    timerRef.current = requestAnimationFrame(animate);
    
    return () => stopAnimation();
  }, [isPlaying, phonemes, audioDurations, frameSequences, onComplete, onPhonemeChange]);
  
  // Reset error when URL changes
  useEffect(() => {
    setImgError(false);
  }, [activePhonemeIndex, activeFrame]);
  
  // Get current viseme URL
  const currentPhoneme = phonemes[activePhonemeIndex] || phonemes[0] || "";
  const visemeKey = phonemeToViseme(currentPhoneme);
  const visemeUrl = activePhonemeIndex >= 0 ? getVisemeUrl(visemeKey, activeFrame) : null;
  
  // Debug info
  const debugInfo = useMemo(() => {
    if (activePhonemeIndex < 0) {
      return { phoneme: "-", viseme: "-", frame: "-", duration: "-" };
    }
    
    return {
      phoneme: currentPhoneme,
      viseme: visemeKey,
      frame: String(activeFrame).padStart(2, "0"),
      duration: `${audioDurations[activePhonemeIndex] || 400}ms`,
    };
  }, [activePhonemeIndex, currentPhoneme, visemeKey, activeFrame, audioDurations]);
  
  return (
    <div style={{ 
      border: "1px solid #ddd", 
      borderRadius: 10, 
      padding: 12, 
      background: "#fff" 
    }}>
      {/* Debug Info */}
      <div style={{ 
        fontFamily: "monospace", 
        fontSize: 13, 
        marginBottom: 10,
        color: "#555"
      }}>
        <div>
          <strong>Phoneme:</strong> {debugInfo.phoneme} 
          &nbsp;→&nbsp; 
          <strong>Viseme:</strong> {debugInfo.viseme}
          &nbsp;|&nbsp;
          <strong>Frame:</strong> {debugInfo.frame}
          &nbsp;|&nbsp;
          <strong>Duration:</strong> {debugInfo.duration}
        </div>
        <div>
          <strong>Progress:</strong> {activePhonemeIndex + 1} / {phonemes.length}
        </div>
        <div>
          <strong>Status:</strong> {isPlaying ? "▶ Playing" : "⏸ Stopped"}
          &nbsp;|&nbsp;
          <strong>Mapping:</strong> {visemeUrl && !imgError ? "✓ OK" : "✗ Missing"}
        </div>
      </div>
      
      {/* Viseme Image */}
      {visemeUrl && !imgError ? (
        <img
          src={visemeUrl}
          alt={`${visemeKey} frame ${activeFrame}`}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            maxWidth,
            height: "auto",
            display: "block",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        />
      ) : (
        <div style={{ 
          padding: 40, 
          background: "#f6f6f6", 
          borderRadius: 8,
          textAlign: "center",
          color: "#999"
        }}>
          {activePhonemeIndex < 0 
            ? "Ready to play..." 
            : `No viseme found for "${visemeKey}"`}
        </div>
      )}
    </div>
  );
}