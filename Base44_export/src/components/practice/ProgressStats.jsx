import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, Flame, Calendar, Award, Target } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays, startOfDay } from 'date-fns';

export default function ProgressStats({ sessions = [] }) {
  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        uniqueWords: 0,
        currentStreak: 0,
        longestStreak: 0,
        todaySessions: 0,
        thisWeekSessions: 0,
        recentTrend: 'neutral'
      };
    }

    // Calculate basic stats
    const scores = sessions.map(s => s.score).filter(s => typeof s === 'number');
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const uniqueWords = new Set(sessions.map(s => s.word?.toLowerCase())).size;

    // Calculate streaks
    const sortedDates = sessions
      .map(s => startOfDay(new Date(s.created_date)))
      .sort((a, b) => b - a);
    
    const uniqueDates = [...new Set(sortedDates.map(d => d.getTime()))]
      .map(t => new Date(t))
      .sort((a, b) => b - a);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if practiced today or yesterday to start streak
    if (uniqueDates.length > 0) {
      const lastPractice = uniqueDates[0];
      if (differenceInDays(today, lastPractice) <= 1) {
        currentStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          if (differenceInDays(uniqueDates[i - 1], uniqueDates[i]) === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < uniqueDates.length; i++) {
      if (differenceInDays(uniqueDates[i - 1], uniqueDates[i]) === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Today and this week counts
    const todaySessions = sessions.filter(s => 
      differenceInDays(today, new Date(s.created_date)) === 0
    ).length;

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekSessions = sessions.filter(s => 
      new Date(s.created_date) >= weekAgo
    ).length;

    // Recent trend (last 5 vs previous 5)
    let recentTrend = 'neutral';
    if (sessions.length >= 10) {
      const recent = sessions.slice(0, 5).reduce((a, s) => a + (s.score || 0), 0) / 5;
      const previous = sessions.slice(5, 10).reduce((a, s) => a + (s.score || 0), 0) / 5;
      if (recent > previous + 0.05) recentTrend = 'up';
      else if (recent < previous - 0.05) recentTrend = 'down';
    }

    return {
      totalSessions: sessions.length,
      totalAttempts: sessions.length,
      averageScore: averageScore * 100,
      bestScore: bestScore * 100,
      uniqueWords,
      currentStreak,
      longestStreak,
      todaySessions,
      thisWeekSessions,
      recentTrend
    };
  }, [sessions]);

  const statCards = [
    {
      label: "Practice Sessions",
      value: stats.totalSessions,
      icon: Activity,
      color: "blue",
      detail: `${stats.todaySessions} today`
    },
    {
      label: "Average Score",
      value: `${Math.round(stats.averageScore)}%`,
      icon: Target,
      color: stats.averageScore >= 80 ? "green" : stats.averageScore >= 50 ? "amber" : "red",
      detail: stats.recentTrend === 'up' ? '↑ Improving' : stats.recentTrend === 'down' ? '↓ Needs focus' : ''
    },
    {
      label: "Best Score",
      value: `${Math.round(stats.bestScore)}%`,
      icon: Award,
      color: "purple",
      detail: "Personal best"
    },
    {
      label: "Words Practiced",
      value: stats.uniqueWords,
      icon: Calendar,
      color: "indigo",
      detail: `${stats.thisWeekSessions} this week`
    },
    {
      label: "Current Streak",
      value: `${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`,
      icon: Flame,
      color: stats.currentStreak >= 7 ? "orange" : stats.currentStreak >= 3 ? "amber" : "slate",
      detail: `Best: ${stats.longestStreak} days`
    },
    {
      label: "Trend",
      value: stats.recentTrend === 'up' ? "Improving" : stats.recentTrend === 'down' ? "Declining" : "Steady",
      icon: TrendingUp,
      color: stats.recentTrend === 'up' ? "green" : stats.recentTrend === 'down' ? "red" : "slate",
      detail: "Last 5 sessions"
    }
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-100', icon: 'bg-blue-600', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', icon: 'bg-green-600', text: 'text-green-600' },
    amber: { bg: 'bg-amber-100', icon: 'bg-amber-600', text: 'text-amber-600' },
    red: { bg: 'bg-red-100', icon: 'bg-red-600', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', icon: 'bg-purple-600', text: 'text-purple-600' },
    indigo: { bg: 'bg-indigo-100', icon: 'bg-indigo-600', text: 'text-indigo-600' },
    orange: { bg: 'bg-orange-100', icon: 'bg-orange-600', text: 'text-orange-600' },
    slate: { bg: 'bg-slate-100', icon: 'bg-slate-500', text: 'text-slate-600' }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {statCards.map((stat, index) => {
        const colors = colorClasses[stat.color];
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`p-4 ${colors.bg} border-0`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 truncate">{stat.label}</p>
                  <p className={`text-xl font-bold ${colors.text}`}>{stat.value}</p>
                  {stat.detail && (
                    <p className="text-xs text-slate-500 mt-0.5">{stat.detail}</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}