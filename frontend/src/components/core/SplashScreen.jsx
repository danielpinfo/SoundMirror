import { useEffect, useState, useRef } from 'react';

/*
  SplashScreen - Water Drop Animation
  
  A silver drop of water falls from top to bottom.
  Concentric silver rings expand from center at 45-degree angle.
  SoundMirror logo fades in.
  Duration: 4 seconds
*/

export default function SplashScreen({ onComplete }) {
  const [dropY, setDropY] = useState(-50);
  const [ringScale, setRingScale] = useState(0);
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [rippleActive, setRippleActive] = useState(false);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startRef.current;
      const progress = elapsed / 4000; // 4 seconds total

      if (progress >= 1) {
        onComplete?.();
        return;
      }

      // Drop falls from 0-60% of animation
      if (progress < 0.6) {
        const dropProgress = progress / 0.6;
        // Easing for natural fall
        const eased = dropProgress * dropProgress;
        setDropY(-50 + (eased * 550)); // Fall to center
      } else if (!rippleActive) {
        setRippleActive(true);
        setDropY(500);
      }

      // Ripples expand from 55-100%
      if (progress > 0.55) {
        const rippleProgress = (progress - 0.55) / 0.45;
        setRingScale(rippleProgress);
      }

      // Logo fades in from 60-100%
      if (progress > 0.6) {
        const logoProgress = (progress - 0.6) / 0.4;
        setLogoOpacity(logoProgress);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete, rippleActive]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#0a1628',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      {/* Water Drop */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: dropY,
          transform: 'translateX(-50%)',
          width: 20,
          height: 30,
          background: 'linear-gradient(180deg, #c0c0c0 0%, #e8e8e8 50%, #a0a0a0 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          boxShadow: '0 0 20px rgba(192, 192, 192, 0.6), inset 0 -5px 10px rgba(255,255,255,0.3)',
          opacity: rippleActive ? 0 : 1,
          transition: 'opacity 0.1s',
        }}
      />

      {/* Concentric Ripple Rings - 45 degree perspective */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) perspective(500px) rotateX(60deg)',
        opacity: rippleActive ? 1 : 0,
      }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const delay = i * 0.15;
          const adjustedScale = Math.max(0, ringScale - delay) / (1 - delay);
          const scale = adjustedScale * (1 + i * 0.5);
          const opacity = Math.max(0, 1 - adjustedScale * 1.2);
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 100,
                height: 100,
                marginTop: -50,
                marginLeft: -50,
                border: '2px solid',
                borderColor: `rgba(192, 192, 192, ${opacity})`,
                borderRadius: '50%',
                transform: `scale(${scale})`,
                boxShadow: `0 0 10px rgba(192, 192, 192, ${opacity * 0.5})`,
              }}
            />
          );
        })}
      </div>

      {/* Logo */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        opacity: logoOpacity,
        transform: `scale(${0.9 + logoOpacity * 0.1})`,
        transition: 'transform 0.3s ease-out',
      }}>
        <div style={{
          fontSize: 56,
          fontWeight: 700,
          color: '#e2e8f0',
          letterSpacing: '-1px',
          textShadow: '0 0 40px rgba(100, 150, 200, 0.4)',
        }}>
          SoundMirror
        </div>
        <div style={{
          fontSize: 16,
          color: '#64748b',
          marginTop: 8,
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}>
          See Speech
        </div>
      </div>
    </div>
  );
}
