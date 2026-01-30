import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getPracticeSessions, deletePracticeSession, getStatistics } from '../lib/db';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
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
} from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);

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
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {t('history')}
        </h1>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-cobalt-surface border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{statistics.totalSessions}</p>
                    <p className="text-xs text-blue-300">Total Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cobalt-surface border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-600/30 flex items-center justify-center">
                    <Video className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{statistics.avgVisualScore}%</p>
                    <p className="text-xs text-blue-300">Avg Visual Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cobalt-surface border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{statistics.avgAudioScore}%</p>
                    <p className="text-xs text-slate-500">Avg Audio Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {Object.keys(statistics.sessionsByDate).length}
                    </p>
                    <p className="text-xs text-slate-500">Practice Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by word or letter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200"
              data-testid="search-input"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] h-11 rounded-xl" data-testid="type-filter">
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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-slate-500">Loading sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <Card className="border-slate-100">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Sessions Found</h3>
              <p className="text-slate-500 mb-4">
                {sessions.length === 0 
                  ? "Start practicing to build your history!"
                  : "No sessions match your filters."}
              </p>
              <Button
                onClick={() => navigate('/letter-practice')}
                className="rounded-full bg-sky-600 hover:bg-sky-700"
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
                className="border-slate-100 card-hover"
                data-testid={`session-${session.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        session.sessionType === 'letter' 
                          ? 'bg-sky-100 text-sky-600' 
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {session.sessionType === 'letter' ? (
                          <Type className="w-6 h-6" />
                        ) : (
                          <BookOpen className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800 truncate">
                            {session.target}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            session.sessionType === 'letter'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {session.sessionType}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {formatDate(session.timestamp)}
                        </p>
                      </div>
                      
                      <div className="hidden sm:flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold text-sky-600">{session.visualScore || 0}%</p>
                          <p className="text-xs text-slate-400">Visual</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{session.audioScore || 0}%</p>
                          <p className="text-xs text-slate-400">Audio</p>
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
                        className="rounded-full"
                        title="Practice again"
                        data-testid={`replay-${session.id}`}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExport(session)}
                        className="rounded-full"
                        title="Export"
                        data-testid={`export-${session.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(session.id)}
                        className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
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
      </main>
    </div>
  );
}
