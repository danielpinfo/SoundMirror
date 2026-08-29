/**
 * FaceLandmarkerOverlay
 *
 * Live camera preview powered by MediaPipe Tasks Vision Face Landmarker.
 *
 * Props:
 *   stream
 *   isRecording
 *   recordingStartTimeMs
 *   onFeaturesFrame(timeMs, features)
 *   onReady(details)
 *
 * This component preserves the current PracticeRecorder callback contract
 * while adding richer geometry, blendshapes, quality gating, a stable
 * tracked mouth crop, and a readiness signal for synchronized recording.
 */

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  createFaceLandmarkerEngine,
} from './FaceLandmarkerEngine';

import {
  buildLegacyCompatibleFeatures,
  computeMouthGeometry,
  extractMouthBlendshapes,
  OUTER_LIP,
  INNER_LIP,
} from './MouthGeometry';

import {
  createMouthQualityAccumulator,
  evaluateMouthFrameQuality,
} from './MouthQualityGate';

const CYAN = '#00bcd4';
const GOLD = '#f5c518';

const ANALYSIS_FPS = 20;
const ANALYSIS_INTERVAL_MS =
  1000 / ANALYSIS_FPS;

/*
 * Mouth-crop controls.
 *
 * The crop width is based primarily on mouth width, not mouth opening.
 * This prevents the view from rapidly zooming when the jaw opens.
 *
 * The crop always preserves the target canvas aspect ratio.
 */
const CROP_WIDTH_MULTIPLIER = 3;
const CROP_HEIGHT_MULTIPLIER = 4.2;

const CROP_MIN_WIDTH_PX = 180;
const CROP_MAX_SOURCE_WIDTH_RATIO = 0.72;

const CROP_CENTER_SMOOTHING = 0.22;
const CROP_SIZE_SMOOTHING = 0.08;
const CROP_RECORDING_SIZE_SMOOTHING = 0.035;

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function lerp(
  current,
  target,
  amount
) {
  return (
    current +
    (target - current) *
      amount
  );
}

