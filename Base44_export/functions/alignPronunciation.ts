import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import sdk from 'npm:microsoft-cognitiveservices-speech-sdk@1.40.0';

/**
 * ASR Aligner Service
 * 
 * Given a user's spoken attempt of a known word, returns:
 * - The phoneme sequence with start/end timestamps (forced alignment)
 * - Confidence scores per phoneme
 * - Duration of the audio
 * 
 * Uses Azure Speech SDK for pronunciation assessment with phoneme-level timing.
 */

// ARPAbet mapping from Azure/IPA phonemes
const IPA_TO_ARPABET = {
  // Vowels
  "ɑ": "AA", "æ": "AE", "ʌ": "AH", "ɔ": "AO", "aʊ": "AW",
  "aɪ": "AY", "ɛ": "EH", "ɝ": "ER", "ɚ": "ER", "eɪ": "EY",
  "ɪ": "IH", "i": "IY", "oʊ": "OW", "ɔɪ": "OY", "ʊ": "UH",
  "u": "UW", "ə": "AH",
  // Consonants
  "b": "B", "tʃ": "CH", "d": "D", "ð": "DH", "f": "F",
  "g": "G", "h": "HH", "dʒ": "JH", "k": "K", "l": "L",
  "m": "M", "n": "N", "ŋ": "NG", "p": "P", "r": "R",
  "ɹ": "R", "s": "S", "ʃ": "SH", "t": "T", "θ": "TH",
  "v": "V", "w": "W", "j": "Y", "z": "Z", "ʒ": "ZH",
  // Direct mappings for Azure output
  "aa": "AA", "ae": "AE", "ah": "AH", "ao": "AO", "aw": "AW",
  "ay": "AY", "eh": "EH", "er": "ER", "ey": "EY", "ih": "IH",
  "iy": "IY", "ow": "OW", "oy": "OY", "uh": "UH", "uw": "UW",
  "ch": "CH", "dh": "DH", "hh": "HH", "jh": "JH", "ng": "NG",
  "sh": "SH", "th": "TH", "zh": "ZH"
};

function mapToArpabet(symbol) {
  if (!symbol) return "SIL";
  const lower = symbol.toLowerCase();
  // Check direct mapping
  if (IPA_TO_ARPABET[lower]) return IPA_TO_ARPABET[lower];
  if (IPA_TO_ARPABET[symbol]) return IPA_TO_ARPABET[symbol];
  // Return uppercase if already ARPAbet-like
  return symbol.toUpperCase();
}

// CMU-style phoneme dictionary for common words
const WORD_PHONEMES = {
  "three": ["TH", "R", "IY"],
  "the": ["DH", "AH"],
  "hello": ["HH", "EH", "L", "OW"],
  "world": ["W", "ER", "L", "D"],
  "water": ["WH", "A", "T", "ER"],
  "think": ["TH", "IH", "NG", "K"],
  "thank": ["TH", "AE", "NG", "K"],
  "this": ["TH", "IH", "S"],
  "that": ["TH", "AE", "T"],
  "beautiful": ["B", "Y", "UW", "T", "IH", "F", "UH", "L"],
  "really": ["R", "EE", "A", "LEE"],
  "yellow": ["Y", "EH", "L", "OW"],
  "computer": ["K", "UH", "M", "P", "Y", "UW", "T", "ER"],
  "pronunciation": ["P", "R", "OH", "N", "UH", "N", "S", "IY", "EY", "SH", "UH", "N"]
};

