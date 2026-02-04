import React, { useEffect, useState } from 'react';

const LOGO_URL = '/assets/LOGO.png';

// Water/background color matching the logo background for seamless fade
const WATER_COLOR = '#0a0a0a';

export const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('drop'); // 'drop', 'ripple', 'logo', 'fade'
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Phase timing
    // Phase 1 (0-2s): Raindrop falling
    const rippleTimer = setTimeout(() => setPhase('ripple'), 2000);
    
    // Phase 2 (2-3.7s): 7 ripples expanding (286ms apart, last one starts at ~3.7s)
    // Logo starts fading in at 5th ripple (around 3.14s)
    const logoTimer = setTimeout(() => setPhase('logo'), 3140);
    
    // Phase 3 (3.14-5.14s): Logo visible for 2 full seconds
    const fadeTimer = setTimeout(() => setPhase('fade'), 5140);
    
    // Phase 4 (5.14-6.14s): Fade to home page
    const completeTimer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 6140);

    return () => {
      clearTimeout(rippleTimer);
      clearTimeout(logoTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!show) return null;

  // 7 rings total for ripple effect
  const ringCount = 7;

  return (
    <div 
      data-testid="splash-screen"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ 
        background: WATER_COLOR,
        transition: phase === 'fade' ? 'opacity 1s ease-out' : 'none',
        opacity: phase === 'fade' ? 0 : 1,
      }}
    >
      {/* Silver Water Drop - HALF SIZE (15x25px) - falls to center pinpoint */}
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
        }}
      />
      
      {/* 7 Concentric Ripples - ALL start from tiny pinpoint center and expand outward */}
      <div 
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) perspective(800px) rotateX(80deg)',
          transformOrigin: 'center center',
        }}
      >
        {[...Array(ringCount)].map((_, i) => (
          <div 
            key={i}
            className={`absolute rounded-full ${
              phase === 'ripple' || phase === 'logo' || phase === 'fade' ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              // ALL rings start from the SAME tiny pinpoint (10px)
              width: '10px',
              height: '10px',
              left: '50%',
              top: '50%',
              marginLeft: '-5px',
              marginTop: '-5px',
              border: `2px solid rgba(255, 255, 255, 1)`,
              animation: (phase === 'ripple' || phase === 'logo' || phase === 'fade') 
                ? `rippleExpandForever 5s linear forwards` 
                : 'none',
              // 286ms delay between each ripple (2000ms / 7 = 286ms)
              animationDelay: `${i * 0.286}s`,
            }}
          />
        ))}
      </div>
      
      {/* Logo - fades in at 5th ripple, stays visible for 2 seconds */}
      <div 
        className={`relative z-10 text-center ${
          phase === 'logo' || phase === 'fade' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transition: phase === 'logo' ? 'opacity 1s ease-in' : phase === 'fade' ? 'opacity 1s ease-out' : 'none',
        }}
      >
        <img 
          src={LOGO_URL}
          alt="SoundMirror"
          className="h-32 md:h-40 mx-auto"
        />
      </div>
      
      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes dropFall {
          0% {
            top: 5%;
            opacity: 1;
            transform: scaleY(1);
          }
          80% {
            opacity: 1;
            transform: scaleY(1.1);
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
        
        @keyframes rippleExpandForever {
          0% {
            width: 10px;
            height: 10px;
            margin-left: -5px;
            margin-top: -5px;
            opacity: 1;
          }
          100% {
            width: 2000px;
            height: 2000px;
            margin-left: -1000px;
            margin-top: -1000px;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
