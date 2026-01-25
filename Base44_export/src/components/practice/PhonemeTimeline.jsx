import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Volume2 } from 'lucide-react';
import { speak as speakText } from './base44Speech';

export default function PhonemeTimeline({ 
  phonemes = [], 
  scores = [], // Array of scores (0-1) per phoneme
  currentIndex = 0,
  onPhonemeClick,
  showScores = true,
  interactive = true
}) {
  if (!phonemes || phonemes.length === 0) return null;

  const getScoreColor = (score) => {
    if (score === undefined || score === null) return 'bg-slate-200 border-slate-300';
    if (score >= 0.8) return 'bg-green-100 border-green-400';
    if (score >= 0.5) return 'bg-amber-100 border-amber-400';
    return 'bg-red-100 border-red-400';
  };

  const getScoreTextColor = (score) => {
    if (score === undefined || score === null) return 'text-slate-600';
    if (score >= 0.8) return 'text-green-700';
    if (score >= 0.5) return 'text-amber-700';
    return 'text-red-700';
  };

  const getScoreIcon = (score) => {
    if (score === undefined || score === null) return null;
    if (score >= 0.8) return <CheckCircle2 className="h-3 w-3 text-green-600" />;
    if (score >= 0.5) return <AlertCircle className="h-3 w-3 text-amber-600" />;
    return <XCircle className="h-3 w-3 text-red-600" />;
  };

  const speakPhoneme = async (phoneme, e) => {
    e?.stopPropagation();
    if (!phoneme?.letter) return;
    try {
      await speakText(phoneme.letter, {
        lang: "en-US"
      });
    } catch (err) {
      console.warn("Speech failed:", err);
    }
  };

  return (
    <div className="w-full">
      {/* Timeline bar */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / phonemes.length) * 100}%` }}
        />

        {/* Phoneme nodes */}
        <div className="relative flex justify-between">
          {phonemes.map((phoneme, index) => {
            const score = scores[index];
            const isActive = index === currentIndex;
            const isPast = index < currentIndex;
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center"
              >
                {/* Node */}
                <button
                  onClick={() => {
                    if (interactive && onPhonemeClick) {
                      onPhonemeClick(index, phoneme);
                    }
                  }}
                  disabled={!interactive}
                  className={`
                    relative w-12 h-12 rounded-full border-2 flex items-center justify-center
                    font-bold text-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg' 
                      : showScores && score !== undefined
                        ? `${getScoreColor(score)} ${getScoreTextColor(score)}`
                        : isPast
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-slate-300 text-slate-600'
                    }
                    ${interactive ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  `}
                >
                  {phoneme.letter}
                  
                  {/* Score indicator */}
                  {showScores && score !== undefined && !isActive && (
                    <div className="absolute -top-1 -right-1">
                      {getScoreIcon(score)}
                    </div>
                  )}
                </button>

                {/* Score label */}
                {showScores && score !== undefined && (
                  <span className={`mt-1 text-xs font-medium ${getScoreTextColor(score)}`}>
                    {Math.round(score * 100)}%
                  </span>
                )}

                {/* Phonetic label */}
                <span className="mt-1 text-xs text-slate-500">
                  {phoneme.phonetic || phoneme.phoneme}
                </span>

                {/* Speak button */}
                {interactive && (
                  <button
                    onClick={(e) => speakPhoneme(phoneme, e)}
                    className="mt-1 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}