import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Volume2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * GradingPanel - Displays visual and audio articulation grades
 * Shows phoneme detection results and improvement suggestions
 */
export default function GradingPanel({
  targetPhoneme = 'a',
  detectedPhoneme = 'a',
  audioGrade = 85, // 0-100
  visualGrade = 78, // 0-100
  recordingAudioUrl = null,
  detailedSuggestions = null,
  onRetry = null,
  isAnalyzing = false,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const getGradeColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeBackgroundColor = (score) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getGradeLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Practice';
  };

  const AudioGradeSuggestions = {
    high: [
      'Perfect! Your phoneme pronunciation is excellent.',
      'Great articulation! Only minor adjustments needed.',
    ],
    medium: [
      'Your vowel formation could be more rounded.',
      'Try to emphasize the initial consonant more clearly.',
      'Work on the duration of the sound.',
      'The transition between phonemes needs smoothing.',
    ],
    low: [
      'Listen to the target phoneme again.',
      'Practice slow, exaggerated articulation.',
      'Check your mouth positioning.',
      'Record yourself and compare with the target.',
    ],
  };

  const VisualGradeSuggestions = {
    high: [
      'Your mouth shape matches the target perfectly!',
      'Excellent jaw and lip positioning.',
    ],
    medium: [
      'Your jaw opening could be slightly wider.',
      'Try rounding your lips more.',
      'Your tongue position is close but could adjust.',
      'Work on keeping your mouth more open.',
    ],
    low: [
      'Watch the animation again carefully.',
      'Pay attention to your jaw position.',
      'Try to match the lip shape more precisely.',
      'Your mouth is too tense - relax.',
    ],
  };

  const getAudioSuggestions = () => {
    if (audioGrade >= 80) return AudioGradeSuggestions.high[Math.floor(Math.random() * 2)];
    if (audioGrade >= 60) return AudioGradeSuggestions.medium[Math.floor(Math.random() * 4)];
    return AudioGradeSuggestions.low[Math.floor(Math.random() * 4)];
  };

  const getVisualSuggestions = () => {
    if (visualGrade >= 80) return VisualGradeSuggestions.high[Math.floor(Math.random() * 2)];
    if (visualGrade >= 60) return VisualGradeSuggestions.medium[Math.floor(Math.random() * 4)];
    return VisualGradeSuggestions.low[Math.floor(Math.random() * 4)];
  };

  return (
    <div className="w-full space-y-6">
      {/* Analyzing State */}
      {isAnalyzing && (
        <div className="flex items-center justify-center p-8 bg-white/5 rounded-xl border border-silver/20 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-accent-blue border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Analyzing your attempt...</p>
            <p className="text-silver/70 text-sm mt-1">Processing audio and visual data</p>
          </div>
        </div>
      )}

      {!isAnalyzing && (
        <>
          {/* Phoneme Detection */}
          <div className="bg-white/5 rounded-xl p-6 border border-silver/20 backdrop-blur-sm space-y-4">
            <div className="text-sm font-semibold text-silver uppercase tracking-wider">
              Phoneme Detection
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-silver/70 text-sm mb-2">Target</p>
                <div className="text-4xl font-bold text-accent-blue font-mono tracking-wider">
                  {targetPhoneme}
                </div>
              </div>
              <div>
                <p className="text-silver/70 text-sm mb-2">What You Said</p>
                <div className={`text-4xl font-bold font-mono tracking-wider ${
                  detectedPhoneme === targetPhoneme ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {detectedPhoneme}
                </div>
              </div>
            </div>

            {detectedPhoneme === targetPhoneme && (
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Perfect match!
              </div>
            )}
            {detectedPhoneme !== targetPhoneme && (
              <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold">
                <AlertCircle className="w-4 h-4" />
                Different from target • Keep practicing
              </div>
            )}
          </div>

          {/* Audio Grade */}
          <div className={`rounded-xl p-6 border backdrop-blur-sm space-y-4 ${getGradeBackgroundColor(audioGrade)}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-silver uppercase tracking-wider mb-2">
                  Audio Grade
                </div>
                <div className={`text-5xl font-bold ${getGradeColor(audioGrade)}`}>
                  {audioGrade}%
                </div>
                <p className="text-silver/70 text-sm mt-2">{getGradeLabel(audioGrade)}</p>
              </div>
              {recordingAudioUrl && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="border-silver/30 text-white hover:bg-white/10"
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Hidden audio player */}
            {recordingAudioUrl && (
              <audio
                src={recordingAudioUrl}
                autoPlay={isPlaying}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Suggestion */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white font-semibold mb-1">💡 Tip:</p>
              <p className="text-silver text-sm">{getAudioSuggestions()}</p>
            </div>
          </div>

          {/* Visual Grade */}
          <div className={`rounded-xl p-6 border backdrop-blur-sm space-y-4 ${getGradeBackgroundColor(visualGrade)}`}>
            <div>
              <div className="text-sm font-semibold text-silver uppercase tracking-wider mb-2">
                Video Grade (Articulation)
              </div>
              <div className={`text-5xl font-bold ${getGradeColor(visualGrade)}`}>
                {visualGrade}%
              </div>
              <p className="text-silver/70 text-sm mt-2">{getGradeLabel(visualGrade)}</p>
            </div>

            {/* Grading breakdown */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-silver/70">
                  <span>Lip Position</span>
                  <span className="font-semibold text-silver">{Math.round(visualGrade * 0.95)}%</span>
                </div>
                <div className="h-1.5 bg-primary-darker rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-500"
                    style={{ width: `${visualGrade * 0.95}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-silver/70">
                  <span>Jaw Opening</span>
                  <span className="font-semibold text-silver">{Math.round(visualGrade * 0.88)}%</span>
                </div>
                <div className="h-1.5 bg-primary-darker rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                    style={{ width: `${visualGrade * 0.88}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-silver/70">
                  <span>Timing Accuracy</span>
                  <span className="font-semibold text-silver">{Math.round(visualGrade * 0.92)}%</span>
                </div>
                <div className="h-1.5 bg-primary-darker rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-500"
                    style={{ width: `${visualGrade * 0.92}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Suggestion */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white font-semibold mb-1">💡 Tip:</p>
              <p className="text-silver text-sm">{getVisualSuggestions()}</p>
            </div>
          </div>

          {/* Retry Button */}
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full h-12 bg-accent-blue hover:bg-blue-600 text-white font-semibold text-lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          )}
        </>
      )}
    </div>
  );
}