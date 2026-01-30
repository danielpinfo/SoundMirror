import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Languages
export const getLanguages = async () => {
  const response = await apiClient.get('/languages');
  return response.data.languages;
};

export const getTranslations = async (language) => {
  const response = await apiClient.get(`/translations/${language}`);
  return response.data;
};

export const getAlphabet = async (language) => {
  const response = await apiClient.get(`/alphabet/${language}`);
  return response.data.alphabet;
};

export const getPracticeWords = async (language) => {
  const response = await apiClient.get(`/practice-words/${language}`);
  return response.data.words;
};

// Phoneme data
export const getPhonemeMap = async () => {
  const response = await apiClient.get('/phoneme-map');
  return response.data.phoneme_map;
};

export const getFrameInfo = async () => {
  const response = await apiClient.get('/frame-info');
  return response.data.frames;
};

export const getPhonemeFrame = async (phoneme) => {
  const response = await apiClient.get(`/phoneme-to-frame/${phoneme}`);
  return response.data;
};

export const wordToFrames = async (word) => {
  const response = await apiClient.post('/word-to-frames', { word });
  return response.data;
};

// Practice sessions
export const createSession = async (sessionData) => {
  const response = await apiClient.post('/sessions', sessionData);
  return response.data;
};

export const getSessions = async (params = {}) => {
  const response = await apiClient.get('/sessions', { params });
  return response.data;
};

export const getSession = async (sessionId) => {
  const response = await apiClient.get(`/sessions/${sessionId}`);
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await apiClient.delete(`/sessions/${sessionId}`);
  return response.data;
};

// Grading
export const gradeAttempt = async (targetPhoneme, audioData = null, language = 'english') => {
  const response = await apiClient.post('/grade', {
    target_phoneme: targetPhoneme,
    audio_data: audioData,
    language,
  });
  return response.data;
};

// Bug reports
export const submitBugReport = async (reportData) => {
  const response = await apiClient.post('/bug-reports', reportData);
  return response.data;
};

export const getBugReports = async () => {
  const response = await apiClient.get('/bug-reports');
  return response.data;
};

export default apiClient;
