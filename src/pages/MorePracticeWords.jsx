import React from 'react';
import GroupedWordsPage from '@/components/practice/GroupedWordsPage';
import { useLearningContext } from '@/components/core/LearningContext';
import { usePlugin } from '@/components/core/PluginContext';
import { useLanguage } from '@/components/i18n/LanguageContext';

const PAGE_COPY = {
  en: {
    title: 'More Practice Words',
    subtitle: 'Choose a word to practice.',
    backLabel: 'Back to Practice',
  },
  es: {
    title: 'Más palabras para practicar',
    subtitle: 'Elige una palabra para practicar.',
    backLabel: 'Volver a la práctica',
  },
  it: {
    title: 'Altre parole da praticare',
    subtitle: 'Scegli una parola da praticare.',
    backLabel: 'Torna alla pratica',
  },
  pt: {
    title: 'Mais palavras para praticar',
    subtitle: 'Escolha uma palavra para praticar.',
    backLabel: 'Voltar à prática',
  },
  de: {
    title: 'Weitere Übungswörter',
    subtitle: 'Wähle ein Wort zum Üben.',
    backLabel: 'Zurück zur Übung',
  },
  fr: {
    title: 'Plus de mots à pratiquer',
    subtitle: 'Choisissez un mot à pratiquer.',
    backLabel: "Retour à l'exercice",
  },
  ja: {
    title: '練習する単語をもっと見る',
    subtitle: '練習する単語を選んでください。',
    backLabel: '練習に戻る',
  },
  zh: {
    title: '更多练习词语',
    subtitle: '请选择一个词语进行练习。',
    backLabel: '返回练习',
  },
  hi: {
    title: 'अभ्यास के लिए और शब्द',
    subtitle: 'अभ्यास करने के लिए कोई शब्द चुनें।',
    backLabel: 'अभ्यास पर वापस जाएँ',
  },
  ar: {
    title: 'كلمات إضافية للتدريب',
    subtitle: 'اختر كلمة للتدرب عليها.',
    backLabel: 'العودة إلى التدريب',
  },
};

function normalizeLanguage(language = '') {
  return String(language || 'en').trim().toLowerCase().split(/[-_]/)[0];
}

export default function MorePracticeWords() {
  const { uiLanguage } = useLanguage();
  const { practiceLanguage } = useLearningContext();
  const { activePracticePack, isLoading } = usePlugin();

  const normalizedUiLanguage = normalizeLanguage(uiLanguage);
  const normalizedPracticeLanguage = normalizeLanguage(practiceLanguage);
  const copy = PAGE_COPY[normalizedUiLanguage] || PAGE_COPY.en;
  const groups = activePracticePack?.wordLibraryGroups || [];

  if (isLoading && groups.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a1628]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200/30 border-t-cyan-400" />
      </div>
    );
  }

  return (
    <div dir={normalizedUiLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <GroupedWordsPage
        title={copy.title}
        subtitle={copy.subtitle}
        groups={groups}
        locale={normalizedPracticeLanguage}
        backLabel={copy.backLabel}
      />
    </div>
  );
}
