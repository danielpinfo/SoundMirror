import React, { useState, useEffect, useRef } from 'react';

/**
 * SpriteAnimationEngine
 *
 * Passive sprite renderer for SoundMirror reference playback.
 *
 * Current AS Reference Transport contract:
 * - DualHeadAnimation owns audio playback and transport timing.
 * - SpriteAnimationEngine does not poll audio.currentTime.
 * - In timeline mode, transportMasterTimeMs is the visual/reference clock.
 * - overrideFrameIndex may force a specific frame, such as frame 00 during
 *   AS-owned spacer segments.
 * - pack-authored entry.frame remains authoritative.
 * - no phoneme remapping
 * - no shared phoneme engines
 * - side view may mirror the front frame without running its own clock
 * - missing physical frames fall back to neutral frame 00, never to a
 *   different articulation frame.
 */

function drawSingleFrame(ctx, canvas, img, options = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (
    options?.spriteSheetImage &&
    options?.spriteSheetMetadata &&
    options?.spriteSheetType
  ) {
    const {
      spriteSheetImage,
      spriteSheetMetadata,
      spriteSheetType,
      frameIndex,
    } = options;

    if (
      !spriteSheetImage.complete ||
      spriteSheetImage.naturalWidth <= 0
    ) {
      return;
    }

    const layout =
      spriteSheetMetadata.layout;

    const columns =
      layout.columns;

    const frameSize =
      spriteSheetType === 'side'
        ? layout.sideFrameSize
        : layout.frontFrameSize;

    const sourceX =
      (frameIndex % columns) *
      frameSize.w;

    const sourceY =
      Math.floor(frameIndex / columns) *
      frameSize.h;

    const scale =
      Math.min(
        canvas.width / frameSize.w,
        canvas.height / frameSize.h
      );

    const destWidth =
      frameSize.w * scale;

    const destHeight =
      frameSize.h * scale;

    const destX =
      (canvas.width - destWidth) / 2;

    const destY =
      (canvas.height - destHeight) / 2;

    ctx.drawImage(
      spriteSheetImage,
      sourceX,
      sourceY,
      frameSize.w,
      frameSize.h,
      destX,
      destY,
      destWidth,
      destHeight
    );

    return;
  }

  if (
    !img ||
    !img.complete ||
    img.naturalWidth <= 0
  ) {
    return;
  }

  const scale =
    Math.min(
      canvas.width / img.naturalWidth,
      canvas.height / img.naturalHeight
    );

  const x =
    (
      canvas.width -
      img.naturalWidth * scale
    ) / 2;

  const y =
    (
      canvas.height -
      img.naturalHeight * scale
    ) / 2;

  ctx.drawImage(
    img,
    x,
    y,
    img.naturalWidth * scale,
    img.naturalHeight * scale
  );
}

function drawBlendedFrame(
  ctx,
  canvas,
  imgA,
  imgB,
  blendFactor,
  optionsA = null,
  optionsB = null
) {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (
    optionsA?.spriteSheetImage &&
    optionsA?.spriteSheetMetadata &&
    optionsA?.spriteSheetType
  ) {
    drawSingleFrame(
      ctx,
      canvas,
      null,
      optionsA
    );

    if (
      blendFactor > 0 &&
      optionsB?.spriteSheetImage &&
      optionsB?.spriteSheetMetadata &&
      optionsB?.spriteSheetType
    ) {
      const {
        spriteSheetImage,
        spriteSheetMetadata,
        spriteSheetType,
        frameIndex,
      } = optionsB;

      if (
        !spriteSheetImage.complete ||
        spriteSheetImage.naturalWidth <= 0
      ) {
        ctx.globalAlpha = 1;
        return;
      }

      const layout =
        spriteSheetMetadata.layout;

      const columns =
        layout.columns;

      const frameSize =
        spriteSheetType === 'side'
          ? layout.sideFrameSize
          : layout.frontFrameSize;

      const sourceX =
        (frameIndex % columns) *
        frameSize.w;

      const sourceY =
        Math.floor(frameIndex / columns) *
        frameSize.h;

      const scale =
        Math.min(
          canvas.width / frameSize.w,
          canvas.height / frameSize.h
        );

      const destWidth =
        frameSize.w * scale;

      const destHeight =
        frameSize.h * scale;

      const destX =
        (canvas.width - destWidth) / 2;

      const destY =
        (canvas.height - destHeight) / 2;

      ctx.globalAlpha =
        Math.min(
          1,
          blendFactor
        );

      ctx.drawImage(
        spriteSheetImage,
        sourceX,
        sourceY,
        frameSize.w,
        frameSize.h,
        destX,
        destY,
        destWidth,
        destHeight
      );

      ctx.globalAlpha = 1;
    }

    return;
  }

  if (
    imgA &&
    imgA.complete &&
    imgA.naturalWidth > 0
  ) {
    const scaleA =
      Math.min(
        canvas.width / imgA.naturalWidth,
        canvas.height / imgA.naturalHeight
      );

    const xA =
      (
        canvas.width -
        imgA.naturalWidth * scaleA
      ) / 2;

    const yA =
      (
        canvas.height -
        imgA.naturalHeight * scaleA
      ) / 2;

    ctx.globalAlpha = 1;

    ctx.drawImage(
      imgA,
      xA,
      yA,
      imgA.naturalWidth * scaleA,
      imgA.naturalHeight * scaleA
    );
  }

  if (
    imgB &&
    imgB.complete &&
    imgB.naturalWidth > 0 &&
    blendFactor > 0
  ) {
    const scaleB =
      Math.min(
        canvas.width / imgB.naturalWidth,
        canvas.height / imgB.naturalHeight
      );

    const xB =
      (
        canvas.width -
        imgB.naturalWidth * scaleB
      ) / 2;

    const yB =
      (
        canvas.height -
        imgB.naturalHeight * scaleB
      ) / 2;

    ctx.globalAlpha =
      Math.min(
        1,
        blendFactor
      );

    ctx.drawImage(
      imgB,
      xB,
      yB,
      imgB.naturalWidth * scaleB,
      imgB.naturalHeight * scaleB
    );

    ctx.globalAlpha = 1;
  }
}

