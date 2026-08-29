import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug } from 'lucide-react';
import { createPageUrl } from '@/utils/pageUtils';
import { useLanguage } from '../i18n/LanguageContext';

export default function BugReportButton() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <button
      onClick={() => navigate(createPageUrl('BugReport'))}
      title={t('home.reportBug')}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all hover:brightness-110 active:scale-95"
      style={{
        background: '#0a3d6b',
        color: '#00bcd4',
        border: '1.5px solid #f5c518',
        boxShadow: '0 0 16px rgba(0,188,212,0.25)',
      }}
    >
      <Bug className="w-4 h-4" />
      <span>{t('home.reportBug')}</span>
    </button>
  );
}