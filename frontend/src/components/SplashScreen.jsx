import React, { useEffect, useState } from 'react';

const WaterDropCanvas = ({ onComplete }) => {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const hasCompleted = React.useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dropRadius = 12;
    const impactY = centerY; // Mid-screen

    let time = 0;
    const duration = 8000; // 8 seconds total
    const startTime = Date.now();

    const drawBlackBackground = () => {
      ctx.fillStyle = '#0a0a0a'; // Matte black
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawDrop = (y, progress) => {
      // Drop sharpens as it approaches (blur effect via opacity)
      const sharpness = Math.min(1, progress * 2);
      
      // Bright silver drop
      const dropGradient = ctx.createRadialGradient(centerX, y - dropRadius * 0.3, 0, centerX, y, dropRadius);
      dropGradient.addColorStop(0, `rgba(255, 255, 255, ${0.5 + sharpness * 0.5})`);
      dropGradient.addColorStop(0.7, `rgba(192, 192, 192, ${sharpness})`);
      dropGradient.addColorStop(1, `rgba(160, 160, 160, ${sharpness})`);

      ctx.fillStyle = dropGradient;
      ctx.beginPath();
      ctx.arc(centerX, y, dropRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${sharpness * 0.8})`;
      ctx.beginPath();
      ctx.arc(centerX - dropRadius * 0.2, y - dropRadius * 0.2, dropRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawRipples = (elapsed) => {
      // 6 rings spawning at 286ms intervals
      const ringCount = 6;
      const spawnInterval = 286; // milliseconds
      
      for (let ring = 0; ring < ringCount; ring++) {
        const ringStartTime = ring * spawnInterval;
        const ringElapsed = elapsed - ringStartTime;
        
        if (ringElapsed < 0) continue; // Ring hasn't spawned yet
        
        const ringLifetime = 3000; // 3 seconds per ring
        const ringProgress = Math.min(ringElapsed / ringLifetime, 1);
        
        // Ease-out expansion
        const easeOut = 1 - Math.pow(1 - ringProgress, 3);
        
        // Expand to screen edges
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY) * 1.5;
        const radiusX = maxRadius * easeOut;
        const radiusY = radiusX * 0.35; // 80-degree perspective compression
        
        // Fade out as it expands
        const opacity = Math.max(0, 1 - ringProgress);
        
        // Soft-edged ring with blue glow
        ctx.strokeStyle = `rgba(100, 120, 150, ${opacity * 0.8})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(59, 130, 246, ${opacity * 0.4})`;
        
        ctx.beginPath();
        ctx.ellipse(centerX, impactY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      }
    };

    const logoImage = new Image();
    logoImage.src = '/assets/LOGO.png';
    
    const drawLogo = (opacity) => {
      if (!logoImage.complete) return;
      
      ctx.globalAlpha = opacity;
      
      // 3X larger logo (960px width)
      const logoWidth = 960;
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
      
      // Add subtle glow
      ctx.shadowBlur = 30;
      ctx.shadowColor = `rgba(59, 130, 246, ${opacity * 0.3})`;
      
      ctx.drawImage(
        logoImage,
        centerX - logoWidth / 2,
        impactY - logoHeight / 2,
        logoWidth,
        logoHeight
      );
      
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      const currentTime = Date.now();
      time = currentTime - startTime;
      const progress = Math.min(time / duration, 1);

      drawBlackBackground();

      // PHASE 1: Drop falls (0-2s, progress 0-0.25)
      if (progress < 0.25) {
        const dropProgress = progress / 0.25;
        const dropStartY = -dropRadius * 3;
        const dropY = dropStartY + dropProgress * (impactY - dropStartY);
        drawDrop(dropY, dropProgress);
      }

      // PHASE 2: Ripples (2-5s, progress 0.25-0.625)
      // Start at t=2s and continue through logo phase
      if (progress >= 0.25) {
        const rippleElapsed = (time - 2000); // Time since impact at t=2s
        drawRipples(rippleElapsed);
      }

      // PHASE 3: Logo fade-in (3-5s, progress 0.375-0.625)
      if (progress >= 0.375 && progress < 0.625) {
        const logoProgress = (progress - 0.375) / 0.25; // 2 second fade
        drawLogo(logoProgress);
      } else if (progress >= 0.625) {
        // PHASE 4: Logo holds (5-8s)
        drawLogo(1);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onComplete]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export const SplashScreen = ({ onComplete }) => {
  return (
    <div 
      data-testid="splash-screen"
      className="fixed inset-0 w-full h-screen overflow-hidden" 
      style={{ background: '#0a0a0a' }}
    >
      <WaterDropCanvas onComplete={onComplete} />
    </div>
  );
};

export default SplashScreen;
