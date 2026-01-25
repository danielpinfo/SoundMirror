import React from 'react';
import { motion } from 'framer-motion';

export default function WordVolumeBars({ wordVolumes, isRecording }) {
  if (!wordVolumes || !Array.isArray(wordVolumes) || wordVolumes.length === 0) return null;

  const maxDb = 100;

  return (
    <div className="w-full bg-slate-900 rounded-xl p-6 border-2 border-slate-700">
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-slate-300 font-semibold">Volume per Word</h4>
          <span className="text-xs text-slate-400">Peak dB for each word</span>
        </div>
        
        <div className="flex items-end justify-center gap-3 h-48">
          {wordVolumes.map((wordData, index) => {
            if (!wordData) return null;
            const peakVolume = typeof wordData.peakVolume === 'number' ? wordData.peakVolume : 0;
            const heightPercent = (peakVolume / maxDb) * 100;
            const db = Math.round((peakVolume / 100) * 60 - 60); // Convert to dB scale (-60 to 0)
            
            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1 max-w-[100px]">
                <div className="text-xs text-slate-400 font-medium">
                  {db} dB
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full rounded-t-lg relative"
                  style={{
                    background: `linear-gradient(to top, 
                      ${db > -20 ? '#22c55e' : db > -40 ? '#eab308' : '#ef4444'} 0%, 
                      ${db > -20 ? '#16a34a' : db > -40 ? '#ca8a04' : '#dc2626'} 100%)`
                  }}
                >
                  <div className="absolute inset-0 rounded-t-lg shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                </motion.div>
                <div className="text-xs text-slate-300 font-semibold text-center truncate w-full px-1">
                  #{index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-slate-400">Loud (&gt;-20dB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-slate-400">Medium (-40 to -20dB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-slate-400">Quiet (&lt;-40dB)</span>
          </div>
        </div>
      </div>
    </div>
  );
}