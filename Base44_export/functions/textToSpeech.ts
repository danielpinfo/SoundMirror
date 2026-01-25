import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Text-to-Speech using Azure Cognitive Services REST API
 * Returns high-quality audio for the target word/phrase
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, lang = "en-US", voice } = await req.json();

    if (!text) {
      return Response.json({ error: 'Missing required field: text' }, { status: 400 });
    }

    const azureKey = Deno.env.get("AZURE_SPEECH_KEY");
    const azureRegion = Deno.env.get("AZURE_SPEECH_REGION");
    
    if (!azureKey || !azureRegion) {
      return Response.json({ error: 'Azure Speech credentials not configured' }, { status: 500 });
    }

    // Use a high-quality neural voice
    const voiceName = voice || getDefaultVoice(lang);

    // Check if this is a short phonetic sound that needs IPA pronunciation
    const ipaSound = getIPAForSound(text);
    
    // Build SSML
    const ssml = ipaSound 
      ? `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">
          <voice name="${voiceName}">
            <phoneme alphabet="ipa" ph="${ipaSound}">${text}</phoneme>
          </voice>
        </speak>`
      : `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">
          <voice name="${voiceName}">${text}</voice>
        </speak>`;

    // Call Azure TTS REST API
    const ttsUrl = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
    
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3'
      },
      body: ssml
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure TTS API failed: ${response.status} - ${errorText}`);
    }

    // Get audio data
    const audioArrayBuffer = await response.arrayBuffer();
    const audioData = new Uint8Array(audioArrayBuffer);
    
    // Convert to base64
    const base64Audio = btoa(String.fromCharCode(...audioData));

    return Response.json({
      audio: base64Audio,
      format: 'mp3',
      text: text,
      voice: voiceName
    });

  } catch (error) {
    console.error('TTS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getDefaultVoice(lang) {
  const voices = {
    'en-US': 'en-US-JennyNeural',
    'en-GB': 'en-GB-SoniaNeural',
    'en-AU': 'en-AU-NatashaNeural',
    'es-ES': 'es-ES-ElviraNeural',
    'es-MX': 'es-MX-DaliaNeural',
    'fr-FR': 'fr-FR-DeniseNeural',
    'de-DE': 'de-DE-KatjaNeural',
    'it-IT': 'it-IT-ElsaNeural',
    'pt-BR': 'pt-BR-FranciscaNeural',
    'zh-CN': 'zh-CN-XiaoxiaoNeural',
    'ja-JP': 'ja-JP-NanamiNeural',
    'ko-KR': 'ko-KR-SunHiNeural'
  };
  return voices[lang] || voices['en-US'];
}

// Map letters and phonetic sounds to IPA phonemes for accurate pronunciation
function getIPAForSound(text) {
  if (!text || text.length > 4) return null;
  
  const lower = text.toLowerCase().trim();
  
  const ipaMap = {
    // Phonetic sounds with schwa (how letters are taught: "buh", "kuh", etc.)
    'ah': 'ɑː', 'buh': 'bʌ', 'kuh': 'kʌ', 'duh': 'dʌ', 'eh': 'ɛ',
    'fuh': 'fʌ', 'guh': 'ɡʌ', 'huh': 'hʌ', 'ih': 'ɪ', 'juh': 'dʒʌ',
    'luh': 'lʌ', 'muh': 'mʌ', 'nuh': 'nʌ', 'oh': 'oʊ', 'puh': 'pʌ',
    'kwuh': 'kwʌ', 'ruh': 'ɹʌ', 'sss': 's', 'tuh': 'tʌ', 'uh': 'ʌ',
    'vuh': 'vʌ', 'wuh': 'wʌ', 'ks': 'ks', 'yuh': 'jʌ', 'zzz': 'z',
    
    // Single consonants (their actual sounds with schwa)
    'b': 'bʌ', 'c': 'kʌ', 'd': 'dʌ', 'f': 'fʌ', 'g': 'ɡʌ',
    'h': 'hʌ', 'j': 'dʒʌ', 'k': 'kʌ', 'l': 'lʌ', 'm': 'mʌ',
    'n': 'nʌ', 'p': 'pʌ', 'q': 'kwʌ', 'r': 'ɹʌ', 's': 's',
    't': 'tʌ', 'v': 'vʌ', 'w': 'wʌ', 'x': 'ks', 'y': 'jʌ', 'z': 'z',
    
    // Single vowels (short sounds)
    'a': 'ɑː', 'e': 'ɛ', 'i': 'ɪ', 'o': 'oʊ', 'u': 'ʌ',
    
    // Common digraphs and combinations
    'th': 'θ', 'sh': 'ʃ', 'ch': 'tʃ', 'wh': 'w',
    'ph': 'f', 'ck': 'k', 'ng': 'ŋ', 'gh': 'ɡ',
    
    // Vowel combinations
    'oo': 'uː', 'ee': 'iː', 'aa': 'ɑː',
    'ou': 'aʊ', 'ow': 'aʊ', 'oi': 'ɔɪ', 'oy': 'ɔɪ',
    'au': 'ɔː', 'aw': 'ɔː', 'ai': 'eɪ', 'ay': 'eɪ',
    'ea': 'iː', 'ie': 'iː', 'ue': 'uː',
    
    // Consonant blends
    'bl': 'bl', 'cl': 'kl', 'fl': 'fl', 'gl': 'ɡl', 'pl': 'pl', 'sl': 'sl',
    'br': 'bɹ', 'cr': 'kɹ', 'dr': 'dɹ', 'fr': 'fɹ', 'gr': 'ɡɹ', 'pr': 'pɹ', 'tr': 'tɹ',
    'sc': 'sk', 'sk': 'sk', 'sm': 'sm', 'sn': 'sn', 'sp': 'sp', 'st': 'st', 'sw': 'sw'
  };
  
  return ipaMap[lower] || null;
}