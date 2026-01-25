import React from 'react';
import { motion } from 'framer-motion';

// Visual guide showing tongue, lip, and jaw positions
export default function ArticulationGuide({ phoneme, mouthShape, size = 'medium' }) {
  const dimensions = size === 'small' ? { w: 120, h: 100 } : { w: 180, h: 150 };
  
  // Default values
  const jawOpen = mouthShape?.jawOpen ?? 0.3;
  const lipRound = mouthShape?.lipRound ?? 0;
  const lipsClosed = mouthShape?.lipsClosed ?? false;
  const lipTeeth = mouthShape?.lipTeeth ?? false;
  const tonguePos = mouthShape?.tonguePosition ?? 'mid-central';
  const voiced = mouthShape?.voiced ?? false;

  // Calculate tongue position
  const getTonguePosition = () => {
    const positions = {
      'high-front': { cx: 55, cy: 45, angle: -20 },
      'high-back': { cx: 75, cy: 45, angle: 10 },
      'mid-front': { cx: 55, cy: 55, angle: -10 },
      'mid-central': { cx: 65, cy: 55, angle: 0 },
      'mid-back': { cx: 75, cy: 55, angle: 10 },
      'low-front': { cx: 55, cy: 65, angle: 0 },
      'low-back': { cx: 70, cy: 65, angle: 5 },
      'alveolar': { cx: 48, cy: 40, angle: -30, ridge: true },
      'dental': { cx: 42, cy: 42, angle: -35, betweenTeeth: true },
      'velar': { cx: 78, cy: 48, angle: 15 },
      'palatal': { cx: 58, cy: 42, angle: -15 },
      'postalveolar': { cx: 52, cy: 42, angle: -25 },
      'retroflex': { cx: 55, cy: 48, angle: -20, curled: true },
      'glottal': { cx: 65, cy: 55, angle: 0 },
    };
    return positions[tonguePos] || positions['mid-central'];
  };

  const tongueData = getTonguePosition();
  const mouthOpenAmount = lipsClosed ? 0 : jawOpen * 25;

  return (
    <div className="relative">
      <svg viewBox="0 0 100 90" width={dimensions.w} height={dimensions.h}>
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFDFC4" />
            <stop offset="100%" stopColor="#FFD0B0" />
          </linearGradient>
          <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E88080" />
            <stop offset="100%" stopColor="#C06060" />
          </linearGradient>
          <linearGradient id="lipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8A0A0" />
            <stop offset="100%" stopColor="#C45555" />
          </linearGradient>
        </defs>

        {/* Side profile head outline */}
        <path
          d="M 20 75 Q 15 50, 25 30 Q 35 10, 60 15 Q 85 20, 88 45 Q 90 60, 85 75 Q 70 85, 50 82 Q 30 80, 20 75"
          fill="url(#skinGrad)"
          stroke="#D4A480"
          strokeWidth="1.5"
        />

        {/* Mouth cavity */}
        <motion.ellipse
          cx="50"
          initial={{ cy: 58, rx: 18, ry: 8 }}
          animate={{ 
            cy: 58 + mouthOpenAmount / 3,
            rx: 18 - lipRound * 5,
            ry: Math.max(3, 8 + mouthOpenAmount / 2)
          }}
          transition={{ duration: 0.3 }}
          fill="#2D0A0A"
        />

        {/* Upper teeth */}
        {mouthOpenAmount > 3 && (
          <motion.rect
            x={38 + lipRound * 3}
            initial={{ y: 52 }}
            animate={{ 
              y: 52,
              width: 24 - lipRound * 6,
              height: Math.min(6, mouthOpenAmount / 3)
            }}
            transition={{ duration: 0.3 }}
            rx="1"
            fill="white"
            stroke="#e0e0e0"
            strokeWidth="0.3"
          />
        )}

        {/* Tongue */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: mouthOpenAmount > 5 ? 1 : 0,
            x: tongueData.cx - 65,
            y: tongueData.cy - 55
          }}
          transition={{ duration: 0.3 }}
        >
          <ellipse
            cx="65"
            cy="62"
            rx={tongueData.curled ? 10 : 14}
            ry="6"
            fill="url(#tongueGrad)"
            transform={`rotate(${tongueData.angle} 65 62)`}
          />
          {/* Tongue tip for dental/alveolar sounds */}
          {tongueData.ridge && (
            <circle cx="52" cy="54" r="4" fill="url(#tongueGrad)" />
          )}
          {tongueData.betweenTeeth && (
            <ellipse cx="45" cy="56" rx="5" ry="3" fill="url(#tongueGrad)" />
          )}
        </motion.g>

        {/* Upper lip */}
        <motion.path
          initial={{ d: "M 32 55 Q 50 50, 68 55 Q 50 52, 32 55" }}
          animate={{
            d: lipsClosed 
              ? "M 32 58 Q 50 56, 68 58 Q 50 57, 32 58"
              : lipTeeth
              ? "M 32 54 Q 50 50, 68 54 Q 50 52, 32 54"
              : `M ${32 + lipRound * 5} ${55 - mouthOpenAmount/4} Q 50 ${50 - mouthOpenAmount/3}, ${68 - lipRound * 5} ${55 - mouthOpenAmount/4} Q 50 ${52 - mouthOpenAmount/4}, ${32 + lipRound * 5} ${55 - mouthOpenAmount/4}`
          }}
          transition={{ duration: 0.3 }}
          fill="url(#lipGrad)"
        />

        {/* Lower lip */}
        <motion.path
          initial={{ d: "M 32 58 Q 50 62, 68 58 Q 50 65, 32 58" }}
          animate={{
            d: lipsClosed
              ? "M 32 58 Q 50 60, 68 58 Q 50 61, 32 58"
              : lipTeeth
              ? "M 32 60 Q 50 64, 68 60 Q 50 68, 32 60"
              : `M ${32 + lipRound * 5} ${58 + mouthOpenAmount/2} Q 50 ${62 + mouthOpenAmount}, ${68 - lipRound * 5} ${58 + mouthOpenAmount/2} Q 50 ${68 + mouthOpenAmount * 1.2}, ${32 + lipRound * 5} ${58 + mouthOpenAmount/2}`
          }}
          transition={{ duration: 0.3 }}
          fill="url(#lipGrad)"
        />

        {/* Lips closed indicator */}
        {lipsClosed && (
          <line x1="35" y1="58" x2="65" y2="58" stroke="#A06060" strokeWidth="1.5" />
        )}

        {/* Teeth on lip indicator for F/V */}
        {lipTeeth && (
          <g>
            <rect x="42" y="54" width="16" height="5" rx="1" fill="white" stroke="#e0e0e0" strokeWidth="0.3" />
            <line x1="45" y1="54" x2="45" y2="59" stroke="#e8e8e8" strokeWidth="0.3" />
            <line x1="50" y1="54" x2="50" y2="59" stroke="#e8e8e8" strokeWidth="0.3" />
            <line x1="55" y1="54" x2="55" y2="59" stroke="#e8e8e8" strokeWidth="0.3" />
          </g>
        )}

        {/* Voiced indicator */}
        {voiced && (
          <g>
            <motion.circle
              cx="75"
              cy="72"
              r="4"
              fill="none"
              stroke="#f97316"
              strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.circle
              cx="75"
              cy="72"
              r="7"
              fill="none"
              stroke="#f97316"
              strokeWidth="1"
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
          </g>
        )}

        {/* Phoneme label */}
        <text x="50" y="12" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3b82f6">
          {phoneme}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-1 text-[9px] text-slate-500 mt-1 justify-center">
        {tonguePos && tonguePos !== 'mid-central' && (
          <span className="px-1 bg-green-50 rounded">tongue: {tonguePos}</span>
        )}
        {voiced && (
          <span className="px-1 bg-orange-50 rounded">voiced</span>
        )}
      </div>
    </div>
  );
}