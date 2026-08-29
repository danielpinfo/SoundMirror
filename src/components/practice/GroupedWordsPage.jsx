import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils/pageUtils';
import { useLearningContext } from '../core/LearningContext';

const CYAN = '#00bcd4';
const COBALT = '#0a3d6b';
const GOLD = '#f5c518';
const PILL_STYLE = { background: CYAN, color: COBALT, border: `1.5px solid ${GOLD}` };

export default function GroupedWordsPage({ title, subtitle, groups, locale = 'en', backLabel = 'Back to Practice' }) {
  const { practiceLanguage } = useLearningContext();

  // Helper truth belongs to the selected practice pack, independently of the
  // UI language chosen by the user.
  const PACK_DIR_MAP = {
    en: 'en_us',
    es: 'es',
    it: 'it',
    pt: 'pt',
    de: 'de',
    fr: 'fr',
    ja: 'ja',
    zh: 'zh',
    hi: 'hi',
    ar: 'ar',
  };

  const [helperFn, setHelperFn] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const dir = PACK_DIR_MAP[practiceLanguage] || 'en_us';
    // Dynamically load the practice pack's helper module; pack-owned, no globals
    import(`../languagepacks/${dir}/libraryHelpers.jsx`)
      .then((mod) => {
        if (cancelled) return;
        const fn = mod.getWordLibraryHelper || mod.default || null;
        setHelperFn(() => (typeof fn === 'function' ? fn : null));
      })
      .catch(() => {
        if (!cancelled) setHelperFn(() => null);
      });
    return () => { cancelled = true; };
  }, [practiceLanguage]);
  const navigate = useNavigate();

  const sortedGroups = useMemo(
    () => groups.map((group) => ({
      ...group,
      items: Array.from(new Set(group.words))
        .sort((a, b) => a.localeCompare(b, locale))
        .map((word) => ({
          word,
        })),
    })),
    [groups, locale]
  );

  const totalWords = useMemo(
    () => sortedGroups.reduce((sum, group) => sum + group.items.length, 0),
    [sortedGroups]
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(to bottom, #0a1628 0%, #0d2447 35%, #0a3d6b 70%, #0a6e8a 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(createPageUrl('Practice'))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all hover:brightness-110 active:scale-95"
            style={PILL_STYLE}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: COBALT }} />
            <span style={{ color: COBALT }}>{backLabel}</span>
          </button>
        </div>

        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,188,212,0.3)' }}>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: CYAN }}>{title}</h1>
          <p className="text-white/80">{subtitle}</p>
          <p className="text-sm mt-2" style={{ color: GOLD }}>
            {locale === 'ja'
              ? `${totalWords}語をグループ分けして表示`
              : locale === 'zh'
              ? `${totalWords}个词，按分组显示`
              : locale === 'hi'
              ? `${totalWords} शब्द, समूहों में दिखाए गए`
              : locale === 'ar'
              ? `${totalWords} كلمة ضمن مجموعات أبجدية`
              : `${totalWords} words in grouped alphabetical sections`}
          </p>
        </div>

        <div className="space-y-6">
          {sortedGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,188,212,0.3)' }}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold" style={{ color: CYAN }}>{group.label}</h2>
                <span className="text-sm" style={{ color: GOLD }}>
                  {locale === 'ar' ? `${group.items.length} كلمة` : `${group.items.length} words`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.items.map(({ word }) => (
                  <button
                      key={`${group.id}-${word}`}
                      onClick={() =>
                        navigate(`${createPageUrl('Practice')}?word=${encodeURIComponent(word)}`)
                      }
                      className="px-3 py-1.5 rounded-full font-medium text-sm transition-all hover:brightness-110 active:scale-95 capitalize text-left"
                      style={PILL_STYLE}
                    >
                      <div className="leading-tight text-lg md:text-xl font-extrabold">
                        {word}
                      </div>
                      {helperFn && (() => {
                        const h = helperFn(word);
                        return h ? (
                          <div className="text-xs opacity-80 leading-tight mt-0.5">
                            {h}
                          </div>
                        ) : null;
                      })()}
                    </button>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
