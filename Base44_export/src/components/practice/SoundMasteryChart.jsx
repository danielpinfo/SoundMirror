import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';

export default function SoundMasteryChart({ sessions = [] }) {
  // Aggregate scores by phoneme/letter
  const soundData = useMemo(() => {
    const soundScores = {};
    
    sessions.forEach(session => {
      const analysis = session.detailed_analysis;
      if (!analysis?.alignment) return;
      
      analysis.alignment.forEach(item => {
        const letter = item.letter?.toUpperCase();
        if (!letter) return;
        
        if (!soundScores[letter]) {
          soundScores[letter] = { attempts: 0, totalScore: 0, scores: [] };
        }
        
        const score = item.score ?? (item.status === 'match' ? 1 : 0);
        soundScores[letter].attempts += 1;
        soundScores[letter].totalScore += score;
        soundScores[letter].scores.push(score);
      });
    });
    
    // Convert to array and calculate averages
    return Object.entries(soundScores)
      .map(([letter, data]) => ({
        letter,
        avgScore: data.totalScore / data.attempts,
        attempts: data.attempts,
        trend: calculateTrend(data.scores)
      }))
      .sort((a, b) => a.avgScore - b.avgScore); // Sort by score (worst first)
  }, [sessions]);

  // Calculate recent trend
  function calculateTrend(scores) {
    if (scores.length < 3) return 'neutral';
    const recent = scores.slice(-3);
    const earlier = scores.slice(-6, -3);
    if (earlier.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    if (recentAvg > earlierAvg + 0.1) return 'improving';
    if (recentAvg < earlierAvg - 0.1) return 'declining';
    return 'neutral';
  }

  const getBarColor = (score) => {
    if (score >= 0.8) return '#22c55e'; // green
    if (score >= 0.5) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  if (soundData.length === 0) {
    return (
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Sound Mastery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">
            Practice more to see your sound mastery breakdown
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get sounds that need work (below 70%)
  const needsWork = soundData.filter(s => s.avgScore < 0.7);
  // Get mastered sounds (above 80%)
  const mastered = soundData.filter(s => s.avgScore >= 0.8);

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Sound Mastery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={soundData} layout="vertical" margin={{ left: 30, right: 20 }}>
              <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
              <YAxis type="category" dataKey="letter" width={40} />
              <Tooltip 
                formatter={(value) => [`${Math.round(value * 100)}%`, 'Score']}
                labelFormatter={(label) => `Sound: ${label}`}
              />
              <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
                {soundData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.avgScore)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Needs work */}
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Needs Practice</h4>
            {needsWork.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {needsWork.slice(0, 6).map(s => (
                  <span 
                    key={s.letter}
                    className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                  >
                    {s.letter} ({Math.round(s.avgScore * 100)}%)
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-600">All sounds above 70%! 🎉</p>
            )}
          </div>

          {/* Mastered */}
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Mastered</h4>
            {mastered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mastered.slice(0, 6).map(s => (
                  <span 
                    key={s.letter}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                  >
                    {s.letter} ✓
                  </span>
                ))}
                {mastered.length > 6 && (
                  <span className="text-sm text-green-600">+{mastered.length - 6} more</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-green-600">Keep practicing to master sounds!</p>
            )}
          </div>
        </div>

        {/* Improving sounds */}
        {soundData.some(s => s.trend === 'improving') && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Improving
            </h4>
            <div className="flex flex-wrap gap-2">
              {soundData.filter(s => s.trend === 'improving').map(s => (
                <span 
                  key={s.letter}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {s.letter} ↑
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}