import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import LetterPracticePage from './pages/LetterPracticePage';
import WordPracticePage from './pages/WordPracticePage';
import HistoryPage from './pages/HistoryPage';
import BugReportPage from './pages/BugReportPage';
import { Toaster } from './components/ui/sonner';
import './index.css';

const AppContent = () => {
  const location = useLocation();
  // ALWAYS show splash on home page - every refresh/load
  const [showSplash, setShowSplash] = useState(location.pathname === '/');

  const handleSplashComplete = () => {
    setShowSplash(false);
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
        <Route path="/reports" element={<Navigate to="/history" replace />} />
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
