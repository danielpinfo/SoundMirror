import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Viseme data for different phonemes
const VISEME_DATA = {
  0: { name: 'sil', jawOpen: 0, lipWidth: 1, lipPucker: 0, teethShow: 0, tongueOut: 0 },
  1: { name: 'aa', jawOpen: 0.8, lipWidth: 1.1, lipPucker: 0, teethShow: 0.7, tongueOut: 0 },
  2: { name: 'E', jawOpen: 0.4, lipWidth: 1.2, lipPucker: 0, teethShow: 0.5, tongueOut: 0 },
  3: { name: 'I', jawOpen: 0.2, lipWidth: 1.5, lipPucker: -0.2, teethShow: 0.6, tongueOut: 0 },
  4: { name: 'O', jawOpen: 0.5, lipWidth: 0.7, lipPucker: 0.6, teethShow: 0.3, tongueOut: 0 },
  5: { name: 'U', jawOpen: 0.25, lipWidth: 0.5, lipPucker: 0.9, teethShow: 0.1, tongueOut: 0 },
  6: { name: 'PP', jawOpen: 0, lipWidth: 0.95, lipPucker: 0.1, teethShow: 0, tongueOut: 0 },
  7: { name: 'FF', jawOpen: 0.15, lipWidth: 1.05, lipPucker: 0, teethShow: 0.8, tongueOut: 0, lowerLipIn: true },
  8: { name: 'TH', jawOpen: 0.2, lipWidth: 1.1, lipPucker: 0, teethShow: 0.6, tongueOut: 0.8 },
  9: { name: 'DD', jawOpen: 0.25, lipWidth: 1.1, lipPucker: 0, teethShow: 0.5, tongueOut: 0.2 },
  10: { name: 'kk', jawOpen: 0.3, lipWidth: 1.0, lipPucker: 0, teethShow: 0.4, tongueOut: 0 },
  11: { name: 'CH', jawOpen: 0.2, lipWidth: 0.75, lipPucker: 0.5, teethShow: 0.4, tongueOut: 0 },
  12: { name: 'SS', jawOpen: 0.1, lipWidth: 1.3, lipPucker: -0.1, teethShow: 0.8, tongueOut: 0 },
  13: { name: 'RR', jawOpen: 0.25, lipWidth: 0.85, lipPucker: 0.35, teethShow: 0.3, tongueOut: 0 },
  14: { name: 'nn', jawOpen: 0.2, lipWidth: 1.05, lipPucker: 0, teethShow: 0.4, tongueOut: 0.1 }
};

const getVisemeForLetter = (letter) => {
  const l = letter?.toLowerCase() || '';
  if (l === 'th') return 8;
  if (l === 'sh') return 11;
  if (l === 'ch') return 11;
  
  const mapping = {
    'a': 1, 'e': 2, 'i': 3, 'o': 4, 'u': 5,
    'b': 6, 'p': 6, 'm': 6,
    'f': 7, 'v': 7,
    'd': 9, 't': 9, 'n': 14, 'l': 9,
    'k': 10, 'g': 10,
    's': 12, 'z': 12, 'c': 12,
    'r': 13,
    'w': 5, 'y': 3, 'h': 1, 'j': 11
  };
  
  return mapping[l] ?? 0;
};

