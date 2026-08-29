/**
 * German pack-owned helper renderer.
 *
 * Keep helper display shaping inside the pack so the app shell does not need
 * German-specific helper text rules.
 */

function normalizeChunk(chunk) {
  if (!chunk) return null;

  if (typeof chunk === 'string') {
    return {
      text: chunk,
      label: chunk,
    };
  }

  const text =
    typeof chunk.text === 'string'
      ? chunk.text
      : typeof chunk.label === 'string'
        ? chunk.label
        : typeof chunk.phoneme === 'string'
          ? chunk.phoneme
          : '';

  if (!text) return null;

  return {
    ...chunk,
    text,
    label: typeof chunk.label === 'string' ? chunk.label : text,
  };
}

export default function renderHelperChunks(chunks) {
  if (!Array.isArray(chunks)) return [];

  return chunks.map(normalizeChunk).filter(Boolean);
}