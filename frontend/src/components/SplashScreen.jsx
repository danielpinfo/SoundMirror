import React, { useEffect, useState } from 'react';

export const SplashScreen = ({ onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div 
      data-testid="splash-screen"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
      }}
    >
      {/* Water surface */}
      <div className="absolute bottom-1/3 left-0 right-0 h-1/3 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
      
      {/* Water drop */}
      <div 
        className="water-drop absolute w-8 h-12 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 50%, #64748b 100%)',
          top: '20%',
          boxShadow: '0 0 20px rgba(148, 163, 184, 0.5)',
        }}
      />
      
      {/* Ripple effects */}
      <div 
        className="ripple absolute w-40 h-40 rounded-full border-2 border-slate-400/60"
        style={{ 
          top: '50%', 
          left: '50%', 
          marginLeft: '-80px', 
          marginTop: '-40px',
          transformOrigin: 'center center',
        }}
      />
      <div 
        className="ripple-2 absolute w-40 h-40 rounded-full border-2 border-slate-400/40"
        style={{ 
          top: '50%', 
          left: '50%', 
          marginLeft: '-80px', 
          marginTop: '-40px',
          transformOrigin: 'center center',
        }}
      />
      <div 
        className="ripple-3 absolute w-40 h-40 rounded-full border-2 border-slate-400/30"
        style={{ 
          top: '50%', 
          left: '50%', 
          marginLeft: '-80px', 
          marginTop: '-40px',
          transformOrigin: 'center center',
        }}
      />
      
      {/* Logo */}
      <div className="logo-fade relative z-10 text-center">
        <h1 
          className="text-5xl md:text-7xl font-bold tracking-tight"
          style={{
            fontFamily: 'Manrope, sans-serif',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #64748b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 60px rgba(148, 163, 184, 0.3)',
          }}
        >
          SoundMirror
        </h1>
        <p 
          className="mt-4 text-slate-400 text-lg tracking-widest uppercase"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Visual Speech Training
        </p>
      </div>
      
      {/* Ambient glow */}
      <div 
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(2,132,199,0.3) 0%, transparent 70%)',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
};

export default SplashScreen;
