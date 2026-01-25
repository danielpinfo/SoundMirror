import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * UNIFIED Phoneme Analysis Function
 *
 * This is the ONLY function that should be called for phoneme detection.
 *
 * BEHAVIOR:
 * - Uses per-language phoneme backend URLs (PHONEME_BACKEND_URL_EN, PHONEME_BACKEND_URL_ES, etc.)
 * - Falls back to English backend if no dedicated backend exists
 * - Exposes a SINGLE, normalized JSON shape for all languages
 * - NEW: surfaces syllable-level fields from the backend:
 *      - primary      (main syllable)
 *      - tokens       (raw tokens/chunks)
 *      - clean_tokens (cleaned tokens)
 *      - syllable.*   (grouped view)
 */

// ----------------------------------------------------------
// Backend URL resolution
// ----------------------------------------------------------

function getPhonemeBackendUrlForLang(lang) {
  const normalized = (lang || 'en').toLowerCase().slice(0, 2); // "en-US" -> "en"

  // Use the Railway naming scheme: soundmirror-{lang}-phoneme-backend-production
  const secretName = `soundmirror-${normalized}-phoneme-backend-production`;
  const langBackendUrl = Deno.env.get(secretName);

  if (langBackendUrl) {
    console.log(`[getPhonemes] Found backend for ${normalized}: ${secretName}`);
    return { url: langBackendUrl, lang: normalized };
  }

  // fallback to English backend
  const englishBackendUrl = Deno.env.get('soundmirror-en-phoneme-backend-production');
  if (englishBackendUrl) {
    console.log(
      `[getPhonemes] No backend for ${normalized}, falling back to EN`
    );
    return { url: englishBackendUrl, lang: 'en' };
  }

  return { url: null, lang: normalized };
}

// ----------------------------------------------------------
// Language-specific normalization hook (currently only Ñ)
// ----------------------------------------------------------

function normalizeSpanishResult(phonemeResult, effectiveLang, targetText) {
  const isSpanish = (effectiveLang || '').startsWith('es');
  if (!isSpanish) return phonemeResult;

  const result = { ...phonemeResult };

  // Ensure phoneme_list exists if phonemes is a string
  if (
    !Array.isArray(result.phoneme_list) &&
    typeof result.phonemes === 'string'
  ) {
    result.phoneme_list = result.phonemes
      .split(/\s+/)
      .filter((p) => p.length > 0);
  }

  // If practicing Ñ specifically, force canonical representation
  const isEnyeTarget =
    typeof targetText === 'string' && targetText.toLowerCase().includes('ñ');

  if (isEnyeTarget) {
    result.phonemes = 'ñ';
    result.phoneme_list = ['ñ'];
  }

  return result;
}

// ----------------------------------------------------------
// Helper: fetch canonical IPA for target (expected_ipa)
// ----------------------------------------------------------

async function fetchExpectedIpa(phonemeBackendUrl, targetText, effectiveLang) {
  if (!phonemeBackendUrl || !targetText) {
    return null;
  }

  try {
    const base = phonemeBackendUrl.replace(/\/$/, '');
    const url =
      `${base}/expected_ipa?text=${encodeURIComponent(
        targetText
      )}&lang=${encodeURIComponent(effectiveLang || 'en')}`;

    console.log('[getPhonemes] Fetching expected IPA from:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(
        '[getPhonemes] expected_ipa request failed with status',
        res.status
      );
      return null;
    }

    const data = await res.json();
    console.log('[getPhonemes] expected_ipa result:', data);
    return data;
  } catch (err) {
    console.warn(
      '[getPhonemes] expected_ipa fetch error:',
      err && err.message ? err.message : String(err)
    );
    return null;
  }
}

// ----------------------------------------------------------
// Generic normalization into ONE unified shape
// ----------------------------------------------------------

