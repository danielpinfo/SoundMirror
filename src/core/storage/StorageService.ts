// No direct window access in feature logic — wrap here
export const StorageService = {
  get(k: string) { try { return typeof window !== 'undefined' ? window.localStorage.getItem(k) : null; } catch { return null; } },
  set(k: string, v: string) { try { if (typeof window !== 'undefined') window.localStorage.setItem(k, v); } catch {} },
  remove(k: string) { try { if (typeof window !== 'undefined') window.localStorage.removeItem(k); } catch {} },
};