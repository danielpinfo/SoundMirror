/**
 * googleTTS — Multilingual Text-to-Speech via Google Cloud Neural2 voices
 *
 * Each language uses a genuine native-speaker Neural2 model, not a single
 * generalist voice. This ensures correct accent, prosody, and rhythm for
 * every language in SoundMirror.
 *
 * POST body:
 *   text      {string}  — source text to synthesize (always original, never helper text)
 *   language  {string}  — ISO-639-1 code: en, es, fr, de, it, pt, ja, zh, hi, ar
 *   speakingRate {number} — REQUIRED: provided by the active language pack; pack is the single source of truth (e.g., 0.4)
 *
 * Returns: { audio_base64: string }  — LINEAR16 or MP3 base64
 */

// Per-language native Neural2 / Wavenet voice configurations
// Format: { languageCode, name, ssmlGender }
const VOICE_MAP = {
  en: { languageCode: 'en-US', name: 'en-US-Neural2-D', ssmlGender: 'MALE' },
  es: { languageCode: 'es-US', name: 'es-US-Neural2-A', ssmlGender: 'FEMALE' },
  fr: { languageCode: 'fr-FR', name: 'fr-FR-Neural2-A', ssmlGender: 'FEMALE' },
  de: { languageCode: 'de-DE', name: 'de-DE-Neural2-F', ssmlGender: 'FEMALE' },
  it: { languageCode: 'it-IT', name: 'it-IT-Neural2-A', ssmlGender: 'FEMALE' },
  pt: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-A', ssmlGender: 'FEMALE' },
  ja: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B', ssmlGender: 'FEMALE' },
  zh: { languageCode: 'cmn-CN', name: 'cmn-CN-Wavenet-A', ssmlGender: 'FEMALE' },
  hi: { languageCode: 'hi-IN', name: 'hi-IN-Neural2-A', ssmlGender: 'FEMALE' },
  ar: { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-A', ssmlGender: 'FEMALE' },
};

Deno.serve(async (req) => {
  try {
    console.log('[googleTTS RUNTIME MARKER 2026-05-06-A]');
    const { text, language = 'en', slow = false, speakingRate, voice, ssml, debugNonce } = await req.json();
    console.log('[googleTTS] request', {
      language,
      speakingRate,
      slow,
      textLen: (text || '').length,
      debugNonce,
      hasSsml: !!ssml,
      ssmlLen: ssml ? ssml.trim().length : 0,
    });
    if (language === 'ar' && !(typeof speakingRate === 'number')) {
      console.warn('[googleTTS] WARNING: Arabic request without speakingRate');
    }

    if (!text?.trim()) {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GOOGLE_TTS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'GOOGLE_TTS_API_KEY not set' }, { status: 500 });
    }

    const voiceConfig = VOICE_MAP[language] ?? VOICE_MAP['en'];
    let speakingRateNum = Number(speakingRate);
    if (!Number.isFinite(speakingRateNum)) {
      speakingRateNum = slow ? 0.5 : 0.4;
      console.log('[googleTTS] speakingRate resolved (fallback)', { speakingRateRaw: speakingRate, slow, speakingRateNum });
    } else {
      speakingRateNum = Math.min(2.0, Math.max(0.25, speakingRateNum));
      console.log('[googleTTS] speakingRate resolved (provided)', { speakingRateRaw: speakingRate, speakingRateNum });
    }

    const voiceName = voice || voiceConfig.name;
    console.log('[googleTTS PAYLOAD]', {
      language,
      incomingVoice: voice,
      resolvedVoiceConfigName: voiceConfig.name,
      finalVoiceName: voiceName,
      speakingRateRaw: speakingRate,
      speakingRateNum,
      textLen: text.trim().length,
      debugNonce,
      hasSsml: !!ssml,
      ssmlLen: ssml ? ssml.trim().length : 0,
      usedInputType: ssml ? 'ssml' : 'text',
      ssmlPreview: ssml ? ssml.trim() : null,
      textPreview: text ? text.trim() : null,
    });
    const requestBody = {
      input: ssml
        ? { ssml: ssml.trim() }
        : { text: text.trim() },
      voice: (() => {
        return {
          languageCode: voiceConfig.languageCode,
          name: voiceName,
          ...((!voice || voiceName === voiceConfig.name) && {
            ssmlGender: voiceConfig.ssmlGender,
          }),
        };
      })(),
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speakingRateNum,
        pitch: 0,
      },
    };

    console.log('[googleTTS REQUEST BODY]', JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      let gMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        gMsg = parsed?.error?.message || errText;
      } catch {}
      console.error('[googleTTS] Google API error:', gMsg, {
        status: response.status,
        mode: 'text',
        language,
        voice: voiceName,
        speakingRate: speakingRateNum,
      });
      return Response.json({ error: 'Google TTS error', details: gMsg, status: response.status }, { status: 502 });
    }

    const data = await response.json();
    const audio_base64 = data.audioContent;

    console.log('[googleTTS RESULT]', {
      status: response.status,
      success: response.ok,
      finalVoiceName: voiceName,
      speakingRateNum,
      audioBase64Length: audio_base64?.length || 0,
    });

    if (!audio_base64) {
      return Response.json({ error: 'No audio returned from Google TTS' }, { status: 502 });
    }

    return Response.json({
      audio_base64,
      _debug: {
        language,
        incomingVoice: voice,
        resolvedVoiceConfigName: voiceConfig.name,
        finalVoiceName: voiceName,
        speakingRateRaw: speakingRate,
        speakingRateNum,
        textLen: text.trim().length,
        debugNonce,
        hasSsml: !!ssml,
        ssmlLen: ssml ? ssml.trim().length : 0,
        usedInputType: ssml ? 'ssml' : 'text',
        ssmlPreview: ssml ? ssml.trim() : null,
        textPreview: text ? text.trim() : null,
        audioBase64Length: audio_base64?.length || 0,
      },
    });

  } catch (err) {
    console.error('[googleTTS] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
