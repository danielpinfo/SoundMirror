import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

// Articulation states for key phonemes
// Values 0-1 representing tongue position from back to front (8 control points)
const ARTIC_STATES = {
  // Silence / rest position
  SIL: {
    tongue: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
    lips: 0.3,
    velum: 1.0,
    jawOpen: 0.1
  },
  // TH: tongue forward, near teeth (dental fricative)
  TH: {
    tongue: [0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 0.95, 0.98],
    lips: 0.2,
    velum: 1.0,
    jawOpen: 0.15
  },
  // R: tongue back and bunched/retroflex, lips slightly rounded
  R: {
    tongue: [0.3, 0.4, 0.6, 0.75, 0.85, 0.7, 0.5, 0.4],
    lips: 0.5,
    velum: 1.0,
    jawOpen: 0.25
  },
  // IY/EE: high front vowel, tongue front-high, lips spread
  IY: {
    tongue: [0.3, 0.35, 0.5, 0.7, 0.85, 0.9, 0.85, 0.7],
    lips: 0.1,
    velum: 1.0,
    jawOpen: 0.15
  },
  EE: {
    tongue: [0.3, 0.35, 0.5, 0.7, 0.85, 0.9, 0.85, 0.7],
    lips: 0.1,
    velum: 1.0,
    jawOpen: 0.15
  },
  // AA: open vowel, tongue low
  AA: {
    tongue: [0.3, 0.3, 0.3, 0.35, 0.4, 0.45, 0.5, 0.5],
    lips: 0.3,
    velum: 1.0,
    jawOpen: 0.7
  },
  A: {
    tongue: [0.3, 0.3, 0.3, 0.35, 0.4, 0.45, 0.5, 0.5],
    lips: 0.3,
    velum: 1.0,
    jawOpen: 0.7
  },
  // OO/U: back rounded vowel
  OO: {
    tongue: [0.6, 0.65, 0.7, 0.6, 0.5, 0.4, 0.35, 0.3],
    lips: 0.8,
    velum: 1.0,
    jawOpen: 0.25
  },
  U: {
    tongue: [0.6, 0.65, 0.7, 0.6, 0.5, 0.4, 0.35, 0.3],
    lips: 0.8,
    velum: 1.0,
    jawOpen: 0.25
  },
  // O: mid back rounded
  O: {
    tongue: [0.5, 0.55, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35],
    lips: 0.6,
    velum: 1.0,
    jawOpen: 0.4
  },
  // E: mid front vowel
  E: {
    tongue: [0.3, 0.35, 0.45, 0.55, 0.65, 0.7, 0.65, 0.55],
    lips: 0.2,
    velum: 1.0,
    jawOpen: 0.35
  },
  // I: near-high front vowel
  I: {
    tongue: [0.3, 0.35, 0.5, 0.65, 0.8, 0.85, 0.8, 0.65],
    lips: 0.15,
    velum: 1.0,
    jawOpen: 0.2
  },
  // Consonants
  // P/B/M: bilabial
  P: { tongue: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], lips: 0.95, velum: 1.0, jawOpen: 0.05 },
  B: { tongue: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], lips: 0.95, velum: 1.0, jawOpen: 0.05 },
  M: { tongue: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], lips: 0.95, velum: 0.0, jawOpen: 0.05 },
  // F/V: labiodental
  F: { tongue: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], lips: 0.7, velum: 1.0, jawOpen: 0.1 },
  V: { tongue: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], lips: 0.7, velum: 1.0, jawOpen: 0.1 },
  // T/D/N/L: alveolar
  T: { tongue: [0.3, 0.35, 0.4, 0.5, 0.6, 0.75, 0.9, 0.95], lips: 0.25, velum: 1.0, jawOpen: 0.15 },
  D: { tongue: [0.3, 0.35, 0.4, 0.5, 0.6, 0.75, 0.9, 0.95], lips: 0.25, velum: 1.0, jawOpen: 0.15 },
  N: { tongue: [0.3, 0.35, 0.4, 0.5, 0.6, 0.75, 0.9, 0.95], lips: 0.25, velum: 0.0, jawOpen: 0.15 },
  L: { tongue: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.85], lips: 0.25, velum: 1.0, jawOpen: 0.2 },
  // S/Z: alveolar fricative
  S: { tongue: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.8], lips: 0.2, velum: 1.0, jawOpen: 0.1 },
  Z: { tongue: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.8], lips: 0.2, velum: 1.0, jawOpen: 0.1 },
  // SH/CH/J: postalveolar
  SH: { tongue: [0.3, 0.4, 0.55, 0.7, 0.8, 0.85, 0.75, 0.6], lips: 0.5, velum: 1.0, jawOpen: 0.15 },
  CH: { tongue: [0.3, 0.4, 0.55, 0.7, 0.85, 0.9, 0.8, 0.65], lips: 0.5, velum: 1.0, jawOpen: 0.15 },
  J: { tongue: [0.3, 0.4, 0.55, 0.7, 0.85, 0.9, 0.8, 0.65], lips: 0.5, velum: 1.0, jawOpen: 0.15 },
  // K/G/NG: velar
  K: { tongue: [0.3, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.4], lips: 0.3, velum: 1.0, jawOpen: 0.2 },
  G: { tongue: [0.3, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.4], lips: 0.3, velum: 1.0, jawOpen: 0.2 },
  NG: { tongue: [0.3, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.4], lips: 0.3, velum: 0.0, jawOpen: 0.2 },
  // W: labial-velar approximant
  W: { tongue: [0.5, 0.55, 0.65, 0.6, 0.5, 0.4, 0.35, 0.3], lips: 0.85, velum: 1.0, jawOpen: 0.2 },
  // Y: palatal approximant
  Y: { tongue: [0.3, 0.4, 0.55, 0.7, 0.85, 0.9, 0.85, 0.7], lips: 0.15, velum: 1.0, jawOpen: 0.15 },
  // H: glottal
  H: { tongue: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], lips: 0.3, velum: 1.0, jawOpen: 0.3 }
};

