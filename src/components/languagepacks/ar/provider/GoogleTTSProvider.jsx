export class GoogleTTSProvider {
  constructor(phonemeResolver = null, options = {}) {
    this.name = 'GoogleTTSProvider';
    this.locale = options.locale ?? 'ar-SA';
    this.ready = true;
    this._phonemeResolver = phonemeResolver;
    this.voice = options.voice ?? 'ar-XA-Neural2-A';
    this.speechRate = options.speechRate ?? 1.0;
    this.language = options.language ?? 'ar';
  }

  shutdown() {}

  getVoice() {
    return this.voice;
  }

  async synthesize(text, language = this.language) {
    const clean = String(text || '').trim();
    if (!clean) {
      return { audio: null, source: this.name };
    }

    console.log('[GoogleTTSProvider] synth request', {
      textLen: clean.length,
      language,
      locale: this.locale,
      voice: this.voice,
      speechRate: this.speechRate,
    });

    try {
      const { base44 } = await import('@/api/base44Client');
      const res = await base44.functions.invoke('googleTTS', {
        text: clean,
        language,
        locale: this.locale,
        voice: this.voice,
        speakingRate: this.speechRate,
        slow: false,
      });

      const b64 = res?.data?.audio_base64 || null;
      if (!b64) {
        return { audio: null, source: this.name };
      }

      const byteStr = atob(b64);
      const arr = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i += 1) {
        arr[i] = byteStr.charCodeAt(i);
      }

      const blob = new Blob([arr], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      return {
        audio: url,
        source: 'googleTTS',
        voice: this.voice,
        locale: this.locale,
        speechRate: this.speechRate,
      };
    } catch (err) {
      console.warn('[GoogleTTSProvider] TTS failed:', err?.message || err);
      return { audio: null, source: this.name };
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
