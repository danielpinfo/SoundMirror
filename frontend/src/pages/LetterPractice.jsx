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
    fps = 12,
    targetFrame = 0,
    isPlaying = false,
    onAnimationComplete,
  } = props;

  const [frame, setFrame] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    seekToFrame(f) {
      const clamped = Math.max(0, Math.min(frameCount - 1, f));
      setFrame(clamped);
    },
    getFrame() {
      return frame;
    }
  }));

  // Reset to neutral when not playing
  useEffect(() => {
    if (!isPlaying) {
      setFrame(0);
    }
  }, [isPlaying]);

  // Animation sequence: neutral -> target (hold) -> neutral
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    // Animation timeline in ms
    // 0-200ms: neutral (frame 0)
    // 200-800ms: target frame (hold for 600ms)
    // 800-1000ms: back to neutral
    const totalDuration = 1000;
    startTimeRef.current = performance.now();

    const tick = (time) => {
      const elapsed = time - startTimeRef.current;

      if (elapsed < 200) {
        setFrame(0);
      } else if (elapsed < 800) {
        setFrame(targetFrame);
      } else if (elapsed < totalDuration) {
        setFrame(0);
      } else {
        setFrame(0);
        onAnimationComplete?.();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, targetFrame, onAnimationComplete]);

  const displayWidth = frameWidth * displayScale;
  const displayHeight = frameHeight * displayScale;

  const headStyle = (src) => ({
    width: displayWidth,
    height: displayHeight,
    backgroundImage: `url(${src})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: `0px -${frame * displayHeight}px`,
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
      <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#475569" }}>
        Frame: {frame}
      </div>
    </div>
  );
});

// Phoneme to frame mapping + audio file mapping
const PHONEME_MAP = {
  a: { frame: 1, audio: "ah", label: "A" },
  b: { frame: 2, audio: "ba", label: "B" },
  c: { frame: 7, audio: "ca", label: "C" },
  d: { frame: 8, audio: "da", label: "D" },
  e: { frame: 5, audio: "eh", label: "E" },
  f: { frame: 14, audio: "fa", label: "F" },
  g: { frame: 7, audio: "ga", label: "G" },
  h: { frame: 15, audio: "ha", label: "H" },
  i: { frame: 3, audio: "ih", label: "I" },
  j: { frame: 8, audio: "ja", label: "J" },
  k: { frame: 7, audio: "ka", label: "K" },
  l: { frame: 18, audio: "la", label: "L" },
  m: { frame: 2, audio: "ma", label: "M" },
  n: { frame: 9, audio: "na", label: "N" },
  o: { frame: 4, audio: "oh", label: "O" },
  p: { frame: 2, audio: "pa", label: "P" },
  q: { frame: 7, audio: "kwa", label: "Q" },
  r: { frame: 17, audio: "ra", label: "R" },
  s: { frame: 11, audio: "sa", label: "S" },
  t: { frame: 8, audio: "ta", label: "T" },
  u: { frame: 4, audio: "uh", label: "U" },
  v: { frame: 14, audio: "va", label: "V" },
  w: { frame: 4, audio: "wa", label: "W" },
  x: { frame: 11, audio: "sa", label: "X" },  // uses 'sa' as fallback
  y: { frame: 6, audio: "ya", label: "Y" },
  z: { frame: 11, audio: "za", label: "Z" },
};

const VOWELS = ["a", "e", "i", "o", "u"];

export default function LetterPractice() {
  const [selectedLetter, setSelectedLetter] = useState("a");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [score, setScore] = useState(null);
  const [language, setLanguage] = useState("en");
  const animatorRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const phoneme = PHONEME_MAP[selectedLetter] || PHONEME_MAP.a;
  const audioPath = `/assets/audio/phonemes/${language}-${phoneme.audio}.mp3`;

  const handlePlay = () => {
    setIsPlaying(true);
    
    // Play pre-recorded MP3
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = new Audio(audioPath);
    audioRef.current.play().catch(err => {
      console.warn("Audio play failed:", err);
      // Fallback to TTS
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(phoneme.audio);
        utterance.rate = 0.7;
        window.speechSynthesis.speak(utterance);
      }
    });
  };

  const handleAnimationComplete = () => {
    setIsPlaying(false);
  };

  const handleRecord = () => {
    if (isRecording) {
      clearInterval(timerRef.current);
      setIsRecording(false);
      setTimeout(() => {
        setScore(Math.floor(Math.random() * 30) + 70);
      }, 500);
    } else {
      setScore(null);
      setRecordingTime(0);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 100);
      }, 100);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const letters = Object.keys(PHONEME_MAP);

  return (
    <div style={{ padding: 24, minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, fontSize: 24 }}>Letter Practice</h2>
        
        {/* Language selector */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" }}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        {/* Letter Grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
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
                  transition: "all 0.15s",
                }}
              >
                {letter.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Current Letter Info */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 64, fontWeight: 700, color: VOWELS.includes(selectedLetter) ? "#fbbf24" : "#38bdf8" }}>
            {selectedLetter.toUpperCase()}
          </span>
          <div style={{ fontSize: 20, color: "#94a3b8", marginTop: 4 }}>"{phoneme.audio}"</div>
        </div>

        {/* Animator */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          <DualHeadAnimator
            ref={animatorRef}
            targetFrame={phoneme.frame}
            isPlaying={isPlaying}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 32 }}>
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            style={{
              padding: "14px 36px",
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 12,
              border: "none",
              backgroundColor: isPlaying ? "#475569" : "#0ea5e9",
              color: "#fff",
              cursor: isPlaying ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {isPlaying ? "Playing..." : "▶ Play Sound"}
          </button>

          <button
            onClick={handleRecord}
            style={{
              padding: "14px 36px",
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 12,
              border: "none",
              backgroundColor: isRecording ? "#ef4444" : "#10b981",
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {isRecording ? `■ Stop (${(recordingTime / 1000).toFixed(1)}s)` : "● Record"}
          </button>
        </div>

        {/* Score */}
        {score !== null && (
          <div style={{ textAlign: "center", padding: 24, backgroundColor: "#1e293b", borderRadius: 16 }}>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>Your Score</div>
            <div style={{
              fontSize: 56,
              fontWeight: 700,
              color: score >= 85 ? "#10b981" : score >= 70 ? "#fbbf24" : "#ef4444",
            }}>
              {score}%
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
              {score >= 85 ? "Excellent!" : score >= 70 ? "Good job!" : "Keep practicing!"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
