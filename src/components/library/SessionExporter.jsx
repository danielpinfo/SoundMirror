/**
 * SessionExporter
 *
 * Exports a practice session as a downloadable .smpr bundle (ZIP archive).
 *
 * Contents:
 *   audio.webm         — recorded audio
 *   analysis.json      — phoneme timeline, scores, feedback, metadata
 *
 * Uses JSZip loaded from CDN at runtime to avoid adding a hard dependency.
 */

const JSZIP_CDN = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';

async function loadJSZip() {
  if (window.JSZip) return window.JSZip;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = JSZIP_CDN;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.JSZip;
}

export const SessionExporter = {
  /**
   * Export a session to a .smpr ZIP file and trigger browser download.
   * @param {object} session — full session from SessionManager.loadSession()
   */
  async exportSession(session) {
    const JSZip = await loadJSZip();
    const zip = new JSZip();

    // Audio track
    if (session.audioBlob) {
      zip.file('audio.webm', session.audioBlob);
    }

    // Analysis JSON (strip non-serialisable blob references)
    const analysisData = {
      id:              session.id,
      timestamp:       session.timestamp,
      language:        session.language,
      word:            session.word,
      phonemeTimeline: session.phonemeTimeline ?? [],
      scores:          session.scores          ?? [],
      feedback:        session.feedback        ?? [],
    };
    zip.file('analysis.json', JSON.stringify(analysisData, null, 2));

    // Generate ZIP blob
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

    // Trigger download
    const filename = `practice_session_${session.word || 'untitled'}_${new Date(session.timestamp).toISOString().slice(0, 10)}.smpr`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    console.info(`[SessionExporter] Exported "${filename}"`);
    return filename;
  },
};