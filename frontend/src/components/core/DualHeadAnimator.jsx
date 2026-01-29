import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { FRAME_WIDTH, FRAME_HEIGHT, TOTAL_FRAMES, DISPLAY_SCALE } from '../../services/phonemeEngine';

/*
  DualHeadAnimator - Core Animation Engine
  
  Front view is MASTER timeline.
  Side view is SLAVE and always mirrors the front frame index.
  
  Supports:
  - Single frame display (for letter practice)
  - Timeline-based animation (for word practice)
  - Frame scrubbing
  - 30 FPS playback with interpolation-ready architecture
*/

const DualHeadAnimator = forwardRef(function DualHeadAnimator(props, ref) {
  const {
    frontSrc = '/assets/sprites/front_master.png',
    sideSrc = '/assets/sprites/side_master.png',
    frameCount = TOTAL_FRAMES,
    frameWidth = FRAME_WIDTH,
    frameHeight = FRAME_HEIGHT,
    scale = DISPLAY_SCALE,
    timeline = null,       // Array of { frame, start, end }
    targetFrame = 0,       // For single frame mode
    isPlaying = false,
    onAnimationComplete,
    onFrameChange,
    showLabels = true,
  } = props;

  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  // Expose control methods
  useImperativeHandle(ref, () => ({
    seekToFrame: (f) => {
      const clamped = Math.max(0, Math.min(frameCount - 1, f));
      setCurrentFrame(clamped);
      onFrameChange?.(clamped);
    },
    seekToTime: (t) => {
      setCurrentTime(t);
      if (timeline) {
        const item = timeline.find(i => t >= i.start && t < i.end);
        if (item) {
          setCurrentFrame(item.frame);
          onFrameChange?.(item.frame);
        }
      }
    },
    getFrame: () => currentFrame,
    getTime: () => currentTime,
    getTotalDuration: () => timeline ? timeline[timeline.length - 1]?.end || 0 : 0,
  }));

  // Single frame mode (Letter Practice)
  useEffect(() => {
    if (!timeline && !isPlaying) {
      setCurrentFrame(targetFrame);
    }
  }, [targetFrame, timeline, isPlaying]);

  // Timeline animation mode (Word Practice)
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    if (!timeline || timeline.length === 0) {
      // Single frame animation: neutral -> target -> neutral
      const sequence = [
        { frame: 0, start: 0, end: 200 },
        { frame: targetFrame, start: 200, end: 800 },
        { frame: 0, start: 800, end: 1000 },
      ];
      runAnimation(sequence);
    } else {
      runAnimation(timeline);
    }

    function runAnimation(seq) {
      const totalDuration = seq[seq.length - 1]?.end || 1000;
      startTimeRef.current = performance.now();

      const tick = (now) => {
        const elapsed = now - startTimeRef.current;
        setCurrentTime(elapsed);

        if (elapsed >= totalDuration) {
          setCurrentFrame(0);
          setCurrentTime(0);
          onAnimationComplete?.();
          return;
        }

        // Find current frame from timeline
        const item = seq.find(i => elapsed >= i.start && elapsed < i.end);
        if (item && item.frame !== currentFrame) {
          setCurrentFrame(item.frame);
          onFrameChange?.(item.frame);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, timeline, targetFrame, onAnimationComplete, onFrameChange]);

  // Calculate display dimensions
  const displayWidth = Math.round(frameWidth * scale);
  const displayHeight = Math.round(frameHeight * scale);

  // Render a single head view
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
      <div
        style={{
          width: displayWidth,
          height: displayHeight,
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `0px -${currentFrame * displayHeight}px`,
          backgroundSize: `${displayWidth}px ${displayHeight * frameCount}px`,
          borderRadius: 12,
          border: '2px solid #1e3a5f',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 50, 100, 0.3)',
        }}
      />
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
      </div>
    </div>
  );
});

export default DualHeadAnimator;