export default function AnimatedMouth({ 
  blendshapes, 
  targetPhoneme, 
  isTarget = false,
  width = 200,
  height = 160
}) {
  const visemeData = useMemo(() => {
    if (isTarget && targetPhoneme) {
      const viseme = getVisemeForLetter(targetPhoneme.letter);
      return VISEME_DATA[viseme] || VISEME_DATA[0];
    }
    if (blendshapes && typeof blendshapes === 'object') {
      // MediaPipe uses exact names like 'jawOpen', 'mouthPucker', 'mouthSmileLeft', etc.
      const jawOpen = blendshapes.jawOpen ?? 0;
      const pucker = blendshapes.mouthPucker ?? 0;
      const funnel = blendshapes.mouthFunnel ?? 0;
      const smileLeft = blendshapes.mouthSmileLeft ?? 0;
      const smileRight = blendshapes.mouthSmileRight ?? 0;
      const smile = (smileLeft + smileRight) / 2;
      const tongueOut = blendshapes.tongueOut ?? 0;
      
      // Return computed values - always return something based on the data
      return {
        jawOpen: Math.min(1, jawOpen),
        lipWidth: 1 + smile * 0.5 - pucker * 0.4,
        lipPucker: pucker + funnel * 0.5,
        teethShow: jawOpen > 0.15 ? 0.5 + jawOpen * 0.3 : 0,
        tongueOut: tongueOut
      };
    }
    // Return default closed mouth when no data
    return VISEME_DATA[0];
  }, [blendshapes, targetPhoneme, isTarget]);

  // Debug log to see what data is being received
  React.useEffect(() => {
    if (!isTarget && blendshapes) {
      console.log('AnimatedMouth blendshapes:', blendshapes);
    }
  }, [blendshapes, isTarget]);

  // Calculate mouth dimensions
  const baseWidth = 70;
  const baseHeight = 10;
  
  const mouthWidth = baseWidth * (visemeData.lipWidth || 1);
  const mouthHeight = baseHeight + visemeData.jawOpen * 45;
  const pucker = visemeData.lipPucker || 0;
  const tongueOut = visemeData.tongueOut || 0;
  const teethShow = visemeData.teethShow || 0;
  
  // Lip thickness varies with pucker
  const lipThickness = 8 + pucker * 4;
  
  // Mouth corner positions
  const cornerX = mouthWidth / 2;
  
  return (
    <div 
      className={`rounded-xl overflow-hidden border-2 flex items-center justify-center ${
        isTarget ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100' : 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100'
      }`}
      style={{ width, height }}
    >
      <svg viewBox="0 0 120 90" className="w-full h-full">
        <defs>
          {/* Skin gradient */}
          <radialGradient id={`skin-${isTarget}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFE4D0" />
            <stop offset="100%" stopColor="#FFCDB2" />
          </radialGradient>
          
          {/* Lip gradient */}
          <linearGradient id={`lip-${isTarget}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8A0A0" />
            <stop offset="50%" stopColor="#D47070" />
            <stop offset="100%" stopColor="#C45555" />
          </linearGradient>
          
          {/* Mouth cavity gradient */}
          <radialGradient id={`cavity-${isTarget}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2D0A0A" />
            <stop offset="100%" stopColor="#0D0202" />
          </radialGradient>
          
          {/* Tongue gradient */}
          <radialGradient id={`tongue-${isTarget}`} cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#E07070" />
            <stop offset="100%" stopColor="#C05050" />
          </radialGradient>
          
          {/* Lip shadow */}
          <filter id={`lipShadow-${isTarget}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Face background */}
        <ellipse 
          cx="60" cy="45" rx="55" ry="42" 
          fill={`url(#skin-${isTarget})`}
        />
        
        {/* Mouth cavity (dark interior) */}
        <motion.ellipse
          cx="60"
          initial={{ cy: 45, rx: 30, ry: 5 }}
          animate={{ 
            cy: 45 + visemeData.jawOpen * 5,
            rx: mouthWidth / 2 - 3,
            ry: Math.max(2, mouthHeight / 2 - 2)
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          fill={`url(#cavity-${isTarget})`}
        />
        
        {/* Upper teeth */}
        {teethShow > 0.2 && mouthHeight > 12 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(1, teethShow) }}
            transition={{ duration: 0.15 }}
          >
            {/* Teeth row */}
            <motion.rect
              x={60 - mouthWidth / 2.5}
              initial={{ y: 38, width: mouthWidth * 0.8, height: 0 }}
              animate={{ 
                y: 38 + visemeData.jawOpen * 2,
                width: mouthWidth * 0.8,
                height: Math.min(10, mouthHeight * 0.25)
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              rx="2"
              fill="white"
              stroke="#e0e0e0"
              strokeWidth="0.5"
            />
            {/* Tooth divisions */}
            {[...Array(6)].map((_, i) => (
              <motion.line
                key={i}
                x1={60 - mouthWidth / 3 + (i + 1) * (mouthWidth * 0.66 / 7)}
                x2={60 - mouthWidth / 3 + (i + 1) * (mouthWidth * 0.66 / 7)}
                y1={38 + visemeData.jawOpen * 2}
                initial={{ y2: 38 }}
                animate={{ y2: 38 + visemeData.jawOpen * 2 + Math.min(8, mouthHeight * 0.22) }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                stroke="#e8e8e8"
                strokeWidth="0.5"
              />
            ))}
          </motion.g>
        )}
        
        {/* Tongue */}
        {(mouthHeight > 15 || tongueOut > 0.3) && (
          <motion.ellipse
            initial={{ cx: 60, cy: 52, rx: 15, ry: 6, opacity: 0 }}
            animate={{ 
              cx: 60,
              cy: 48 + visemeData.jawOpen * 8 + tongueOut * 5,
              rx: Math.min(mouthWidth * 0.35, 18) - tongueOut * 3,
              ry: Math.min(mouthHeight * 0.25, 8) + tongueOut * 4,
              opacity: mouthHeight > 15 || tongueOut > 0.3 ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            fill={`url(#tongue-${isTarget})`}
          />
        )}
        
        {/* Tongue tip for TH sound */}
        {tongueOut > 0.5 && (
          <motion.ellipse
            initial={{ cx: 60, cy: 45, rx: 8, ry: 4, opacity: 0 }}
            animate={{ 
              cx: 60,
              cy: 45 + visemeData.jawOpen * 2,
              rx: 10 + tongueOut * 3,
              ry: 5 + tongueOut * 2,
              opacity: tongueOut
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            fill={`url(#tongue-${isTarget})`}
          />
        )}
        
        {/* Upper lip */}
        <motion.path
          initial={{ d: `M ${60 - cornerX} 45 Q 60 40, ${60 + cornerX} 45 Q 60 35, ${60 - cornerX} 45` }}
          animate={{
            d: `M ${60 - cornerX} ${45 - visemeData.jawOpen * 3}
                C ${60 - cornerX * 0.6} ${42 - visemeData.jawOpen * 5 - pucker * 5}, 
                  ${60 - 8} ${40 - visemeData.jawOpen * 4 - pucker * 6},
                  60 ${42 - visemeData.jawOpen * 3 - pucker * 4}
                C ${60 + 8} ${40 - visemeData.jawOpen * 4 - pucker * 6},
                  ${60 + cornerX * 0.6} ${42 - visemeData.jawOpen * 5 - pucker * 5},
                  ${60 + cornerX} ${45 - visemeData.jawOpen * 3}
                Q ${60 + cornerX * 0.3} ${45 - visemeData.jawOpen * 2 + lipThickness * 0.3},
                  60 ${45 - visemeData.jawOpen * 2 + lipThickness * 0.4}
                Q ${60 - cornerX * 0.3} ${45 - visemeData.jawOpen * 2 + lipThickness * 0.3},
                  ${60 - cornerX} ${45 - visemeData.jawOpen * 3}`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          fill={`url(#lip-${isTarget})`}
          filter={`url(#lipShadow-${isTarget})`}
        />
        
        {/* Lower lip */}
        <motion.path
          initial={{ d: `M ${60 - cornerX} 45 Q 60 50, ${60 + cornerX} 45 Q 60 55, ${60 - cornerX} 45` }}
          animate={{
            d: `M ${60 - cornerX} ${45 + visemeData.jawOpen * 3}
                Q ${60 - cornerX * 0.3} ${45 + visemeData.jawOpen * 2 - lipThickness * 0.3},
                  60 ${45 + visemeData.jawOpen * 2 - lipThickness * 0.4}
                Q ${60 + cornerX * 0.3} ${45 + visemeData.jawOpen * 2 - lipThickness * 0.3},
                  ${60 + cornerX} ${45 + visemeData.jawOpen * 3}
                C ${60 + cornerX * 0.6} ${48 + visemeData.jawOpen * 8 + pucker * 5},
                  ${60 + 10} ${50 + visemeData.jawOpen * 12 + pucker * 8},
                  60 ${48 + visemeData.jawOpen * 14 + pucker * 6}
                C ${60 - 10} ${50 + visemeData.jawOpen * 12 + pucker * 8},
                  ${60 - cornerX * 0.6} ${48 + visemeData.jawOpen * 8 + pucker * 5},
                  ${60 - cornerX} ${45 + visemeData.jawOpen * 3}`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          fill={`url(#lip-${isTarget})`}
          filter={`url(#lipShadow-${isTarget})`}
        />
        
        {/* Lip corners (for smile) */}
        <motion.circle
          cx={60 - cornerX - 2}
          initial={{ cy: 45, r: 3 }}
          animate={{ 
            cy: 45 + (visemeData.lipPucker < 0 ? -2 : visemeData.lipPucker * 2),
            r: 3 - visemeData.lipPucker * 0.5
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          fill={`url(#lip-${isTarget})`}
        />
        <motion.circle
          cx={60 + cornerX + 2}
          initial={{ cy: 45, r: 3 }}
          animate={{ 
            cy: 45 + (visemeData.lipPucker < 0 ? -2 : visemeData.lipPucker * 2),
            r: 3 - visemeData.lipPucker * 0.5
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          fill={`url(#lip-${isTarget})`}
        />
        
        {/* Highlight on upper lip */}
        <motion.ellipse
          cx="60"
          initial={{ cy: 40, rx: 15, ry: 2 }}
          animate={{ 
            cy: 40 - visemeData.jawOpen * 3,
            rx: 12 + pucker * 3,
            ry: 1.5 + pucker
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          fill="rgba(255,255,255,0.3)"
        />
      </svg>
    </div>
  );
}