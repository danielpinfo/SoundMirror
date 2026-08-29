/**
 * VideoAnalyzer
 *
 * DEPRECATED / DISABLED LEGACY STUB
 *
 * The former MediaPipe FaceMesh analysis pipeline has been retired.
 * Current mouth analysis is handled by:
 *
 * PracticeRecorder
 *   -> FaceMeshOverlay compatibility wrapper
 *   -> FaceLandmarkerOverlay
 *   -> MediaPipe Tasks Vision Face Landmarker
 *
 * This class remains only because Base44 may regenerate the file.
 *
 * It does NOT:
 * - initialize FaceMesh
 * - open the camera
 * - open the microphone
 * - analyze video
 * - generate facial features
 * - participate in grading
 */

export class VideoAnalyzer {
  async init() {
    console.warn(
      '[VideoAnalyzer] Disabled legacy analyzer — initialization skipped.'
    );

    return false;
  }

  analyzeFrame() {
    return null;
  }

  analyzeStream() {
    return {
      stop() {},
    };
  }

  close() {}

  static async openCamera() {
    console.warn(
      '[VideoAnalyzer] Disabled legacy analyzer — camera not opened.'
    );

    return null;
  }

  static async openMic() {
    console.warn(
      '[VideoAnalyzer] Disabled legacy analyzer — microphone not opened.'
    );

    return null;
  }
}