/**
 * ComparisonView Component
 * 
 * Side-by-side comparison of:
 * - Reference animation
 * - Student recording playback
 * 
 * Features:
 * - Synchronized playback
 * - Overlay mode
 * - Score highlights
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Layers, SplitSquareVertical, Eye, Ear } from 'lucide-react';

export function ComparisonView({
  referenceComponent, // The DualHeadAnimator for reference
  studentVideoUrl,
  studentAudioUrl,
  gradingResults = null,
  onSyncedPlayback,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'overlay' | 'student'
  const [currentTime, setCurrentTime] = useState(0);

  const studentVideoRef = useRef(null);
  const studentAudioRef = useRef(null);

  // Play both reference and student
  const handlePlay = () => {
    setIsPlaying(true);
    onSyncedPlayback?.(true);

    if (studentVideoRef.current) {
      studentVideoRef.current.currentTime = 0;
      studentVideoRef.current.play();
    }
    if (studentAudioRef.current) {
      studentAudioRef.current.currentTime = 0;
      studentAudioRef.current.play();
    }
  };

  // Pause both
  const handlePause = () => {
    setIsPlaying(false);
    onSyncedPlayback?.(false);

    if (studentVideoRef.current) studentVideoRef.current.pause();
    if (studentAudioRef.current) studentAudioRef.current.pause();
  };

  // Reset
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    onSyncedPlayback?.(false);

    if (studentVideoRef.current) {
      studentVideoRef.current.currentTime = 0;
      studentVideoRef.current.pause();
    }
    if (studentAudioRef.current) {
      studentAudioRef.current.currentTime = 0;
      studentAudioRef.current.pause();
    }
  };

  // Track playback time
  useEffect(() => {
    const mediaRef = studentVideoRef.current || studentAudioRef.current;
    if (!mediaRef) return;

    const handleTimeUpdate = () => setCurrentTime(mediaRef.currentTime * 1000);
    const handleEnded = () => {
      setIsPlaying(false);
      onSyncedPlayback?.(false);
    };

    mediaRef.addEventListener('timeupdate', handleTimeUpdate);
    mediaRef.addEventListener('ended', handleEnded);

    return () => {
      mediaRef.removeEventListener('timeupdate', handleTimeUpdate);
      mediaRef.removeEventListener('ended', handleEnded);
    };
  }, [studentVideoUrl, studentAudioUrl, onSyncedPlayback]);

  // Score color helper
  const getScoreColor = (score) => {
    if (score >= 0.85) return 'text-emerald-400';
    if (score >= 0.70) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5" data-testid="comparison-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Compare Your Attempt
        </h3>

        {/* View Mode Toggle */}
        <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'split' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-3 h-3 inline mr-1" /> Split
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'overlay' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3 inline mr-1" /> Overlay
          </button>
        </div>
      </div>

      {/* Comparison Area */}
      <div className={`grid ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-4`}>
        {/* Reference */}
        <div className={`${viewMode === 'overlay' ? 'absolute inset-0 z-0' : ''}`}>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 text-center">
            Reference Model
          </div>
          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-700/50">
            {referenceComponent}
          </div>
        </div>

        {/* Student Recording */}
        <div className={`${viewMode === 'overlay' ? 'relative z-10 opacity-70' : ''}`}>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 text-center">
            Your Recording
          </div>
          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-700/50 aspect-video flex items-center justify-center">
            {studentVideoUrl ? (
              <video
                ref={studentVideoRef}
                src={studentVideoUrl}
                className="w-full h-full object-cover"
                playsInline
              />
            ) : studentAudioUrl ? (
              <>
                <audio ref={studentAudioRef} src={studentAudioUrl} />
                <div className="text-center p-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-2">
                    <Ear className={`w-8 h-8 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-slate-400 text-sm">Audio Recording</div>
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-sm p-4">No recording available</div>
            )}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isPlaying 
              ? 'bg-sky-500 text-slate-900' 
              : 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-900'
          }`}
          data-testid="comparison-play-btn"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
      </div>

      {/* Grading Summary */}
      {gradingResults && (
        <div className="grid grid-cols-2 gap-3 border-t border-slate-700/50 pt-4">
          <div className="text-center p-3 rounded-xl bg-slate-800/50">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-500">Visual Match</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(gradingResults.scores.timing)}`}>
              {Math.round(gradingResults.scores.timing * 100)}%
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800/50">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Ear className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-500">Pronunciation</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(gradingResults.scores.pronunciation)}`}>
              {Math.round(gradingResults.scores.pronunciation * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparisonView;
