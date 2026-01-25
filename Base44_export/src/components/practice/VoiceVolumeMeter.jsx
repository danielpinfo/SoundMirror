import React from 'react';
import { motion } from 'framer-motion';

export default function VoiceVolumeMeter({ volume, targetText, letterVolumes, isRecording }) {
  if (!targetText) return null;
  if (!letterVolumes || !Array.isArray(letterVolumes)) return null;
  
  // Split text into individual characters (including spaces)
  const characters = targetText.split('');

  const getVolumeColor = (vol) => {
    if (vol < 20) return 'bg-blue-400';
    if (vol < 40) return 'bg-green-400';
    if (vol < 60) return 'bg-yellow-400';
    if (vol < 80) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getLetterSize = (vol) => {
    // Map volume (0-100) to font size (0.8rem - 2.5rem)
    const minSize = 0.8;
    const maxSize = 2.5;
    return minSize + (vol / 100) * (maxSize - minSize);
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="flex justify-between text-xs text-slate-600">
        <span>Whisper</span>
        <span className="font-semibold">Volume per Letter</span>
        <span>Yelling</span>
      </div>

      {/* Letter grid with vertical meters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {characters.map((char, index) => {
          const letterVol = letterVolumes[index] || 0;
          const isSpace = char === ' ';
          
          if (isSpace) {
            return <div key={index} className="w-3" />;
          }

          return (
            <div key={index} className="relative flex flex-col items-center">
              {/* Vertical decibel meter background */}
              <div className="relative w-12 h-32 bg-slate-200 rounded-lg overflow-hidden">
                {/* Meter markers */}
                <div className="absolute inset-0 flex flex-col justify-between py-1">
                  <div className="h-0.5 bg-slate-300 mx-1" />
                  <div className="h-0.5 bg-slate-300 mx-1" />
                  <div className="h-0.5 bg-slate-300 mx-1" />
                  <div className="h-0.5 bg-slate-300 mx-1" />
                </div>

                {/* Volume fill - from bottom to top */}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 ${getVolumeColor(letterVol)} transition-all duration-100`}
                  initial={{ height: 0 }}
                  animate={{ height: `${letterVol}%` }}
                />

                {/* Letter display */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="font-bold text-slate-800 drop-shadow-sm transition-all duration-100"
                    style={{
                      fontSize: `${getLetterSize(letterVol)}rem`,
                      lineHeight: 1,
                    }}
                  >
                    {char}
                  </span>
                </div>
              </div>

              {/* Volume value label */}
              <span className="text-xs text-slate-500 mt-1">
                {Math.round(letterVol)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-slate-500 px-2">
        <span>0 dB</span>
        <span>50 dB</span>
        <span>100 dB</span>
      </div>
    </div>
  );
}