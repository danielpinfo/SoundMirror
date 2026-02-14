/**
 * PHONEME COMPARISON PANEL
 * 
 * Displays user-friendly phoneme comparison between target and detected sounds.
 * NEVER shows IPA symbols - only plain letter representations.
 * 
 * UX Principles:
 *   - Target row is visually dominant (what user should aim for)
 *   - Detected row is slightly muted (what user said)
 *   - Neutral, encouraging language throughout
 *   - Per-phoneme tips for mismatches
 *   - Overall summary based on accuracy level
 */

import React from 'react';
import { ipaSequenceToReadable, ipaToReadable } from '../lib/phoneticDisplay';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

/**
 * Helper to align sequences
 */
const alignSequences = (targetDisplay, detectedDisplay) => {
  const maxLength = Math.max(targetDisplay.length, detectedDisplay.length);
  const alignment = [];
  
  for (let i = 0; i < maxLength; i++) {
    const target = targetDisplay[i] || null;
    const detected = detectedDisplay[i] || null;
    
    let status;
    if (target && detected) {
      status = target.toLowerCase() === detected.toLowerCase() ? 'match' : 'different';
    } else if (target && !detected) {
      status = 'missed';
    } else if (!target && detected) {
      status = 'extra';
    }
    
    alignment.push({ index: i, target, detected, status });
  }
  
  return {
    alignment,
    targetLength: targetDisplay.length,
    detectedLength: detectedDisplay.length,
    matchCount: alignment.filter(a => a.status === 'match').length,
    differentCount: alignment.filter(a => a.status === 'different').length,
    missedCount: alignment.filter(a => a.status === 'missed').length,
    extraCount: alignment.filter(a => a.status === 'extra').length,
  };
};

/**
 * Get a human-readable tip for a phoneme mismatch
 * Based on common articulatory feedback patterns
 */
const getPhonemeHint = (targetDisplay, detectedDisplay, targetFeatures, detectedFeatures) => {
  if (!targetDisplay || !detectedDisplay) return null;
  if (targetDisplay.toLowerCase() === detectedDisplay.toLowerCase()) return null;
  
  // Generate hints based on feature differences (if available)
  if (targetFeatures && detectedFeatures) {
    const targetType = targetFeatures.type;
    const detectedType = detectedFeatures.type;
    
    // Type mismatch
    if (targetType !== detectedType) {
      if (targetType === 'consonant') return 'Try a consonant sound';
      if (targetType === 'vowel') return 'Try a vowel sound';
    }
    
    // Consonant-specific hints
    if (targetType === 'consonant') {
      if (targetFeatures.voicing !== detectedFeatures.voicing) {
        return targetFeatures.voicing ? 'Add voice' : 'Softer, no voice';
      }
      if (targetFeatures.place !== detectedFeatures.place) {
        const placeHints = {
          'bilabial': 'Use both lips',
          'labiodental': 'Teeth on lip',
          'alveolar': 'Tongue to ridge',
          'velar': 'Back of tongue up',
          'dental': 'Tongue to teeth',
        };
        return placeHints[targetFeatures.place] || 'Adjust tongue position';
      }
      if (targetFeatures.manner !== detectedFeatures.manner) {
        const mannerHints = {
          'plosive': 'Quick burst of air',
          'fricative': 'Continuous airflow',
          'nasal': 'Air through nose',
          'approximant': 'Gentle sound',
        };
        return mannerHints[targetFeatures.manner] || 'Change airflow';
      }
    }
    
    // Vowel-specific hints
    if (targetType === 'vowel') {
      if (targetFeatures.height !== detectedFeatures.height) {
        const heightOrder = ['close', 'near-close', 'close-mid', 'mid', 'open-mid', 'near-open', 'open'];
        const targetIdx = heightOrder.indexOf(targetFeatures.height);
        const detectedIdx = heightOrder.indexOf(detectedFeatures.height);
        if (targetIdx < detectedIdx) return 'Tongue higher';
        if (targetIdx > detectedIdx) return 'Open wider';
      }
      if (targetFeatures.rounding !== detectedFeatures.rounding) {
        return targetFeatures.rounding ? 'Round lips' : 'Spread lips';
      }
      if (targetFeatures.backness !== detectedFeatures.backness) {
        const backnessOrder = ['front', 'near-front', 'central', 'near-back', 'back'];
        const targetIdx = backnessOrder.indexOf(targetFeatures.backness);
        const detectedIdx = backnessOrder.indexOf(detectedFeatures.backness);
        if (targetIdx < detectedIdx) return 'Tongue forward';
        if (targetIdx > detectedIdx) return 'Tongue back';
      }
    }
  }
  
  // Fallback generic hint
  return 'Slight adjustment needed';
};

