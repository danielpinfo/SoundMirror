import React from 'react';
import { Mic, Trash2, Play } from 'lucide-react';

const CYAN = '#00bcd4';
const COBALT = '#0a3d6b';

function ScoreBadge({ score }) {
  if (score == null) return <span style={{ color: '#666' }}>—</span>;
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#f59e0b' : '#f87171';
  return (
    <span className="font-bold text-lg" style={{ color }}>{Math.round(score)}%</span>
  );
}

export default function SessionRow({ session, onDelete, onPlay }) {
  const date = new Date(session.timestamp).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const time = new Date(session.timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div
      className="flex items-center gap-4 px-4 py-4 rounded-xl"
      style={{ background: 'rgba(0,188,212,0.08)', border: '2px solid #f5c518' }}
    >
      <Mic className="w-6 h-6 flex-shrink-0" style={{ color: CYAN }} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-lg truncate" style={{ color: '#fff' }}>{session.word || '—'}</p>
        <p className="text-sm mt-0.5" style={{ color: '#aaa' }}>{date} · {time} · {session.language}</p>
        <p className="text-xs mt-1" style={{ color: '#7dd3fc' }}>{session.packId || 'unknown pack'}{session.targetSource ? ` · ${session.targetSource}` : ''}</p>
      </div>
      <ScoreBadge score={session.finalScore} />
      {onPlay && (
        <button
          onClick={() => onPlay(session)}
          className="px-3 py-1.5 rounded-lg hover:brightness-125 transition-all flex items-center gap-2 text-sm font-semibold"
          style={{ background: 'rgba(0,188,212,0.12)', color: CYAN, border: '1px solid rgba(0,188,212,0.35)' }}
        >
          <Play className="w-4 h-4" /> Review
        </button>
      )}
      <button onClick={() => onDelete(session.id)} className="p-1.5 rounded-lg hover:brightness-125 transition-all" style={{ color: '#f87171' }}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}