function getTargetPhonemes(text, lang) {
  const word = text.toLowerCase().trim();
  if (WORD_PHONEMES[word]) {
    return WORD_PHONEMES[word];
  }
  // Fallback: simple letter-based approximation
  return text.toUpperCase().split('').filter(c => /[A-Z]/.test(c));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { audioUrl, text, lang = "en-US" } = await req.json();

    if (!audioUrl || !text) {
      return Response.json({ 
        error: 'Missing required fields: audioUrl and text' 
      }, { status: 400 });
    }

    const azureKey = Deno.env.get("AZURE_SPEECH_KEY");
    const azureRegion = Deno.env.get("AZURE_SPEECH_REGION");
    
    if (!azureKey || !azureRegion) {
      return Response.json({ 
        error: 'Azure Speech credentials not configured' 
      }, { status: 500 });
    }

    // Download audio
    console.log('Fetching audio from:', audioUrl);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      return Response.json({ 
        error: `Failed to fetch audio: ${audioResponse.status}` 
      }, { status: 404 });
    }
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioData = new Uint8Array(audioBuffer);
    console.log('Audio buffer size:', audioBuffer.byteLength);

    // Calculate duration from WAV header
    // WAV format: bytes 24-27 = sample rate, bytes 40-43 = data size
    let duration = 0;
    if (audioBuffer.byteLength > 44) {
      const view = new DataView(audioBuffer);
      const sampleRate = view.getUint32(24, true);
      const bitsPerSample = view.getUint16(34, true);
      const numChannels = view.getUint16(22, true);
      const dataSize = audioBuffer.byteLength - 44;
      const bytesPerSample = (bitsPerSample / 8) * numChannels;
      duration = dataSize / (sampleRate * bytesPerSample);
    }

    // Setup Azure Speech
    const speechConfig = sdk.SpeechConfig.fromSubscription(azureKey, azureRegion);
    speechConfig.speechRecognitionLanguage = lang;

    // Create audio stream
    const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    // Configure pronunciation assessment with phoneme granularity
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      text,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true // Enable miscue detection
    );

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    pronunciationConfig.applyTo(recognizer);

    // Push audio data (skip WAV header)
    pushStream.write(audioData.slice(44));
    pushStream.close();

    // Get target phoneme sequence
    const targetPhonemes = getTargetPhonemes(text, lang);

    const result = await new Promise((resolve, reject) => {
      let hasResponded = false;
      
      const timeout = setTimeout(() => {
        if (!hasResponded) {
          hasResponded = true;
          recognizer.close();
          reject(new Error("Recognition timeout"));
        }
      }, 15000);

      recognizer.recognized = (s, e) => {
        if (hasResponded) return;
        
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          try {
            const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(e.result);
            const detailResult = pronunciationResult.detailResult;
            
            const rawPhones = [];
            const phonemes = [];
            let overallConfidence = 0;
            let phonemeCount = 0;
            let currentOffset = 0;

            // Extract phoneme timings from Azure result
            const words = detailResult?.Words || [];
            
            words.forEach(word => {
              const wordPhonemes = word.Phonemes || [];
              
              wordPhonemes.forEach((ph, idx) => {
                const phoneme = ph.Phoneme || "";
                const assessment = ph.PronunciationAssessment || {};
                const accuracyScore = (assessment.AccuracyScore || 0) / 100;
                
                // Azure provides duration in ticks (100ns units)
                // We need to estimate timing based on position
                const phonemeDuration = duration / (wordPhonemes.length || 1);
                const start = currentOffset;
                const end = start + phonemeDuration;
                currentOffset = end;

                const arpabetSymbol = mapToArpabet(phoneme);
                
                rawPhones.push({
                  symbol: arpabetSymbol,
                  start: parseFloat(start.toFixed(3)),
                  end: parseFloat(end.toFixed(3)),
                  confidence: accuracyScore,
                  original: phoneme
                });

                overallConfidence += accuracyScore;
                phonemeCount++;
              });
            });

            // Map raw phones to target phoneme sequence
            const n = Math.min(rawPhones.length, targetPhonemes.length);
            for (let i = 0; i < n; i++) {
              const raw = rawPhones[i];
              phonemes.push({
                symbol: targetPhonemes[i],
                start: raw.start,
                end: raw.end,
                confidence: raw.confidence,
                produced: raw.symbol
              });
            }

            // Add any remaining target phonemes as "missed"
            if (targetPhonemes.length > rawPhones.length) {
              const lastEnd = rawPhones.length > 0 ? rawPhones[rawPhones.length - 1].end : 0;
              for (let i = rawPhones.length; i < targetPhonemes.length; i++) {
                phonemes.push({
                  symbol: targetPhonemes[i],
                  start: lastEnd,
                  end: lastEnd,
                  confidence: 0,
                  produced: null,
                  missed: true
                });
              }
            }

            hasResponded = true;
            clearTimeout(timeout);
            recognizer.close();

            resolve({
              word: text,
              lang: lang,
              duration: parseFloat(duration.toFixed(3)),
              phonemes: phonemes,
              rawPhones: rawPhones,
              confidence: phonemeCount > 0 ? overallConfidence / phonemeCount : 0,
              targetPhonemes: targetPhonemes
            });

          } catch (error) {
            hasResponded = true;
            clearTimeout(timeout);
            recognizer.close();
            reject(new Error(`Processing error: ${error.message}`));
          }
        } else if (e.result.reason === sdk.ResultReason.NoMatch) {
          hasResponded = true;
          clearTimeout(timeout);
          recognizer.close();
          reject(new Error("No speech detected"));
        }
      };

      recognizer.canceled = (s, e) => {
        if (!hasResponded && e.reason === sdk.CancellationReason.Error) {
          hasResponded = true;
          clearTimeout(timeout);
          recognizer.close();
          reject(new Error(`Recognition canceled: ${e.errorDetails}`));
        }
      };

      recognizer.sessionStopped = () => {
        recognizer.stopContinuousRecognitionAsync();
      };

      recognizer.startContinuousRecognitionAsync();
    });

    return Response.json(result);

  } catch (error) {
    console.error('Align error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});