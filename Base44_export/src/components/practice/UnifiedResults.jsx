import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Eye, Volume2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import PhonemeDisplay from './PhonemeDisplay';
import Mouth3DRenderer from './Mouth3DRenderer';
import VisemeComparisonDisplay from './VisemeComparisonDisplay';
import ArticulationGuide from './ArticulationGuide';
import { getTipForPhoneme, getFeedbackMessage } from './phonemeTips';
import { speak as speakText } from './base44Speech';
import { useTranslations } from './translations';

const LANG_SPEECH_CODES = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
  it: 'it-IT', pt: 'pt-BR', zh: 'zh-CN', ja: 'ja-JP'
};

export default function UnifiedResults({ 
  result, 
  blendshapeHistory,
  targetPhonemes,
  onPracticeSound, 
  onTryAgain 
}) {
  const [selectedLang, setSelectedLang] = useState('en');
  
  useEffect(() => {
    setSelectedLang(localStorage.getItem('soundmirror_lang') || 'en');
  }, []);
  
  const t = useTranslations(selectedLang);
  if (!result || typeof result !== 'object') return null;
  
  const { target, produced, alignment, score, feedback } = result;
  
  const safeScore = typeof score === 'number' ? score : 0;
  const safeFeedback = Array.isArray(feedback) ? feedback : [];
  
  const safeTarget = {
    text: (target?.text != null) ? String(target.text) : '',
    phonetic: (target?.phonetic != null) ? String(target.phonetic) : '',
    phonemes: Array.isArray(target?.phonemes) ? target.phonemes.filter(p => p != null) : []
  };

  const safeProduced = {
    text: (produced?.text != null) ? String(produced.text) : '',
    phonetic: (produced?.phonetic != null) ? String(produced.phonetic) : '',
    phonemes: (produced?.phonemes != null) ? String(produced.phonemes) : ''
  };

  const safeAlignment = Array.isArray(alignment) ? alignment.filter(a => a != null).map(a => ({
    letter: String(a.letter ?? ''),
    phoneme: String(a.phoneme ?? ''),
    phonetic: String(a.phonetic ?? ''),
    producedLetter: String(a.producedLetter ?? ''),
    producedPhonetic: String(a.producedPhonetic ?? ''),
    status: a.status || 'unknown'
  })) : [];

  const getScoreColor = (s) => {
    if (s >= 0.8) return "text-green-600";
    if (s >= 0.5) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (s) => {
    if (s >= 0.8) return t('excellent') || "Great!";
    if (s >= 0.5) return t('gettingThere') || "Getting there";
    return t('needsPractice') || "Needs practice";
  };

  const heardSyllable =
    (result?.syllable && result.syllable.primary) ||
    result?.primary ||
    '';

  const problemPhonemes = safeAlignment.filter(a => a.status === 'mismatch');

  const speakTargetWord = async () => {
    if (!safeTarget.text) return;
    try {
      await speakText(safeTarget.text, {
        lang: LANG_SPEECH_CODES[selectedLang] || 'en-US'
      });
    } catch (err) {
      console.warn("Speech failed:", err);
    }
  };

  return (
    <div className="space-y-2">
      {/* Overall Score */}
      <Card className="overflow-hidden border">
        <div className={`h-1 ${safeScore >= 0.8 ? 'bg-green-500' : safeScore >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`} />
        <CardContent className="py-2">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              {safeScore >= 0.7 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              )}
              <span className={`text-3xl font-bold ${getScoreColor(safeScore)}`}>
                {Math.round(safeScore * 100)}%
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {getScoreLabel(safeScore)}
            </p>
            <p className="text-slate-600 text-xs">
              {getFeedbackMessage(Math.round(safeScore * 100))}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What you said vs Target - Side by Side */}
      <div className="grid md:grid-cols-2 gap-2">
        <Card className="border border-blue-200 bg-blue-50/50">
          <CardHeader className="py-1.5">
            <CardTitle className="text-xs text-blue-900 flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5" />
              {t('youWantedToSay') || 'You wanted to say'}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-blue-900">{safeTarget.text}</p>
              <p className="text-sm text-blue-700">{safeTarget.phonetic}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={speakTargetWord}
                className="gap-0.5 text-blue-600 hover:text-blue-700 h-6 text-[10px]"
              >
                <Volume2 className="h-3 w-3" />
                {t('hearCorrectPronunciation') || 'Hear correct pronunciation'}
              </Button>
              {safeTarget.phonemes.length > 0 && (
                <PhonemeDisplay phonemes={safeTarget.phonemes} type="target" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 bg-purple-50/50">
          <CardHeader className="py-1.5">
            <CardTitle className="text-xs text-purple-900 flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {t('whatWeHeard') || 'What we heard'}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-purple-900">
                {safeProduced.phonemes || safeProduced.text || '—'}
              </p>

              {heardSyllable && (
                <p className="text-xs text-purple-700">
                  {t('mainSyllableHeard') || 'Main syllable heard'}:{' '}
                  <strong>{heardSyllable}</strong>
                </p>
              )}

              {safeProduced.phonemes && safeProduced.text && (
                <p className="text-[10px] text-purple-600">
                  ({t('interpretedAs') || 'interpreted as'} "{safeProduced.text}")
                </p>
              )}

              {safeAlignment.length > 0 && (
                <PhonemeDisplay phonemes={safeAlignment} type="produced" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mouth Shape Comparison with interactive controls */}
      {targetPhonemes?.phonemes?.[0] && (
        <VisemeComparisonDisplay
          currentBlendshapes={blendshapeHistory?.[0]?.blendshapes || null}
          blendshapeHistory={blendshapeHistory}
          targetPhoneme={targetPhonemes.phonemes[0]}
          phonemeSequence={targetPhonemes.phonemes}
          currentIndex={0}
          isInteractive={true}
        />
      )}

      {/* General feedback tips */}
      {safeFeedback.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader className="py-1.5">
            <CardTitle className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              {t('tipsToImprove') || 'Tips to Improve'}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ul className="space-y-1">
              {safeFeedback.filter(tip => tip?.trim()).map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50"
                >
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-slate-700 text-[10px] leading-tight">{String(tip)}</p>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Success message */}
      {safeScore >= 0.8 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-2 bg-green-50 rounded border border-green-200 text-center"
        >
          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-green-800 font-semibold text-xs">
            {t('excellentPronunciation') || 'Excellent pronunciation!'}
          </p>
          <p className="text-green-700 text-[10px]">
            {t('mouthShapeMatched') || 'Your mouth shape and sound matched the target well.'}
          </p>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1 justify-center pt-1">
        <Link to={createPageUrl('Home')}>
          <Button
            size="sm"
            variant="outline"
            className="border gap-1 h-7 text-xs"
          >
            <ArrowLeft className="h-3 w-3" />
            {t('backToWordPractice') || 'Back to Word Practice'}
          </Button>
        </Link>
        
        <Button
          onClick={onTryAgain}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-7 text-xs"
        >
          {t('tryAgain')}
        </Button>
        
        {problemPhonemes.length > 0 && (
          <Button
            onClick={() => onPracticeSound(problemPhonemes[0])}
            size="sm"
            variant="outline"
            className="border h-7 text-xs"
          >
            {t('practiceProblemSounds') || 'Practice Problem Sounds'}
          </Button>
        )}
        
        <Button
          onClick={() => onPracticeSound(null)}
          size="sm"
          variant="outline"
          className="border border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-7 text-xs"
        >
          {t('practiceLetters')}
        </Button>
      </div>
    </div>
  );
}