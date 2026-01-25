import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Globe } from "lucide-react";

export default function LanguageSelector({ languages, selectedLang, onLanguageChange, isLoading }) {
  const selectedLanguage = languages.find(l => l.code === selectedLang) || { 
    code: 'en', 
    nativeName: 'English', 
    englishName: 'English', 
    flag: '🇺🇸' 
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Globe className="h-4 w-4 animate-pulse" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[160px] justify-between bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600">
          <span className="flex items-center gap-2">
            <span className="text-xl">{selectedLanguage.flag}</span>
            <span>{selectedLanguage.nativeName}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] bg-slate-800 border-slate-700">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`flex items-center gap-3 cursor-pointer text-slate-100 hover:bg-slate-700 focus:bg-slate-700 ${
              lang.code === selectedLang ? 'bg-slate-700' : ''
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              {lang.nativeName !== lang.englishName && (
                <span className="text-xs text-slate-400">{lang.englishName}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}