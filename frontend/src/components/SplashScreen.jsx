import React, { useEffect, useState } from 'react';

const LOGO_URL = '/assets/LOGO.png';

// Water/background color - matte black with subtle reflective sheen
const WATER_COLOR = '#0a0a0a';

// Ripple configuration - exactly 6 rings spawning at 286ms intervals
const RIPPLE_COUNT = 6;
const RIPPLE_SPAWN_INTERVAL = 0.286; // seconds

export const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('drop'); // 'drop', 'ripple', 'logo', 'hold', 'fade'
  const [show, setShow] = useState(true);

  useEffect(() => {
    // PHASE 1: Droplet fall (0s → 2s)
    const rippleTimer = setTimeout(() => setPhase('ripple'), 2000);
    
    // PHASE 3: Logo fade-in (3s → 5s)
    const logoTimer = setTimeout(() => setPhase('logo'), 3000);
    
    // PHASE 4: Hold (5s → 8s)
    const holdTimer = setTimeout(() => setPhase('hold'), 5000);
    
    // Fade out and complete
    const fadeTimer = setTimeout(() => setPhase('fade'), 7500);
    const completeTimer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 8000);

    return () => {
      clearTimeout(rippleTimer);
      clearTimeout(logoTimer);
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div 
      data-testid="splash-screen"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ 
        background: WATER_COLOR,
        transition: phase === 'fade' ? 'opacity 0.5s ease-out' : 'none',
        opacity: phase === 'fade' ? 0 : 1,
      }}
    >
      {/* Silver Water Drop - falls to center, sharpens as it approaches */}
      <div 
        className={`absolute ${phase === 'drop' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          width: '15px',
          height: '25px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, #c0c0c0 20%, #e8e8e8 40%, #a8a8a8 70%, #808080 100%)',
          borderRadius: '50% 50% 40% 40% / 70% 70% 30% 30%',
          top: '50%',
          left: '50%',
          marginLeft: '-7.5px',
          marginTop: '-12.5px',
          boxShadow: '0 0 15px rgba(192, 192, 192, 0.4), inset 0 -5px 10px rgba(128, 128, 128, 0.4), inset 2px 0 8px rgba(255, 255, 255, 0.3)',
          animation: phase === 'drop' ? 'dropFall 2s cubic-bezier(0.55, 0, 1, 0.45) forwards' : 'none',
          transition: 'opacity 0.3s ease-out',
          filter: 'blur(1px)',
          animationTimingFunction: 'cubic-bezier(0.55, 0, 1, 0.45)',
        }}
      />
      
      {/* 6 SEPARATE Ripple Rings - each is an independent object spawning at 286ms intervals */}
      <div 
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) perspective(800px) rotateX(80deg)',
          transformOrigin: 'center center',
          pointerEvents: 'none',
          visibility: phase === 'ripple' || phase === 'logo' || phase === 'hold' ? 'visible' : 'hidden',
        }}
      >
        {/* Ring 1 - spawns at t=2.000s */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '50%',
            top: '50%',
            marginLeft: '-5px',
            marginTop: '-5px',
            border: '3px solid rgba(100, 120, 150, 0.9)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            animation: (phase === 'ripple' || phase === 'logo' || phase === 'hold') 
              ? 'rippleWave1 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' 
              : 'none',
            animationDelay: '0s',
            zIndex: 6,
          }}
        />
        
        {/* Ring 2 - spawns at t=2.286s */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '50%',
            top: '50%',
            marginLeft: '-5px',
            marginTop: '-5px',
            border: '3px solid rgba(100, 120, 150, 0.9)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            animation: (phase === 'ripple' || phase === 'logo' || phase === 'hold') 
              ? 'rippleWave2 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' 
              : 'none',
            animationDelay: '0.286s',
            zIndex: 5,
          }}
        />
        
        {/* Ring 3 - spawns at t=2.572s */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '50%',
            top: '50%',
            marginLeft: '-5px',
            marginTop: '-5px',
            border: '3px solid rgba(100, 120, 150, 0.9)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            animation: (phase === 'ripple' || phase === 'logo' || phase === 'hold') 
              ? 'rippleWave3 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' 
              : 'none',
            animationDelay: '0.572s',
            zIndex: 4,
          }}
        />
        
        {/* Ring 4 - spawns at t=2.858s */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '50%',
            top: '50%',
            marginLeft: '-5px',
            marginTop: '-5px',
            border: '3px solid rgba(100, 120, 150, 0.9)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            animation: (phase === 'ripple' || phase === 'logo' || phase === 'hold') 
              ? 'rippleWave4 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' 
              : 'none',
            animationDelay: '0.858s',
            zIndex: 3,
          }}
        />
        
        {/* Ring 5 - spawns at t=3.144s */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '50%',
            top: '50%',
            marginLeft: '-5px',
            marginTop: '-5px',
            border: '3px solid rgba(100, 120, 150, 0.9)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            animation: (phase === 'ripple' || phase === 'logo' || phase === 'hold') 
              ? 'rippleWave5 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' 
              : 'none',
            animationDelay: '1.144s',
            zIndex: 2,
          }}
        />
        
        {/* Ring 6 - spawns at t=3.430s */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '50%',
            top: '50%',
            marginLeft: '-5px',
            marginTop: '-5px',
            border: '3px solid rgba(100, 120, 150, 0.9)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            animation: (phase === 'ripple' || phase === 'logo' || phase === 'hold') 
              ? 'rippleWave6 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' 
              : 'none',
            animationDelay: '1.430s',
            zIndex: 1,
          }}
        />
      </div>
      
      {/* Logo - fades in at t=3s, holds through end */}
      <div 
        className={`relative z-10 text-center transition-opacity duration-2000 ${
          phase === 'logo' || phase === 'hold' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionDuration: '2000ms',
          transitionTimingFunction: 'ease-in-out',
        }}
      >
        <img 
          src={LOGO_URL}
          alt="SoundMirror"
          className="h-64 md:h-80 mx-auto"
          style={{ filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))' }}
        />
      </div>
      
      {/* Keyframe animations - 6 SEPARATE animations for 6 separate rings */}
      <style jsx>{`
        @keyframes dropFall {
          0% {
            top: 5%;
            opacity: 0.5;
            transform: scaleY(1);
            filter: blur(2px);
          }
          50% {
            opacity: 1;
            filter: blur(0.5px);
          }
          80% {
            opacity: 1;
            transform: scaleY(1.1);
            filter: blur(0px);
          }
          95% {
            top: 48%;
            opacity: 0.8;
            transform: scaleY(0.8) scaleX(1.2);
          }
          100% {
            top: 50%;
            opacity: 0;
            transform: scaleY(0.3) scaleX(1.5);
          }
        }
        
        @keyframes rippleWave1 {
          0% { width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; opacity: 0; }
          5% { opacity: 1; }
          20% { width: 120px; height: 120px; margin-left: -60px; margin-top: -60px; opacity: 0.9; }
          50% { width: 400px; height: 400px; margin-left: -200px; margin-top: -200px; opacity: 0.5; }
          80% { width: 800px; height: 800px; margin-left: -400px; margin-top: -400px; opacity: 0.15; }
          100% { width: 1200px; height: 1200px; margin-left: -600px; margin-top: -600px; opacity: 0; }
        }
        
        @keyframes rippleWave2 {
          0% { width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; opacity: 0; }
          5% { opacity: 1; }
          20% { width: 120px; height: 120px; margin-left: -60px; margin-top: -60px; opacity: 0.9; }
          50% { width: 400px; height: 400px; margin-left: -200px; margin-top: -200px; opacity: 0.5; }
          80% { width: 800px; height: 800px; margin-left: -400px; margin-top: -400px; opacity: 0.15; }
          100% { width: 1200px; height: 1200px; margin-left: -600px; margin-top: -600px; opacity: 0; }
        }
        
        @keyframes rippleWave3 {
          0% { width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; opacity: 0; }
          5% { opacity: 1; }
          20% { width: 120px; height: 120px; margin-left: -60px; margin-top: -60px; opacity: 0.9; }
          50% { width: 400px; height: 400px; margin-left: -200px; margin-top: -200px; opacity: 0.5; }
          80% { width: 800px; height: 800px; margin-left: -400px; margin-top: -400px; opacity: 0.15; }
          100% { width: 1200px; height: 1200px; margin-left: -600px; margin-top: -600px; opacity: 0; }
        }
        
        @keyframes rippleWave4 {
          0% { width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; opacity: 0; }
          5% { opacity: 1; }
          20% { width: 120px; height: 120px; margin-left: -60px; margin-top: -60px; opacity: 0.9; }
          50% { width: 400px; height: 400px; margin-left: -200px; margin-top: -200px; opacity: 0.5; }
          80% { width: 800px; height: 800px; margin-left: -400px; margin-top: -400px; opacity: 0.15; }
          100% { width: 1200px; height: 1200px; margin-left: -600px; margin-top: -600px; opacity: 0; }
        }
        
        @keyframes rippleWave5 {
          0% { width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; opacity: 0; }
          5% { opacity: 1; }
          20% { width: 120px; height: 120px; margin-left: -60px; margin-top: -60px; opacity: 0.9; }
          50% { width: 400px; height: 400px; margin-left: -200px; margin-top: -200px; opacity: 0.5; }
          80% { width: 800px; height: 800px; margin-left: -400px; margin-top: -400px; opacity: 0.15; }
          100% { width: 1200px; height: 1200px; margin-left: -600px; margin-top: -600px; opacity: 0; }
        }
        
        @keyframes rippleWave6 {
          0% { width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; opacity: 0; }
          5% { opacity: 1; }
          20% { width: 120px; height: 120px; margin-left: -60px; margin-top: -60px; opacity: 0.9; }
          50% { width: 400px; height: 400px; margin-left: -200px; margin-top: -200px; opacity: 0.5; }
          80% { width: 800px; height: 800px; margin-left: -400px; margin-top: -400px; opacity: 0.15; }
          100% { width: 1200px; height: 1200px; margin-left: -600px; margin-top: -600px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
