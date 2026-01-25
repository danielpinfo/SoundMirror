import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedMouth from './AnimatedMouth';

/**
 * PhonemeTimelinePlayer - Plays back aligned phonemes with mouth animation
 * 
 * Shows the user's recorded audio synchronized with:
 * - Timeline showing phoneme segments
 * - Animated mouth for each phoneme
 * - Score indicators per phoneme
 */
export default function PhonemeTimelinePlayer({
  audioUrl,
  alignmentData, // { phonemes: [...], duration, rawPhones }
  targetPhonemes, // Expected phoneme sequence
  onPhonemeClick
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activePhonemeIndex, setActivePhonemeIndex] = useState(-1);
  const audioRef = useRef(null);
  const animationRef = useRef(null);

  const phonemes = alignmentData?.phonemes || [];
  const duration = alignmentData?.duration || 1;

  // Update current phoneme based on playback time
  useEffect(() => {
    if (!phonemes.length) return;
    
    const idx = phonemes.findIndex((p, i) => {
      const next = phonemes[i + 1];
      return currentTime >= p.start && currentTime < (next?.start || p.end + 0.1);
    });
    
    setActivePhonemeIndex(idx >= 0 ? idx : -1);
  }, [currentTime, phonemes]);

  const handlePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current);
    } else {
      audioRef.current.play();
      updateTime();
    }
    setIsPlaying(!isPlaying);
  };

  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!audioRef.current.paused) {
        animationRef.current = requestAnimationFrame(updateTime);
      }
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    cancelAnimationFrame(animationRef.current);
  };

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const getScoreColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreBorder = (confidence) => {
    if (confidence >= 0.8) return 'border-green-400';
    if (confidence >= 0.5) return 'border-amber-400';
    return 'border-red-400';
  };

  const activePhoneme = activePhonemeIndex >= 0 ? phonemes[activePhonemeIndex] : null;

  return null;
}