import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { localizeCurriculum } from '../curriculum/curriculumTranslations';
import { useLanguage } from '../i18n/LanguageContext';

const CURRICULUM_KEY = 'soundmirror_curriculum_passed';

export default function CurriculumHistory() {
  const { language } = useLanguage();
  const CURR = localizeCurriculum(language);
  const completedIds = React.useMemo(() => {
    try {
      const s = localStorage.getItem(CURRICULUM_KEY);
      return new Set(s ? JSON.parse(s) : []);
    } catch { return new Set(); }
  }, []);

  const totalLessons = CURR.reduce((acc, lvl) => acc + lvl.lessons.length, 0);
  const totalPassed = CURR.reduce(
    (acc, lvl) => acc + lvl.lessons.filter(l => completedIds.has(l.id)).length, 0
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-semibold" style={{ color: '#aaa' }}>
          Overall Progress:
        </span>
        <span className="text-sm font-bold" style={{ color: '#34d399' }}>
          {totalPassed} / {totalLessons} lessons passed
        </span>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(totalPassed / totalLessons) * 100}%`, background: '#34d399' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CURR.map(level => {
          const passed = level.lessons.filter(l => completedIds.has(l.id)).length;
          return (
            <div
              key={level.level}
              className="rounded-xl p-4"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${level.color}40` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: level.color }}>
                  Level {level.level}: {level.title}
                </h3>
                <span className="text-xs" style={{ color: '#888' }}>{passed}/{level.lessons.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {level.lessons.map(lesson => {
                  const done = completedIds.has(lesson.id);
                  return (
                    <div key={lesson.id} className="flex items-center gap-2">
                      {done
                        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
                        : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: '#444' }} />
                      }
                      <span className="text-sm" style={{ color: done ? '#fff' : '#666' }}>
                        {lesson.label}
                      </span>
                      {done && (
                        <span className="text-xs ml-auto" style={{ color: '#34d399' }}>✓ Passed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}