import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { FRAME_WIDTH, FRAME_HEIGHT, TOTAL_FRAMES, DISPLAY_SCALE } from '../../services/phonemeEngine';

/*
  DualHeadAnimator - Enhanced with Frame Interpolation
  
  Features:
  - CSS-based crossfade interpolation between frames
  - 1000ms pre-animation delay
  - Smooth 30 FPS playback
  - Front (MASTER) and Side (SLAVE) synchronized
*/

const DualHeadAnimator = forwardRef(function DualHeadAnimator(props, ref) {
  const {
    frontSrc = '/assets/sprites/front_master.png',
    sideSrc = '/assets/sprites/side_master.png',
    frameCount = TOTAL_FRAMES,
    frameWidth = FRAME_WIDTH,
    frameHeight = FRAME_HEIGHT,
    scale = DISPLAY_SCALE,
    timeline = null,
    targetFrame = 0,
    isPlaying = false,
    preDelay = 1000,  // 1 second delay before animation
    onAnimationComplete,
    onFrameChange,
    onDelayStart,
    onDelayEnd,
    showLabels = true,
    interpolate = true,  // Enable frame interpolation
  } = props;

  const [currentFrame, setCurrentFrame] = useState(0);
  const [prevFrame, setPrevFrame] = useState(0);
  const [blendProgress, setBlendProgress] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDelaying, setIsDelaying] = useState(false);
  
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const blendStartRef = useRef(null);
  const BLEND_DURATION = 80; // ms for crossfade

  useImperativeHandle(ref, () => ({
    seekToFrame: (f) => {
      const clamped = Math.max(0, Math.min(frameCount - 1, f));
      setPrevFrame(currentFrame);
      setCurrentFrame(clamped);
      setBlendProgress(0);
      blendStartRef.current = performance.now();
      onFrameChange?.(clamped);
    },
    seekToTime: (t) => {
      setCurrentTime(t);
      if (timeline) {
        const item = timeline.find(i => t >= i.start && t < i.end);
        if (item && item.frame !== currentFrame) {
          setPrevFrame(currentFrame);
          setCurrentFrame(item.frame);
          setBlendProgress(0);
          blendStartRef.current = performance.now();
          onFrameChange?.(item.frame);
        }
      }
    },
    getFrame: () => currentFrame,
    getTime: () => currentTime,
    getTotalDuration: () => timeline ? timeline[timeline.length - 1]?.end || 0 : 0,
  }));

  // Single frame mode - show neutral when not playing
  useEffect(() => {
    if (!timeline && !isPlaying) {
      setCurrentFrame(0);
      setPrevFrame(0);
    }
  }, [timeline, isPlaying]);

  // Animation with delay and interpolation
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsDelaying(false);
      return;
    }

    // Start with delay
    setIsDelaying(true);
    onDelayStart?.();

    const delayTimeout = setTimeout(() => {
      setIsDelaying(false);
      onDelayEnd?.();
      startAnimation();
    }, preDelay);

    function startAnimation() {
      let animationTimeline;
      
      if (!timeline || timeline.length === 0) {
        // Single letter animation: neutral -> consonant -> vowel -> neutral
        // For consonants, show consonant frame then vowel frame
        animationTimeline = [
          { frame: 0, start: 0, end: 150 },           // neutral
          { frame: targetFrame, start: 150, end: 450 }, // consonant/target
          { frame: 1, start: 450, end: 750 },          // vowel (ah)
          { frame: 0, start: 750, end: 900 },          // return to neutral
        ];
      } else {
        animationTimeline = timeline;
      }

      const totalDuration = animationTimeline[animationTimeline.length - 1]?.end || 1000;
      startTimeRef.current = performance.now();
      blendStartRef.current = performance.now();
      let lastFrame = 0;

      const tick = (now) => {
        const elapsed = now - startTimeRef.current;
        setCurrentTime(elapsed);

        // Update blend progress for interpolation
        if (interpolate && blendStartRef.current) {
          const blendElapsed = now - blendStartRef.current;
          if (blendElapsed < BLEND_DURATION) {
            setBlendProgress(blendElapsed / BLEND_DURATION);
          } else {
            setBlendProgress(1);
          }
        }

        if (elapsed >= totalDuration) {
          setPrevFrame(0);
          setCurrentFrame(0);
          setBlendProgress(1);
          setCurrentTime(0);
          onAnimationComplete?.();
          return;
        }

        // Find current frame from timeline
        const item = animationTimeline.find(i => elapsed >= i.start && elapsed < i.end);
        if (item && item.frame !== lastFrame) {
          setPrevFrame(lastFrame);
          setCurrentFrame(item.frame);
          setBlendProgress(0);
          blendStartRef.current = now;
          lastFrame = item.frame;
          onFrameChange?.(item.frame);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      clearTimeout(delayTimeout);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, timeline, targetFrame, preDelay, interpolate, onAnimationComplete, onFrameChange, onDelayStart, onDelayEnd]);

  // Display dimensions
  const displayWidth = Math.round(frameWidth * scale);
  const displayHeight = Math.round(frameHeight * scale);

  // Easing function for smooth interpolation
  const easeOutQuad = (t) => t * (2 - t);
  const easedBlend = easeOutQuad(blendProgress);

  // Render head with interpolation
  const renderHead = (src, label) => (
    <div style={{ textAlign: 'center' }}>
      {showLabels && (
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 8,
        }}>
          {label}
        </div>
      )}
      <div style={{
        position: 'relative',
        width: displayWidth,
        height: displayHeight,
        borderRadius: 12,
        border: '2px solid #1e3a5f',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 50, 100, 0.3)',
        overflow: 'hidden',
      }}>
        {/* Previous frame (fading out) */}
        {interpolate && prevFrame !== currentFrame && blendProgress < 1 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: displayWidth,
              height: displayHeight,
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `0px -${prevFrame * displayHeight}px`,
              backgroundSize: `${displayWidth}px ${displayHeight * frameCount}px`,
              opacity: 1 - easedBlend,
              transition: 'opacity 0.05s linear',
            }}
          />
        )}
        {/* Current frame */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: displayWidth,
            height: displayHeight,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `0px -${currentFrame * displayHeight}px`,
            backgroundSize: `${displayWidth}px ${displayHeight * frameCount}px`,
            opacity: interpolate ? easedBlend : 1,
            transition: 'opacity 0.05s linear',
          }}
        />
        {/* Delay indicator */}
        {isDelaying && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 20, 40, 0.6)',
          }}>
            <div style={{
              color: '#60a5fa',
              fontSize: 16,
              fontWeight: 600,
              animation: 'pulse 1s ease-in-out infinite',
            }}>
              Ready...
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
        {renderHead(frontSrc, 'Front View')}
        {renderHead(sideSrc, 'Side View')}
      </div>
      <div style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
        Frame: {currentFrame} / {frameCount - 1}
        {isDelaying && <span style={{ color: '#60a5fa', marginLeft: 12 }}>● Preparing...</span>}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
});

export default DualHeadAnimator;
