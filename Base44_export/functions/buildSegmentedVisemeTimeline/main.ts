// Base44 backend function (Deno) — FULL FILE REPLACEMENT (copy/paste all)
// Purpose: Build segmented viseme timelines with a 900ms chunk cap and <=4 segments per chunk,
//          using "play_then_hold" math with deterministic "avoid trailing 1" chunk planning.
//
// Canonical input (preferred):
//   POST JSON: { "lang": "en", "tokens": ["ah","ba","ca","da","eh"] }
//
// Convenience inputs (also supported):
//   POST JSON: { "lang": "en", "tokens": "ah ba ca" }
//   POST JSON: { "lang": "en", "token_input": "ah, ba, ca" }
//   GET  /?lang=en&token_input=ah%20ba%20ca  (spaces ok) OR token_input=ah,ba,ca
//
// Output schema:
//   schema: soundmirror.viseme_timeline_segmented.v1
//   settings.playback_mode: segmented_chunks_900ms_v1

const S3_LANGPACK_BASE =
  "https://soundmirror-phoneme-audio.s3.us-east-1.amazonaws.com/langpacks/";

const SETTINGS = {
  fps: 30,
  frames_per_viseme_asset: 10,
  total_ms_per_chunk: 900,
  max_segments_per_chunk: 4,
  playback_mode: "segmented_chunks_900ms_v1",
  build_id: "BUILDID_TEST_2026_01_06_B", // bump to confirm deploy
};

function headers() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,HEAD,OPTIONS",
    "access-control-allow-headers": "content-type",
    "content-type": "application/json; charset=utf-8",
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2) + "\n", {
    status,
    headers: headers(),
  });
}

