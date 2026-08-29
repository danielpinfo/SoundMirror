import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useLearningContext } from '../core/LearningContext';
import { translations } from '../i18n/translations';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter } from
'@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';

// Brand accents used across the app
const CYAN = '#00bcd4';
const BORDER_YELLOW = '#f5c518';

export default function PracticeLanguageModal({ open, onCancel, onProceed }) {
  const { t, uiLanguage } = useLanguage();
  const { practiceLanguage, setPracticeLanguage, setBothLanguages } = useLearningContext();
  const [selectedPracticeLanguage, setSelectedPracticeLanguage] = useState(practiceLanguage || uiLanguage);
  const languageNames =
    translations[uiLanguage]?.languages ||
    translations.en?.languages ||
    {};
  const uiLanguageName = languageNames[uiLanguage] || uiLanguage;

  useEffect(() => {
    if (open) {
      setSelectedPracticeLanguage(practiceLanguage || uiLanguage);
    }
  }, [open, practiceLanguage, uiLanguage]);

  const handleContinue = () => {
    if (selectedPracticeLanguage === uiLanguage) {
      setBothLanguages(uiLanguage);
    } else {
      setPracticeLanguage(selectedPracticeLanguage);
    }
    onProceed?.();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {if (!v) onCancel?.();}}>
      <DialogContent closeLabel={t('languageChoice.close')} className="sm:max-w-md opacity-100" style={{ border: `2px solid ${BORDER_YELLOW}`, background: '#0047AB' }}>
        <DialogHeader>
          <DialogTitle style={{ color: CYAN }} className="text-xl">{t('languageChoice.title')}</DialogTitle>
          <DialogDescription className="mt-1 text-[hsl(var(--chart-5))] text-lg font-bold">{t('languageChoice.description')}

          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg p-3 text-center text-lg text-[#89ebe0]" style={{ background: 'rgba(0,188,212,0.10)', border: `1.5px solid ${BORDER_YELLOW}` }}>
            {t('languageChoice.uiLanguage', { language: uiLanguageName })}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-white/80">{t('languageChoice.practiceLanguage')}</p>
            <Select value={selectedPracticeLanguage} onValueChange={setSelectedPracticeLanguage}>
              <SelectTrigger className="w-full bg-white/10 border-silver text-[#89ebe0] hover:bg-white/20 text-lg opacity-100 [&>span]:w-full [&>span]:text-center">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-primary-dark border-silver">
                {Object.entries(languageNames).map(([code, name]) =>
                <SelectItem key={code} value={code} className="text-white hover:bg-primary-light">
                    {name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>{t('languageChoice.cancel')}</Button>
          <Button onClick={handleContinue} style={{ background: CYAN, color: '#0a3d6b' }}>{t('languageChoice.continue')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}
