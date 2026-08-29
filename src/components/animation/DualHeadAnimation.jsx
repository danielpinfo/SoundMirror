import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import { Button } from '@/components/ui/button';







import {
  Play,
  Pause,
  Loader2,
} from 'lucide-react';

import SpriteAnimationEngine from './SpriteAnimationEngine';
import { AudioPlayer } from './AudioPlayer';
import { usePlugin } from '../core/PluginContext';
import { useLanguage } from '../i18n/LanguageContext';
import { pushTrace } from '@/lib/traceBuffer';
import universalSpriteMetadata from './universalSpriteMetadata';

// Pack-owned frame loader only
function loadImages(urls) {
  return new Promise((resolve) => {
    const images = {};
    const valid = (urls || []).filter(Boolean);

    if (valid.length === 0) {
      resolve({
        images,
        naturalSize: null,
      });

      return;
    }

    let pending = valid.length;

    const done = () => {
      pending -= 1;

      if (pending === 0) {
        const first =
          Object.values(images)[0];

        resolve({
          images,

          naturalSize: first
            ? {
                w: first.naturalWidth,
                h: first.naturalHeight,
              }
            : null,
        });
      }
    };

    valid.forEach((url) => {
      const filename =
        url.split('/').pop() || '';

      const match =
        filename.match(
          /(?:front|side)_(\d{2})/i
        ) ||
        filename.match(
          /_(\d{2})\.(?:png|jpg|jpeg|webp)$/i
        );

      const index = match
        ? parseInt(match[1], 10)
        : Number.NaN;

      if (Number.isNaN(index)) {
        done();
        return;
      }

      const image = new Image();

      image.crossOrigin = 'anonymous';

      image.onload = () => {
        image
          .decode()
          .then(() => {
            images[index] = image;
            done();
          })
          .catch(() => {
            images[index] = image;
            done();
          });
      };

      image.onerror = done;
      image.src = url;
    });
  });
}

function loadImage(url) {
  return new Promise(
    (resolve, reject) => {
      if (!url) {
        resolve(null);
        return;
      }

      const image = new Image();

      image.crossOrigin = 'anonymous';

      image.onload = () => {
        image
          .decode()
          .then(() => resolve(image))
          .catch(() => resolve(image));
      };

      image.onerror = () =>
        reject(
          new Error(
            `Failed to load image: ${url}`
          )
        );

      image.src = url;
    }
  );
}

/**
 * Learner-facing helper display.
 *
 * Timing contract:
 *
 * 1. If helperChunks contains one timing chunk per visible sound segment,
 *    use those timings directly.
 *
 * 2. If helperChunks contains one timing chunk per word, divide each word's
 *    real duration evenly across only that word's visible sound segments.
 *
 * 3. During a pause between word timing chunks, no helper segment glows.
 *
 * 4. Estimated whole-phrase timing is used only when no helper timing chunks
 *    were supplied at all.
 */
