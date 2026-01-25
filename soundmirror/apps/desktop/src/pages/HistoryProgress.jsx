/**
 * HistoryProgress Page - Combined practice history and progress tracking
 * Merged from History + Progress pages per user request
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Clock, Target, Award, Calendar, Trash2 } from 'lucide-react';

// Mock data - will be replaced with SQLite storage
const MOCK_HISTORY = [
  { id: 1, word: 'hello', score: 0.92, date: '2026-01-25T14:30:00', lang: 'en' },
  { id: 2, word: 'beautiful', score: 0.78, date: '2026-01-25T14:25:00', lang: 'en' },
  { id: 3, word: 'pronunciation', score: 0.65, date: '2026-01-25T14:20:00', lang: 'en' },
  { id: 4, word: 'water', score: 0.88, date: '2026-01-24T16:00:00', lang: 'en' },
  { id: 5, word: 'opportunity', score: 0.72, date: '2026-01-24T15:45:00', lang: 'en' },
];

export default function HistoryProgress() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalPractices: 0,
    averageScore: 0,
    streak: 0,
    bestWord: null,
  });

  useEffect(() => {
    // Load from localStorage (will be SQLite in Tauri)
    const stored = localStorage.getItem('soundmirror_history');
    const historyData = stored ? JSON.parse(stored) : MOCK_HISTORY;
    setHistory(historyData);

    // Calculate stats
    if (historyData.length > 0) {
      const avgScore = historyData.reduce((sum, h) => sum + h.score, 0) / historyData.length;
      const best = historyData.reduce((best, h) => h.score > best.score ? h : best, historyData[0]);
      
      setStats({
        totalPractices: historyData.length,
        averageScore: avgScore,
        streak: 3, // Mock streak
        bestWord: best,
      });
    }
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 0.85) return 'text-emerald-400';
    if (score >= 0.70) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 0.85) return 'bg-emerald-500/20 border-emerald-500/50';
    if (score >= 0.70) return 'bg-amber-500/20 border-amber-500/50';
    return 'bg-rose-500/20 border-rose-500/50';
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all practice history?')) {
      localStorage.removeItem('soundmirror_history');
      setHistory([]);
      setStats({ totalPractices: 0, averageScore: 0, streak: 0, bestWord: null });
    }
  };

  const handlePracticeAgain = (word, lang) => {
    navigate(`/practice?word=${encodeURIComponent(word)}&lang=${lang}`);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-100">Your Progress</h1>
            <p className="text-slate-500">Practice history and improvement tracking</p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 text-sm text-rose-400 
                        hover:bg-rose-500/10 rounded-lg transition-colors"
              data-testid="clear-history-btn"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-sky-400" />
              </div>
              <span className="text-sm text-slate-500">Total Practices</span>
            </div>
            <div className="text-3xl font-bold text-slate-100">{stats.totalPractices}</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-500">Average Score</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {Math.round(stats.averageScore * 100)}%
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-slate-500">Day Streak</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">{stats.streak} 🔥</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-slate-500">Best Word</span>
            </div>
            <div className="text-xl font-bold text-purple-400 truncate">
              {stats.bestWord?.word || '—'}
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent Practice Sessions
          </h3>

          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <h4 className="text-xl font-semibold text-slate-300 mb-2">No practice yet</h4>
              <p className="text-slate-500 mb-6">Start practicing to see your progress here</p>
              <button
                onClick={() => navigate('/')}
                className="btn-glow"
              >
                Start Practicing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 
                            border border-slate-700/50 hover:border-slate-600 transition-colors"
                >
                  {/* Score Badge */}
                  <div className={`
                    w-16 h-16 rounded-xl flex flex-col items-center justify-center
                    border ${getScoreBg(item.score)}
                  `}>
                    <span className={`text-xl font-bold ${getScoreColor(item.score)}`}>
                      {Math.round(item.score * 100)}
                    </span>
                    <span className="text-[10px] text-slate-500">%</span>
                  </div>

                  {/* Word Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold text-slate-200 truncate">
                      {item.word}
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatDate(item.date)}
                    </div>
                  </div>

                  {/* Practice Again */}
                  <button
                    onClick={() => handlePracticeAgain(item.word, item.lang)}
                    className="px-4 py-2 rounded-lg text-sm font-medium
                              bg-sky-500/10 text-sky-400 border border-sky-500/30
                              hover:bg-sky-500/20 transition-colors"
                    data-testid={`practice-again-${item.id}`}
                  >
                    Practice Again
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
