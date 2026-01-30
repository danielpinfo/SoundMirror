import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import LetterPracticePage from './pages/LetterPracticePage';
import WordPracticePage from './pages/WordPracticePage';
import HistoryPage from './pages/HistoryPage';
import BugReportPage from './pages/BugReportPage';
import { Toaster } from './components/ui/sonner';
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Preload resources while splash is showing
  useEffect(() => {
    const preloadResources = async () => {
      // Simulate resource loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppReady(true);
    };
    preloadResources();
  }, []);

  const handleSplashComplete = () => {
    if (appReady) {
      setShowSplash(false);
    } else {
      // Wait for app to be ready
      const checkReady = setInterval(() => {
        if (appReady) {
          clearInterval(checkReady);
          setShowSplash(false);
        }
      }, 100);
    }
  };

  return (
    <LanguageProvider>
      <div className="App">
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
        
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/letter-practice" element={<LetterPracticePage />} />
            <Route path="/word-practice" element={<WordPracticePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/bug-report" element={<BugReportPage />} />
          </Routes>
        </BrowserRouter>
        
        <Toaster position="top-right" />
      </div>
    </LanguageProvider>
  );
}

export default App;