/**
 * Physical frame indices are authoritative.
 *
 * Never substitute a neighbouring articulation frame simply because
 * a requested image is unavailable. If the exact image cannot be used,
 * fall back to frame 00 neutral.
 */
function resolveAvailableFrameIndex(
  frameImages,
  desiredIndex
) {
  const keys =
    Object.keys(frameImages || {})
      .map((key) =>
        parseInt(key, 10)
      )
      .filter((number) =>
        !Number.isNaN(number)
      )
      .sort((a, b) => a - b);

  if (keys.length === 0) {
    return 0;
  }

  if (
    keys.includes(desiredIndex)
  ) {
    return desiredIndex;
  }

  if (
    keys.includes(0)
  ) {
    return 0;
  }

  return keys[0];
}

function getEntryFrame(entry) {
  if (!entry) {
    return 0;
  }

  if (
    Number.isFinite(entry.frame)
  ) {
    return entry.frame;
  }

  return 0;
}

export function resolveTimelinePosition(
  timeline,
  posMs
) {
  if (
    !timeline ||
    timeline.length === 0
  ) {
    return {
      entryIdx: 0,
      frame: 0,
      nextFrame: 0,
      blendT: 0,
      inTransition: false,
    };
  }

  const e0 =
    timeline[0];

  const isSpeechMode =
    (
      'start' in e0 &&
      'end' in e0
    ) ||
    (
      'startMs' in e0 &&
      'endMs' in e0
    );

  if (isSpeechMode) {
    const getStart = (entry) =>
      entry.startMs ??
      entry.start ??
      0;

    const getEnd = (entry) =>
      entry.endMs ??
      entry.end ??
      0;

    for (
      let i = 0;
      i < timeline.length;
      i += 1
    ) {
      const entry =
        timeline[i];

      const nextEntry =
        timeline[i + 1];

      if (
        posMs < getEnd(entry) ||
        i === timeline.length - 1
      ) {
        if (nextEntry) {
          const entryDur =
            Math.max(
              1,
              getEnd(entry) -
              getStart(entry)
            );

          const blendStart =
            getStart(entry) +
            entryDur * 0.7;

          if (
            posMs >= blendStart
          ) {
            const blendT =
              Math.min(
                (
                  posMs -
                  blendStart
                ) /
                Math.max(
                  1,
                  getEnd(entry) -
                  blendStart
                ),
                1
              );

            return {
              entryIdx: i,
              frame:
                getEntryFrame(entry),

              nextFrame:
                getEntryFrame(nextEntry),

              blendT,

              inTransition: true,
            };
          }
        }

        return {
          entryIdx: i,

          frame:
            getEntryFrame(entry),

          nextFrame:
            nextEntry
              ? getEntryFrame(nextEntry)
              : getEntryFrame(entry),

          blendT: 0,
          inTransition: false,
        };
      }
    }

    const last =
      timeline[
        timeline.length - 1
      ];

    const lastFrame =
      getEntryFrame(last);

    return {
      entryIdx:
        timeline.length - 1,

      frame:
        lastFrame,

      nextFrame:
        lastFrame,

      blendT: 0,
      inTransition: false,
    };
  }

  let cursor = 0;

  for (
    let i = 0;
    i < timeline.length;
    i += 1
  ) {
    const entry =
      timeline[i];

    const hold =
      entry.hold ??
      entry.duration ??
      100;

    const transition =
      entry.transition ??
      0;

    const totalEntry =
      hold +
      transition;

    if (
      posMs <=
        cursor +
        totalEntry ||
      i === timeline.length - 1
    ) {
      const local =
        posMs -
        cursor;

      const nextEntry =
        timeline[i + 1];

      if (
        local >= hold &&
        nextEntry &&
        transition > 0
      ) {
        return {
          entryIdx: i,

          frame:
            getEntryFrame(entry),

          nextFrame:
            getEntryFrame(nextEntry),

          blendT:
            Math.min(
              (
                local -
                hold
              ) /
              transition,
              1
            ),

          inTransition: true,
        };
      }

      return {
        entryIdx: i,

        frame:
          getEntryFrame(entry),

        nextFrame:
          nextEntry
            ? getEntryFrame(nextEntry)
            : getEntryFrame(entry),

        blendT: 0,
        inTransition: false,
      };
    }

    cursor +=
      totalEntry;
  }

  const last =
    timeline[
      timeline.length - 1
    ];

  const lastFrame =
    getEntryFrame(last);

  return {
    entryIdx:
      timeline.length - 1,

    frame:
      lastFrame,

    nextFrame:
      lastFrame,

    blendT: 0,
    inTransition: false,
  };
}

