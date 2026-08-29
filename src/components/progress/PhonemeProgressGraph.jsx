/**
 * PhonemeProgressGraph
 *
 * Bar chart: average articulation score per phoneme.
 * Phoneme list comes from PluginContext.phonemeSystem (language-agnostic).
 * Bars are coloured green/amber/red based on score thresholds.
 */

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

function barColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 55) return '#f59e0b';
  return '#ef4444';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#1e3a52', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 8, padding: '8px 14px', fontSize: 12,
    }}>
      <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16 }}>/{d.phoneme}/</div>
      <div style={{ color: barColor(d.score), fontWeight: 700 }}>{d.score}%</div>
      <div style={{ color: '#64748b' }}>{d.count} attempt{d.count !== 1 ? 's' : ''}</div>
    </div>
  );
};

export default function PhonemeProgressGraph({ data }) {
  if (!data?.length) {
    return (
      <div style={{ textAlign: 'center', color: '#64748b', padding: '32px 0', fontSize: 14 }}>
        Practice more sessions to see phoneme breakdown.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="phoneme"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {data.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}