import React, { useEffect, useState } from 'react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_articlearn/artifacts/q4s66aiu_LOGO.png';

// Water/background color matching the logo background for seamless fade
const WATER_COLOR = '#0a0a0a';

export const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('drop'); // 'drop', 'ripple', 'logo', 'fade'
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Phase timing for 7 second total duration (6s animation + 1s fade)
    // Phase 1 (0-2s): Raindrop falling (no splash effect)
    const rippleTimer = setTimeout(() => setPhase('ripple'), 2000);
    
    // Phase 2 (2-4s): Concentric ripples spreading (flatter angle, more rings)
    const logoTimer = setTimeout(() => setPhase('logo'), 4000);
    
    // Phase 3 (4-6s): Logo fading in
    const fadeTimer = setTimeout(() => setPhase('fade'), 6000);
    
    // Phase 4 (6-7s): Fade to home page
    const completeTimer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 7000);

    return () => {
      clearTimeout(rippleTimer);
      clearTimeout(logoTimer);
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
        transition: phase === 'fade' ? 'opacity 1s ease-out' : 'none',
        opacity: phase === 'fade' ? 0 : 1,
      }}
    >
      {/* Silver Water Drop - Phase 1: First 2 seconds (NO splash on impact) */}
      <div 
        className={`absolute transition-all ${
          phase === 'drop' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: '30px',
          height: '50px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, #c0c0c0 20%, #e8e8e8 40%, #a8a8a8 70%, #808080 100%)',
          borderRadius: '40% 40% 50% 50% / 30% 30% 70% 70%',
          top: '50%',
          left: '50%',
          marginLeft: '-15px',
          marginTop: '-25px',
          boxShadow: '0 0 30px rgba(192, 192, 192, 0.5), inset 0 -10px 20px rgba(128, 128, 128, 0.4), inset 5px 0 15px rgba(255, 255, 255, 0.3)',
          animation: phase === 'drop' ? 'dropFall 2s cubic-bezier(0.55, 0, 1, 0.45) forwards' : 'none',
        }}
      />
      
      {/* Concentric Ripples - Phase 2: 2-4 seconds 
          90 degree angle (flat, like looking down at water) 
          12 total rings (6 more than before) */}
      <div 
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          // 90 degree rotation = completely flat/horizontal perspective
          transform: 'translate(-50%, -30%) perspective(800px) rotateX(80deg)',
          transformOrigin: 'center center',
        }}
      >
        {/* Generate 12 ripple rings */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className={`absolute rounded-full ${
              phase === 'ripple' || phase === 'logo' || phase === 'fade' ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              width: '50px',
              height: '50px',
              marginLeft: '-25px',
              marginTop: '-25px',
              border: `${Math.max(1, 3 - Math.floor(i / 4))}px solid rgba(255, 255, 255, ${0.95 - (i * 0.07)})`,
              animation: (phase === 'ripple' || phase === 'logo' || phase === 'fade') 
                ? 'rippleExpand 2.5s ease-out forwards' 
                : 'none',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      
      {/* Logo - Phase 3: 4-6 seconds (fades from 0% to 100% opacity)
          Background blends with water color */}
      <div 
        className={`relative z-10 text-center ${
          phase === 'logo' || phase === 'fade' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transition: 'opacity 2s ease-in',
        }}
      >
        <div 
          style={{
            background: WATER_COLOR,
            padding: '20px 40px',
            borderRadius: '8px',
          }}
        >
          <img 
            src={LOGO_URL}
            alt="SoundMirror"
            className="h-32 md:h-40 mx-auto"
            style={{
              filter: 'drop-shadow(0 0 50px rgba(192, 192, 192, 0.4))',
            }}
          />
        </div>
      </div>
      
      {/* Custom keyframe styles */}
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
        
        @keyframes rippleExpand {
          0% {
            width: 30px;
            height: 30px;
            margin-left: -15px;
            margin-top: -15px;
            opacity: 1;
          }
          100% {
            width: 800px;
            height: 800px;
            margin-left: -400px;
            margin-top: -400px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
