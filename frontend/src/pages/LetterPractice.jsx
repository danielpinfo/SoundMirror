import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

/*
  DualHeadAnimator
  Front view is MASTER timeline.
  Side view is SLAVE and always mirrors the front frame index.
*/

const DualHeadAnimator = forwardRef((props, ref) => {
  const {
    frontSrc = "/assets/sprites/front_master.png",
    sideSrc = "/assets/sprites/side_master.png",
    frameCount = 20,
    frameWidth = 939,
    frameHeight = 793,
    displayScale = 0.35,
    fps = 24,
    targetFrame = 0,
    isPlaying = false,
    onAnimationComplete,
  } = props;

  const [frame, setFrame] = useState(targetFrame);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const startFrameRef = useRef(0);

  useImperativeHandle(ref, () => ({
    seekToFrame(f) {
      const clamped = Math.max(0, Math.min(frameCount - 1, f));
      setFrame(clamped);
    },
  }));

  // Reset to target frame when not playing
  useEffect(() => {
    if (!isPlaying) {
      setFrame(targetFrame);
    }
  }, [targetFrame, isPlaying]);

  // Animation loop - only runs when isPlaying
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const frameDuration = 1000 / fps;
    startFrameRef.current = targetFrame;
    lastTimeRef.current = 0;
    let frameIndex = 0;

    // Animate: neutral -> target -> neutral (3 frames total, hold target longer)
    const sequence = [0, targetFrame, targetFrame, targetFrame, 0];

    const tick = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;

      if (delta >= frameDuration * 4) { // Slower for clarity
        frameIndex++;
        if (frameIndex >= sequence.length) {
          setFrame(0);
          onAnimationComplete?.();
          return;
        }
        setFrame(sequence[frameIndex]);
        lastTimeRef.current = time;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, fps, frameCount, targetFrame, onAnimationComplete]);

  const displayWidth = frameWidth * displayScale;
  const displayHeight = frameHeight * displayScale;

  const bgPos = (f) => `0px -${f * displayHeight}px`;

  const headStyle = (src) => ({
    width: displayWidth,
    height: displayHeight,
    backgroundImage: `url(${src})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: bgPos(frame),
    backgroundSize: `${displayWidth}px ${displayHeight * frameCount}px`,
    borderRadius: 12,
    border: "2px solid #334155",
    backgroundColor: "#fff",
  });

  return (
    <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Front View</div>
        <div style={headStyle(frontSrc)} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Side View</div>
        <div style={headStyle(sideSrc)} />
      </div>
    </div>
  );
});

// Phoneme to frame mapping
const PHONEME_MAP = {
  a: { frame: 1, sound: "ah", label: "A" },
  b: { frame: 2, sound: "bah", label: "B" },
  c: { frame: 7, sound: "kah", label: "C" },
  d: { frame: 8, sound: "dah", label: "D" },
  e: { frame: 5, sound: "eh", label: "E" },
  f: { frame: 14, sound: "fah", label: "F" },
  g: { frame: 7, sound: "gah", label: "G" },
  h: { frame: 15, sound: "hah", label: "H" },
  i: { frame: 3, sound: "ee", label: "I" },
  j: { frame: 8, sound: "jah", label: "J" },
  k: { frame: 7, sound: "kah", label: "K" },
  l: { frame: 18, sound: "lah", label: "L" },
  m: { frame: 2, sound: "mah", label: "M" },
  n: { frame: 9, sound: "nah", label: "N" },
  o: { frame: 4, sound: "oh", label: "O" },
  p: { frame: 2, sound: "pah", label: "P" },
  q: { frame: 7, sound: "kwah", label: "Q" },
  r: { frame: 17, sound: "rah", label: "R" },
  s: { frame: 11, sound: "sss", label: "S" },
  t: { frame: 8, sound: "tah", label: "T" },
  u: { frame: 4, sound: "oo", label: "U" },
  v: { frame: 14, sound: "vah", label: "V" },
  w: { frame: 4, sound: "wah", label: "W" },
  x: { frame: 11, sound: "ks", label: "X" },
  y: { frame: 6, sound: "yah", label: "Y" },
  z: { frame: 11, sound: "zah", label: "Z" },
};

const VOWELS = ["a", "e", "i", "o", "u"];

export default function LetterPractice() {
  const [selectedLetter, setSelectedLetter] = useState("a");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [score, setScore] = useState(null);
  const animatorRef = useRef(null);
  const timerRef = useRef(null);

  const phoneme = PHONEME_MAP[selectedLetter] || PHONEME_MAP.a;

  const handlePlay = () => {
    setIsPlaying(true);
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(phoneme.sound);
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnimationComplete = () => {
    setIsPlaying(false);
  };

  const handleRecord = () => {
    if (isRecording) {
      // Stop recording
      clearInterval(timerRef.current);
      setIsRecording(false);
      // Simulate grading
      setTimeout(() => {
        setScore(Math.floor(Math.random() * 30) + 70);
      }, 500);
    } else {
      // Start recording
      setScore(null);
      setRecordingTime(0);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 100);
      }, 100);
    }
  };

  const letters = Object.keys(PHONEME_MAP);

  return (
    <div style={{ padding: 24, minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, fontSize: 24 }}>Letter Practice</h2>

      {/* Letter Grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32, maxWidth: 600, margin: "0 auto 32px" }}>
        {letters.map((letter) => {
          const isVowel = VOWELS.includes(letter);
          const isSelected = letter === selectedLetter;
          return (
            <button
              key={letter}
              onClick={() => { setSelectedLetter(letter); setScore(null); }}
              style={{
                width: 44,
                height: 44,
                fontSize: 18,
                fontWeight: 600,
                border: isSelected ? "2px solid #38bdf8" : "2px solid transparent",
                borderRadius: 8,
                backgroundColor: isSelected ? "#0ea5e9" : isVowel ? "#fbbf24" : "#334155",
                color: isSelected ? "#fff" : isVowel ? "#1e293b" : "#e2e8f0",
                cursor: "pointer",
              }}
            >
              {letter.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Current Letter Info */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 48, fontWeight: 700, color: VOWELS.includes(selectedLetter) ? "#fbbf24" : "#38bdf8" }}>
          {selectedLetter.toUpperCase()}
        </span>
        <div style={{ fontSize: 18, color: "#94a3b8", marginTop: 4 }}>"{phoneme.sound}"</div>
      </div>

      {/* Animator */}
      <DualHeadAnimator
        ref={animatorRef}
        targetFrame={phoneme.frame}
        isPlaying={isPlaying}
        onAnimationComplete={handleAnimationComplete}
      />

      {/* Controls */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32 }}>
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          style={{
            padding: "12px 32px",
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 12,
            border: "none",
            backgroundColor: isPlaying ? "#475569" : "#0ea5e9",
            color: "#fff",
            cursor: isPlaying ? "not-allowed" : "pointer",
          }}
        >
          {isPlaying ? "Playing..." : "▶ Play Sound"}
        </button>

        <button
          onClick={handleRecord}
          style={{
            padding: "12px 32px",
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 12,
            border: "none",
            backgroundColor: isRecording ? "#ef4444" : "#10b981",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isRecording ? `■ Stop (${(recordingTime / 1000).toFixed(1)}s)` : "● Record"}
        </button>
      </div>

      {/* Score */}
      {score !== null && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>Your Score</div>
          <div style={{
            fontSize: 48,
            fontWeight: 700,
            color: score >= 85 ? "#10b981" : score >= 70 ? "#fbbf24" : "#ef4444",
          }}>
            {score}%
          </div>
        </div>
      )}
    </div>
  );
}
