/**
 * FaceLandmarkerEngine
 *
 * Thin, reusable wrapper around MediaPipe Tasks Vision Face Landmarker.
 *
 * Responsibilities:
 * - Initialize the Face Landmarker once
 * - Prefer GPU and fall back to CPU
 * - Process VIDEO frames
 * - Return landmarks, blendshapes, and transformation matrices
 * - Avoid duplicate work on the same video frame
 * - Dispose cleanly
 *
 * Required package:
 *   @mediapipe/tasks-vision
 *
 * Expected local assets:
 *   /models/face_landmarker.task
 *   /mediapipe/wasm/
 */

import {
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

export const DEFAULT_FACE_LANDMARKER_MODEL_PATH =
  '/models/face_landmarker.task';

export const DEFAULT_MEDIAPIPE_WASM_PATH =
  '/mediapipe/wasm';

const DEFAULT_OPTIONS = Object.freeze({
  modelPath: DEFAULT_FACE_LANDMARKER_MODEL_PATH,
  wasmPath: DEFAULT_MEDIAPIPE_WASM_PATH,
  numFaces: 1,
  minFaceDetectionConfidence: 0.6,
  minFacePresenceConfidence: 0.6,
  minTrackingConfidence: 0.6,
  preferGpu: true,
});

function categoriesToMap(categories = []) {
  const map = {};

  for (const category of categories) {
    const name =
      category?.categoryName ||
      category?.displayName ||
      category?.index?.toString();

    if (!name) continue;

    const score = Number(category?.score);
    map[name] = Number.isFinite(score) ? score : 0;
  }

  return map;
}

function normalizeResult(result, timestampMs, delegate) {
  const faceLandmarks = result?.faceLandmarks ?? [];
  const faceBlendshapes = result?.faceBlendshapes ?? [];
  const facialTransformationMatrixes =
    result?.facialTransformationMatrixes ?? [];

  return {
    timestampMs,
    delegate,
    faceCount: faceLandmarks.length,
    faceLandmarks,
    faceBlendshapes,
    blendshapeMaps: faceBlendshapes.map((entry) =>
      categoriesToMap(entry?.categories)
    ),
    facialTransformationMatrixes,
    raw: result,
  };
}

export class FaceLandmarkerEngine {
  constructor(options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.landmarker = null;
    this.delegate = null;
    this.initializationPromise = null;
    this.lastVideoTime = -1;
    this.closed = false;
  }

  get isReady() {
    return Boolean(this.landmarker) && !this.closed;
  }

  async initialize() {
    if (this.closed) {
      throw new Error(
        'FaceLandmarkerEngine has been closed and cannot be reinitialized.'
      );
    }

    if (this.landmarker) return this;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.#initializeInternal();

    try {
      await this.initializationPromise;
      return this;
    } catch (error) {
      this.initializationPromise = null;
      throw error;
    }
  }

  async #initializeInternal() {
    const vision = await FilesetResolver.forVisionTasks(
      this.options.wasmPath
    );

    const delegates = this.options.preferGpu
      ? ['GPU', 'CPU']
      : ['CPU'];

    let lastError = null;

    for (const delegate of delegates) {
      try {
        this.landmarker = await FaceLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: this.options.modelPath,
              delegate,
            },
            runningMode: 'VIDEO',
            numFaces: this.options.numFaces,
            minFaceDetectionConfidence:
              this.options.minFaceDetectionConfidence,
            minFacePresenceConfidence:
              this.options.minFacePresenceConfidence,
            minTrackingConfidence:
              this.options.minTrackingConfidence,
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
          }
        );

        this.delegate = delegate;
        this.lastVideoTime = -1;
        return;
      } catch (error) {
        lastError = error;
        this.landmarker = null;
      }
    }

    throw new Error(
      `Unable to initialize MediaPipe Face Landmarker: ${
        lastError?.message || String(lastError)
      }`
    );
  }

  /**
   * Analyze the current HTMLVideoElement frame.
   *
   * Returns null when:
   * - the engine is not ready,
   * - the video has no usable frame,
   * - or the exact same video frame was already processed.
   */
  detectVideoFrame(video, timestampMs = performance.now()) {
    if (!this.isReady) {
      throw new Error(
        'FaceLandmarkerEngine.detectVideoFrame called before initialize().'
      );
    }

    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return null;
    }

    if (
      !Number.isFinite(video.videoWidth) ||
      !Number.isFinite(video.videoHeight) ||
      video.videoWidth <= 0 ||
      video.videoHeight <= 0
    ) {
      return null;
    }

    // Prevent duplicate inference when requestAnimationFrame fires faster
    // than the camera provides new frames.
    if (video.currentTime === this.lastVideoTime) {
      return null;
    }

    this.lastVideoTime = video.currentTime;

    const result = this.landmarker.detectForVideo(
      video,
      timestampMs
    );

    return normalizeResult(
      result,
      timestampMs,
      this.delegate
    );
  }

  resetFrameClock() {
    this.lastVideoTime = -1;
  }

  close() {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // Cleanup must not crash the surrounding recorder.
      }
    }

    this.landmarker = null;
    this.delegate = null;
    this.initializationPromise = null;
    this.lastVideoTime = -1;
    this.closed = true;
  }
}

export function createFaceLandmarkerEngine(options = {}) {
  return new FaceLandmarkerEngine(options);
}