function normalizeBackendResult(
  phonemeResult,
  requestedLang,
  effectiveLang,
  backendUrl
) {
  const res = phonemeResult || {};

  // 1) Raw phoneme fields (as provided by backend)
  const phonemes =
    typeof res.phonemes === 'string'
      ? res.phonemes
      : Array.isArray(res.phoneme_list)
      ? res.phoneme_list.join(' ')
      : '';

  const phoneme_list = Array.isArray(res.phoneme_list)
    ? res.phoneme_list
    : phonemes
    ? phonemes.split(/\s+/).filter((p) => p.length > 0)
    : [];

  // 2) IPA + Base44 units (if backend provides them)
  const ipa_units = Array.isArray(res.ipa_units) ? res.ipa_units : null;
  const base44 = Array.isArray(res.base44) ? res.base44 : null;
  const ipa =
    typeof res.ipa === 'string' && res.ipa.trim().length > 0
      ? res.ipa
      : null;

  const model = res.model;
  const raw_transcription =
    typeof res.raw_transcription === 'string'
      ? res.raw_transcription
      : phonemes || '';

  // 3) Syllable-level fields from backend (new)
  const primaryFromBackend =
    typeof res.primary === 'string' && res.primary.trim().length > 0
      ? res.primary
      : null;

  const tokensFromBackend = Array.isArray(res.tokens) ? res.tokens : null;
  const cleanTokensFromBackend = Array.isArray(res.clean_tokens)
    ? res.clean_tokens
    : null;

  const tokens =
    tokensFromBackend ||
    cleanTokensFromBackend ||
    (phoneme_list.length > 0 ? phoneme_list : null);

  const clean_tokens = cleanTokensFromBackend || null;

  const derivedPrimary =
    primaryFromBackend ||
    (cleanTokensFromBackend && cleanTokensFromBackend[0]) ||
    (phoneme_list && phoneme_list[0]) ||
    null;

  const raw_text =
    typeof res.raw_text === 'string' && res.raw_text.trim().length > 0
      ? res.raw_text
      : raw_transcription || phonemes || '';

  // 4) Dominant units (for frontend letter / word practice)
  const dominantIPA =
    (ipa_units && ipa_units.length > 0 && ipa_units[0]) ||
    (phoneme_list && phoneme_list.length > 0 && phoneme_list[0]) ||
    null;

  const dominantBase44 =
    (base44 && base44.length > 0 && base44[0]) || null;

  const dominantSyllable = derivedPrimary;

  // 5) Legacy fields for existing UI
  const producedText = raw_transcription || phonemes || '';

  return {
    backend: 'wav2vec2',
    backendUrl,
    // language info
    lang: res.lang || effectiveLang,
    requestedLang,
    effectiveLang,

    // Core phoneme payload
    phonemes, // human-readable (may be graphemes or phonetic chunks)
    phoneme_list, // array version
    ipa_units, // IPA units if backend provides them
    base44, // Base44 units if backend provides them
    ipa,
    raw_transcription,

    // NEW: syllable/letter-level fields
    primary: derivedPrimary,
    tokens: tokens || [],
    clean_tokens: clean_tokens || [],
    raw_text,
    syllable: {
      primary: derivedPrimary,
      tokens: tokens || [],
      clean_tokens: clean_tokens || [],
      raw_text,
    },

    // New "v2" shape for unified frontend use
    dominant: {
      ipa: dominantIPA,
      base44: dominantBase44,
      syllable: dominantSyllable,
    },

    // Convenience fields for existing UI
    produced: {
      text: producedText,
      phonemes: phonemes,
    },
    alignment: phoneme_list.map((p) => ({
      phoneme: p,
      score: 1.0,
      status: 'detected',
    })),
    score: 1.0,
    model,
  };
}

// ----------------------------------------------------------
// Main handler
// ----------------------------------------------------------

