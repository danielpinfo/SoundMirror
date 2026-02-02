import { openDB } from 'idb';

const DB_NAME = 'soundmirror-db';
const DB_VERSION = 2; // Upgraded for new features

// Initialize the database
export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // Practice sessions store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionsStore.createIndex('timestamp', 'timestamp');
        sessionsStore.createIndex('type', 'sessionType');
        sessionsStore.createIndex('language', 'language');
        sessionsStore.createIndex('clientId', 'clientId');
      }
      
      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      
      // Clients store (new in v2)
      if (!db.objectStoreNames.contains('clients')) {
        const clientsStore = db.createObjectStore('clients', { keyPath: 'id' });
        clientsStore.createIndex('name', 'name');
        clientsStore.createIndex('createdAt', 'createdAt');
      }
      
      // Session notes store (new in v2)
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('sessionId', 'sessionId');
        notesStore.createIndex('clientId', 'clientId');
        notesStore.createIndex('timestamp', 'timestamp');
      }
    },
  });
  return db;
};

// Get database instance
let dbInstance = null;

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
};

// Practice Sessions CRUD
export const savePracticeSession = async (session) => {
  const db = await getDB();
  await db.put('sessions', {
    ...session,
    id: session.id || crypto.randomUUID(),
    timestamp: session.timestamp || new Date().toISOString(),
  });
  return session;
};

export const getPracticeSessions = async (filters = {}) => {
  const db = await getDB();
  let sessions = await db.getAll('sessions');
  
  // Apply filters
  if (filters.sessionType) {
    sessions = sessions.filter(s => s.sessionType === filters.sessionType);
  }
  if (filters.language) {
    sessions = sessions.filter(s => s.language === filters.language);
  }
  if (filters.target) {
    sessions = sessions.filter(s => s.target.toLowerCase().includes(filters.target.toLowerCase()));
  }
  
  // Sort by timestamp descending
  sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Apply limit
  if (filters.limit) {
    sessions = sessions.slice(0, filters.limit);
  }
  
  return sessions;
};

export const getPracticeSession = async (id) => {
  const db = await getDB();
  return await db.get('sessions', id);
};

export const deletePracticeSession = async (id) => {
  const db = await getDB();
  await db.delete('sessions', id);
};

export const clearAllSessions = async () => {
  const db = await getDB();
  await db.clear('sessions');
};

// Settings CRUD
export const saveSetting = async (key, value) => {
  const db = await getDB();
  await db.put('settings', { key, value });
};

export const getSetting = async (key, defaultValue = null) => {
  const db = await getDB();
  const setting = await db.get('settings', key);
  return setting ? setting.value : defaultValue;
};

export const getLanguageSetting = async () => {
  return await getSetting('language', 'english');
};

export const setLanguageSetting = async (language) => {
  await saveSetting('language', language);
};

// Export session data
export const exportSessionData = async (sessionId) => {
  const session = await getPracticeSession(sessionId);
  if (!session) return null;
  
  return {
    ...session,
    exportedAt: new Date().toISOString(),
  };
};

