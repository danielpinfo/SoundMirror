// Scale a pack-authored timeline to a target audio duration (ms)
// Assumes each entry has startMs and endMs; if missing, treats 0.
// Returns a new array with integer ms boundaries.
export function scaleTimelineToAudio(timeline = [], targetDurationMs = 0) {
  try { if (timeline?.length) { const last=timeline[timeline.length-1]; const base=(last?.endMs??last?.end??0); console.log('[TRACE scale fn] in', { targetDurationMs, base }); } } catch {}

  if (!Array.isArray(timeline) || timeline.length === 0) {
    return timeline || [];
  }
  if (!Number.isFinite(targetDurationMs) || targetDurationMs <= 0) {
    // Invalid target duration: do not scale. Caller should block playback until valid.
    return timeline;
  }

  const firstStart = Math.min(0, timeline[0]?.startMs ?? 0);
  const lastEnd = Math.max(0, timeline[timeline.length - 1]?.endMs ?? 0);
  const baseDuration = Math.max(1, lastEnd - firstStart);
  const scale = targetDurationMs / baseDuration;

  let carry = 0;
  return timeline.map((e, idx) => {
    const s = Math.round(((e.startMs ?? 0) - firstStart) * scale);
    const ed = Math.round(((e.endMs ?? 0) - firstStart) * scale);
    // Guarantee non-decreasing, correct small rounding drifts
    const startMs = Math.max(carry, s);
    const endMs = Math.max(startMs + 1, ed);
    carry = endMs;

    return {
      ...e,
      startMs,
      endMs,
    };
  });
}

export default scaleTimelineToAudio;