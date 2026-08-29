/**
 * ProgressAnalyzer
 *
 * Computes progress metrics from PracticeArchive sessions.
 * Language-agnostic — phoneme list supplied by caller from PluginContext.
 */

import { PracticeArchive } from '../analysis/PracticeArchive';

const archive = new PracticeArchive();

function normalizePercent(value) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const numeric = Number(value);
  return numeric <= 1 ? numeric * 100 : numeric;
}

export const ProgressAnalyzer = {
  /**
   * Overall session scores over time.
   * @returns {Array<{date: string, timestamp: number, score: number, word: string}>}
   */
  getOverallProgress() {
    return archive.listSessions()
      .filter(s => s.finalScore != null)
      .reverse()                              // oldest → newest
      .map(s => ({
        timestamp: s.timestamp,
        date:      new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score:     Math.round(normalizePercent(s.finalScore) ?? 0),
        word:      s.word || '—',
      }));
  },

  /**
   * Average articulation score per phoneme across all sessions.
   * Only phonemes that appear in at least one session are returned.
   * @param {Array<string>} phonemeList  — from PluginContext.phonemeSystem.phonemes
   * @returns {Array<{phoneme: string, score: number, count: number}>}
   */
  getPhonemeProgress(phonemeList = []) {
    const sessions = archive.listSessions().map(meta => archive.loadSession(meta.id)).filter(Boolean);
    const totals   = {};   // { phoneme: { sum, count } }

    for (const session of sessions) {
      const breakdown = Array.isArray(session.phonemeBreakdown)
        ? session.phonemeBreakdown
        : [];
      const legacyScores = Array.isArray(session.scores)
        ? session.scores.filter((score) => score && typeof score === 'object')
        : [];

      for (const sc of (breakdown.length ? breakdown : legacyScores)) {
        const phoneme = sc.phoneme || sc.detectedPhoneme || sc.expectedPhoneme;
        const score = normalizePercent(
          sc.finalScore ??
          (sc.status === 'correct' ? 100 : sc.status === 'close' ? 65 : 0)
        );

        if (!phoneme || score == null) continue;
        if (!totals[phoneme]) totals[phoneme] = { sum: 0, count: 0 };
        totals[phoneme].sum   += score;
        totals[phoneme].count += 1;
      }
    }

    // Build result using the language pack's phoneme list as the authority
    const symbols = phonemeList.map(p => (typeof p === 'string' ? p : p.symbol));
    const result  = symbols
      .filter(ph => totals[ph])
      .map(ph => ({
        phoneme: ph,
        score:   Math.round(totals[ph].sum / totals[ph].count),
        count:   totals[ph].count,
      }))
      .sort((a, b) => a.score - b.score);  // weakest first

    return result;
  },

  /**
   * Consistency metrics — how stable scores are over the last N sessions.
   * @param {number} n  — window size (default 10)
   * @returns {{ mean: number, stdDev: number, trend: 'improving'|'declining'|'stable' }}
   */
  getConsistencyMetrics(n = 10) {
    const recent = archive.listSessions()
      .filter(s => s.finalScore != null)
      .slice(0, n)
      .reverse()
      .map(s => normalizePercent(s.finalScore) ?? 0);

    if (recent.length < 2) return { mean: recent[0] ?? 0, stdDev: 0, trend: 'stable' };

    const mean   = recent.reduce((a, b) => a + b, 0) / recent.length;
    const stdDev = Math.sqrt(recent.reduce((s, v) => s + (v - mean) ** 2, 0) / recent.length);

    // Simple linear trend: compare first half vs second half
    const mid   = Math.floor(recent.length / 2);
    const first = recent.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const last  = recent.slice(mid).reduce((a, b) => a + b, 0) / (recent.length - mid);
    const trend = last - first > 3 ? 'improving' : last - first < -3 ? 'declining' : 'stable';

    return { mean: Math.round(mean), stdDev: Math.round(stdDev), trend };
  },
};