Deno.serve(async (req) => {
  console.log('[getPhonemes] Request received');

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    console.log('[getPhonemes] User:', user && user.email);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
      console.log('[getPhonemes] Body:', JSON.stringify(body));
    } catch (parseError) {
      console.error('[getPhonemes] Failed to parse body:', parseError);
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const audioFileUrl = body.audioFileUrl;
    const requestedLang = body.lang || 'en';
    const targetText = body.targetText;

    if (!audioFileUrl) {
      return Response.json(
        { error: 'No audio file URL provided' },
        { status: 400 }
      );
    }

    // Resolve backend for this language
    const backendInfo = getPhonemeBackendUrlForLang(requestedLang);
    const phonemeBackendUrl = backendInfo.url;
    const effectiveLang = backendInfo.lang;

    if (!phonemeBackendUrl) {
      console.error('[getPhonemes] No phoneme backend configured');
      return Response.json(
        {
          error:
            'No phoneme backend configured. Please set PHONEME_BACKEND_URL_EN and/or PHONEME_BACKEND_URL_ES.',
          backend: 'none',
        },
        { status: 500 }
      );
    }

    console.log(
      '[getPhonemes] Using backend:',
      phonemeBackendUrl,
      'for lang:',
      effectiveLang
    );

    // ------------------------------------------------------
    // Download audio from Base44 storage
    // ------------------------------------------------------
    console.log('[getPhonemes] Fetching audio from:', audioFileUrl);
    const audioResponse = await fetch(audioFileUrl);
    if (!audioResponse.ok) {
      return Response.json(
        { error: `Failed to fetch audio: ${audioResponse.status}` },
        { status: 500 }
      );
    }

    const audioBlob = await audioResponse.blob();
    console.log('[getPhonemes] Audio blob size:', audioBlob.size);

    // Wrap bytes as "audio/wav" for backend (backend is robust to actual container)
    const audioBuffer = await audioBlob.arrayBuffer();
    const wavBlob = new Blob([audioBuffer], { type: 'audio/wav' });

    // Create form-data for backend POST /phonemes
    const formData = new FormData();
    formData.append('file', wavBlob, 'audio.wav');

    const phonemeUrl =
      `${phonemeBackendUrl.replace(/\/$/, '')}/phonemes?lang=${encodeURIComponent(
        effectiveLang
      )}`;
    console.log('[getPhonemes] Calling phoneme backend:', phonemeUrl);

    // ------------------------------------------------------
    // Retry logic for flaky upstream
    // ------------------------------------------------------
    let phonemeResponse = null;
    let lastError;
    const maxRetries = 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(3000 * Math.pow(2, attempt - 1), 15000);
          console.log(
            `[getPhonemes] Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`
          );
          await new Promise((r) => setTimeout(r, delay));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        phonemeResponse = await fetch(phonemeUrl, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (phonemeResponse.ok) {
          break;
        }

        const status = phonemeResponse.status;
        if (status === 502 || status === 503 || status === 504) {
          lastError = `HTTP ${status} (gateway error, will retry)`;
          console.warn(
            `[getPhonemes] Gateway error ${status} on attempt ${
              attempt + 1
            }, retrying...`
          );
          continue;
        }

        lastError = `HTTP ${status}`;
        console.error(
          `[getPhonemes] Phoneme backend returned ${status} on attempt ${
            attempt + 1
          }`
        );
      } catch (fetchError) {
        lastError =
          fetchError && fetchError.name === 'AbortError'
            ? 'Request timeout'
            : (fetchError && fetchError.message) || String(fetchError);
        console.error(
          `[getPhonemes] Failed to connect on attempt ${attempt + 1}:`,
          lastError
        );
      }
    }

    if (!phonemeResponse || !phonemeResponse.ok) {
      let errorText;
      if (phonemeResponse) {
        try {
          errorText = await phonemeResponse.text();
        } catch {
          errorText = lastError;
        }
      } else {
        errorText = lastError;
      }

      console.error(
        '[getPhonemes] Phoneme backend error after retries:',
        errorText
      );
      return Response.json(
        {
          error:
            'Service temporarily unavailable. Please wait a moment and try again.',
          details: errorText,
          backend: 'wav2vec2',
          backendUrl: phonemeBackendUrl,
        },
        { status: 502 }
      );
    }

    const phonemeResult = await phonemeResponse.json();
    console.log('[getPhonemes] Raw backend result:', phonemeResult);

    // Spanish-specific tweaks (Ñ), if applicable
    const withLangTweaks = normalizeSpanishResult(
      phonemeResult,
      effectiveLang,
      targetText
    );

    // Optionally fetch canonical "expected IPA" for the target text
    const expectedIpaData = await fetchExpectedIpa(
      phonemeBackendUrl,
      targetText,
      effectiveLang
    );

    // Normalize into ONE unified shape
    const normalized = normalizeBackendResult(
      withLangTweaks,
      requestedLang,
      effectiveLang,
      phonemeBackendUrl
    );

    // Attach expected IPA info (if available) so the frontend can use it
    if (expectedIpaData) {
      normalized.expected_ipa = expectedIpaData.ipa || null;
      normalized.expected_text = expectedIpaData.text || targetText || null;
      normalized.expected_lang = expectedIpaData.lang || effectiveLang;
    }

    console.log('[getPhonemes] Normalized result:', normalized);

    return Response.json(normalized);
  } catch (error) {
    console.error('[getPhonemes] Function error:', error);
    return Response.json(
      { error: (error && error.message) || String(error) },
      { status: 500 }
    );
  }
});