/**
 * PHONEME COMPARISON PANEL
 * 
 * Displays user-friendly phoneme comparison between target and detected sounds.
 * NEVER shows IPA symbols - only plain letter representations.
 * 
 * Shows:
 *   "What you said:" - detected phonemes from Allosaurus
 *   "What you meant to say:" - target phonemes from text
 * 
 * Color coding:
 *   - Green: match
 *   - Amber: different
 *   - Red: missing/extra
 */

import React from 'react';
import { ipaSequenceToDisplay, alignSequences, logPhonemeSequences } from '../lib/ipaDisplayMapping';

/**
 * Single phoneme tile component
 */
const PhonemeTile = ({ text, status, isEmpty }) => {
  if (isEmpty) {
    return (
      <div className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/30">
        <span className="text-slate-500 text-sm">—</span>
      </div>
    );
  }
  
  // Color based on status
  const colorClasses = {
    match: 'bg-green-600/80 border-green-400 text-white',
    different: 'bg-amber-600/80 border-amber-400 text-white',
    missed: 'bg-red-600/80 border-red-400 text-white',
    extra: 'bg-red-600/80 border-red-400 text-white',
  };
  
  const classes = colorClasses[status] || 'bg-slate-600/80 border-slate-400 text-white';
  
  return (
    <div className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono font-bold ${classes}`}>
      {text}
    </div>
  );
};

/**
 * PhonemeComparisonPanel Component
 * 
 * @param {Object} props
 * @param {Array<{symbol: string}>} props.targetIpaSequence - Target IPA sequence (from text analysis)
 * @param {Array<{symbol: string}>} props.detectedIpaSequence - Detected IPA sequence (from Allosaurus)
 * @param {string} props.language - Language code
 */
export const PhonemeComparisonPanel = ({ 
  targetIpaSequence = [], 
  detectedIpaSequence = [],
  language = 'english',
}) => {
  // Convert IPA to display representations
  const targetDisplay = ipaSequenceToDisplay(targetIpaSequence, language);
  const detectedDisplay = ipaSequenceToDisplay(detectedIpaSequence, language);
  
  // Log both representations for debugging
  if (targetIpaSequence.length > 0) {
    logPhonemeSequences(targetIpaSequence, 'Target', language);
  }
  if (detectedIpaSequence.length > 0) {
    logPhonemeSequences(detectedIpaSequence, 'Detected', language);
  }
  
  // Align sequences for comparison
  const alignmentResult = alignSequences(targetDisplay, detectedDisplay);
  
  // Don't render if no data
  if (targetDisplay.length === 0 && detectedDisplay.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 mt-4 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Phoneme Comparison</h3>
      
      {/* What you said (detected) */}
      <div className="mb-4">
        <p className="text-sm text-blue-300 mb-2 font-medium">What you said:</p>
        <div className="flex flex-wrap gap-2">
          {alignmentResult.alignment.map((item, index) => (
            <PhonemeTile
              key={`detected-${index}`}
              text={item.detected}
              status={item.status}
              isEmpty={!item.detected}
            />
          ))}
          {detectedDisplay.length === 0 && (
            <p className="text-slate-400 italic">No sounds detected</p>
          )}
        </div>
      </div>
      
      {/* What you meant to say (target) */}
      <div>
        <p className="text-sm text-green-300 mb-2 font-medium">What you meant to say:</p>
        <div className="flex flex-wrap gap-2">
          {alignmentResult.alignment.map((item, index) => (
            <PhonemeTile
              key={`target-${index}`}
              text={item.target}
              status={item.status}
              isEmpty={!item.target}
            />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-600"></div>
            <span className="text-slate-400">Match</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-600"></div>
            <span className="text-slate-400">Different</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-600"></div>
            <span className="text-slate-400">Missing/Extra</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonemeComparisonPanel;
