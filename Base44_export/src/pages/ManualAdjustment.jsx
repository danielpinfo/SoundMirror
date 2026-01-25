import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, AlertTriangle, Mic, Play } from "lucide-react";
import { useTranslations } from '../components/practice/translations';
import VisemeAnimator from '../components/practice/VisemeAnimator';
import { speak as speakText } from '../components/practice/base44Speech';
import UnifiedRecorder from '../components/practice/UnifiedRecorder';
import { base44 } from '@/api/base44Client';

// Detect if user is spelling letters instead of phonemes
function detectLetterSpelling(text) {
  const lower = text.toLowerCase().trim();
  
  // Common letter spelling patterns that should be avoided
  const letterPatterns = [
    /^em$/i, /^en$/i, /^el$/i, /^ef$/i, /^es$/i, /^ex$/i,
    /^bee$/i, /^cee$/i, /^dee$/i, /^gee$/i, /^jay$/i,
    /^kay$/i, /^pee$/i, /^tee$/i, /^vee$/i, /^zee$/i,
    /^double.*u$/i, /^why$/i
  ];
  
  for (const pattern of letterPatterns) {
    if (pattern.test(lower)) {
      return true;
    }
  }
  
  // For consonants, warn if no vowel sound at end
  if (lower.length <= 2 && /^[bcdfghjklmnpqrstvwxyz]$/i.test(lower)) {
    return true;
  }
  
  return false;
}

