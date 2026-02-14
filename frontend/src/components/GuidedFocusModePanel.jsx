/**
 * GUIDED FOCUS MODE PANEL
 * 
 * Single-phoneme practice mode that helps users focus on ONE problematic sound.
 * Displays coaching tips and tracks improvement across attempts.
 * 
 * UX Principles:
 *   - Feels like coaching, not repetition
 *   - Shows only the focused phoneme (reduces cognitive load)
 *   - Encouraging language throughout
 *   - No numeric scores or percentages
 *   - Easy exit back to full word view
 */

import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ipaToReadable } from '../lib/phoneticDisplay';
import { Target, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

/**
 * Get coaching tip for a specific phoneme based on articulatory features
 */
const getCoachingTip = (features) => {
  if (!features) return 'Focus on forming this sound clearly.';
  
  const tips = [];
  
  if (features.type === 'consonant') {
    // Place tips
    const placeTips = {
      'bilabial': 'Press both lips together gently.',
      'labiodental': 'Touch your upper teeth to your lower lip.',
      'dental': 'Place your tongue tip against your upper teeth.',
      'alveolar': 'Touch your tongue to the ridge behind your upper teeth.',
      'postalveolar': 'Curl your tongue slightly back from your teeth.',
      'palatal': 'Raise the middle of your tongue toward the roof of your mouth.',
      'velar': 'Raise the back of your tongue toward your soft palate.',
    };
    if (placeTips[features.place]) tips.push(placeTips[features.place]);
    
    // Manner tips
    const mannerTips = {
      'plosive': 'Build up air pressure, then release it quickly.',
      'fricative': 'Create a narrow gap and let air flow through continuously.',
      'nasal': 'Let the air flow through your nose.',
      'approximant': 'Keep your mouth relaxed and open.',
      'lateral': 'Let air flow around the sides of your tongue.',
    };
    if (mannerTips[features.manner]) tips.push(mannerTips[features.manner]);
    
    // Voicing
    if (features.voicing === true) {
      tips.push('Feel vibration in your throat as you say it.');
    } else if (features.voicing === false) {
      tips.push('This is a quiet sound — no throat vibration.');
    }
  } else if (features.type === 'vowel') {
    // Height tips
    const heightTips = {
      'close': 'Keep your tongue high in your mouth.',
      'near-close': 'Position your tongue fairly high.',
      'close-mid': 'Keep your tongue in the upper-middle area.',
      'mid': 'Keep your mouth and tongue relaxed in the middle.',
      'open-mid': 'Lower your tongue slightly and open your mouth more.',
      'near-open': 'Open your mouth wider.',
      'open': 'Open your mouth wide and lower your tongue.',
    };
    if (heightTips[features.height]) tips.push(heightTips[features.height]);
    
    // Rounding
    if (features.rounding === true) {
      tips.push('Round your lips like you\'re saying "oo".');
    } else if (features.rounding === false) {
      tips.push('Keep your lips relaxed, not rounded.');
    }
    
    // Backness
    const backnessTips = {
      'front': 'Push your tongue forward in your mouth.',
      'central': 'Keep your tongue in a neutral, central position.',
      'back': 'Pull your tongue back in your mouth.',
    };
    if (backnessTips[features.backness]) tips.push(backnessTips[features.backness]);
  }
  
  return tips.length > 0 ? tips[0] : 'Focus on forming this sound clearly.';
};

/**
 * Get improvement message based on score change
 */
const getImprovementMessage = (previousScore, currentScore) => {
  if (currentScore === 100) {
    return { text: 'Perfect! You got it!', tone: 'success' };
  }
  if (currentScore > previousScore) {
    const improvement = currentScore - previousScore;
    if (improvement >= 30) {
      return { text: 'Great improvement! Keep that feeling.', tone: 'success' };
    }
    return { text: 'Yes — that\'s closer. Try once more.', tone: 'progress' };
  }
  if (currentScore === previousScore) {
    return { text: 'Almost — try adjusting slightly.', tone: 'encourage' };
  }
  return { text: 'Keep trying — you\'ll get it.', tone: 'encourage' };
};

/**
 * GuidedFocusModePanel Component
 */
export const GuidedFocusModePanel = ({
  focusPhoneme,           // { symbol, displayText, features, targetScore, detectedScore }
  targetDisplayText,      // Display text for target (e.g., "sh")
  detectedDisplayText,    // Display text for detected (e.g., "s")
  previousScore,          // Previous attempt score for this phoneme
  currentScore,           // Current attempt score for this phoneme
  coachingTip,            // Coaching tip text
  onTryAgain,             // Callback to trigger re-recording
  onExit,                 // Callback to exit focus mode
  isRecording,            // Whether currently recording
  isGrading,              // Whether currently grading
  attemptCount,           // Number of attempts in focus mode
}) => {
  // Determine improvement message
  const improvementMessage = attemptCount > 1 
    ? getImprovementMessage(previousScore, currentScore)
    : null;
  
  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-blue-700/50">
      <CardContent className="p-6 space-y-6">
        {/* Header with exit button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-300">
            <Target className="w-5 h-5" />
            <span className="font-medium">Focus Mode</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to full word
          </Button>
        </div>
        
        {/* Large focused phoneme display */}
        <div className="text-center py-6">
          <p className="text-sm text-slate-400 mb-3">Practice this sound</p>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-blue-600/30 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20">
            <span className="text-5xl font-bold text-white font-mono">
              {targetDisplayText}
            </span>
          </div>
        </div>
        
        {/* Coaching tip */}
        <div className="bg-slate-900/60 rounded-xl p-4 text-center">
          <p className="text-slate-300 text-sm leading-relaxed">
            {coachingTip}
          </p>
        </div>
        
        {/* Target vs Detected comparison (if detected exists) */}
        {detectedDisplayText && detectedDisplayText !== targetDisplayText && (
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Target</p>
              <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-emerald-600/30 border border-emerald-500/50">
                <span className="text-2xl font-bold text-emerald-200 font-mono">
                  {targetDisplayText}
                </span>
              </div>
            </div>
            <div className="text-slate-500">→</div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">You said</p>
              <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-amber-600/30 border border-amber-500/50">
                <span className="text-2xl font-bold text-amber-200 font-mono">
                  {detectedDisplayText}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Improvement message (after first attempt) */}
        {improvementMessage && (
          <div className={`text-center py-2 rounded-lg ${
            improvementMessage.tone === 'success' 
              ? 'bg-emerald-900/30 text-emerald-300' 
              : improvementMessage.tone === 'progress'
                ? 'bg-blue-900/30 text-blue-300'
                : 'bg-amber-900/20 text-amber-300'
          }`}>
            {improvementMessage.tone === 'success' && (
              <Sparkles className="w-4 h-4 inline mr-2" />
            )}
            <span className="text-sm font-medium">{improvementMessage.text}</span>
          </div>
        )}
        
        {/* Try Again button */}
        <div className="text-center pt-2">
          <Button
            onClick={onTryAgain}
            disabled={isRecording || isGrading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            data-testid="focus-try-again-btn"
          >
            {isRecording ? (
              <>Recording...</>
            ) : isGrading ? (
              <>Analyzing...</>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
          
          {attemptCount > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              Attempt {attemptCount}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Find the focus phoneme from grading results
 * Priority: lowest score, then earliest in sequence
 */
export function identifyFocusPhoneme(gradingDetails, targetIpaSequence, detectedIpaSequence, language = 'english') {
  if (!gradingDetails?.phonemeScores || gradingDetails.phonemeScores.length === 0) {
    return null;
  }
  
  // Filter to phonemes that need work (not perfect matches)
  const imperfectPhonemes = gradingDetails.phonemeScores.filter(
    ps => ps.score < 100 && ps.target
  );
  
  if (imperfectPhonemes.length === 0) {
    return null; // All perfect!
  }
  
  // Sort by score (lowest first), then by position (earliest first)
  imperfectPhonemes.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.position - b.position;
  });
  
  const lowestScoring = imperfectPhonemes[0];
  const position = lowestScoring.position;
  
  // Get the IPA phoneme data
  const targetPhoneme = targetIpaSequence[position];
  const detectedPhoneme = detectedIpaSequence?.[position];
  
  // Convert to display text (NEVER show IPA)
  const targetDisplay = ipaToDisplay(targetPhoneme?.symbol || lowestScoring.target?.symbol, language);
  const detectedDisplay = detectedPhoneme 
    ? ipaToDisplay(detectedPhoneme.symbol, language) 
    : null;
  
  // Get features for coaching
  const features = lowestScoring.target?.features || targetPhoneme?.features;
  const coachingTip = getCoachingTip(features);
  
  return {
    position,
    symbol: targetPhoneme?.symbol,
    targetDisplayText: targetDisplay,
    detectedDisplayText: detectedDisplay,
    features,
    score: lowestScoring.score,
    coachingTip,
    feedback: lowestScoring.feedback,
  };
}

export default GuidedFocusModePanel;
