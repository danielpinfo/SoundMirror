/**
 * SessionManager
 *
 * Thin interface over PracticeArchive for the library UI.
 * Returns enriched session metadata with formatted display strings.
 */

import { PracticeArchive } from '../analysis/PracticeArchive';

const archive = new PracticeArchive();

export const SessionManager = {
  /** @returns {Array<{id, timestamp, language, word, finalScore, dateLabel, scoreLabel}>} */
  listSessions() {
    return archive.listSessions().map(s => ({
      ...s,
      dateLabel:  s.timestamp ? new Date(s.timestamp).toLocaleString() : '—',
      scoreLabel: s.finalScore != null ? `${Math.round(s.finalScore)}%` : '—',
    }));
  },

  /** @param {string} id @returns {object|null} full session */
  loadSession(id, activePracticePackId = null) {
    return archive.loadSession(id, activePracticePackId);
  },

  /** @param {string} id */
  deleteSession(id) {
    archive.deleteSession(id);
  },

  clearAll() {
    archive.clearAll();
  },
};
