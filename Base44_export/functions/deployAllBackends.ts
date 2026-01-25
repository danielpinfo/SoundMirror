import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const LANGUAGES = [
  { code: 'en', name: 'English', model: 'facebook/wav2vec2-large-xlsr-53-english' },
  { code: 'es', name: 'Spanish', model: 'facebook/wav2vec2-large-xlsr-53-spanish' },
  { code: 'fr', name: 'French', model: 'facebook/wav2vec2-large-xlsr-53-french' },
  { code: 'de', name: 'German', model: 'facebook/wav2vec2-large-xlsr-53-german' },
  { code: 'it', name: 'Italian', model: 'facebook/wav2vec2-large-xlsr-53-italian' },
  { code: 'pt', name: 'Portuguese', model: 'facebook/wav2vec2-large-xlsr-53-portuguese' },
  { code: 'ja', name: 'Japanese', model: 'jonatasgrosman/wav2vec2-large-xlsr-53-japanese' },
  { code: 'zh', name: 'Chinese', model: 'jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn' },
  { code: 'hi', name: 'Hindi', model: 'jonatasgrosman/wav2vec2-large-xlsr-53-hindi' },
  { code: 'ar', name: 'Arabic', model: 'jonatasgrosman/wav2vec2-large-xlsr-53-arabic' }
];

const REQUIREMENTS_TXT = `fastapi==0.104.1
uvicorn[standard]==0.24.0
transformers==4.35.2
torch==2.1.1
torchaudio==2.1.1
librosa==0.10.1
soundfile==0.12.1
python-multipart==0.0.6
pydantic==2.5.0
numpy==1.24.3`;

const APP_PY = `from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import io
import os
import uvicorn

app = FastAPI(title="SoundMirror Phoneme Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_ID = os.getenv("MODEL_ID", "facebook/wav2vec2-large-xlsr-53-english")
LANGUAGE = os.getenv("LANGUAGE", "en")

# Lazy load model to avoid Railway startup timeout
processor = None
model = None

def load_model():
    global processor, model
    if processor is None or model is None:
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
        "model_loaded": processor is not None and model is not None,
        "service": "SoundMirror Phoneme Backend"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/phonemes")
async def analyze_phonemes(
    file: UploadFile = File(...),
    lang: str = Query(LANGUAGE)
):
    try:
        load_model()  # Lazy load on first request
        
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
    uvicorn.run(app, host="0.0.0.0", port=port)`;

const DOCKERFILE = `FROM python:3.10-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \\
    gcc g++ libsndfile1 && \\
    rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 8000
CMD ["python", "app.py"]`;

