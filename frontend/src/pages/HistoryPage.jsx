import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getPracticeSessions, deletePracticeSession, getStatistics } from '../lib/db';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Home, 
  Type, 
  BookOpen, 
  Trash2, 
  Play, 
  Download,
  Search,
  Calendar,
  TrendingUp,
  Video,
  Mic,
  Flame,
  Trophy,
  Target,
  Star,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
} from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAchievements, setShowAchievements] = useState(true);
  const [showPhonemes, setShowPhonemes] = useState(true);
  const [activeTab, setActiveTab] = useState('progress'); // 'progress', 'history', or 'reports'

  // Load sessions
  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const allSessions = await getPracticeSessions({});
      setSessions(allSessions);
      setFilteredSessions(allSessions);
      
      const stats = await getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Filter sessions
  useEffect(() => {
    let filtered = [...sessions];
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.sessionType === typeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.target.toLowerCase().includes(query)
      );
    }
    
    setFilteredSessions(filtered);
  }, [sessions, typeFilter, searchQuery]);

  // Delete session
  const handleDelete = async (sessionId) => {
    try {
      await deletePracticeSession(sessionId);
      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Export session
  const handleExport = (session) => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${session.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render progress bar for phoneme
  const PhonemeProgressBar = ({ phoneme, avgScore, attempts, colorClass }) => (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center font-bold text-sm`}>
        {phoneme}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-blue-200">{attempts} attempts</span>
          <span className="text-white font-medium">{avgScore}%</span>
        </div>
        <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              avgScore >= 80 ? 'bg-green-500' : avgScore >= 60 ? 'bg-yellow-500' : 'bg-red-400'
            }`}
            style={{ width: `${avgScore}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Render achievement card
  const AchievementCard = ({ achievement }) => (
    <div 
      className={`p-3 rounded-xl border transition-all ${
        achievement.unlocked 
          ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30' 
          : 'bg-blue-900/20 border-blue-500/20 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${achievement.unlocked ? 'text-yellow-200' : 'text-blue-300'}`}>
              {achievement.name}
            </span>
            {achievement.unlocked && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
          <p className="text-xs text-blue-300/80 truncate">{achievement.desc}</p>
          {!achievement.unlocked && achievement.progress !== undefined && (
            <div className="mt-1">
              <div className="h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-blue-400 mt-0.5">{achievement.progress}/{achievement.target}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Export all sessions as JSON
  const exportAllSessions = () => {
    const reportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        language,
        platform: 'SoundMirror',
        totalSessions: sessions.length,
      },
      statistics: statistics,
      sessions: sessions.map(s => ({
        id: s.id,
        date: s.timestamp,
        type: s.sessionType,
        target: s.target,
        visualScore: s.visualScore,
        audioScore: s.audioScore,
        phonemeDetected: s.phonemeDetected,
      })),
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soundmirror-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print progress report
  const printProgressReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SoundMirror - History Library Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0047AB; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #0047AB; }
          .date-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #0047AB; margin-bottom: 15px; }
          .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          .metric-card { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; color: #0047AB; }
          .metric-label { font-size: 12px; color: #64748b; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SoundMirror</div>
          <div style="color: #64748b; margin-top: 5px;">History Library Report</div>
        </div>
        
        <div class="date-info">
          <strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          <strong>Language:</strong> ${language.charAt(0).toUpperCase() + language.slice(1)}
        </div>
        
        <div class="section">
          <div class="section-title">Progress Summary</div>
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value">${statistics?.totalSessions || 0}</div>
              <div class="metric-label">Total Sessions</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${statistics?.currentStreak || 0}</div>
              <div class="metric-label">Day Streak</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${statistics?.avgVisualScore || 0}%</div>
              <div class="metric-label">Avg Visual</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${statistics?.avgAudioScore || 0}%</div>
              <div class="metric-label">Avg Audio</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Recent Sessions</div>
          <table>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Target</th>
              <th>Visual</th>
              <th>Audio</th>
            </tr>
            ${sessions.slice(0, 20).map(s => `
              <tr>
                <td>${new Date(s.timestamp).toLocaleDateString()}</td>
                <td>${s.sessionType}</td>
                <td>${s.target}</td>
                <td>${s.visualScore || 0}%</td>
                <td>${s.audioScore || 0}%</td>
              </tr>
            `).join('')}
          </table>
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

  return (
    <div 
      data-testid="history-page" 
      className="min-h-screen bg-cobalt-gradient"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              data-testid="nav-home-btn"
            >
              <Home className="w-4 h-4 mr-1" />
              {t('return_home')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/letter-practice')}
              className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              data-testid="nav-letter-practice-btn"
            >
              <Type className="w-4 h-4 mr-1" />
              {t('letter_practice')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/word-practice')}
              className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              data-testid="nav-word-practice-btn"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              {t('word_practice')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
            History Library
          </h1>
          
          {/* Tab Switcher */}
          <div className="flex bg-blue-900/30 rounded-full p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('progress')}
              className={`rounded-full px-4 ${
                activeTab === 'progress' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-300 hover:text-white'
              }`}
              data-testid="tab-progress"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Progress
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('history')}
              className={`rounded-full px-4 ${
                activeTab === 'history' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-300 hover:text-white'
              }`}
              data-testid="tab-history"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Sessions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('reports')}
              className={`rounded-full px-4 ${
                activeTab === 'reports' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-300 hover:text-white'
              }`}
              data-testid="tab-reports"
            >
              <FileText className="w-4 h-4 mr-1" />
              Reports
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-blue-300">Loading your progress...</p>
          </div>
        ) : activeTab === 'progress' ? (
          /* Progress Tracker Tab */
          <div className="space-y-6">
            {/* Top Stats Row */}
            {statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Current Streak */}
                <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/30 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">{statistics.currentStreak}</p>
                        <p className="text-xs text-orange-300">Day Streak</p>
                      </div>
                    </div>
                    {statistics.longestStreak > 0 && (
                      <p className="text-xs text-orange-400/70 mt-2">Best: {statistics.longestStreak} days</p>
                    )}
                  </CardContent>
                </Card>

                {/* Total Sessions */}
                <Card className="bg-cobalt-surface border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/30 flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">{statistics.totalSessions}</p>
                        <p className="text-xs text-blue-300">Total Sessions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Average Visual */}
                <Card className="bg-cobalt-surface border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-600/30 flex items-center justify-center">
                        <Video className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">{statistics.avgVisualScore}%</p>
                        <p className="text-xs text-blue-300">Avg Visual</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Average Audio */}
                <Card className="bg-cobalt-surface border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-600/30 flex items-center justify-center">
                        <Mic className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">{statistics.avgAudioScore}%</p>
                        <p className="text-xs text-blue-300">Avg Audio</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Weekly Activity Chart */}
            {statistics && statistics.weeklyProgress && (
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    This Week's Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {statistics.weeklyProgress.map((day, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-blue-600/30 rounded-t-lg transition-all hover:bg-blue-600/50"
                          style={{ 
                            height: `${Math.max(8, (day.sessions / Math.max(...statistics.weeklyProgress.map(d => d.sessions), 1)) * 100)}%`,
                            minHeight: day.sessions > 0 ? '20px' : '8px'
                          }}
                        >
                          {day.sessions > 0 && (
                            <div className="text-center text-xs text-white font-medium pt-1">
                              {day.sessions}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-blue-300">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements Section */}
            {statistics && statistics.achievements && (
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardHeader className="pb-2">
                  <button 
                    onClick={() => setShowAchievements(!showAchievements)}
                    className="w-full flex items-center justify-between"
                  >
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Achievements
                      <span className="text-sm text-blue-400 font-normal">
                        ({statistics.achievements.filter(a => a.unlocked).length}/{statistics.achievements.length} unlocked)
                      </span>
                    </CardTitle>
                    {showAchievements ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-blue-400" />}
                  </button>
                </CardHeader>
                {showAchievements && (
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {statistics.achievements.map((achievement) => (
                        <AchievementCard key={achievement.id} achievement={achievement} />
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Phoneme Mastery Section */}
            {statistics && (
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardHeader className="pb-2">
                  <button 
                    onClick={() => setShowPhonemes(!showPhonemes)}
                    className="w-full flex items-center justify-between"
                  >
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-400" />
                      Phoneme Mastery
                      <span className="text-sm text-green-400 font-normal">
                        ({statistics.masteredPhonemes?.length || 0} mastered)
                      </span>
                    </CardTitle>
                    {showPhonemes ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-blue-400" />}
                  </button>
                </CardHeader>
                {showPhonemes && (
                  <CardContent>
                    {statistics.masteredPhonemes?.length === 0 && 
                     statistics.inProgressPhonemes?.length === 0 && 
                     statistics.needsPracticePhonemes?.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-blue-300 mb-2">No phoneme data yet</p>
                        <Button
                          onClick={() => navigate('/letter-practice')}
                          className="rounded-full bg-blue-600 hover:bg-blue-500"
                        >
                          Start Practicing Letters
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Mastered */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-green-400">Mastered (80%+)</span>
                          </div>
                          {statistics.masteredPhonemes?.length > 0 ? (
                            <div className="space-y-1">
                              {statistics.masteredPhonemes.map(p => (
                                <PhonemeProgressBar 
                                  key={p.phoneme} 
                                  {...p} 
                                  colorClass="bg-green-600/30 text-green-300"
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-blue-400">Keep practicing to master phonemes!</p>
                          )}
                        </div>

                        {/* In Progress */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium text-yellow-400">In Progress (60-79%)</span>
                          </div>
                          {statistics.inProgressPhonemes?.length > 0 ? (
                            <div className="space-y-1">
                              {statistics.inProgressPhonemes.map(p => (
                                <PhonemeProgressBar 
                                  key={p.phoneme} 
                                  {...p} 
                                  colorClass="bg-yellow-600/30 text-yellow-300"
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-blue-400">No phonemes in progress</p>
                          )}
                        </div>

                        {/* Needs Practice */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium text-red-400">Needs Practice (&lt;60%)</span>
                          </div>
                          {statistics.needsPracticePhonemes?.length > 0 ? (
                            <div className="space-y-1">
                              {statistics.needsPracticePhonemes.map(p => (
                                <PhonemeProgressBar 
                                  key={p.phoneme} 
                                  {...p} 
                                  colorClass="bg-red-600/30 text-red-300"
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-blue-400">Great job! No struggling phonemes</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        ) : (
          /* Sessions History Tab */
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <Input
                  type="text"
                  placeholder="Search by word or letter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-blue-500/30 bg-[#0f2847] text-white placeholder:text-blue-300/50"
                  data-testid="search-input"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl border-blue-500/30 bg-[#0f2847] text-white" data-testid="type-filter">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="letter">Letters Only</SelectItem>
                  <SelectItem value="word">Words Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sessions List */}
            {filteredSessions.length === 0 ? (
              <Card className="bg-cobalt-surface border-blue-500/20">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Sessions Found</h3>
                  <p className="text-blue-300 mb-4">
                    {sessions.length === 0 
                      ? "Start practicing to build your history!"
                      : "No sessions match your filters."}
                  </p>
                  <Button
                    onClick={() => navigate('/letter-practice')}
                    className="rounded-full bg-blue-600 hover:bg-blue-500"
                  >
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <Card 
                    key={session.id} 
                    className="bg-cobalt-surface border-blue-500/20 card-hover"
                    data-testid={`session-${session.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            session.sessionType === 'letter' 
                              ? 'bg-blue-600/30 text-blue-300' 
                              : 'bg-purple-600/30 text-purple-300'
                          }`}>
                            {session.sessionType === 'letter' ? (
                              <Type className="w-6 h-6" />
                            ) : (
                              <BookOpen className="w-6 h-6" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white truncate">
                                {session.target}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                session.sessionType === 'letter'
                                  ? 'bg-blue-600/30 text-blue-200'
                                  : 'bg-purple-600/30 text-purple-200'
                              }`}>
                                {session.sessionType}
                              </span>
                            </div>
                            <p className="text-sm text-blue-300">
                              {formatDate(session.timestamp)}
                            </p>
                          </div>
                          
                          <div className="hidden sm:flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-lg font-bold text-blue-300">{session.visualScore || 0}%</p>
                              <p className="text-xs text-blue-400">Visual</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-purple-300">{session.audioScore || 0}%</p>
                              <p className="text-xs text-blue-400">Audio</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (session.sessionType === 'letter') {
                                navigate(`/letter-practice`);
                              } else {
                                navigate(`/word-practice?word=${encodeURIComponent(session.target)}`);
                              }
                            }}
                            className="rounded-full text-blue-300 hover:text-white hover:bg-blue-600/30"
                            title="Practice again"
                            data-testid={`replay-${session.id}`}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExport(session)}
                            className="rounded-full text-blue-300 hover:text-white hover:bg-blue-600/30"
                            title="Export"
                            data-testid={`export-${session.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(session.id)}
                            className="rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            title="Delete"
                            data-testid={`delete-${session.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
