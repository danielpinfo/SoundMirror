/**
 * PlaybackControls - TTS and animation control panel
 * Includes speed slider for teaching purposes
 */

import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

export default function PlaybackControls({
  isPlaying = false,
  isMuted = false,
  playbackSpeed = 1.0,
  onPlay = () => {},
  onPause = () => {},
  onReset = () => {},
  onSpeedChange = () => {},
  onMuteToggle = () => {},
  disabled = false,
}) {
  const speedOptions = [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1x' },
  ];

  return (
    <div 
      className="flex items-center gap-4 p-4 bg-slate-900/60 backdrop-blur-lg rounded-xl border border-slate-700/50"
      data-testid="playback-controls"
    >
      {/* Play/Pause Button */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          transition-all duration-200 focus-ring
          ${isPlaying 
            ? 'bg-sky-500 text-slate-900 hover:bg-sky-400' 
            : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border border-sky-500/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={!disabled && !isPlaying ? {} : { boxShadow: isPlaying ? '0 0 25px rgba(56, 189, 248, 0.5)' : 'none' }}
        data-testid="play-pause-btn"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-1" />
        )}
      </button>

      {/* Reset Button */}
      <button
        onClick={onReset}
        disabled={disabled}
        className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          text-slate-400 hover:text-slate-200 hover:bg-slate-800
          transition-all duration-200 focus-ring
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        data-testid="reset-btn"
        aria-label="Reset"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-slate-700" />

      {/* Speed Control */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          Speed
        </label>
        <div className="flex gap-1">
          {speedOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onSpeedChange(value)}
              disabled={disabled}
              className={`
                px-2.5 py-1 rounded text-xs font-medium transition-all focus-ring
                ${playbackSpeed === value 
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              data-testid={`speed-${value}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-slate-700" />

      {/* Mute Toggle */}
      <button
        onClick={onMuteToggle}
        disabled={disabled}
        className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          transition-all duration-200 focus-ring
          ${isMuted 
            ? 'text-rose-400 hover:bg-rose-500/20' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        data-testid="mute-btn"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
