export function ensureTraceBuffer() {
  if (typeof window === 'undefined') return [];
  window.__SM_TRACE = window.__SM_TRACE || [];
  return window.__SM_TRACE;
}

export function clearTraceBuffer() {
  if (typeof window === 'undefined') return;
  window.__SM_TRACE = [];
}

export function pushTrace(label, payload) {
  if (typeof window === 'undefined') return;
  const trace = {
    ts: Date.now(),
    label,
    payload,
  };
  window.__SM_TRACE = window.__SM_TRACE || [];
  window.__SM_TRACE.push(trace);
}

export function getTraceBuffer() {
  if (typeof window === 'undefined') return [];
  return window.__SM_TRACE || [];
}