/**
 * Get overall summary message based on alignment results
 * Uses encouraging, non-technical language
 */
const getOverallSummary = (alignmentResult) => {
  const { matchCount, differentCount, missedCount, extraCount, targetLength } = alignmentResult;
  
  if (targetLength === 0) return null;
  
  const matchRate = targetLength > 0 ? (matchCount / targetLength) : 0;
  
  // High accuracy (>80%)
  if (matchRate >= 0.8) {
    if (differentCount === 0 && missedCount === 0 && extraCount === 0) {
      return { text: 'Excellent! That sounded just right.', tone: 'success' };
    }
    return { text: 'Very close — just minor adjustments needed.', tone: 'success' };
  }
  
  // Medium accuracy (50-80%)
  if (matchRate >= 0.5) {
    return { text: "You're forming the right sounds. Keep practicing the highlighted ones.", tone: 'progress' };
  }
  
  // Low accuracy (<50%)
  if (matchRate >= 0.2) {
    return { text: "Let's focus on one sound at a time. Try saying it slowly.", tone: 'encourage' };
  }
  
  // Very low/no matches
  if (missedCount > 0 && matchCount === 0) {
    return { text: 'No sounds detected clearly. Try speaking a bit louder.', tone: 'neutral' };
  }
  
  return { text: 'Keep practicing — each attempt helps!', tone: 'encourage' };
};

/**
 * Single phoneme tile component with optional hint
 */
const PhonemeTile = ({ text, status, isEmpty, isTarget, hint }) => {
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center">
        <div className={`w-11 h-11 flex items-center justify-center rounded-lg border-2 border-dashed ${
          isTarget ? 'border-slate-500 bg-slate-800/50' : 'border-slate-700 bg-slate-800/30'
        }`}>
          <span className="text-slate-600 text-sm">—</span>
        </div>
      </div>
    );
  }
  
  // Color and style based on status and whether it's target or detected
  const getStyles = () => {
    if (isTarget) {
      // Target row: visually dominant
      switch (status) {
        case 'match':
          return 'bg-emerald-600 border-emerald-400 text-white shadow-md';
        case 'different':
          return 'bg-blue-600 border-blue-400 text-white shadow-md ring-2 ring-blue-300/50';
        case 'missed':
          return 'bg-slate-600 border-slate-400 text-white shadow-md ring-2 ring-amber-300/50';
        default:
          return 'bg-slate-600 border-slate-400 text-white shadow-md';
      }
    } else {
      // Detected row: slightly muted
      switch (status) {
        case 'match':
          return 'bg-emerald-600/60 border-emerald-500/60 text-emerald-100';
        case 'different':
          return 'bg-amber-600/60 border-amber-500/60 text-amber-100';
        case 'extra':
          return 'bg-slate-600/50 border-slate-500/50 text-slate-300';
        default:
          return 'bg-slate-600/60 border-slate-500/60 text-slate-300';
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-11 h-11 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm ${getStyles()}`}>
        {text}
      </div>
      {/* Per-phoneme hint for mismatches (only on target row) */}
      {isTarget && hint && status !== 'match' && (
        <span className="text-[10px] text-amber-300/90 text-center max-w-[60px] leading-tight">
          {hint}
        </span>
      )}
    </div>
  );
};

/**
 * Summary banner component
 */
const SummaryBanner = ({ summary }) => {
  if (!summary) return null;
  
  const toneStyles = {
    success: 'bg-emerald-900/40 border-emerald-700/50 text-emerald-200',
    progress: 'bg-blue-900/40 border-blue-700/50 text-blue-200',
    encourage: 'bg-amber-900/30 border-amber-700/40 text-amber-200',
    neutral: 'bg-slate-800/60 border-slate-600/50 text-slate-300',
  };
  
  const toneIcons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    progress: <Circle className="w-4 h-4 text-blue-400" />,
    encourage: <Circle className="w-4 h-4 text-amber-400" />,
    neutral: <Circle className="w-4 h-4 text-slate-400" />,
  };
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${toneStyles[summary.tone]}`}>
      {toneIcons[summary.tone]}
      <span className="text-sm font-medium">{summary.text}</span>
    </div>
  );
};

