import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import getAudioUrl from 'npm:google-tts-api@0.0.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, lang = 'en-US' } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    // Get audio URL from Google TTS (it returns a Promise)
    const audioUrl = await getAudioUrl(text, {
      lang: lang,
      slow: false,
      host: 'https://translate.google.com'
    });

    // Fetch the audio
    const audioResponse = await fetch(audioUrl);
    
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch audio from Google TTS');
    }

    const audioBlob = await audioResponse.arrayBuffer();

    return new Response(audioBlob, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBlob.byteLength.toString()
      }
    });

  } catch (error) {
    console.error('[Google TTS] Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate speech' 
    }, { status: 500 });
  }
});