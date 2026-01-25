import React, { useEffect, useMemo, useRef, useState } from "react";
import { getVisemeUrl } from "./visemeUrls"; // keep this path if this is your current one

function pad2(x) {
  const n = Math.max(0, Math.min(99, Number(x) || 0));
  return String(n).padStart(2, "0");
}

function uniq(arr) {
  const out = [];
  const seen = new Set();
  for (const v of arr) {
    const k = String(v);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(v);
    }
  }
  return out;
}

function buildCandidates(rawVisemeId) {
  const v0 = String(rawVisemeId || "").trim();
  if (!v0) return [];

  const lower = v0.toLowerCase();
  const upper = v0.toUpperCase();

  // strip common prefixes
  const stripVis = lower.startsWith("vis_") ? lower.slice(4) : lower;
  const stripViseme = lower.startsWith("viseme_") ? lower.slice(7) : lower;
  const base = stripViseme.startsWith("vis_") ? stripViseme.slice(4) : stripViseme;

  return uniq([
    v0,
    lower,
    upper,

    stripVis,
    stripVis.toUpperCase(),

    stripViseme,
    stripViseme.toUpperCase(),

    base,
    base.toUpperCase(),

    `vis_${base}`,
    `viseme_${base}`,
    `VIS_${base.toUpperCase()}`,
    `VISEME_${base.toUpperCase()}`,
  ]).filter(Boolean);
}

function tryGetUrl(visemeKey, frameStr) {
  const fNum = Number.parseInt(frameStr, 10);
  try {
    return getVisemeUrl(visemeKey, frameStr) || getVisemeUrl(visemeKey, fNum) || null;
  } catch {
    return null;
  }
}

function clampInt(n, lo, hi) {
  const x = Number.isFinite(Number(n)) ? Number(n) : lo;
  return Math.max(lo, Math.min(hi, Math.floor(x)));
}

