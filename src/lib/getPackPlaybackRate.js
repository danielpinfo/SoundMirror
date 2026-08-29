export function getPackPlaybackRate(pack) {
  const r = pack?.getPlaybackRate?.();
  const rate = (typeof r === 'number' && isFinite(r) && r > 0) ? r : null; // no 1.0 fallback during init
  const pid = pack?.packId ?? pack?.manifest?.id ?? 'unknown';
  // Log every call to trace early refresh behavior
  try { console.log('[RATE:getPackPlaybackRate]', { packId: pid, input: r, returned: rate, usedDefault: !(typeof r === 'number' && isFinite(r) && r > 0) }); } catch {}
  return rate;
}