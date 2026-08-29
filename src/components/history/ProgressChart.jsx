import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ProgressChart({ sessions }) {
  if (!sessions.length) return (
    <div className="flex items-center justify-center h-40" style={{ color: '#555' }}>
      No score data yet — complete some practice sessions to see your progress.
    </div>
  );

  // Only sessions with a score, oldest → newest
  const scored = [...sessions]
    .filter(s => s.finalScore != null)
    .reverse()
    .map((s, i) => ({
      label: s.word?.slice(0, 8) || `#${i + 1}`,
      score: Math.round(s.finalScore),
      date: new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }));

  if (!scored.length) return (
    <div className="flex items-center justify-center h-40" style={{ color: '#555' }}>
      Complete a graded session to see your progress chart.
    </div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="rounded-lg px-3 py-2 text-sm" style={{ background: '#0d2447', border: '1px solid #00bcd4', color: '#fff' }}>
        <p className="font-semibold">{d.label}</p>
        <p>{d.date}</p>
        <p style={{ color: '#00bcd4' }}>Score: {d.score}%</p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={scored} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#888', fontSize: 11 }} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={75} stroke="#34d399" strokeDasharray="4 4" label={{ value: 'Pass', fill: '#34d399', fontSize: 11 }} />
        <Line type="monotone" dataKey="score" stroke="#00bcd4" strokeWidth={2} dot={{ fill: '#00bcd4', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}