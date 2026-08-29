/**
 * GoogleTTSProvider — Spanish (es)
 *
 * Pack-owned TTS provider.
 * Synthesizes original source text only.
 * Helper/pronunciation text must never be sent to TTS.
 */

export class GoogleTTSProvider {
  constructor(phonemeResolver = null, options = {}) {
    this.name = 'GoogleTTSProvider';
    this.locale = options?.locale ?? 'es-US';
    this.ready = true;
    this._phonemeResolver = phonemeResolver;
    this._voice = options?.voice ?? 'es-US-Neural2-A';
    this._speechRate = options?.speechRate ?? 0.4;
    this._language = options?.language ?? 'es';
  }

  shutdown() {}

  async synthesize(text, language = this._language, options = {}) {
    const sourceText = String(text || '').trim();
    const speakingRate = Number.isFinite(options?.speechRate)
      ? options.speechRate
      : this._speechRate;
    const ssml = typeof options?.ssml === 'string' && options.ssml.trim()
      ? options.ssml.trim()
      : null;

    if (!sourceText) {
      return { audio: null };
    }

    try {
      const { base44 } = await import('@/api/base44Client');

      const response = await base44.functions.invoke('googleTTSLive', {
        text: sourceText,
        language,
        voice: this._voice,
        locale: this.locale,
        speakingRate,
        ...(ssml ? { ssml } : {}),
      });

      const backendInputType = response?.data?._debug?.usedInputType ?? null;

      if (ssml && backendInputType && backendInputType !== 'ssml') {
        throw new Error(
          `Spanish guided cue expected SSML but backend used ${backendInputType}`
        );
      }

      const audioBase64 =
        response?.data?.audio_base64 ??
        response?.data?.audioBase64 ??
        null;

      if (!audioBase64) {
        throw new Error('No audio payload returned from googleTTS');
      }

      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audio = URL.createObjectURL(blob);

      return {
        audio,
        source: 'googleTTS',
      };
    } catch (_error) {
      return { audio: null };
    }
  }

  getAnimationPhonemes(text) {
    if (!this._phonemeResolver) return null;
    return this._phonemeResolver.resolve(text, this._language);
  }

  async analyzeAudio(_audioBuffer) {
    return [];
  }
}

export default GoogleTTSProvider;
