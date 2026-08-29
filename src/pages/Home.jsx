import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils/pageUtils';
import { BookOpen, Mic, GraduationCap } from 'lucide-react';
import { useLanguage } from '../components/i18n/LanguageContext';
import LanguageSelector from '../components/common/LanguageSelector';
import PracticeLanguageModal from '../components/home/PracticeLanguageModal';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697ce1adb374adba38acf28d/ff290666e_LOGO.png';
const CYAN = '#00bcd4';
const COBALT = '#0a3d6b';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center py-6 relative"
      style={{ background: 'linear-gradient(to bottom, #0d1f3c 0%, #112d5c 35%, #0e4d82 70%, #0a7fa0 100%)' }}
    >
      <div className="text-center">
        <img src={LOGO_URL} alt="SoundMirror" className="mx-auto leading-none block" style={{ width: '800px', maxWidth: '90vw' }} />
        
        <h1 className="text-4xl font-bold mb-2" style={{ color: CYAN }}>
          {t('nav.welcome')}
        </h1>
        
        <p className="text-lg mb-4" style={{ color: '#e0e0e0' }}>
          {t('nav.tagline')}
        </p>

        <div className="flex justify-center mb-6">
          <LanguageSelector large />
        </div>

        <div className="flex flex-col gap-4 w-[85vw] md:max-w-sm mx-auto md:w-auto">
          <button
            onClick={() => setShowLangModal(true)}
            className="flex items-center justify-center gap-3 px-4 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-all hover:brightness-110 active:scale-95"
            style={{ background: CYAN, color: COBALT, border: '3px solid #f5c518' }}
          >
            <Mic className="w-5 h-5 md:w-6 md:h-6" />
            {t('nav.startPracticing')}
          </button>

          <button
            onClick={() => navigate(createPageUrl('Curriculum'))}
            className="flex items-center justify-center gap-3 px-4 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-all hover:brightness-110 active:scale-95"
            style={{ background: 'rgba(167,139,250,0.2)', border: '3px solid #f5c518', color: '#a78bfa' }}
          >
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
            {t('nav.lessonCurriculum')}
          </button>

          <button
            onClick={() => navigate(createPageUrl('HistoryLibrary'))}
            className="flex items-center justify-center gap-3 px-4 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-all hover:brightness-110 active:scale-95"
            style={{ background: COBALT, border: '3px solid #f5c518', color: CYAN }}
          >
            <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
            {t('nav.viewHistory')}
          </button>
        </div>
      </div>

      <PracticeLanguageModal
        open={showLangModal}
        startStep="ask"
        onCancel={() => setShowLangModal(false)}
        onProceed={() => {
          setShowLangModal(false);
          navigate(createPageUrl('Practice'));
        }}
      />
    </div>
  );
}