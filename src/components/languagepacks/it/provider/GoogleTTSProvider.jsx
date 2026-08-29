export default class GoogleTTSProvider {
  constructor(phonemeResolver = null, voice = 'it-IT-Neural2-A') {
    this.name = 'GoogleTTSProvider';
    this.locale = 'it-IT';
    this.ready = true;
    this._phonemeResolver = phonemeResolver;
    this._voice = voice;
  }

  shutdown() {}

  async synthesize(text, language = 'it') {
    console.log('[GoogleTTSProvider] synthesize() →', { text, language });

    try {
      const { base44 } = await import('@/api/base44Client');
      const response = await base44.functions.invoke('googleTTS', {
        text: String(text || '').trim(),
        language,
      });

      const { audio_base64 } = response.data || {};
      if (!audio_base64) throw new Error('No audio_base64 in response');

      const binaryStr = atob(audio_base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audio = URL.createObjectURL(blob);

      return { audio, source: 'googleTTS' };
    } catch (err) {
      console.warn('[GoogleTTSProvider] TTS failed:', err.message);
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