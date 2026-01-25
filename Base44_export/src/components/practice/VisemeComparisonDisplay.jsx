import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Volume2, Info, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Mouth3DRenderer from './Mouth3DRenderer';
import AnimatedMouth from './AnimatedMouth';
import PinkTrombone from './PinkTrombone';
import { getTipForPhoneme, getFeedbackMessage } from './phonemeTips';
import { speak as speakText } from './base44Speech';
import { useTranslations } from './translations';

// Complete viseme definitions with target blendshape values
const VISEME_TARGETS = {
  // Silence
  0: {
    name: 'sil', phonemes: ['sil', ' '],
    jawOpen: 0, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0,
    description: 'Relaxed, lips together'
  },
  // Open vowels
  1: {
    name: 'aa', phonemes: ['a', 'ɑ', 'æ', 'ʌ', 'ah'],
    jawOpen: 0.6, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0.1,
    description: 'Wide open, tongue low'
  },
  2: {
    name: 'E', phonemes: ['e', 'ɛ', 'ə', 'eh'],
    jawOpen: 0.35, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0.2,
    description: 'Mid-open, relaxed'
  },
  3: {
    name: 'I', phonemes: ['i', 'ɪ', 'ee', 'y'],
    jawOpen: 0.15, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0.5,
    description: 'Smile wide, teeth visible'
  },
  4: {
    name: 'O', phonemes: ['o', 'ɔ', 'oh'],
    jawOpen: 0.4, mouthPucker: 0.4, mouthFunnel: 0.3, mouthSmile: 0,
    description: 'Round lips, open'
  },
  5: {
    name: 'U', phonemes: ['u', 'ʊ', 'oo', 'w'],
    jawOpen: 0.2, mouthPucker: 0.6, mouthFunnel: 0.2, mouthSmile: 0,
    description: 'Tight pucker'
  },
  // Consonants
  6: {
    name: 'PP', phonemes: ['p', 'b', 'm'],
    jawOpen: 0, mouthPucker: 0.1, mouthFunnel: 0, mouthSmile: 0, mouthClose: 0.8,
    description: 'Lips pressed together'
  },
  7: {
    name: 'FF', phonemes: ['f', 'v'],
    jawOpen: 0.1, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0,
    description: 'Lower lip under upper teeth'
  },
  8: {
    name: 'TH', phonemes: ['θ', 'ð', 'th'],
    jawOpen: 0.15, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0.1, tongueOut: 0.5,
    description: 'Tongue between teeth'
  },
  9: {
    name: 'DD', phonemes: ['d', 't', 'n', 'l'],
    jawOpen: 0.2, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0.1,
    description: 'Tongue tip on ridge'
  },
  10: {
    name: 'kk', phonemes: ['k', 'g', 'ŋ'],
    jawOpen: 0.25, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0,
    description: 'Back of tongue raised'
  },
  11: {
    name: 'CH', phonemes: ['ʃ', 'ʒ', 'tʃ', 'dʒ', 'sh', 'ch'],
    jawOpen: 0.2, mouthPucker: 0.3, mouthFunnel: 0.4, mouthSmile: 0,
    description: 'Lips pushed forward'
  },
  12: {
    name: 'SS', phonemes: ['s', 'z'],
    jawOpen: 0.08, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0.2,
    description: 'Teeth together, slight smile'
  },
  13: {
    name: 'RR', phonemes: ['r', 'ɹ'],
    jawOpen: 0.2, mouthPucker: 0.25, mouthFunnel: 0.15, mouthSmile: 0,
    description: 'Slightly rounded, tongue back'
  },
  14: {
    name: 'nn', phonemes: ['n', 'ŋ'],
    jawOpen: 0.15, mouthPucker: 0, mouthFunnel: 0, mouthSmile: 0.1,
    description: 'Tongue on roof of mouth'
  }
};

// Map letter to viseme
const getVisemeForLetter = (letter) => {
  const l = letter?.toLowerCase() || '';
  const mapping = {
    'a': 1, 'e': 2, 'i': 3, 'o': 4, 'u': 5,
    'b': 6, 'p': 6, 'm': 6,
    'f': 7, 'v': 7,
    'd': 9, 't': 9, 'n': 9, 'l': 9,
    'k': 10, 'g': 10,
    's': 12, 'z': 12, 'c': 12,
    'r': 13,
    'w': 5, 'y': 3, 'h': 0,
    'j': 11, 'x': 12, 'q': 10
  };
  return mapping[l] || 0;
};

