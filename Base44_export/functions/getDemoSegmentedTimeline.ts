// Base44 backend function (Deno) — FULL FILE REPLACEMENT (copy/paste all)
// Generates segmented viseme timelines (<= 900ms per chunk) with "play_then_hold" math.
// Accepts GET or POST.
//   GET  /...?lang=es&tokens=ah%20ba%20ca  (spaces ok)  OR tokens=ah,ba,ca
//   POST JSON: { "lang":"es", "tokens":"ah ba ca" }  OR { "lang":"es", "tokens":["ah","ba","ca"] }

const BUILD_ID = "BSVT_FILE_2026_01_06_D"; // bump this to prove deploy is live

const BASE_URL = "https://soundmirror-phoneme-audio.s3.us-east-1.amazonaws.com";
const LANGPACK_URL = (lang) => `${BASE_URL}/langpacks/base44.langpack.${lang}.v1.json`;

// Defaults (match your current pipeline assumptions)
const DEFAULTS = {
  fps: 30,
  frames_per_viseme_asset: 10,
  total_ms_per_chunk: 900, // hard cap per chunk
  max_segments_per_chunk: 4, // your new rule: 4 segments per chunk
  playback_mode: "play_then_hold",
};

// Tiny in-memory cache so repeated calls don’t refetch langpack constantly
const _cache = new Map(); // key -> { ts, data }
const CACHE_TTL_MS = 60_000;

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2) + "\n", {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  });
}

function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  const xi = Math.floor(x);
  if (xi < min) return min;
  if (xi > max) return max;
  return xi;
}

