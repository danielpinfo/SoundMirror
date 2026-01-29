import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranslation } from '../i18n/translations';

export default function FeedbackPage({ language }) {
  const navigate = useNavigate();
  const t = (key) => getTranslation(language, key);

  const [form, setForm] = useState({
    platform: '',
    page: '',
    severity: '',
    featureArea: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Store feedback locally (could be sent to server)
    const feedback = {
      ...form,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language,
    };
    
    const existing = JSON.parse(localStorage.getItem('soundmirror_feedback') || '[]');
    existing.push(feedback);
    localStorage.setItem('soundmirror_feedback', JSON.stringify(existing));
    
    setSubmitted(true);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a1628 0%, #0f2744 100%)',
        color: '#e2e8f0',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>✅</div>
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>Thank You!</h2>
          <p style={{ color: '#94a3b8', marginBottom: 32 }}>
            Your feedback has been recorded.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '14px 32px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#3b82f6',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a1628 0%, #0f2744 100%)',
      color: '#e2e8f0',
      padding: '24px',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Navigation */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate('/')} style={navBtnStyle}>
            ← {t('backHome')}
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>🐛 {t('reportBug')}</h1>
          <p style={{ color: '#64748b', marginTop: 8 }}>
            Help us improve SoundMirror
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'rgba(15, 39, 68, 0.6)',
          borderRadius: 16,
          padding: 32,
        }}>
          {/* Platform */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
              Platform
            </label>
            <select
              value={form.platform}
              onChange={(e) => handleChange('platform', e.target.value)}
              required
              style={selectStyle}
            >
              <option value="">Select platform...</option>
              <option value="windows">Windows</option>
              <option value="mac">macOS</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="web">Web Browser</option>
            </select>
          </div>

          {/* Page */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
              Page
            </label>
            <select
              value={form.page}
              onChange={(e) => handleChange('page', e.target.value)}
              required
              style={selectStyle}
            >
              <option value="">Select page...</option>
              <option value="home">Home</option>
              <option value="letter">Letter Practice</option>
              <option value="word">Word Practice</option>
              <option value="history">History Library</option>
            </select>
          </div>

          {/* Severity */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
              Severity Level
            </label>
            <select
              value={form.severity}
              onChange={(e) => handleChange('severity', e.target.value)}
              required
              style={selectStyle}
            >
              <option value="">Select severity...</option>
              <option value="critical">Critical - App crashes</option>
              <option value="high">High - Feature broken</option>
              <option value="medium">Medium - Works but has issues</option>
              <option value="low">Low - Minor annoyance</option>
              <option value="suggestion">Suggestion - Feature request</option>
            </select>
          </div>

          {/* Feature Area */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
              Feature Area
            </label>
            <select
              value={form.featureArea}
              onChange={(e) => handleChange('featureArea', e.target.value)}
              required
              style={selectStyle}
            >
              <option value="">Select area...</option>
              <option value="animation">Animation</option>
              <option value="recording">Recording</option>
              <option value="grading">Grading</option>
              <option value="audio">Audio Playback</option>
              <option value="ui">User Interface</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              rows={5}
              placeholder="Please describe the issue in detail..."
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 15,
                borderRadius: 8,
                border: '1px solid #2d4a6f',
                backgroundColor: '#0a1628',
                color: '#e2e8f0',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#3b82f6',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Submit Feedback
          </button>
        </form>
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

const selectStyle = {
  width: '100%',
  padding: '14px 16px',
  fontSize: 15,
  borderRadius: 8,
  border: '1px solid #2d4a6f',
  backgroundColor: '#0a1628',
  color: '#e2e8f0',
  outline: 'none',
  cursor: 'pointer',
};
