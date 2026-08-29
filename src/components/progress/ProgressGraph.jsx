/**
 * ProgressGraph
 *
 * Line chart: overall session score vs date.
 * Uses recharts (already installed).
 */

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#1e3a52', border: '1px solid rgba(0,136,204,0.4)',
      borderRadius: 8, padding: '8px 14px', fontSize: 12,
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 2 }}>{d.date}</div>
      <div style={{ color: '#e2e8f0', fontWeight: 700 }}>{d.word}</div>
      <div style={{ color: '#0088cc', fontWeight: 700, fontSize: 14 }}>{d.score}%</div>
    </div>
  );
};

export default function ProgressGraph({ data }) {
  if (!data?.length) {
    return (
      <div style={{ textAlign: 'center', color: '#64748b', padding: '32px 0', fontSize: 14 }}>
        No session data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 11 }}
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
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={80} stroke="rgba(34,197,94,0.3)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#0088cc"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#0088cc', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#38bdf8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}