function HelperDisplay({
  helper,
  helperChunks,
  sliderValue,
  totalDurationMs,
}) {
  if (!helper) return null;

  const words =
    String(helper)
      .split(/\s+/)
      .filter(Boolean);

  const safeWords =
    words.length > 0
      ? words
      : [String(helper)];

  const splitToken = /[-·]/g;

  const wordSegmentsList =
    safeWords.map((word) =>
      word
        .split(splitToken)
        .map((segment) =>
          segment.trim()
        )
        .filter(Boolean)
    );

  const segments =
    wordSegmentsList.flat();

  if (segments.length <= 1) {
    return (
      <div
        className="text-center font-bold"
        style={{
          fontSize: '2.2rem',
          color: '#f5c518',
        }}
      >
        {helper}
      </div>
    );
  }

  const validHelperChunks =
    Array.isArray(helperChunks)
      ? helperChunks.filter(
          (chunk) =>
            Number.isFinite(
              Number(chunk?.startMs)
            ) &&
            Number.isFinite(
              Number(chunk?.endMs)
            ) &&
            Number(chunk.endMs) >
              Number(chunk.startMs)
        )
      : [];

  let normalizedActiveIdx = -1;

  /*
   * Exact segment-level timing.
   */
  if (
    validHelperChunks.length ===
    segments.length
  ) {
    normalizedActiveIdx =
      validHelperChunks.findIndex(
        (chunk) =>
          sliderValue >=
            Number(chunk.startMs) &&
          sliderValue <
            Number(chunk.endMs)
      );
  }

  /*
   * Word-level timing.
   *
   * Example:
   *
   * helper:
   *   g-u-d m-aw-r-n-ee-ng
   *
   * helperChunks:
   *   Good    start/end
   *   morning start/end
   *
   * Each word's duration is divided only among that word's own helper
   * segments. The gap between the two chunks remains unlit.
   */
  if (
    normalizedActiveIdx === -1 &&
    validHelperChunks.length ===
      wordSegmentsList.length
  ) {
    const activeWordIndex =
      validHelperChunks.findIndex(
        (chunk) =>
          sliderValue >=
            Number(chunk.startMs) &&
          sliderValue <
            Number(chunk.endMs)
      );

    if (activeWordIndex >= 0) {
      const activeWordSegments =
        wordSegmentsList[
          activeWordIndex
        ] || [];

      if (
        activeWordSegments.length > 0
      ) {
        const activeChunk =
          validHelperChunks[
            activeWordIndex
          ];

        const chunkStart =
          Number(
            activeChunk.startMs
          );

        const chunkEnd =
          Number(
            activeChunk.endMs
          );

        const chunkDuration =
          Math.max(
            1,
            chunkEnd - chunkStart
          );

        const elapsedWithinWord =
          Math.max(
            0,
            Math.min(
              chunkDuration - 0.001,
              sliderValue -
                chunkStart
            )
          );

        const localProgress =
          elapsedWithinWord /
          chunkDuration;

        const localSegmentIndex =
          Math.min(
            activeWordSegments.length -
              1,

            Math.floor(
              localProgress *
                activeWordSegments.length
            )
          );

        const segmentsBeforeWord =
          wordSegmentsList
            .slice(
              0,
              activeWordIndex
            )
            .reduce(
              (
                total,
                wordSegments
              ) =>
                total +
                wordSegments.length,
              0
            );

        normalizedActiveIdx =
          segmentsBeforeWord +
          localSegmentIndex;
      }
    }
  }

  /*
   * Use whole-phrase estimated timing only when no helper timing information
   * exists. When chunks do exist but the cursor is in a pause, keep every
   * segment inactive instead of making the glow jump.
   */
  if (
    normalizedActiveIdx === -1 &&
    validHelperChunks.length === 0
  ) {
    normalizedActiveIdx =
      sliderValue <= 0
        ? -1
        : Math.min(
            Math.floor(
              sliderValue /
                (
                  Math.max(
                    totalDurationMs,
                    1
                  ) /
                  segments.length
                )
            ),

            segments.length - 1
          );
  }

  let runningIdx = -1;

  return (
    <div className="flex items-center justify-center flex-wrap gap-y-2">
      {wordSegmentsList.map(
        (
          wordSegments,
          wordIndex
        ) => (
          <div
            key={`w-${wordIndex}`}
            className="flex items-center"
            style={{
              marginRight:
                wordIndex <
                wordSegmentsList.length -
                  1
                  ? '1.5rem'
                  : 0,
            }}
          >
            {wordSegments.map(
              (
                segment,
                segmentIndex
              ) => {
                runningIdx += 1;

                const isActive =
                  runningIdx ===
                  normalizedActiveIdx;

                return (
                  <span
                    key={`seg-${wordIndex}-${segmentIndex}`}
                    className="inline-flex items-center"
                  >
                    {segmentIndex >
                      0 && (
                      <span
                        style={{
                          fontSize:
                            '2.2rem',

                          fontWeight:
                            'bold',

                          color:
                            '#f5c518',

                          display:
                            'inline-block',

                          margin:
                            '0 0.35rem',
                        }}
                      >
                        -
                      </span>
                    )}

                    <span
                      style={{
                        fontSize:
                          '2.2rem',

                        fontWeight:
                          'bold',

                        color:
                          isActive
                            ? '#fff'
                            : '#f5c518',

                        textShadow:
                          isActive
                            ? '0 0 16px #f5c518, 0 0 32px #f5c518aa'
                            : 'none',

                        transform:
                          isActive
                            ? 'scale(1.18)'
                            : 'scale(1)',

                        display:
                          'inline-block',

                        transition:
                          'color 0.08s, text-shadow 0.08s, transform 0.08s',
                      }}
                    >
                      {segment}
                    </span>
                  </span>
                );
              }
            )}
          </div>
        )
      )}
    </div>
  );
}

