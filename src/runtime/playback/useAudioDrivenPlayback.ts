import { useEffect, useState } from 'react';
import { AudioPlayer } from '@/runtime/audio/AudioPlayer.js';

export function useAudioDrivenPlayback(audioUrl: string | null){
  const [player] = useState(()=> new AudioPlayer());
  useEffect(()=>{ player.setSource(audioUrl||null); },[audioUrl]);
  return player;
}