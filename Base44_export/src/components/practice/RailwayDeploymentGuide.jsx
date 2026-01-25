/**
 * RAILWAY DEPLOYMENT GUIDE
 * Deploy 8 language-specific phoneme backends (one per language)
 */

export default function RailwayDeploymentGuide() {
  const languages = [
    { code: 'fr', name: 'French', locale: 'fr-FR', model: 'facebook/wav2vec2-large-xlsr-53-french' },
    { code: 'de', name: 'German', locale: 'de-DE', model: 'facebook/wav2vec2-large-xlsr-53-german' },
    { code: 'it', name: 'Italian', locale: 'it-IT', model: 'facebook/wav2vec2-large-xlsr-53-italian' },
    { code: 'pt', name: 'Portuguese', locale: 'pt-PT', model: 'facebook/wav2vec2-large-xlsr-53-portuguese' },
    { code: 'ja', name: 'Japanese', locale: 'ja-JP', model: 'jonatasgrosman/wav2vec2-large-xlsr-53-japanese' },
    { code: 'zh', name: 'Chinese', locale: 'zh-CN', model: 'jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn' },
    { code: 'hi', name: 'Hindi', locale: 'hi-IN', model: 'jonatasgrosman/wav2vec2-large-xlsr-53-hindi' },
    { code: 'ar', name: 'Arabic', locale: 'ar-SA', model: 'jonatasgrosman/wav2vec2-large-xlsr-53-arabic' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-900 text-slate-100 space-y-6">
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-blue-300 mb-2">🚂 Railway Deployment Guide</h1>
        <p className="text-slate-300 text-sm">
          Deploy 8 phoneme backends (one per language) on Railway. Each deployment takes ~5 minutes.
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 className="text-lg font-bold text-indigo-300 mb-3">📋 Quick Deploy Checklist</h2>
        <div className="space-y-2 text-sm">
          {languages.map((lang, idx) => (
            <div key={lang.code} className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-slate-300">
                {idx + 1}. Deploy <span className="font-mono text-yellow-300">{lang.name}</span> ({lang.code})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-indigo-400">Step-by-Step Instructions</h2>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
          <h3 className="font-bold text-green-400">1️⃣ Create GitHub Repository (One Time)</h3>
          <div className="text-sm space-y-2 text-slate-300">
            <p>Create a new repo with these files:</p>
            <div className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-xs space-y-2">
              <div>
                <div className="text-yellow-300">requirements.txt:</div>
                <pre className="text-slate-400 ml-4">
{`fastapi==0.104.1
uvicorn[standard]==0.24.0
transformers==4.35.2
torch==2.1.1
torchaudio==2.1.1
librosa==0.10.1
soundfile==0.12.1
python-multipart==0.0.6
pydantic==2.5.0
numpy==1.24.3`}
                </pre>
              </div>

              <div className="mt-4">
                <div className="text-yellow-300">app.py:</div>
                <pre className="text-slate-400 ml-4 text-[10px] max-h-64 overflow-y-auto">
{`from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import io
import os
import uvicorn

app = FastAPI(title="SoundMirror Phoneme Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get model from environment (set in Railway)
MODEL_ID = os.getenv("MODEL_ID", "facebook/wav2vec2-large-xlsr-53-english")
LANGUAGE = os.getenv("LANGUAGE", "en")

print(f"Loading model: {MODEL_ID}")
processor = Wav2Vec2Processor.from_pretrained(MODEL_ID)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_ID)
print("Model loaded successfully!")

def load_audio(file_bytes):
    audio, sr = torchaudio.load(io.BytesIO(file_bytes))
    if sr != 16000:
        resampler = torchaudio.transforms.Resample(sr, 16000)
        audio = resampler(audio)
    if audio.shape[0] > 1:
        audio = torch.mean(audio, dim=0, keepdim=True)
    return audio.squeeze()

@app.get("/")
async def root():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "language": LANGUAGE,
        "service": "SoundMirror Phoneme Backend"
    }

@app.post("/phonemes")
async def analyze_phonemes(
    file: UploadFile = File(...),
    lang: str = Query(LANGUAGE)
):
    try:
        audio_bytes = await file.read()
        waveform = load_audio(audio_bytes)
        
        inputs = processor(waveform, sampling_rate=16000, return_tensors="pt", padding=True)
        
        with torch.no_grad():
            logits = model(inputs.input_values).logits
        
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = processor.batch_decode(predicted_ids)[0]
        
        tokens = transcription.strip().split()
        
        return {
            "lang": lang,
            "model": MODEL_ID,
            "phonemes": transcription,
            "phoneme_list": tokens,
            "tokens": tokens,
            "clean_tokens": tokens,
            "primary": tokens[0] if tokens else "",
            "raw_transcription": transcription,
            "ipa_units": tokens,
            "raw_text": transcription
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/expected_ipa")
async def get_expected_ipa(text: str = Query(...), lang: str = Query(LANGUAGE)):
    return {
        "text": text,
        "lang": lang,
        "ipa": text.lower()
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)`}
                </pre>
              </div>

              <div className="mt-4">
                <div className="text-yellow-300">Dockerfile:</div>
                <pre className="text-slate-400 ml-4">
{`FROM python:3.10-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \\
    gcc g++ libsndfile1 && \\
    rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 8000
CMD ["python", "app.py"]`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
          <h3 className="font-bold text-green-400">2️⃣ Deploy Each Language on Railway</h3>
          <div className="text-sm space-y-3 text-slate-300">
            <p>For each language below, deploy a separate Railway service:</p>

            {languages.map((lang) => (
              <div key={lang.code} className="bg-slate-900/50 p-3 rounded border border-slate-700">
                <div className="font-bold text-yellow-300 mb-2">
                  {lang.name} ({lang.code})
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Service Name:</span>{' '}
                    <span className="text-green-300">soundmirror-{lang.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">MODEL_ID:</span>{' '}
                    <span className="text-blue-300">{lang.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">LANGUAGE:</span>{' '}
                    <span className="text-blue-300">{lang.code}</span>
                  </div>
                  <div className="mt-2 text-slate-400">
                    1. Railway.app → New Project → Deploy from GitHub<br/>
                    2. Select your repo<br/>
                    3. Add environment variables (MODEL_ID, LANGUAGE)<br/>
                    4. Deploy!<br/>
                    5. Copy the URL: https://soundmirror-{lang.code}-production.up.railway.app
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
          <h3 className="font-bold text-green-400">3️⃣ Set Secrets in Base44</h3>
          <div className="text-sm text-slate-300 space-y-2">
            <p>Once all 8 services are deployed, add these secrets in Base44:</p>
            <div className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-xs space-y-1">
              {languages.map((lang) => (
                <div key={lang.code} className="text-slate-400">
                  PHONEME_BACKEND_URL_{lang.code.toUpperCase()}: <span className="text-green-300">https://soundmirror-{lang.code}-production.up.railway.app</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
          <h3 className="font-bold text-green-300 mb-2">✅ Verification</h3>
          <div className="text-sm text-slate-300 space-y-1">
            <p>Test each backend:</p>
            <div className="font-mono text-xs bg-slate-900 p-2 rounded mt-2">
              curl https://soundmirror-fr-production.up.railway.app/
            </div>
            <p className="mt-2 text-slate-400">Should return: {`{"status":"ok","model":"...","language":"fr"}`}</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4">
        <h3 className="font-bold text-amber-300 mb-2">⚠️ Important Notes</h3>
        <ul className="text-sm text-slate-300 space-y-1 list-disc ml-5">
          <li>Each deployment takes ~10 minutes (model download + build)</li>
          <li>Railway will auto-scale based on usage</li>
          <li>First request after idle takes 30s (cold start)</li>
          <li>All 8 backends use the same code, just different MODEL_ID</li>
          <li>Total cost: ~$5-20/month depending on usage</li>
        </ul>
      </div>
    </div>
  );
}