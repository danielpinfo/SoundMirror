// buildSegmentedVisemeTimeline — SoundMirror v1 (Base44 / Deno)
// Self-contained (NO imports).
// Uses langpack.mapping.items (matches your S3 JSON).
// Rules: 900ms chunks, max 4 segments/chunk, fps=30, 10-frame cap.

const S3_LANGPACK_BASE =
  "https://soundmirror-phoneme-audio.s3.us-east-1.amazonaws.com/langpacks/";

const SETTINGS = {
  fps: 30,
  frames_per_viseme_asset: 10,
  total_ms_per_chunk: 900,
  max_segments_per_chunk: 4,
  playback_mode: "segmented_chunks_900ms_v1",
};

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: {
      ...corsHeaders(),
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function normToken(t) {
  if (typeof t !== "string") return "";
  const s = t.trim();
  if (!s) return "";
  try {
    return s.normalize("NFC");
  } catch {
    return s;
  }
}

function parseTokens(x) {
  if (Array.isArray(x)) return x.map(normToken).filter(Boolean);

  if (typeof x === "string") {
    const s = x.trim();
    if (!s) return [];
    // Prefer comma-separated (your UI behavior), allow whitespace fallback.
    const parts = s.includes(",") ? s.split(",") : s.split(/\s+/);
    return parts.map(normToken).filter(Boolean);
  }

  return [];
}

function mergeConsecutive(arr) {
  const out = [];
  for (const v of arr) {
    if (!out.length || out[out.length - 1] !== v) out.push(v);
  }
  return out;
}

function distributeMs(totalMs, n) {
  const base = Math.floor(totalMs / n);
  const rem = totalMs - base * n;
  const out = [];
  for (let i = 0; i < n; i++) out.push(base + (i < rem ? 1 : 0));
  return out;
}

function findMappingArray(langpack) {
  // ✅ This matches your posted langpack JSON structure exactly:
  // langpack.mapping.items = [ { token, ..., viseme_id, ... }, ... ]
  if (Array.isArray(langpack?.mapping?.items)) return langpack.mapping.items;

  // Safe fallbacks (won’t hurt)
  if (Array.isArray(langpack?.mapping)) return langpack.mapping;
  if (Array.isArray(langpack?.items)) return langpack.items;

  return null;
}

function getToken(entry) {
  if (!entry || typeof entry !== "object") return "";
  if (typeof entry.token === "string") return normToken(entry.token);
  if (typeof entry.tok === "string") return normToken(entry.tok);
  return "";
}

function getVisemeId(entry) {
  if (!entry || typeof entry !== "object") return null;
  if (typeof entry.viseme_id === "string" || typeof entry.viseme_id === "number")
    return entry.viseme_id;
  if (typeof entry.visemeId === "string" || typeof entry.visemeId === "number")
    return entry.visemeId;
  return null;
}

function buildChunks(mergedVisemes) {
  const chunks = [];
  const totalMs = SETTINGS.total_ms_per_chunk;
  const maxSeg = SETTINGS.max_segments_per_chunk;
  const frameMs = 1000 / SETTINGS.fps;

  let chunkIndex = 0;

  for (let i = 0; i < mergedVisemes.length; i += maxSeg) {
    const segs = mergedVisemes.slice(i, i + maxSeg);
    const durations = distributeMs(totalMs, segs.length);

    let cursor = 0;
    const timeline = segs.map((viseme_id, segment_index) => {
      const duration_ms = durations[segment_index];

      // floor(duration_ms / frame_ms) without float drift:
      const framesByDuration = Math.floor((duration_ms * SETTINGS.fps) / 1000);
      const play_frames = Math.min(
        SETTINGS.frames_per_viseme_asset,
        framesByDuration
      );

      const play_ms = Math.round(play_frames * frameMs);
      const hold_ms = Math.max(0, duration_ms - play_ms);

      const start_ms = cursor;
      const end_ms = cursor + duration_ms;
      cursor = end_ms;

      return {
        segment_index,
        viseme_id,
        duration_ms,
        start_ms,
        end_ms,
        play_frames,
        play_ms,
        hold_ms,
      };
    });

    chunks.push({
      chunk_index: chunkIndex++,
      total_ms: totalMs,
      segment_count: segs.length,
      timeline,
    });
  }

  return chunks;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const url = new URL(request.url);

    let body = null;
    if (request.method === "POST") {
      try {
        body = await request.json();
      } catch {
        body = null;
      }
    }

    const lang = String(body?.lang ?? url.searchParams.get("lang") ?? "en")
      .trim()
      .toLowerCase();

    const tokenInput =
      body?.tokens ??
      body?.token_input ??
      body?.tokenInput ??
      url.searchParams.get("tokens") ??
      url.searchParams.get("token_input") ??
      "";

    const tokens = parseTokens(tokenInput);

    const langpack_url = `${S3_LANGPACK_BASE}base44.langpack.${lang}.v1.json`;

    const res = await fetch(langpack_url);
    if (!res.ok) {
      return json(
        { error: "LANGPACK_FETCH_FAILED", lang, langpack_url, status: res.status },
        502
      );
    }

    const langpack = await res.json();
    const mappingArray = findMappingArray(langpack);

    if (!mappingArray) {
      return json(
        {
          error: "LANGPACK_MAPPING_NOT_FOUND",
          lang,
          langpack_url,
          keys: langpack && typeof langpack === "object" ? Object.keys(langpack) : null,
        },
        500
      );
    }

    const tokenMap = new Map();
    for (const entry of mappingArray) {
      const k = getToken(entry);
      if (k) tokenMap.set(k, entry);
    }

    const missing_tokens = [];
    const viseme_sequence_raw = [];

    for (const raw of tokens) {
      const t = normToken(raw);
      if (!t) continue;

      // exact match
      let entry = tokenMap.get(t);

      // allow URL-encoded tokens (e.g. %C3%B1a)
      if (!entry) {
        try {
          const decoded = normToken(decodeURIComponent(t));
          if (decoded && decoded !== t) entry = tokenMap.get(decoded);
        } catch {
          // ignore
        }
      }

      if (!entry) {
        missing_tokens.push(t);
        continue;
      }

      const vis = getVisemeId(entry);
      if (vis === null || typeof vis === "undefined") {
        missing_tokens.push(t);
        continue;
      }

      viseme_sequence_raw.push(vis);
    }

    const viseme_sequence_merged = mergeConsecutive(viseme_sequence_raw);
    const chunks = buildChunks(viseme_sequence_merged);

    return json({
      schema: "soundmirror.viseme_timeline_segmented.v1",
      lang,
      tokens,
      langpack_url,
      viseme_sequence_raw,
      viseme_sequence_merged,
      settings: { ...SETTINGS },
      chunks,
      missing_tokens,
    });
  } catch (e) {
    return json(
      { error: "UNHANDLED_EXCEPTION", message: String(e?.message ?? e) },
      500
    );
  }
});
