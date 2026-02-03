import React, { useEffect, useState } from 'react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_articlearn/artifacts/q4s66aiu_LOGO.png';

export const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('drop'); // 'drop', 'splash', 'ripple', 'logo'
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Phase timing for 6 second total duration
    // Phase 1 (0-2s): Raindrop falling and splash
    const splashTimer = setTimeout(() => setPhase('splash'), 1800);
    
    // Phase 2 (2-4s): Concentric ripples spreading
    const rippleTimer = setTimeout(() => setPhase('ripple'), 2000);
    
    // Phase 3 (4-6s): Logo fading in
    const logoTimer = setTimeout(() => setPhase('logo'), 4000);
    
    // Complete at 6 seconds
    const completeTimer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 6000);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(rippleTimer);
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div 
      data-testid="splash-screen"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: '#000000' }}
    >
      {/* Silver Water Drop - Phase 1: First 2 seconds */}
      <div 
        className={`absolute transition-all ${
          phase === 'drop' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: '30px',
          height: '50px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, #c0c0c0 20%, #e8e8e8 40%, #a8a8a8 70%, #808080 100%)',
          borderRadius: '40% 40% 50% 50% / 30% 30% 70% 70%',
          top: phase === 'drop' ? '50%' : '10%',
          left: '50%',
          marginLeft: '-15px',
          marginTop: '-25px',
          boxShadow: '0 0 30px rgba(192, 192, 192, 0.5), inset 0 -10px 20px rgba(128, 128, 128, 0.4), inset 5px 0 15px rgba(255, 255, 255, 0.3)',
          animation: phase === 'drop' ? 'dropFall 1.8s cubic-bezier(0.55, 0, 1, 0.45) forwards' : 'none',
        }}
      />
      
      {/* White Liquid Splash - appears at impact */}
      {(phase === 'splash' || phase === 'ripple' || phase === 'logo') && (
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Central splash burst */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: '4px',
                height: '12px',
                background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)',
                borderRadius: '50%',
                left: '50%',
                top: '50%',
                transformOrigin: 'center center',
                animation: phase === 'splash' || phase === 'ripple' ? `splashBurst 0.6s ease-out forwards` : 'none',
                animationDelay: `${i * 0.03}s`,
                transform: `rotate(${i * 45}deg) translateY(-20px)`,
              }}
            />
          ))}
          {/* Central white glow */}
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0) 70%)',
              animation: phase === 'splash' || phase === 'ripple' ? 'splashGlow 0.5s ease-out forwards' : 'none',
            }}
          />
        </div>
      )}
      
      {/* Concentric Ripples - Phase 2: 2-4 seconds (45 degree perspective) */}
      <div 
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -30%) perspective(600px) rotateX(45deg)',
          transformOrigin: 'center center',
        }}
      >
        {/* Ripple 1 - deepest white */}
        <div 
          className={`absolute rounded-full transition-all ${
            phase === 'ripple' || phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            border: '3px solid rgba(255, 255, 255, 0.95)',
            animation: phase === 'ripple' || phase === 'logo' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '0s',
          }}
        />
        
        {/* Ripple 2 */}
        <div 
          className={`absolute rounded-full transition-all ${
            phase === 'ripple' || phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            border: '3px solid rgba(255, 255, 255, 0.85)',
            animation: phase === 'ripple' || phase === 'logo' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '0.25s',
          }}
        />
        
        {/* Ripple 3 */}
        <div 
          className={`absolute rounded-full transition-all ${
            phase === 'ripple' || phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            border: '2px solid rgba(255, 255, 255, 0.7)',
            animation: phase === 'ripple' || phase === 'logo' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '0.5s',
          }}
        />
        
        {/* Ripple 4 */}
        <div 
          className={`absolute rounded-full transition-all ${
            phase === 'ripple' || phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            border: '2px solid rgba(255, 255, 255, 0.55)',
            animation: phase === 'ripple' || phase === 'logo' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '0.75s',
          }}
        />
        
        {/* Ripple 5 */}
        <div 
          className={`absolute rounded-full transition-all ${
            phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            animation: phase === 'logo' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '1s',
          }}
        />
        
        {/* Ripple 6 */}
        <div 
          className={`absolute rounded-full transition-all ${
            phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            animation: phase === 'logo' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '1.25s',
          }}
        />
      </div>
      
      {/* Logo - Phase 3: 4-6 seconds (fades from 0% to 100% opacity) */}
      <div 
        className={`relative z-10 text-center transition-all duration-2000 ${
          phase === 'logo' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionDuration: '2000ms',
          transitionTimingFunction: 'ease-in',
        }}
      >
        <img 
          src={LOGO_URL}
          alt="SoundMirror"
          className="h-32 md:h-40 mx-auto"
          style={{
            filter: 'drop-shadow(0 0 50px rgba(192, 192, 192, 0.6))',
          }}
        />
      </div>
      
      {/* Custom styles */}
      <style jsx>{`
        @keyframes dropFall {
          0% {
            top: 10%;
            opacity: 1;
            transform: scaleY(1);
          }
          70% {
            opacity: 1;
            transform: scaleY(1.1);
          }
          90% {
            top: 48%;
            opacity: 1;
            transform: scaleY(0.9) scaleX(1.1);
          }
          100% {
            top: 50%;
            opacity: 0;
            transform: scaleY(0.5) scaleX(1.3);
          }
        }
        
        @keyframes rippleExpand {
          0% {
            width: 40px;
            height: 40px;
            margin-left: -20px;
            margin-top: -20px;
            opacity: 1;
          }
          100% {
            width: 600px;
            height: 600px;
            margin-left: -300px;
            margin-top: -300px;
            opacity: 0;
          }
        }
        
        @keyframes splashBurst {
          0% {
            opacity: 1;
            transform: rotate(inherit) translateY(0px) scale(1);
          }
          100% {
            opacity: 0;
            transform: rotate(inherit) translateY(-40px) scale(0.5);
          }
        }
        
        @keyframes splashGlow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
