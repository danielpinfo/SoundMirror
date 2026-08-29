/**
 * Italian helper renderer.
 *
 * Pack-owned helper rendering utility.
 * For now this stays intentionally simple and returns normalized chunks.
 */

export function renderHelperChunks(chunks) {
  if (!Array.isArray(chunks)) return [];

  return chunks
    .map((chunk) => {
      if (typeof chunk === 'string') {
        return { text: chunk };
      }

      if (!chunk || typeof chunk !== 'object') {
        return null;
      }

      return {
        ...chunk,
        text: typeof chunk.text === 'string' ? chunk.text : String(chunk.text ?? ''),
      };
    })
    .filter((chunk) => chunk && chunk.text);
}

export default renderHelperChunks;