// Calculate match score between current blendshapes and target viseme
const calculateMatchScore = (currentBlendshapes, targetViseme) => {
  const target = VISEME_TARGETS[targetViseme];
  if (!target || !currentBlendshapes) return 0;

  const weights = { jawOpen: 0.35, mouthPucker: 0.25, mouthFunnel: 0.2, mouthSmile: 0.2 };
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([key, weight]) => {
    const targetVal = target[key] || 0;
    const currentVal = currentBlendshapes[key] || 0;
    const diff = Math.abs(targetVal - currentVal);
    const score = Math.max(0, 1 - diff * 2); // Score decreases with difference
    totalScore += score * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

// Realistic mouth visualization using blendshapes
function MouthVisualization({ blendshapes, isTarget, label }) {
  const jawOpen = blendshapes?.jawOpen || 0;
  const pucker = blendshapes?.mouthPucker || 0;
  const funnel = blendshapes?.mouthFunnel || 0;
  const smile = blendshapes?.mouthSmile || 0;

  // Calculate mouth shape parameters
  const mouthHeight = 8 + jawOpen * 35;
  const mouthWidth = 35 + smile * 20 - pucker * 15;
  const roundness = (pucker + funnel) * 0.5;
  const lipThickness = 5 + (1 - jawOpen) * 2;

  return (
    <div className={`p-3 rounded-xl ${isTarget ? 'bg-blue-50 border-2 border-blue-300' : 'bg-purple-50 border-2 border-purple-300'}`}>
      <p className={`text-xs font-semibold text-center mb-2 ${isTarget ? 'text-blue-900' : 'text-purple-900'}`}>
        {label}
      </p>
      
      <svg viewBox="0 0 100 70" className="w-full h-28">
        <defs>
          <linearGradient id={`lip-${isTarget}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8A0A0" />
            <stop offset="100%" stopColor="#C45C5C" />
          </linearGradient>
          <linearGradient id={`mouth-${isTarget}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D0A0A" />
            <stop offset="100%" stopColor="#1A0505" />
          </linearGradient>
        </defs>

        {/* Face background */}
        <rect x="10" y="5" width="80" height="60" rx="20" fill="#FFDFC4" />

        {/* Outer lip shape */}
        <motion.ellipse
          initial={false}
          animate={{
            cx: 50,
            cy: 35,
            rx: mouthWidth / 2 + lipThickness,
            ry: mouthHeight / 2 + lipThickness + roundness * 3
          }}
          transition={{ duration: 0.15 }}
          fill={`url(#lip-${isTarget})`}
        />

        {/* Inner mouth (dark) */}
        <motion.ellipse
          initial={false}
          animate={{
            cx: 50,
            cy: 35,
            rx: mouthWidth / 2,
            ry: mouthHeight / 2
          }}
          transition={{ duration: 0.15 }}
          fill={`url(#mouth-${isTarget})`}
        />

        {/* Upper teeth */}
        {mouthHeight > 12 && (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(1, (mouthHeight - 10) / 15) }}
            x={50 - mouthWidth / 3}
            y={35 - mouthHeight / 2 + 2}
            width={mouthWidth * 0.66}
            height={Math.min(8, mouthHeight * 0.3)}
            rx="2"
            fill="white"
          />
        )}

        {/* Tongue */}
        {mouthHeight > 15 && (
          <motion.ellipse
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.9,
              cx: 50,
              cy: 35 + mouthHeight * 0.15,
              rx: Math.min(mouthWidth * 0.35, 12),
              ry: Math.min(mouthHeight * 0.25, 6)
            }}
            transition={{ duration: 0.15 }}
            fill="#D06060"
          />
        )}
      </svg>

    </div>
  );
}