export default function DualHeadAnimation({
  timeline = null,
  frameSequence = [],
  playCount = 0,
  onFrameChange = null,
  audioUrl = null,
  onPlayComplete = null,
  playLabel = null,
  onPlay = null,
  isLoadingAudio = false,
  traceToken = null,
  audioPlayerInstance = null,
  audioStartMs = 0,
}) {
  const {
    activePracticePack,
    activePracticePackId,
  } = usePlugin();

  const { t } = useLanguage();

  const isRtlText =
    activePracticePack?.manifest
      ?.textDirection === 'rtl';

  const usesNonLatinWriting =
    Array.from(
      String(playLabel?.word ?? '')
    ).some(
      (character) =>
        /\p{L}/u.test(character) &&
        !/\p{Script=Latin}/u.test(
          character
        )
    );

  const airflowMap =
    activePracticePack?.airflowMap ??
    null;

  const SideAirflow =
    activePracticePack?.SideAirflow ??
    null;

  const packId =
    activePracticePackId ??
    activePracticePack?.packId ??
    null;

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const [
    ,
    setIsPaused,
  ] = useState(false);

  const [
    sliderValue,
    setSliderValue,
  ] = useState(0);

  const [
    transportCursorMs,
    setTransportCursorMs,
  ] = useState(0);

  const [
    currentSegmentKind,
    setCurrentSegmentKind,
  ] = useState('speech');

  const [
    overrideFrameIndex,
    setOverrideFrameIndex,
  ] = useState(null);

  const [
    debugFrame,
    setDebugFrame,
  ] = useState(0);

  const [
    idleNeutral,
    setIdleNeutral,
  ] = useState(false);

  const [
    spriteAuditMode,
    setSpriteAuditMode,
  ] = useState(false);

  const [
    auditPhoneme,
    setAuditPhoneme,
  ] = useState('neutral');

  const [
    frontImages,
    setFrontImages,
  ] = useState(null);

  const [
    sideImages,
    setSideImages,
  ] = useState(null);

  const [
    frontSize,
    setFrontSize,
  ] = useState(null);

  const [
    sideSize,
    setSideSize,
  ] = useState(null);

  const [
    frontSheetImage,
    setFrontSheetImage,
  ] = useState(null);

  const [
    sideSheetImage,
    setSideSheetImage,
  ] = useState(null);

  const [
    spritesReady,
    setSpritesReady,
  ] = useState(false);

  const audioPlayerRef = useRef(
    audioPlayerInstance || null
  );

  const lastStartedRef =
    useRef(0);

  const transportRafRef =
    useRef(null);

  const transportLastTickRef =
    useRef(0);

  useEffect(() => {
    if (
      !audioPlayerRef.current &&
      !audioPlayerInstance
    ) {
      audioPlayerRef.current =
        new AudioPlayer();
    }
  }, [audioPlayerInstance]);

  useEffect(() => {
    const audioPlayer =
      audioPlayerInstance ||
      audioPlayerRef.current;

    if (
      audioUrl &&
      audioPlayer
    ) {
      audioPlayer.setSource(
        audioUrl
      );
    }
  }, [
    audioUrl,
    audioPlayerInstance,
  ]);

  useEffect(() => {
    return () => {
      const audioPlayer =
        audioPlayerInstance ||
        audioPlayerRef.current;

      audioPlayer?.pause();
    };
  }, [audioPlayerInstance]);

  const audioPlayer =
    audioPlayerInstance ||
    audioPlayerRef.current;

  const playbackAudioPlayer =
    audioPlayer;

  const normalizedAudioStartMs =
    Math.max(0, Number(audioStartMs) || 0);

  const effectiveTimeline =
    timeline;

  const isTimelineMode =
    Array.isArray(
      effectiveTimeline
    ) &&
    effectiveTimeline.length > 0;

  const auditPhonemeOptions = [
    'neutral',
    'h',
    'e',
    'l',
    'o',
    'a',
    'i',
    'u',
    'w',
    'th',
    'f',
    'v',
    's',
    'sh',
    'b',
    'p',
    'm',
    'n',
    'r',
  ];

  const spriteAuditDetails =
    useMemo(() => {
      if (
        !universalSpriteMetadata
          ?.phonemeToFrame ||
        !universalSpriteMetadata
          ?.layout
      ) {
        return null;
      }

      const frameIndex =
        universalSpriteMetadata
          .phonemeToFrame[
            auditPhoneme
          ] ?? 0;

      const columns =
        universalSpriteMetadata
          .layout.columns;

      const frameWidth =
        universalSpriteMetadata
          .layout
          .frontFrameSize.w;

      const frameHeight =
        universalSpriteMetadata
          .layout
          .frontFrameSize.h;

      const column =
        frameIndex % columns;

      const row =
        Math.floor(
          frameIndex / columns
        );

      const sourceX =
        column * frameWidth;

      const sourceY =
        row * frameHeight;

      return {
        frameIndex,
        row,
        col: column,
        sourceX,
        sourceY,
      };
    }, [auditPhoneme]);

  const forcedAuditFrame =
    spriteAuditMode
      ? spriteAuditDetails
          ?.frameIndex ?? 0
      : null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const packFront =
          activePracticePack
            ?.getFrontFrameUrls?.() ||
          [];

        const packSide =
          activePracticePack
            ?.getSideFrameUrls?.() ||
          [];

        const [
          frontSheet,
          frontResult,
          sideResult,
        ] = await Promise.all([
          loadImage(
            universalSpriteMetadata
              ?.sheets?.front?.url
          ).catch(() => null),

          loadImages(packFront),

          loadImages(packSide),
        ]);

        const sideSheet = null;

        if (cancelled) return;

        setFrontSheetImage(
          frontSheet
        );

        setSideSheetImage(
          sideSheet
        );

        setFrontImages(
          frontResult.images
        );

        setFrontSize(
          frontResult.naturalSize
        );

        setSideImages(
          sideResult.images
        );

        setSideSize(
          sideResult.naturalSize
        );

        setSpritesReady(
          Boolean(
            frontSheet ||
              sideSheet ||
              Object.keys(
                frontResult.images ||
                  {}
              ).length >
                0 ||
              Object.keys(
                sideResult.images ||
                  {}
              ).length >
                0
          )
        );
      } catch {
        if (!cancelled) {
          setSpritesReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activePracticePack]);

  const rtpRef =
    useRef(null);

  useEffect(() => {
    let mounted = true;

    import(
      './SpriteAnimationEngine'
    )
      .then((module) => {
        if (mounted) {
          rtpRef.current =
            module
              ?.resolveTimelinePosition ||
            null;
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const timelinePosition =
    useMemo(() => {
      const resolvePosition =
        rtpRef.current;

      return (
        resolvePosition &&
        isTimelineMode &&
        effectiveTimeline?.length
      )
        ? resolvePosition(
            effectiveTimeline,
            sliderValue
          )
        : null;
    }, [
      effectiveTimeline,
      isTimelineMode,
      sliderValue,
    ]);

  const currentTimelineEntry =
    useMemo(() => {
      return timelinePosition
        ? effectiveTimeline?.[
            timelinePosition.entryIdx
          ] ?? null
        : null;
    }, [
      effectiveTimeline,
      timelinePosition,
    ]);

  const scrubFrame =
    !isPlaying &&
    isTimelineMode &&
    rtpRef.current
      ? rtpRef.current(
          effectiveTimeline,
          sliderValue
        ).frame
      : null;

  const currentTransportEntry =
    useMemo(() => {
      return (
        isTimelineMode &&
        effectiveTimeline?.length &&
        rtpRef.current
      )
        ? effectiveTimeline[
            rtpRef.current(
              effectiveTimeline,
              transportCursorMs
            ).entryIdx
          ] ?? null
        : null;
    }, [
      effectiveTimeline,
      isTimelineMode,
      transportCursorMs,
    ]);

  const audioMappedTimeMsForTransport =
    useCallback(
      (
        targetTransportMs
      ) => {
        return Math.max(
          0,
          normalizedAudioStartMs +
            (Number(targetTransportMs) || 0)
        );
      },
      [normalizedAudioStartMs]
    );

  const sharedFrame =
    spriteAuditMode
      ? forcedAuditFrame
      : isPlaying
        ? debugFrame
        : scrubFrame;

  const totalDurationMs =
    isTimelineMode
      ? (() => {
          const last =
            effectiveTimeline[
              effectiveTimeline.length -
                1
            ];

          if (
            last.endMs != null
          ) {
            return last.endMs;
          }

          if (
            last.end != null
          ) {
            return last.end;
          }

          return effectiveTimeline.reduce(
            (
              sum,
              entry
            ) =>
              sum +
              (
                entry.hold ??
                entry.duration ??
                0
              ) +
              (
                entry.transition ??
                0
              ),

            0
          );
        })()
      : frameSequence.length > 0
        ? frameSequence.length *
          100
        : 2000;

  useEffect(() => {
    const currentAudioPlayer =
      audioPlayerInstance ||
      audioPlayerRef.current;

    if (!currentAudioPlayer) {
      return;
    }

    const onEnded = () => {};

    currentAudioPlayer.addEventListener(
      'ended',
      onEnded
    );

    return () => {
      currentAudioPlayer.removeEventListener(
        'ended',
        onEnded
      );
    };
  }, [audioPlayerInstance]);

  useEffect(() => {
    if (playCount === 0) {
      return;
    }

    if (
      playCount <=
      lastStartedRef.current
    ) {
      return;
    }

    if (!audioUrl) {
      return;
    }

    lastStartedRef.current =
      playCount;

    setIdleNeutral(false);
    setSliderValue(0);
    setTransportCursorMs(0);
    setCurrentSegmentKind(
      'speech'
    );

    setOverrideFrameIndex(
      null
    );

    setIsPaused(false);

    requestAnimationFrame(() => {
      setIsPlaying(true);

      const currentAudioPlayer =
        audioPlayerInstance ||
        audioPlayerRef.current;

      if (
        currentAudioPlayer &&
        audioUrl
      ) {
        // SoundMirror speed contract:
        // TTS generation owns teaching speed. Reference playback stays at 1.0.
        try {
          currentAudioPlayer.setPlaybackRate(
            1.0
          );
        } catch {}

        currentAudioPlayer.seek(
          normalizedAudioStartMs / 1000
        );

        currentAudioPlayer
          .play()
          .catch(() => {});
      }
    });
  }, [
    playCount,
    audioUrl,
    effectiveTimeline,
    audioPlayerInstance,
    activePracticePack,
    normalizedAudioStartMs,
  ]);

  const handleSliderChange =
    (event) => {
      const value =
        parseFloat(
          event.target.value
        );

      setSliderValue(value);
      setTransportCursorMs(value);
      setIsPlaying(false);

      if (
        !isTimelineMode ||
        !rtpRef.current
      ) {
        if (audioPlayer) {
          audioPlayer.pause();

          audioPlayer.seek(
            value / 1000
          );
        }

        return;
      }

      const entry =
        effectiveTimeline[
          rtpRef.current(
            effectiveTimeline,
            value
          ).entryIdx
        ] ?? null;

      const isSpacer =
        entry?.kind ===
        'spacer';

      setCurrentSegmentKind(
        isSpacer
          ? 'spacer'
          : 'speech'
      );

      setOverrideFrameIndex(
        isSpacer ? 0 : null
      );

      if (audioPlayer) {
        audioPlayer.pause();

        if (!isSpacer) {
          const mappedMs =
            audioMappedTimeMsForTransport(
              value
            );

          audioPlayer.seek(
            mappedMs / 1000
          );
        }
      }
    };

  const handleFrameChange =
    (frameIndex) => {
      setDebugFrame(
        frameIndex
      );

      onFrameChange?.(
        frameIndex
      );
    };

  const handleProgress =
    (elapsedMs) => {
      setSliderValue(
        elapsedMs
      );
    };

  const handleAnimationComplete =
    () => {
      setIsPlaying(false);
      setIsPaused(false);
      setIdleNeutral(true);
      setSliderValue(0);
      setTransportCursorMs(0);

      setCurrentSegmentKind(
        'speech'
      );

      setOverrideFrameIndex(
        null
      );

      onPlayComplete?.();
    };

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    pushTrace(
      'play start',
      {
        traceToken,

        practiceLanguage:
          packId ?? null,

        activePracticePackId:
          packId ?? null,

        selectedWord:
          playLabel?.word ??
          null,

        timelineLength:
          effectiveTimeline
            ?.length ?? 0,
      }
    );
  }, [
    effectiveTimeline,
    isPlaying,
    packId,
    playLabel,
    traceToken,
  ]);

  useEffect(() => {
    if (
      !isTimelineMode ||
      !isPlaying ||
      !effectiveTimeline?.length
    ) {
      if (
        transportRafRef.current
      ) {
        cancelAnimationFrame(
          transportRafRef.current
        );
      }

      return;
    }

    const currentAudioPlayer =
      audioPlayerInstance ||
      audioPlayerRef.current;

    const totalTransportMs =
      effectiveTimeline[
        effectiveTimeline.length -
          1
      ]?.endMs ?? 0;

    const step = (
      timestamp
    ) => {
      if (
        !transportLastTickRef.current
      ) {
        transportLastTickRef.current =
          timestamp;
      }

      const deltaMs =
        Math.max(
          0,
          timestamp -
            transportLastTickRef.current
        );

      transportLastTickRef.current =
        timestamp;

      setTransportCursorMs(
        (previous) => {
          const audioClockMs =
            currentAudioPlayer &&
            !currentAudioPlayer.paused
              ? Math.max(
                  0,
                  currentAudioPlayer.currentTime * 1000 -
                    normalizedAudioStartMs
                )
              : null;

          const next =
            Math.min(
              totalTransportMs,
              Number.isFinite(audioClockMs)
                ? audioClockMs
                : previous + deltaMs
            );

          const resolved =
            rtpRef.current
              ? rtpRef.current(
                  effectiveTimeline,
                  next
                )
              : null;

          const entry =
            resolved
              ? effectiveTimeline[
                  resolved.entryIdx
                ] ?? null
              : null;

          const isSpacer =
            entry?.kind ===
            'spacer';

          setSliderValue(next);

          setCurrentSegmentKind(
            isSpacer
              ? 'spacer'
              : 'speech'
          );

          setOverrideFrameIndex(
            isSpacer ? 0 : null
          );

          if (
            next >=
            totalTransportMs
          ) {
            currentAudioPlayer?.pause();

            setTimeout(
              () =>
                handleAnimationComplete(),
              0
            );

            return totalTransportMs;
          }

          return next;
        }
      );

      transportRafRef.current =
        requestAnimationFrame(
          step
        );
    };

    transportLastTickRef.current =
      0;

    transportRafRef.current =
      requestAnimationFrame(
        step
      );

    return () => {
      if (
        transportRafRef.current
      ) {
        cancelAnimationFrame(
          transportRafRef.current
        );
      }

      transportRafRef.current =
        null;

      transportLastTickRef.current =
        0;
    };
  }, [
    isTimelineMode,
    isPlaying,
    effectiveTimeline,
    audioPlayerInstance,
    audioMappedTimeMsForTransport,
    normalizedAudioStartMs,
  ]);

  return (
    <div className="flex flex-col w-full space-y-6">
      {playLabel && (
        <div className="bg-white/5 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/10 space-y-1">
          <div
            className="text-center text-xl font-extrabold tracking-wide"
            style={{
              color: '#00bcd4',
            }}
            {...(
              isRtlText
                ? {
                    dir: 'rtl',
                  }
                : {}
            )}
          >
            {playLabel.word}
          </div>

          <div
            {...(
              isRtlText
                ? {
                    dir: 'rtl',
                  }
                : {}
            )}
            style={{
              minHeight:
                '44px',

              textAlign:
                isRtlText
                  ? 'right'
                  : undefined,
            }}
          >
            {playLabel.helper &&
            playLabel.helper !==
              playLabel.word ? (
              <HelperDisplay
                helper={
                  playLabel.helper &&
                  playLabel.helper !==
                    playLabel.word
                    ? playLabel.helper
                    : (
                        usesNonLatinWriting &&
                        playLabel.word
                      )
                      ? playLabel.word
                          .split('')
                          .join('·')
                          .replace(
                            /·\s·/g,
                            ' '
                          )
                      : playLabel.helper
                }

                helperChunks={
                  playLabel.helperChunks
                }

                sliderValue={
                  sliderValue
                }

                totalDurationMs={
                  totalDurationMs
                }
              />
            ) : (
              usesNonLatinWriting && (
                <div
                  className="text-center font-bold"
                  style={{
                    fontSize:
                      '2.2rem',

                    color:
                      '#f5c518',
                  }}
                >
                  {playLabel.word}
                </div>
              )
            )}
          </div>

          {playLabel.meaning && (
            <div className="text-center text-sm mt-1 text-white/80">
              {playLabel.meaning}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 w-full">
        <div className="flex-1" />

        <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-silver/20">
          {isPlaying ? (
            <Button
              onClick={() => {
                const currentAudioPlayer =
                  audioPlayerInstance ||
                  audioPlayerRef.current;

                currentAudioPlayer?.pause();

                setIsPlaying(false);
                setIsPaused(false);
              }}
              size="lg"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
            >
              <Pause className="w-5 h-5 mr-2" />
              {t(
                'practice.stop'
              )}
            </Button>
          ) : (
            <Button
              onClick={onPlay}
              disabled={
                isLoadingAudio
              }
              size="lg"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoadingAudio ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />

                  {t(
                    'practice.loading'
                  )}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />

                  {t(
                    'practice.play'
                  )}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex justify-center bg-primary-darker/40 rounded-xl backdrop-blur-sm border border-silver/20">
            <div className="w-full aspect-auto rounded-lg overflow-hidden bg-black/20 relative">
              <SpriteAnimationEngine
                canvasWidth={360}
                canvasHeight={480}

                timeline={
                  isTimelineMode
                    ? effectiveTimeline
                    : undefined
                }

                frameSequence={
                  isTimelineMode
                    ? undefined
                    : frameSequence
                }

                isPlaying={
                  spriteAuditMode
                    ? false
                    : isPlaying
                }

                transportMasterTimeMs={
                  spriteAuditMode
                    ? null
                    : transportCursorMs
                }

                overrideFrameIndex={
                  spriteAuditMode
                    ? forcedAuditFrame
                    : overrideFrameIndex
                }

                currentSegmentKind={
                  currentSegmentKind
                }

                onFrameChange={
                  handleFrameChange
                }

                onProgress={
                  handleProgress
                }

                onComplete={
                  handleAnimationComplete
                }

                spriteType="front"

                mirrorFrame={
                  sharedFrame
                }

                masterFrame={
                  sharedFrame
                }

                selectedWord={
                  playLabel?.word ??
                  null
                }

                currentPackId={
                  packId ?? null
                }

                traceToken={
                  traceToken
                }

                spriteSheetImage={
                  frontSheetImage
                }

                spriteSheetMetadata={
                  universalSpriteMetadata
                }

                spriteSheetType="front"

                externalImages={
                  frontImages
                }

                externalNaturalSize={
                  frontSize
                }

                readyOverride={
                  spritesReady
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center bg-primary-darker/40 rounded-xl backdrop-blur-sm border border-silver/20">
            <div className="w-full aspect-auto rounded-lg overflow-hidden bg-black/20 relative">
              <SpriteAnimationEngine
                canvasWidth={360}
                canvasHeight={480}

                timeline={
                  isTimelineMode
                    ? effectiveTimeline
                    : undefined
                }

                frameSequence={
                  isTimelineMode
                    ? undefined
                    : frameSequence
                }

                isPlaying={false}

                transportMasterTimeMs={
                  spriteAuditMode
                    ? null
                    : transportCursorMs
                }

                overrideFrameIndex={
                  spriteAuditMode
                    ? forcedAuditFrame
                    : overrideFrameIndex
                }

                currentSegmentKind={
                  currentSegmentKind
                }

                spriteType="side"

                mirrorFrame={
                  sharedFrame
                }

                masterFrame={
                  sharedFrame
                }

                selectedWord={
                  playLabel?.word ??
                  null
                }

                currentPackId={
                  packId ?? null
                }

                traceToken={
                  traceToken
                }

                spriteSheetImage={
                  null
                }

                spriteSheetMetadata={
                  universalSpriteMetadata
                }

                spriteSheetType="side"

                externalImages={
                  sideImages
                }

                externalNaturalSize={
                  sideSize
                }

                readyOverride={
                  spritesReady
                }
              />

              {SideAirflow && (
                <SideAirflow
                  currentFrame={
                    isPlaying
                      ? (
                          overrideFrameIndex ??
                          currentTransportEntry
                            ?.frame ??
                          debugFrame
                        )
                      : (
                          scrubFrame ??
                          debugFrame
                        )
                  }

                  timelineEntry={
                    isPlaying
                      ? currentTransportEntry
                      : currentTimelineEntry
                  }

                  posMs={
                    sliderValue
                  }

                  airflowMap={
                    airflowMap
                  }

                  isPlaying={
                    isPlaying
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
