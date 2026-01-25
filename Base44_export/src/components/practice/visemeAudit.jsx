// Viseme Audit Utility
// Checks which viseme tokens are present vs missing across all languages

import { ALPHABET_BY_LANG } from '../../pages/LetterPractice';
import { getVisemeUrl } from './visemeUrls';

/**
 * Suggest a fallback token based on phonetic heuristics
 */
function suggestFallbackToken(token) {
  const t = String(token || '').toLowerCase();
  
  if (!t) return null;
  
  // Consonant heuristics
  if (t.startsWith('p') || t.startsWith('b') || t.startsWith('m')) return 'ba';
  if (t.startsWith('f') || t.startsWith('v')) return 'fa';
  if (t.startsWith('t') || t.startsWith('d') || t.startsWith('n') || t.startsWith('l') || t.startsWith('s') || t.startsWith('z')) return 'ta';
  if (t.includes('sh') || t.includes('ch') || t.includes('zh') || t.startsWith('j')) return 'sha';
  if (t.startsWith('k') || t.startsWith('g') || t.startsWith('h')) return 'ka';
  if (t.startsWith('r')) return 'ra';
  if (t.startsWith('w')) return 'wa';
  if (t.startsWith('y')) return 'ya';
  
  // Vowel heuristics
  if (t === 'a' || t === 'aa' || t.startsWith('a')) return 'a';
  if (t === 'e' || t === 'eh' || t.startsWith('e')) return 'eh';
  if (t === 'i' || t === 'ii' || t === 'ee' || t.startsWith('i')) return 'ee';
  if (t === 'o' || t === 'oh' || t.startsWith('o')) return 'oh';
  if (t === 'u' || t === 'uu' || t === 'oo' || t.startsWith('u')) return 'oo';
  
  // No good match
  return null;
}

/**
 * Check if a viseme exists by attempting to fetch frame 0
 */
async function checkVisemeExists(token) {
  const url = getVisemeUrl(token, 1); // Frame 1 (0-indexed as frame 0)
  
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Collect all unique tokens from all language alphabets
 */
export function getAllTokens() {
  const tokenSet = new Set();
  
  Object.values(ALPHABET_BY_LANG).forEach(alphabet => {
    if (Array.isArray(alphabet)) {
      alphabet.forEach(sound => {
        const token = sound.token || sound.phonetic;
        if (token && token.trim()) {
          tokenSet.add(token.toLowerCase().trim());
        }
      });
    }
  });
  
  return Array.from(tokenSet).sort();
}

/**
 * Run full viseme audit
 * Returns { presentTokens, missingTokens (with fallback suggestions) }
 */
export async function auditVisemes() {
  const allTokens = getAllTokens();
  const presentTokens = [];
  const missingTokens = [];
  
  console.log(`[VisemeAudit] Checking ${allTokens.length} unique tokens...`);
  
  for (const token of allTokens) {
    const exists = await checkVisemeExists(token);
    
    if (exists) {
      presentTokens.push(token);
    } else {
      const fallback = suggestFallbackToken(token);
      missingTokens.push({ token, fallback });
    }
  }
  
  // Log results
  console.log(`\n=== VISEME AUDIT RESULTS ===`);
  console.log(`Total tokens: ${allTokens.length}`);
  console.log(`Present: ${presentTokens.length}`);
  console.log(`Missing: ${missingTokens.length}`);
  
  if (missingTokens.length > 0) {
    console.log('\nMissing tokens:');
    missingTokens.forEach(({ token, fallback }) => {
      if (fallback) {
        console.log(`  - token: "${token}" → fallback: "${fallback}"`);
      } else {
        console.log(`  - token: "${token}" → NEEDS_NEW_RECORDING`);
      }
    });
  }
  
  console.log('\nPresent tokens:', presentTokens.join(', '));
  
  return { presentTokens, missingTokens, totalTokens: allTokens.length };
}