export default function VisemeComparisonDisplay({ 
  currentBlendshapes, 
  blendshapeHistory,
  targetPhoneme, 
  phonemeSequence,
  currentIndex = 0,
  use3D = true,
  isInteractive = false
}) {
  const [matchScore, setMatchScore] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [selectedLang, setSelectedLang] = useState('en');
  
  useEffect(() => {
    setSelectedLang(localStorage.getItem('soundmirror_lang') || 'en');
  }, []);
  
  const t = useTranslations(selectedLang);

  // Use the interactive index if in interactive mode
  const displayIndex = isInteractive ? activeIndex : currentIndex;
  const displayPhoneme = isInteractive && phonemeSequence?.[activeIndex] ? phonemeSequence[activeIndex] : targetPhoneme;
  
  // Get blendshapes for the current phoneme from history
  const displayBlendshapes = React.useMemo(() => {
    if (!blendshapeHistory || blendshapeHistory.length === 0) {
      return currentBlendshapes;
    }
    // Map the active index to a position in the blendshape history
    const historyIndex = Math.floor((activeIndex / (phonemeSequence?.length || 1)) * blendshapeHistory.length);
    const historyEntry = blendshapeHistory[Math.min(historyIndex, blendshapeHistory.length - 1)];
    const result = historyEntry?.blendshapes || currentBlendshapes;
    console.log('VisemeComparisonDisplay - activeIndex:', activeIndex, 'historyIndex:', historyIndex, 'blendshapes:', result);
    return result;
  }, [activeIndex, blendshapeHistory, phonemeSequence, currentBlendshapes]);

  // Get target viseme for current phoneme
  const targetViseme = getVisemeForLetter(displayPhoneme?.letter);
  const targetData = VISEME_TARGETS[targetViseme];

  // Auto-play through phonemes
  const [isPlaying, setIsPlaying] = useState(false);
  const lastSpokenIndexRef = useRef(-1);
  
  const LANG_SPEECH_CODES = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
    it: 'it-IT', pt: 'pt-BR', zh: 'zh-CN', ja: 'ja-JP'
  };

  // Speak the target word (always the correct pronunciation, not what user said)
  const speakWord = async () => {
    const textToSpeak = displayPhoneme?.letter?.length === 1 && (!phonemeSequence || phonemeSequence.length === 1)
      ? displayPhoneme?.letter
      : (targetPhoneme?.targetWord || phonemeSequence?.map(p => p.letter).join('') || displayPhoneme?.letter || '');
    
    if (!textToSpeak) return;
    try {
      await speakText(textToSpeak, {
        lang: LANG_SPEECH_CODES[selectedLang] || 'en-US'
      });
    } catch (err) {
      console.warn("Speech failed:", err);
    }
  };
  
  useEffect(() => {
    if (!isInteractive || !isPlaying || !phonemeSequence) return;
    
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        if (prev >= phonemeSequence.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isPlaying, isInteractive, phonemeSequence]);

  // Handle play button - start from beginning and speak the full word
  const handlePlayToggle = () => {
    if (!isPlaying) {
      lastSpokenIndexRef.current = -1;
      setActiveIndex(0);
      setIsPlaying(true);
      speakWord();
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (phonemeSequence && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (phonemeSequence && activeIndex < phonemeSequence.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  useEffect(() => {
    if (displayBlendshapes && targetViseme !== undefined) {
      const score = calculateMatchScore(displayBlendshapes, targetViseme);
      setMatchScore(score);

      // Generate feedback
      const newFeedback = [];
      if (targetData) {
        const jawDiff = (targetData.jawOpen || 0) - (displayBlendshapes.jawOpen || 0);
        const puckerDiff = (targetData.mouthPucker || 0) - (displayBlendshapes.mouthPucker || 0);
        const smileDiff = (targetData.mouthSmile || 0) - (displayBlendshapes.mouthSmile || 0);

        if (Math.abs(jawDiff) > 0.15) {
          newFeedback.push(jawDiff > 0 ? t('openMouthMore') : t('closeMouthSlightly'));
        }
        if (Math.abs(puckerDiff) > 0.15) {
          newFeedback.push(puckerDiff > 0 ? t('roundLipsMore') : t('relaxLipRounding'));
        }
        if (Math.abs(smileDiff) > 0.15) {
          newFeedback.push(smileDiff > 0 ? t('spreadLipsWider') : t('relaxSmile'));
        }
      }
      setFeedback(newFeedback);
    }
  }, [displayBlendshapes, targetViseme]);

  const getScoreColor = () => {
    if (matchScore >= 0.8) return 'text-green-600';
    if (matchScore >= 0.5) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreIcon = () => {
    if (matchScore >= 0.8) return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    if (matchScore >= 0.5) return <AlertCircle className="h-6 w-6 text-amber-500" />;
    return <XCircle className="h-6 w-6 text-red-500" />;
  };

  // Create target blendshapes object from viseme data
  const targetBlendshapes = targetData ? {
    jawOpen: targetData.jawOpen,
    mouthPucker: targetData.mouthPucker,
    mouthFunnel: targetData.mouthFunnel,
    mouthSmile: targetData.mouthSmile
  } : {};

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-600" />
            {t('mouthShapeComparison')}
          </span>
          <div className="flex items-center gap-2">
            {getScoreIcon()}
            <span className={`text-2xl font-bold ${getScoreColor()}`}>
              {Math.round(matchScore * 100)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">



      </CardContent>
    </Card>
  );
}