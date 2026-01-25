import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Loader2, BookA } from "lucide-react";
import { motion } from "framer-motion";
import ProgressStats from '../components/practice/ProgressStats';
import SoundMasteryChart from '../components/practice/SoundMasteryChart';
import { useTranslations } from '../components/practice/translations';

export default function Progress() {
  const [selectedLang, setSelectedLang] = useState('en');

  useEffect(() => {
    setSelectedLang(localStorage.getItem('soundmirror_lang') || 'en');
  }, []);

  const t = useTranslations(selectedLang);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['practice-sessions-progress'],
    queryFn: () => base44.entities.PracticeSession.list('-created_date', 100),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="container mx-auto px-2 py-2 md:px-4 md:py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-2 md:mb-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="gap-1 md:gap-2 text-slate-300 hover:text-slate-100 h-7 md:h-auto text-xs md:text-base">
              <ArrowLeft className="h-4 w-4" />
              {t('backToHome')}
            </Button>
          </Link>
          <Link to={createPageUrl('LetterPractice')}>
            <Button variant="outline" className="gap-1 md:gap-2 border-indigo-500 text-indigo-400 hover:bg-indigo-950 h-7 md:h-auto text-xs md:text-base">
              <BookA className="h-3 w-3 md:h-4 md:w-4" />
              {t('practiceLetters')}
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 md:mb-8"
        >
          <h1 className="text-xl md:text-4xl font-bold text-slate-100 mb-1 md:mb-2">{t('yourProgress') || 'Your Progress'}</h1>
          <p className="text-xs md:text-lg text-slate-400">
            {t('trackProgress') || 'Track your pronunciation journey and celebrate improvements'}
          </p>
        </motion.div>

        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 md:p-12 text-center border-2 border-slate-700 bg-slate-800/80">
              <div className="max-w-md mx-auto space-y-2 md:space-y-4">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-blue-900 flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 md:h-10 md:w-10 text-blue-400" />
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-slate-100">
                  {t('startYourJourney') || 'Start Your Journey'}
                </h2>
                <p className="text-xs md:text-base text-slate-400">
                  {t('noPracticeYet') || "You haven't practiced any words yet. Start practicing to see your progress here!"}
                </p>
                <Link to={createPageUrl('Home')}>
                  <Button size="lg" className="mt-2 md:mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-xs md:text-base h-8 md:h-auto">
                    {t('startPractice')}
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-1 md:space-y-2">
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProgressStats sessions={sessions} />
            </motion.div>

            {/* Sound Mastery Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SoundMasteryChart sessions={sessions} />
            </motion.div>

            {/* Recent Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 border-slate-700 bg-slate-800/80 p-2 md:p-6">
                <h3 className="text-sm md:text-xl font-bold text-slate-100 mb-2 md:mb-4">{t('recentPractice') || 'Recent Practice'}</h3>
                <div className="space-y-1 md:space-y-3">
                  {sessions.slice(0, 5).map((session, index) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-slate-100 text-xs md:text-sm">{session.word}</p>
                        <p className="text-[9px] md:text-[10px] text-slate-400">
                          {new Date(session.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`text-lg md:text-2xl font-bold ${
                        session.score >= 0.8 ? 'text-green-600' : 
                        session.score >= 0.5 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {Math.round(session.score * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
                {sessions.length > 5 && (
                  <div className="mt-2 md:mt-4 text-center">
                    <Link to={createPageUrl('History')}>
                      <Button variant="outline">{t('viewAllHistory') || 'View All History'}</Button>
                    </Link>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}