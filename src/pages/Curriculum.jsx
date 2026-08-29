import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, RotateCcw } from 'lucide-react';
import { createPageUrl } from '@/utils/pageUtils';
import { localizeCurriculum } from '../components/curriculum/curriculumTranslations';
import { usePlugin } from '../components/core/PluginContext';
import LevelSection from '../components/curriculum/LevelSection';
import { useLanguage } from '../components/i18n/LanguageContext';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697ce1adb374adba38acf28d/0ec884bb5_LOGO.png';
const CYAN   = '#00bcd4';
const COBALT = '#0a3d6b';
const getCurriculumKey = (lang) => `soundmirror_curriculum_passed_${lang || 'en'}`;

export default function Curriculum() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { activePracticePack, activePracticeLanguage } = usePlugin();
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(getCurriculumKey(activePracticeLanguage));
      return new Set(stored ? JSON.parse(stored) : []);
    } catch { return new Set(); }
  });

  const CURR = activePracticePack?.getCurriculum?.() || localizeCurriculum(activePracticeLanguage);
  const totalLessons = CURR.reduce((s, l) => s + l.lessons.length, 0);
  const totalPassed  = completedIds.size;
  const pct = Math.round((totalPassed / totalLessons) * 100);

  const handleStart = (lesson) => {
    // Navigate to Practice with the lesson word pre-filled
    navigate(`${createPageUrl('Practice')}?word=${encodeURIComponent(lesson.word)}&lessonId=${lesson.id}&passScore=${lesson.passScore}`);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(getCurriculumKey(activePracticeLanguage));
      setCompletedIds(new Set(stored ? JSON.parse(stored) : []));
    } catch { setCompletedIds(new Set()); }
  }, [activePracticeLanguage]);

  const handleReset = () => {
    if (window.confirm(t('practice.resetProgress'))) {
      localStorage.removeItem(getCurriculumKey(activePracticeLanguage));
      setCompletedIds(new Set());
    }
  };

  return (
    <div
      className="min-h-screen w-full overflow-y-auto"
      style={{ background: 'linear-gradient(to bottom, #0a1628 0%, #0d2447 35%, #0a3d6b 70%, #0a6e8a 100%)' }}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
          style={{ background: CYAN, color: COBALT }}
        >
          <ArrowLeft size={16} />
          {t('nav.home')}
        </button>

        <img src={LOGO_URL} alt="SoundMirror" style={{ height: 48 }} />

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8' }}
        >
          <RotateCcw size={14} />
          {t('curriculum.reset')}
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-14">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GraduationCap size={28} color={CYAN} />
            <h1 className="text-3xl font-bold" style={{ color: CYAN }}>{t('nav.lessonCurriculum')}</h1>
          </div>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {t('curriculum.subtitle')}
          </p>
        </div>

        {/* Overall progress */}
        <div
          className="rounded-2xl p-5 mb-8"
          style={{ background: 'rgba(0,188,212,0.08)', border: '1.5px solid rgba(0,188,212,0.3)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm" style={{ color: CYAN }}>{t('curriculum.overallProgress')}</span>
            <span className="font-bold" style={{ color: CYAN }}>{totalPassed} / {totalLessons} {t('curriculum.lessons')}</span>
          </div>
          <div className="w-full rounded-full h-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${CYAN}, #a78bfa)` }}
            />
          </div>
          <p className="text-xs mt-2 text-right" style={{ color: '#64748b' }}>{pct}% {t('curriculum.complete')}</p>
        </div>

        {/* Level sections */}
        <div className="flex flex-col gap-6">
          {CURR.map(level => (
            <LevelSection
              key={level.level}
              level={level}
              completedIds={completedIds}
              onStart={handleStart}
            />
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-xs mt-8" style={{ color: '#475569' }}>
          {t('curriculum.note')}
        </p>
      </div>
    </div>
  );
}