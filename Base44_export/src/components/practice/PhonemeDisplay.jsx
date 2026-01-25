import React from 'react';
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

export default function PhonemeDisplay({ phonemes, type = "target" }) {
  if (!phonemes || !Array.isArray(phonemes) || phonemes.length === 0) return null;
  
  const getColor = (status) => {
    if (type === "target") return "bg-slate-100 text-slate-700 border-slate-200";
    
    switch (status) {
      case "match":
        return "bg-green-100 text-green-800 border-green-300";
      case "mismatch":
        return "bg-red-100 text-red-800 border-red-300";
      case "partial":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getIcon = (status) => {
    if (type === "target") return null;
    
    switch (status) {
      case "match":
        return <CheckCircle2 className="h-4 w-4" />;
      case "mismatch":
        return <XCircle className="h-4 w-4" />;
      case "partial":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {phonemes.filter(p => p != null).map((phoneme, index) => {
        const letter = phoneme && (phoneme.letter || phoneme.phoneme) ? String(phoneme.letter || phoneme.phoneme) : '';
        const phonetic = phoneme && phoneme.phonetic != null ? String(phoneme.phonetic) : '';
        if (!letter) return null;
        return (
        <div
          key={index}
          className={`
            relative px-6 py-4 rounded-2xl border-2 transition-all
            ${getColor(phoneme.status)}
            ${type !== "target" ? "hover:scale-105" : ""}
          `}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold">
              {letter}
            </span>
            {phonetic && (
              <span className="text-sm opacity-70">
                {phonetic}
              </span>
            )}
          </div>
          {getIcon(phoneme.status) && (
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
              {getIcon(phoneme.status)}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}