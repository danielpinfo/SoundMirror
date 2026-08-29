import {
  resolveSimpleWord,
} from './pronunciationRules';
import {
  getShortCustomSoundCue,
} from './shortCustomSoundLibrary';

const DIGRAPHS = new Set(['sh', 'ch', 'th', 'ph', 'wh', 'ck', 'ng']);
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

function normalizeWordForLookup(word = '') {
  return String(word)
    .toLowerCase()
    .replace(/[^a-z']/g, '');
}

function readConsonantCluster(word, start) {
  let cluster = '';
  let i = start;

  while (i < word.length && !VOWELS.has(word[i])) {
    const di = word.slice(i, i + 2);
    if (DIGRAPHS.has(di)) {
      cluster += di;
      i += 2;
      continue;
    }

    cluster += word[i];
    i += 1;
  }

  return { cluster, next: i };
}

function readVowelCluster(word, start) {
  let cluster = '';
  let i = start;

  while (i < word.length && VOWELS.has(word[i])) {
    cluster += word[i];
    i += 1;
  }

  return { cluster, next: i };
}

function fallbackWordToHelperChunks(word = '') {
  const normalized = normalizeWordForLookup(word);
  if (!normalized) return [];

  const chunks = [];
  let i = 0;

  while (i < normalized.length) {
    const consonants = readConsonantCluster(normalized, i);
    i = consonants.next;

    const vowels = readVowelCluster(normalized, i);
    i = vowels.next;

    if (vowels.cluster) {
      chunks.push(`${consonants.cluster}${vowels.cluster}`);
      continue;
    }

    if (consonants.cluster) {
      chunks.push(consonants.cluster);
      continue;
    }

    chunks.push(normalized[i]);
    i += 1;
  }

  return chunks;
}

export function renderEnglishHelperWord(word = '') {
  const normalized = normalizeWordForLookup(word);
  if (!normalized) return '';

  const shortCustomCue =
    getShortCustomSoundCue(normalized);

  if (shortCustomCue) {
    return shortCustomCue.helperText;
  }

  return (
    resolveSimpleWord(normalized) ||
    fallbackWordToHelperChunks(normalized).join('-')
  );
}

export function renderEnglishHelperText(text = '') {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(renderEnglishHelperWord)
    .filter(Boolean)
    .join(' ');
}

export default {
  renderEnglishHelperWord,
  renderEnglishHelperText,
};
