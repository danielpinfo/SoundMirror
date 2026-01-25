import React, { useEffect, useMemo, useState, useRef } from "react";
import { symbolToViseme } from "./phonemeToViseme";
import HeadStage from "../HeadStage";

// Tunable timing constants (in milliseconds)
const POSE_CROSSFADE_MS = 380;           // Crossfade duration between poses (~180ms is fine)
const POSE_STAGE_DURATION_MS = 1500;     // Duration each pose is held in TTS sequence (1.5 seconds)

// Original working mouth cutout assets (showing actual different mouth shapes)
const POSE_IMAGES = {
  neutral: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/484afc043_bilabialnuetralrender.png",
  open: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ea6257525_A.png",
  smile: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/484afc043_bilabialnuetralrender.png",
  pucker: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/484afc043_bilabialnuetralrender.png",
  bilabial: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/a55664fdf_M.png",
  fv: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/9c6b0b404_F.png",
  th: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/523926045_TH.png",
  sibilant: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e6dea4aa9_SZC.png",
  r: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/073c9db7f_R.png"
};

function mapPhonemeToPose(phoneme) {
  return symbolToViseme(phoneme);
}

function getPoseSequenceForPhoneme(phoneme) {
  const raw = phoneme != null ? phoneme.toString() : "";
  const upper = raw.toUpperCase();
  const viseme = mapPhonemeToPose(phoneme);

  // Special sequences for some letters/sounds
  if (upper === "M") {
    return ["bilabial", "bilabial", "open"];
  }

  if (upper === "F" || upper === "V") {
    return ["fv", "open"];
  }

  if (upper === "S" || upper === "Z" || upper === "C" || upper === "X") {
    return ["sibilant", "open"];
  }

  if (upper === "TH") {
    return ["th", "open"];
  }

  if (upper === "P" || upper === "B") {
    return ["bilabial", "open"];
  }

  if (upper === "R") {
    return ["r", "open"];
  }

  if (upper === "A") {
    return ["open"];
  }

  // Fallback: just hold whatever viseme we mapped to
  return [viseme || "neutral"];
}

/**
 * RealisticMouthPose
 * - phoneme: letter/phoneme like "A", "th", "s", etc.
 * - crossfades between poses when the phoneme changes
 */
export default function RealisticMouthPose({
  phoneme,
  animationSequence = null,
  width = 220,
  height = 180,
  className = "",
  mouthAnimationKey,
}) {
  const pose = useMemo(() => mapPhonemeToPose(phoneme), [phoneme]);

  const [displayPose, setDisplayPose] = useState("neutral");
  const [nextPose, setNextPose] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const ttsTimeoutsRef = useRef([]);
  const lastAnimationKeyRef = useRef(mouthAnimationKey);

  const clearTtsAnimation = () => {
    ttsTimeoutsRef.current.forEach((id) => clearTimeout(id));
    ttsTimeoutsRef.current = [];
  };

  /**
   * Run a TTS pose sequence like ["bilabial", "open"].
   * - Each step gets POSE_STAGE_DURATION_MS.
   * - After the last pose, returns to "neutral" rest.
   */
  const runTtsPoseSequence = (sequence) => {
    if (!Array.isArray(sequence) || sequence.length === 0) return;

    // Cancel any previous TTS animation
    clearTtsAnimation();

    // Show first pose immediately
    setDisplayPose(sequence[0]);

    // Schedule each subsequent pose
    for (let i = 1; i < sequence.length; i++) {
      const poseKey = sequence[i];
      const timeoutId = setTimeout(() => {
        setDisplayPose(poseKey);
      }, i * POSE_STAGE_DURATION_MS);
      ttsTimeoutsRef.current.push(timeoutId);
    }

    // After the last pose has been visible for one full duration, return to neutral rest
    const finalTimeoutId = setTimeout(() => {
      setDisplayPose("neutral");
    }, sequence.length * POSE_STAGE_DURATION_MS);
    ttsTimeoutsRef.current.push(finalTimeoutId);
  };

  // Handle animation sequence triggered by mouthAnimationKey
  useEffect(() => {
    if (mouthAnimationKey == null) return;

    // Avoid running on initial render
    if (lastAnimationKeyRef.current === mouthAnimationKey) return;

    lastAnimationKeyRef.current = mouthAnimationKey;

    // Start a new animation sequence for THIS phoneme
    const sequence = getPoseSequenceForPhoneme(phoneme);
    runTtsPoseSequence(sequence);
  }, [mouthAnimationKey, phoneme]);

  // start transition when target pose changes (static target)
  useEffect(() => {
    if (!pose) return;

    if (pose === displayPose) return;
    
    // When the underlying pose changes (new letter), stop any TTS animation
    clearTtsAnimation();
    
    setNextPose(pose);
    setIsTransitioning(true);
  }, [pose]);

  // complete transition after POSE_CROSSFADE_MS
  useEffect(() => {
    if (!isTransitioning || !nextPose) return;

    const timeout = setTimeout(() => {
      setDisplayPose(nextPose);
      setNextPose(null);
      setIsTransitioning(false);
    }, POSE_CROSSFADE_MS);

    return () => clearTimeout(timeout);
  }, [isTransitioning, nextPose]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTtsAnimation();
    };
  }, []);

  // Fallback to neutral if pose image missing
  const baseUrl = POSE_IMAGES[displayPose] || POSE_IMAGES.neutral;
  const nextUrl = nextPose ? (POSE_IMAGES[nextPose] || POSE_IMAGES.neutral) : null;
  
  // Debug logging
  React.useEffect(() => {
    console.log('[RealisticMouthPose] Current pose:', displayPose, 'URL:', baseUrl);
  }, [displayPose, baseUrl]);

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      {/* Head background layer */}
      <HeadStage headSrc="/assets/heads/head_neutral.png" />

      {/* Current pose */}
      <img
        key={displayPose}
        src={baseUrl}
        alt={displayPose}
        className="absolute inset-0 w-full h-full object-contain"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: `opacity ${POSE_CROSSFADE_MS}ms ease-out`,
          zIndex: 1,
        }}
        onError={(e) => {
          console.error('[RealisticMouthPose] Failed to load:', baseUrl);
          if (baseUrl !== POSE_IMAGES.neutral) {
            e.target.src = POSE_IMAGES.neutral;
          }
        }}
      />

      {/* Next pose fading in on top */}
      {nextUrl && (
        <img
          key={nextPose}
          src={nextUrl}
          alt={nextPose || ""}
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transition: `opacity ${POSE_CROSSFADE_MS}ms ease-out`,
            zIndex: 1,
          }}
          onError={(e) => {
            console.error('[RealisticMouthPose] Failed to load next:', nextUrl);
            if (nextUrl !== POSE_IMAGES.neutral) {
              e.target.src = POSE_IMAGES.neutral;
            }
          }}
        />
      )}

      {/* Overlay: pose name (top-left) */}
      <div className="absolute top-1 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-slate-100" style={{ zIndex: 2 }}>
        pose: {pose || "neutral"}
      </div>

      {/* Overlay: raw phoneme/letter (bottom-right) */}
      <div className="absolute bottom-1 right-2 px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-slate-100" style={{ zIndex: 2 }}>
        {phoneme || "—"}
      </div>
    </div>
  );
}