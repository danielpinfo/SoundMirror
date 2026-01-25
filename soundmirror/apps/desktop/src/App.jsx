import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Practice from './pages/Practice';
import LetterPractice from './pages/LetterPractice';
import HistoryProgress from './pages/HistoryProgress';
import BugReporter from './pages/BugReporter';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/letters" element={<LetterPractice />} />
          <Route path="/history" element={<HistoryProgress />} />
          <Route path="/report" element={<BugReporter />} />
        </Routes>
      </Layout>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0F172A',
            border: '1px solid #334155',
            color: '#F8FAFC',
          },
        }}
      />
    </>
  );
}

export default App;
