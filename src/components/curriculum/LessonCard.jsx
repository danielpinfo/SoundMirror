import React from 'react';
import { Play, CheckCircle, Lock } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LessonCard({ lesson, levelColor, status, onStart }) {
  const { t } = useLanguage();
  // status: 'locked' | 'available' | 'passed'
  const isLocked = status === 'locked';
  const isPassed = status === 'passed';

  return (
    <div
      className="rounded-xl p-4 flex items-center gap-4 transition-all"
      style={{
        background: isLocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
        border: `1.5px solid ${isPassed ? levelColor : isLocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? 'default' : 'pointer',
      }}
      onClick={() => !isLocked && onStart(lesson)}
    >
      {/* Status icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isPassed ? levelColor : 'rgba(255,255,255,0.1)' }}
      >
        {isPassed ? (
          <CheckCircle size={20} color="#0a1628" />
        ) : isLocked ? (
          <Lock size={16} color="#64748b" />
        ) : (
          <Play size={18} color={levelColor} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: isPassed ? levelColor : '#e2e8f0' }}>
          {lesson.label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
          "{lesson.word}" — {lesson.hint}
        </p>
      </div>

      {/* Pass score badge */}
      <div className="text-xs font-semibold flex-shrink-0" style={{ color: isPassed ? levelColor : '#64748b' }}>
        {isPassed ? `✓ ${t('curriculum.passed')}` : `${t('curriculum.goal')}: ${lesson.passScore}%`}
      </div>
    </div>
  );
}