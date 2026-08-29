// Minimal, routing-aligned page URL helper
// Do NOT change routes – this only formats a path from a page key.

/**
 * Returns the app route for a given page key without altering routing.
 * Examples:
 *  createPageUrl('Practice') => '/Practice'
 *  createPageUrl('Home') => '/Home'
 *  createPageUrl('/') => '/'
 *  createPageUrl('/HistoryLibrary') => '/HistoryLibrary'
 */
export function createPageUrl(pageKey) {
  if (!pageKey) return '/';
  const key = String(pageKey).trim();
  if (!key || key === '/') return '/';
  if (key.startsWith('/')) return key;
  // Encode to be safe for non-ASCII route keys (keeps slash semantics simple)
  return `/${encodeURIComponent(key)}`;
}

export default createPageUrl;