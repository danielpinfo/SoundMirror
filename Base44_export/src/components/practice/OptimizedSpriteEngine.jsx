import React, { useEffect, useRef, useState, useMemo } from "react";
import { catalogue, phonemeMap, getFrameById, getPhonemeFrameSequence } from "./visemeSpriteCatalogue";

/**
 * OPTIMIZED SPRITE ENGINE
 * 
 * Uses the sprite catalogue system to minimize redundant frame loading.
 * Each unique mouth position is only stored and loaded once, then
 * reused across all animations.
 * 
 * Features:
 * - Catalogue-based frame references (no duplicate URLs)
 * - Audio-synced timing for realistic lip-sync
 * - Dynamic frame selection based on phoneme duration
 * - Multi-language support (uses phoneme token mapping)
 * 
 * Usage:
 *   <OptimizedSpriteEngine
 *     phonemes={["h", "e", "l", "o"]}
 *     audioDurations={[300, 400, 350, 450]} // ms per phoneme
 *     isPlaying={true}
 *     onComplete={() => console.log("Animation done")}
 *   />
 */

// Calculate which frames to use for a given phoneme and duration
function selectFramesForDuration(allFrameIds, durationMs, isFirst = false, isLast = false) {
  const minFrameTime = 50; // ms
  
  // Strategy:
  // - First phoneme: start with closed mouth (frame 0), then motion
  // - Middle phonemes: focus on key motion frames (skip redundant holds)
  // - Last phoneme: include closing sequence
  
  if (!allFrameIds || allFrameIds.length === 0) {
    return { frameIds: [], timings: [] };
  }
  
  let selectedFrames = [];
  
  if (isFirst) {
    // First phoneme: include opening sequence
    // frames: 0 (hold), 1, 2, 3, 4, 5, 6
    selectedFrames = allFrameIds.slice(0, Math.min(7, allFrameIds.length));
  } else if (isLast) {
    // Last phoneme: include peak + closing
    // frames: 1, 2, 3, 4, 5, 6, 7 (if available)
    selectedFrames = allFrameIds.slice(1, Math.min(8, allFrameIds.length));
  } else {
    // Middle phonemes: key motion frames only
    // frames: 1, 2, 3, 4, 5, 6
    selectedFrames = allFrameIds.slice(1, Math.min(7, allFrameIds.length));
  }
  
  // Calculate timing for each frame
  const numFrames = selectedFrames.length;
  const timePerFrame = Math.max(minFrameTime, durationMs / numFrames);
  
  const timings = selectedFrames.map((_, idx) => ({
    frameId: selectedFrames[idx],
    startTime: idx * timePerFrame,
    endTime: (idx + 1) * timePerFrame,
  }));
  
  return { frameIds: selectedFrames, timings };
}

