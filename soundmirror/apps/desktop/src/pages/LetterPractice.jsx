/**
 * LetterPractice Page - Individual phoneme/letter practice
 * Isolated articulation for each sound
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Volume2 } from 'lucide-react';
import DualHeadAnimator from '../components/practice/DualHeadAnimator';

// IPA phonemes with descriptions (from the phonemes.pdf mapping)
const PHONEMES = [
  { id: 'a', ipa: '/a/', name: 'ah', example: 'father', description: 'Open mouth, tongue low' },
  { id: 'i', ipa: '/i/', name: 'ee', example: 'see', description: 'Lips spread, tongue high front' },
  { id: 'u', ipa: '/u/', name: 'oo', example: 'food', description: 'Lips rounded, tongue high back' },
  { id: 'e', ipa: '/ɛ/', name: 'eh', example: 'bed', description: 'Mouth half-open, tongue mid' },
  { id: 'o', ipa: '/o/', name: 'oh', example: 'go', description: 'Lips rounded, tongue mid back' },
  { id: 'p', ipa: '/p/', name: 'puh', example: 'pat', description: 'Lips closed, then burst open' },
  { id: 't', ipa: '/t/', name: 'tuh', example: 'top', description: 'Tongue touches ridge behind teeth' },
  { id: 'd', ipa: '/d/', name: 'duh', example: 'dog', description: 'Same as /t/ but voiced' },
  { id: 'k', ipa: '/k/', name: 'kuh', example: 'cat', description: 'Back of tongue touches soft palate' },
  { id: 'g', ipa: '/g/', name: 'guh', example: 'go', description: 'Same as /k/ but voiced' },
  { id: 'n', ipa: '/n/', name: 'nnn', example: 'no', description: 'Tongue tip at ridge, air through nose' },
  { id: 'ŋ', ipa: '/ŋ/', name: 'ng', example: 'sing', description: 'Back tongue raised, nasal' },
  { id: 's', ipa: '/s/', name: 'sss', example: 'see', description: 'Tongue near ridge, hissing' },
  { id: 'ʃ', ipa: '/ʃ/', name: 'sh', example: 'ship', description: 'Lips slightly rounded, tongue back' },
  { id: 'θ', ipa: '/θ/', name: 'th', example: 'think', description: 'Tongue between teeth' },
  { id: 'f', ipa: '/f/', name: 'fff', example: 'fan', description: 'Lower lip touches upper teeth' },
  { id: 'h', ipa: '/h/', name: 'huh', example: 'hat', description: 'Open breath, no obstruction' },
  { id: 'tʃ', ipa: '/tʃ/', name: 'ch', example: 'chair', description: 'Start like /t/, release like /ʃ/' },
  { id: 'r', ipa: '/r/', name: 'rrr', example: 'red', description: 'Tongue curled back slightly' },
  { id: 'l', ipa: '/l/', name: 'lll', example: 'lip', description: 'Tongue tip at ridge, air around sides' },
];

export default function LetterPractice() {
  const navigate = useNavigate();
  const [selectedPhoneme, setSelectedPhoneme] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePhonemeSelect = (phoneme) => {
    setSelectedPhoneme(phoneme);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    
    // Speak the example word
    if ('speechSynthesis' in window && selectedPhoneme) {
      const utterance = new SpeechSynthesisUtterance(selectedPhoneme.example);
      utterance.rate = 0.5;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Letter Practice</h1>
            <p className="text-slate-500">Learn individual phoneme articulations</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Phoneme Grid */}
          <div className="lg:col-span-5">
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Select a Sound
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {PHONEMES.map((phoneme) => (
                  <button
                    key={phoneme.id}
                    onClick={() => handlePhonemeSelect(phoneme)}
                    className={`
                      p-3 rounded-xl text-center transition-all duration-200 focus-ring
                      ${selectedPhoneme?.id === phoneme.id
                        ? 'bg-sky-500/20 border-2 border-sky-400 text-sky-300'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                      }
                    `}
                    data-testid={`phoneme-btn-${phoneme.id}`}
                  >
                    <div className="text-lg font-mono">{phoneme.ipa}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{phoneme.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-7">
            {selectedPhoneme ? (
              <div className="glass-card p-6">
                {/* Phoneme Info */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-mono text-sky-400">{selectedPhoneme.ipa}</span>
                      <span className="text-2xl text-slate-300">"{selectedPhoneme.name}"</span>
                    </div>
                    <p className="text-slate-400 mt-2">
                      As in: <span className="text-slate-200 font-medium">{selectedPhoneme.example}</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="btn-glow flex items-center gap-2"
                    data-testid="play-phoneme-btn"
                  >
                    {isPlaying ? (
                      <Volume2 className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    {isPlaying ? 'Playing...' : 'Play Sound'}
                  </button>
                </div>

                {/* Animator */}
                <DualHeadAnimator
                  phonemeSequence={[selectedPhoneme.id]}
                  isPlaying={isPlaying}
                  playbackRate={0.5}
                  frameDuration={150}
                  onAnimationComplete={() => setIsPlaying(false)}
                  maxWidth={500}
                />

                {/* Articulation Tip */}
                <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-1">Articulation Tip</h4>
                  <p className="text-slate-300">{selectedPhoneme.description}</p>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Select a Sound</h3>
                <p className="text-slate-500">
                  Choose a phoneme from the grid to see its articulation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
