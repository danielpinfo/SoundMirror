import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranslation } from '../i18n/translations';

export default function HistoryPage({ language }) {
  const navigate = useNavigate();
  const t = (key) => getTranslation(language, key);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('soundmirror_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Filter history
  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(h => h.type === filter);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('soundmirror_history', JSON.stringify(updated));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soundmirror-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a1628 0%, #0f2744 100%)',
      color: '#e2e8f0',
      padding: '24px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate('/')} style={navBtnStyle}>
            ← {t('backHome')}
          </button>
          <button onClick={() => navigate('/letters')} style={navBtnStyle}>
            {t('letterPractice')}
          </button>
          <button onClick={() => navigate('/practice?word=hello')} style={navBtnStyle}>
            {t('wordPractice')}
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>📚 {t('historyLibrary')}</h1>
          <p style={{ color: '#64748b', marginTop: 8 }}>
            {history.length} practice sessions recorded
          </p>
        </div>

        {/* Filters and Export */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          padding: 16,
          backgroundColor: 'rgba(15, 39, 68, 0.6)',
          borderRadius: 12,
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'letter', 'word'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  borderRadius: 6,
                  border: filter === f ? '1px solid #3b82f6' : '1px solid #2d4a6f',
                  backgroundColor: filter === f ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: filter === f ? '#60a5fa' : '#94a3b8',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid #2d4a6f',
              backgroundColor: '#0f2744',
              color: '#e2e8f0',
              cursor: 'pointer',
            }}
          >
            📥 Export Data
          </button>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 60,
            backgroundColor: 'rgba(15, 39, 68, 0.6)',
            borderRadius: 16,
            color: '#64748b',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div>No practice history yet.</div>
            <div style={{ marginTop: 8, fontSize: 14 }}>
              Start practicing to see your progress here!
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 20,
                  backgroundColor: 'rgba(15, 39, 68, 0.6)',
                  borderRadius: 12,
                  border: '1px solid #1e3a5f',
                }}
              >
                {/* Type Icon */}
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 10,
                  backgroundColor: '#1e3a5f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {item.type === 'letter' ? '🔤' : '📝'}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#60a5fa' }}>
                    {item.target || item.word}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    {formatDate(item.date)} • {item.language?.toUpperCase() || 'EN'}
                  </div>
                </div>

                {/* Scores */}
                <div style={{ display: 'flex', gap: 12 }}>
                  {item.visualScore !== undefined && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Visual</div>
                      <div style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: item.visualScore >= 0.85 ? '#10b981' : item.visualScore >= 0.7 ? '#f59e0b' : '#ef4444',
                      }}>
                        {Math.round(item.visualScore * 100)}%
                      </div>
                    </div>
                  )}
                  {item.audioScore !== undefined && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Audio</div>
                      <div style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: item.audioScore >= 0.85 ? '#10b981' : item.audioScore >= 0.7 ? '#f59e0b' : '#ef4444',
                      }}>
                        {Math.round(item.audioScore * 100)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => navigate(item.type === 'letter' ? '/letters' : `/practice?word=${item.target || item.word}`)}
                    style={{
                      padding: '8px 12px',
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid #2d4a6f',
                      backgroundColor: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    ▶ Replay
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: '8px 12px',
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid #ef4444',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const navBtnStyle = {
  padding: '10px 18px',
  fontSize: 14,
  fontWeight: 500,
  borderRadius: 8,
  border: '1px solid #2d4a6f',
  backgroundColor: '#0f2744',
  color: '#e2e8f0',
  cursor: 'pointer',
};
