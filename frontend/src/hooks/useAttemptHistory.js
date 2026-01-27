/**
 * useAttemptHistory Hook
 * 
 * Manages practice attempt history with IndexedDB persistence.
 * Stores recordings, scores, and metadata for student progress tracking.
 * 
 * Data Structure:
 * {
 *   id: string (uuid),
 *   timestamp: number,
 *   type: 'letter' | 'word' | 'phrase',
 *   target: string (the word/letter practiced),
 *   language: string,
 *   duration: number (ms),
 *   audioBlob: Blob | null,
 *   videoBlob: Blob | null,
 *   scores: {
 *     overall: number (0-1),
 *     timing: number (0-1),
 *     pronunciation: number (0-1),
 *     clarity: number (0-1),
 *   },
 *   phonemeAnalysis: Array<{ phoneme, expected, actual, score }>,
 *   feedback: string[],
 * }
 */

import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'soundmirror_db';
const DB_VERSION = 1;
const STORE_NAME = 'attempts';
const MAX_ATTEMPTS = 100; // Keep last 100 attempts

// Initialize IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('target', 'target', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

// Generate UUID
function generateId() {
  return 'attempt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function useAttemptHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load attempts from IndexedDB
  const loadAttempts = useCallback(async () => {
    try {
      setLoading(true);
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      
      const request = index.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          // Sort by timestamp descending (newest first)
          const sorted = request.result.sort((a, b) => b.timestamp - a.timestamp);
          setAttempts(sorted);
          setLoading(false);
          resolve(sorted);
        };
        request.onerror = () => {
          setError(request.error);
          setLoading(false);
          reject(request.error);
        };
      });
    } catch (err) {
      console.error('Failed to load attempts:', err);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem('soundmirror_attempts');
        const data = stored ? JSON.parse(stored) : [];
        setAttempts(data);
      } catch (e) {
        setAttempts([]);
      }
      setLoading(false);
    }
  }, []);

  // Save a new attempt
  const saveAttempt = useCallback(async (attemptData) => {
    const attempt = {
      id: generateId(),
      timestamp: Date.now(),
      ...attemptData,
    };

    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      await new Promise((resolve, reject) => {
        const request = store.add(attempt);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Prune old attempts if over limit
      const allAttempts = await loadAttempts();
      if (allAttempts.length > MAX_ATTEMPTS) {
        const toDelete = allAttempts.slice(MAX_ATTEMPTS);
        for (const old of toDelete) {
          await deleteAttempt(old.id);
        }
      }

      return attempt;
    } catch (err) {
      console.error('Failed to save attempt:', err);
      // Fallback to localStorage (without blobs)
      const { audioBlob, videoBlob, ...rest } = attempt;
      const stored = localStorage.getItem('soundmirror_attempts');
      const data = stored ? JSON.parse(stored) : [];
      data.unshift(rest);
      localStorage.setItem('soundmirror_attempts', JSON.stringify(data.slice(0, MAX_ATTEMPTS)));
      setAttempts(data.slice(0, MAX_ATTEMPTS));
      return attempt;
    }
  }, [loadAttempts]);

  // Delete an attempt
  const deleteAttempt = useCallback(async (id) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      await new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      setAttempts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete attempt:', err);
    }
  }, []);

  // Get attempt by ID
  const getAttempt = useCallback(async (id) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Failed to get attempt:', err);
      return null;
    }
  }, []);

  // Get attempts for a specific target
  const getAttemptsForTarget = useCallback((target) => {
    return attempts.filter(a => a.target.toLowerCase() === target.toLowerCase());
  }, [attempts]);

  // Clear all attempts
  const clearAllAttempts = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      setAttempts([]);
      localStorage.removeItem('soundmirror_attempts');
    } catch (err) {
      console.error('Failed to clear attempts:', err);
    }
  }, []);

  // Calculate statistics
  const getStats = useCallback(() => {
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        streak: 0,
        bestScore: 0,
        recentImprovement: 0,
        practiceTime: 0,
      };
    }

    const scores = attempts.map(a => a.scores?.overall || 0);
    const totalAttempts = attempts.length;
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalAttempts;
    const bestScore = Math.max(...scores);
    const practiceTime = attempts.reduce((sum, a) => sum + (a.duration || 0), 0);

    // Calculate streak (consecutive days)
    let streak = 1;
    const today = new Date().setHours(0, 0, 0, 0);
    const attemptDays = [...new Set(attempts.map(a => 
      new Date(a.timestamp).setHours(0, 0, 0, 0)
    ))].sort((a, b) => b - a);

    if (attemptDays[0] === today || attemptDays[0] === today - 86400000) {
      for (let i = 1; i < attemptDays.length; i++) {
        if (attemptDays[i - 1] - attemptDays[i] === 86400000) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      streak = 0;
    }

    // Recent improvement (last 5 vs previous 5)
    let recentImprovement = 0;
    if (scores.length >= 10) {
      const recent = scores.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const previous = scores.slice(5, 10).reduce((a, b) => a + b, 0) / 5;
      recentImprovement = recent - previous;
    }

    return {
      totalAttempts,
      averageScore,
      streak,
      bestScore,
      recentImprovement,
      practiceTime,
    };
  }, [attempts]);

  // Load on mount
  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  return {
    attempts,
    loading,
    error,
    saveAttempt,
    deleteAttempt,
    getAttempt,
    getAttemptsForTarget,
    clearAllAttempts,
    getStats,
    refresh: loadAttempts,
  };
}

export default useAttemptHistory;
