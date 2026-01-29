import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components
import SplashScreen from './components/core/SplashScreen';

// Pages
import HomePage from './pages/HomePage';
import LetterPracticePage from './pages/LetterPracticePage';
import WordPracticePage from './pages/WordPracticePage';
import HistoryPage from './pages/HistoryPage';
import FeedbackPage from './pages/FeedbackPage';

// Styles
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash once per session
    return !sessionStorage.getItem('soundmirror_splash_shown');
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('soundmirror_language') || 'en';
  });

  // Save language preference
  useEffect(() => {
    localStorage.setItem('soundmirror_language', language);
  }, [language]);

  // Handle splash completion
  const handleSplashComplete = () => {
    sessionStorage.setItem('soundmirror_splash_shown', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage language={language} setLanguage={setLanguage} />} />
        <Route path="/letters" element={<LetterPracticePage language={language} />} />
        <Route path="/practice" element={<WordPracticePage language={language} />} />
        <Route path="/history" element={<HistoryPage language={language} />} />
        <Route path="/feedback" element={<FeedbackPage language={language} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
