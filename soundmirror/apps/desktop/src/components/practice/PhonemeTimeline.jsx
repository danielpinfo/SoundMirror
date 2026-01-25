/**
 * PhonemeTimeline - Horizontal scrollable timeline showing phoneme sequence
 * Highlights current phoneme during playback
 * Shows match/miss status after practice
 */

import React, { useRef, useEffect } from 'react';

export default function PhonemeTimeline({
  phonemes = [],
  currentIndex = 0,
  results = null, // { index: 'match' | 'miss' | null }
  onPhonemeClick = null,
  showIPA = true,
}) {
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  // Auto-scroll to keep active phoneme visible
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      
      // Check if active element is outside visible area
      if (activeRect.left < containerRect.left || activeRect.right > containerRect.right) {
        active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentIndex]);

  if (!phonemes.length) {
    return (
      <div className="text-center py-4 text-slate-500 text-sm">
        No phonemes to display
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="timeline-track"
      data-testid="phoneme-timeline"
    >
      {phonemes.map((phoneme, index) => {
        const isActive = index === currentIndex;
        const result = results?.[index];
        
        let statusClass = '';
        if (result === 'match') statusClass = 'matched';
        else if (result === 'miss') statusClass = 'missed';
        else if (isActive) statusClass = 'active';

        return (
          <button
            key={`${phoneme.phoneme || phoneme}-${index}`}
            ref={isActive ? activeRef : null}
            onClick={() => onPhonemeClick?.(index, phoneme)}
            className={`
              phoneme-badge flex-shrink-0 min-w-[60px]
              ${statusClass}
              ${onPhonemeClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
              focus-ring
            `}
            data-testid={`phoneme-${index}`}
            disabled={!onPhonemeClick}
          >
            <div className="flex flex-col items-center gap-0.5">
              {/* Letter representation */}
              <span className="text-sm font-semibold">
                {phoneme.letter || phoneme}
              </span>
              
              {/* IPA symbol */}
              {showIPA && phoneme.phoneme && (
                <span className="text-[10px] opacity-70">
                  /{phoneme.phoneme}/
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
