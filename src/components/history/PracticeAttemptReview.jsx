import React, { useMemo, useEffect, useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

function normalizePercent(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  const numeric = Number(value);
  return numeric <= 1 ? numeric * 100 : numeric;
}

function getAverageScore(scores = [], fallbackScore = null) {
  if (!scores?.length) return normalizePercent(fallbackScore);
  const average = scores.reduce((sum, item) => sum + (item.finalScore ?? item), 0) / scores.length;
  return normalizePercent(average);
}

export default function PracticeAttemptReview({ session, currentPackId, onBack, onPracticeAgain }) {
  const [recordedMedia, setRecordedMedia] = useState(null);
  const score = useMemo(() => getAverageScore(session?.scores, session?.score), [session]);
  const timestampLabel = useMemo(() => session?.timestamp
    ? new Date(session.timestamp).toLocaleString()
    : '—', [session]);

  useEffect(() => {
    const blob = session?.videoBlob || session?.audioBlob;
    if (!blob) {
      setRecordedMedia(null);
      return;
    }
    const nextUrl = URL.createObjectURL(blob);
    setRecordedMedia({
      url: nextUrl,
      kind: session?.videoBlob ? 'video' : 'audio',
    });
    return () => URL.revokeObjectURL(nextUrl);
  }, [session]);

  if (!session) return null;

  const soundedLike = session.transcript || session.match || null;
  const analysisRows = Array.isArray(session.phonemeBreakdown) ? session.phonemeBreakdown : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={() => onPracticeAgain(session)} className="gap-2 bg-primary hover:bg-primary/90">
          <Play className="w-4 h-4" /> Practice Again
        </Button>
      </div>

      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.25)' }}>
        <div>
          <p className="text-sm text-white/70">Target</p>
          <h2 className="text-2xl font-bold text-white">{session.word || '—'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/70">Pack / Language</p>
            <p className="text-white">{session.packId || currentPackId || 'unknown'} · {session.language || 'unknown'}</p>
          </div>
          <div>
            <p className="text-white/70">Saved</p>
            <p className="text-white">{timestampLabel}</p>
          </div>
          <div>
            <p className="text-white/70">Score / Result</p>
            <p className="text-white">{score != null ? `${Math.round(score)}%` : 'Not saved in this older attempt'}</p>
          </div>
        </div>

        <div>
          <p className="text-white/70 text-sm">Source</p>
          <p className="text-white text-sm">{session.targetSource || 'unknown'}</p>
        </div>

        <div>
          <p className="text-white/70 text-sm">You sounded like</p>
          <p className="text-white">{soundedLike || 'Not saved in this older attempt'}</p>
        </div>

        <div>
          <p className="text-white/70 text-sm mb-2">Phoneme / Chunk Analysis</p>
          {analysisRows.length ? (
            <div className="space-y-2">
              {analysisRows.map((row, index) => (
                <div key={index} className="rounded-xl px-3 py-2 text-sm text-white" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <span className="font-semibold">{row.phoneme || row.chunk || `Item ${index + 1}`}</span>
                  {row.status ? <span className="ml-2 text-white/70">{row.status}</span> : null}
                  {row.note ? <div className="text-white/80 mt-1">{row.note}</div> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/80">Not saved in this older attempt.</p>
          )}
        </div>

        <div>
          <p className="text-white/70 text-sm mb-2">Tips / Feedback</p>
          {session.feedback?.length ? (
            <div className="space-y-2">
              {session.feedback.map((tip, index) => (
                <div key={index} className="rounded-xl px-3 py-2 text-sm text-white" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {tip}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/80">Not saved in this older attempt.</p>
          )}
        </div>

        <div>
          <p className="text-white/70 text-sm mb-2">Recorded media</p>
          {recordedMedia?.kind === 'video' ? (
            <video
              controls
              playsInline
              src={recordedMedia.url}
              className="w-full rounded-xl bg-black"
            />
          ) : recordedMedia?.kind === 'audio' ? (
            <audio controls src={recordedMedia.url} className="w-full" />
          ) : (
            <p className="text-white/80">Not saved in this older attempt.</p>
          )}
        </div>
      </div>
    </div>
  );
}
