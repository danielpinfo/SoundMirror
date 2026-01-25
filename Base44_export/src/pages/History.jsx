import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, TrendingUp, ChevronRight, Trash2, RotateCcw, BookA } from "lucide-react";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { useTranslations } from '../components/practice/translations';

export default function History() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedLang, setSelectedLang] = useState('en');

  useEffect(() => {
    setSelectedLang(localStorage.getItem('soundmirror_lang') || 'en');
  }, []);

  const t = useTranslations(selectedLang);

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['practice-sessions'],
    queryFn: () => base44.entities.PracticeSession.list('-created_date', 50),
    staleTime: 30000,
    gcTime: 300000,
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this practice session?')) {
      await base44.entities.PracticeSession.delete(id);
      refetch();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBg = (score) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="gap-2 text-slate-300 hover:text-slate-100">
              <ArrowLeft className="h-4 w-4" />
              {t('backToHome')}
            </Button>
          </Link>
          <Link to={createPageUrl('LetterPractice')}>
            <Button variant="outline" className="gap-2 border-indigo-500 text-indigo-400 hover:bg-indigo-950">
              <BookA className="h-4 w-4" />
              {t('practiceLetters')}
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{t('practiceHistory')}</h1>
            <p className="text-slate-400 mt-1">{t('reviewPastSessions') || 'Review your past practice sessions'}</p>
          </div>
          {sessions.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-slate-400">{t('totalSessions') || 'Total sessions'}</p>
              <p className="text-2xl font-bold text-blue-400">{sessions.length}</p>
            </div>
          )}
        </div>

        {sessions.length === 0 ? (
          <Card className="p-12 text-center bg-slate-800 border-slate-700">
            <div className="text-slate-500 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">{t('noSessionsYet') || 'No practice sessions yet'}</h2>
            <p className="text-slate-400 mb-6">{t('startPracticingHistory') || 'Start practicing to build your history!'}</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                {t('startPractice')}
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3) }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg border-2 bg-slate-800 ${
                    selectedSession?.id === session.id ? 'border-blue-400 shadow-lg' : 'border-slate-700'
                  }`}
                  onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Score circle */}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getScoreBg(session.score)} text-white font-bold text-lg`}>
                          {Math.round(session.score * 100)}%
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-slate-100">{session.word}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(session.created_date), 'MMM d, yyyy h:mm a')}
                          </div>
                          {session.produced_text && session.produced_text !== session.word && (
                            <p className="text-sm text-amber-400 mt-1">
                              {t('youSaid') || 'You said'}: "{session.produced_text}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(session.id, e)}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Link 
                          to={createPageUrl('Practice') + `?word=${encodeURIComponent(session.word)}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="outline" size="sm" className="gap-1">
                            <RotateCcw className="h-4 w-4" />
                            {t('retry') || 'Retry'}
                          </Button>
                        </Link>
                        <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${
                          selectedSession?.id === session.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </div>

                    {/* Expanded details */}
                    {selectedSession?.id === session.id && session.detailed_analysis && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-slate-700"
                      >
                        {/* Problem phonemes */}
                        {session.problem_phonemes && session.problem_phonemes.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-300 mb-2">{t('soundsNeedPractice') || 'Sounds that need practice'}:</p>
                            <div className="flex flex-wrap gap-1">
                              {session.problem_phonemes.map((p, i) => (
                                <span 
                                  key={i}
                                  className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                                >
                                  {p.letter || p.phoneme} ({Math.round((p.score || 0) * 100)}%)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Alignment details */}
                        {session.detailed_analysis.alignment && (
                          <div>
                            <p className="text-sm font-semibold text-slate-300 mb-2">{t('phonemeBreakdown') || 'Phoneme breakdown'}:</p>
                            <div className="flex flex-wrap gap-1">
                              {session.detailed_analysis.alignment.map((a, i) => (
                                <div 
                                  key={i}
                                  className={`px-2 py-1 rounded text-sm font-medium border ${
                                    a.status === 'match' 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }`}
                                >
                                  {a.letter}
                                  <span className="text-xs ml-1 opacity-70">
                                    {Math.round((a.score || 0) * 100)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Feedback tips */}
                        {session.detailed_analysis.feedback && session.detailed_analysis.feedback.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-slate-300 mb-2">{t('feedback') || 'Feedback'}:</p>
                            <ul className="space-y-1">
                              {session.detailed_analysis.feedback.map((tip, i) => (
                                <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                  <TrendingUp className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}