export default function VisemeAnimator(props) {
  /**
   * Supported call styles:
   * 1) Controlled:
   *    <VisemeAnimator visemeId="vis_e" frame="04" />
   *
   * 2) Auto animated:
   *    <VisemeAnimator segment={seg} isPlaying={true} sweetSpot={6} />
   *
   * segment should include at least:
   *   { viseme_id, duration_ms, fps, chunk_index?, segment_index?, global_segment_index? }
   */

  const controlled = typeof props?.visemeId === "string" && props.visemeId.trim().length > 0;
  const segment = !controlled ? props?.segment : null;
  const isPlaying = !!props?.isPlaying;

  const rawViseme = controlled
    ? props.visemeId
    : (segment?.viseme_id ?? segment?.visemeId ?? "");

  // Sweet spot = last “motion” frame
  const sweetSpot = clampInt(props?.sweetSpot ?? props?.sweet_spot ?? 6, 0, 9);

  // Optional: close to 00 when playback stops
  const closeOnStop = !!props?.closeOnStop;

  // Determine “first segment of whole chain”
  const globalIdx =
    Number.isFinite(Number(segment?.global_segment_index))
      ? Number(segment?.global_segment_index)
      : Number.isFinite(Number(segment?.global_index))
        ? Number(segment?.global_index)
        : null;

  const isFirstSegment =
    controlled
      ? true
      : (globalIdx === 0) ||
        (Number(segment?.chunk_index) === 0 && Number(segment?.segment_index) === 0) ||
        !!props?.isFirstSegment;

  // FRAME RULE YOU REQUESTED:
  // - First segment: 00 x2, then 01..sweetSpot
  // - Other segments: 01..sweetSpot
  const startFrameFirst = 0;
  const startFrameOthers = 1;
  const endFrame = clampInt(sweetSpot, 0, 9);

  // Controlled mode frame
  const rawFrameControlled = pad2(props?.frame ?? "00");

  // Auto mode internal frame state
  const [frameAuto, setFrameAuto] = useState(isFirstSegment ? "00" : "01");

  const lastSegKeyRef = useRef("");
  const timerRef = useRef(null);

  function clearTimer() {
    if (timerRef.current) {
      try {
        clearInterval(timerRef.current);
      } catch {}
      timerRef.current = null;
    }
  }

  // Reset frame when the segment changes
  useEffect(() => {
    if (controlled) return;

    const key = [
      String(rawViseme || ""),
      String(segment?.chunk_index ?? ""),
      String(segment?.segment_index ?? ""),
      String(globalIdx ?? ""),
      String(segment?.start_ms ?? ""),
      String(segment?.end_ms ?? ""),
      String(segment?.duration_ms ?? ""),
    ].join("|");

    if (key !== lastSegKeyRef.current) {
      lastSegKeyRef.current = key;
      setFrameAuto(isFirstSegment ? "00" : "01");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, rawViseme, segment, isFirstSegment, globalIdx]);

  // Animate frames while playing (AUTO MODE ONLY)
  useEffect(() => {
    clearTimer();

    if (controlled) return () => clearTimer();
    if (!segment || !rawViseme) return () => clearTimer();

    // If not playing, optionally close to 00
    if (!isPlaying) {
      if (closeOnStop) setFrameAuto("00");
      return () => clearTimer();
    }

    // Build the exact frame sequence we want:
    // first segment: 00,00,01..endFrame
    // others:        01..endFrame
    const frames = [];
    if (isFirstSegment) frames.push(0, 0);

    const from = isFirstSegment ? startFrameOthers : startFrameOthers; // 01 either way for motion
    const to = Math.max(from, endFrame);
    for (let f = from; f <= to; f++) frames.push(f);

    if (!frames.length) {
      setFrameAuto(isFirstSegment ? "00" : "01");
      return () => clearTimer();
    }

    // Timing window: use play_ms if available, otherwise duration_ms
    const durationMs = Number(segment?.duration_ms || 0);
    const playMs = Number(segment?.play_ms || 0);
    const windowMs = Math.max(80, (playMs > 0 ? playMs : (durationMs > 0 ? durationMs : 300)));

    // Frame interval: spread across the window, but never too fast
    const fps = Math.max(1, Number(segment?.fps || 30));
    const minStepMs = Math.max(16, Math.floor(1000 / fps)); // ~33ms at 30fps
    const stepMs = Math.max(minStepMs, Math.floor(windowMs / frames.length));

    let idx = 0;
    setFrameAuto(pad2(frames[0]));

    timerRef.current = setInterval(() => {
      idx += 1;
      if (idx >= frames.length) {
        clearTimer();
        setFrameAuto(pad2(frames[frames.length - 1])); // hold on sweet spot
        return;
      }
      setFrameAuto(pad2(frames[idx]));
    }, stepMs);

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, segment, rawViseme, isPlaying, isFirstSegment, endFrame, sweetSpot, closeOnStop]);

  const frameStr = controlled ? rawFrameControlled : frameAuto;

  const { url, usedKey, candidates } = useMemo(() => {
    const cand = buildCandidates(rawViseme);
    for (const key of cand) {
      const u = tryGetUrl(key, frameStr);
      if (u) return { url: u, usedKey: key, candidates: cand };
    }
    return { url: null, usedKey: null, candidates: cand };
  }, [rawViseme, frameStr]);

  const mappingOk = !!url;

  const maxWidth = Number.isFinite(Number(props?.maxWidth)) ? Number(props.maxWidth) : 520;

  return (
    <div style={{ border: "1px solid #000", borderRadius: 10, padding: 12, background: "#1e3a8a" }}>
      <div style={{ fontFamily: "monospace", fontSize: 13, marginBottom: 10, color: "#fff" }}>
        <div><strong>mode:</strong> {controlled ? "controlled" : "segment(auto-frames)"}</div>
        <div>
          <strong>viseme:</strong> {String(rawViseme || "-")} &nbsp; <strong>frame:</strong> {frameStr}
        </div>
        <div><strong>mapping:</strong> {mappingOk ? "ok" : "missing"}</div>

        {!controlled && (
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            <div>
              <strong>rule:</strong>{" "}
              {isFirstSegment ? "00×2 then 01→" : "01→"}
              {pad2(sweetSpot)} then hold
            </div>
            <div><strong>isPlaying:</strong> {String(isPlaying)}</div>
          </div>
        )}

        {mappingOk ? (
          <div style={{ opacity: 0.8 }}><strong>key used:</strong> {String(usedKey)}</div>
        ) : (
          <div style={{ opacity: 0.8 }}>
            Mapping missing for this viseme/frame.
            {candidates?.length ? (
              <div style={{ marginTop: 6 }}>
                <strong>tried:</strong> {candidates.slice(0, 10).join(", ")}{candidates.length > 10 ? "…" : ""}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {url ? (
        <img
          src={url}
          alt={`${rawViseme} ${frameStr}`}
          style={{
            width: "100%",
            maxWidth,
            height: "auto",
            display: "block",
            borderRadius: 8,
            border: "1px solid #000",
          }}
        />
      ) : (
        <div style={{ padding: 18, background: "#f6f6f6", borderRadius: 8 }}>
          No image to display (mapping missing).
        </div>
      )}
    </div>
  );
}