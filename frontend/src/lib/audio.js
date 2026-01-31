import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Cache for audio URLs (presigned URLs are valid for 1 hour)
const audioCache = new Map();

// Get audio URL for a letter
export const getLetterAudio = async (letter, language = 'english') => {
  const cacheKey = `letter-${letter}-${language}`;
  
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }
  
  try {
    const response = await axios.get(`${API}/audio/letter/${letter}`, {
      params: { language }
    });
    
    const data = response.data;
    audioCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching letter audio:', error);
    return null;
  }
};

// Get audio URL for a phoneme
export const getPhonemeAudio = async (phoneme, language = 'english') => {
  const cacheKey = `phoneme-${phoneme}-${language}`;
  
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }
  
  try {
    const response = await axios.get(`${API}/audio/phoneme/${phoneme}`, {
      params: { language }
    });
    
    const data = response.data;
    audioCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching phoneme audio:', error);
    return null;
  }
};

// Get audio sequence for a word
export const getWordAudio = async (word, language = 'english') => {
  const cacheKey = `word-${word}-${language}`;
  
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }
  
  try {
    const response = await axios.post(`${API}/audio/word`, {
      word,
      language
    });
    
    const data = response.data;
    audioCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching word audio:', error);
    return null;
  }
};

// Get available phonemes for a language
export const getAvailableAudio = async (language = 'english') => {
  try {
    const response = await axios.get(`${API}/audio/available/${language}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available audio:', error);
    return null;
  }
};

// Preload audio for faster playback
export const preloadAudio = (url) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = reject;
    audio.src = url;
  });
};

// Play audio and return a promise that resolves when done
export const playAudio = (url) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = resolve;
    audio.onerror = reject;
    audio.play().catch(reject);
  });
};

// Play a sequence of audio URLs with delays
export const playAudioSequence = async (audioUrls, delayBetween = 100) => {
  for (const url of audioUrls) {
    if (url) {
      try {
        await playAudio(url);
        await new Promise(resolve => setTimeout(resolve, delayBetween));
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    } else {
      // Pause for silence
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
};

// Clear the cache (useful when switching languages)
export const clearAudioCache = () => {
  audioCache.clear();
};

export default {
  getLetterAudio,
  getPhonemeAudio,
  getWordAudio,
  getAvailableAudio,
  preloadAudio,
  playAudio,
  playAudioSequence,
  clearAudioCache,
};
