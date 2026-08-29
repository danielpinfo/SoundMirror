/**
 * SoundMirror UI Translations
 * English (US)
 *
 * Pack-owned UI language strings.
 *
 * IMPORTANT:
 * - UI text is pack-owned
 * - The app shell must not hardcode UI strings
 * - This allows UI localization to follow language packs
 */

const uiTranslations = {
  locale: 'en-US',

  strings: {
    // App
    app_title: 'SoundMirror',

    // Navigation
    practice: 'Practice',
    history: 'History',
    settings: 'Settings',

    // Controls
    record: 'Record',
    play: 'Play',
    pause: 'Pause',
    reset: 'Reset',

    // Status
    loading: 'Loading...',

    // Practice
    speak_prompt: 'Type a word or phrase to practice',
    coaching_title: 'Coaching',

    // Language
    language: 'Language',

    // Speed
    speed: 'Speed',
    slow: 'Slow',
    normal: 'Normal',
    fast: 'Fast',
  },
};

/**
 * Safe lookup helper
 * Prevents UI crashes if key missing
 */
export function getTranslation(key) {
  return uiTranslations.strings[key] ?? key;
}

export default uiTranslations;