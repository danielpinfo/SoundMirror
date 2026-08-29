/**
 * SoundMirror Airflow Profiles
 * English (US)
 *
 * Defines reusable airflow behavior classes for English articulation.
 * These are anatomical/airflow presets that can be referenced by:
 *
 * - airflowMap.jsx
 * - resolver / analysis layers
 * - side-airflow visualizations
 *
 * IMPORTANT:
 * These values are language-pack-owned.
 * Shared app code must not hardcode airflow behavior.
 */

const airflowProfiles = {
  /**
   * Silence / neutral breathing
   */
  silence: {
    pattern: 'breathing',
    origin: 'nose',
    exit: 'lungs',
    oral: 0.0,
    nasal: 0.0,
    velocity: 0.0,
    width: 'narrow',
    burst: false,
    turbulent: false,
    split: false,
  },

  /**
   * Full closure before release
   * Used for stop buildup / held closure moments.
   */
  closure: {
    pattern: 'continuous',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.04,
    nasal: 0.0,
    velocity: 0.08,
    width: 'narrow',
    burst: false,
    turbulent: false,
    split: false,
  },

  /**
   * Unaspirated oral stop release
   * e.g. /b d g/
   */
  stop_unaspirated: {
    pattern: 'burst',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.42,
    nasal: 0.0,
    velocity: 0.52,
    width: 'narrow',
    burst: true,
    turbulent: false,
    split: false,
  },

  /**
   * Aspirated oral stop release
   * e.g. /p t k/
   */
  stop_aspirated: {
    pattern: 'burst',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.68,
    nasal: 0.0,
    velocity: 0.78,
    width: 'medium',
    burst: true,
    turbulent: true,
    split: false,
  },

  /**
   * Lower-energy fricatives
   * e.g. /f v/
   */
  fricative_weak: {
    pattern: 'continuous',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.58,
    nasal: 0.0,
    velocity: 0.48,
    width: 'medium',
    burst: false,
    turbulent: true,
    split: false,
  },

  /**
   * Higher-energy fricatives
   * e.g. /s z sh zh th dh h/
   */
  fricative_strong: {
    pattern: 'continuous',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.84,
    nasal: 0.0,
    velocity: 0.70,
    width: 'medium',
    burst: false,
    turbulent: true,
    split: false,
  },

  /**
   * Affricates combine stop-like release + frication
   * e.g. /ch j/
   */
  affricate: {
    pattern: 'burst',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.80,
    nasal: 0.0,
    velocity: 0.76,
    width: 'medium',
    burst: true,
    turbulent: true,
    split: false,
  },

  /**
   * Nasal airflow
   * e.g. /m n ng/
   */
  nasal: {
    pattern: 'continuous',
    origin: 'lungs',
    exit: 'nose',
    oral: 0.06,
    nasal: 0.72,
    velocity: 0.42,
    width: 'medium',
    burst: false,
    turbulent: false,
    split: true,
  },

  /**
   * Liquids
   * e.g. /l r/
   */
  liquid: {
    pattern: 'continuous',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.42,
    nasal: 0.0,
    velocity: 0.34,
    width: 'medium',
    burst: false,
    turbulent: false,
    split: false,
  },

  /**
   * Glides
   * e.g. /w y/
   */
  glide: {
    pattern: 'continuous',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.34,
    nasal: 0.0,
    velocity: 0.28,
    width: 'narrow',
    burst: false,
    turbulent: false,
    split: false,
  },

  /**
   * Short vowels
   */
  vowel_short: {
    pattern: 'continuous',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.62,
    nasal: 0.0,
    velocity: 0.44,
    width: 'medium',
    burst: false,
    turbulent: false,
    split: false,
  },

  /**
   * Long / sustained vowels
   */
  vowel_long: {
    pattern: 'continuous',
    origin: 'lungs',
    exit: 'mouth',
    oral: 0.70,
    nasal: 0.0,
    velocity: 0.48,
    width: 'wide',
    burst: false,
    turbulent: false,
    split: false,
  },
};

export const airflowProfileKeys = Object.keys(airflowProfiles);

export function getAirflowProfile(profileName) {
  return airflowProfiles[profileName] ?? airflowProfiles.silence;
}

export default airflowProfiles;