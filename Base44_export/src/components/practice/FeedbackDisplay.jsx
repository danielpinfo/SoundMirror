import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import PhonemeDisplay from './PhonemeDisplay';

export default function FeedbackDisplay({ result, onPracticeSound, onTryAgain }) {
  if (!result || typeof result !== 'object') return null;

  // -----------------------------------------
  // 1) Normalize incoming result shape
  // -----------------------------------------
  // Some flows pass { target, produced, alignment, score, feedback }
  // Newer flows may also pass:
  //   - result.heard        (short "what we heard" syllable)
  //   - result.heardRaw     (full raw string)
  //   - result.primary      (primary syllable)
  //   - result.phonetic     (primary IPA)
  // We support both, safely.
  // -----------------------------------------

  const {
    target,
    produced,
    alignment,
    score,
    feedback,
  } = result || {};

  const safeScore = typeof score === 'number' ? score : 0;
  const safeFeedback = Array.isArray(feedback) ? feedback : [];

  // Target normalization
  const safeTarget = {
    text:
      (target && target.text != null)
        ? String(target.text)
        : (result.expected_text != null)
        ? String(result.expected_text)
        : '',
    phonetic:
      (target && target.phonetic != null)
        ? String(target.phonetic)
        : (result.expectedIpa != null)
        ? String(result.expectedIpa)
        : '',
    phonemes:
      (target && Array.isArray(target.phonemes))
        ? target.phonemes
            .filter(p => p != null)
            .map(p => ({
              letter: (p && p.letter != null) ? String(p.letter) : '',
              phoneme: (p && p.phoneme != null) ? String(p.phoneme) : '',
              phonetic: (p && p.phonetic != null) ? String(p.phonetic) : '',
              status: (p && p.status) ? String(p.status) : 'unknown',
            }))
        : [],
  };

  // Produced / heard normalization
  // Prefer new short fields (heard / primary / phonetic) over old produced.text
  const heardText =
    (result && result.heard != null && String(result.heard).trim() !== '')
      ? String(result.heard)
      : (result && result.primary != null && String(result.primary).trim() !== '')
      ? String(result.primary)
      : (produced && produced.text != null)
      ? String(produced.text)
      : (result && result.heardRaw != null)
      ? String(result.heardRaw)
      : '';

  const heardPhonetic =
    (result && result.phonetic != null && String(result.phonetic).trim() !== '')
      ? String(result.phonetic)
      : (produced && produced.phonetic != null)
      ? String(produced.phonetic)
      : '';

  const safeProduced = {
    text: heardText,
    phonetic: heardPhonetic,
  };

  // Alignment for per-phoneme display
  const safeAlignment = Array.isArray(alignment)
    ? alignment
        .filter(a => a != null)
        .map(a => ({
          letter: (a && a.letter != null) ? String(a.letter) : '',
          phoneme: (a && a.phoneme != null) ? String(a.phoneme) : '',
          phonetic: (a && a.phonetic != null) ? String(a.phonetic) : '',
          producedLetter: (a && a.producedLetter != null) ? String(a.producedLetter) : '',
          producedPhonetic: (a && a.producedPhonetic != null) ? String(a.producedPhonetic) : '',
          status: (a && a.status) ? String(a.status) : 'unknown',
        }))
    : [];

  const getScoreColor = (s) => {
    if (s >= 0.8) return "text-green-600";
    if (s >= 0.5) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (s) => {
    if (s >= 0.8) return "Great!";
    if (s >= 0.5) return "Getting there";
    return "Needs practice";
  };

  const hasMismatch = safeAlignment.some(p => p && p.status === "mismatch");

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="overflow-hidden border-2">
        <div
          className={`h-2 ${
            safeScore >= 0.8
              ? 'bg-green-500'
              : safeScore >= 0.5
              ? 'bg-amber-500'
              : 'bg-red-500'
          }`}
        />
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              {safeScore >= 0.7 ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-amber-600" />
              )}
              <span className={`text-5xl font-bold ${getScoreColor(safeScore)}`}>
                {Math.round(safeScore * 100)}%
              </span>
            </div>
            <p className="text-xl font-semibold text-slate-700">
              {getScoreLabel(safeScore)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Target (what you meant to say) */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">
              You wanted to say:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-3xl font-bold text-center text-blue-900">
                {String(safeTarget.text || '')}
              </p>
              <p className="text-xl text-center text-blue-700">
                {String(safeTarget.phonetic || '')}
              </p>
              {safeTarget.phonemes.length > 0 && (
                <PhonemeDisplay phonemes={safeTarget.phonemes} type="target" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Produced (what we heard) – short, syllable-level view */}
        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">
              What we actually heard:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-3xl font-bold text-center text-purple-900">
                {safeProduced.text || '—'}
              </p>
              {safeProduced.phonetic && (
                <p className="text-xl text-center text-purple-700">
                  {safeProduced.phonetic}
                </p>
              )}
              <p className="text-sm text-center text-purple-600 italic">
                This is how your pronunciation sounded to the system.
              </p>
              {safeAlignment.length > 0 && (
                <PhonemeDisplay phonemes={safeAlignment} type="produced" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Section */}
      {safeFeedback && safeFeedback.length > 0 && (
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Tips to improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {safeFeedback
                .filter(tip => tip != null && tip !== undefined)
                .map((tip, index) => {
                  const tipText =
                    tip != null && tip !== undefined ? String(tip) : '';
                  if (!tipText || !tipText.trim()) return null;
                  return (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-slate-700 leading-relaxed">{tipText}</p>
                    </motion.li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={onTryAgain}
          size="lg"
          variant="outline"
          className="border-2"
        >
          Try the whole word again
        </Button>
        {hasMismatch && (
          <Button
            onClick={() => {
              const firstMismatch = safeAlignment.find(
                p => p && p.status === "mismatch"
              );
              if (firstMismatch) onPracticeSound(firstMismatch);
            }}
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Practice problem sounds
          </Button>
        )}
      </div>
    </div>
  );
}
