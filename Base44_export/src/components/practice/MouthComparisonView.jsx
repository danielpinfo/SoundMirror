import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Standard 22 Viseme system (Microsoft Azure Speech standard)
// Each viseme maps to specific phonemes and has precise mouth parameters
const VISEME_DATA = {
  0: { // Silence
    phonemes: ['sil'],
    mouthOpen: 0, lipWidth: 50, lipRound: 0, teethShow: 0, tonguePos: 50,
    upperLipCurve: 0, lowerLipCurve: 0, jawDrop: 0,
    description: 'Relaxed, closed'
  },
  1: { // æ, ə, ʌ
    phonemes: ['æ', 'ə', 'ʌ', 'a'],
    mouthOpen: 45, lipWidth: 65, lipRound: -5, teethShow: 60, tonguePos: 40,
    upperLipCurve: 5, lowerLipCurve: -5, jawDrop: 35,
    description: 'Open, relaxed lips'
  },
  2: { // ɑ
    phonemes: ['ɑ', 'aa', 'ah'],
    mouthOpen: 70, lipWidth: 55, lipRound: 10, teethShow: 80, tonguePos: 30,
    upperLipCurve: 0, lowerLipCurve: -10, jawDrop: 55,
    description: 'Wide open, jaw dropped'
  },
  3: { // ɔ
    phonemes: ['ɔ', 'aw', 'or'],
    mouthOpen: 50, lipWidth: 40, lipRound: 30, teethShow: 50, tonguePos: 35,
    upperLipCurve: -5, lowerLipCurve: 5, jawDrop: 40,
    description: 'Rounded, open'
  },
  4: { // ɛ, ʊ
    phonemes: ['ɛ', 'ʊ', 'e', 'uh'],
    mouthOpen: 35, lipWidth: 58, lipRound: 0, teethShow: 45, tonguePos: 50,
    upperLipCurve: 3, lowerLipCurve: -3, jawDrop: 25,
    description: 'Slightly open, neutral'
  },
  5: { // ɝ (er sound)
    phonemes: ['ɝ', 'er', 'ir', 'ur'],
    mouthOpen: 25, lipWidth: 45, lipRound: 20, teethShow: 30, tonguePos: 60,
    upperLipCurve: -3, lowerLipCurve: 3, jawDrop: 20,
    description: 'Slightly rounded, tongue curled'
  },
  6: { // j, i, ɪ
    phonemes: ['j', 'i', 'ɪ', 'ee', 'y'],
    mouthOpen: 20, lipWidth: 75, lipRound: -20, teethShow: 60, tonguePos: 80,
    upperLipCurve: 8, lowerLipCurve: -5, jawDrop: 12,
    description: 'Wide smile, teeth visible'
  },
  7: { // w, u
    phonemes: ['w', 'u', 'oo'],
    mouthOpen: 25, lipWidth: 25, lipRound: 60, teethShow: 10, tonguePos: 75,
    upperLipCurve: -10, lowerLipCurve: 10, jawDrop: 15,
    description: 'Tight pucker'
  },
  8: { // o
    phonemes: ['o', 'oh'],
    mouthOpen: 40, lipWidth: 35, lipRound: 45, teethShow: 30, tonguePos: 45,
    upperLipCurve: -8, lowerLipCurve: 8, jawDrop: 30,
    description: 'Rounded O shape'
  },
  9: { // aʊ (ow as in "cow")
    phonemes: ['aʊ', 'ow'],
    mouthOpen: 55, lipWidth: 45, lipRound: 25, teethShow: 60, tonguePos: 35,
    upperLipCurve: -5, lowerLipCurve: 5, jawDrop: 45,
    description: 'Open to rounded'
  },
  10: { // ɔɪ (oy as in "boy")
    phonemes: ['ɔɪ', 'oy'],
    mouthOpen: 45, lipWidth: 40, lipRound: 30, teethShow: 50, tonguePos: 45,
    upperLipCurve: -5, lowerLipCurve: 5, jawDrop: 35,
    description: 'Rounded, transitioning'
  },
  11: { // aɪ (eye)
    phonemes: ['aɪ', 'ai', 'ay', 'eye'],
    mouthOpen: 50, lipWidth: 60, lipRound: -5, teethShow: 65, tonguePos: 40,
    upperLipCurve: 5, lowerLipCurve: -5, jawDrop: 40,
    description: 'Open, moving to smile'
  },
  12: { // h
    phonemes: ['h'],
    mouthOpen: 30, lipWidth: 55, lipRound: 0, teethShow: 35, tonguePos: 50,
    upperLipCurve: 0, lowerLipCurve: 0, jawDrop: 25,
    description: 'Relaxed open, breathy'
  },
  13: { // ɹ (r)
    phonemes: ['ɹ', 'r'],
    mouthOpen: 22, lipWidth: 42, lipRound: 25, teethShow: 20, tonguePos: 65,
    upperLipCurve: -5, lowerLipCurve: 5, jawDrop: 18,
    description: 'Slightly rounded, tongue back'
  },
  14: { // l
    phonemes: ['l'],
    mouthOpen: 28, lipWidth: 52, lipRound: 0, teethShow: 45, tonguePos: 85,
    upperLipCurve: 3, lowerLipCurve: -3, jawDrop: 20,
    description: 'Open, tongue tip up'
  },
  15: { // s, z
    phonemes: ['s', 'z'],
    mouthOpen: 8, lipWidth: 70, lipRound: -15, teethShow: 70, tonguePos: 75,
    upperLipCurve: 5, lowerLipCurve: -3, jawDrop: 5,
    description: 'Teeth together, smile'
  },
  16: { // ʃ, tʃ, dʒ, ʒ (sh, ch, j, zh)
    phonemes: ['ʃ', 'tʃ', 'dʒ', 'ʒ', 'sh', 'ch'],
    mouthOpen: 18, lipWidth: 35, lipRound: 35, teethShow: 40, tonguePos: 70,
    upperLipCurve: -8, lowerLipCurve: 8, jawDrop: 12,
    description: 'Puckered, tongue raised'
  },
  17: { // ð, θ (th)
    phonemes: ['ð', 'θ', 'th'],
    mouthOpen: 15, lipWidth: 58, lipRound: 0, teethShow: 80, tonguePos: 95,
    upperLipCurve: 3, lowerLipCurve: -3, jawDrop: 10,
    description: 'Tongue between teeth'
  },
  18: { // f, v
    phonemes: ['f', 'v'],
    mouthOpen: 12, lipWidth: 55, lipRound: -5, teethShow: 70, tonguePos: 50,
    upperLipCurve: 5, lowerLipCurve: -15, jawDrop: 8,
    description: 'Lower lip under teeth'
  },
  19: { // d, t, n
    phonemes: ['d', 't', 'n'],
    mouthOpen: 18, lipWidth: 55, lipRound: 0, teethShow: 50, tonguePos: 90,
    upperLipCurve: 2, lowerLipCurve: -2, jawDrop: 12,
    description: 'Tongue on ridge'
  },
  20: { // k, g, ŋ
    phonemes: ['k', 'g', 'ŋ', 'ng'],
    mouthOpen: 22, lipWidth: 52, lipRound: 5, teethShow: 35, tonguePos: 25,
    upperLipCurve: 0, lowerLipCurve: 0, jawDrop: 18,
    description: 'Back tongue raised'
  },
  21: { // p, b, m
    phonemes: ['p', 'b', 'm'],
    mouthOpen: 0, lipWidth: 48, lipRound: 5, teethShow: 0, tonguePos: 50,
    upperLipCurve: -3, lowerLipCurve: 3, jawDrop: 0,
    description: 'Lips pressed together'
  }
};

