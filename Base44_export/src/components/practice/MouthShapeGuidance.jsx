import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function MouthShapeGuidance({ metrics, targetPhoneme }) {
  if (!metrics) {
    return (
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6 text-center text-slate-500">
          <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Position your face in view to see guidance</p>
        </CardContent>
      </Card>
    );
  }

  // Define target shapes for common phonemes
  const getTargetShape = (phoneme) => {
    const letter = phoneme?.letter?.toLowerCase() || '';
    const phonetic = phoneme?.phonetic?.toLowerCase() || '';
    
    // Vowel shapes
    if (['a', 'ah'].some(p => letter.includes(p) || phonetic.includes(p))) {
      return { openness: 'high', width: 'medium', rounded: false, tip: 'Open mouth wide, jaw down' };
    }
    if (['o', 'oh'].some(p => letter.includes(p) || phonetic.includes(p))) {
      return { openness: 'medium', width: 'narrow', rounded: true, tip: 'Round lips into "O" shape' };
    }
    if (['e', 'ee'].some(p => letter.includes(p) || phonetic.includes(p))) {
      return { openness: 'low', width: 'wide', rounded: false, tip: 'Stretch lips wide, smile shape' };
    }
    if (['i', 'ih'].some(p => letter.includes(p) || phonetic.includes(p))) {
      return { openness: 'low', width: 'medium', rounded: false, tip: 'Relaxed mouth, slight opening' };
    }
    if (['u', 'oo'].some(p => letter.includes(p) || phonetic.includes(p))) {
      return { openness: 'low', width: 'narrow', rounded: true, tip: 'Push lips forward, tight circle' };
    }
    
    // Consonant shapes
    if (['f', 'v'].includes(letter)) {
      return { openness: 'low', width: 'medium', rounded: false, tip: 'Bite lower lip with upper teeth' };
    }
    if (['th'].some(p => letter.includes(p) || phonetic.includes(p))) {
      return { openness: 'low', width: 'medium', rounded: false, tip: 'Tongue between teeth' };
    }
    if (['m', 'b', 'p'].includes(letter)) {
      return { openness: 'low', width: 'medium', rounded: false, tip: 'Press lips together' };
    }
    if (['w'].includes(letter)) {
      return { openness: 'low', width: 'narrow', rounded: true, tip: 'Pucker lips tightly' };
    }
    
    return { openness: 'medium', width: 'medium', rounded: false, tip: 'Standard mouth position' };
  };

  const target = targetPhoneme ? getTargetShape(targetPhoneme) : null;

  const checkOpenness = () => {
    if (!target) return { status: 'neutral', message: 'No target set' };
    
    const { openness: currentOpenness } = metrics;
    
    if (target.openness === 'high' && currentOpenness > 25) {
      return { status: 'correct', message: 'Great! Mouth is wide open' };
    }
    if (target.openness === 'high' && currentOpenness <= 25) {
      return { status: 'incorrect', message: 'Open wider - jaw needs to drop more' };
    }
    if (target.openness === 'medium' && currentOpenness > 15 && currentOpenness <= 25) {
      return { status: 'correct', message: 'Perfect medium opening' };
    }
    if (target.openness === 'low' && currentOpenness <= 15) {
      return { status: 'correct', message: 'Good - mouth slightly open' };
    }
    if (target.openness === 'low' && currentOpenness > 15) {
      return { status: 'incorrect', message: 'Close mouth more - too wide' };
    }
    
    return { status: 'neutral', message: 'Adjust mouth opening' };
  };

  const checkWidth = () => {
    if (!target) return { status: 'neutral', message: 'No target set' };
    
    const { width: currentWidth } = metrics;
    
    if (target.width === 'wide' && currentWidth > 90) {
      return { status: 'correct', message: 'Perfect wide smile!' };
    }
    if (target.width === 'wide' && currentWidth <= 90) {
      return { status: 'incorrect', message: 'Stretch lips wider - like a smile' };
    }
    if (target.width === 'medium' && currentWidth > 70 && currentWidth <= 90) {
      return { status: 'correct', message: 'Good neutral width' };
    }
    if (target.width === 'narrow' && currentWidth <= 70) {
      return { status: 'correct', message: 'Perfect tight lips' };
    }
    if (target.width === 'narrow' && currentWidth > 70) {
      return { status: 'incorrect', message: 'Bring lips closer together' };
    }
    
    return { status: 'neutral', message: 'Adjust lip width' };
  };

  const checkRounding = () => {
    if (!target) return { status: 'neutral', message: 'No target set' };
    
    if (target.rounded && metrics.isRounded) {
      return { status: 'correct', message: 'Excellent lip rounding!' };
    }
    if (target.rounded && !metrics.isRounded) {
      return { status: 'incorrect', message: 'Round lips more - make "O" shape' };
    }
    if (!target.rounded && !metrics.isRounded) {
      return { status: 'correct', message: 'Good - lips not rounded' };
    }
    if (!target.rounded && metrics.isRounded) {
      return { status: 'incorrect', message: 'Relax lips - don\'t round' };
    }
    
    return { status: 'neutral', message: 'Check lip rounding' };
  };

  const opennessCheck = checkOpenness();
  const widthCheck = checkWidth();
  const roundingCheck = checkRounding();

  const StatusIcon = ({ status }) => {
    if (status === 'correct') return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === 'incorrect') return <AlertCircle className="h-5 w-5 text-amber-600" />;
    return <Info className="h-5 w-5 text-slate-400" />;
  };

  const StatusColor = (status) => {
    if (status === 'correct') return 'border-green-300 bg-green-50';
    if (status === 'incorrect') return 'border-amber-300 bg-amber-50';
    return 'border-slate-200 bg-slate-50';
  };

  return (
    <div className="space-y-4">
      {/* Main Tip */}
      {target && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-indigo-900">How to make this sound:</p>
              <p className="text-lg text-slate-700">{target.tip}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Metrics */}
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-600">Mouth Opening</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.openness}px</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Mouth Width</p>
              <p className="text-3xl font-bold text-purple-600">{metrics.width}px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Checklist */}
      {target && (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-lg border-2 ${StatusColor(opennessCheck.status)}`}
          >
            <div className="flex items-start gap-3">
              <StatusIcon status={opennessCheck.status} />
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900">Mouth Opening</p>
                <p className="text-sm text-slate-700 mt-1">{opennessCheck.message}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-lg border-2 ${StatusColor(widthCheck.status)}`}
          >
            <div className="flex items-start gap-3">
              <StatusIcon status={widthCheck.status} />
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900">Lip Width</p>
                <p className="text-sm text-slate-700 mt-1">{widthCheck.message}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-lg border-2 ${StatusColor(roundingCheck.status)}`}
          >
            <div className="flex items-start gap-3">
              <StatusIcon status={roundingCheck.status} />
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900">Lip Rounding</p>
                <p className="text-sm text-slate-700 mt-1">{roundingCheck.message}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}