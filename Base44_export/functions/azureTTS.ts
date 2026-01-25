import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, lang = 'en-US', rate = 1.0, pitch = 1.0 } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const subscriptionKey = Deno.env.get('AZURE_SPEECH_KEY');
    const region = Deno.env.get('AZURE_SPEECH_REGION');

    if (!subscriptionKey || !region) {
      return Response.json({ error: 'Azure Speech credentials not configured' }, { status: 500 });
    }

    // Map language codes to Azure voices
    const voiceMap = {
      'en-US': 'en-US-JennyNeural',
      'en-GB': 'en-GB-SoniaNeural',
      'es-ES': 'es-ES-ElviraNeural',
      'es-MX': 'es-MX-DaliaNeural',
      'fr-FR': 'fr-FR-DeniseNeural',
      'de-DE': 'de-DE-KatjaNeural',
      'it-IT': 'it-IT-ElsaNeural',
      'pt-BR': 'pt-BR-FranciscaNeural',
      'zh-CN': 'zh-CN-XiaoxiaoNeural',
      'ja-JP': 'ja-JP-NanamiNeural',
    };

    const voice = voiceMap[lang] || voiceMap['en-US'];
    
    // Convert rate (0.5-2.0) to percentage (-50% to +100%)
    const ratePercent = Math.round((rate - 1) * 100);
    const rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

    // Convert pitch (0.5-2.0) to percentage (-50% to +50%)
    const pitchPercent = Math.round((pitch - 1) * 50);
    const pitchString = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`;

    // Build SSML
    const ssml = `
      <speak version='1.0' xml:lang='${lang}'>
        <voice name='${voice}'>
          <prosody rate='${rateString}' pitch='${pitchString}'>
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    // Call Azure TTS
    const ttsResponse = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        },
        body: ssml,
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('Azure TTS error:', errorText);
      return Response.json({ error: 'TTS generation failed', details: errorText }, { status: 500 });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Azure TTS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});