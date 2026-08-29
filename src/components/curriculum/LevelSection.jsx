import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LessonCard from './LessonCard';
import { useLanguage } from '../i18n/LanguageContext';

export default function LevelSection({ level, completedIds, onStart }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(true);

  const passedCount = level.lessons.filter(l => completedIds.has(l.id)).length;
  const allPassed = passedCount === level.lessons.length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${level.color}44`, background: 'rgba(0,0,0,0.25)' }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:brightness-110"
        style={{ background: `${level.color}18` }}
        onClick={() => setOpen(o => !o)}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: level.color, color: '#0a1628' }}
        >
          {level.level}
        </div>
        <div className="flex-1">
          <p className="font-bold" style={{ color: level.color }}>{level.title}</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{level.description}</p>
        </div>
        <div className="text-xs font-semibold mr-3" style={{ color: allPassed ? level.color : '#64748b' }}>
          {passedCount}/{level.lessons.length} {t('curriculum.done')}
        </div>
        {open ? <ChevronUp size={16} color={level.color} /> : <ChevronDown size={16} color={level.color} />}
      </button>

      {/* Lessons */}
      {open && (
        <div className="p-4 flex flex-col gap-3">
          {level.lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              levelColor={level.color}
              status={completedIds.has(lesson.id) ? 'passed' : 'available'}
              onStart={onStart}
            />
          ))}
        </div>
      )}
    </div>
  );
}