/**
 * PhonemeComparisonPanel Component
 * 
 * @param {Object} props
 * @param {Array<{symbol: string, features?: Object}>} props.targetIpaSequence - Target IPA sequence
 * @param {Array<{symbol: string, features?: Object}>} props.detectedIpaSequence - Detected IPA sequence
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
  
  // Log for debugging (console only)
  if (targetIpaSequence.length > 0) {
    logPhonemeSequences(targetIpaSequence, 'Target', language);
  }
  if (detectedIpaSequence.length > 0) {
    logPhonemeSequences(detectedIpaSequence, 'Detected', language);
  }
  
  // Align sequences for comparison
  const alignmentResult = alignSequences(targetDisplay, detectedDisplay);
  
  // Get overall summary
  const summary = getOverallSummary(alignmentResult);
  
  // Don't render if no data
  if (targetDisplay.length === 0 && detectedDisplay.length === 0) {
    return null;
  }
  
  // Build hints for each position
  const hints = alignmentResult.alignment.map((item, index) => {
    if (item.status === 'match') return null;
    
    const targetPhoneme = targetIpaSequence[index];
    const detectedPhoneme = detectedIpaSequence[index];
    
    return getPhonemeHint(
      item.target,
      item.detected,
      targetPhoneme?.features,
      detectedPhoneme?.features
    );
  });
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 mt-4 border border-slate-700">
      {/* Overall Summary Banner */}
      {summary && (
        <div className="mb-4">
          <SummaryBanner summary={summary} />
        </div>
      )}
      
      {/* What you aimed for (target) - VISUALLY DOMINANT */}
      <div className="mb-5">
        <p className="text-sm text-emerald-300 mb-2 font-semibold flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          Target sounds
        </p>
        <div className="flex flex-wrap gap-2 items-start">
          {alignmentResult.alignment.map((item, index) => (
            <PhonemeTile
              key={`target-${index}`}
              text={item.target}
              status={item.status}
              isEmpty={!item.target}
              isTarget={true}
              hint={hints[index]}
            />
          ))}
        </div>
      </div>
      
      {/* What you said (detected) - SLIGHTLY MUTED */}
      <div>
        <p className="text-sm text-slate-400 mb-2 font-medium">
          What you said
        </p>
        <div className="flex flex-wrap gap-2 items-start">
          {alignmentResult.alignment.map((item, index) => (
            <PhonemeTile
              key={`detected-${index}`}
              text={item.detected}
              status={item.status}
              isEmpty={!item.detected}
              isTarget={false}
            />
          ))}
          {detectedDisplay.length === 0 && (
            <p className="text-slate-500 italic text-sm">No sounds detected yet</p>
          )}
        </div>
      </div>
      
      {/* Minimal Legend - only if there are differences */}
      {(alignmentResult.differentCount > 0 || alignmentResult.missedCount > 0) && (
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-slate-500">Match</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-slate-500">Focus here</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhonemeComparisonPanel;
