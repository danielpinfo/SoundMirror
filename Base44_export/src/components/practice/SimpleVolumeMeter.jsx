import React from 'react';
import { motion } from 'framer-motion';

export default function SimpleVolumeMeter({ volume, isRecording, capturedVolumes = [] }) {
  const MAX_DB = 90;
  
  // Show live volume during recording
  if (isRecording) {
    const percent = Math.min(100, (volume / 100) * 100);
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-baseline text-xs">
          <span className="text-slate-400 uppercase tracking-wider">Live Input</span>
          <span className="text-slate-500">Range: 0 – 90 dB</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-slate-900 border border-slate-700 overflow-hidden relative">
            {/* Scale markers */}
            <div className="absolute inset-0 flex justify-between px-2 text-[0.6rem] text-slate-600 items-center pointer-events-none">
              <span>0</span>
              <span>30</span>
              <span>60</span>
              <span>90 dB</span>
            </div>
            
            {/* Gradient fill */}
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${percent}%`,
                background: 'linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444)',
                boxShadow: volume > 60 ? '0 0 10px rgba(239, 68, 68, 0.5)' : '0 0 10px rgba(34, 197, 94, 0.5)'
              }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          <div className="min-w-[60px] text-right font-mono">
            <span className="text-xl font-semibold text-slate-200">{Math.round((volume / 100) * MAX_DB)}</span>
            <span className="text-xs text-slate-500 ml-1">dB</span>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 text-center">
          Recording volume level...
        </p>
      </div>
    );
  }

  return null;
}