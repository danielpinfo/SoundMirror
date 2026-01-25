/**
 * ============================================================
 * WAV2VEC2 PHONEME BACKEND - DEPLOYMENT FILES
 * ============================================================
 * 
 * These files need to be deployed on a Python-capable server
 * (NOT on Base44's Deno backend). Options:
 * - Railway.app
 * - Render.com
 * - DigitalOcean / AWS / GCP
 * - Your own VPS
 * 
 * Once deployed, set the PHONEME_BACKEND_URL secret in Base44.
 */

// ============================================================
// FILE 1: requirements.txt
// ============================================================
export const REQUIREMENTS_TXT = `
fastapi
uvicorn[standard]
transformers
torch
torchaudio
soundfile
python-multipart
`.trim();

// ============================================================
// FILE 2: app.py
// ============================================================
export const APP_PY = `
# app.py
#
# FastAPI backend for Base44 using wav2vec2 phoneme models.
# - Accepts WAV audio via POST /phonemes
# - Resamples to 16kHz
# - Uses wav2vec2 phoneme models to output phonetic labels (NOT words)
# - Supports a "lang" parameter to switch between models / configs if needed.
#
# Primary model (multilingual phonetic labels):
#   facebook/wav2vec2-lv-60-espeak-cv-ft
#

import io
import torch
import torchaudio
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC

app = FastAPI(title="Base44 wav2vec2 Phoneme Backend")

# Enable CORS for Base44 frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your Base44 domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TARGET_SR = 16000  # wav2vec2 expects 16kHz audio

# --------
# MODELS
# --------

# Default phoneme model (multi-language via espeak labels)
DEFAULT_MODEL_NAME = "facebook/wav2vec2-lv-60-espeak-cv-ft"

# Model configurations for different languages
MODEL_CONFIGS = {
    "default": DEFAULT_MODEL_NAME,
    "eng": DEFAULT_MODEL_NAME,
    "mul": DEFAULT_MODEL_NAME,  # multilingual
    # Add more language keys as needed
}

# Load processors & models once at startup
_processors = {}
_models = {}


def get_model_and_processor(lang_key: str):
    """
    Get (processor, model_name, model) for the given language key.
    Falls back to 'default' if unknown.
    """
    if lang_key not in MODEL_CONFIGS:
        lang_key = "default"

    model_name = MODEL_CONFIGS[lang_key]

    if model_name not in _processors:
        print(f"Loading processor for {model_name}...")
        _processors[model_name] = Wav2Vec2Processor.from_pretrained(model_name)
    
    if model_name not in _models:
        print(f"Loading model {model_name}...")
        model = Wav2Vec2ForCTC.from_pretrained(model_name)
        model.eval()
        _models[model_name] = model

    return _processors[model_name], model_name, _models[model_name]


# -------------
# AUDIO HELPERS
# -------------

def load_and_resample_to_16k(wav_bytes: bytes) -> torch.Tensor:
    """
    Load audio from bytes, convert to mono float32 tensor, resample to 16kHz.
    """
    with io.BytesIO(wav_bytes) as buf:
        audio, sr = sf.read(buf, dtype="float32")

    if audio.ndim > 1:
        audio = audio.mean(axis=1)  # average stereo to mono

    waveform = torch.from_numpy(audio)

    if sr != TARGET_SR:
        waveform = torchaudio.functional.resample(
            waveform, orig_freq=sr, new_freq=TARGET_SR
        )

    return waveform


# -------------
# API ENDPOINTS
# -------------

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "model": DEFAULT_MODEL_NAME}


@app.post("/phonemes")
async def phonemes(
    file: UploadFile = File(...),
    lang: str = Query("eng", description="Language key: eng, mul, etc.")
):
    """
    Accept a WAV file and return phoneme sequence using wav2vec2 phoneme model.
    
    Returns raw phoneme sequence (e.g., "b l iː s l i b uː s") 
    WITHOUT word-level normalization.
    """

    # Accept various WAV content types
    allowed_types = (
        "audio/wav", "audio/x-wav", "audio/wave", 
        "audio/vnd.wave", "application/octet-stream"
    )
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content-type {file.content_type}. Please upload a WAV file.",
        )

    try:
        wav_bytes = await file.read()
        
        if len(wav_bytes) < 100:
            raise HTTPException(status_code=400, detail="Audio file too small or empty")
        
        waveform = load_and_resample_to_16k(wav_bytes)
        
        if waveform.numel() == 0:
            raise HTTPException(status_code=400, detail="Could not decode audio")

        processor, model_name, model = get_model_and_processor(lang_key=lang)

        with torch.no_grad():
            inputs = processor(
                waveform,
                sampling_rate=TARGET_SR,
                return_tensors="pt"
            )

            logits = model(inputs.input_values).logits
            predicted_ids = torch.argmax(logits, dim=-1)

            # Decode to a string of phonetic labels (NOT words)
            # This gives us raw phonemes like "b l iː s l i b uː s"
            transcription = processor.batch_decode(predicted_ids)[0]

        # Clean up the transcription
        transcription = transcription.strip()
        
        # Split into individual phonemes for easier processing
        phoneme_list = transcription.split()

        return JSONResponse(
            content={
                "phonemes": transcription,       # Full string: "b l iː s l i b uː s"
                "phoneme_list": phoneme_list,    # Array: ["b", "l", "iː", ...]
                "lang": lang,
                "model": model_name,
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Phoneme recognition failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    # Preload the default model at startup
    print("Preloading default model...")
    get_model_and_processor("default")
    print("Model loaded. Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
`.trim();

// ============================================================
// FILE 3: Dockerfile (optional, for containerized deployment)
// ============================================================
export const DOCKERFILE = `
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    libsndfile1 \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .

# Preload the model during build (optional, makes cold starts faster)
# RUN python -c "from app import get_model_and_processor; get_model_and_processor('default')"

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
`.trim();

// ============================================================
// DEPLOYMENT INSTRUCTIONS
// ============================================================
export const DEPLOYMENT_INSTRUCTIONS = `
# WAV2VEC2 PHONEME BACKEND DEPLOYMENT

## Option 1: Railway.app (Recommended - Easy)

1. Create a new project on railway.app
2. Connect your GitHub repo or upload files
3. Railway will auto-detect Python and deploy
4. Note your deployment URL (e.g., https://your-app.railway.app)
5. Set PHONEME_BACKEND_URL in Base44 secrets

## Option 2: Render.com

1. Create a new Web Service
2. Connect repo or upload files
3. Set build command: pip install -r requirements.txt
4. Set start command: uvicorn app:app --host 0.0.0.0 --port $PORT
5. Note your URL and set in Base44

## Option 3: Self-hosted (VPS)

1. SSH into your server
2. Install Python 3.10+
3. Clone/upload the files
4. Run:
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app:app --host 0.0.0.0 --port 8000

5. Set up nginx reverse proxy with HTTPS
6. Set PHONEME_BACKEND_URL in Base44

## Testing the Backend

curl -X POST "http://localhost:8000/phonemes?lang=eng" \\
  -F "file=@test_audio.wav"

Expected response:
{
  "phonemes": "h ɛ l oʊ",
  "phoneme_list": ["h", "ɛ", "l", "oʊ"],
  "lang": "eng",
  "model": "facebook/wav2vec2-lv-60-espeak-cv-ft"
}
`.trim();

export default {
  REQUIREMENTS_TXT,
  APP_PY,
  DOCKERFILE,
  DEPLOYMENT_INSTRUCTIONS
};