export default function ManualAdjustment() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const letter = params.get('letter') || 'M';
  const lang = params.get('lang') || 'en';
  
  const [selectedLang] = useState(lang);
  const [customPhonetic, setCustomPhonetic] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [frame, setFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const t = useTranslations(selectedLang);

  useEffect(() => {
    // Check for spelling violations whenever text changes
    if (customPhonetic.trim()) {
      setShowWarning(detectLetterSpelling(customPhonetic));
    } else {
      setShowWarning(false);
    }
  }, [customPhonetic]);

  const handlePlayNew = async () => {
    if (!customPhonetic.trim()) return;
    
    setHasPlayed(false);
    
    try {
      // CRITICAL: Force lowercase to prevent spelling out letters
      const textToSpeak = customPhonetic.trim().toLowerCase();
      
      // Start audio first (non-blocking)
      const audioPromise = speakText(textToSpeak, {
        lang: selectedLang === 'es' ? 'es-ES' : 'en-US',
        rate: 0.95
      });

      // Wait 0.5 seconds before starting animation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Start animation
      setIsAnimating(true);
      setAnimationKey(prev => prev + 1);
      setFrame(0);

      // Wait for audio to complete
      await audioPromise;
      
      setHasPlayed(true);
    } catch (err) {
      console.warn('Speech failed:', err);
    } finally {
      setIsAnimating(false);
      setTimeout(() => setFrame(0), 100);
    }
  };

  const handleTryAgain = () => {
    setHasPlayed(false);
    setFrame(1);
  };

  const handleRecordNew = () => {
    setShowRecorder(true);
  };

  const handleKeepAdjustment = async () => {
    if (!customPhonetic.trim()) {
      alert('Please enter a phoneme first');
      return;
    }

    setIsSaving(true);
    try {
      const existing = await base44.entities.CustomPhonetic.filter({
        letter: letter,
        language: selectedLang
      });

      if (existing.length > 0) {
        await base44.entities.CustomPhonetic.update(existing[0].id, {
          custom_phonetic: customPhonetic.trim()
        });
      } else {
        await base44.entities.CustomPhonetic.create({
          letter: letter,
          language: selectedLang,
          custom_phonetic: customPhonetic.trim(),
          derived_phonetic: customPhonetic.trim()
        });
      }

      alert(`✓ Saved! "${letter}" will now sound like "${customPhonetic.trim()}" in Letter Practice.`);
    } catch (error) {
      console.error('Failed to save:', error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordingComplete = async (audioBlob, blendshapes) => {
    setIsProcessing(true);
    try {
      const file = new File([audioBlob], 'manual-adjustment.wav', { type: 'audio/wav' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Store as custom phonetic
      const existing = await base44.entities.CustomPhonetic.filter({
        letter: letter,
        language: selectedLang
      });

      if (existing.length > 0) {
        await base44.entities.CustomPhonetic.update(existing[0].id, {
          custom_phonetic: customPhonetic.trim()
        });
      } else {
        await base44.entities.CustomPhonetic.create({
          letter: letter,
          language: selectedLang,
          custom_phonetic: customPhonetic.trim(),
          derived_phonetic: customPhonetic.trim()
        });
      }

      alert(`✓ Custom pronunciation saved! "${letter}" will now sound like "${customPhonetic.trim()}"`);
      setShowRecorder(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-950">
      <div className="container mx-auto px-2 py-2 md:px-6 md:py-8 max-w-4xl">
        <Link to={createPageUrl('TeachLetters')}>
          <Button variant="ghost" className="mb-2 md:mb-6 gap-1 md:gap-2 text-slate-300 hover:text-slate-100 h-7 md:h-auto text-xs md:text-base relative before:absolute before:-inset-3 md:before:-inset-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Teacher Training
          </Button>
        </Link>

        <h1 className="text-lg md:text-3xl font-bold text-slate-100 mb-2 md:mb-4">
          Manual Adjustment: <span className="text-emerald-400">{letter}</span>
        </h1>

        {/* Important reminder */}
        <Card className="mb-2 md:mb-4 border-yellow-500 bg-yellow-900/20">
          <CardContent className="py-2 md:py-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs md:text-sm text-yellow-100 font-semibold">
                  Important: Use phoneme spelling, not letter names!
                </p>
                <p className="text-[10px] md:text-xs text-yellow-200 mt-1">
                  For "M", type <b>"ma"</b> or <b>"mu"</b>, NOT "em".<br/>
                  For "S", type <b>"sa"</b> or <b>"sss"</b>, NOT "es".<br/>
                  Always use the actual sound the letter makes, not its alphabetical name.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main adjustment interface */}
        <Card className="border border-emerald-600 bg-slate-800/90">
          <CardContent className="py-2 md:py-4 space-y-2 md:space-y-4">
            {/* 3D Head with slider */}
            <div className="w-full flex flex-col items-center gap-2">
              <VisemeAnimator
                token={letter.toLowerCase()}
                displayLabel={letter}
                showLabel={false}
                showInternalControls={false}
                animationKey={animationKey}
                frame={isAnimating ? undefined : frame - 1}
                onFrameChange={(f) => setFrame(f + 1)}
                frameCount={8}
                fps={12}
              />
              
              {!isAnimating && (
                <div className="w-full max-w-md">
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={frame}
                    onChange={(e) => setFrame(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-center text-slate-400 mt-1">
                    {frame}/8
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard input */}
            <div className="space-y-2">
              <label className="block text-sm md:text-base font-semibold text-slate-200">
                Type phoneme for "{letter}":
              </label>
              <input
                type="text"
                value={customPhonetic}
                onChange={(e) => setCustomPhonetic(e.target.value)}
                placeholder="e.g., ma, sa, ba..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm md:text-base"
                autoFocus
              />
              
              {showWarning && (
                <div className="flex gap-2 p-2 rounded bg-red-900/40 border border-red-600">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200">
                    Warning: This looks like a letter name, not a phoneme sound! 
                    Use the actual sound (e.g., "ma" not "em").
                  </p>
                </div>
              )}
            </div>

            {/* Play button */}
            <div className="flex justify-center">
              {!hasPlayed ? (
                <Button
                  onClick={handlePlayNew}
                  disabled={!customPhonetic.trim() || isAnimating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  <Volume2 className="h-5 w-5" />
                  Play New
                </Button>
              ) : (
                <Button
                  onClick={handlePlayNew}
                  disabled={!customPhonetic.trim() || isAnimating}
                  className="h-16 w-16 rounded-full bg-emerald-600 hover:bg-emerald-700 p-0"
                >
                  <Play className="h-8 w-8" />
                </Button>
              )}
            </div>

            {/* After playback buttons */}
            {hasPlayed && !showRecorder && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleRecordNew}
                    className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                  >
                    <Mic className="h-5 w-5" />
                    Record New Phoneme
                  </Button>
                </div>
                <Button
                  onClick={handleKeepAdjustment}
                  disabled={isSaving || showWarning}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? 'Saving...' : 'Keep Manual Adjustment'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recorder */}
        {showRecorder && (
          <UnifiedRecorder
            targetWord={letter}
            targetPhonemes={{
              phonetic: customPhonetic,
              phonemes: [{ letter, phonetic: customPhonetic }]
            }}
            onRecordingComplete={handleRecordingComplete}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
}