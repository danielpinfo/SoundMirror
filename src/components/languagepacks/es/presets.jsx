/**
 * Canonical Spanish practice presets.
 *
 * Runtime buttons and pronunciation-helper audits both import these arrays so
 * the visible preset library cannot drift away from the helper corpus.
 */
export const SPANISH_PRESET_WORDS = Object.freeze([
  { id: 'es-word-1', practice: 'Hola' },
  { id: 'es-word-2', practice: 'Oye' },
  { id: 'es-word-3', practice: 'Sonríe' },
  { id: 'es-word-4', practice: 'Gracias' },
  { id: 'es-word-5', practice: 'Perdón' },
  { id: 'es-word-6', practice: 'Sí' },
  { id: 'es-word-7', practice: 'No' },
  { id: 'es-word-8', practice: 'Bienvenido' },
  { id: 'es-word-9', practice: 'Adiós' },
  { id: 'es-word-10', practice: 'Beso' },
]);

export const SPANISH_PRESET_PHRASES = Object.freeze([
  { id: 'es-phrase-1', practice: 'Buenos días' },
  { id: 'es-phrase-2', practice: 'Perdóneme' },
  { id: 'es-phrase-3', practice: 'Buenas noches' },
  { id: 'es-phrase-4', practice: 'Cómo estás' },
  { id: 'es-phrase-5', practice: 'Estoy bien' },
  { id: 'es-phrase-6', practice: 'Muchas gracias' },
  { id: 'es-phrase-7', practice: 'Hasta pronto' },
  { id: 'es-phrase-8', practice: 'Hasta mañana' },
]);

export default {
  words: SPANISH_PRESET_WORDS,
  phrases: SPANISH_PRESET_PHRASES,
};
