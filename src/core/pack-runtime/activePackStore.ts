import { useState, useEffect } from 'react';
import { loadPack } from './PackRegistry';

export function useActivePack(packId: string | null) {
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!packId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!packId) { setPack(null); setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const m = await loadPack(packId);
        if (!cancelled) setPack(m);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load pack');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [packId]);

  return { pack, loading, error };
}