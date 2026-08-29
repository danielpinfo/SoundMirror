import { useMemo } from 'react';
import type { TimelineEntry } from '@/runtime/audio/audioTypes';
export function usePlaybackFrame(tl: TimelineEntry[]|null, posMs: number){
  return useMemo(()=>{
    if(!tl||!tl.length) return { frame: 0, entryIdx: -1 };
    for(let i=0;i<tl.length;i++){ const e=tl[i]; if(posMs<e.endMs) return { frame: e.frame, entryIdx: i }; }
    return { frame: tl[tl.length-1].frame, entryIdx: tl.length-1 };
  },[tl,posMs]);
}