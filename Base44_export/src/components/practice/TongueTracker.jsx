import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Info, CheckCircle2, AlertCircle } from "lucide-react";

export default function TongueTracker({ mouthMetrics, faceLandmarks, videoElement, targetPhoneme }) {
  const canvasRef = useRef(null);
  const [tongueData, setTongueData] = useState(null);

  useEffect(() => {
    if (mouthMetrics?.isOpen && faceLandmarks && videoElement) {
      detectTongue();
    }
  }, [mouthMetrics, faceLandmarks, videoElement]);

  const detectTongue = () => {
    if (!canvasRef.current || !videoElement || !faceLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Draw video frame to hidden canvas for pixel analysis
    ctx.drawImage(videoElement, 0, 0, width, height);

    // Get mouth region coordinates
    const upperLip = faceLandmarks[13];
    const lowerLip = faceLandmarks[14];
    const leftCorner = faceLandmarks[61];
    const rightCorner = faceLandmarks[291];

    const mouthCenterX = ((leftCorner.x + rightCorner.x) / 2) * width;
    const mouthCenterY = ((upperLip.y + lowerLip.y) / 2) * height;
    const mouthWidth = Math.abs(leftCorner.x - rightCorner.x) * width;
    const mouthHeight = Math.abs(upperLip.y - lowerLip.y) * height;

    // Only analyze if mouth is open enough
    if (mouthHeight < 15) {
      setTongueData({ visible: false, position: 'unknown' });
      return;
    }

    // Sample pixels in mouth region looking for tongue (pinkish/reddish colors)
    const sampleSize = 5;
    let tonguePixels = 0;
    let totalSamples = 0;
    let tonguePositions = { top: 0, middle: 0, bottom: 0 };

    for (let x = mouthCenterX - mouthWidth / 3; x < mouthCenterX + mouthWidth / 3; x += sampleSize) {
      for (let y = mouthCenterY - mouthHeight / 3; y < mouthCenterY + mouthHeight / 3; y += sampleSize) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const r = pixel[0], g = pixel[1], b = pixel[2];

          // Detect tongue color (pink/red hues, with R > G > B pattern)
          if (r > 120 && r > g && g > b && r - g < 80 && r - g > 20) {
            tonguePixels++;
            
            // Determine vertical position
            const relativeY = (y - (mouthCenterY - mouthHeight / 3)) / (mouthHeight * 2 / 3);
            if (relativeY < 0.33) tonguePositions.top++;
            else if (relativeY < 0.67) tonguePositions.middle++;
            else tonguePositions.bottom++;
          }
          totalSamples++;
        }
      }
    }

    const tongueVisibility = tonguePixels / totalSamples;
    const visible = tongueVisibility > 0.1;

    let position = 'unknown';
    if (visible) {
      const max = Math.max(tonguePositions.top, tonguePositions.middle, tonguePositions.bottom);
      if (max === tonguePositions.top) position = 'raised';
      else if (max === tonguePositions.middle) position = 'middle';
      else position = 'lowered';
    }

    setTongueData({
      visible,
      position,
      confidence: tongueVisibility
    });
  };

  const getTongueGuidance = (phoneme) => {
    if (!phoneme) return null;

    const letter = phoneme.letter?.toLowerCase() || '';
    const phonetic = phoneme.phonetic?.toLowerCase() || '';

    // Tongue position requirements for different sounds
    if (['t', 'd', 'n', 'l'].includes(letter)) {
      return { position: 'raised', tip: 'Touch tongue tip to roof of mouth behind teeth' };
    }
    if (['k', 'g'].includes(letter)) {
      return { position: 'raised', tip: 'Raise back of tongue to soft palate' };
    }
    if (['th'].some(p => letter.includes(p))) {
      return { position: 'middle', tip: 'Place tongue tip between teeth' };
    }
    if (['r'].includes(letter)) {
      return { position: 'raised', tip: 'Curl tongue tip up slightly, don\'t touch roof' };
    }
    if (['s', 'z'].includes(letter)) {
      return { position: 'raised', tip: 'Tongue tip near upper teeth, create narrow channel' };
    }
    if (['a', 'ah', 'aa'].some(p => phonetic.includes(p))) {
      return { position: 'lowered', tip: 'Keep tongue low and flat in mouth' };
    }
    if (['ee', 'i'].some(p => phonetic.includes(p))) {
      return { position: 'raised', tip: 'Raise front of tongue close to roof' };
    }

    return { position: 'middle', tip: 'Neutral tongue position' };
  };

  const guidance = getTongueGuidance(targetPhoneme);

  const checkTonguePosition = () => {
    if (!tongueData || !tongueData.visible || !guidance) {
      return { status: 'unknown', message: 'Open mouth wider to detect tongue' };
    }

    if (tongueData.position === guidance.position) {
      return { status: 'correct', message: 'Perfect tongue placement!' };
    }

    if (guidance.position === 'raised' && tongueData.position !== 'raised') {
      return { status: 'incorrect', message: 'Raise your tongue higher' };
    }
    if (guidance.position === 'lowered' && tongueData.position !== 'lowered') {
      return { status: 'incorrect', message: 'Lower your tongue more' };
    }

    return { status: 'partial', message: 'Adjust tongue position slightly' };
  };

  const positionCheck = checkTonguePosition();

  return (
    <div className="space-y-4">
      {/* Hidden canvas for pixel analysis */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="hidden"
      />

      {/* Tongue Guidance */}
      {guidance && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {positionCheck.status === 'correct' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {positionCheck.status === 'incorrect' && <AlertCircle className="h-5 w-5 text-amber-600" />}
                {positionCheck.status === 'unknown' && <Info className="h-5 w-5 text-slate-400" />}
                <p className="font-semibold text-orange-900">Tongue Position</p>
              </div>

              <p className="text-sm text-slate-700">{guidance.tip}</p>

              {tongueData?.visible && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Detected:</span>
                    <span className="font-semibold text-orange-900 capitalize">
                      {tongueData.position}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600">Target:</span>
                    <span className="font-semibold text-blue-900 capitalize">
                      {guidance.position}
                    </span>
                  </div>
                </div>
              )}

              {!mouthMetrics?.isOpen && (
                <p className="text-xs text-slate-500 italic mt-2">
                  Open your mouth to enable tongue tracking
                </p>
              )}

              <p className={`text-sm font-medium mt-2 ${
                positionCheck.status === 'correct' ? 'text-green-700' :
                positionCheck.status === 'incorrect' ? 'text-amber-700' :
                'text-slate-600'
              }`}>
                {positionCheck.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Tongue Position Diagram */}
      {guidance && (
        <Card className="border-2 border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm text-center text-slate-600 mb-3">Target Tongue Position</p>
            <div className="relative h-32 bg-gradient-to-b from-pink-100 to-pink-50 rounded-lg border-2 border-slate-300 overflow-hidden">
              {/* Mouth outline */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 right-0 h-2 bg-slate-300" /> {/* Upper teeth/palate */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-300" /> {/* Lower teeth */}
              </div>

              {/* Tongue position indicator */}
              <div className={`absolute left-1/2 -translate-x-1/2 w-20 h-8 bg-pink-400 rounded-full transition-all duration-300 ${
                guidance.position === 'raised' ? 'top-2' :
                guidance.position === 'lowered' ? 'bottom-6' :
                'top-1/2 -translate-y-1/2'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">TONGUE</span>
                </div>
              </div>

              {/* Position labels */}
              <div className="absolute top-4 right-4 text-xs text-slate-600">↑ Raised</div>
              <div className="absolute bottom-4 right-4 text-xs text-slate-600">↓ Lowered</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}