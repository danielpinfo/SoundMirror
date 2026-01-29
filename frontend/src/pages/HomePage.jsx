import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES, getTranslation } from '../i18n/translations';

export default function HomePage({ language, setLanguage }) {
  const navigate = useNavigate();
  const [inputWord, setInputWord] = useState('');
  const t = (key) => getTranslation(language, key);

  const practiceWords = [
    t('hello'), t('goodbye'), t('please'), t('thankYou'),
    t('sorry'), t('yes'), t('no'), t('water'),
  ];
  const phrases = [t('goodMorning'), t('howAreYou')];

  const handleWordSubmit = (e) => {
    e.preventDefault();
    if (inputWord.trim()) {
      navigate(`/practice?word=${encodeURIComponent(inputWord.trim())}`);
    }
  };

  const handleWordClick = (word) => {
    navigate(`/practice?word=${encodeURIComponent(word)}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a1628 0%, #0f2744 50%, #1a365d 100%)',
      color: '#e2e8f0',
      padding: '32px 24px',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#e2e8f0',
            margin: 0,
            letterSpacing: '-1px',
          }}>
            SoundMirror
          </h1>
          <p style={{
            fontSize: 14,
            color: '#64748b',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginTop: 4,
          }}>
            {t('tagline')}
          </p>
        </div>

        {/* Language Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '10px 20px',
              fontSize: 15,
              borderRadius: 8,
              border: '1px solid #2d4a6f',
              backgroundColor: '#0f2744',
              color: '#e2e8f0',
              cursor: 'pointer',
              minWidth: 180,
            }}
          >
            {Object.values(LANGUAGES).map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div style={{
          textAlign: 'center',
          marginBottom: 32,
          padding: '0 20px',
        }}>
          <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
            {t('description')}
          </p>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.5 }}>
            {t('howToUse')}
          </p>
        </div>

        {/* Word Input */}
        <form onSubmit={handleWordSubmit} style={{ marginBottom: 32 }}>
          <div style={{
            display: 'flex',
            gap: 12,
            padding: 16,
            backgroundColor: 'rgba(15, 39, 68, 0.8)',
            borderRadius: 12,
            border: '1px solid #2d4a6f',
          }}>
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder={t('enterWord')}
              style={{
                flex: 1,
                padding: '14px 18px',
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #2d4a6f',
                backgroundColor: '#0a1628',
                color: '#e2e8f0',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#3b82f6',
                color: '#fff',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {t('play')} →
            </button>
          </div>
        </form>

        {/* Practice Words */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{
            fontSize: 13,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            {t('practiceWords')}
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
          }}>
            {practiceWords.map((word) => (
              <button
                key={word}
                onClick={() => handleWordClick(word)}
                style={{
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: '1px solid #2d4a6f',
                  backgroundColor: '#0f2744',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {word}
              </button>
            ))}
          </div>
          {/* Phrases */}
          <div style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            marginTop: 12,
          }}>
            {phrases.map((phrase) => (
              <button
                key={phrase}
                onClick={() => handleWordClick(phrase)}
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: '1px solid #3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          <button
            onClick={() => navigate('/letters')}
            style={{
              padding: '20px 16px',
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 12,
              border: '1px solid #2d4a6f',
              backgroundColor: '#0f2744',
              color: '#e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📖 {t('letterPractice')}
          </button>
          <button
            onClick={() => navigate('/history')}
            style={{
              padding: '20px 16px',
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 12,
              border: '1px solid #2d4a6f',
              backgroundColor: '#0f2744',
              color: '#e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📚 {t('historyLibrary')}
          </button>
          <button
            onClick={() => navigate('/feedback')}
            style={{
              padding: '20px 16px',
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 12,
              border: '1px solid #2d4a6f',
              backgroundColor: '#0f2744',
              color: '#e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🐛 {t('reportBug')}
          </button>
        </div>
      </div>
    </div>
  );
}
