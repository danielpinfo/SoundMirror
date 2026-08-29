/**
 * PracticeLibraryPage
 *
 * Main library UI:
 *  • Session list with replay, export, delete
 *  • Dual-head articulation replay (correct vs user)
 *  • Language pack management (activate / remove / available packs)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Download, Play, Pause, ChevronLeft, Globe, Package, TrendingUp } from 'lucide-react';
import { SessionManager }       from './SessionManager';
import { SessionExporter }      from './SessionExporter';
import { PracticeReplayEngine } from './PracticeReplayEngine';
import { usePlugin }            from '../core/PluginContext';
import { unregisterPack, getInstalledPacks } from '../core/PluginLoader';
import SpriteAnimationEngine    from '../animation/SpriteAnimationEngine';
import { ProgressAnalyzer }     from '../progress/ProgressAnalyzer';
import ProgressGraph            from '../progress/ProgressGraph';
import PhonemeProgressGraph     from '../progress/PhonemeProgressGraph';

// ---------------------------------------------------------------------------
// Score badge helper
// ---------------------------------------------------------------------------
function ScoreBadge({ score }) {
  if (score == null) return <span style={{ color: '#6b7280', fontSize: 12 }}>—</span>;
  const pct = Math.round(score);
  const color = pct >= 80 ? '#22c55e' : pct >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <span style={{ color, fontWeight: 700, fontSize: 13 }}>{pct}%</span>
  );
}

// ---------------------------------------------------------------------------
// Session row
// ---------------------------------------------------------------------------
function SessionRow({ session, onReplay, onExport, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 10,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      marginBottom: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
          {session.word || '(untitled)'}
        </div>
        <div style={{ color: '#94a3b8', fontSize: 12 }}>
          {session.dateLabel} · {session.language}
        </div>
      </div>

      <ScoreBadge score={session.finalScore} />

      <button onClick={() => onReplay(session)} title="Replay" style={iconBtn('#0088cc')}>
        <Play size={14} />
      </button>
      <button onClick={() => onExport(session)} title="Export" style={iconBtn('#4a7aa4')}>
        <Download size={14} />
      </button>
      <button onClick={() => onDelete(session.id)} title="Delete" style={iconBtn('#ef4444')}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function iconBtn(color) {
  return {
    background: `${color}22`, border: `1px solid ${color}55`,
    borderRadius: 7, padding: '6px 8px', cursor: 'pointer',
    color, display: 'flex', alignItems: 'center',
  };
}

// ---------------------------------------------------------------------------
// Replay panel — dual animation heads
// ---------------------------------------------------------------------------
function ReplayPanel({ session, articulationMap, onClose }) {
  const [engine, setEngine]         = useState(null);
  const [correctFrame, setCorrect]  = useState(0);
  const [userFrame, setUser]        = useState(0);
  const [playing, setPlaying]       = useState(false);
  const [progress, setProgress]     = useState(0);
  const [duration, setDuration]     = useState(0);

  useEffect(() => {
    const eng = new PracticeReplayEngine(session, articulationMap);
    eng.onCorrectFrame = setCorrect;
    eng.onUserFrame    = setUser;
    eng.onProgress     = posMs => {
      setProgress(posMs);
      setDuration(d => d || eng.duration);
    };
    eng.onComplete = () => setPlaying(false);
    eng.load();
    setEngine(eng);
    return () => eng.dispose();
  }, [session, articulationMap]);

  const togglePlay = () => {
    if (!engine) return;
    if (playing) { engine.pause(); setPlaying(false); }
    else         { engine.play();  setPlaying(true); }
  };

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onClose} style={{ ...iconBtn('#94a3b8'), padding: '6px 10px' }}>
          <ChevronLeft size={16} />
        </button>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18 }}>
            Replay: <span style={{ color: '#0088cc' }}>{session.word || '(untitled)'}</span>
          </div>
          <div style={{ color: '#64748b', fontSize: 12 }}>{session.dateLabel}</div>
        </div>
      </div>

      {/* Dual heads */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
        <HeadPanel label="Correct" frame={correctFrame} />
        <HeadPanel label="You" frame={userFrame} accent="#f59e0b" />
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 6, marginBottom: 16 }}>
        <div style={{ width: `${pct}%`, background: '#0088cc', borderRadius: 4, height: '100%', transition: 'width 0.1s' }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button onClick={togglePlay} style={{
          ...iconBtn(playing ? '#f59e0b' : '#22c55e'),
          padding: '10px 24px', fontSize: 14, fontWeight: 600,
          borderRadius: 10,
        }}>
          {playing ? <><Pause size={16} style={{ marginRight: 6 }} />Pause</> : <><Play size={16} style={{ marginRight: 6 }} />Play</>}
        </button>
      </div>

      {/* Feedback */}
      {session.feedback?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Coaching</div>
          {session.feedback.map((tip, i) => (
            <div key={i} style={{
              padding: '8px 14px', borderRadius: 8, marginBottom: 6,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              color: '#fbbf24', fontSize: 13,
            }}>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HeadPanel({ label, frame, accent = '#0088cc' }) {
  return (
    <div style={{ textAlign: 'center', flex: 1, maxWidth: 200 }}>
      <div style={{ color: accent, fontWeight: 700, fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: `2px solid ${accent}55`,
        background: '#1a3a52',
      }}>
        <SpriteAnimationEngine mirrorFrame={frame} spriteType="front" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Language Pack panel
// ---------------------------------------------------------------------------
function LangPackPanel({ activatePackId, currentPackId }) {
  const [packs, setPacks]   = useState(getInstalledPacks());
  const [error, setError]   = useState(null);

  const handleRemove = (packId) => {
    setError(null);
    try {
      unregisterPack(packId);
      setPacks(getInstalledPacks());
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Globe size={18} style={{ color: '#0088cc' }} />
        <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16 }}>Language Packs</span>
      </div>

      {error && (
        <div style={{ padding: 10, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 12, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {packs.length === 0 && (
        <div style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: 24 }}>No packs installed.</div>
      )}

      {packs.map(packId => {
        const isActive = packId === currentPackId;
        return (
          <div key={packId} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 10, marginBottom: 8,
            background: isActive ? 'rgba(0,136,204,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isActive ? 'rgba(0,136,204,0.4)' : 'rgba(255,255,255,0.1)'}`,
          }}>
            <Package size={16} style={{ color: isActive ? '#0088cc' : '#64748b' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{packId.replace('_', ' ')}</div>
              {isActive && <div style={{ color: '#0088cc', fontSize: 11 }}>Active</div>}
            </div>

            {!isActive && (
              <button onClick={() => activatePackId(packId)} style={{ ...iconBtn('#22c55e'), fontSize: 12, padding: '5px 12px' }}>
                Activate
              </button>
            )}
            {!isActive && (
              <button onClick={() => handleRemove(packId)} style={iconBtn('#ef4444')} title="Remove">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b', fontSize: 12 }}>
        {packs.length}/3 slots used. Unregister a pack to free a slot.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
function ProgressPanel({ phonemeSystem }) {
  const phonemeList = phonemeSystem?.phonemes ?? [];
  const overall     = ProgressAnalyzer.getOverallProgress();
  const phonemes    = ProgressAnalyzer.getPhonemeProgress(phonemeList);
  const consistency = ProgressAnalyzer.getConsistencyMetrics();

  const trendColor = consistency.trend === 'improving' ? '#22c55e'
                   : consistency.trend === 'declining'  ? '#ef4444' : '#94a3b8';

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Avg Score',    value: `${consistency.mean}%`, color: '#0088cc' },
          { label: 'Consistency',  value: `±${consistency.stdDev}%`, color: '#a78bfa' },
          { label: 'Trend',        value: consistency.trend, color: trendColor },
          { label: 'Sessions',     value: overall.length, color: '#94a3b8' },
        ].map(card => (
          <div key={card.label} style={{
            flex: 1, minWidth: 110, padding: '14px 18px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            textAlign: 'center',
          }}>
            <div style={{ color: card.color, fontWeight: 800, fontSize: 22 }}>{card.value}</div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress line chart */}
      <SectionHeader icon={<TrendingUp size={15} />} title="Score Over Time" />
      <div style={{ marginBottom: 28 }}>
        <ProgressGraph data={overall} />
      </div>

      {/* Phoneme accuracy bar chart */}
      <SectionHeader icon={null} title="Phoneme Accuracy" subtitle="Weakest first" />
      <div>
        <PhonemeProgressGraph data={phonemes} />
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      {icon && <span style={{ color: '#0088cc' }}>{icon}</span>}
      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>{title}</span>
      {subtitle && <span style={{ color: '#64748b', fontSize: 12 }}>— {subtitle}</span>}
    </div>
  );
}

export default function PracticeLibraryPage() {
  const plugin = usePlugin();
  const [sessions, setSessions]   = useState([]);
  const [activeTab, setActiveTab] = useState('sessions');
  const [replaySession, setReplay] = useState(null);
  const [exporting, setExporting] = useState(null);

  const refresh = useCallback(() => setSessions(SessionManager.listSessions()), []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleReplay = (meta) => {
    const full = SessionManager.loadSession(meta.id);
    if (full) setReplay(full);
  };

  const handleExport = async (meta) => {
    setExporting(meta.id);
    const full = SessionManager.loadSession(meta.id);
    if (full) await SessionExporter.exportSession(full);
    setExporting(null);
  };

  const handleDelete = (id) => {
    SessionManager.deleteSession(id);
    refresh();
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a1628',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 20 }}>Practice Library</div>
        <div style={{ flex: 1 }} />

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 4 }}>
          {[['sessions', 'Sessions'], ['progress', 'Progress'], ['packs', 'Language Packs']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
              background: activeTab === key ? '#0088cc' : 'transparent',
              color: activeTab === key ? '#fff' : '#94a3b8',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {replaySession ? (
        <ReplayPanel
          session={replaySession}
          articulationMap={plugin.articulationMap}
          onClose={() => { setReplay(null); refresh(); }}
        />
      ) : activeTab === 'progress' ? (
        <ProgressPanel phonemeSystem={plugin.phonemeSystem} />
      ) : activeTab === 'sessions' ? (
        <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 0', fontSize: 15 }}>
              No practice sessions yet.<br />
              <span style={{ fontSize: 13 }}>Complete a practice session to see it here.</span>
            </div>
          ) : (
            sessions.map(s => (
              <SessionRow
                key={s.id}
                session={s}
                onReplay={handleReplay}
                onExport={(meta) => handleExport(meta)}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      ) : (
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <LangPackPanel
            currentPackId={plugin.activePackId}
            activatePackId={plugin.activatePack}
          />
        </div>
      )}
    </div>
  );
}
