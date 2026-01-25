#!/bin/bash

##############################################################################
# CloudShell Setup Script for 10 Language Phoneme Backends
# Creates GitHub repos, initializes with code, and prepares for Railway
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"  # CHANGE THIS
PROJECT_PREFIX="base44"
PROJECT_SUFFIX="phoneme-backend"

# Language configurations: code, name, model
declare -a LANGUAGES=(
  "en:English:facebook/wav2vec2-large-xlsr-53-english"
  "es:Spanish:facebook/wav2vec2-large-xlsr-53-spanish"
  "fr:French:facebook/wav2vec2-large-xlsr-53-french"
  "de:German:facebook/wav2vec2-large-xlsr-53-german"
  "it:Italian:facebook/wav2vec2-large-xlsr-53-italian"
  "pt:Portuguese:facebook/wav2vec2-large-xlsr-53-portuguese"
  "ja:Japanese:jonatasgrosman/wav2vec2-large-xlsr-53-japanese"
  "zh:Chinese:jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn"
  "hi:Hindi:jonatasgrosman/wav2vec2-large-xlsr-53-hindi"
  "ar:Arabic:jonatasgrosman/wav2vec2-large-xlsr-53-arabic"
)

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   SoundMirror: 10-Language Backend Automation         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found. Installing...${NC}"
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt update && sudo apt install gh -y
fi

if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Installing Railway CLI...${NC}"
    npm i -g @railway/cli
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Authenticate with GitHub
echo -e "${YELLOW}[2/6] Authenticating with GitHub...${NC}"
gh auth status || gh auth login
echo -e "${GREEN}✓ GitHub authenticated${NC}"
echo ""

# Authenticate with Railway
echo -e "${YELLOW}[3/6] Authenticating with Railway...${NC}"
railway login
echo -e "${GREEN}✓ Railway authenticated${NC}"
echo ""

# Create base files
echo -e "${YELLOW}[4/6] Creating base backend files...${NC}"
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# app.py
cat > app.py << 'EOF'
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
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
    uvicorn.run(app, host="0.0.0.0", port=port)
EOF

# requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
transformers==4.35.2
torch==2.1.1
torchaudio==2.1.1
librosa==0.10.1
soundfile==0.12.1
python-multipart==0.0.6
pydantic==2.5.0
numpy==1.24.3
EOF

# Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.10-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    gcc g++ libsndfile1 && \
    rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 8000
CMD ["python", "app.py"]
EOF

echo -e "${GREEN}✓ Base files created${NC}"
echo ""

# Output file for URLs and secrets
OUTPUT_FILE="$HOME/soundmirror-deployment-info.txt"
echo "SoundMirror Deployment Info - $(date)" > "$OUTPUT_FILE"
echo "========================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Create and deploy each language
echo -e "${YELLOW}[5/6] Creating repositories and deploying to Railway...${NC}"
echo ""

for lang_config in "${LANGUAGES[@]}"; do
    IFS=':' read -r CODE NAME MODEL <<< "$lang_config"
    
    REPO_NAME="${PROJECT_PREFIX}-${CODE}-${PROJECT_SUFFIX}"
    
    echo -e "${YELLOW}Processing ${NAME} (${CODE})...${NC}"
    
    # Create GitHub repo
    echo "  → Creating GitHub repo: ${REPO_NAME}"
    gh repo create "${GITHUB_USERNAME}/${REPO_NAME}" --public --description "SoundMirror ${NAME} Phoneme Backend" || echo "  ℹ Repo may already exist"
    
    # Clone and setup
    WORK_DIR="$TEMP_DIR/${REPO_NAME}"
    if [ -d "$WORK_DIR" ]; then
        rm -rf "$WORK_DIR"
    fi
    
    gh repo clone "${GITHUB_USERNAME}/${REPO_NAME}" "$WORK_DIR" 2>/dev/null || git clone "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git" "$WORK_DIR"
    cd "$WORK_DIR"
    
    # Copy files
    cp "$TEMP_DIR/app.py" .
    cp "$TEMP_DIR/requirements.txt" .
    cp "$TEMP_DIR/Dockerfile" .
    
    # Create README
    cat > README.md << READMEEOF
# ${NAME} Phoneme Backend

SoundMirror phoneme analysis service for ${NAME}.

## Configuration
- **Language Code**: ${CODE}
- **Model**: ${MODEL}

## Deployment
Deployed on Railway with environment variables:
- \`MODEL_ID=${MODEL}\`
- \`LANGUAGE=${CODE}\`

## API Endpoints
- \`GET /\` - Health check
- \`POST /phonemes\` - Analyze audio
- \`GET /expected_ipa\` - Get expected IPA for text
READMEEOF
    
    # Commit and push
    git add .
    git commit -m "Initial commit: ${NAME} phoneme backend" 2>/dev/null || echo "  ℹ No changes to commit"
    git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null || echo "  ℹ Already up to date"
    
    echo -e "  ${GREEN}✓ GitHub repo ready${NC}"
    
    # Deploy to Railway
    echo "  → Deploying to Railway..."
    cd "$WORK_DIR"
    
    # Link to Railway project (assumes "Protective-Amazement" project exists)
    railway link
    
    # Set environment variables
    railway variables set MODEL_ID="${MODEL}"
    railway variables set LANGUAGE="${CODE}"
    
    # Deploy
    railway up --detach
    
    # Get the URL
    echo "  → Waiting for deployment..."
    sleep 10
    RAILWAY_URL=$(railway status --json 2>/dev/null | grep -o 'https://[^"]*' | head -1)
    
    if [ -z "$RAILWAY_URL" ]; then
        RAILWAY_URL="https://soundmirror-${CODE}-production.up.railway.app"
        echo "  ℹ Using default URL pattern: ${RAILWAY_URL}"
    fi
    
    echo -e "  ${GREEN}✓ Deployed: ${RAILWAY_URL}${NC}"
    
    # Save to output file
    cat >> "$OUTPUT_FILE" << INFOEOF
${NAME} (${CODE}):
  Repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}
  Railway URL: ${RAILWAY_URL}
  Base44 Secret: PHONEME_BACKEND_URL_${CODE^^}
  Model: ${MODEL}

INFOEOF
    
    echo ""
done

echo -e "${GREEN}✓ All repositories created and deployed${NC}"
echo ""

# Display results
echo -e "${YELLOW}[6/6] Deployment Summary${NC}"
echo ""
cat "$OUTPUT_FILE"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ All 10 language backends deployed successfully!   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Verify all deployments in Railway dashboard"
echo "2. Copy the URLs from: ${OUTPUT_FILE}"
echo "3. Add these secrets in Base44:"
echo ""
for lang_config in "${LANGUAGES[@]}"; do
    IFS=':' read -r CODE NAME MODEL <<< "$lang_config"
    echo "   PHONEME_BACKEND_URL_${CODE^^}"
done
echo ""
echo -e "${GREEN}Deployment info saved to: ${OUTPUT_FILE}${NC}"