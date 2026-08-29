const DB_NAME = 'SoundMirrorArchives';
const STORE = 'archives';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(tx, store, value) {
  return new Promise((resolve, reject) => {
    const r = tx.objectStore(store).put(value);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

function idbGetAll(tx, store) {
  return new Promise((resolve, reject) => {
    const r = tx.objectStore(store).getAll();
    r.onsuccess = () => resolve(r.result || []);
    r.onerror = () => reject(r.error);
  });
}

function idbGet(tx, store, key) {
  return new Promise((resolve, reject) => {
    const r = tx.objectStore(store).get(key);
    r.onsuccess = () => resolve(r.result || null);
    r.onerror = () => reject(r.error);
  });
}

function idbDelete(tx, store, key) {
  return new Promise((resolve, reject) => {
    const r = tx.objectStore(store).delete(key);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

export const ArchiveDB = {
  async saveArchive({ id, filename, createdAt, size, sessionCount, dateStart, dateEnd, manifest, blob }) {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    await idbPut(tx, STORE, { id, filename, createdAt, size, sessionCount, dateStart, dateEnd, manifest, blob });
    await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
    db.close?.();
  },

  async listArchives() {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readonly');
    const all = await idbGetAll(tx, STORE);
    db.close?.();
    return all
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .map(({ blob, ...meta }) => meta);
  },

  async getArchiveBlob(id) {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readonly');
    const rec = await idbGet(tx, STORE, id);
    db.close?.();
    return rec?.blob || null;
  },

  async deleteArchive(id) {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    await idbDelete(tx, STORE, id);
    await new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
    db.close?.();
  },

  async getAllArchivedSessionIds() {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readonly');
    const all = await idbGetAll(tx, STORE);
    db.close?.();
    const set = new Set();
    for (const rec of all) {
      const man = rec?.manifest || [];
      for (const m of man) if (m?.id) set.add(m.id);
    }
    return set;
  }
};