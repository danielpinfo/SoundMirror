import React, { useState } from 'react';
import { Download, Loader2, HardDrive } from 'lucide-react';
import { AutoArchiveService } from '@/lib/services/AutoArchiveService';

const CYAN = '#00bcd4';

export default function ArchivesList() {
  const [running, setRunning] = useState(false);
  const [hint, setHint] = useState('Choose where to save or share the ZIP. Only practice files are included.');

  const handleExport = async () => {
    setRunning(true);
    setHint('Preparing archive...');
    await AutoArchiveService.checkAndArchiveIfNeeded(true, { useShare: true, useSavePicker: true });
    setRunning(false);
    setHint('If no dialog opened, there may be nothing to export yet.');
  };

  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,188,212,0.06)', border: '1px solid rgba(0,188,212,0.25)' }}>
      <div className="flex items-start gap-3">
        <HardDrive className="w-5 h-5 mt-0.5" style={{ color: CYAN }} />
        <div>
          <div className="text-sm font-semibold" style={{ color: '#e6f7ff' }}>Export Practice Archives</div>
          <div className="text-xs mt-1" style={{ color: '#9db' }}>{hint}</div>
        </div>
      </div>
      <button
        onClick={handleExport}
        disabled={running}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 flex items-center gap-2"
        style={{ background: CYAN, color: '#0a3d6b' }}
      >
        {running ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" /> Archiving...</>) : (<><Download className="w-3.5 h-3.5" /> Export ZIP</>)}
      </button>
    </div>
  );
}