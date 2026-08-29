import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils/pageUtils';
import { ArrowLeft, Mic, GraduationCap, TrendingUp, HardDrive } from 'lucide-react';
import { PracticeArchive } from '../components/analysis/PracticeArchive';
import SessionRow from '../components/history/SessionRow';
import ProgressChart from '../components/history/ProgressChart';
import CurriculumHistory from '../components/history/CurriculumHistory';
import ArchivesList from '../components/history/ArchivesList';
import StorageBanner from '../components/history/StorageBanner';
import PracticeAttemptReview from '../components/history/PracticeAttemptReview';
import { useLanguage } from '../components/i18n/LanguageContext';
import { usePlugin } from '../components/core/PluginContext';
import { useLearningContext } from '../components/core/LearningContext';

const archive = new PracticeArchive();
const CYAN = '#00bcd4';
const COBALT = '#0a3d6b';
const PILL_STYLE = { background: CYAN, color: COBALT, border: '1.5px solid #f5c518' };

const TAB_IDS = [
  { id: 'sessions',   icon: Mic },
  { id: 'curriculum', icon: GraduationCap },
  { id: 'progress',   icon: TrendingUp },
  { id: 'archives',   icon: HardDrive },
];

export default function HistoryLibrary() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { activePracticePackId } = usePlugin();
  const { setPracticeLanguage } = useLearningContext();
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const loadSessions = useCallback(() => {
    setSessions(archive.listSessions());
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleDelete = (id) => {
    archive.deleteSession(id);
    loadSessions();
  };

  const handleOpen = async (session) => {
    const restored = archive.loadSession(session.id);
    if (!restored) return;

    const videoBlob = restored.videoStored
      ? await archive.loadVideoBlob(session.id)
      : null;

    setSelectedSession({ ...restored, videoBlob });
  };

  const handlePracticeAgain = (session) => {
    if (session.packId === activePracticePackId) {
      const restored = archive.loadSession(session.id, activePracticePackId);
      if (!restored) return;
      navigate(`${createPageUrl('Practice')}?word=${encodeURIComponent(restored.word)}`);
      return;
    }

    const confirmed = window.confirm(`This saved practice belongs to ${session.language}. Switch to that language and practice it again?`);
    if (!confirmed) return;

    if (session.languageCode) {
      setPracticeLanguage(session.languageCode);
    }
    navigate(`${createPageUrl('Practice')}?word=${encodeURIComponent(session.word)}`);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(to bottom, #0a1628 0%, #0d2447 35%, #0a3d6b 70%, #0a6e8a 100%)' }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="p-3 rounded-lg transition-all hover:brightness-110 active:scale-95"
            style={PILL_STYLE}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: COBALT }} />
          </button>
          <h1 className="text-3xl font-bold" style={{ color: CYAN }}>{t('historyLibrary.title')}</h1>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TAB_IDS.map(({ id, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
                style={active
                  ? { background: CYAN, color: COBALT, border: '2px solid #f5c518' }
                  : { background: 'rgba(0,188,212,0.1)', color: CYAN, border: '2px solid rgba(0,188,212,0.3)' }
                }
              >
                <Icon className="w-4 h-4" />
                {t(`historyLibrary.tabs.${id}`)}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,188,212,0.2)' }}>
          <StorageBanner />

          {selectedSession ? (
            <PracticeAttemptReview
              session={selectedSession}
              currentPackId={activePracticePackId}
              onBack={() => setSelectedSession(null)}
              onPracticeAgain={handlePracticeAgain}
            />
          ) : (
            <div>
              {activeTab === 'sessions' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold" style={{ color: CYAN }}>{t('historyLibrary.allAttempts')}</h2>
                    <span className="text-sm" style={{ color: '#888' }}>{sessions.length} {t('historyLibrary.sessions')}</span>
                  </div>
                  {sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="mb-4" style={{ color: '#666' }}>{t('historyLibrary.noSessions')}</p>
                      <button
                        onClick={() => navigate(createPageUrl('Practice'))}
                        className="px-6 py-2.5 rounded-lg font-semibold transition-all hover:brightness-110"
                        style={PILL_STYLE}
                      >
                        {t('historyLibrary.startPracticing')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {sessions.map(s => (
                        <SessionRow key={s.id} session={s} onDelete={handleDelete} onPlay={handleOpen} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div>
                  <h2 className="text-lg font-bold mb-4" style={{ color: CYAN }}>{t('historyLibrary.curriculumProgress')}</h2>
                  <CurriculumHistory />
                </div>
              )}

              {activeTab === 'progress' && (
                <div>
                  <h2 className="text-lg font-bold mb-4" style={{ color: CYAN }}>{t('historyLibrary.scoreOverTime')}</h2>
                  <ProgressChart sessions={sessions} />
                </div>
              )}

              {activeTab === 'archives' && (
                <div>
                  <h2 className="text-lg font-bold mb-4" style={{ color: CYAN }}>Archives</h2>
                  <ArchivesList />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
