/**
 * AudioAnalyzer
 *
 * TEMPORARILY DISABLED / STUBBED
 *
 * This legacy analysis path is intentionally disconnected while the
 * SoundMirror phoneme-detection architecture is being audited.
 *
 * It does NOT:
 * - call phonemeEngine
 * - call any phoneme detector
 * - manufacture phoneme timestamps
 * - record audio
 * - call any provider
 *
 * Keep the public interface intact so existing imports do not crash.
 */

export class AudioAnalyzer {
  constructor(provider) {
    this.provider = provider;
  }

  async analyze(audioBuffer) {
    console.log(
      '[AudioAnalyzer] Disabled legacy analyzer — returning empty timeline.'
    );

    return [];
  }

  async analyzeStream(stream, durationMs = 3000) {
    console.log(
      '[AudioAnalyzer] Disabled legacy stream analyzer — no recording performed.'
    );

    return {
      blob: null,
      phonemes: [],
    };
  }
}