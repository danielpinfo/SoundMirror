import React, { useEffect, useState } from 'react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_articlearn/artifacts/q4s66aiu_LOGO.png';

export const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('drop'); // 'drop', 'impact', 'ripple', 'logo'
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Phase timing
    const dropTimer = setTimeout(() => setPhase('impact'), 1200);
    const rippleTimer = setTimeout(() => setPhase('ripple'), 1400);
    const logoTimer = setTimeout(() => setPhase('logo'), 1800);
    
    const completeTimer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearTimeout(dropTimer);
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
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0f172a 40%, #000000 100%)',
      }}
    >
      {/* Water surface at bottom - 45 degree perspective */}
      <div 
        className="absolute left-0 right-0"
        style={{
          bottom: '30%',
          height: '35%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(30, 41, 59, 0.3) 20%, rgba(15, 23, 42, 0.8) 100%)',
          transform: 'perspective(500px) rotateX(45deg)',
          transformOrigin: 'center top',
        }}
      />
      
      {/* Silver Water Drop */}
      <div 
        className={`absolute w-6 h-10 transition-all duration-1000 ease-in ${
          phase === 'drop' ? 'opacity-100' : 'opacity-0 scale-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 30%, #94a3b8 60%, #64748b 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          top: phase === 'drop' ? '45%' : '20%',
          left: '50%',
          marginLeft: '-12px',
          boxShadow: '0 0 20px rgba(241, 245, 249, 0.6), inset 0 -5px 10px rgba(100, 116, 139, 0.5)',
          animation: phase === 'drop' ? 'none' : 'dropFall 1.2s cubic-bezier(0.55, 0, 1, 0.45) forwards',
        }}
      />
      
      {/* Impact splash */}
      {(phase === 'impact' || phase === 'ripple' || phase === 'logo') && (
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Central splash */}
          <div 
            className="splash-particles"
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#e2e8f0',
              animation: 'splashUp 0.4s ease-out forwards',
            }}
          />
        </div>
      )}
      
      {/* Concentric Ripples - 45 degree view */}
      <div 
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -30%) perspective(500px) rotateX(55deg)',
          transformOrigin: 'center center',
        }}
      >
        {/* Ripple 1 */}
        <div 
          className={`absolute rounded-full border-2 transition-all ${
            phase === 'ripple' || phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            borderColor: 'rgba(226, 232, 240, 0.8)',
            animation: phase !== 'drop' && phase !== 'impact' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '0s',
          }}
        />
        
        {/* Ripple 2 */}
        <div 
          className={`absolute rounded-full border-2 transition-all ${
            phase === 'ripple' || phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            borderColor: 'rgba(203, 213, 225, 0.6)',
            animation: phase !== 'drop' && phase !== 'impact' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '0.3s',
          }}
        />
        
        {/* Ripple 3 */}
        <div 
          className={`absolute rounded-full border-2 transition-all ${
            phase === 'ripple' || phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            borderColor: 'rgba(148, 163, 184, 0.5)',
            animation: phase !== 'drop' && phase !== 'impact' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '0.6s',
          }}
        />
        
        {/* Ripple 4 */}
        <div 
          className={`absolute rounded-full border transition-all ${
            phase === 'ripple' || phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            borderColor: 'rgba(100, 116, 139, 0.4)',
            animation: phase !== 'drop' && phase !== 'impact' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '0.9s',
          }}
        />
        
        {/* Ripple 5 */}
        <div 
          className={`absolute rounded-full border transition-all ${
            phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '60px',
            height: '60px',
            marginLeft: '-30px',
            marginTop: '-30px',
            borderColor: 'rgba(71, 85, 105, 0.3)',
            animation: phase === 'logo' ? 'rippleExpand 2s ease-out forwards' : 'none',
            animationDelay: '1.2s',
          }}
        />
      </div>
      
      {/* Logo - fades in */}
      <div 
        className={`relative z-10 text-center transition-all duration-1000 ${
          phase === 'logo' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
        }`}
      >
        <img 
          src={LOGO_URL}
          alt="SoundMirror"
          className="h-28 md:h-36 mx-auto mb-4"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(148, 163, 184, 0.5))',
          }}
        />
        <p 
          className={`text-slate-400 text-base tracking-[0.3em] uppercase transition-opacity duration-700 ${
            phase === 'logo' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            fontFamily: 'Inter, sans-serif',
            transitionDelay: '0.3s',
          }}
        >
          Visual Speech Training
        </p>
      </div>
      
      {/* Ambient glow behind logo */}
      <div 
        className={`absolute w-80 h-80 rounded-full transition-opacity duration-1000 ${
          phase === 'logo' ? 'opacity-30' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(30, 64, 175, 0.1) 40%, transparent 70%)',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Custom styles */}
      <style jsx>{`
        @keyframes rippleExpand {
          0% {
            width: 40px;
            height: 40px;
            margin-left: -20px;
            margin-top: -20px;
            opacity: 0.9;
          }
          100% {
            width: 500px;
            height: 500px;
            margin-left: -250px;
            margin-top: -250px;
            opacity: 0;
          }
        }
        
        @keyframes dropFall {
          0% {
            top: 15%;
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 48%;
            opacity: 0;
          }
        }
        
        @keyframes splashUp {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(3) translateY(-20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