// Linear interpolation between two articulation states
function lerpState(a, b, t) {
  const lerp = (x, y) => x + (y - x) * t;
  return {
    tongue: a.tongue.map((val, i) => lerp(val, b.tongue[i] || val)),
    lips: lerp(a.lips, b.lips),
    velum: lerp(a.velum, b.velum),
    jawOpen: lerp(a.jawOpen, b.jawOpen)
  };
}

// Get articulation state for a letter/phoneme
function getStateForPhoneme(phoneme) {
  const p = phoneme?.toUpperCase() || 'SIL';
  return ARTIC_STATES[p] || ARTIC_STATES.SIL;
}

// Convert word to phoneme sequence with timing
function wordToPhonemeSequence(word, phonemes) {
  if (!phonemes || phonemes.length === 0) {
    // Fallback: split by letters
    const letters = word.toUpperCase().split('').filter(l => /[A-Z]/.test(l));
    const duration = 0.15;
    return letters.map((letter, i) => ({
      phoneme: letter,
      start: i * duration,
      end: (i + 1) * duration
    }));
  }
  
  const duration = 0.18; // duration per phoneme
  return phonemes.map((p, i) => ({
    phoneme: p.letter?.toUpperCase() || p.phoneme?.toUpperCase() || 'SIL',
    start: i * duration,
    end: (i + 1) * duration
  }));
}

