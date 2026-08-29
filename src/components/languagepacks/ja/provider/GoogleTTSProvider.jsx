export class GoogleTTSProvider {
  constructor(phonemeResolver = null, options = {}) {
    this.name = 'GoogleTTSProvider';
    this.locale = options.locale ?? 'ja-JP';
    this.ready = true;
    this._phonemeResolver = phonemeResolver;
    this.voice = options.voice ?? 'ja-JP-Neural2-B';
    this.speechRate = options.speechRate ?? 0.4;
    this.language = options.language ?? 'ja';
  }

  shutdown() {}

  getVoice() {
    return this.voice;
  }

  async synthesize(text, language = this.language, options = {}) {
    const speakingRate = Number.isFinite(options?.speechRate)
      ? options.speechRate
      : this.speechRate;
    console.log('[GoogleTTSProvider] synthesize() →', {
      text,
      language,
      voice: this.voice,
      speakingRate,
      locale: this.locale,
    });

    try {
      const { base44 } = await import('@/api/base44Client');

      const response = await base44.functions.invoke('googleTTS', {
        text: String(text || '').trim(),
        language,
        voice: this.voice,
        locale: this.locale,
        speakingRate: speakingRate,
        slow: false,
      });

      const { audio_base64 } = response.data ?? {};
      if (!audio_base64) {
        throw new Error('No audio_base64 in response');
      }

      const binaryStr = atob(audio_base64);
      const bytes = new Uint8Array(binaryStr.length);

      for (let i = 0; i < binaryStr.length; i += 1) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audio = URL.createObjectURL(blob);

      return {
        audio,
        source: 'googleTTS',
        voice: this.voice,
        locale: this.locale,
        speakingRate,
      };
    } catch (err) {
      console.warn('[GoogleTTSProvider] TTS failed:', err?.message || err);
      return { audio: null };
    }
  }

  getAnimationPhonemes(text) {
    if (!this._phonemeResolver) return null;
    return this._phonemeResolver.resolve(text);
  }

  async analyzeAudio(_audioBuffer) {
    return [];
  }
}

export default GoogleTTSProvider;
