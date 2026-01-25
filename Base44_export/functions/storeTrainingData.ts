// functions/storeTrainingData
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * StoreTrainingData
 *
 * Called from the Teach Letters page after each teacher recording.
 *
 * Request body JSON:
 * {
 *   letter: string,
 *   language: string, // 'en', 'es', etc.
 *   audioFileUrl: string,
 *   phonemeData: object, // result of getPhonemes
 *   blendshapes: array,
 *   attemptNumber: number  // 1, 2, 3...
 * }
 *
 * Response JSON:
 * {
 *   success: boolean,
 *   attemptCount: number,
 *   complete: boolean,             // true when we have at least 3 attempts
 *   averagePhonemeData: object|null
 * }
 */

// Simple "mode" helper (most frequent value)
function mode(values) {
  if (!values || values.length === 0) return null;
  const counts = new Map();

  for (const v of values) {
    if (v == null) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }

  let best = null;
  let bestCount = 0;

  for (const [value, count] of counts.entries()) {
    if (count > bestCount) {
      bestCount = count;
      best = value;
    }
  }

  return best;
}

// Build an "average" phoneme template from multiple teacher recordings
function computeAveragePhonemeTemplate(records, language) {
  if (!records || records.length === 0) return null;

  const samples = records
    .map((r) => r.phoneme_data || r.phonemeData || {})
    .filter((s) => s && typeof s === 'object');

  if (samples.length === 0) return null;

  const primaries = [];
  const ipaAll = [];
  const phonemeListAll = [];

  for (const s of samples) {
    if (typeof s.primary === 'string' && s.primary.trim().length > 0) {
      primaries.push(s.primary.trim());
    }

    if (Array.isArray(s.ipa_units)) {
      for (const u of s.ipa_units) {
        if (u != null) ipaAll.push(String(u));
      }
    }

    if (Array.isArray(s.phoneme_list)) {
      for (const p of s.phoneme_list) {
        if (p != null) phonemeListAll.push(String(p));
      }
    }
  }

  const dominantPrimary = mode(primaries);
  const uniqueIpa = Array.from(new Set(ipaAll));
  const uniquePhonemes = Array.from(new Set(phonemeListAll));

  // Use the first sample as a base; override a few key fields
  const base = samples[0];

  return {
    // keep backend + model info if present
    backend: base.backend || 'wav2vec2',
    model: base.model || null,
    lang: base.lang || language,

    // canonical / averaged views
    primary: dominantPrimary || base.primary || null,
    ipa_units: uniqueIpa.length > 0 ? uniqueIpa : base.ipa_units || [],
    phoneme_list:
      uniquePhonemes.length > 0 ? uniquePhonemes : base.phoneme_list || [],

    // keep raw text / transcription from the first sample as reference
    raw_transcription: base.raw_transcription || (base.produced && base.produced.text) || '',
    raw_text: base.raw_text || base.raw_transcription || '',

    // keep dominant summary if available
    dominant: {
      ipa:
        (base.dominant && base.dominant.ipa) ||
        (uniqueIpa.length > 0 ? uniqueIpa[0] : null),
      base44:
        (base.dominant && base.dominant.base44) ||
        (Array.isArray(base.base44) && base.base44.length > 0
          ? base.base44[0]
          : null),
      syllable:
        (base.dominant && base.dominant.syllable) ||
        dominantPrimary ||
        null,
    },
  };
}

Deno.serve(async (req) => {
  console.log('[storeTrainingData] Request received');

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      console.warn('[storeTrainingData] Unauthorized request');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
      console.log('[storeTrainingData] Body:', JSON.stringify(body));
    } catch (parseError) {
      console.error('[storeTrainingData] Failed to parse body:', parseError);
      return Response.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const {
      letter,
      language,
      audioFileUrl,
      phonemeData,
      blendshapes,
      attemptNumber,
    } = body || {};

    if (!letter || !language || !audioFileUrl || !phonemeData || !attemptNumber) {
      console.error('[storeTrainingData] Missing required fields');
      return Response.json(
        {
          error:
            'Missing required fields: letter, language, audioFileUrl, phonemeData, attemptNumber',
        },
        { status: 400 }
      );
    }

    const teacherEmail = user.email || null;

    // 1) Create TrainingRecording row
    console.log('[storeTrainingData] Creating TrainingRecording entity');
    const created = await base44.entities.TrainingRecording.create({
      letter,
      language,
      recording_url: audioFileUrl,
      phoneme_data: phonemeData,
      teacher_email: teacherEmail,
      attempt_number: attemptNumber,
      blendshapes: Array.isArray(blendshapes) ? blendshapes : [],
    });

    console.log('[storeTrainingData] Created TrainingRecording id:', created.id);

    // 2) Fetch all existing recordings for this letter+language+teacher
    console.log(
      '[storeTrainingData] Fetching all recordings for',
      letter,
      language,
      teacherEmail
    );

    const allRecords =
      (await base44.entities.TrainingRecording.filter({
        letter,
        language,
        teacher_email: teacherEmail,
      })) || [];

    const attemptCount = allRecords.length;
    const complete = attemptCount >= 3;

    // 3) Compute an "average" phoneme template
    const averagePhonemeData = computeAveragePhonemeTemplate(
      allRecords,
      language
    );

    console.log('[storeTrainingData] attemptCount:', attemptCount);
    console.log('[storeTrainingData] complete:', complete);
    console.log(
      '[storeTrainingData] averagePhonemeData:',
      JSON.stringify(averagePhonemeData)
    );

    return Response.json({
      success: true,
      attemptCount,
      complete,
      averagePhonemeData,
    });
  } catch (error) {
    console.error('[storeTrainingData] Function error:', error);
    return Response.json(
      { error: (error && error.message) || String(error) },
      { status: 500 }
    );
  }
});
