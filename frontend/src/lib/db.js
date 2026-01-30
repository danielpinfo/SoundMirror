import { openDB } from 'idb';

const DB_NAME = 'soundmirror-db';
const DB_VERSION = 1;

// Initialize the database
export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Practice sessions store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionsStore.createIndex('timestamp', 'timestamp');
        sessionsStore.createIndex('type', 'sessionType');
        sessionsStore.createIndex('language', 'language');
      }
      
      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
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
  
  return {
    totalSessions,
    avgVisualScore: Math.round(avgVisualScore * 10) / 10,
    avgAudioScore: Math.round(avgAudioScore * 10) / 10,
    letterSessions,
    wordSessions,
    sessionsByDate,
  };
};
