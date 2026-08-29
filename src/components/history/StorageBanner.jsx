import React, { useEffect, useState } from 'react';
import { HardDrive, Loader2 } from 'lucide-react';
import { AutoArchiveService } from '@/lib/services/AutoArchiveService';

const CYAN = '#00bcd4';

export default function StorageBanner() {
  const [high, setHigh] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const check = async () => {
    const h = await AutoArchiveService.isStorageHigh();
    setHigh(h);
  };

  useEffect(() => { check(); }, []);

  if (!high) return null;

  const runArchive = async () => {
    setArchiving(true);
    await AutoArchiveService.checkAndArchiveIfNeeded();
    setArchiving(false);
    await check();
  };

  return (
    <div className="mb-4 p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.35)' }}>
      <div className="flex items-center gap-3">
        <HardDrive className="w-5 h-5" style={{ color: CYAN }} />
        <div>
          <div className="text-sm font-semibold" style={{ color: '#e6f7ff' }}>Storage almost full</div>
          <div className="text-xs" style={{ color: '#9db' }}>We’ll auto-archive older sessions to keep things running smoothly.</div>
        </div>
      </div>
      <button
        onClick={runArchive}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 flex items-center gap-2"
        style={{ background: CYAN, color: '#0a3d6b' }}
        disabled={archiving}
      >
        {archiving ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" /> Archiving...</>) : 'Archive now'}
      </button>
    </div>
  );
}