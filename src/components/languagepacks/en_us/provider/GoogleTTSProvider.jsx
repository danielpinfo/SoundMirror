/**
 * SoundMirror Pack TTS Provider
 * English (US)
 *
 * Canonical Google TTS provider
 * Fixes:
 * - speed reverting to 1.0
 * - provider naming mismatch
 * - playbackRate consistency
 */

function escapeSsmlText(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildPhraseSsml(text, breakMs = 500) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return null;

  return `<speak>${words.map(escapeSsmlText).join(`<break time="${breakMs}ms"/>`)}</speak>`;
}

async function measureAudioDuration(audioUrl) {
  return await new Promise((resolve) => {
    const probe = new Audio();
    let settled = false;

    const done = (value) => {
      if (settled) return;
      settled = true;
      probe.removeEventListener('loadedmetadata', onLoadedMetadata);
      clearTimeout(timer);
      probe.removeAttribute('src');
      probe.load();
      resolve(value);
    };

    const onLoadedMetadata = () => {
      done(Number.isFinite(probe.duration) ? probe.duration : null);
    };

    const timer = setTimeout(() => done(null), 5000);

    probe.addEventListener('loadedmetadata', onLoadedMetadata);
    probe.src = audioUrl;
    probe.load();
  });
}

function decodeAudioBase64(audioBase64) {
  const binaryStr = atob(audioBase64);
  const bytes = new Uint8Array(binaryStr.length);

  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return new Blob([bytes], { type: 'audio/mpeg' });
}

export class GoogleTTSProvider {
  constructor(phonemeResolver = null, options = {}) {
    this.name = 'EnglishUSTTSProvider';
    this.locale = 'en-US';
    this.ready = true;

    this._phonemeResolver = phonemeResolver;

    this._voice = options.voice ?? 'en-US-Neural2-D';
    this._speechRate =
      typeof options.speechRate === 'number'
        ? options.speechRate
        : 0.4;

    this._language = options.language ?? 'en-US';
  }

  shutdown() {}

  async synthesize(text, language = this._language, options = {}) {
    const speechRate =
      Number.isFinite(options.speechRate)
        ? options.speechRate
        : this._speechRate;

    const clean = (text || '').trim();

    if (!clean) {
      return { audio: null };
    }

    try {
      const { base44 } = await import('@/api/base44Client');

      const debugNonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const suppliedSsml = String(options?.ssml || '').trim();
      const ssml = suppliedSsml || buildPhraseSsml(clean, 500);

      console.log('[TTS PROVIDER PAYLOAD]', {
        text: clean,
        language,
        voice: this._voice,
        speakingRate: speechRate,
        debugNonce,
      });

      if (ssml) {
        console.log('[TTS GENERATED SSML]', {
          text: clean,
          ssml,
          breakCount: (ssml.match(/<break\s+/g) || []).length,
        });
      }

      const response = await base44.functions.invoke('googleTTSLive', {
        text: clean,
        ...(ssml ? { ssml } : {}),
        language,
        voice: this._voice,
        speakingRate: speechRate,
        debugNonce,
      });

      const backendInputType = response.data?._debug?.usedInputType ?? null;

      if (suppliedSsml && backendInputType && backendInputType !== 'ssml') {
        throw new Error(
          `English custom cue expected SSML but backend used ${backendInputType}`
        );
      }

      const { audio_base64 } = response.data ?? {};
      console.log('[TTS BACKEND DEBUG]', response.data?._debug ?? null);
      console.log('[TTS ROUNDTRIP CHECK]', {
        text: clean,
        sentSpeechRate: speechRate,
        sentVoice: this._voice,
        usedInputType: response.data?._debug?.usedInputType ?? null,
        backendSsmlLen: response.data?._debug?.ssmlLen ?? null,
      });

      if (!audio_base64) {
        throw new Error('No audio returned');
      }

      const blob = decodeAudioBase64(audio_base64);
      const audio = URL.createObjectURL(blob);
      const measuredDurationSec = await measureAudioDuration(audio);

      console.log('[TTS PROVIDER DURATION]', {
        text: clean,
        speakingRate: speechRate,
        voice: this._voice,
        audioBase64Length: audio_base64?.length || 0,
        blobSize: blob.size,
        measuredDurationSec:
          Number.isFinite(measuredDurationSec)
            ? Number(measuredDurationSec.toFixed(3))
            : 'unknown',
      });


      return {
        audio,
        source: 'googleTTS',
        rate: this._speechRate,
      };

    } catch (err) {
      console.warn('[English TTS] failed', err);
      throw err;
    }
  }

  getPlaybackRate() {
    return this._speechRate ?? 0.4;
  }

  getAnimationPhonemes(text) {
    if (!this._phonemeResolver) return null;
    return this._phonemeResolver.resolve(text);
  }

  async analyzeAudio() {
    return [];
  }
}

export default GoogleTTSProvider;
