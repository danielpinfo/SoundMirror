import React, { useCallback, useEffect, useRef, useState } from 'react';
import Home from './Home';

const TONE_URL =
  'https://raw.githubusercontent.com/danielpinfo/SoundMirror/main/freesound_community-d6-82020.mp3';

const LOGO_URL =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697ce1adb374adba38acf28d/ff290666e_LOGO.png';

const WaterDropCanvas = ({ onImpact, onComplete, onEarlyComplete }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const hasCompleted = useRef(false);
  const impactFired = useRef(false);
  const isDoneRef = useRef(false);
  const isCancelledRef = useRef(false);

  const markDone = useCallback(() => {
    isDoneRef.current = true;
    isCancelledRef.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    isDoneRef.current = false;
    isCancelledRef.current = false;
    hasCompleted.current = false;
    impactFired.current = false;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dropRadius = 12;
    const impactY = centerY;

    const duration = 7000;
    const startTime = Date.now();

    const drawBlackBackground = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawDrop = (y) => {
      const dropGradient = ctx.createRadialGradient(
        centerX,
        y - dropRadius * 0.3,
        0,
        centerX,
        y,
        dropRadius
      );

      dropGradient.addColorStop(0, '#ffffff');
      dropGradient.addColorStop(0.7, '#f0f0f0');
      dropGradient.addColorStop(1, '#e0e0e0');

      ctx.fillStyle = dropGradient;
      ctx.beginPath();
      ctx.arc(centerX, y, dropRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(
        centerX - dropRadius * 0.2,
        y - dropRadius * 0.2,
        dropRadius * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    };

    const drawRipples = (maxRadius, opacity) => {
      for (let ring = 0; ring < 5; ring += 1) {
        const radiusX = (maxRadius * (ring + 1)) / 5;
        const radiusY = radiusX * 0.35;

        ctx.strokeStyle = `rgba(255, 255, 255, ${
          opacity * (1 - ring * 0.1)
        })`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, impactY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const logoImage = new Image();
    logoImage.src = LOGO_URL;

    const drawLogo = (opacity) => {
      if (!logoImage.complete) return;

      ctx.globalAlpha = opacity;

      const isMobile = window.innerWidth < 768;
      const logoWidth = isMobile ? 400 : 1200;
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

      ctx.drawImage(
        logoImage,
        centerX - logoWidth / 2,
        impactY - logoHeight / 2,
        logoWidth,
        logoHeight
      );

      ctx.globalAlpha = 1;
    };

    let earlyFired = false;

    const animate = () => {
      if (isDoneRef.current || isCancelledRef.current) {
        return;
      }

      const currentTime = Date.now();
      const time = currentTime - startTime;
      const progress = Math.min(time / duration, 1);

      drawBlackBackground();

      if (progress < 0.286) {
        const dropProgress = progress / 0.286;
        const dropStartY = -dropRadius * 3;
        const dropY = dropStartY + dropProgress * (impactY - dropStartY);
        drawDrop(dropY);
      }

      if (progress >= 0.286 && !impactFired.current) {
        impactFired.current = true;
        onImpact();
      }

      if (progress >= 0.286) {
        const rippleProgress = (progress - 0.286) / 0.286;
        const maxRippleRadius =
          Math.sqrt(centerX * centerX + centerY * centerY) * 1.5;
        const rippleOpacity = Math.max(0, 1 - rippleProgress);

        drawRipples(maxRippleRadius * rippleProgress, rippleOpacity);
      }

      if (progress >= 0.286 && progress < 0.571) {
        const logoProgress = (progress - 0.286) / 0.286;
        drawLogo(logoProgress);
      } else if (progress >= 0.571) {
        drawLogo(1);
      }

      if (progress >= (duration - 2000) / duration && !earlyFired) {
        earlyFired = true;
        markDone();
        onEarlyComplete();
        return;
      }

      if (progress < 1 && !isDoneRef.current && !isCancelledRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!hasCompleted.current) {
        hasCompleted.current = true;
        markDone();
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isCancelledRef.current = true;
      markDone();

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [markDone, onComplete, onEarlyComplete, onImpact]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default function SplashScreen() {
  const [started, setStarted] = useState(false);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  const startedRef = useRef(false);
  const fadingRef = useRef(false);
  const goneRef = useRef(false);
  const fadeTimerRef = useRef(null);

  const audioRef = useRef(null);
  const toneAttemptedRef = useRef(false);
  const scrollContainerRef = useRef(null);
  const pointerStateRef = useRef({
    x: 0,
    y: 0,
    scrollTop: 0,
    moved: false,
    pointerId: null,
  });

  useEffect(() => {
    const audio = new Audio(TONE_URL);
    audio.preload = 'auto';
    audio.volume = 0.8;
    audioRef.current = audio;

    try {
      audio.load();
    } catch (_) {
      // Decorative splash audio should never block the app.
    }

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (_) {
          // No-op.
        }
      }

      audioRef.current = null;
    };
  }, []);

  const unlockSplashAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // This silent unlock happens inside the user's tap/click gesture.
    // It prepares the browser to allow the real piano note at drop impact.
    try {
      audio.muted = true;
      audio.currentTime = 0;

      const unlockPromise = audio.play();

      if (unlockPromise && typeof unlockPromise.then === 'function') {
        unlockPromise
          .then(() => {
            try {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;
            } catch (_) {
              audio.muted = false;
            }
          })
          .catch(() => {
            audio.muted = false;
          });
      } else {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      }
    } catch (_) {
      try {
        audio.muted = false;
      } catch (_) {
        // No-op.
      }
    }
  }, []);

  const handleStart = useCallback(() => {
    if (startedRef.current) return;

    startedRef.current = true;
    unlockSplashAudio();
    setStarted(true);
  }, [unlockSplashAudio]);

  const handlePointerDown = useCallback((event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const scroller = scrollContainerRef.current;

    pointerStateRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollTop: scroller ? scroller.scrollTop : 0,
      moved: false,
      pointerId: event.pointerId,
    };
  }, []);

  const handlePointerMove = useCallback((event) => {
    const state = pointerStateRef.current;
    if (state.pointerId !== event.pointerId) return;

    if (
      Math.abs(event.clientX - state.x) > 12 ||
      Math.abs(event.clientY - state.y) > 12
    ) {
      state.moved = true;
    }

    const scroller = scrollContainerRef.current;
    if (scroller && Math.abs(scroller.scrollTop - state.scrollTop) > 12) {
      state.moved = true;
    }
  }, []);

  const handlePointerCancel = useCallback(() => {
    pointerStateRef.current = {
      ...pointerStateRef.current,
      moved: true,
      pointerId: null,
    };
  }, []);

  const handlePointerUp = useCallback(
    (event) => {
      const state = pointerStateRef.current;
      if (state.pointerId !== event.pointerId) return;

      const scroller = scrollContainerRef.current;
      if (scroller && Math.abs(scroller.scrollTop - state.scrollTop) > 12) {
        state.moved = true;
      }

      const shouldStart = !state.moved;

      pointerStateRef.current = {
        ...pointerStateRef.current,
        pointerId: null,
      };

      if (shouldStart) {
        handleStart();
      }
    },
    [handleStart]
  );

  const playSplashTone = useCallback(() => {
    if (toneAttemptedRef.current) return;

    toneAttemptedRef.current = true;

    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.muted = false;
      audio.currentTime = 0;
    } catch (_) {
      // Continue if possible.
    }

    audio.play().catch(() => {
      // If the browser still blocks it, skip it.
      // Do not defer playback to Home clicks.
    });
  }, []);

  const handleFadeOut = useCallback(() => {
    if (fadingRef.current || goneRef.current) return;

    fadingRef.current = true;
    setFading(true);

    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
    }

    fadeTimerRef.current = setTimeout(() => {
      goneRef.current = true;
      setGone(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (!started) return undefined;

    // Safety: ensure the splash always disappears after the user begins.
    const safetyTimer = setTimeout(() => {
      handleFadeOut();
    }, 6000);

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [started, handleFadeOut]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      {/* Home page underneath */}
      <Home />

      {/* Splash overlay — fades out to reveal Home */}
      {!gone && (
        <div
          className="fixed inset-0 w-full h-full"
          style={{
            opacity: fading ? 0 : 1,
            transition: fading ? 'opacity 2s ease-in-out' : 'none',
            background: '#000000',
            zIndex: 50,
            pointerEvents: fading ? 'none' : 'auto',
          }}
        >
          {!started ? (
            <div
              ref={scrollContainerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleStart();
                }
              }}
              className="absolute inset-0 overflow-y-auto"
              style={{
                background: '#000000',
                cursor: 'pointer',
                color: '#ffffff',
                WebkitOverflowScrolling: 'touch',
              }}
              aria-label="Tap to begin SoundMirror"
              role="button"
              tabIndex={0}
            >
              <div
                style={{
                  minHeight: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '44px 22px 64px',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '980px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={LOGO_URL}
                    alt="SoundMirror"
                    style={{
                      width: 'min(64vw, 340px)',
                      height: 'auto',
                      marginBottom: '20px',
                    }}
                  />

                  <div
                    style={{
                      fontSize: 'clamp(30px, 5vw, 44px)',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      lineHeight: 1.12,
                      marginBottom: '10px',
                    }}
                  >
                    See Speech Differently
                  </div>

                  <div
                    style={{
                      fontSize: 'clamp(18px, 2.5vw, 24px)',
                      lineHeight: 1.45,
                      color: '#8fe8ff',
                      maxWidth: '760px',
                      marginBottom: '14px',
                    }}
                  >
                    True phoneme detection, not word recognition.
                  </div>

                  <p
                    style={{
                      maxWidth: '820px',
                      fontSize: 'clamp(16px, 2vw, 19px)',
                      lineHeight: 1.65,
                      opacity: 0.92,
                      marginBottom: '22px',
                    }}
                  >
                    See how speech is spoken. See what you truly sound like. Practice articulation. Build confidence.
                  </p>

                  <div
                    className="grid w-full grid-cols-1 gap-2.5 text-left md:grid-cols-2 lg:grid-cols-3 lg:gap-3"
                    style={{
                      marginBottom: '22px',
                    }}
                  >
                    <section
                      style={{
                        background: 'rgba(12, 18, 24, 0.96)',
                        border: '1px solid rgba(111, 233, 255, 0.22)',
                        borderRadius: '20px',
                        padding: 'clamp(14px, 1.8vw, 16px)',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 'clamp(19px, 2.1vw, 23px)',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: '12px',
                          color: '#f5d27a',
                        }}
                      >
                        What SoundMirror is
                      </h2>
                      <p style={{ fontSize: 'clamp(16px, 1.9vw, 18px)', lineHeight: 1.65, opacity: 0.92 }}>
                        SoundMirror is a first of its kind visual speech refinement system designed to help people understand how sounds are formed by first seeing the sounds and then practicing those sounds. It was created to support deaf, mute, and speech-challenged users through guided articulation practice which has naturally grown into a powerful second-language and accent-refinement coach.
                      </p>
                    </section>

                    <section
                      style={{
                        background: 'rgba(12, 18, 24, 0.96)',
                        border: '1px solid rgba(111, 233, 255, 0.22)',
                        borderRadius: '20px',
                        padding: 'clamp(14px, 1.8vw, 16px)',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 'clamp(19px, 2.1vw, 23px)',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: '12px',
                          color: '#f5d27a',
                        }}
                      >
                        Watch and practice
                      </h2>
                      <p style={{ fontSize: 'clamp(16px, 1.9vw, 18px)', lineHeight: 1.65, opacity: 0.92 }}>
                        Choose from hundreds of built-in words and phrases or type in your own sentence. SoundMirror shows you each sound with dual-head animation: a front view for lips, mouth, and jaw movement, and a side cut-away view for tongue position and airflow.
                      </p>
                    </section>

                    <section
                      style={{
                        background: 'rgba(12, 18, 24, 0.96)',
                        border: '1px solid rgba(111, 233, 255, 0.22)',
                        borderRadius: '20px',
                        padding: 'clamp(14px, 1.8vw, 16px)',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 'clamp(19px, 2.1vw, 23px)',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: '12px',
                          color: '#f5d27a',
                        }}
                      >
                        True phoneme detection
                      </h2>
                      <p style={{ fontSize: 'clamp(16px, 1.9vw, 18px)', lineHeight: 1.65, opacity: 0.92 }}>
                        Watch the sounds, then record your attempt through an actual phoneme detection engine designed to never guess at what word you are trying to say, but what you are actually saying. If a user is trying to say "Hello" and they actually say "Wewo", the engine types out "Wewo," and that is a very powerful tool for language refinement designed to build a new freedom and confidence finally available to the masses.
                      </p>
                    </section>

                    <section
                      style={{
                        background: 'rgba(12, 18, 24, 0.96)',
                        border: '1px solid rgba(111, 233, 255, 0.22)',
                        borderRadius: '20px',
                        padding: 'clamp(14px, 1.8vw, 16px)',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 'clamp(19px, 2.1vw, 23px)',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: '12px',
                          color: '#f5d27a',
                        }}
                      >
                        Languages
                      </h2>
                      <p style={{ fontSize: 'clamp(16px, 1.9vw, 18px)', lineHeight: 1.65, opacity: 0.92 }}>
                        SoundMirror is built around independent language packs. Choose your single language, or choose a display language and a practice language, with two languages included to begin. Additional language packs can be added for learners, families, schools, clinics, and institutions.
                      </p>
                    </section>

                    <section
                      style={{
                        background: 'rgba(12, 18, 24, 0.96)',
                        border: '1px solid rgba(111, 233, 255, 0.22)',
                        borderRadius: '20px',
                        padding: 'clamp(14px, 1.8vw, 16px)',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 'clamp(19px, 2.1vw, 23px)',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: '12px',
                          color: '#f5d27a',
                        }}
                      >
                        History
                      </h2>
                      <p style={{ fontSize: 'clamp(16px, 1.9vw, 18px)', lineHeight: 1.65, opacity: 0.92 }}>
                        Your practice sessions are automatically saved in-app so individuals, teachers, therapists, and institutions can review progress over time, or simply upload them to any storage device.
                      </p>
                    </section>

                    <section
                      style={{
                        background: 'rgba(12, 18, 24, 0.96)',
                        border: '1px solid rgba(111, 233, 255, 0.22)',
                        borderRadius: '20px',
                        padding: 'clamp(14px, 1.8vw, 16px)',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 'clamp(19px, 2.1vw, 23px)',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: '12px',
                          color: '#f5d27a',
                        }}
                      >
                        Feedback
                      </h2>
                      <p style={{ fontSize: 'clamp(16px, 1.9vw, 18px)', lineHeight: 1.65, opacity: 0.92 }}>
                        SoundMirror is built to improve with the people who use it. Feedback tools help users report pronunciation issues, missing words, language-pack concerns, or anything that does not feel right in their language or learning experience.
                      </p>
                    </section>
                  </div>

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '4px',
                      paddingBottom: '24px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'clamp(24px, 3.4vw, 34px)',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        lineHeight: 1.2,
                        marginBottom: '8px',
                      }}
                    >
                      Tap anywhere to begin
                    </div>

                    <div
                      style={{
                        fontSize: 'clamp(14px, 1.8vw, 17px)',
                        opacity: 0.8,
                        lineHeight: 1.5,
                      }}
                    >
                      Start SoundMirror
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <WaterDropCanvas
              onImpact={playSplashTone}
              onComplete={handleFadeOut}
              onEarlyComplete={handleFadeOut}
            />
          )}
        </div>
      )}
    </div>
  );
}