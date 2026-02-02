import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import LetterPracticePage from './pages/LetterPracticePage';
import WordPracticePage from './pages/WordPracticePage';
import HistoryPage from './pages/HistoryPage';
import BugReportPage from './pages/BugReportPage';
import PathologistPage from './pages/PathologistPage';
import { Toaster } from './components/ui/sonner';
import './index.css';

// Check if splash was already shown this session
const SPLASH_SHOWN_KEY = 'soundmirror_splash_shown';

const AppContent = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on home page and if not shown this session
    const wasShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);
    return location.pathname === '/' && !wasShown;
  });
  const [appReady, setAppReady] = useState(false);

  // Preload resources while splash is showing
  useEffect(() => {
    const preloadResources = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppReady(true);
    };
    preloadResources();
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    if (appReady) {
      setShowSplash(false);
    } else {
      const checkReady = setInterval(() => {
        if (appReady) {
          clearInterval(checkReady);
          setShowSplash(false);
        }
      }, 100);
    }
  };

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/letter-practice" element={<LetterPracticePage />} />
        <Route path="/word-practice" element={<WordPracticePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/bug-report" element={<BugReportPage />} />
        <Route path="/pathologist" element={<PathologistPage />} />
        <Route path="/clients" element={<ClientsPage />} />
      </Routes>
      
      <Toaster position="top-right" />
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;