function normToken(t) {
  if (typeof t !== "string") return "";
  let s = t.trim();
  if (!s) return "";
  try {
    s = s.normalize("NFC");
  } catch {}
  // trim common wrapper punctuation (quotes/brackets/parens)
  s = s.replace(/^[\s"'`[\]{}()]+/g, "");
  s = s.replace(/[\s"'`[\]{}()]+$/g, "");
  if (!s) return "";
  // drop pure punctuation tokens
  if (/^[^A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF]+$/u.test(s)) return "";
  return s;
}

function parseTokensString(s) {
  const str = String(s || "").trim();
  if (!str) return [];
  // if commas present, split on commas; else split on whitespace
  const parts = str.includes(",") ? str.split(",") : str.split(/\s+/);
  return parts.map((p) => normToken(p)).filter(Boolean);
}

function mergeConsecutive(arr) {
  const out = [];
  for (const v of arr) {
    if (!out.length || out[out.length - 1] !== v) out.push(v);
  }
  return out;
}

function distributeMs(totalMs, n) {
  // Safe guard: never divide by 0
  if (!Number.isFinite(totalMs) || totalMs < 0) totalMs = 0;
  if (!Number.isFinite(n) || n <= 0) return [];
  const base = Math.floor(totalMs / n);
  const rem = totalMs - base * n;
  const out = [];
  for (let i = 0; i < n; i++) out.push(base + (i < rem ? 1 : 0));
  return out;
}

// ✅ Deterministic "avoid trailing 1" planner.
// Example (max=4): 5 -> [3,2], 9 -> [4,3,2], 13 -> [4,4,3,2]
function planChunkSizes(total, max) {
  const t = Math.max(0, Math.floor(Number(total) || 0));
  const m = Math.max(1, Math.floor(Number(max) || 1));

  if (t === 0) return [];
  if (t <= m) return [t];

  const full = Math.floor(t / m);
  const rem = t % m;

  if (rem === 0) return Array.from({ length: full }, () => m);

  if (rem === 1 && full >= 1) {
    // Replace one m-sized chunk with (m-1) and add a final 2.
    // This avoids a trailing 1-sized chunk.
    const out = [];
    for (let i = 0; i < full - 1; i++) out.push(m);
    out.push(m - 1);
    out.push(2);
    return out;
  }

  const out = Array.from({ length: full }, () => m);
  out.push(rem);
  return out;
}

function buildChunks(mergedVisemes) {
  const seq = Array.isArray(mergedVisemes) ? mergedVisemes : [];
  const sizes = planChunkSizes(seq.length, SETTINGS.max_segments_per_chunk);

  const chunks = [];
  let offset = 0;
  let chunk_index = 0;

  const frameMs = 1000 / SETTINGS.fps;

  for (const segCount of sizes) {
    const n = Math.max(0, Math.floor(segCount));
    if (n <= 0) continue;

    const segs = seq.slice(offset, offset + n);
    offset += n;

    // Defensive: if slice returns fewer than expected, stop cleanly
    if (segs.length === 0) break;

    const durations = distributeMs(SETTINGS.total_ms_per_chunk, segs.length);

    let cursor = 0;
    const timeline = segs.map((viseme_id, segment_index) => {
      const duration_ms = durations[segment_index] ?? 0;

      const framesByDuration = Math.floor((duration_ms * SETTINGS.fps) / 1000);
      const play_frames = Math.max(
        0,
        Math.min(SETTINGS.frames_per_viseme_asset, framesByDuration),
      );

      // Use floor to avoid drifting past duration_ms
      const play_ms = Math.floor(play_frames * frameMs);
      const hold_ms = Math.max(0, duration_ms - play_ms);

      const start_ms = cursor;
      const end_ms = cursor + duration_ms;
      cursor = end_ms;

      return {
        segment_index,
        segment_count: segs.length,
        viseme_id,
        duration_ms,
        start_ms,
        end_ms,
        play_frames,
        play_ms,
        hold_ms,
        fps: SETTINGS.fps,
        frames_per_viseme_asset: SETTINGS.frames_per_viseme_asset,
      };
    });

    chunks.push({
      chunk_index: chunk_index++,
      chunk_count: sizes.length,
      total_ms: SETTINGS.total_ms_per_chunk,
      segment_count: segs.length,
      timeline,
    });
  }

  return chunks;
}

function extractPayload(body, url) {
  // Supports:
  // - { lang, tokens, token_input }
  // - { data: { ... } } (some Base44 wrappers)
  const raw =
    body && typeof body === "object" && body.data && typeof body.data === "object"
      ? body.data
      : (body ?? {});
  const lang = String(raw.lang ?? url.searchParams.get("lang") ?? "en")
    .trim()
    .toLowerCase();

  // tokens can be array OR string (canonical + convenience)
  let tokens = [];
  if (Array.isArray(raw.tokens)) {
    tokens = raw.tokens.map((x) => normToken(String(x))).filter(Boolean);
  } else if (typeof raw.tokens === "string") {
    tokens = parseTokensString(raw.tokens);
  } else {
    tokens = parseTokensString(
      raw.token_input ?? url.searchParams.get("token_input") ?? "",
    );
  }

  return { lang, tokens };
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS" || req.method === "HEAD") {
      return new Response(null, { status: 204, headers: headers() });
    }

    const url = new URL(req.url);

    let body = null;
    if (req.method === "POST") {
      const ct = req.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        try {
          body = await req.json();
        } catch {
          body = null;
        }
      } else {
        // Allow raw text as token_input
        const text = await req.text();
        body = { token_input: text };
      }
    } else if (req.method !== "GET") {
      return json(
        {
          ok: false,
          error: "METHOD_NOT_ALLOWED",
          allowed: ["GET", "POST", "OPTIONS", "HEAD"],
          settings: SETTINGS,
        },
        405,
      );
    }

    const { lang, tokens } = extractPayload(body, url);

    if (!tokens.length) {
      return json({
        ok: true,
        message:
          "Provide POST { lang, tokens: [] } (canonical) or token_input string (convenience).",
        settings: SETTINGS,
        example_post: { lang: "en", tokens: ["ah", "ba", "ca", "da", "eh"] },
      });
    }

    const langpack_url = `${S3_LANGPACK_BASE}base44.langpack.${lang}.v1.json`;
    const lpRes = await fetch(langpack_url);
    if (!lpRes.ok) {
      return json(
        {
          ok: false,
          error: "LANGPACK_FETCH_FAILED",
          lang,
          langpack_url,
          status: lpRes.status,
          settings: SETTINGS,
        },
        502,
      );
    }

    const langpack = await lpRes.json();
    const items = langpack?.mapping?.items;
    if (!Array.isArray(items)) {
      return json(
        {
          ok: false,
          error: "LANGPACK_MAPPING_NOT_FOUND",
          lang,
          langpack_url,
          settings: SETTINGS,
        },
        500,
      );
    }

    const map = new Map();
    for (const it of items) {
      const tok = normToken(String(it?.token ?? ""));
      if (tok) map.set(tok, it);
    }

    const missing_tokens = [];
    const viseme_sequence_raw = [];

    for (const rawTok of tokens) {
      const t = normToken(rawTok);
      if (!t) continue;

      let entry = map.get(t);

      // Try decoding percent-encoded token if needed
      if (!entry) {
        try {
          const decoded = normToken(decodeURIComponent(t));
          if (decoded && decoded !== t) entry = map.get(decoded);
        } catch {}
      }

      const vis = entry?.viseme_id;
      if (!entry || !(typeof vis === "string" || typeof vis === "number")) {
        missing_tokens.push(t);
        continue;
      }

      viseme_sequence_raw.push(String(vis));
    }

    const viseme_sequence_merged = mergeConsecutive(viseme_sequence_raw);
    const chunks = buildChunks(viseme_sequence_merged);

    return json({
      ok: true,
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
  } catch (err) {
    return json({ ok: false, error: String(err?.message ?? err), settings: SETTINGS }, 500);
  }
});