export default function PinkTrombone({ 
  targetPhoneme,
  phonemeSequence,
  currentIndex = 0,
  isAnimating = false,
  onAnimationComplete,
  width = 320,
  height = 200,
  showControls = true,
  word = ''
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentState, setCurrentState] = useState(ARTIC_STATES.SIL);
  const [activePhoneme, setActivePhoneme] = useState('');

  // Draw the vocal tract
  const draw = useCallback((state) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    
    // Draw vocal tract outline (side view of head/throat)
    const marginX = 30;
    const marginY = 25;
    const tractW = w - marginX * 2;
    const tractH = h - marginY * 2;
    
    // Nasal cavity (top)
    ctx.fillStyle = state.velum < 0.5 ? '#7c3aed' : '#1e293b';
    ctx.beginPath();
    ctx.moveTo(marginX + tractW * 0.3, marginY);
    ctx.quadraticCurveTo(marginX + tractW * 0.5, marginY + 15, marginX + tractW * 0.85, marginY + 10);
    ctx.lineTo(marginX + tractW * 0.85, marginY + 25);
    ctx.quadraticCurveTo(marginX + tractW * 0.5, marginY + 30, marginX + tractW * 0.3, marginY + 20);
    ctx.closePath();
    ctx.fill();
    
    // Velum indicator
    if (state.velum < 0.5) {
      ctx.fillStyle = '#a78bfa';
      ctx.font = '10px sans-serif';
      ctx.fillText('nasal', marginX + tractW * 0.5, marginY + 8);
    }
    
    // Pharynx/throat (back wall)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(marginX, marginY + 20);
    ctx.lineTo(marginX, marginY + tractH);
    ctx.stroke();
    
    // Tongue body (main curve)
    const tonguePoints = state.tongue;
    ctx.fillStyle = '#ec4899';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    
    // Calculate tongue curve points
    const tongueY = marginY + tractH * 0.4;
    const tongueBaseY = marginY + tractH * 0.85;
    const tongueStartX = marginX + 10;
    const tongueEndX = marginX + tractW * 0.9;
    
    ctx.beginPath();
    ctx.moveTo(tongueStartX, tongueBaseY);
    
    // Draw tongue surface
    tonguePoints.forEach((val, i) => {
      const t = i / (tonguePoints.length - 1);
      const x = tongueStartX + t * (tongueEndX - tongueStartX);
      const heightRange = tongueBaseY - tongueY;
      const y = tongueBaseY - val * heightRange * 0.9;
      
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        // Use quadratic curves for smooth tongue
        const prevT = (i - 1) / (tonguePoints.length - 1);
        const prevX = tongueStartX + prevT * (tongueEndX - tongueStartX);
        const cpX = (prevX + x) / 2;
        ctx.quadraticCurveTo(cpX, y, x, y);
      }
    });
    
    // Tongue tip
    const tipExtension = tonguePoints[7] > 0.8 ? 15 : 5;
    ctx.lineTo(tongueEndX + tipExtension, tongueBaseY - tonguePoints[7] * (tongueBaseY - tongueY) * 0.9);
    
    // Close tongue shape
    ctx.lineTo(tongueEndX + tipExtension, tongueBaseY + 10);
    ctx.lineTo(tongueStartX, tongueBaseY + 10);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    // Palate (roof of mouth)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(marginX + tractW * 0.15, marginY + 35);
    ctx.quadraticCurveTo(
      marginX + tractW * 0.5, marginY + 25,
      marginX + tractW * 0.85, marginY + 40
    );
    ctx.stroke();
    
    // Teeth
    const teethY = marginY + tractH * 0.35;
    ctx.fillStyle = '#e2e8f0';
    // Upper teeth
    ctx.fillRect(marginX + tractW * 0.82, teethY, 12, 15);
    // Lower teeth (position based on jaw)
    const lowerTeethY = teethY + 20 + state.jawOpen * 25;
    ctx.fillRect(marginX + tractW * 0.82, lowerTeethY, 12, 12);
    
    // Lips
    const lipX = marginX + tractW * 0.92;
    const lipOpenness = state.jawOpen * 30 + 5;
    const lipRoundness = state.lips;
    const lipWidth = 15 + lipRoundness * 10;
    
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2;
    
    // Upper lip
    ctx.beginPath();
    ctx.ellipse(lipX, teethY + 5, lipWidth, 8 - lipRoundness * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Lower lip
    ctx.beginPath();
    ctx.ellipse(lipX, lowerTeethY - 5, lipWidth, 8 - lipRoundness * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Lip opening indicator
    if (lipRoundness > 0.6) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(lipX, teethY + lipOpenness / 2 + 5, lipWidth * 0.5, lipOpenness / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Glottis/larynx indicator at bottom
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(marginX + 15, marginY + tractH - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#60a5fa';
    ctx.font = '9px sans-serif';
    ctx.fillText('voice', marginX + 5, marginY + tractH + 5);
    
    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('back', marginX + 5, marginY + tractH * 0.5);
    ctx.fillText('front', marginX + tractW * 0.75, marginY + tractH * 0.5);
    
  }, []);

  // Update display when state changes
  useEffect(() => {
    draw(currentState);
  }, [currentState, draw]);

  // Handle target phoneme changes
  useEffect(() => {
    if (targetPhoneme && !isPlaying) {
      const state = getStateForPhoneme(targetPhoneme.letter || targetPhoneme);
      setCurrentState(state);
      setActivePhoneme(targetPhoneme.letter || targetPhoneme);
    }
  }, [targetPhoneme, isPlaying]);

  // Animation through phoneme sequence
  const playSequence = useCallback(() => {
    if (!phonemeSequence || phonemeSequence.length === 0) return;
    
    const sequence = wordToPhonemeSequence(word, phonemeSequence);
    const totalDuration = sequence[sequence.length - 1].end * 1000;
    const startTime = performance.now();
    
    setIsPlaying(true);
    
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = elapsed / totalDuration;
      
      if (progress >= 1) {
        // Animation complete
        const lastState = getStateForPhoneme(sequence[sequence.length - 1].phoneme);
        setCurrentState(lastState);
        setActivePhoneme(sequence[sequence.length - 1].phoneme);
        setIsPlaying(false);
        onAnimationComplete?.();
        return;
      }
      
      const currentTime = progress * (totalDuration / 1000);
      
      // Find current and next segment
      let currentSeg = sequence[0];
      let nextSeg = sequence[1];
      
      for (let i = 0; i < sequence.length; i++) {
        if (currentTime >= sequence[i].start && currentTime <= sequence[i].end) {
          currentSeg = sequence[i];
          nextSeg = sequence[i + 1];
          break;
        }
      }
      
      setActivePhoneme(currentSeg.phoneme);
      
      const currentState = getStateForPhoneme(currentSeg.phoneme);
      
      if (nextSeg) {
        // Blend toward next phoneme for coarticulation
        const segProgress = (currentTime - currentSeg.start) / (currentSeg.end - currentSeg.start);
        const blendStart = 0.5; // Start blending halfway through
        
        if (segProgress > blendStart) {
          const blendProgress = (segProgress - blendStart) / (1 - blendStart);
          const nextState = getStateForPhoneme(nextSeg.phoneme);
          const blended = lerpState(currentState, nextState, blendProgress * 0.5);
          setCurrentState(blended);
        } else {
          setCurrentState(currentState);
        }
      } else {
        setCurrentState(currentState);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [phonemeSequence, word, onAnimationComplete]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Auto-play when isAnimating prop changes
  useEffect(() => {
    if (isAnimating && !isPlaying) {
      playSequence();
    }
  }, [isAnimating, isPlaying, playSequence]);

  const handlePlayClick = () => {
    if (isPlaying) {
      cancelAnimationFrame(animationRef.current);
      setIsPlaying(false);
    } else {
      playSequence();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={width} 
          height={height}
          className="rounded-xl border-2 border-slate-700"
        />
        
        {/* Current phoneme indicator */}
        {activePhoneme && (
          <div className="absolute top-2 right-2 px-3 py-1 bg-pink-600 text-white rounded-full text-sm font-bold">
            {activePhoneme}
          </div>
        )}
      </div>
      
      {showControls && phonemeSequence && phonemeSequence.length > 0 && (
        <Button
          onClick={handlePlayClick}
          size="sm"
          className="gap-2 bg-cyan-600 hover:bg-cyan-700"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? 'Pause' : `Play "${word}"`}
        </Button>
      )}
      
      {/* Phoneme sequence dots */}
      {phonemeSequence && phonemeSequence.length > 1 && (
        <div className="flex justify-center gap-1 flex-wrap">
          {phonemeSequence.map((p, i) => {
            const phoneme = p.letter?.toUpperCase() || p.phoneme?.toUpperCase() || '';
            return (
              <div
                key={i}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  activePhoneme === phoneme
                    ? 'bg-pink-600 text-white scale-110'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {phoneme}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Export articulation states for external use
export { ARTIC_STATES, getStateForPhoneme, lerpState };