const README_MD = `# SoundMirror Phoneme Backend
Automated deployment of 10 language-specific phoneme analysis services.

## Languages
- English, Spanish, French, German, Italian, Portuguese
- Japanese, Chinese, Hindi, Arabic

## Deployment
Deployed via Railway with language-specific environment variables.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const githubToken = Deno.env.get('GitHubToken');
    const railwayToken = Deno.env.get('Railway_Token');
    const railwayProjectId = '185b3721-1d16-4d52-b862-30c0bc529581';

    if (!githubToken || !railwayToken) {
      return Response.json({ 
        error: 'Missing tokens. Set GitHubToken and Railway_Token in Base44 secrets.' 
      }, { status: 400 });
    }

    const logs = [];
    logs.push('🚀 Starting automated deployment...\n');

    // Step 1: Get or create GitHub repository
    logs.push('📦 Checking GitHub repository...');
    const repoName = 'soundmirror-phoneme-backend';
    
    // Get GitHub username
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    const userData = await userRes.json();
    const githubUsername = userData.login;
    const repoFullName = `${githubUsername}/${repoName}`;

    // Step 2: Ensure files exist on GitHub
    logs.push('📝 Checking GitHub files...');
    
    const files = [
      { path: 'requirements.txt', content: REQUIREMENTS_TXT },
      { path: 'app.py', content: APP_PY },
      { path: 'Dockerfile', content: DOCKERFILE },
      { path: 'README.md', content: README_MD }
    ];

    for (const file of files) {
      // Check if file exists
      const checkRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${file.path}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (checkRes.ok) {
        logs.push(`  ✓ ${file.path} exists`);
      } else {
        // File doesn't exist, create it
        const createFileRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${file.path}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Add ${file.path}`,
            content: btoa(file.content)
          })
        });

        if (createFileRes.ok) {
          logs.push(`  ✓ ${file.path} created`);
        } else {
          const error = await createFileRes.json();
          logs.push(`  ⚠ ${file.path} failed: ${error.message}`);
        }
      }
    }
    logs.push('✓ All files ready\n');

    // Step 3: Deploy each language service on Railway
    logs.push('🚂 Deploying Railway services...\n');
    const results = [];
    const errors = [];

    for (const lang of LANGUAGES) {
      try {
        logs.push(`  Deploying ${lang.name} (${lang.code})...`);

        // Create service with more detailed error handling
        const createServiceRes = await fetch('https://backboard.railway.app/graphql/v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${railwayToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: `
              mutation serviceCreate($input: ServiceCreateInput!) {
                serviceCreate(input: $input) {
                  id
                  name
                }
              }
            `,
            variables: {
              input: {
                name: `soundmirror-${lang.code}`,
                projectId: railwayProjectId,
                source: {
                  repo: repoFullName,
                  branch: "main"
                }
              }
            }
          })
        });

        const responseText = await createServiceRes.text();
        let serviceResult;
        try {
          serviceResult = JSON.parse(responseText);
        } catch {
          throw new Error(`Railway API error: ${responseText.slice(0, 200)}`);
        }
        
        if (serviceResult.errors) {
          throw new Error(JSON.stringify(serviceResult.errors));
        }

        if (!serviceResult.data?.serviceCreate?.id) {
          throw new Error(`No service ID returned: ${JSON.stringify(serviceResult)}`);
        }

        const serviceId = serviceResult.data.serviceCreate.id;

        // Set environment variables
        const varsRes = await fetch('https://backboard.railway.app/graphql/v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${railwayToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: `
              mutation variableCollectionUpsert($input: VariableCollectionUpsertInput!) {
                variableCollectionUpsert(input: $input) {
                  id
                }
              }
            `,
            variables: {
              input: {
                serviceId: serviceId,
                environmentId: "production",
                variables: {
                  MODEL_ID: lang.model,
                  LANGUAGE: lang.code
                }
              }
            }
          })
        });

        const varsResult = await varsRes.json();
        if (varsResult.errors) {
          logs.push(`    ⚠ Env vars warning: ${varsResult.errors[0].message}`);
        }

        const url = `https://soundmirror-${lang.code}-production.up.railway.app`;
        results.push({
          language: lang.code,
          name: lang.name,
          url,
          serviceId
        });

        logs.push(`    ✓ ${lang.name} deployed: ${url}`);

      } catch (error) {
        logs.push(`    ✗ ${lang.name} failed: ${error.message}`);
        errors.push({
          language: lang.code,
          error: error.message
        });
      }
    }

    logs.push('\n✅ Deployment complete!');
    logs.push(`\n📊 Results: ${results.length} deployed, ${errors.length} failed`);
    logs.push('\n⏳ Wait ~10 minutes for services to build and start');
    logs.push('\n🔗 Next: Set these secrets in Base44:');
    for (const result of results) {
      logs.push(`   PHONEME_BACKEND_URL_${result.language.toUpperCase()}: ${result.url}`);
    }

    return Response.json({
      success: true,
      github_repo: `https://github.com/${repoFullName}`,
      deployed: results.length,
      failed: errors.length,
      results,
      errors,
      logs: logs.join('\n')
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});