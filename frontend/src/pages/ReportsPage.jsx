import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getPracticeSessions, getStatistics } from '../lib/db';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Home, 
  FileText,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Award,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Type,
} from 'lucide-react';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const reportRef = useRef(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allSessions = await getPracticeSessions({});
      setSessions(allSessions);
      const stats = await getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter sessions by date range
  const getFilteredSessions = () => {
    if (dateRange === 'all') return sessions;
    
    const now = new Date();
    const ranges = {
      'week': 7,
      'month': 30,
      '3months': 90,
    };
    
    const days = ranges[dateRange] || 0;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return sessions.filter(s => new Date(s.timestamp) >= cutoff);
  };

  // Calculate detailed metrics
  const calculateMetrics = () => {
    const filtered = getFilteredSessions();
    
    if (filtered.length === 0) {
      return {
        totalSessions: 0,
        avgVisual: 0,
        avgAudio: 0,
        improvement: 0,
        consistency: 0,
        phonemeBreakdown: [],
        weakAreas: [],
        strongAreas: [],
        sessionFrequency: 0,
        progressTrend: 'stable',
      };
    }

    const sorted = [...filtered].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const avgVisual = filtered.reduce((sum, s) => sum + (s.visualScore || 0), 0) / filtered.length;
    const avgAudio = filtered.reduce((sum, s) => sum + (s.audioScore || 0), 0) / filtered.length;
    
    // Calculate improvement
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);
    
    const firstHalfAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, s) => sum + ((s.visualScore || 0) + (s.audioScore || 0)) / 2, 0) / firstHalf.length 
      : 0;
    const secondHalfAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, s) => sum + ((s.visualScore || 0) + (s.audioScore || 0)) / 2, 0) / secondHalf.length 
      : 0;
    
    const improvement = secondHalfAvg - firstHalfAvg;
    
    // Consistency
    const scores = filtered.map(s => ((s.visualScore || 0) + (s.audioScore || 0)) / 2);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - stdDev * 2);
    
    // Phoneme breakdown
    const phonemeData = {};
    filtered.filter(s => s.sessionType === 'letter').forEach(s => {
      const target = s.target.toUpperCase();
      if (!phonemeData[target]) {
        phonemeData[target] = { attempts: 0, totalVisual: 0, totalAudio: 0 };
      }
      phonemeData[target].attempts++;
      phonemeData[target].totalVisual += s.visualScore || 0;
      phonemeData[target].totalAudio += s.audioScore || 0;
    });
    
    const phonemeBreakdown = Object.entries(phonemeData).map(([phoneme, data]) => ({
      phoneme,
      attempts: data.attempts,
      avgVisual: Math.round(data.totalVisual / data.attempts),
      avgAudio: Math.round(data.totalAudio / data.attempts),
      avgOverall: Math.round((data.totalVisual + data.totalAudio) / (data.attempts * 2)),
    })).sort((a, b) => b.attempts - a.attempts);
    
    const weakAreas = phonemeBreakdown.filter(p => p.avgOverall < 70).slice(0, 5);
    const strongAreas = phonemeBreakdown.filter(p => p.avgOverall >= 80).slice(0, 5);
    
    const uniqueDates = new Set(filtered.map(s => new Date(s.timestamp).toLocaleDateString()));
    const daySpan = filtered.length > 1 
      ? (new Date(sorted[sorted.length - 1].timestamp) - new Date(sorted[0].timestamp)) / (1000 * 60 * 60 * 24) + 1
      : 1;
    const sessionFrequency = (filtered.length / daySpan) * 7;
    
    let progressTrend = 'stable';
    if (improvement > 5) progressTrend = 'improving';
    else if (improvement < -5) progressTrend = 'declining';
    
    return {
      totalSessions: filtered.length,
      avgVisual: Math.round(avgVisual * 10) / 10,
      avgAudio: Math.round(avgAudio * 10) / 10,
      improvement: Math.round(improvement * 10) / 10,
      consistency: Math.round(consistency),
      phonemeBreakdown,
      weakAreas,
      strongAreas,
      sessionFrequency: Math.round(sessionFrequency * 10) / 10,
      progressTrend,
      uniqueDays: uniqueDates.size,
    };
  };

  const metrics = calculateMetrics();

  // Generate printable report
  const generateReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SoundMirror - My Progress Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #1e40af; }
          .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; }
          .date-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 15px; }
          .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .metric-card { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
          .metric-value { font-size: 28px; font-weight: bold; color: #1e40af; }
          .metric-label { font-size: 12px; color: #64748b; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; }
          .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
          .progress-fill { height: 100%; border-radius: 4px; }
          .good { background: #22c55e; }
          .medium { background: #eab308; }
          .needs-work { background: #ef4444; }
          .tip { background: #eff6ff; border-left: 4px solid #1e40af; padding: 15px; margin: 10px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SoundMirror</div>
          <div class="subtitle">My Speech Practice Progress Report</div>
        </div>
        
        <div class="date-info">
          <strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          <strong>Period:</strong> ${dateRange === 'all' ? 'All Time' : dateRange === 'week' ? 'Last 7 Days' : dateRange === 'month' ? 'Last 30 Days' : 'Last 90 Days'}<br>
          <strong>Language:</strong> ${language.charAt(0).toUpperCase() + language.slice(1)}
        </div>
        
        <div class="section">
          <div class="section-title">📊 My Progress Summary</div>
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value">${metrics.totalSessions}</div>
              <div class="metric-label">Practice Sessions</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${metrics.avgVisual}%</div>
              <div class="metric-label">Visual Score</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${metrics.avgAudio}%</div>
              <div class="metric-label">Audio Score</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${metrics.improvement > 0 ? '+' : ''}${metrics.improvement}%</div>
              <div class="metric-label">Improvement</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${metrics.consistency}%</div>
              <div class="metric-label">Consistency</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${metrics.sessionFrequency}</div>
              <div class="metric-label">Sessions/Week</div>
            </div>
          </div>
        </div>
        
        ${metrics.phonemeBreakdown.length > 0 ? `
        <div class="section">
          <div class="section-title">🔤 Sound Performance</div>
          <table>
            <tr>
              <th>Sound</th>
              <th>Practice Count</th>
              <th>Visual</th>
              <th>Audio</th>
              <th>Overall</th>
            </tr>
            ${metrics.phonemeBreakdown.slice(0, 10).map(p => `
              <tr>
                <td><strong>${p.phoneme}</strong></td>
                <td>${p.attempts}</td>
                <td>${p.avgVisual}%</td>
                <td>${p.avgAudio}%</td>
                <td>
                  <div class="progress-bar">
                    <div class="progress-fill ${p.avgOverall >= 80 ? 'good' : p.avgOverall >= 60 ? 'medium' : 'needs-work'}" style="width: ${p.avgOverall}%"></div>
                  </div>
                  ${p.avgOverall}%
                </td>
              </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}
        
        ${metrics.strongAreas.length > 0 ? `
        <div class="section">
          <div class="section-title">⭐ Sounds I've Mastered</div>
          <p>Great job! These sounds are at 80% or higher:</p>
          <p style="font-size: 24px; color: #22c55e;"><strong>${metrics.strongAreas.map(p => p.phoneme).join(' • ')}</strong></p>
        </div>
        ` : ''}
        
        ${metrics.weakAreas.length > 0 ? `
        <div class="section">
          <div class="section-title">🎯 Sounds to Focus On</div>
          <p>Keep practicing these sounds:</p>
          <p style="font-size: 24px; color: #f59e0b;"><strong>${metrics.weakAreas.map(p => p.phoneme).join(' • ')}</strong></p>
        </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">💡 Tips for Improvement</div>
          <div class="tip">
            <strong>Practice Tip:</strong> 
            ${metrics.progressTrend === 'improving' ? 'You\'re making great progress! Keep up the consistent practice.' :
              metrics.progressTrend === 'declining' ? 'Try to practice more regularly. Even 5-10 minutes daily helps!' :
              'You\'re doing well! Try challenging yourself with new sounds.'}
          </div>
          <div class="tip">
            <strong>Frequency:</strong>
            ${metrics.sessionFrequency < 3 ? 'Try to practice at least 3-5 times per week for best results.' :
              metrics.sessionFrequency > 7 ? 'Excellent practice frequency! Keep it up!' :
              'Good practice frequency. Stay consistent!'}
          </div>
        </div>
        
        <div class="footer">
          <p>Generated by SoundMirror - Visual Speech Training</p>
          <p>${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Export as JSON
  const exportJSON = () => {
    const reportData = {
      metadata: {
        reportDate: new Date().toISOString(),
        dateRange,
        language,
        platform: 'SoundMirror',
      },
      summary: {
        totalSessions: metrics.totalSessions,
        avgVisualScore: metrics.avgVisual,
        avgAudioScore: metrics.avgAudio,
        improvement: metrics.improvement,
        consistency: metrics.consistency,
        sessionFrequency: metrics.sessionFrequency,
        progressTrend: metrics.progressTrend,
      },
      phonemeAnalysis: metrics.phonemeBreakdown,
      masteredSounds: metrics.strongAreas,
      soundsToFocusOn: metrics.weakAreas,
      sessions: getFilteredSessions().map(s => ({
        date: s.timestamp,
        type: s.sessionType,
        target: s.target,
        visualScore: s.visualScore,
        audioScore: s.audioScore,
      })),
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soundmirror-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = () => {
    if (metrics.progressTrend === 'improving') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (metrics.progressTrend === 'declining') return <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />;
    return <Activity className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div data-testid="reports-page" className="min-h-screen bg-cobalt-gradient">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
                data-testid="nav-home-btn"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
                className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Progress
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/letter-practice')}
                className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              >
                <Type className="w-4 h-4 mr-1" />
                Practice
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportJSON}
                className="rounded-full border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
                data-testid="export-json-btn"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={generateReport}
                className="rounded-full bg-blue-600 hover:bg-blue-500"
                data-testid="print-report-btn"
              >
                <Printer className="w-4 h-4 mr-1" />
                Print Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                My Reports
              </h1>
              <p className="text-blue-300 text-sm">Detailed progress analysis</p>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 rounded-xl border-blue-500/30 bg-[#0f2847] text-white" data-testid="date-range-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-blue-300">Loading your progress...</p>
          </div>
        ) : (
          <div ref={reportRef} className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{metrics.totalSessions}</p>
                  <p className="text-xs text-blue-300">Sessions</p>
                </CardContent>
              </Card>
              
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{metrics.avgVisual}%</p>
                  <p className="text-xs text-blue-300">Visual</p>
                </CardContent>
              </Card>
              
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{metrics.avgAudio}%</p>
                  <p className="text-xs text-blue-300">Audio</p>
                </CardContent>
              </Card>
              
              <Card className={`border-blue-500/20 ${
                metrics.improvement > 0 ? 'bg-green-900/20' : 
                metrics.improvement < 0 ? 'bg-red-900/20' : 'bg-cobalt-surface'
              }`}>
                <CardContent className="p-4 text-center">
                  {getTrendIcon()}
                  <p className={`text-2xl font-bold ${
                    metrics.improvement > 0 ? 'text-green-400' : 
                    metrics.improvement < 0 ? 'text-red-400' : 'text-white'
                  }`}>
                    {metrics.improvement > 0 ? '+' : ''}{metrics.improvement}%
                  </p>
                  <p className="text-xs text-blue-300">Improvement</p>
                </CardContent>
              </Card>
              
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <PieChart className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{metrics.consistency}%</p>
                  <p className="text-xs text-blue-300">Consistency</p>
                </CardContent>
              </Card>
              
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{metrics.sessionFrequency}</p>
                  <p className="text-xs text-blue-300">Per Week</p>
                </CardContent>
              </Card>
            </div>

            {/* Sound Performance Table */}
            <Card className="bg-cobalt-surface border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Sound Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.phonemeBreakdown.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-blue-500/20">
                          <th className="text-left py-3 px-4 text-blue-300 font-medium">Sound</th>
                          <th className="text-center py-3 px-4 text-blue-300 font-medium">Practice Count</th>
                          <th className="text-center py-3 px-4 text-blue-300 font-medium">Visual</th>
                          <th className="text-center py-3 px-4 text-blue-300 font-medium">Audio</th>
                          <th className="text-center py-3 px-4 text-blue-300 font-medium">Overall</th>
                          <th className="text-center py-3 px-4 text-blue-300 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.phonemeBreakdown.map((p, idx) => (
                          <tr key={p.phoneme} className={`border-b border-blue-500/10 ${idx % 2 === 0 ? 'bg-blue-900/10' : ''}`}>
                            <td className="py-3 px-4">
                              <span className="font-bold text-white text-lg">{p.phoneme}</span>
                            </td>
                            <td className="text-center py-3 px-4 text-blue-200">{p.attempts}</td>
                            <td className="text-center py-3 px-4 text-blue-200">{p.avgVisual}%</td>
                            <td className="text-center py-3 px-4 text-blue-200">{p.avgAudio}%</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-blue-900/50 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      p.avgOverall >= 80 ? 'bg-green-500' : 
                                      p.avgOverall >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${p.avgOverall}%` }}
                                  />
                                </div>
                                <span className="text-white font-medium w-12 text-right">{p.avgOverall}%</span>
                              </div>
                            </td>
                            <td className="text-center py-3 px-4">
                              {p.avgOverall >= 80 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                  <CheckCircle className="w-3 h-3" /> Mastered
                                </span>
                              ) : p.avgOverall >= 60 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                                  <Activity className="w-3 h-3" /> Learning
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                                  <AlertCircle className="w-3 h-3" /> Practice
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-blue-300 mb-4">No practice data yet. Start practicing to see your progress!</p>
                    <Button
                      onClick={() => navigate('/letter-practice')}
                      className="rounded-full bg-blue-600 hover:bg-blue-500"
                    >
                      Start Practicing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mastered & Focus Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mastered Sounds */}
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-400" />
                    Mastered Sounds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.strongAreas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {metrics.strongAreas.map(p => (
                        <div key={p.phoneme} className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full border border-green-500/30 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-bold">{p.phoneme}</span>
                          <span className="text-xs opacity-70">{p.avgOverall}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-blue-300 text-center py-4">Keep practicing to master sounds!</p>
                  )}
                </CardContent>
              </Card>

              {/* Focus Areas */}
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    Sounds to Focus On
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.weakAreas.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.weakAreas.map(p => (
                        <div key={p.phoneme} className="flex items-center justify-between p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center font-bold text-orange-300">
                              {p.phoneme}
                            </span>
                            <span className="text-white">{p.avgOverall}% average</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => navigate('/letter-practice')}
                            className="rounded-full bg-orange-600 hover:bg-orange-500 text-xs"
                          >
                            Practice
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-blue-300 text-center py-4">Great job! No sounds need extra focus.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  💡 Tips for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-blue-600/10 rounded-xl border border-blue-500/20">
                  <p className="text-white">
                    {metrics.progressTrend === 'improving' 
                      ? '🎉 Amazing progress! You\'re improving consistently. Keep up the great work!'
                      : metrics.progressTrend === 'declining'
                      ? '💪 Don\'t give up! Try practicing more regularly - even 5 minutes a day helps.'
                      : '✨ You\'re doing well! Challenge yourself with new sounds to keep improving.'}
                  </p>
                </div>
                
                {metrics.sessionFrequency < 3 && (
                  <div className="p-4 bg-blue-600/10 rounded-xl border border-blue-500/20">
                    <p className="text-white">
                      📅 Tip: Try to practice at least 3-5 times per week for the best results!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
