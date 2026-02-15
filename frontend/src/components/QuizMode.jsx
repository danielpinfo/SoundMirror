/**
 * PRONUNCIATION QUIZ MODE
 * 
 * Optional game mode: shows a phonetic rendering, user guesses the original word.
 * Activated by pressing a button — never starts automatically.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { textToPhonetic } from '../lib/phoneticDisplay';
import { useLanguage } from '../context/LanguageContext';

// Quiz word pools by difficulty
const QUIZ_WORDS = {
  easy: ['Hello', 'Yes', 'No', 'Please', 'Water', 'Food', 'Good', 'Help', 'Hi', 'Bye'],
  medium: ['Thank you', 'Fine', 'Morning', 'Night', 'Friend', 'Family', 'Happy', 'Love', 'Home', 'Time',
           'Nice', 'Go', 'Come', 'See', 'Say', 'Name', 'Day', 'Way', 'Life', 'Make'],
  hard: ["I'm fine", 'Good morning', 'How are you', 'Nice to meet you', 'See you later',
         'Thank you very much', 'My name', 'Right now', 'Five times', 'High five'],
};

const QuizMode = ({ onSelectWord, className = '' }) => {
  const { language } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [userGuess, setUserGuess] = useState('');
  const [result, setResult] = useState(null); // 'correct', 'wrong', null
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [difficulty, setDifficulty] = useState('easy');
  const [showHint, setShowHint] = useState(false);

  const allWords = useMemo(() => {
    return [...QUIZ_WORDS.easy, ...QUIZ_WORDS.medium, ...QUIZ_WORDS.hard];
  }, []);

  const wordPool = useMemo(() => {
    return QUIZ_WORDS[difficulty] || QUIZ_WORDS.easy;
  }, [difficulty]);

  const pickRandomWord = useCallback(() => {
    const pool = wordPool;
    const word = pool[Math.floor(Math.random() * pool.length)];
    setCurrentWord(word);
    setUserGuess('');
    setResult(null);
    setShowHint(false);
  }, [wordPool]);

  const startQuiz = useCallback(() => {
    setIsActive(true);
    setScore({ correct: 0, total: 0 });
    pickRandomWord();
  }, [pickRandomWord]);

  const stopQuiz = useCallback(() => {
    setIsActive(false);
    setCurrentWord(null);
    setUserGuess('');
    setResult(null);
  }, []);

  const checkAnswer = useCallback(() => {
    if (!currentWord || !userGuess.trim()) return;

    const isCorrect = userGuess.trim().toLowerCase() === currentWord.toLowerCase();
    setResult(isCorrect ? 'correct' : 'wrong');
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  }, [currentWord, userGuess]);

  const nextQuestion = useCallback(() => {
    pickRandomWord();
  }, [pickRandomWord]);

  const handlePracticeWord = useCallback(() => {
    if (currentWord && onSelectWord) {
      onSelectWord(currentWord);
    }
  }, [currentWord, onSelectWord]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (result) {
        nextQuestion();
      } else {
        checkAnswer();
      }
    }
  }, [result, checkAnswer, nextQuestion]);

  // Not active — show just the quiz button
  if (!isActive) {
    return (
      <button
        onClick={startQuiz}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all
          bg-gradient-to-r from-emerald-600/40 to-teal-600/40 
          border border-emerald-500/40 text-emerald-300
          hover:from-emerald-600/60 hover:to-teal-600/60 hover:border-emerald-400/60
          ${className}`}
        data-testid="quiz-mode-start-btn"
      >
        Quiz Mode
      </button>
    );
  }

  const phonetic = currentWord ? textToPhonetic(currentWord, language) : '';

  return (
    <div className="bg-cobalt-surface/80 border border-blue-500/20 rounded-xl p-4 space-y-3" data-testid="quiz-mode-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Quiz Mode</span>
          <span className="text-xs text-blue-300">
            Score: {score.correct}/{score.total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Difficulty selector */}
          {['easy', 'medium', 'hard'].map(d => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); pickRandomWord(); }}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                difficulty === d
                  ? 'bg-blue-600/50 text-white'
                  : 'text-blue-400/60 hover:text-blue-300'
              }`}
              data-testid={`quiz-difficulty-${d}`}
            >
              {d}
            </button>
          ))}
          <button
            onClick={stopQuiz}
            className="text-xs text-red-400/60 hover:text-red-300 ml-2"
            data-testid="quiz-mode-stop-btn"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Phonetic Display */}
      {currentWord && (
        <div className="text-center py-3">
          <p className="text-xs text-blue-400/60 mb-1">What word sounds like this?</p>
          <p className="text-2xl font-bold text-cyan-300 font-mono tracking-wide" data-testid="quiz-phonetic-display">
            {phonetic}
          </p>
          {showHint && (
            <p className="text-xs text-yellow-400/60 mt-1" data-testid="quiz-hint">
              Hint: {currentWord.length} letters, starts with "{currentWord[0]}"
            </p>
          )}
        </div>
      )}

      {/* Input + Actions */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userGuess}
          onChange={(e) => setUserGuess(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your guess..."
          className="flex-1 bg-cobalt-bg/60 border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-400/40 focus:outline-none focus:border-blue-400/50"
          disabled={!!result}
          data-testid="quiz-guess-input"
        />
        {!result ? (
          <>
            <button
              onClick={checkAnswer}
              disabled={!userGuess.trim()}
              className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white text-sm rounded-lg transition-colors disabled:opacity-30"
              data-testid="quiz-check-btn"
            >
              Check
            </button>
            <button
              onClick={() => setShowHint(true)}
              className="px-3 py-2 text-yellow-400/60 hover:text-yellow-300 text-sm"
              data-testid="quiz-hint-btn"
            >
              Hint
            </button>
          </>
        ) : (
          <button
            onClick={nextQuestion}
            className="px-4 py-2 bg-emerald-600/50 hover:bg-emerald-600/70 text-white text-sm rounded-lg transition-colors"
            data-testid="quiz-next-btn"
          >
            Next
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className={`text-center py-2 rounded-lg ${
          result === 'correct'
            ? 'bg-emerald-500/10 border border-emerald-500/30'
            : 'bg-red-500/10 border border-red-500/30'
        }`} data-testid="quiz-result">
          {result === 'correct' ? (
            <p className="text-emerald-400 font-medium">Correct! "{currentWord}" = {phonetic}</p>
          ) : (
            <div>
              <p className="text-red-400 font-medium">
                Not quite. The answer is: <span className="text-white">"{currentWord}"</span>
              </p>
              <button
                onClick={handlePracticeWord}
                className="text-xs text-blue-400 hover:text-blue-300 mt-1 underline"
                data-testid="quiz-practice-word-btn"
              >
                Practice this word
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizMode;
