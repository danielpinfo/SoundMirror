import { PracticeArchive } from '../../components/analysis/PracticeArchive';

const ONE_GB = 1024 * 1024 * 1024;
const KEEP_NEWEST = 20;

function formatTS(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return { yyyy, MM, DD, HH, mm, ss };
}

function tzAbbrev() {
  try {
    const dtf = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' });
    const parts = dtf.formatToParts(new Date());
    const tz = parts.find(p => p.type === 'timeZoneName')?.value || 'UTC';
    return tz.replace(/\s+/g, '');
  } catch {
    return 'UTC';
  }
}

async function blobToU8(blob) {
  if (!blob) return null;
  const ab = await blob.arrayBuffer();
  return new Uint8Array(ab);
}

export const AutoArchiveService = {
  _running: false,
  _worker: null,

  async checkAndArchiveIfNeeded(force = false, options = {}) {
    if (this._running) return;
    this._running = true;

    try {
      const archive = new PracticeArchive();
      const sessionsLite = archive.listSessions(); // newest first

      // No local archive storage — consider all sessions (except the newest kept below)
      const notArchived = sessionsLite;

      // Keep newest N out of consideration
      const candidates = notArchived.slice(KEEP_NEWEST);
      if (candidates.length === 0) { this._running = false; return; }

      // Count rule ≥ 100
      const countEligible = candidates.length;

      // Size rule ≥ 1GB (estimate from Blobs & JSON lengths)
      let totalBytes = 0;
      for (const s of candidates) {
        const full = archive.loadSession(s.id);
        if (full?.audioBlob) totalBytes += full.audioBlob.size || 0;
        try {
          totalBytes += JSON.stringify(full?.phonemeTimeline || []).length;
          totalBytes += JSON.stringify(full?.scores || []).length;
          totalBytes += JSON.stringify(full?.feedback || []).length;
          totalBytes += JSON.stringify(full?.facialTimeline || []).length;
        } catch { /* noop */ }
      }

      const shouldArchive = force || (countEligible >= 100) || (totalBytes >= ONE_GB);
      if (!shouldArchive) { this._running = false; return; }

      // Build manifest + entries for worker
      const manifest = [];
      const entries = [];
      let minTs = Number.POSITIVE_INFINITY;
      let maxTs = 0;

      for (const s of candidates) {
        const full = archive.loadSession(s.id);
        if (!full) continue;
        minTs = Math.min(minTs, full.timestamp || Date.now());
        maxTs = Math.max(maxTs, full.timestamp || Date.now());
        manifest.push({ id: full.id, timestamp: full.timestamp, language: full.language, word: full.word });

        const basePath = `sessions/${full.id}/`;
        entries.push({ path: `${basePath}metadata.json`, data: new TextEncoder().encode(JSON.stringify({ id: full.id, timestamp: full.timestamp, language: full.language, word: full.word }, null, 2)) });
        entries.push({ path: `${basePath}phonemeTimeline.json`, data: new TextEncoder().encode(JSON.stringify(full.phonemeTimeline || [], null, 2)) });
        entries.push({ path: `${basePath}scores.json`, data: new TextEncoder().encode(JSON.stringify(full.scores || [], null, 2)) });
        entries.push({ path: `${basePath}feedback.json`, data: new TextEncoder().encode(JSON.stringify(full.feedback || [], null, 2)) });
        entries.push({ path: `${basePath}facialTimeline.json`, data: new TextEncoder().encode(JSON.stringify(full.facialTimeline || [], null, 2)) });
        const audioU8 = await blobToU8(full.audioBlob);
        if (audioU8) entries.push({ path: `${basePath}audio.webm`, data: audioU8 });
      }

      // Filename
      const now = new Date();
      const tz = tzAbbrev();
      const fNow = formatTS(now);
      const fMin = formatTS(minTs);
      const fMax = formatTS(maxTs);
      const filename = `sessions_${fNow.yyyy}${fNow.MM}${fNow.DD}_${fNow.HH}-${fNow.mm}-${fNow.ss}_${tz}__range_${fMin.yyyy}${fMin.MM}${fMin.DD}_to_${fMax.yyyy}${fMax.MM}${fMax.DD}__count_${candidates.length}.zip`;

      const worker = new Worker(new URL('../../workers/archiver.worker.js', import.meta.url), { type: 'module' });
      this._worker = worker;

      const zipBuffer = await new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          const msg = e.data;
          if (msg?.type === 'done') resolve(msg.buffer);
          else if (msg?.type === 'error') reject(new Error(msg.message));
        };
        worker.postMessage({ type: 'start', filename, entries, manifest });
      });
      worker.terminate();

      const blob = new Blob([zipBuffer], { type: 'application/zip' });
      const fileName = filename;
      let done = false;

      // Prefer Web Share on mobile (if supported)
      if (!done && options?.useShare && navigator?.canShare) {
        try {
          const file = new File([blob], fileName, { type: 'application/zip' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Practice Archives', text: 'Exported from SoundMirror' });
            done = true;
          }
        } catch (_) { /* ignore and fallback */ }
      }

      // Try the File System Access API save dialog
      if (!done && options?.useSavePicker && 'showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: 'ZIP Archive', accept: { 'application/zip': ['.zip'] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          done = true;
        } catch (_) { /* user canceled or unsupported */ }
      }

      // Fallback: auto-download via temporary link
      if (!done) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      // Done
    } catch (e) {
      console.warn('[AutoArchiveService] Failed to archive:', e);
    } finally {
      this._running = false;
    }
  },

  async isStorageHigh() {
    try {
      const est = await navigator.storage?.estimate?.();
      if (!est?.usage || !est?.quota) return false;
      return est.usage / est.quota >= 0.9;
    } catch { return false; }
  },

  init() {
    // Fire and forget on app load
    this.checkAndArchiveIfNeeded();
  }
};