export default function SpriteAnimationEngine({
  frameSequence = [0],
  isPlaying = false,
  frameSpeed = 100,
  timeline = null,
  mirrorFrame = null,
  masterFrame = null,
  transportMasterTimeMs = null,
  overrideFrameIndex = null,
  currentSegmentKind = null,
  onFrameChange,
  onProgress,
  onComplete,
  spriteType = 'front',
  showFrameInfo = false,
  canvasWidth = 300,
  canvasHeight = 400,
  externalImages = null,
  externalNaturalSize = null,
  readyOverride = null,
  spriteSheetImage = null,
  spriteSheetMetadata = null,
  spriteSheetType = 'front',
}) {
  const [
    displayFrame,
    setDisplayFrame,
  ] = useState(0);

  const canvasRef =
    useRef(null);

  const rafRef =
    useRef(null);

  const completedRef =
    useRef(false);

  const prevFrameRef =
    useRef(-1);

  const legacyIndexRef =
    useRef(0);

  const legacyLastTimeRef =
    useRef(0);

  // Stable callback refs to avoid re-creating RAF loop on each render.
  const onFrameChangeRef =
    useRef(onFrameChange);

  const onProgressRef =
    useRef(onProgress);

  const onCompleteRef =
    useRef(onComplete);

  useEffect(() => {
    onFrameChangeRef.current =
      onFrameChange;

    onProgressRef.current =
      onProgress;

    onCompleteRef.current =
      onComplete;
  }, [
    onFrameChange,
    onProgress,
    onComplete,
  ]);

  const frameImages =
    externalImages || {};

  const frameLockConfig =
    spriteSheetMetadata
      ?.views
      ?.frameLock;

  const frameLockMode =
    frameLockConfig?.mode;

  const frameLockMaster =
    spriteSheetMetadata
      ?.views
      ?.master;

  const frameLockSlaves =
    spriteSheetMetadata
      ?.views
      ?.slaves ||
    [];

  const isFrameLockSameIndex =
    frameLockMode ===
    'same-index';

  const isConfiguredSlave =
    isFrameLockSameIndex &&
    frameLockSlaves.includes(
      spriteType
    );

  const allowIndependentSideTimeline =
    frameLockConfig
      ?.allowIndependentSideTimeline !==
    false;

  const allowSideRemap =
    frameLockConfig
      ?.allowSideRemap !==
    false;

  const enforcedMasterFrame =
    Number.isFinite(masterFrame)
      ? masterFrame
      : Number.isFinite(mirrorFrame)
        ? mirrorFrame
        : null;

  const isSideSlave =
    isConfiguredSlave &&
    frameLockMaster === 'front' &&
    Number.isFinite(
      enforcedMasterFrame
    );

  const hasSpriteSheet =
    !!(
      spriteSheetImage &&
      spriteSheetMetadata?.layout &&
      spriteSheetImage.complete &&
      spriteSheetImage.naturalWidth > 0
    );

  const framesReady =
    readyOverride !== null &&
    readyOverride !== undefined
      ? !!readyOverride
      : hasSpriteSheet ||
        Object.keys(
          frameImages
        ).length > 0;

  const naturalSize =
    hasSpriteSheet
      ? (
          spriteSheetType === 'side'
            ? spriteSheetMetadata
                ?.layout
                ?.sideFrameSize
            : spriteSheetMetadata
                ?.layout
                ?.frontFrameSize
        ) ||
        externalNaturalSize ||
        null
      : externalNaturalSize ||
        null;

  const isTimelineMode =
    Array.isArray(timeline) &&
    timeline.length > 0;

  const isPassiveTransportMode =
    isTimelineMode &&
    Number.isFinite(
      transportMasterTimeMs
    );

  useEffect(() => {
    if (!framesReady) {
      return;
    }

    const canvas =
      canvasRef.current;

    const ctx =
      canvas?.getContext('2d');

    if (
      ctx &&
      canvas
    ) {
      const idx =
        resolveAvailableFrameIndex(
          frameImages,
          0
        );

      drawSingleFrame(
        ctx,
        canvas,
        frameImages[idx],

        hasSpriteSheet
          ? {
              spriteSheetImage,
              spriteSheetMetadata,
              spriteSheetType,
              frameIndex: 0,
            }
          : null
      );
    }
  }, [
    framesReady,
    frameImages,
    hasSpriteSheet,
    spriteSheetImage,
    spriteSheetMetadata,
    spriteSheetType,
  ]);

  useEffect(() => {
    if (!framesReady) {
      return;
    }

    if (
      !Number.isFinite(
        enforcedMasterFrame
      ) &&
      !Number.isFinite(
        overrideFrameIndex
      )
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

    const ctx =
      canvas?.getContext('2d');

    const targetFrame =
      Number.isFinite(
        overrideFrameIndex
      )
        ? overrideFrameIndex
        : enforcedMasterFrame;

    if (
      ctx &&
      canvas &&
      Number.isFinite(
        targetFrame
      )
    ) {
      const resolvedFrame =
        isSideSlave &&
        !allowSideRemap
          ? targetFrame
          : resolveAvailableFrameIndex(
              frameImages,
              targetFrame
            );

      drawSingleFrame(
        ctx,
        canvas,
        frameImages[
          resolvedFrame
        ],

        hasSpriteSheet
          ? {
              spriteSheetImage,
              spriteSheetMetadata,
              spriteSheetType,
              frameIndex:
                targetFrame,
            }
          : null
      );

      setDisplayFrame(
        hasSpriteSheet ||
        (
          isSideSlave &&
          !allowSideRemap
        )
          ? targetFrame
          : resolvedFrame
      );
    }
  }, [
    enforcedMasterFrame,
    overrideFrameIndex,
    framesReady,
    frameImages,
    hasSpriteSheet,
    spriteSheetImage,
    spriteSheetMetadata,
    spriteSheetType,
    isSideSlave,
    allowSideRemap,
  ]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    completedRef.current =
      false;

    prevFrameRef.current =
      -1;

    legacyIndexRef.current =
      0;

    legacyLastTimeRef.current =
      0;

    setDisplayFrame(0);
  }, [isPlaying]);

  useEffect(() => {
    if (
      (
        isSideSlave &&
        !allowIndependentSideTimeline
      ) ||
      !isPassiveTransportMode ||
      !framesReady
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

    const ctx =
      canvas?.getContext('2d');

    const posMs =
      transportMasterTimeMs;

    const frameMode =
      Number.isFinite(
        overrideFrameIndex
      )
        ? 'override'
        : 'timeline';

    let frame =
      overrideFrameIndex;

    let nextFrame =
      overrideFrameIndex;

    let blendT = 0;
    let inTransition = false;

    if (
      !Number.isFinite(
        overrideFrameIndex
      )
    ) {
      const resolved =
        resolveTimelinePosition(
          timeline,
          posMs
        );

      frame =
        resolved.frame;

      nextFrame =
        resolved.nextFrame;

      blendT =
        resolved.blendT;

      inTransition =
        resolved.inTransition;
    }

    const resolvedFrame =
      resolveAvailableFrameIndex(
        frameImages,
        frame
      );

    const resolvedNextFrame =
      resolveAvailableFrameIndex(
        frameImages,
        nextFrame
      );

    if (
      ctx &&
      canvas
    ) {
      if (
        frameMode ===
          'timeline' &&
        inTransition
      ) {
        drawBlendedFrame(
          ctx,
          canvas,

          frameImages[
            resolvedFrame
          ],

          frameImages[
            resolvedNextFrame
          ],

          blendT,

          hasSpriteSheet
            ? {
                spriteSheetImage,
                spriteSheetMetadata,
                spriteSheetType,
                frameIndex: frame,
              }
            : null,

          hasSpriteSheet
            ? {
                spriteSheetImage,
                spriteSheetMetadata,
                spriteSheetType,
                frameIndex:
                  nextFrame,
              }
            : null
        );
      } else {
        drawSingleFrame(
          ctx,
          canvas,

          frameImages[
            resolvedFrame
          ],

          hasSpriteSheet
            ? {
                spriteSheetImage,
                spriteSheetMetadata,
                spriteSheetType,
                frameIndex: frame,
              }
            : null
        );
      }
    }

    const reportedFrame =
      hasSpriteSheet
        ? frame
        : resolvedFrame;

    if (
      reportedFrame !==
      prevFrameRef.current
    ) {
      prevFrameRef.current =
        reportedFrame;

      onFrameChangeRef
        .current
        ?.(
          reportedFrame
        );

      setDisplayFrame(
        reportedFrame
      );
    }

    onProgressRef
      .current
      ?.(
        posMs
      );
  }, [
    isSideSlave,
    allowIndependentSideTimeline,
    isPassiveTransportMode,
    framesReady,
    timeline,
    transportMasterTimeMs,
    overrideFrameIndex,
    currentSegmentKind,
    frameImages,
    hasSpriteSheet,
    spriteSheetImage,
    spriteSheetMetadata,
    spriteSheetType,
  ]);

  useEffect(() => {
    if (
      (
        isSideSlave &&
        !allowIndependentSideTimeline
      ) ||
      !isTimelineMode ||
      isPassiveTransportMode ||
      !isPlaying ||
      !framesReady
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

    const ctx =
      canvas?.getContext('2d');

    const animate = (ts) => {
      const posMs =
        ts -
        (
          legacyLastTimeRef
            .current ||
          ts
        );

      const {
        frame,
        nextFrame,
        blendT,
        inTransition,
      } =
        resolveTimelinePosition(
          timeline,
          posMs
        );

      const resolvedFrame =
        resolveAvailableFrameIndex(
          frameImages,
          frame
        );

      const resolvedNextFrame =
        resolveAvailableFrameIndex(
          frameImages,
          nextFrame
        );

      if (
        ctx &&
        canvas
      ) {
        if (inTransition) {
          drawBlendedFrame(
            ctx,
            canvas,

            frameImages[
              resolvedFrame
            ],

            frameImages[
              resolvedNextFrame
            ],

            blendT,

            hasSpriteSheet
              ? {
                  spriteSheetImage,
                  spriteSheetMetadata,
                  spriteSheetType,
                  frameIndex:
                    frame,
                }
              : null,

            hasSpriteSheet
              ? {
                  spriteSheetImage,
                  spriteSheetMetadata,
                  spriteSheetType,
                  frameIndex:
                    nextFrame,
                }
              : null
          );
        } else {
          drawSingleFrame(
            ctx,
            canvas,

            frameImages[
              resolvedFrame
            ],

            hasSpriteSheet
              ? {
                  spriteSheetImage,
                  spriteSheetMetadata,
                  spriteSheetType,
                  frameIndex:
                    frame,
                }
              : null
          );
        }
      }

      const reportedFrame =
        hasSpriteSheet
          ? frame
          : resolvedFrame;

      if (
        reportedFrame !==
        prevFrameRef.current
      ) {
        prevFrameRef.current =
          reportedFrame;

        onFrameChangeRef
          .current
          ?.(
            reportedFrame
          );

        setDisplayFrame(
          reportedFrame
        );
      }

      onProgressRef
        .current
        ?.(
          posMs
        );

      const last =
        timeline[
          timeline.length - 1
        ];

      const totalMs =
        last?.endMs ??
        last?.end ??
        0;

      if (
        posMs >=
        totalMs
      ) {
        if (
          !completedRef.current
        ) {
          completedRef.current =
            true;

          setTimeout(
            () =>
              onCompleteRef
                .current
                ?.(),
            0
          );
        }

        return;
      }

      rafRef.current =
        requestAnimationFrame(
          animate
        );
    };

    legacyLastTimeRef.current =
      performance.now();

    rafRef.current =
      requestAnimationFrame(
        animate
      );

    return () => {
      if (
        !isPassiveTransportMode &&
        isPlaying &&
        rafRef.current
      ) {
        cancelAnimationFrame(
          rafRef.current
        );
      }
    };
  }, [
    isSideSlave,
    allowIndependentSideTimeline,
    isTimelineMode,
    isPassiveTransportMode,
    isPlaying,
    framesReady,
    timeline,
    frameImages,
    hasSpriteSheet,
    spriteSheetImage,
    spriteSheetMetadata,
    spriteSheetType,
  ]);

  useEffect(() => {
    if (
      isTimelineMode ||
      !isPlaying ||
      !framesReady ||
      frameSequence.length === 0
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

    const ctx =
      canvas?.getContext('2d');

    const animate = (ts) => {
      if (
        ts -
          legacyLastTimeRef.current >=
        frameSpeed
      ) {
        const newIndex =
          legacyIndexRef.current +
          1;

        if (
          newIndex >=
          frameSequence.length
        ) {
          if (
            !completedRef.current
          ) {
            completedRef.current =
              true;

            setTimeout(
              () =>
                onCompleteRef
                  .current
                  ?.(),
              0
            );
          }

          return;
        }

        legacyIndexRef.current =
          newIndex;

        const frameId =
          frameSequence[
            newIndex
          ];

        const resolved =
          resolveAvailableFrameIndex(
            frameImages,
            frameId
          );

        if (
          ctx &&
          canvas
        ) {
          drawSingleFrame(
            ctx,
            canvas,

            frameImages[
              resolved
            ],

            hasSpriteSheet
              ? {
                  spriteSheetImage,
                  spriteSheetMetadata,
                  spriteSheetType,
                  frameIndex:
                    frameId,
                }
              : null
          );
        }

        const reportedFrame =
          hasSpriteSheet
            ? frameId
            : resolved;

        onFrameChangeRef
          .current
          ?.(
            reportedFrame
          );

        setDisplayFrame(
          reportedFrame
        );

        onProgressRef
          .current
          ?.(
            newIndex *
            frameSpeed
          );

        legacyLastTimeRef.current =
          ts;
      }

      if (
        !completedRef.current
      ) {
        rafRef.current =
          requestAnimationFrame(
            animate
          );
      }
    };

    legacyLastTimeRef.current =
      0;

    rafRef.current =
      requestAnimationFrame(
        animate
      );

    return () => {
      if (
        !isTimelineMode &&
        isPlaying &&
        rafRef.current
      ) {
        cancelAnimationFrame(
          rafRef.current
        );
      }
    };
  }, [
    isTimelineMode,
    isPlaying,
    framesReady,
    frameSequence,
    frameSpeed,
    frameImages,
    hasSpriteSheet,
    spriteSheetImage,
    spriteSheetMetadata,
    spriteSheetType,
  ]);

  if (!framesReady) {
    return (
      <div
        className="flex items-center justify-center rounded-lg"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          background: '#1a3a52',
        }}
      >
        <div className="text-center">
          <div
            className="h-8 w-8 rounded-full animate-spin mx-auto mb-2"
            style={{
              border:
                '4px solid rgba(192,192,192,0.3)',

              borderTopColor:
                '#0088cc',
            }}
          />

          <p
            className="text-sm"
            style={{
              color: '#c0c0c0',
            }}
          >
            Loading sprites...
          </p>
        </div>
      </div>
    );
  }

  const renderW =
    naturalSize
      ? naturalSize.w
      : canvasWidth;

  const renderH =
    naturalSize
      ? naturalSize.h
      : canvasHeight;

  return (
    <div
      style={{
        lineHeight: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        width={renderW}
        height={renderH}
        className="rounded-lg shadow-lg"
        style={{
          border:
            '1px solid rgba(192,192,192,0.2)',

          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />

      {showFrameInfo && (
        <div
          className="mt-3 text-center text-sm"
          style={{
            color: '#c0c0c0',
          }}
        >
          <p>
            Frame: {displayFrame}
          </p>

          <p
            className="text-xs"
            style={{
              color:
                'rgba(192,192,192,0.7)',
            }}
          >
            {isTimelineMode
              ? 'Timeline mode'
              : 'Sequence mode'}
          </p>
        </div>
      )}
    </div>
  );
}