function drawContour(
  ctx,
  landmarks,
  indices,
  width,
  height,
  style
) {
  if (
    !ctx ||
    !landmarks?.length ||
    !indices?.length
  ) {
    return;
  }

  ctx.save();

  ctx.strokeStyle =
    style.stroke;

  ctx.lineWidth =
    style.lineWidth;

  ctx.beginPath();

  let started = false;

  indices.forEach(
    (index) => {
      const point =
        landmarks[index];

      if (!point) return;

      const x =
        point.x * width;

      const y =
        point.y * height;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
  );

  if (started) {
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

function drawMainOverlay(
  ctx,
  landmarks,
  width,
  height,
  quality
) {
  if (!ctx) return;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  drawContour(
    ctx,
    landmarks,
    OUTER_LIP,
    width,
    height,
    {
      stroke:
        quality?.usable
          ? CYAN
          : '#f87171',

      lineWidth: 3,
    }
  );

  drawContour(
    ctx,
    landmarks,
    INNER_LIP,
    width,
    height,
    {
      stroke:
        quality?.usable
          ? 'rgba(0,188,212,0.6)'
          : 'rgba(248,113,113,0.7)',

      lineWidth: 2,
    }
  );
}

function clearCanvas(
  canvas
) {
  if (!canvas) return;

  const ctx =
    canvas.getContext('2d');

  if (!ctx) return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}

/**
 * Reads the mouth bounds directly from the original MediaPipe
 * outer-lip landmarks in source-video pixel coordinates.
 *
 * This avoids relying on a display crop that may already have
 * been transformed or scaled.
 */
function getMouthBounds({
  landmarks,
  sourceWidth,
  sourceHeight,
}) {
  if (
    !Array.isArray(landmarks) ||
    !landmarks.length ||
    !sourceWidth ||
    !sourceHeight
  ) {
    return null;
  }

  const points =
    OUTER_LIP
      .map(
        (index) =>
          landmarks[index]
      )
      .filter(Boolean);

  if (!points.length) {
    return null;
  }

  const xValues =
    points.map(
      (point) =>
        point.x *
        sourceWidth
    );

  const yValues =
    points.map(
      (point) =>
        point.y *
        sourceHeight
    );

  const minX =
    Math.min(...xValues);

  const maxX =
    Math.max(...xValues);

  const minY =
    Math.min(...yValues);

  const maxY =
    Math.max(...yValues);

  const width =
    maxX - minX;

  const height =
    maxY - minY;

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 8 ||
    height < 3 ||
    width >
      sourceWidth * 0.5 ||
    height >
      sourceHeight * 0.45
  ) {
    return null;
  }

  return {
    centerX:
      (minX + maxX) / 2,

    centerY:
      (minY + maxY) / 2,

    width,
    height,
  };
}

/**
 * Produces a stable source-video crop rectangle.
 *
 * Important:
 * - source and output aspect ratios always match
 * - crop size changes slowly
 * - unusable tracking frames do not suddenly replace a valid crop
 * - mouth opening does not directly drive zoom
 */
function getStableCropRect({
  landmarks,
  sourceWidth,
  sourceHeight,
  outputWidth,
  outputHeight,
  quality,
  isRecording,
  cropStateRef,
}) {
  const mouthBounds =
    getMouthBounds({
      landmarks,
      sourceWidth,
      sourceHeight,
    });

  const existing =
    cropStateRef.current;

  if (
    !mouthBounds &&
    !existing
  ) {
    return null;
  }

  const outputAspect =
    outputWidth /
    Math.max(
      outputHeight,
      1
    );

  const maximumWidth =
    Math.max(
      1,
      Math.min(
        sourceWidth *
          CROP_MAX_SOURCE_WIDTH_RATIO,

        sourceHeight *
          outputAspect
      )
    );

  let targetCenterX =
    mouthBounds?.centerX ??
    existing?.centerX;

  let targetCenterY =
    mouthBounds?.centerY ??
    existing?.centerY;

  let targetWidth =
    existing?.width ??
    CROP_MIN_WIDTH_PX;

  if (mouthBounds) {
    const widthFromMouth =
      mouthBounds.width *
      CROP_WIDTH_MULTIPLIER;

    const minimumHeight =
      mouthBounds.height *
      CROP_HEIGHT_MULTIPLIER;

    const widthFromHeight =
      minimumHeight *
      outputAspect;

    targetWidth =
      Math.max(
        widthFromMouth,
        widthFromHeight,
        CROP_MIN_WIDTH_PX
      );

    targetWidth =
      clamp(
        targetWidth,
        Math.min(
          CROP_MIN_WIDTH_PX,
          maximumWidth
        ),
        maximumWidth
      );
  }

  /*
   * Only update the tracking target when the current geometry is usable.
   * The first frame is still allowed to initialize the crop.
   */
  const mayUpdate =
    !existing ||
    quality?.usable !== false;

  let nextState;

  if (!existing) {
    nextState = {
      centerX:
        targetCenterX,

      centerY:
        targetCenterY,

      width:
        targetWidth,
    };
  } else if (mayUpdate) {
    const sizeAmount =
      isRecording
        ? CROP_RECORDING_SIZE_SMOOTHING
        : CROP_SIZE_SMOOTHING;

    nextState = {
      centerX:
        lerp(
          existing.centerX,
          targetCenterX,
          CROP_CENTER_SMOOTHING
        ),

      centerY:
        lerp(
          existing.centerY,
          targetCenterY,
          CROP_CENTER_SMOOTHING
        ),

      width:
        lerp(
          existing.width,
          targetWidth,
          sizeAmount
        ),
    };
  } else {
    nextState = {
      ...existing,
    };
  }

  nextState.width =
    clamp(
      nextState.width,
      Math.min(
        CROP_MIN_WIDTH_PX,
        maximumWidth
      ),
      maximumWidth
    );

  let cropWidth =
    nextState.width;

  let cropHeight =
    cropWidth /
    outputAspect;

  /*
   * Final safety in case the source stream is unusually narrow or short.
   */
  if (
    cropHeight >
    sourceHeight
  ) {
    cropHeight =
      sourceHeight;

    cropWidth =
      cropHeight *
      outputAspect;
  }

  if (
    cropWidth >
    sourceWidth
  ) {
    cropWidth =
      sourceWidth;

    cropHeight =
      cropWidth /
      outputAspect;
  }

  const sourceX =
    clamp(
      nextState.centerX -
        cropWidth / 2,

      0,

      Math.max(
        0,
        sourceWidth -
          cropWidth
      )
    );

  const sourceY =
    clamp(
      nextState.centerY -
        cropHeight / 2,

      0,

      Math.max(
        0,
        sourceHeight -
          cropHeight
      )
    );

  /*
   * Save the actual clamped center. This prevents the state from fighting
   * the edge of the source image on every following frame.
   */
  cropStateRef.current = {
    centerX:
      sourceX +
      cropWidth / 2,

    centerY:
      sourceY +
      cropHeight / 2,

    width:
      cropWidth,
  };

  return {
    sourceX,
    sourceY,
    sourceWidth:
      cropWidth,
    sourceHeight:
      cropHeight,
  };
}

function drawMouthCrop({
  sourceVideo,
  targetCanvas,
  geometry,
  landmarks,
  quality,
  isRecording,
  cropStateRef,
}) {
  if (
    !sourceVideo ||
    !targetCanvas ||
    !geometry?.valid ||
    !Array.isArray(
      landmarks
    ) ||
    !landmarks.length ||
    !sourceVideo.videoWidth ||
    !sourceVideo.videoHeight
  ) {
    return false;
  }

  const ctx =
    targetCanvas.getContext(
      '2d'
    );

  if (!ctx) {
    return false;
  }

  const sourceVideoWidth =
    sourceVideo.videoWidth;

  const sourceVideoHeight =
    sourceVideo.videoHeight;

  const outputWidth =
    Math.max(
      1,
      Math.round(
        targetCanvas.clientWidth ||
        480
      )
    );

  const outputHeight =
    Math.max(
      1,
      Math.round(
        targetCanvas.clientHeight ||
        180
      )
    );

  /*
   * Do not reset the canvas bitmap unless its dimensions actually changed.
   * Assigning width/height clears canvas state and can create visible flicker.
   */
  if (
    targetCanvas.width !==
    outputWidth
  ) {
    targetCanvas.width =
      outputWidth;
  }

  if (
    targetCanvas.height !==
    outputHeight
  ) {
    targetCanvas.height =
      outputHeight;
  }

  const crop =
    getStableCropRect({
      landmarks,

      sourceWidth:
        sourceVideoWidth,

      sourceHeight:
        sourceVideoHeight,

      outputWidth,
      outputHeight,

      quality,
      isRecording,
      cropStateRef,
    });

  if (!crop) {
    return false;
  }

  ctx.clearRect(
    0,
    0,
    outputWidth,
    outputHeight
  );

  /*
   * The source crop and target canvas now have the same aspect ratio.
   * drawImage therefore scales uniformly rather than stretching the face.
   */
  ctx.save();

  ctx.translate(
    outputWidth,
    0
  );

  ctx.scale(
    -1,
    1
  );

  ctx.drawImage(
    sourceVideo,

    crop.sourceX,
    crop.sourceY,
    crop.sourceWidth,
    crop.sourceHeight,

    0,
    0,
    outputWidth,
    outputHeight
  );

  ctx.restore();

  /*
   * Convert source landmarks into mirrored crop coordinates.
   */
  const transformed =
    landmarks.map(
      (point) => ({
        x:
          1 -
          (
            (
              point.x *
                sourceVideoWidth -
              crop.sourceX
            ) /
            crop.sourceWidth
          ),

        y:
          (
            point.y *
              sourceVideoHeight -
            crop.sourceY
          ) /
          crop.sourceHeight,

        z:
          point.z,
      })
    );

  drawContour(
    ctx,
    transformed,
    OUTER_LIP,
    outputWidth,
    outputHeight,
    {
      stroke: CYAN,
      lineWidth: 3,
    }
  );

  drawContour(
    ctx,
    transformed,
    INNER_LIP,
    outputWidth,
    outputHeight,
    {
      stroke:
        'rgba(245,197,24,0.8)',

      lineWidth: 2,
    }
  );

  return true;
}

function meterValue(
  features,
  key
) {
  const value =
    Number(
      features?.[key]
    );

  return Number.isFinite(value)
    ? clamp(
        value,
        0,
        1
      )
    : 0;
}

function isFiniteNumber(
  value
) {
  return Number.isFinite(
    Number(value)
  );
}

export default function FaceLandmarkerOverlay({
  stream,
  isRecording,
  recordingStartTimeMs,
  onFeaturesFrame,
  onReady,
}) {
  const videoRef =
    useRef(null);

  const overlayCanvasRef =
    useRef(null);

  const cropCanvasRef =
    useRef(null);

  const cropStateRef =
    useRef(null);

  const engineRef =
    useRef(null);

  const frameRequestRef =
    useRef(null);

  const lastAnalysisRef =
    useRef(0);

  const recordingStartRef =
    useRef(null);

  const readyNotifiedRef =
    useRef(false);

  const qualityAccumulatorRef =
    useRef(
      createMouthQualityAccumulator()
    );

  const [
    status,
    setStatus,
  ] = useState('loading');

  const [
    features,
    setFeatures,
  ] = useState(null);

  const [
    guidance,
    setGuidance,
  ] = useState(
    'Position your face in the camera.'
  );

  const [
    qualitySummary,
    setQualitySummary,
  ] = useState(null);

  const engineOptions =
    useMemo(
      () => ({
        modelPath:
          '/models/face_landmarker.task',

        wasmPath:
          '/mediapipe/wasm',

        preferGpu:
          true,
      }),
      []
    );

  useEffect(() => {
    let cancelled = false;

    const start =
      async () => {
        try {
          setStatus(
            'loading'
          );

          const engine =
            createFaceLandmarkerEngine(
              engineOptions
            );

          await engine.initialize();

          if (cancelled) {
            engine.close();
            return;
          }

          engineRef.current =
            engine;

          setStatus(
            'ready'
          );
        } catch (error) {
          console.error(
            '[FaceLandmarkerOverlay] Initialization failed:',
            error
          );

          if (!cancelled) {
            setStatus(
              'error'
            );
          }
        }
      };

    start();

    return () => {
      cancelled = true;

      if (
        frameRequestRef.current
      ) {
        cancelAnimationFrame(
          frameRequestRef.current
        );
      }

      engineRef.current?.close();

      engineRef.current =
        null;
    };
  }, [engineOptions]);

  useEffect(() => {
    const video =
      videoRef.current;

    if (
      !video ||
      !stream
    ) {
      return undefined;
    }

    readyNotifiedRef.current =
      false;

    cropStateRef.current =
      null;

    lastAnalysisRef.current =
      0;

    setFeatures(null);

    setGuidance(
      'Position your face in the camera.'
    );

    clearCanvas(
      cropCanvasRef.current
    );

    video.srcObject =
      stream;

    video
      .play()
      .catch(() => {});

    return () => {
      if (
        video.srcObject ===
        stream
      ) {
        video.srcObject =
          null;
      }

      cropStateRef.current =
        null;
    };
  }, [stream]);

  useEffect(() => {
    if (
      isRecording &&
      isFiniteNumber(
        recordingStartTimeMs
      )
    ) {
      /*
       * Use the exact performance.now() zero point supplied by
       * PracticeRecorder. Do not create a second local start clock.
       */
      recordingStartRef.current =
        Number(
          recordingStartTimeMs
        );

      qualityAccumulatorRef.current.reset();

      setQualitySummary(
        null
      );

      return;
    }

    if (
      !isRecording &&
      recordingStartRef.current !=
        null
    ) {
      setQualitySummary(
        qualityAccumulatorRef.current.getSummary()
      );

      recordingStartRef.current =
        null;
    }
  }, [
    isRecording,
    recordingStartTimeMs,
  ]);

  useEffect(() => {
    if (
      (
        status !== 'ready' &&
        status !== 'no-face'
      ) ||
      !stream
    ) {
      return undefined;
    }

    let stopped = false;

    const analyze =
      (timestampMs) => {
        if (stopped) {
          return;
        }

        frameRequestRef.current =
          requestAnimationFrame(
            analyze
          );

        if (
          timestampMs -
            lastAnalysisRef.current <
          ANALYSIS_INTERVAL_MS
        ) {
          return;
        }

        lastAnalysisRef.current =
          timestampMs;

        const engine =
          engineRef.current;

        const video =
          videoRef.current;

        const overlayCanvas =
          overlayCanvasRef.current;

        if (
          !engine ||
          !video ||
          !overlayCanvas
        ) {
          return;
        }

        let result;

        try {
          result =
            engine.detectVideoFrame(
              video,
              timestampMs
            );
        } catch (error) {
          console.warn(
            '[FaceLandmarkerOverlay] Frame analysis failed:',
            error
          );

          return;
        }

        if (!result) {
          return;
        }

        const faceDetected =
          result.faceCount >
          0;

        const landmarks =
          result
            .faceLandmarks?.[0] ||
          null;

        const blendshapeMap =
          result
            .blendshapeMaps?.[0] ||
          {};

        const transformationMatrix =
          result
            .facialTransformationMatrixes?.[0] ||
          null;

        const displayWidth =
          overlayCanvas.clientWidth ||
          video.clientWidth ||
          640;

        const displayHeight =
          overlayCanvas.clientHeight ||
          video.clientHeight ||
          360;

        if (
          overlayCanvas.width !==
          displayWidth
        ) {
          overlayCanvas.width =
            displayWidth;
        }

        if (
          overlayCanvas.height !==
          displayHeight
        ) {
          overlayCanvas.height =
            displayHeight;
        }

        const ctx =
          overlayCanvas.getContext(
            '2d'
          );

        if (
          !faceDetected ||
          !landmarks
        ) {
          ctx?.clearRect(
            0,
            0,
            displayWidth,
            displayHeight
          );

          clearCanvas(
            cropCanvasRef.current
          );

          cropStateRef.current =
            null;

          setStatus(
            'no-face'
          );

          setGuidance(
            'Center your face in the camera.'
          );

          return;
        }

        const geometry =
          computeMouthGeometry(
            landmarks,
            {
              width:
                video.videoWidth,

              height:
                video.videoHeight,
            }
          );

        const blendshapes =
          extractMouthBlendshapes(
            blendshapeMap
          );

        const quality =
          evaluateMouthFrameQuality({
            faceDetected,
            geometry,
            transformationMatrix,

            trackingConfidence:
              null,

            frameWidth:
              video.videoWidth,

            frameHeight:
              video.videoHeight,
          });

        /*
         * These are the features used by grading.
         *
         * They are calculated from the original landmarks and blendshapes,
         * not from the rendered mouth-crop canvas.
         */
        const compatibility =
          buildLegacyCompatibleFeatures({
            geometry,
            blendshapes,
          });

        const nextFeatures = {
          ...compatibility,

          timestampMs,

          engine:
            'mediapipe-face-landmarker',

          engineDelegate:
            result.delegate,

          faceDetected,
          landmarks,
          geometry,
          blendshapes,
          quality,

          facialTransformationMatrix:
            transformationMatrix,
        };

        setStatus(
          'ready'
        );

        setFeatures(
          nextFeatures
        );

        setGuidance(
          quality.guidance
        );

        drawMainOverlay(
          ctx,
          landmarks,
          displayWidth,
          displayHeight,
          quality
        );

        const cropDrawn =
          drawMouthCrop({
            sourceVideo:
              video,

            targetCanvas:
              cropCanvasRef.current,

            geometry,
            landmarks,
            quality,
            isRecording,
            cropStateRef,
          });

        /*
         * Signal readiness only after a valid face has been processed
         * and the first live mouth crop has actually been drawn.
         */
        if (
          cropDrawn &&
          !readyNotifiedRef.current
        ) {
          readyNotifiedRef.current =
            true;

          onReady?.({
            engine:
              'mediapipe-face-landmarker',

            delegate:
              result.delegate,

            geometry,
            quality,
          });
        }

        if (isRecording) {
          const startedAt =
            isFiniteNumber(
              recordingStartTimeMs
            )
              ? Number(
                  recordingStartTimeMs
                )
              : recordingStartRef.current;

          /*
           * If the recorder has not supplied its shared zero point yet,
           * skip this frame rather than inventing a local timeline.
           */
          if (
            !isFiniteNumber(
              startedAt
            )
          ) {
            return;
          }

          const elapsedMs =
            Math.max(
              0,

              performance.now() -
                Number(
                  startedAt
                )
            );

          qualityAccumulatorRef.current.add(
            quality,
            elapsedMs
          );

          onFeaturesFrame?.(
            elapsedMs,
            nextFeatures
          );
        }
      };

    frameRequestRef.current =
      requestAnimationFrame(
        analyze
      );

    return () => {
      stopped = true;

      if (
        frameRequestRef.current
      ) {
        cancelAnimationFrame(
          frameRequestRef.current
        );
      }
    };
  }, [
    status,
    stream,
    isRecording,
    recordingStartTimeMs,
    onFeaturesFrame,
    onReady,
  ]);

  const usable =
    Boolean(
      features?.quality
        ?.usable
    );

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative w-full rounded-xl overflow-hidden bg-black"
        style={{
          aspectRatio:
            '16/9',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{
            transform:
              'scaleX(-1)',
          }}
        />

        <canvas
          ref={
            overlayCanvasRef
          }
          className="absolute inset-0 w-full h-full"
          style={{
            pointerEvents:
              'none',

            transform:
              'scaleX(-1)',
          }}
        />

        {status ===
          'loading' && (
          <StatusPanel text="Loading upgraded face tracking…" />
        )}

        {status ===
          'error' && (
          <StatusPanel text="Face tracking unavailable — reload and allow camera access to record" />
        )}

        {status ===
          'no-face' && (
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded text-xs"
            style={{
              background:
                'rgba(0,0,0,0.7)',

              color:
                '#fca5a5',
            }}
          >
            No face detected
          </div>
        )}

        {isRecording && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{
              background:
                'rgba(220,38,38,0.85)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />

            <span className="text-white text-xs font-semibold">
              REC
            </span>
          </div>
        )}
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background:
            '#050505',

          border:
            `2px solid ${
              usable
                ? CYAN
                : '#f87171'
            }`,
        }}
      >
        <div
          className="px-3 py-2 flex items-center justify-between"
          style={{
            background:
              'rgba(0,0,0,0.7)',
          }}
        >
          <span
            className="text-xs font-bold tracking-widest"
            style={{
              color: CYAN,
            }}
          >
            MOUTH ANALYSIS VIEW
          </span>

          <span
            className="text-xs font-semibold"
            style={{
              color:
                usable
                  ? '#34d399'
                  : '#fbbf24',
            }}
          >
            {usable
              ? 'Evidence usable'
              : guidance}
          </span>
        </div>

        <canvas
          ref={
            cropCanvasRef
          }
          className="block w-full"
          style={{
            height: 180,

            imageRendering:
              'auto',
          }}
        />
      </div>

      {features &&
        status ===
          'ready' && (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl p-2"
            style={{
              background:
                'rgba(0,0,0,0.55)',
            }}
          >
            <FeatureMeter
              label="Open"
              value={meterValue(
                features,
                'mouth_open'
              )}
              color={CYAN}
            />

            <FeatureMeter
              label="Spread"
              value={meterValue(
                features,
                'lip_spread'
              )}
              color={GOLD}
            />

            <FeatureMeter
              label="Pucker"
              value={
                features
                  .blendshapes
                  ?.mouthPucker ||
                0
              }
              color="#a78bfa"
            />

            <FeatureMeter
              label="Funnel"
              value={
                features
                  .blendshapes
                  ?.mouthFunnel ||
                0
              }
              color="#fb7185"
            />
          </div>
        )}

      {qualitySummary && (
        <div
          className="rounded-lg px-3 py-2 text-xs"
          style={{
            background:
              'rgba(0,188,212,0.08)',

            color:
              '#cbd5e1',

            border:
              '1px solid rgba(0,188,212,0.25)',
          }}
        >
          Visual evidence:{' '}

          <strong
            style={{
              color:
                qualitySummary
                  .visualEvidenceUsable
                  ? '#34d399'
                  : '#fbbf24',
            }}
          >
            {qualitySummary
              .visualEvidenceUsable
              ? 'usable'
              : 'insufficient'}
          </strong>

          {' · '}

          {Math.round(
            qualitySummary
              .usableFrameRatio *
              100
          )}

          % usable frames
        </div>
      )}
    </div>
  );
}

function StatusPanel({
  text,
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
      <div className="text-center px-4">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />

        <p
          className="text-xs"
          style={{
            color: CYAN,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function FeatureMeter({
  label,
  value,
  color,
}) {
  const normalized =
    clamp(
      Number(value) || 0,
      0,
      1
    );

  return (
    <div
      style={{
        padding:
          '4px 6px',
      }}
    >
      <div
        style={{
          display:
            'flex',

          justifyContent:
            'space-between',

          marginBottom: 3,
        }}
      >
        <span
          style={{
            color:
              '#94a3b8',

            fontSize: 10,

            fontWeight: 700,

            textTransform:
              'uppercase',
          }}
        >
          {label}
        </span>

        <span
          style={{
            color,

            fontSize: 10,

            fontWeight: 800,
          }}
        >
          {Math.round(
            normalized *
              100
          )}
          %
        </span>
      </div>

      <div
        style={{
          background:
            'rgba(255,255,255,0.12)',

          borderRadius: 3,

          height: 5,
        }}
      >
        <div
          style={{
            width:
              `${
                normalized *
                100
              }%`,

            background:
              color,

            borderRadius: 3,

            height:
              '100%',

            transition:
              'width 0.12s linear',
          }}
        />
      </div>
    </div>
  );
}
