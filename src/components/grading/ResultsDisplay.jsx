import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, ThumbsUp, AlertTriangle } from 'lucide-react';

export default function ResultsDisplay({
  audioGrade = 0,
  visualGrade = 0,
  targetPhoneme = '',
  detectedPhoneme = '',
  recordingUrl = null,
  onRetry
}) {
  const getGradeColor = (grade) => {
    if (grade >= 80) return '#10b981';
    if (grade >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getGradeLabel = (grade) => {
    if (grade >= 80) return 'Excellent';
    if (grade >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const overallGrade = Math.round((audioGrade + visualGrade) / 2);

  return (
    <div className="w-full space-y-6">
      <div className="backdrop-blur-sm rounded-xl p-6" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(192, 192, 192, 0.2)' }}>
        <h3 className="text-xl font-semibold text-white mb-4">Overall Score</h3>
        
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="rgba(192, 192, 192, 0.2)"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={getGradeColor(overallGrade)}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallGrade / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{overallGrade}</span>
              <span className="text-sm" style={{ color: '#c0c0c0' }}>/ 100</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            {overallGrade >= 80 ? <ThumbsUp className="w-4 h-4" style={{ color: '#10b981' }} /> : <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />}
            <span className="font-semibold" style={{ color: getGradeColor(overallGrade) }}>
              {getGradeLabel(overallGrade)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <p className="text-sm mb-2" style={{ color: '#c0c0c0' }}>Audio Grade</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{audioGrade}</span>
              <span className="text-sm" style={{ color: '#c0c0c0' }}>/ 100</span>
            </div>
            <div className="mt-2 h-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${audioGrade}%`, background: getGradeColor(audioGrade) }}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <p className="text-sm mb-2" style={{ color: '#c0c0c0' }}>Visual Grade</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{visualGrade}</span>
              <span className="text-sm" style={{ color: '#c0c0c0' }}>/ 100</span>
            </div>
            <div className="mt-2 h-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${visualGrade}%`, background: getGradeColor(visualGrade) }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <span style={{ color: '#c0c0c0' }}>Target:</span>
            <span className="font-mono font-bold text-white">{targetPhoneme}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <span style={{ color: '#c0c0c0' }}>You said:</span>
            <span className="font-mono font-bold text-white">{detectedPhoneme}</span>
          </div>
        </div>

        {recordingUrl && (
          <div className="mt-6">
            <p className="text-sm mb-2" style={{ color: '#c0c0c0' }}>Your Recording:</p>
            <video
              src={recordingUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
      </div>

      <Button
        onClick={onRetry}
        className="w-full text-white"
        style={{ background: '#0088cc' }}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}