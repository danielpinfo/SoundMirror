import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function WordInput({ onWordSelect, lang = 'en', placeholder }) {
  const [customWord, setCustomWord] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (customWord.trim()) {
      onWordSelect(customWord.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        value={customWord}
        onChange={(e) => setCustomWord(e.target.value)}
        placeholder={placeholder || "Type any word or phrase..."}
        className="text-sm h-9 px-3 border bg-sky-400 border-sky-500 text-black placeholder:text-slate-700 focus:border-sky-300 focus:bg-sky-300 transition-all"
      />
      
      <Button
        type="submit"
        className="w-full h-8 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        disabled={!customWord.trim()}
      >
        <ArrowRight className="ml-1 h-3 w-3" />
      </Button>
    </form>
  );
}