// Get statistics
export const getStatistics = async () => {
  const sessions = await getPracticeSessions({});
  
  const totalSessions = sessions.length;
  const avgVisualScore = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + (s.visualScore || 0), 0) / sessions.length 
    : 0;
  const avgAudioScore = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + (s.audioScore || 0), 0) / sessions.length 
    : 0;
  
  const letterSessions = sessions.filter(s => s.sessionType === 'letter').length;
  const wordSessions = sessions.filter(s => s.sessionType === 'word').length;
  
  // Get sessions by date
  const sessionsByDate = {};
  sessions.forEach(s => {
    const date = new Date(s.timestamp).toLocaleDateString();
    sessionsByDate[date] = (sessionsByDate[date] || 0) + 1;
  });
  
  // Calculate practice streak
  const sortedDates = Object.keys(sessionsByDate).sort((a, b) => new Date(b) - new Date(a));
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  if (sortedDates.length > 0) {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    
    // Check if practiced today or yesterday to continue streak
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const expectedDate = new Date(sortedDates[0]);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (currentDate.toLocaleDateString() === expectedDate.toLocaleDateString()) {
          tempStreak++;
        } else {
          break;
        }
      }
      currentStreak = tempStreak;
    }
    
    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const dayDiff = (prevDate - currDate) / 86400000;
      
      if (dayDiff <= 1.5) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }
  
  // Calculate phoneme mastery (letters with avg score > 80%)
  const phonemeMastery = {};
  const phonemeAttempts = {};
  
  sessions.filter(s => s.sessionType === 'letter').forEach(s => {
    const target = s.target.toUpperCase();
    const avgScore = ((s.visualScore || 0) + (s.audioScore || 0)) / 2;
    
    if (!phonemeMastery[target]) {
      phonemeMastery[target] = { total: 0, count: 0, best: 0 };
    }
    phonemeMastery[target].total += avgScore;
    phonemeMastery[target].count++;
    phonemeMastery[target].best = Math.max(phonemeMastery[target].best, avgScore);
  });
  
  // Calculate mastery percentage for each phoneme
  const masteredPhonemes = [];
  const inProgressPhonemes = [];
  const needsPracticePhonemes = [];
  
  Object.entries(phonemeMastery).forEach(([phoneme, data]) => {
    const avgScore = data.total / data.count;
    if (avgScore >= 80) {
      masteredPhonemes.push({ phoneme, avgScore: Math.round(avgScore), attempts: data.count });
    } else if (avgScore >= 60) {
      inProgressPhonemes.push({ phoneme, avgScore: Math.round(avgScore), attempts: data.count });
    } else {
      needsPracticePhonemes.push({ phoneme, avgScore: Math.round(avgScore), attempts: data.count });
    }
  });
  
  // Calculate achievements/milestones
  const achievements = [];
  
  if (totalSessions >= 1) achievements.push({ id: 'first_step', name: 'First Step', desc: 'Complete your first practice session', icon: '🎯', unlocked: true });
  else achievements.push({ id: 'first_step', name: 'First Step', desc: 'Complete your first practice session', icon: '🎯', unlocked: false });
  
  if (totalSessions >= 10) achievements.push({ id: 'dedicated', name: 'Dedicated Learner', desc: 'Complete 10 practice sessions', icon: '📚', unlocked: true });
  else achievements.push({ id: 'dedicated', name: 'Dedicated Learner', desc: 'Complete 10 practice sessions', icon: '📚', unlocked: false, progress: totalSessions, target: 10 });
  
  if (totalSessions >= 50) achievements.push({ id: 'committed', name: 'Committed', desc: 'Complete 50 practice sessions', icon: '💪', unlocked: true });
  else achievements.push({ id: 'committed', name: 'Committed', desc: 'Complete 50 practice sessions', icon: '💪', unlocked: false, progress: totalSessions, target: 50 });
  
  if (currentStreak >= 3) achievements.push({ id: 'streak3', name: '3 Day Streak', desc: 'Practice 3 days in a row', icon: '🔥', unlocked: true });
  else achievements.push({ id: 'streak3', name: '3 Day Streak', desc: 'Practice 3 days in a row', icon: '🔥', unlocked: false, progress: currentStreak, target: 3 });
  
  if (currentStreak >= 7) achievements.push({ id: 'streak7', name: 'Weekly Warrior', desc: 'Practice 7 days in a row', icon: '⭐', unlocked: true });
  else achievements.push({ id: 'streak7', name: 'Weekly Warrior', desc: 'Practice 7 days in a row', icon: '⭐', unlocked: false, progress: currentStreak, target: 7 });
  
  if (masteredPhonemes.length >= 5) achievements.push({ id: 'master5', name: 'Sound Master', desc: 'Master 5 phonemes (80%+ score)', icon: '🏆', unlocked: true });
  else achievements.push({ id: 'master5', name: 'Sound Master', desc: 'Master 5 phonemes (80%+ score)', icon: '🏆', unlocked: false, progress: masteredPhonemes.length, target: 5 });
  
  if (avgVisualScore >= 85) achievements.push({ id: 'visual_pro', name: 'Visual Pro', desc: 'Achieve 85%+ average visual score', icon: '👀', unlocked: true });
  else achievements.push({ id: 'visual_pro', name: 'Visual Pro', desc: 'Achieve 85%+ average visual score', icon: '👀', unlocked: false, progress: Math.round(avgVisualScore), target: 85 });
  
  if (avgAudioScore >= 85) achievements.push({ id: 'audio_ace', name: 'Audio Ace', desc: 'Achieve 85%+ average audio score', icon: '🎵', unlocked: true });
  else achievements.push({ id: 'audio_ace', name: 'Audio Ace', desc: 'Achieve 85%+ average audio score', icon: '🎵', unlocked: false, progress: Math.round(avgAudioScore), target: 85 });
  
  // Weekly progress (last 7 days)
  const weeklyProgress = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    const dayName = date.toLocaleDateString('en', { weekday: 'short' });
    weeklyProgress.push({
      day: dayName,
      date: dateStr,
      sessions: sessionsByDate[dateStr] || 0,
    });
  }
  
  return {
    totalSessions,
    avgVisualScore: Math.round(avgVisualScore * 10) / 10,
    avgAudioScore: Math.round(avgAudioScore * 10) / 10,
    letterSessions,
    wordSessions,
    sessionsByDate,
    currentStreak,
    longestStreak,
    masteredPhonemes,
    inProgressPhonemes,
    needsPracticePhonemes,
    achievements,
    weeklyProgress,
    practiceDays: Object.keys(sessionsByDate).length,
  };
};