export default function OptimizedSpriteEngine({
  phonemes = [],
  audioDurations = [],
  isPlaying = false,
  onComplete,
  onPhonemeChange,
  maxWidth = 520,
  showDebug = true,
}) {
  const [activePhonemeIndex, setActivePhonemeIndex] = useState(-1);
  const [activeFrameId, setActiveFrameId] = useState(null);
  const [imgError, setImgError] = useState(false);
  
  const timerRef = useRef(null);
  const animationSequence = useRef([]);
  
  // Build animation sequence (precompute all frames and timings)
  useEffect(() => {
    if (phonemes.length === 0) {
      animationSequence.current = [];
      return;
    }
    
    const sequence = [];
    let cumulativeTime = 0;
    
    phonemes.forEach((phoneme, idx) => {
      const duration = audioDurations[idx] || 400;
      const frameIds = getPhonemeFrameSequence(phoneme, phonemeMap);
      
      const { timings } = selectFramesForDuration(
        frameIds,
        duration,
        idx === 0,
        idx === phonemes.length - 1
      );
      
      timings.forEach(timing => {
        sequence.push({
          phonemeIndex: idx,
          phoneme: phoneme,
          frameId: timing.frameId,
          startTime: cumulativeTime + timing.startTime,
          endTime: cumulativeTime + timing.endTime,
        });
      });
      
      cumulativeTime += duration;
    });
    
    animationSequence.current = sequence;
  }, [phonemes, audioDurations]);
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying || animationSequence.current.length === 0) {
      console.log('[OptimizedSpriteEngine] Not playing or no sequence:', { isPlaying, seqLen: animationSequence.current.length });
      setActivePhonemeIndex(-1);
      setActiveFrameId(null);
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    
    console.log('[OptimizedSpriteEngine] Starting animation loop, sequence length:', animationSequence.current.length);
    const startTime = performance.now();
    let lastPhonemeIdx = -1;
    
    const animate = (timestamp) => {
      const elapsed = timestamp - startTime;
      
      // Find current frame in sequence
      const currentEntry = animationSequence.current.find(
        entry => elapsed >= entry.startTime && elapsed < entry.endTime
      );
      
      if (!currentEntry) {
        // Animation complete
        console.log('[OptimizedSpriteEngine] Animation complete at', elapsed, 'ms');
        setActivePhonemeIndex(-1);
        setActiveFrameId(null);
        onComplete?.();
        return;
      }
      
      // Update state if changed
      if (currentEntry.phonemeIndex !== lastPhonemeIdx) {
        console.log('[OptimizedSpriteEngine] Phoneme change:', currentEntry.phoneme, 'frame:', currentEntry.frameId);
        setActivePhonemeIndex(currentEntry.phonemeIndex);
        onPhonemeChange?.(currentEntry.phonemeIndex);
        lastPhonemeIdx = currentEntry.phonemeIndex;
      }
      
      setActiveFrameId(currentEntry.frameId);
      
      timerRef.current = requestAnimationFrame(animate);
    };
    
    timerRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, onComplete, onPhonemeChange]);
  
  // Get current frame URL (show resting mouth when not playing)
  const currentFrameUrl = useMemo(() => {
    if (!activeFrameId && phonemes.length > 0) {
      // Show first frame of first phoneme as resting state
      const firstPhonemeFrames = getPhonemeFrameSequence(phonemes[0], phonemeMap);
      return firstPhonemeFrames[0] ? getFrameById(firstPhonemeFrames[0], catalogue) : null;
    }
    return activeFrameId ? getFrameById(activeFrameId, catalogue) : null;
  }, [activeFrameId, phonemes]);
  
  const currentPhoneme = activePhonemeIndex >= 0 ? phonemes[activePhonemeIndex] : null;
  
  // Debug info
  const debugInfo = useMemo(() => {
    if (!showDebug) return null;
    
    return {
      phoneme: currentPhoneme || "-",
      frameId: activeFrameId || "-",
      progress: activePhonemeIndex >= 0 ? `${activePhonemeIndex + 1}/${phonemes.length}` : "-/-",
      status: isPlaying ? "▶ Playing" : "⏸ Stopped",
      catalogueSize: catalogue.length,
      mapping: currentFrameUrl ? "✓ OK" : "✗ Missing",
    };
  }, [currentPhoneme, activeFrameId, activePhonemeIndex, phonemes.length, isPlaying, currentFrameUrl, showDebug]);
  
  return (
    <div style={{ 
      border: "1px solid #ddd", 
      borderRadius: 10, 
      padding: 12, 
      background: "#fff",
      maxWidth,
    }}>
      {/* Debug Info */}
      {showDebug && debugInfo && (
        <div style={{ 
          fontFamily: "monospace", 
          fontSize: 13, 
          marginBottom: 10,
          color: "#555",
          background: "#f9f9f9",
          padding: 8,
          borderRadius: 6,
        }}>
          <div>
            <strong>Phoneme:</strong> {debugInfo.phoneme}
            &nbsp;|&nbsp;
            <strong>Frame ID:</strong> {debugInfo.frameId}
          </div>
          <div>
            <strong>Progress:</strong> {debugInfo.progress}
            &nbsp;|&nbsp;
            <strong>Status:</strong> {debugInfo.status}
          </div>
          <div>
            <strong>Catalogue:</strong> {debugInfo.catalogueSize} unique frames
            &nbsp;|&nbsp;
            <strong>Mapping:</strong> {debugInfo.mapping}
          </div>
        </div>
      )}
      
      {/* Viseme Image */}
      {currentFrameUrl && !imgError ? (
        <img
          src={currentFrameUrl}
          alt={`Frame ${activeFrameId}`}
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
          color: "#999",
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {`⚠️ No frame found for "${currentPhoneme || 'unknown'}"`}
        </div>
      )}
    </div>
  );
}