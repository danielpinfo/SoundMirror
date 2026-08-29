/**
 * PracticeController
 *
 * DEPRECATED / DISABLED LEGACY STUB
 *
 * The former PracticeController pipeline has been retired.
 *
 * This file intentionally:
 * - does NOT open the microphone
 * - does NOT open the camera
 * - does NOT record audio or video
 * - does NOT call AudioAnalyzer
 * - does NOT call VideoAnalyzer
 * - does NOT call ArticulationComparator
 * - does NOT write to PracticeArchive
 *
 * The exported class remains only to prevent unexpected legacy references
 * from crashing the application.
 */

export class PracticeController {
  constructor(pluginConfig = null) {
    this._config = pluginConfig;
    this.lastResult = null;
  }

  get isRecording() {
    return false;
  }

  async startRecording() {
    console.warn(
      '[PracticeController] Disabled legacy controller — no recording started.'
    );

    return false;
  }

  async stopRecording() {
    console.warn(
      '[PracticeController] Disabled legacy controller — nothing to stop.'
    );

    return null;
  }

  async processRecording() {
    console.warn(
      '[PracticeController] Disabled legacy controller — no analysis performed.'
    );

    return null;
  }

  async savePractice() {
    console.warn(
      '[PracticeController] Disabled legacy controller — nothing saved.'
    );

    return null;
  }

  get archive() {
    return null;
  }
}