function clampNumber(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

function parseTokens(input) {
  // Supports:
  // - "ah ba ca" (spaces)
  // - "ah, ba, ca" (commas)
  // - "ah,ba;ca\n da" (mixed separators)
  // - ["ah","ba","ca"] (array)
  if (Array.isArray(input)) {
    return input.map(String).map((s) => s.trim()).filter(Boolean);
  }
  const s = String(input ?? "").trim();
  if (!s) return [];
  // Split on commas/semicolons/whitespace/newlines
  return s
    .split(/[,\s;]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

function mergeConsecutive(items) {
  const out = [];
  for (const it of items) {
    const prev = out[out.length - 1];
    if (!prev || prev !== it) out.push(it);
  }
  return out;
}

/**
 * Safer chunking:
 * - chunkSize is forced to int >= 1
 * - avoids trailing 1-item chunk when possible (e.g., [4,1] -> [3,2])
 * - never creates undefined items or empty chunks
 */
function chunkArrayAvoidTrailingOne(arr, chunkSizeRaw) {
  const chunkSize = clampInt(chunkSizeRaw, 1, 50, DEFAULTS.max_segments_per_chunk); // hard safety
  const chunks = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }

  // Avoid 1-segment final chunk only if we can borrow safely.
  // Condition: at least 2 chunks, last has 1 item, previous has at least 3 items
  // so [4,1] -> [3,2] (movie-like), but we won't do [2,1] -> [1,2] unless you want it.
  if (chunks.length >= 2 && chunks[chunks.length - 1].length === 1) {
    const prev = chunks[chunks.length - 2];
    const last = chunks[chunks.length - 1];

    if (prev.length >= 3) {
      // move one from prev to front of last
      const moved = prev.pop();
      // moved is guaranteed defined because prev.length >= 3 before pop
      last.unshift(moved);
    }
  }

  // Remove any empty chunks (shouldn't happen, but keep it bulletproof)
  return chunks.filter((c) => Array.isArray(c) && c.length > 0);
}

function buildChunkTimeline(visemeIds, opts) {
  const { fps, frames_per_viseme_asset, total_ms_per_chunk, playback_mode } = opts;

  const n = visemeIds.length;
  if (n === 0) return [];

  // Make durations sum EXACTLY to total_ms_per_chunk (no 901/899 drift)
  const base = Math.floor(total_ms_per_chunk / n);
  const remainder = total_ms_per_chunk - base * n; // distribute +1ms to first remainder segments

  let t = 0;
  const timeline = [];

  for (let i = 0; i < n; i++) {
    const dur = base + (i < remainder ? 1 : 0);

    // frames possible inside dur (integer math, avoids floating issues)
    const maxFramesByTime = Math.floor((dur * fps) / 1000);
    const play_frames = Math.max(0, Math.min(frames_per_viseme_asset, maxFramesByTime));

    // play_ms derived from frames at fps (floor)
    const play_ms = Math.floor((play_frames * 1000) / fps);
    const hold_ms = Math.max(0, dur - play_ms);

    const start_ms = t;
    const end_ms = t + dur;

    timeline.push({
      viseme_id: visemeIds[i],
      start_ms,
      end_ms,
      duration_ms: dur,
      play_frames,
      play_ms,
      hold_ms,
      fps,
      frames_per_viseme_asset,
      playback_mode,
    });

    t = end_ms;
  }

  return timeline;
}

async function fetchLangpack(lang) {
  const key = `langpack:${lang}`;
  const now = Date.now();
  const cached = _cache.get(key);
  if (cached && now - cached.ts < CACHE_TTL_MS) return cached.data;

  const url = LANGPACK_URL(lang);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch langpack (${lang}) HTTP ${res.status}`);
  }
  const data = await res.json();
  _cache.set(key, { ts: now, data });
  return data;
}

function makeTokenIndex(langpack) {
  const items = langpack?.mapping?.items ?? [];
  const idx = new Map();
  for (const it of items) {
    if (it?.token) idx.set(String(it.token), it);
  }
  return idx;
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return jsonResponse({ ok: true });

    const url = new URL(req.url);

    // Input
    let body = {};
    if (req.method === "POST") {
      const ct = req.headers.get("content-type") || "";
      if (ct.includes("application/json")) body = await req.json();
      else body = { tokens: await req.text() };
    }

    const lang = String(body.lang ?? url.searchParams.get("lang") ?? "es").trim() || "es";
    const tokensRaw = body.tokens ?? url.searchParams.get("tokens") ?? "";
    const tokens = parseTokens(tokensRaw);

    // Options (allow override, but keep safe defaults + clamps to prevent 0/NaN crashes)
    const opts = {
      fps: clampInt(body.fps ?? DEFAULTS.fps, 1, 240, DEFAULTS.fps),
      frames_per_viseme_asset: clampInt(
        body.frames_per_viseme_asset ?? DEFAULTS.frames_per_viseme_asset,
        1,
        60,
        DEFAULTS.frames_per_viseme_asset
      ),
      total_ms_per_chunk: clampInt(
        body.total_ms_per_chunk ?? DEFAULTS.total_ms_per_chunk,
        100,
        5000,
        DEFAULTS.total_ms_per_chunk
      ),
      max_segments_per_chunk: clampInt(
        body.max_segments_per_chunk ?? DEFAULTS.max_segments_per_chunk,
        1,
        20,
        DEFAULTS.max_segments_per_chunk
      ),
      playback_mode: String(body.playback_mode ?? DEFAULTS.playback_mode),
    };

    // Fetch mapping
    const langpack = await fetchLangpack(lang);
    const tokenIndex = makeTokenIndex(langpack);

    const missing_tokens = [];
    const visemeRaw = [];

    for (const tok of tokens) {
      const item = tokenIndex.get(tok);
      if (!item) {
        missing_tokens.push(tok);
        continue;
      }
      visemeRaw.push(String(item.viseme_id));
    }

    // Merge consecutive duplicates (movie-like)
    const visemeMerged = mergeConsecutive(visemeRaw);

    // Segment into chunks of <= max_segments_per_chunk, avoiding trailing 1 when possible
    const segmentChunks = chunkArrayAvoidTrailingOne(visemeMerged, opts.max_segments_per_chunk);

    // Build timelines (each chunk duration is exactly total_ms_per_chunk)
    const chunks = segmentChunks.map((chunkVisemes, i) => ({
      chunk_index: i,
      chunk_count: segmentChunks.length,
      segment_count: chunkVisemes.length,
      total_ms: opts.total_ms_per_chunk,
      timeline: buildChunkTimeline(chunkVisemes, opts),
    }));

    return jsonResponse({
      ok: true,
      schema: "soundmirror.viseme_timeline_segmented.v1",
      settings: {
        ...opts,
        build_id: BUILD_ID,
      },
      lang,
      tokens,
      viseme_sequence_raw: visemeRaw,
      viseme_sequence_merged: visemeMerged,
      chunks,
      missing_tokens,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err?.message ?? err) }, 500);
  }
});
