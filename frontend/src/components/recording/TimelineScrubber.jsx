/**
 * TimelineScrubber Component
 * 
 * Interactive timeline for:
 * - Scrubbing through reference animation
 * - Visualizing phoneme positions
 * - Comparing reference vs student timing
 * - Frame-by-frame navigation
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export function TimelineScrubber({
  duration = 2000, // Total duration in ms
  currentTime = 0,
  isPlaying = false,
  phonemes = [], // Array of { phoneme, start, end, frame }
  studentTimeline = null, // Optional student timing overlay
  onSeek,
  onPlayPause,
  onFrameChange,
  showPhonemes = true,
  showStudentOverlay = false,
}) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);

  // Calculate position from time
  const timeToPosition = useCallback((time) => {
    return (time / duration) * 100;
  }, [duration]);

  // Calculate time from position
  const positionToTime = useCallback((position) => {
    return (position / 100) * duration;
  }, [duration]);

  // Get phoneme at time
  const getPhonemeAtTime = useCallback((time) => {
    return phonemes.find(p => time >= p.start && time < p.end);
  }, [phonemes]);

  // Handle track click/drag
  const handleTrackInteraction = useCallback((e) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const position = (x / rect.width) * 100;
    const time = positionToTime(position);

    onSeek?.(time);

    // Find frame for this time and notify
    const phoneme = getPhonemeAtTime(time);
    if (phoneme && onFrameChange) {
      onFrameChange(phoneme.frame);
    }
  }, [positionToTime, getPhonemeAtTime, onSeek, onFrameChange]);

  // Mouse down - start dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleTrackInteraction(e);
  };

  // Mouse move - update if dragging or show hover
  const handleMouseMove = (e) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const position = (x / rect.width) * 100;
    const time = positionToTime(position);

    setHoverTime(time);
    setHoverX(x);

    if (isDragging) {
      handleTrackInteraction(e);
    }
  };

  // Mouse up - stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse leave
  const handleMouseLeave = () => {
    setHoverTime(null);
    setIsDragging(false);
  };

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Format time display
  const formatTime = (ms) => {
    const secs = Math.floor(ms / 1000);
    const ms100 = Math.floor((ms % 1000) / 100);
    return `${secs}.${ms100}`;
  };

  // Get phoneme color based on type
  const getPhonemeColor = (phoneme, isVowel = false) => {
    if (isVowel || ['a', 'e', 'i', 'o', 'u', 'ah', 'eh', 'ee', 'oo', 'ay'].includes(phoneme.toLowerCase())) {
      return 'bg-amber-500/40 border-amber-500/60';
    }
    return 'bg-sky-500/30 border-sky-500/50';
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4" data-testid="timeline-scrubber">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => onSeek?.(Math.max(0, currentTime - 100))}
          className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center"
          title="Previous frame"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPlayPause?.()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isPlaying 
              ? 'bg-sky-500 text-slate-900' 
              : 'bg-sky-500/20 text-sky-400 border border-sky-500/50'
          }`}
          data-testid="timeline-play-btn"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={() => onSeek?.(Math.min(duration, currentTime + 100))}
          className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center"
          title="Next frame"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <div className="text-xs font-mono text-slate-400">
          <span className="text-sky-400">{formatTime(currentTime)}s</span>
          <span className="mx-1">/</span>
          <span>{formatTime(duration)}s</span>
        </div>
      </div>

      {/* Timeline Track */}
      <div
        ref={trackRef}
        className="relative h-12 bg-slate-800 rounded-lg cursor-pointer overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Phoneme Segments */}
        {showPhonemes && phonemes.map((p, i) => (
          <div
            key={i}
            className={`absolute top-1 bottom-1 rounded border ${getPhonemeColor(p.phoneme)}`}
            style={{
              left: `${timeToPosition(p.start)}%`,
              width: `${timeToPosition(p.end - p.start)}%`,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white/80 truncate px-0.5">
              {p.phoneme}
            </span>
          </div>
        ))}

        {/* Student Overlay */}
        {showStudentOverlay && studentTimeline && studentTimeline.map((s, i) => (
          <div
            key={`student-${i}`}
            className="absolute bottom-0 h-2 bg-purple-500/50 rounded-t"
            style={{
              left: `${timeToPosition(s.start)}%`,
              width: `${timeToPosition(s.end - s.start)}%`,
            }}
          />
        ))}

        {/* Progress Bar */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-sky-500/20 pointer-events-none"
          style={{ width: `${timeToPosition(currentTime)}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)] pointer-events-none"
          style={{ left: `${timeToPosition(currentTime)}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-400 rounded-full shadow-lg" />
        </div>

        {/* Hover Indicator */}
        {hoverTime !== null && !isDragging && (
          <div
            className="absolute top-0 bottom-0 w-px bg-white/30 pointer-events-none"
            style={{ left: `${hoverX}px` }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-700 rounded text-[10px] text-slate-300 whitespace-nowrap">
              {formatTime(hoverTime)}s
              {getPhonemeAtTime(hoverTime) && (
                <span className="ml-1 text-sky-400">/{getPhonemeAtTime(hoverTime).phoneme}/</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phoneme Legend */}
      {showPhonemes && phonemes.length > 0 && (
        <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/60" />
            Vowels
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-sky-500/30 border border-sky-500/50" />
            Consonants
          </div>
          {showStudentOverlay && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-500/50" />
              Your timing
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TimelineScrubber;
