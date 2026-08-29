/**
 * FaceMeshOverlay compatibility wrapper
 *
 * Keeps the existing import path used by PracticeRecorder while routing all
 * work to the upgraded MediaPipe Face Landmarker implementation.
 *
 * Existing code can continue to import:
 *   import FaceMeshOverlay from './FaceMeshOverlay';
 */

export { default } from './faceLandmarker/FaceLandmarkerOverlay';