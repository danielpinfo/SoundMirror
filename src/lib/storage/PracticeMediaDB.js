const DB_NAME = 'SoundMirrorPracticeMedia';
const DB_VERSION = 1;
const STORE = 'session-media';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

function transactionComplete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export const PracticeMediaDB = {
  async saveVideo(id, blob) {
    if (!id || !(blob instanceof Blob) || blob.size === 0) return false;

    const db = await openDB();
    try {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).put({
        id,
        blob,
        mimeType: blob.type || 'video/webm',
        savedAt: Date.now(),
      });
      await transactionComplete(transaction);
      return true;
    } finally {
      db.close?.();
    }
  },

  async getVideo(id) {
    if (!id) return null;

    const db = await openDB();
    try {
      const transaction = db.transaction(STORE, 'readonly');
      const record = await requestResult(
        transaction.objectStore(STORE).get(id)
      );
      return record?.blob || null;
    } finally {
      db.close?.();
    }
  },

  async deleteVideo(id) {
    if (!id) return;

    const db = await openDB();
    try {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).delete(id);
      await transactionComplete(transaction);
    } finally {
      db.close?.();
    }
  },

  async clear() {
    const db = await openDB();
    try {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).clear();
      await transactionComplete(transaction);
    } finally {
      db.close?.();
    }
  },
};
