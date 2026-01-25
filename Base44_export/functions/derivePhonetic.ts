import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { letter, language, averagePhonemeData } = await req.json();

    // Use LLM to derive a simple phonetic spelling from the averaged IPA data
    const prompt = `You are a phonetic expert. Based on the following phoneme analysis data, provide a SIMPLE, EASY-TO-PRONOUNCE phonetic spelling (2-4 characters max) that represents how to say this letter sound.

Letter: ${letter}
Language: ${language}
IPA Units: ${JSON.stringify(averagePhonemeData.ipa_units || [])}
Phoneme List: ${JSON.stringify(averagePhonemeData.phoneme_list || [])}
Raw Transcription: ${averagePhonemeData.raw_transcription || ''}

Examples of good phonetic spellings:
- For "M" sound: "ma" or "em"
- For "S" sound: "sa" or "ss"
- For "Ñ" sound: "nya"
- For "A" sound: "ah"

Respond with ONLY the phonetic spelling, nothing else. Keep it simple and pronounceable.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt
    });

    const derivedPhonetic = String(result || '').trim().toLowerCase();

    return Response.json({ 
      derived_phonetic: derivedPhonetic,
      ipa_units: averagePhonemeData.ipa_units || []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});