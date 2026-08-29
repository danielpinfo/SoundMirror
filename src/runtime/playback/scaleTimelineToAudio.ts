// Pure math utility: scales a pack-authored timeline to actual audio duration
import type { TimelineEntry } from '@/runtime/audio/audioTypes';

export function scaleTimelineToAudio(base: TimelineEntry[], audioDurationMs: number): TimelineEntry[] {
  if (!base?.length || audioDurationMs <= 0) return base || [];
  const last = base[base.length - 1];
  const baseDuration = Math.max(1, (last.endMs ?? 0));
  const k = audioDurationMs / baseDuration;
  const scaled = base.map(e => ({ ...e, startMs: Math.round(e.startMs * k), endMs: Math.round(e.endMs * k) }));
  // ensure last aligns exactly to audio duration without changing frame indices
  scaled[scaled.length - 1].endMs = audioDurationMs;
  return scaled;
}