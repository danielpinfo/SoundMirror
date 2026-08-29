export class GoogleTTSProvider {
  constructor(phonemeResolver = null, options = {}) {
    this.name = 'GoogleTTSProvider';
    this.locale = options?.locale ?? 'zh-CN';
    this.ready = true;
    this._phonemeResolver = phonemeResolver;
    this._voice = options?.voice ?? 'zh-CN-Neural2-A';
    this._speechRate = options?.speechRate ?? 0.4;
    this._language = options?.language ?? 'zh';
  }

  shutdown() {}

  async synthesize(text, language = this._language) {
    const sourceText = String(text || '').trim();

    if (!sourceText) {
      return { audio: null };
    }

    try {
      const { base44 } = await import('@/api/base44Client');

      const response = await base44.functions.invoke('googleTTS', {
        text: sourceText,
        language,
        voice: this._voice,
        locale: this.locale,
        speakingRate: this._speechRate,
      });

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
