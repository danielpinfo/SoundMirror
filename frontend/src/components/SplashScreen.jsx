import React, { useEffect, useState } from 'react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_articlearn/artifacts/q4s66aiu_LOGO.png';

// Water/background color matching the logo background for seamless fade
const WATER_COLOR = '#0a0a0a';

export const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('drop'); // 'drop', 'ripple', 'logo', 'fade'
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Phase timing for 7 second total duration (6s animation + 1s fade)
    // Phase 1 (0-2s): Raindrop falling
    const rippleTimer = setTimeout(() => setPhase('ripple'), 2000);
    
    // Phase 2 (2-4s): Concentric ripples spreading
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
      {/* Silver Water Drop - HALF SIZE (15x25px instead of 30x50px) */}
      <div 
        className={`absolute ${phase === 'drop' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          width: '15px',
          height: '25px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, #c0c0c0 20%, #e8e8e8 40%, #a8a8a8 70%, #808080 100%)',
          borderRadius: '40% 40% 50% 50% / 30% 30% 70% 70%',
          top: '50%',
          left: '50%',
          marginLeft: '-7.5px',
          marginTop: '-12.5px',
          boxShadow: '0 0 15px rgba(192, 192, 192, 0.4), inset 0 -5px 10px rgba(128, 128, 128, 0.4), inset 2px 0 8px rgba(255, 255, 255, 0.3)',
          animation: phase === 'drop' ? 'dropFall 2s cubic-bezier(0.55, 0, 1, 0.45) forwards' : 'none',
          transition: 'opacity 0.3s ease-out',
        }}
      />
      
      {/* 7 Concentric Ripples - like ripples in a pond, all visible together */}
      <div 
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -30%) perspective(800px) rotateX(80deg)',
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
              // Start each ring at different sizes to show all 7 at once
              width: `${50 + (i * 80)}px`,
              height: `${50 + (i * 80)}px`,
              marginLeft: `-${25 + (i * 40)}px`,
              marginTop: `-${25 + (i * 40)}px`,
              border: `2px solid rgba(255, 255, 255, ${0.95 - (i * 0.1)})`,
              animation: (phase === 'ripple' || phase === 'logo' || phase === 'fade') 
                ? 'rippleExpandSlow 4s ease-out forwards' 
                : 'none',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      
      {/* Logo - NO drop-shadow/backlight effect */}
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
          }}
        >
          <img 
            src={LOGO_URL}
            alt="SoundMirror"
            className="h-32 md:h-40 mx-auto"
            // NO filter/drop-shadow - clean logo without backlight
          />
        </div>
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
        
        @keyframes rippleExpandSlow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
