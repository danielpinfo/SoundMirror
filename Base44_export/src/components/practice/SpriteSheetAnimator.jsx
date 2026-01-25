import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * SpriteSheetAnimator
 * Displays frames from a 5120×512px sprite sheet (10 frames × 512px each)
 * Supports time-based animation with variable playback speed
 */
export default function SpriteSheetAnimator({
  spriteUrl,
  frameWidth = 512,
  frameHeight = 512,
  totalFrames = 10,
  isPlaying = false,
  playbackRate = 1.0,
  frameDuration = 100, // ms per frame at 1.0x speed
  onFrameChange = null,
  onAnimationComplete = null,
  maxWidth = 356,
  className = '',
  showFrame = true,
  onLoadStart = null,
  onLoadComplete = null,
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationTime, setAnimationTime] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const completedRef = useRef(false);

  // Preload image
  useEffect(() => {
    if (!spriteUrl) {
      setImageLoaded(false);
      return;
    }

    if (onLoadStart) onLoadStart();

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      if (onLoadComplete) onLoadComplete();
    };
    img.onerror = () => {
      console.warn(`Failed to load sprite: ${spriteUrl}`);
      setImageLoaded(false);
    };
    img.src = spriteUrl;
  }, [spriteUrl, onLoadStart, onLoadComplete]);

  // Time-based animation loop
  useEffect(() => {
    if (!isPlaying || !imageLoaded) return;

    completedRef.current = false;
    let animationFrameId;
    let lastUpdateTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateTime;
      lastUpdateTime = now;

      setAnimationTime((prevTime) => {
        const newTime = prevTime + deltaTime * playbackRate;
        const totalDuration = frameDuration * totalFrames;

        if (newTime >= totalDuration && !completedRef.current) {
          completedRef.current = true;
          if (onAnimationComplete) {
            onAnimationComplete();
          }
          return 0;
        }

        const frameIndex = Math.floor(newTime / frameDuration) % totalFrames;
        if (onFrameChange) {
          onFrameChange(frameIndex);
        }
        setCurrentFrame(frameIndex);

        return newTime;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, imageLoaded, playbackRate, frameDuration, totalFrames, onFrameChange, onAnimationComplete]);

  // Calculate background position for sprite sheet
  const backgroundPosition = useMemo(() => {
    return `${-currentFrame * frameWidth}px 0px`;
  }, [currentFrame, frameWidth]);

  const displayWidth = Math.min(frameWidth, maxWidth);
  const displayHeight = (displayWidth / frameWidth) * frameHeight;

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600 rounded-lg ${className}`}
      style={{
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        minWidth: `${displayWidth}px`,
        minHeight: `${displayHeight}px`,
      }}
    >
      {imageLoaded && spriteUrl ? (
        <div
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
            backgroundImage: `url(${spriteUrl})`,
            backgroundPosition,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${frameWidth * totalFrames}px ${frameHeight}px`,
            backgroundAttachment: 'fixed',
          }}
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          {spriteUrl ? (
            <>
              <div className="w-12 h-12 border-2 border-slate-500 border-t-blue-400 rounded-full animate-spin" />
              <div className="text-xs text-slate-500 font-medium">Loading sprite...</div>
            </>
          ) : (
            <div className="text-xs text-slate-500">No sprite</div>
          )}
        </div>
      )}
      
      {showFrame && imageLoaded && (
        <div className="absolute bottom-2 right-2 text-xs text-slate-300 bg-slate-900/90 px-2 py-1 rounded font-mono border border-slate-600">
          {currentFrame + 1}/{totalFrames}
        </div>
      )}
    </div>
  );
}