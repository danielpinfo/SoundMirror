import { zipSync, strToU8 } from 'fflate';

self.onmessage = (e) => {
  try {
    const msg = e.data || {};
    if (msg.type !== 'start') return;

    const { entries = [], manifest = [] } = msg;

    const files = {};
    // Include a top-level manifest for convenience
    files['manifest.json'] = strToU8(JSON.stringify({ createdAt: Date.now(), count: entries.length, sessions: manifest }, null, 2));

    for (const ent of entries) {
      if (!ent?.path || !ent?.data) continue;
      // Ensure data is Uint8Array
      const data = ent.data instanceof Uint8Array ? ent.data : strToU8(String(ent.data));
      files[ent.path] = data;
    }

    const zipped = zipSync(files, { level: 6 });
    // Transfer the underlying buffer for efficiency
    self.postMessage({ type: 'done', buffer: zipped.buffer }, [zipped.buffer]);
  } catch (err) {
    self.postMessage({ type: 'error', message: err?.message || String(err) });
  }
};