// Map letters to viseme IDs
const getVisemeForLetter = (letter) => {
  const l = letter?.toLowerCase() || '';
  
  const letterToViseme = {
    'a': 1, 'e': 4, 'i': 6, 'o': 8, 'u': 7,
    'b': 21, 'c': 15, 'd': 19, 'f': 18, 'g': 20,
    'h': 12, 'j': 16, 'k': 20, 'l': 14, 'm': 21,
    'n': 19, 'p': 21, 'q': 20, 'r': 13, 's': 15,
    't': 19, 'v': 18, 'w': 7, 'x': 15, 'y': 6, 'z': 15
  };
  
  return letterToViseme[l] || 0;
};

// Realistic front-view mouth component using viseme data
function AnimatedMouth({ visemeId, isTarget, label }) {
  const v = VISEME_DATA[visemeId] || VISEME_DATA[0];
  
  // Calculate derived values
  const mouthHeight = v.mouthOpen * 0.6;
  const mouthWidth = 30 + v.lipWidth * 0.4;
  const lipThickness = 6 + (100 - v.mouthOpen) * 0.03;
  const teethHeight = Math.min(v.teethShow * 0.12, mouthHeight * 0.4);
  const cornerPull = v.lipRound * -0.15; // Negative = smile, Positive = pucker
  const puckerAmount = Math.max(0, v.lipRound) * 0.3;
  
  return (
    <div className={`p-4 rounded-xl ${isTarget ? 'bg-blue-50 border-2 border-blue-300' : 'bg-purple-50 border-2 border-purple-300'}`}>
      <p className={`text-sm font-semibold text-center mb-3 ${isTarget ? 'text-blue-900' : 'text-purple-900'}`}>
        {label}
      </p>
      
      {/* Front-view mouth SVG */}
      <svg viewBox="0 0 100 80" className="w-full h-36">
        <defs>
          <linearGradient id={`lipGrad-${isTarget}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8A0A0" />
            <stop offset="50%" stopColor="#D4736B" />
            <stop offset="100%" stopColor="#C45C5C" />
          </linearGradient>
          <linearGradient id={`innerMouth-${isTarget}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D0A0A" />
            <stop offset="100%" stopColor="#1A0505" />
          </linearGradient>
          <linearGradient id={`tongueGrad2-${isTarget}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E07070" />
            <stop offset="100%" stopColor="#B84848" />
          </linearGradient>
          <filter id={`lipShadow-${isTarget}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
          <clipPath id={`mouthClip-${isTarget}`}>
            <motion.ellipse
              initial={false}
              animate={{
                cx: 50,
                cy: 40,
                rx: mouthWidth / 2 - 2,
                ry: mouthHeight / 2 - 1
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </clipPath>
        </defs>

        {/* Skin/face background */}
        <rect x="5" y="5" width="90" height="70" rx="20" fill="#FFDFC4" />
        
        {/* Philtrum (upper lip groove) */}
        <motion.path
          initial={false}
          animate={{
            d: `M 47 ${22 - puckerAmount * 0.5} L 50 ${28 - puckerAmount} L 53 ${22 - puckerAmount * 0.5}`
          }}
          fill="none"
          stroke="#E8C4B8"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Outer lip shape (vermillion border) */}
        <motion.path
          initial={false}
          animate={{
            d: `M ${50 - mouthWidth/2 - 3 + cornerPull} ${40 - v.upperLipCurve * 0.1}
                C ${50 - mouthWidth/3} ${32 - puckerAmount - v.upperLipCurve * 0.3}, 
                  ${50 + mouthWidth/3} ${32 - puckerAmount - v.upperLipCurve * 0.3}, 
                  ${50 + mouthWidth/2 + 3 - cornerPull} ${40 - v.upperLipCurve * 0.1}
                C ${50 + mouthWidth/2 + 5 - cornerPull} ${40 + mouthHeight/2}, 
                  ${50 + mouthWidth/3} ${40 + mouthHeight + lipThickness + v.lowerLipCurve * 0.3}, 
                  50 ${40 + mouthHeight + lipThickness + 2 + v.lowerLipCurve * 0.2}
                C ${50 - mouthWidth/3} ${40 + mouthHeight + lipThickness + v.lowerLipCurve * 0.3}, 
                  ${50 - mouthWidth/2 - 5 + cornerPull} ${40 + mouthHeight/2}, 
                  ${50 - mouthWidth/2 - 3 + cornerPull} ${40 - v.upperLipCurve * 0.1}
                Z`
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          fill={`url(#lipGrad-${isTarget})`}
          filter={`url(#lipShadow-${isTarget})`}
        />

        {/* Inner mouth (dark cavity) */}
        <motion.ellipse
          initial={false}
          animate={{
            cx: 50,
            cy: 40,
            rx: mouthWidth / 2,
            ry: mouthHeight / 2
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          fill={`url(#innerMouth-${isTarget})`}
        />

        {/* Upper teeth */}
        {v.teethShow > 20 && mouthHeight > 5 && (
          <g clipPath={`url(#mouthClip-${isTarget})`}>
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.min(1, v.teethShow / 50) }}
              transition={{ duration: 0.15 }}
            >
              {[-12, -6, 0, 6, 12].map((offset, i) => (
                <motion.rect
                  key={`upper-${i}`}
                  initial={false}
                  animate={{
                    x: 47 + offset - 2,
                    y: 40 - mouthHeight/2,
                    width: 5,
                    height: Math.min(teethHeight, 8),
                    rx: 1
                  }}
                  transition={{ duration: 0.2 }}
                  fill="white"
                  stroke="#E8E8E8"
                  strokeWidth="0.3"
                />
              ))}
            </motion.g>
          </g>
        )}

        {/* Lower teeth (less visible) */}
        {v.teethShow > 40 && mouthHeight > 12 && (
          <g clipPath={`url(#mouthClip-${isTarget})`}>
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.min(0.8, (v.teethShow - 40) / 60) }}
              transition={{ duration: 0.15 }}
            >
              {[-9, -3, 3, 9].map((offset, i) => (
                <motion.rect
                  key={`lower-${i}`}
                  initial={false}
                  animate={{
                    x: 48 + offset - 2,
                    y: 40 + mouthHeight/2 - Math.min(teethHeight * 0.6, 5),
                    width: 4,
                    height: Math.min(teethHeight * 0.6, 5),
                    rx: 1
                  }}
                  transition={{ duration: 0.2 }}
                  fill="#F8F8F8"
                  stroke="#E0E0E0"
                  strokeWidth="0.2"
                />
              ))}
            </motion.g>
          </g>
        )}

        {/* Tongue */}
        {mouthHeight > 8 && (
          <g clipPath={`url(#mouthClip-${isTarget})`}>
            <motion.ellipse
              initial={false}
              animate={{
                cx: 50,
                cy: 40 + mouthHeight * 0.15 + (100 - v.tonguePos) * 0.08,
                rx: Math.min(mouthWidth * 0.4, 15),
                ry: Math.min(mouthHeight * 0.35, 8)
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              fill={`url(#tongueGrad2-${isTarget})`}
            />
            {/* Tongue highlight */}
            <motion.ellipse
              initial={false}
              animate={{
                cx: 50,
                cy: 40 + mouthHeight * 0.1 + (100 - v.tonguePos) * 0.08,
                rx: Math.min(mouthWidth * 0.25, 10),
                ry: Math.min(mouthHeight * 0.15, 4)
              }}
              transition={{ duration: 0.25 }}
              fill="#E88888"
              opacity="0.5"
            />
          </g>
        )}

        {/* Tongue tip (for TH sounds) */}
        {v.tonguePos > 90 && mouthHeight > 5 && (
          <motion.ellipse
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              cx: 50,
              cy: 40 - mouthHeight/2 + 3,
              rx: 6,
              ry: 4
            }}
            transition={{ duration: 0.2 }}
            fill="#D06060"
          />
        )}

        {/* Upper lip cupid's bow detail */}
        <motion.path
          initial={false}
          animate={{
            d: `M ${46 - puckerAmount * 0.5} ${36 - puckerAmount * 0.3 - v.upperLipCurve * 0.2}
                Q 50 ${34 - puckerAmount * 0.5 - v.upperLipCurve * 0.3} 
                  ${54 + puckerAmount * 0.5} ${36 - puckerAmount * 0.3 - v.upperLipCurve * 0.2}`
          }}
          transition={{ duration: 0.25 }}
          fill="none"
          stroke="#C06060"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Lower lip crease */}
        <motion.path
          initial={false}
          animate={{
            d: `M ${42 + cornerPull * 0.5} ${40 + mouthHeight/2 + lipThickness * 0.7}
                Q 50 ${40 + mouthHeight/2 + lipThickness + 1 + v.lowerLipCurve * 0.15}
                  ${58 - cornerPull * 0.5} ${40 + mouthHeight/2 + lipThickness * 0.7}`
          }}
          transition={{ duration: 0.25 }}
          fill="none"
          stroke="#B05050"
          strokeWidth="0.8"
          opacity="0.4"
        />

        {/* Lip corners (commissures) */}
        {mouthHeight > 3 && (
          <>
            <motion.circle
              initial={false}
              animate={{
                cx: 50 - mouthWidth/2 - 1 + cornerPull,
                cy: 40,
                r: 2
              }}
              fill="#C08080"
              opacity="0.5"
            />
            <motion.circle
              initial={false}
              animate={{
                cx: 50 + mouthWidth/2 + 1 - cornerPull,
                cy: 40,
                r: 2
              }}
              fill="#C08080"
              opacity="0.5"
            />
          </>
        )}

        {/* Chin dimple hint */}
        <motion.ellipse
          cx="50"
          initial={false}
          animate={{
            cy: 65 + v.jawDrop * 0.1
          }}
          rx="8"
          ry="3"
          fill="#E8C4B8"
          opacity="0.3"
        />
      </svg>
      
      {/* Description */}
      <p className="text-xs text-center text-slate-600 mt-2 font-medium">
        {v.description}
      </p>
    </div>
  );
}

export default function MouthComparisonView({ 
  targetPhonemes, 
  producedPhonemes,
  alignment 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const phonemes = alignment || targetPhonemes || [];

  useEffect(() => {
    let interval;
    if (isPlaying && phonemes.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= phonemes.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, phonemes.length]);

  if (!phonemes.length) {
    return (
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6 text-center text-slate-500">
          Record your pronunciation to see the comparison
        </CardContent>
      </Card>
    );
  }

  const currentPhoneme = phonemes[currentIndex];
  const letter = currentPhoneme?.letter?.toLowerCase() || '';
  const producedLetter = currentPhoneme?.producedLetter?.toLowerCase() || letter;
  
  const targetViseme = getVisemeForLetter(letter);
  const producedViseme = currentPhoneme?.status === 'match' ? targetViseme : getVisemeForLetter(producedLetter);

  const handlePrev = () => setCurrentIndex(Math.max(0, currentIndex - 1));
  const handleNext = () => setCurrentIndex(Math.min(phonemes.length - 1, currentIndex + 1));
  const handleReset = () => { setCurrentIndex(0); setIsPlaying(false); };

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mouth Shape Comparison</span>
          <span className="text-sm font-normal text-slate-500">
            {currentIndex + 1} / {phonemes.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current letter display */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-4"
            >
              <span className="text-5xl font-bold text-blue-600">
                {currentPhoneme?.letter?.toUpperCase()}
              </span>
              {currentPhoneme?.status === 'mismatch' && (
                <>
                  <span className="text-2xl text-slate-400">→</span>
                  <span className="text-5xl font-bold text-purple-600">
                    {currentPhoneme?.producedLetter?.toUpperCase() || '?'}
                  </span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          
          {currentPhoneme?.status && (
            <p className={`mt-2 text-sm font-semibold ${
              currentPhoneme.status === 'match' ? 'text-green-600' : 'text-amber-600'
            }`}>
              {currentPhoneme.status === 'match' ? '✓ Correct' : '✗ Needs work'}
            </p>
          )}
        </div>

        {/* Side-by-side mouth shapes */}
        <div className="grid grid-cols-2 gap-4">
          <AnimatedMouth 
            visemeId={targetViseme} 
            isTarget={true}
            label="Target Shape"
          />
          <AnimatedMouth 
            visemeId={producedViseme} 
            isTarget={false}
            label="Your Shape"
          />
        </div>

        {/* Phoneme progress bar */}
        <div className="flex gap-1 justify-center">
          {phonemes.map((p, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === currentIndex 
                  ? 'bg-blue-600 text-white scale-110' 
                  : p.status === 'match'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              {p.letter?.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Playback controls */}
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex === phonemes.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}