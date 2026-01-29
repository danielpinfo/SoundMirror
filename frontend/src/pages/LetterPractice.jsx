import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

/*
  DualHeadAnimator
  Front view is MASTER timeline.
  Side view is SLAVE and always mirrors the front frame index.
*/

const DualHeadAnimator = forwardRef((props, ref) => {
  const {
    frontSrc = "/sprites/front_master.png",
    sideSrc = "/sprites/side_master.png",
    frameCount = 20,
    frameWidth = 256,
    frameHeight = 256,
    fps = 24,
  } = props;

  // MASTER frame index
  const [frame, setFrame] = useState(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  // External control API (phoneme sync later)
  useImperativeHandle(ref, () => ({
    seekToFrame(f) {
      const clamped = Math.max(0, Math.min(frameCount - 1, f));
      setFrame(clamped);
    },
  }));

  // MASTER animation loop
  useEffect(() => {
    const frameDuration = 1000 / fps;

    const tick = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;

      if (delta >= frameDuration) {
        setFrame((f) => (f + 1) % frameCount);
        lastTimeRef.current = time;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fps, frameCount]);

  const bgPos = (f) => `-${f * frameWidth}px 0px`;

  const headStyle = (src) => ({
    width: frameWidth,
    height: frameHeight,
    backgroundImage: `url(${src})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: bgPos(frame), // SLAVE mirrors MASTER frame
    backgroundSize: `${frameWidth * frameCount}px ${frameHeight}px`,
    imageRendering: "pixelated",
    border: "1px solid #444",
  });

  return (
    <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
      <div>
        <div style={{ textAlign: "center", marginBottom: 4 }}>Front (Master)</div>
        <div style={headStyle(frontSrc)} />
      </div>

      <div>
        <div style={{ textAlign: "center", marginBottom: 4 }}>Side (Slave)</div>
        <div style={headStyle(sideSrc)} />
      </div>
    </div>
  );
});

export default function LetterPractice() {
  return (
    <div style={{ padding: 20 }}>
      <h2>SoundMirror Letter Practice</h2>
      <DualHeadAnimator />
    </div>
  );
}
