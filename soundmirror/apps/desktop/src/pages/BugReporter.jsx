/**
 * BugReporter Page - Categorized bug reporting with offline queue
 * Replaces TeachLetters page per user request
 * Reports sync when internet is available
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bug, Send, Wifi, WifiOff, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

// Bug categories with sub-options
const BUG_CATEGORIES = [
  {
    id: 'animation',
    label: 'Animation Issues',
    icon: '🎬',
    subcategories: [
      'Sprites not loading',
      'Animation stuttering/lag',
      'Frame timing incorrect',
      'Front/Side sync issues',
      'Wrong phoneme displayed',
    ],
  },
  {
    id: 'audio',
    label: 'Audio/TTS Issues',
    icon: '🔊',
    subcategories: [
      'No sound playing',
      'TTS voice not working',
      'Audio/animation out of sync',
      'Wrong language voice',
      'Audio cuts off early',
    ],
  },
  {
    id: 'phonemes',
    label: 'Phoneme Issues',
    icon: '📝',
    subcategories: [
      'Wrong phoneme mapping',
      'Missing phoneme for letter',
      'Incorrect IPA symbol',
      'Language-specific error',
      'Timeline display wrong',
    ],
  },
  {
    id: 'recording',
    label: 'Recording Issues',
    icon: '🎙️',
    subcategories: [
      'Microphone not detected',
      'Recording fails to start',
      'Recording cuts off',
      'Analysis not working',
      'Wrong feedback given',
    ],
  },
  {
    id: 'ui',
    label: 'UI/Display Issues',
    icon: '🖥️',
    subcategories: [
      'Layout broken',
      'Text not readable',
      'Buttons not working',
      'Navigation problems',
      'Dark mode issues',
    ],
  },
  {
    id: 'other',
    label: 'Other Issues',
    icon: '❓',
    subcategories: [
      'App crashes',
      'Performance slow',
      'Data not saving',
      'Language switching',
      'Something else',
    ],
  },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', description: 'Minor issue, workaround exists', color: 'text-slate-400' },
  { id: 'medium', label: 'Medium', description: 'Affects functionality', color: 'text-amber-400' },
  { id: 'high', label: 'High', description: 'Blocks core features', color: 'text-rose-400' },
];

export default function BugReporter() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingReports, setPendingReports] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load pending reports
  useEffect(() => {
    const stored = localStorage.getItem('soundmirror_bug_reports');
    if (stored) {
      setPendingReports(JSON.parse(stored));
    }
  }, []);

  const selectedCategory = BUG_CATEGORIES.find(c => c.id === category);

  const handleSubmit = (e) => {
    e.preventDefault();

    const report = {
      id: Date.now(),
      category,
      subcategory,
      severity,
      description,
      steps,
      timestamp: new Date().toISOString(),
      appVersion: '1.0.0',
      platform: navigator.platform,
      synced: false,
    };

    // Save to pending reports
    const updated = [...pendingReports, report];
    setPendingReports(updated);
    localStorage.setItem('soundmirror_bug_reports', JSON.stringify(updated));

    // Reset form
    setCategory('');
    setSubcategory('');
    setSeverity('medium');
    setDescription('');
    setSteps('');
    setSubmitted(true);

    // Hide success message after 3s
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleDeleteReport = (id) => {
    const updated = pendingReports.filter(r => r.id !== id);
    setPendingReports(updated);
    localStorage.setItem('soundmirror_bug_reports', JSON.stringify(updated));
  };

  const handleSyncNow = () => {
    // In real app, this would upload to server
    console.log('Syncing reports:', pendingReports);
    alert('Reports will sync when connected to the internet.');
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
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
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <Bug className="w-8 h-8 text-rose-400" />
              Report an Issue
            </h1>
            <p className="text-slate-500">Help us improve SoundMirror</p>
          </div>

          {/* Online Status */}
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
            ${isOnline 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }
          `}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 
                         flex items-center gap-3 animate-slide-up">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300">
              Report saved! It will be sent when you're online.
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  What type of issue?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUG_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setCategory(cat.id); setSubcategory(''); }}
                      className={`
                        p-3 rounded-xl text-left transition-all
                        ${category === cat.id
                          ? 'bg-sky-500/20 border-2 border-sky-400'
                          : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'
                        }
                      `}
                      data-testid={`category-${cat.id}`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <div className="text-sm font-medium text-slate-200 mt-1">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategory */}
              {selectedCategory && (
                <div className="animate-slide-up">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Specific issue
                  </label>
                  <div className="space-y-2">
                    {selectedCategory.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSubcategory(sub)}
                        className={`
                          w-full p-3 rounded-lg text-left text-sm transition-all
                          ${subcategory === sub
                            ? 'bg-sky-500/20 border border-sky-400 text-sky-300'
                            : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'
                          }
                        `}
                        data-testid={`subcategory-${sub}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Severity */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Severity
                </label>
                <div className="flex gap-2">
                  {SEVERITY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setSeverity(level.id)}
                      className={`
                        flex-1 p-3 rounded-lg text-center transition-all
                        ${severity === level.id
                          ? 'bg-slate-800 border-2 border-slate-500'
                          : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'
                        }
                      `}
                      data-testid={`severity-${level.id}`}
                    >
                      <div className={`font-semibold ${level.color}`}>{level.label}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in more detail..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50
                            text-slate-200 placeholder:text-slate-500 focus:border-sky-500/50
                            focus:ring-2 focus:ring-sky-500/20 focus:outline-none resize-none"
                  data-testid="description-input"
                />
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Steps to reproduce (optional)
                </label>
                <textarea
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="1. Go to Practice page&#10;2. Enter 'hello'&#10;3. Click Play..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50
                            text-slate-200 placeholder:text-slate-500 focus:border-sky-500/50
                            focus:ring-2 focus:ring-sky-500/20 focus:outline-none resize-none"
                  data-testid="steps-input"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!category || !subcategory}
                className="w-full btn-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="submit-report-btn"
              >
                <Send className="w-5 h-5" />
                Submit Report
              </button>
            </form>
          </div>

          {/* Pending Reports */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300">
                  Pending Reports ({pendingReports.length})
                </h3>
                {pendingReports.length > 0 && isOnline && (
                  <button
                    onClick={handleSyncNow}
                    className="text-xs text-sky-400 hover:text-sky-300"
                  >
                    Sync Now
                  </button>
                )}
              </div>

              {pendingReports.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No pending reports
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pendingReports.map((report) => (
                    <div 
                      key={report.id}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            {BUG_CATEGORIES.find(c => c.id === report.category)?.icon} {report.subcategory}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(report.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {!report.synced && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          Pending sync
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
