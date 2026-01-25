import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PracticeWordsList({ words, lang, onWordSelect, isLoading, noWordsText, loadingText }) {
  // Map lang codes to speech synthesis language codes
  const langMap = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
    it: 'it-IT', pt: 'pt-BR', zh: 'zh-CN', ja: 'ja-JP'
  };

  const speakWord = (text, e) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[lang] || 'en-US';
    speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
        {loadingText && <span className="ml-2 text-slate-400">{loadingText}</span>}
      </div>
    );
  }

  if (!words || !Array.isArray(words) || words.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        {noWordsText || 'No practice words available for this language yet.'}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {words.map((word, idx) => (
        <motion.div
          key={word.id || idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={() => onWordSelect(word.text || word)}
            variant="outline"
            className="h-auto py-2 px-4 bg-slate-700/50 border-slate-600 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all group"
          >
            <span className="text-base font-medium">
              {word.text || word}
            </span>
            <Volume2 
              className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => speakWord(word.text || word, e)}
            />
          </Button>
        </motion.div>
      ))}
    </div>
  );
}