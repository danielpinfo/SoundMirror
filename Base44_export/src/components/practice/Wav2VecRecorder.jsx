import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { mapPhonemesToBase44, getPhonemeBreakdown } from './phonemeMapper';

/**
 * Wav2Vec Phoneme Recorder
 * 
 * Records audio and sends it to the wav2vec2 phoneme backend.
 * Returns raw phoneme sequences, not words.
 */
export default function Wav2VecRecorder({ 
  targetWord = "",
  lang = "eng",
  onResult 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Convert audio to WAV format
  const convertToWav = async (audioBlob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Resample to 16kHz mono
    const offlineContext = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
    const source = offlineContext?.createBufferSource();
    
    if (!offlineContext || !source) {
      console.warn("convertToWav: offlineContext or source is missing");
      return null;
    }
    
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();
    
    const renderedBuffer = await offlineContext.startRendering();
    const wavBuffer = audioBufferToWav(renderedBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  // Convert AudioBuffer to WAV ArrayBuffer
  const audioBufferToWav = (buffer) => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let pos = 0;

    const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };

    // WAV header
    setUint32(0x46464952);  // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157);  // "WAVE"
    setUint32(0x20746d66);  // "fmt "
    setUint32(16);
    setUint16(1);  // PCM
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);  // bits per sample
    setUint32(0x61746164);  // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 0;
    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  };

  const startRecording = async () => {
    setError(null);
    setResult(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
      });

      let options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'audio/webm' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {};
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Combine audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      
      // Convert to WAV
      const wavBlob = await convertToWav(audioBlob);
      
      if (!wavBlob) {
        console.warn("convertToWav returned null, aborting");
        setError("Failed to process audio");
        return;
      }
      
      // Upload to Base44
      const file = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Call wav2vec2 phoneme backend via Base44 function
      const response = await base44.functions.invoke('analyzePhonemes', {
        audioFileUrl: file_url,
        lang: lang,
      });

      const phonemeData = response.data;
      
      // Map phonemes to Base44 spelling
      const base44Spelling = mapPhonemesToBase44(phonemeData.phonemes);
      const breakdown = getPhonemeBreakdown(phonemeData.phonemes);

      const resultData = {
        rawPhonemes: phonemeData.phonemes,
        phonemeList: phonemeData.phoneme_list,
        base44Spelling: base44Spelling,
        breakdown: breakdown,
        targetWord: targetWord,
        model: phonemeData.model,
        lang: phonemeData.lang,
      };

      setResult(resultData);
      
      if (onResult) {
        onResult(resultData);
      }

      // Log for verification
      console.log('=== PHONEME RESULT ===');
      console.log('Target:', targetWord);
      console.log('Raw phonemes:', phonemeData.phonemes);
      console.log('Base44 spelling:', base44Spelling);
      console.log('Breakdown:', breakdown);

    } catch (err) {
      console.error('Processing error:', err);
      setError(`Failed to analyze: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-2 border-slate-600 bg-slate-800">
      <CardContent className="pt-6 space-y-4">
        {/* Target word display */}
        {targetWord && (
          <div className="text-center">
            <p className="text-sm text-slate-400">Target word:</p>
            <p className="text-2xl font-bold text-blue-400">{targetWord}</p>
          </div>
        )}

        {/* Recording button */}
        <div className="flex justify-center">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-slate-300 text-sm">Analyzing phonemes...</p>
            </div>
          ) : isRecording ? (
            <Button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 animate-pulse"
            >
              <Square className="h-8 w-8" />
            </Button>
          ) : (
            <Button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Mic className="h-8 w-8" />
            </Button>
          )}
        </div>

        <p className="text-center text-slate-400 text-sm">
          {isRecording ? 'Recording... Click to stop' : 'Click to record'}
        </p>

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Result display */}
        {result && (
          <div className="space-y-4 p-4 bg-slate-700 rounded-lg">
            <div>
              <p className="text-sm text-slate-400 mb-1">Raw Phonemes (from wav2vec2):</p>
              <p className="text-lg font-mono text-purple-400">{result.rawPhonemes}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400 mb-1">Base44 Spelling:</p>
              <p className="text-2xl font-bold text-green-400">{result.base44Spelling}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">Phoneme Breakdown:</p>
              <div className="flex flex-wrap gap-2">
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-600 px-2 py-1 rounded text-sm">
                    <span className="text-purple-300">{item.phoneme}</span>
                    <span className="text-slate-400 mx-1">→</span>
                    <span className="text-green-300">{item.base44 || '∅'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Model: {result.model}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}