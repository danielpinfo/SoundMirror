/**
 * PracticeArchive
 *
 * Stores completed practice-session metadata in localStorage.
 * Audio blobs are stored as base64 data URLs for backward compatibility;
 * larger video blobs are stored separately in IndexedDB.
 *
 * NOTE: AutoArchiveService will periodically archive older sessions to IndexedDB ZIPs.
 *
 * API:
 *   saveSession(session)     → id
 *   listSessions()           → [{id, timestamp, language, word, finalScore}]
 *   loadSession(id)          → full session object
 *   deleteSession(id)        → void
 *   clearAll()               → void
 */

import { PracticeMediaDB } from '../../lib/storage/PracticeMediaDB';

const STORAGE_KEY = 'soundmirror_practice_sessions';
const MAX_SESSIONS = 100;

export class PracticeArchive {
  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  /**
   * Persist a completed practice session.
   *
   * @param {object} session
   *   timestamp       {number}  ms epoch
   *   language        {string}  locale e.g. 'en-US'
   *   word            {string}  target word/phrase
   *   audioBlob       {Blob|null}
   *   phonemeTimeline {Array}
   *   scores          {Array}   output of ArticulationComparator.compare()
   *   feedback        {Array<string>}
   *
   * @returns {string} session id
   */
  async saveSession(session) {
    const id      = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const audioB64 = session.audioBlob ? await this._blobToBase64(session.audioBlob) : null;

    if (!session.packId) {
      console.error('[HISTORY WRITE]', {
        targetText: session.word ?? '',
        packId: session.packId ?? null,
        targetSource: session.targetSource ?? 'unknown',
        action: 'rejected_missing_packId',
      });
      throw new Error('[PracticeArchive] packId is required for history writes.');
    }

    let videoStored = false;
    if (session.videoBlob instanceof Blob && session.videoBlob.size > 0) {
      try {
        videoStored = await PracticeMediaDB.saveVideo(id, session.videoBlob);
      } catch (error) {
        console.warn('[PracticeArchive] Video could not be saved:', error);
      }
    }

    const record = {
      id,
      timestamp:       session.timestamp ?? Date.now(),
      language:        session.language  ?? 'unknown',
      languageCode:    session.languageCode ?? 'unknown',
      packId:          session.packId,
      targetSource:    session.targetSource ?? 'unknown',
      word:            session.word      ?? '',
      audioB64,
      videoStored,
      phonemeTimeline: session.phonemeTimeline ?? [],
      scores:          session.scores          ?? [],
      feedback:        session.feedback        ?? [],
      transcript:      session.transcript      ?? null,
      score:           session.score           ?? null,
      match:           session.match           ?? null,
      phonemeBreakdown: session.phonemeBreakdown ?? null,
    };

    const all = this._load();
    all.unshift(record);                          // newest first
    if (all.length > MAX_SESSIONS) all.splice(MAX_SESSIONS);
    this._save(all);

    console.log('[HISTORY WRITE]', {
      targetText: record.word,
      packId: record.packId,
      targetSource: record.targetSource,
    });
    console.info(`[PracticeArchive] Saved session "${id}"`);
    return id;
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  /**
   * @returns {Array<{id, timestamp, language, word, finalScore}>}
   */
  listSessions() {
    return this._load().map(s => ({
      id:         s.id,
      timestamp:  s.timestamp,
      language:   s.language,
      languageCode: s.languageCode,
      packId:     s.packId,
      targetSource: s.targetSource,
      word:       s.word,
      finalScore: Number.isFinite(Number(s.score))
        ? Number(s.score)
        : s.scores?.length
          ? s.scores.reduce((acc, sc) => {
              const value = typeof sc === 'number' ? sc : sc?.finalScore;
              return acc + (Number.isFinite(Number(value)) ? Number(value) : 0);
            }, 0) / s.scores.length
          : null,
    }));
  }

  /**
   * Load full session including reconstructed audio Blob.
   * @param {string} id
   * @returns {object|null}
   */
  loadSession(id, activePracticePackId = null) {
    const record = this._load().find(s => s.id === id);
    if (!record) return null;

    const allowed = !!record.packId && (!activePracticePackId || record.packId === activePracticePackId);
    console.log('[HISTORY RESTORE]', {
      restoredTarget: record.word,
      restoredPackId: record.packId ?? null,
      activePracticePackId,
      allowed: allowed ? 'yes' : 'no',
      action: allowed ? 'restored' : 'blocked',
    });

    if (!allowed) {
      console.log('[HISTORY BLOCKED]', {
        restoredTarget: record.word,
        restoredPackId: record.packId ?? null,
        activePracticePackId,
      });
      return null;
    }

    console.log('[TARGET FROM HISTORY]', {
      targetText: record.word,
      packId: record.packId,
      activePracticePackId,
    });

    const { audioB64, ...rest } = record;
    return {
      ...rest,
      audioBlob:      audioB64 ? this._base64ToBlob(audioB64, 'audio/webm') : null,
      facialTimeline: record.facialTimeline ?? [],
    };
  }

  async loadVideoBlob(id) {
    try {
      return await PracticeMediaDB.getVideo(id);
    } catch (error) {
      console.warn('[PracticeArchive] Video could not be loaded:', error);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  deleteSession(id) {
    const all = this._load().filter(s => s.id !== id);
    this._save(all);
    PracticeMediaDB.deleteVideo(id).catch((error) => {
      console.warn('[PracticeArchive] Video could not be deleted:', error);
    });
    console.info(`[PracticeArchive] Deleted session "${id}"`);
  }

  clearAll() {
    this._save([]);
    PracticeMediaDB.clear().catch((error) => {
      console.warn('[PracticeArchive] Stored videos could not be cleared:', error);
    });
    console.info('[PracticeArchive] All sessions cleared.');
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _save(sessions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('[PracticeArchive] Storage quota exceeded — oldest sessions trimmed.', e);
      // Remove oldest half and retry
      const trimmed = sessions.slice(0, Math.floor(sessions.length / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }

  _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  _base64ToBlob(b64, mimeType) {
    const byteStr = atob(b64.split(',')[1]);
    const arr     = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
    return new Blob([arr], { type: mimeType });
  }
}
