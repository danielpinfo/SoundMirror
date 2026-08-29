export default function renderHelperChunks(chunks) {
  if (!Array.isArray(chunks)) return [];
  return chunks
    .map((chunk) => {
      if (typeof chunk === 'string') return { text: chunk, label: chunk };
      const text = chunk?.text || chunk?.label || chunk?.phoneme || '';
      return text ? { ...chunk, text, label: chunk?.label || text } : null;
    })
    .filter(Boolean);
}
