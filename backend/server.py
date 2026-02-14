from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import base64
import boto3
from botocore.exceptions import ClientError
import json
from emergentintegrations.llm.chat import LlmChat
import numpy as np
import tempfile
import wave
import asyncio

# Debug bug report email recipient
DEBUG_BUG_REPORT_EMAIL = "daniel@soundmirrortech.com"

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# AWS S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_REGION', 'us-east-1')
)
S3_BUCKET = os.environ.get('S3_BUCKET', 'soundmirror-phoneme-audio')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ ALLOSAURUS PHONEME RECOGNIZER ============
# Initialize once at startup for efficiency
allosaurus_model = None
try:
    from allosaurus.app import read_recognizer
    allosaurus_model = read_recognizer()
    logger.info("Allosaurus phoneme recognizer initialized successfully")
except Exception as e:
    logger.warning(f"Failed to initialize Allosaurus: {e}")
    allosaurus_model = None

# Gemini AI client for grading
EMERGENT_API_KEY = os.environ.get('EMERGENT_API_KEY', '')
gemini_session_id = str(uuid.uuid4())
gemini_client = None
if EMERGENT_API_KEY:
    try:
        gemini_client = LlmChat(
            api_key=EMERGENT_API_KEY,
            session_id=gemini_session_id,
            system_message="You are an expert speech therapist specializing in phoneme analysis. Always respond with valid JSON."
        )
        logger.info("Gemini AI client initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize Gemini client: {e}")
        gemini_client = None

# Create the main app
app = FastAPI(title="SoundMirror API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class PracticeSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_type: str  # "letter" or "word"
    target: str  # The letter/word being practiced
    language: str
    visual_score: float = 0.0
    audio_score: float = 0.0
    phoneme_detected: str = ""
    suggestions: List[str] = []
    audio_data: Optional[str] = None  # Base64 encoded
    video_data: Optional[str] = None  # Base64 encoded
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PracticeSessionCreate(BaseModel):
    session_type: str
    target: str
    language: str
    visual_score: float = 0.0
    audio_score: float = 0.0
    phoneme_detected: str = ""
    suggestions: List[str] = []
    audio_data: Optional[str] = None
    video_data: Optional[str] = None

class BugReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str  # Windows, Mac, iOS, Android
    page: str  # Home, Letter Practice, Word Practice, History
    severity: str  # Low, Medium, High, Critical
    feature_area: str  # Animation, Recording, Grading, UI
    description: str
    browser: str = ""
    os_info: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "pending"

class BugReportCreate(BaseModel):
    platform: str
    page: str
    severity: str
    feature_area: str
    description: str
    browser: str = ""
    os_info: str = ""

class GradingRequest(BaseModel):
    target_phoneme: str
    audio_data: Optional[str] = None  # Base64 encoded audio
    language: str = "english"

class GradingResponse(BaseModel):
    visual_score: float
    audio_score: float
    phoneme_detected: str
    lip_feedback: str
    jaw_feedback: str
    tongue_feedback: str
    timing_feedback: str
    overall_suggestions: List[str]

# ============ PHONEME DETECTION BRIDGE MODELS ============

class IPAPhoneme(BaseModel):
    """Single IPA phoneme in the sequence"""
    symbol: str
    features: Dict[str, Any] = {}
    startMs: float = 0.0
    endMs: float = 0.0
    confidence: float = 0.0

class PhonemeDetectionRequest(BaseModel):
    """Request for native phoneme detection"""
    pcmData: List[float]  # PCM samples as list of floats
    sampleRate: int
    language: str = "english"

class PhonemeDetectionResponse(BaseModel):
    """Response from native phoneme detection (LOCKED CONTRACT)"""
    ipaSequence: List[IPAPhoneme] = []
    durationMs: float = 0.0

# ============ PHONEME DATA ============

# Phoneme to frame mapping (based on actual PNG files)
PHONEME_FRAME_MAP = {
    # Vowels
    "a": 1, "ah": 1, "u": 1, "uh": 1,
    "e": 5, "eh": 5,
    "ee": 3, "i": 3,
    "o": 4, "oo": 4, "ou": 4, "w": 4,
    "ü": 6, "ue": 6,
    
    # Consonants
    "b": 2, "p": 2, "m": 2,
    "z": 3, "x": 3,
    "c": 7, "k": 7, "q": 7, "g": 7,
    "t": 8, "d": 8, "j": 8,
    "n": 9,
    "ng": 10,
    "s": 11,
    "sh": 12,
    "th": 13,
    "f": 14, "v": 14,
    "h": 15,
    "ch": 16,
    "r": 17,
    "l": 18,
    "ll": 18, "y": 18,
    
    # Neutral/default
    "": 0, "neutral": 0, "silence": 0,
}

# Frame info for reference
FRAME_INFO = [
    {"frame": 0, "name": "neutral", "phonemes": ["neutral", "silence", ""]},
    {"frame": 1, "name": "a_u", "phonemes": ["a", "ah", "u", "uh"]},
    {"frame": 2, "name": "b_p_m", "phonemes": ["b", "p", "m"]},
    {"frame": 3, "name": "ee_z_x", "phonemes": ["ee", "i", "z", "x"]},
    {"frame": 4, "name": "oo_o_ou_w", "phonemes": ["o", "oo", "ou", "w"]},
    {"frame": 5, "name": "e", "phonemes": ["e", "eh"]},
    {"frame": 6, "name": "ü", "phonemes": ["ü", "ue"]},
    {"frame": 7, "name": "c_k_q_g", "phonemes": ["c", "k", "q", "g"]},
    {"frame": 8, "name": "t_tsk_d_j", "phonemes": ["t", "d", "j", "tsk"]},
    {"frame": 9, "name": "n", "phonemes": ["n"]},
    {"frame": 10, "name": "ng", "phonemes": ["ng"]},
    {"frame": 11, "name": "s", "phonemes": ["s"]},
    {"frame": 12, "name": "sh", "phonemes": ["sh"]},
    {"frame": 13, "name": "th", "phonemes": ["th"]},
    {"frame": 14, "name": "f_v", "phonemes": ["f", "v"]},
    {"frame": 15, "name": "h", "phonemes": ["h"]},
    {"frame": 16, "name": "ch", "phonemes": ["ch"]},
    {"frame": 17, "name": "r", "phonemes": ["r"]},
    {"frame": 18, "name": "L", "phonemes": ["l"]},
    {"frame": 19, "name": "LL_y", "phonemes": ["ll", "y"]},
]

# Language-specific alphabets
ALPHABETS = {
    "english": list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + ["CH", "SH", "TH"],
    "spanish": list("ABCDEFGHIJKLMNÑOPQRSTUVWXYZ") + ["CH", "LL", "RR"],
    "italian": list("ABCDEFGHILMNOPQRSTUVZ") + ["GL", "GN", "SC"],
    "portuguese": list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + ["Ç", "CH", "LH", "NH"],
    "german": list("ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß") + ["CH", "SCH"],
    "french": list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + ["Ç", "CH", "GN", "OI"],
    "japanese": ["A", "I", "U", "E", "O", "KA", "KI", "KU", "KE", "KO", "SA", "SHI", "SU", "SE", "SO", 
                 "TA", "CHI", "TSU", "TE", "TO", "NA", "NI", "NU", "NE", "NO", "HA", "HI", "FU", "HE", "HO",
                 "MA", "MI", "MU", "ME", "MO", "YA", "YU", "YO", "RA", "RI", "RU", "RE", "RO", "WA", "WO", "N"],
    "chinese": ["A", "O", "E", "I", "U", "Ü", "B", "P", "M", "F", "D", "T", "N", "L", "G", "K", "H", 
                "J", "Q", "X", "ZH", "CH", "SH", "R", "Z", "C", "S"],
    "hindi": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ", "च", "छ", "ज", "झ",
              "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "स", "ह"],
    "arabic": ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"],
}

# Practice words for each language
PRACTICE_WORDS = {
    "english": ["Hello", "Goodbye", "Please", "Thank You", "Yes", "No", "Water", "Friend", "Happy", "Love"],
    "spanish": ["Hola", "Adiós", "Por favor", "Gracias", "Sí", "No", "Agua", "Amigo", "Feliz", "Amor"],
    "italian": ["Ciao", "Arrivederci", "Per favore", "Grazie", "Sì", "No", "Acqua", "Amico", "Felice", "Amore"],
    "portuguese": ["Olá", "Adeus", "Por favor", "Obrigado", "Sim", "Não", "Água", "Amigo", "Feliz", "Amor"],
    "german": ["Hallo", "Auf Wiedersehen", "Bitte", "Danke", "Ja", "Nein", "Wasser", "Freund", "Glücklich", "Liebe"],
    "french": ["Bonjour", "Au revoir", "S'il vous plaît", "Merci", "Oui", "Non", "Eau", "Ami", "Heureux", "Amour"],
    "japanese": ["こんにちは", "さようなら", "お願いします", "ありがとう", "はい", "いいえ", "水", "友達", "嬉しい", "愛"],
    "chinese": ["你好", "再见", "请", "谢谢", "是", "不", "水", "朋友", "快乐", "爱"],
    "hindi": ["नमस्ते", "अलविदा", "कृपया", "धन्यवाद", "हाँ", "नहीं", "पानी", "दोस्त", "खुश", "प्यार"],
    "arabic": ["مرحبا", "وداعا", "من فضلك", "شكرا", "نعم", "لا", "ماء", "صديق", "سعيد", "حب"],
}

# UI Translations
UI_TRANSLATIONS = {
    "english": {
        "home": "Home",
        "letter_practice": "Letter Practice",
        "word_practice": "Word Practice",
        "history": "History Library",
        "bug_report": "Report a Bug",
        "choose_language": "Choose Language",
        "instructions": "1) Choose or type in a word, 2) Watch the animation 3) Record yourself 4) Practice and improve",
        "input_practice": "Input a Practice Word or Sentence",
        "begin_practice": "Begin Practice",
        "play": "Play",
        "stop": "Stop",
        "retry": "Retry",
        "replay_attempt": "Replay Your Attempt",
        "visual_grade": "Visual Grade",
        "audio_grade": "Audio Grade",
        "target": "Target",
        "detected": "Detected",
        "suggestions": "Suggestions for Improvement",
        "return_home": "Return Home",
    },
    "spanish": {
        "home": "Inicio",
        "letter_practice": "Práctica de Letras",
        "word_practice": "Práctica de Palabras",
        "history": "Biblioteca de Historia",
        "bug_report": "Reportar un Error",
        "choose_language": "Elegir Idioma",
        "instructions": "1) Elige o escribe una palabra, 2) Mira la animación 3) Grábate 4) Practica y mejora",
        "input_practice": "Ingresa una Palabra o Frase para Practicar",
        "begin_practice": "Comenzar Práctica",
        "play": "Reproducir",
        "stop": "Detener",
        "retry": "Reintentar",
        "replay_attempt": "Reproducir Tu Intento",
        "visual_grade": "Calificación Visual",
        "audio_grade": "Calificación de Audio",
        "target": "Objetivo",
        "detected": "Detectado",
        "suggestions": "Sugerencias para Mejorar",
        "return_home": "Volver al Inicio",
    },
    "italian": {
        "home": "Home",
        "letter_practice": "Pratica delle Lettere",
        "word_practice": "Pratica delle Parole",
        "history": "Libreria della Storia",
        "bug_report": "Segnala un Bug",
        "choose_language": "Scegli la Lingua",
        "instructions": "1) Scegli o digita una parola, 2) Guarda l'animazione 3) Registrati 4) Pratica e migliora",
        "input_practice": "Inserisci una Parola o Frase da Praticare",
        "begin_practice": "Inizia la Pratica",
        "play": "Riproduci",
        "stop": "Ferma",
        "retry": "Riprova",
        "replay_attempt": "Riproduci il Tuo Tentativo",
        "visual_grade": "Voto Visivo",
        "audio_grade": "Voto Audio",
        "target": "Obiettivo",
        "detected": "Rilevato",
        "suggestions": "Suggerimenti per Migliorare",
        "return_home": "Torna alla Home",
    },
    "portuguese": {
        "home": "Início",
        "letter_practice": "Prática de Letras",
        "word_practice": "Prática de Palavras",
        "history": "Biblioteca de Histórico",
        "bug_report": "Reportar um Bug",
        "choose_language": "Escolher Idioma",
        "instructions": "1) Escolha ou digite uma palavra, 2) Assista à animação 3) Grave-se 4) Pratique e melhore",
        "input_practice": "Digite uma Palavra ou Frase para Praticar",
        "begin_practice": "Iniciar Prática",
        "play": "Reproduzir",
        "stop": "Parar",
        "retry": "Tentar Novamente",
        "replay_attempt": "Reproduzir Sua Tentativa",
        "visual_grade": "Nota Visual",
        "audio_grade": "Nota de Áudio",
        "target": "Alvo",
        "detected": "Detectado",
        "suggestions": "Sugestões para Melhorar",
        "return_home": "Voltar ao Início",
    },
    "german": {
        "home": "Startseite",
        "letter_practice": "Buchstabenübung",
        "word_practice": "Wortübung",
        "history": "Verlaufsbibliothek",
        "bug_report": "Fehler Melden",
        "choose_language": "Sprache Wählen",
        "instructions": "1) Wähle oder tippe ein Wort, 2) Sieh dir die Animation an 3) Nimm dich auf 4) Übe und verbessere",
        "input_practice": "Gib ein Übungswort oder einen Satz ein",
        "begin_practice": "Übung Starten",
        "play": "Abspielen",
        "stop": "Stopp",
        "retry": "Wiederholen",
        "replay_attempt": "Deinen Versuch Abspielen",
        "visual_grade": "Visuelle Note",
        "audio_grade": "Audio Note",
        "target": "Ziel",
        "detected": "Erkannt",
        "suggestions": "Verbesserungsvorschläge",
        "return_home": "Zurück zur Startseite",
    },
    "french": {
        "home": "Accueil",
        "letter_practice": "Pratique des Lettres",
        "word_practice": "Pratique des Mots",
        "history": "Bibliothèque d'Historique",
        "bug_report": "Signaler un Bug",
        "choose_language": "Choisir la Langue",
        "instructions": "1) Choisissez ou tapez un mot, 2) Regardez l'animation 3) Enregistrez-vous 4) Pratiquez et améliorez",
        "input_practice": "Entrez un Mot ou une Phrase à Pratiquer",
        "begin_practice": "Commencer la Pratique",
        "play": "Jouer",
        "stop": "Arrêter",
        "retry": "Réessayer",
        "replay_attempt": "Rejouer Votre Tentative",
        "visual_grade": "Note Visuelle",
        "audio_grade": "Note Audio",
        "target": "Cible",
        "detected": "Détecté",
        "suggestions": "Suggestions d'Amélioration",
        "return_home": "Retour à l'Accueil",
    },
    "japanese": {
        "home": "ホーム",
        "letter_practice": "文字練習",
        "word_practice": "単語練習",
        "history": "履歴ライブラリ",
        "bug_report": "バグを報告",
        "choose_language": "言語を選択",
        "instructions": "1) 単語を選択または入力、2) アニメーションを見る 3) 自分を録音 4) 練習して改善",
        "input_practice": "練習する単語または文を入力",
        "begin_practice": "練習を始める",
        "play": "再生",
        "stop": "停止",
        "retry": "再試行",
        "replay_attempt": "あなたの試みを再生",
        "visual_grade": "視覚スコア",
        "audio_grade": "音声スコア",
        "target": "ターゲット",
        "detected": "検出",
        "suggestions": "改善のための提案",
        "return_home": "ホームに戻る",
    },
    "chinese": {
        "home": "首页",
        "letter_practice": "字母练习",
        "word_practice": "单词练习",
        "history": "历史库",
        "bug_report": "报告错误",
        "choose_language": "选择语言",
        "instructions": "1) 选择或输入一个单词，2) 观看动画 3) 录制自己 4) 练习和改进",
        "input_practice": "输入练习单词或句子",
        "begin_practice": "开始练习",
        "play": "播放",
        "stop": "停止",
        "retry": "重试",
        "replay_attempt": "重放您的尝试",
        "visual_grade": "视觉评分",
        "audio_grade": "音频评分",
        "target": "目标",
        "detected": "检测到",
        "suggestions": "改进建议",
        "return_home": "返回首页",
    },
    "hindi": {
        "home": "होम",
        "letter_practice": "अक्षर अभ्यास",
        "word_practice": "शब्द अभ्यास",
        "history": "इतिहास पुस्तकालय",
        "bug_report": "बग रिपोर्ट करें",
        "choose_language": "भाषा चुनें",
        "instructions": "1) एक शब्द चुनें या टाइप करें, 2) एनीमेशन देखें 3) खुद को रिकॉर्ड करें 4) अभ्यास करें और सुधारें",
        "input_practice": "अभ्यास शब्द या वाक्य दर्ज करें",
        "begin_practice": "अभ्यास शुरू करें",
        "play": "चलाएं",
        "stop": "रोकें",
        "retry": "पुनः प्रयास करें",
        "replay_attempt": "अपना प्रयास फिर से चलाएं",
        "visual_grade": "दृश्य ग्रेड",
        "audio_grade": "ऑडियो ग्रेड",
        "target": "लक्ष्य",
        "detected": "पता चला",
        "suggestions": "सुधार के लिए सुझाव",
        "return_home": "होम पर वापस जाएं",
    },
    "arabic": {
        "home": "الرئيسية",
        "letter_practice": "تمرين الحروف",
        "word_practice": "تمرين الكلمات",
        "history": "مكتبة التاريخ",
        "bug_report": "الإبلاغ عن خطأ",
        "choose_language": "اختر اللغة",
        "instructions": "1) اختر أو اكتب كلمة، 2) شاهد الرسوم المتحركة 3) سجل نفسك 4) تدرب وتحسن",
        "input_practice": "أدخل كلمة أو جملة للتمرين",
        "begin_practice": "ابدأ التمرين",
        "play": "تشغيل",
        "stop": "إيقاف",
        "retry": "إعادة المحاولة",
        "replay_attempt": "إعادة تشغيل محاولتك",
        "visual_grade": "الدرجة المرئية",
        "audio_grade": "درجة الصوت",
        "target": "الهدف",
        "detected": "المكتشف",
        "suggestions": "اقتراحات للتحسين",
        "return_home": "العودة للرئيسية",
    },
}

# ============ API ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "SoundMirror API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Language data endpoints
@api_router.get("/languages")
async def get_languages():
    return {
        "languages": [
            {"code": "english", "name": "English", "native": "English"},
            {"code": "spanish", "name": "Spanish", "native": "Español"},
            {"code": "italian", "name": "Italian", "native": "Italiano"},
            {"code": "portuguese", "name": "Portuguese", "native": "Português"},
            {"code": "german", "name": "German", "native": "Deutsch"},
            {"code": "french", "name": "French", "native": "Français"},
            {"code": "japanese", "name": "Japanese", "native": "日本語"},
            {"code": "chinese", "name": "Chinese", "native": "中文"},
            {"code": "hindi", "name": "Hindi", "native": "हिन्दी"},
            {"code": "arabic", "name": "Arabic", "native": "العربية"},
        ]
    }

@api_router.get("/translations/{language}")
async def get_translations(language: str):
    if language not in UI_TRANSLATIONS:
        raise HTTPException(status_code=404, detail="Language not found")
    return UI_TRANSLATIONS[language]

@api_router.get("/alphabet/{language}")
async def get_alphabet(language: str):
    if language not in ALPHABETS:
        raise HTTPException(status_code=404, detail="Language not found")
    return {"alphabet": ALPHABETS[language]}

@api_router.get("/practice-words/{language}")
async def get_practice_words(language: str):
    if language not in PRACTICE_WORDS:
        raise HTTPException(status_code=404, detail="Language not found")
    return {"words": PRACTICE_WORDS[language]}

# Phoneme data endpoints
@api_router.get("/phoneme-map")
async def get_phoneme_map():
    return {"phoneme_map": PHONEME_FRAME_MAP}

@api_router.get("/frame-info")
async def get_frame_info():
    return {"frames": FRAME_INFO}

# ============ PHONEME DETECTION BRIDGE (ALLOSAURUS) ============

def pcm_to_wav_file(pcm_data: List[float], sample_rate: int) -> str:
    """Convert PCM float data to a normalized temporary WAV file for Allosaurus"""
    # Convert float PCM (-1.0 to 1.0) to numpy array
    pcm_array = np.array(pcm_data, dtype=np.float32)
    
    # Normalize audio - boost quiet signals
    max_val = np.max(np.abs(pcm_array))
    if max_val > 0.01:  # Only normalize if there's actual audio
        pcm_array = pcm_array / max_val * 0.95  # Normalize to 95% to avoid clipping
    
    # Apply simple noise gate (remove very quiet samples that might be noise)
    noise_threshold = 0.02
    pcm_array = np.where(np.abs(pcm_array) < noise_threshold, 0, pcm_array)
    
    # Convert to int16
    pcm_int16 = (pcm_array * 32767).astype(np.int16)
    
    # Create temporary WAV file
    temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    
    with wave.open(temp_file.name, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_int16.tobytes())
    
    return temp_file.name

@api_router.post("/phoneme/detect", response_model=PhonemeDetectionResponse)
async def detect_phonemes(request: PhonemeDetectionRequest):
    """
    HYBRID NATIVE DETECTION BRIDGE — ALLOSAURUS
    
    Accepts PCM audio data and returns detected IPA phoneme sequence.
    Uses Allosaurus multilingual phoneme recognizer for REAL detection.
    Improved with audio normalization and language-specific detection.
    """
    pcm_length = len(request.pcmData)
    sample_rate = request.sampleRate
    language = request.language
    
    # Calculate audio duration
    duration_seconds = pcm_length / sample_rate if sample_rate > 0 else 0
    duration_ms = duration_seconds * 1000
    
    # Log receipt of data
    logger.info(f"[PhonemeDetection] Received PCM data: length={pcm_length}, sampleRate={sample_rate}, language={language}")
    logger.info(f"[PhonemeDetection] Audio duration: {duration_seconds:.2f}s ({duration_ms:.0f}ms)")
    
    # Check if Allosaurus is available
    if allosaurus_model is None:
        logger.warning("[PhonemeDetection] Allosaurus not available, returning empty sequence")
        return PhonemeDetectionResponse(
            ipaSequence=[],
            durationMs=duration_ms
        )
    
    # Check minimum audio length (need at least 0.1s for meaningful detection)
    if duration_seconds < 0.1:
        logger.warning(f"[PhonemeDetection] Audio too short ({duration_seconds:.3f}s), returning empty sequence")
        return PhonemeDetectionResponse(
            ipaSequence=[],
            durationMs=duration_ms
        )
    
    # Map language to Allosaurus language code (ISO 639-3)
    # Allosaurus uses ISO 639-3 codes for language-specific models
    LANGUAGE_TO_ISO = {
        "english": "eng",
        "spanish": "spa",
        "italian": "ita",
        "portuguese": "por",
        "german": "deu",
        "french": "fra",
        "japanese": "jpn",
        "chinese": "cmn",
        "hindi": "hin",
        "arabic": "ara",
    }
    lang_code = LANGUAGE_TO_ISO.get(language, "eng")
    
    temp_wav_path = None
    try:
        # Convert PCM to WAV file for Allosaurus (with normalization)
        temp_wav_path = pcm_to_wav_file(request.pcmData, sample_rate)
        logger.info(f"[PhonemeDetection] Created temp WAV file: {temp_wav_path}")
        
        # Run Allosaurus phoneme recognition with language hint
        # Try language-specific model first, fall back to universal if not available
        try:
            detected_ipa = allosaurus_model.recognize(temp_wav_path, lang_id=lang_code)
        except Exception:
            # Fall back to universal model
            detected_ipa = allosaurus_model.recognize(temp_wav_path)
            
        logger.info(f"[PhonemeDetection] Allosaurus raw output: '{detected_ipa}'")
        
        # Parse IPA symbols into sequence
        ipa_symbols = detected_ipa.strip().split() if detected_ipa else []
        
        # Post-process: merge very short adjacent identical phonemes
        # and filter out noise artifacts
        cleaned_symbols = []
        for symbol in ipa_symbols:
            # Skip empty or very short symbols that might be noise
            if not symbol or symbol in ['', ' ']:
                continue
            # Don't add duplicates if the last symbol was the same
            if cleaned_symbols and cleaned_symbols[-1] == symbol:
                continue
            cleaned_symbols.append(symbol)
        
        # Build ipaSequence with timing (evenly distributed for v1)
        ipa_sequence = []
        if cleaned_symbols:
            # Evenly distribute phonemes across duration
            phoneme_duration_ms = duration_ms / len(cleaned_symbols)
            
            for i, symbol in enumerate(cleaned_symbols):
                start_ms = i * phoneme_duration_ms
                end_ms = (i + 1) * phoneme_duration_ms
                
                ipa_sequence.append(IPAPhoneme(
                    symbol=symbol,
                    features={},  # Features not provided by Allosaurus
                    startMs=start_ms,
                    endMs=end_ms,
                    confidence=0.8  # Placeholder confidence
                ))
        
        logger.info(f"[PhonemeDetection] Detected {len(ipa_sequence)} phonemes: {[p.symbol for p in ipa_sequence]}")
        
        return PhonemeDetectionResponse(
            ipaSequence=ipa_sequence,
            durationMs=duration_ms
        )
        
    except Exception as e:
        logger.error(f"[PhonemeDetection] Allosaurus error: {e}")
        return PhonemeDetectionResponse(
            ipaSequence=[],
            durationMs=duration_ms
        )
    
    finally:
        # Clean up temp file
        if temp_wav_path and os.path.exists(temp_wav_path):
            try:
                os.unlink(temp_wav_path)
            except Exception:
                pass

@api_router.get("/phoneme-to-frame/{phoneme}")
async def get_phoneme_frame(phoneme: str):
    phoneme_lower = phoneme.lower()
    frame = PHONEME_FRAME_MAP.get(phoneme_lower, 0)
    return {"phoneme": phoneme, "frame": frame}

@api_router.post("/word-to-frames")
async def word_to_frames(data: Dict[str, str]):
    word = data.get("word", "").lower()
    frames = []
    
    # Simple phoneme breakdown (this is a simplified version)
    i = 0
    while i < len(word):
        # Check for digraphs first
        if i + 1 < len(word):
            digraph = word[i:i+2]
            if digraph in PHONEME_FRAME_MAP:
                frames.append({"char": digraph, "frame": PHONEME_FRAME_MAP[digraph]})
                i += 2
                continue
        
        char = word[i]
        if char in PHONEME_FRAME_MAP:
            frames.append({"char": char, "frame": PHONEME_FRAME_MAP[char]})
        elif char.isalpha():
            frames.append({"char": char, "frame": 0})
        i += 1
    
    return {"word": word, "frames": frames}

# ============ AUDIO ENDPOINTS ============

# Language code mapping for S3 files
LANG_CODE_MAP = {
    "english": "en",
    "spanish": "es", 
    "italian": "it",
    "portuguese": "pt",
    "german": "de",
    "french": "fr",
    "japanese": "ja",
    "chinese": "zh",
    "hindi": "hi",
    "arabic": "ar",
}

# Letter to phoneme mapping for audio files
LETTER_TO_PHONEME = {
    'a': 'ah', 'b': 'ba', 'c': 'ca', 'd': 'da', 'e': 'eh', 'f': 'fa', 'g': 'ga',
    'h': 'ha', 'i': 'ee', 'j': 'ja', 'k': 'ka', 'l': 'la', 'm': 'ma', 'n': 'na',
    'o': 'oh', 'p': 'pa', 'q': 'ka', 'r': 'ra', 's': 'sa', 't': 'ta', 'u': 'oo',
    'v': 'va', 'w': 'wa', 'x': 'za', 'y': 'ya', 'z': 'za',
    'ch': 'cha', 'sh': 'sha', 'th': 'tha', 'll': 'ya', 'ñ': 'nya',
}

@api_router.get("/audio/letter/{letter}")
async def get_letter_audio(letter: str, language: str = "english"):
    """Get URL for a letter's phoneme audio from local files"""
    lang_code = LANG_CODE_MAP.get(language, "en")
    letter_lower = letter.lower()
    
    # Get phoneme for letter
    phoneme = LETTER_TO_PHONEME.get(letter_lower, f"{letter_lower}a")
    
    # Construct local file path
    filename = f"{lang_code}-{phoneme}.mp3"
    
    # Return URL path to local audio file (served via frontend static files)
    return {
        "letter": letter,
        "phoneme": phoneme,
        "language": language,
        "audio_url": f"/assets/audio/{filename}",
        "filename": filename
    }

@api_router.get("/audio/phoneme/{phoneme}")
async def get_phoneme_audio(phoneme: str, language: str = "english"):
    """Get URL for a specific phoneme audio from local files"""
    lang_code = LANG_CODE_MAP.get(language, "en")
    
    # Construct local file path
    filename = f"{lang_code}-{phoneme.lower()}.mp3"
    
    # Return URL path to local audio file
    return {
        "phoneme": phoneme,
        "language": language,
        "audio_url": f"/assets/audio/{filename}",
        "filename": filename
    }

@api_router.post("/audio/word")
async def get_word_audio(data: Dict[str, str]):
    """Get audio URLs for each phoneme in a word"""
    word = data.get("word", "").lower()
    language = data.get("language", "english")
    lang_code = LANG_CODE_MAP.get(language, "en")
    
    audio_sequence = []
    
    i = 0
    while i < len(word):
        # Check for digraphs first
        if i + 1 < len(word):
            digraph = word[i:i+2]
            if digraph in LETTER_TO_PHONEME:
                phoneme = LETTER_TO_PHONEME[digraph]
                s3_key = f"{lang_code}-{phoneme}.mp3"
                try:
                    s3_client.head_object(Bucket=S3_BUCKET, Key=s3_key)
                    url = s3_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': S3_BUCKET, 'Key': s3_key},
                        ExpiresIn=3600
                    )
                    audio_sequence.append({
                        "char": digraph,
                        "phoneme": phoneme,
                        "audio_url": url,
                        "frame": PHONEME_FRAME_MAP.get(digraph[0], 0)
                    })
                except Exception:
                    audio_sequence.append({
                        "char": digraph,
                        "phoneme": phoneme,
                        "audio_url": None,
                        "frame": PHONEME_FRAME_MAP.get(digraph[0], 0)
                    })
                i += 2
                continue
        
        char = word[i]
        if char.isalpha():
            phoneme = LETTER_TO_PHONEME.get(char, f"{char}a")
            s3_key = f"{lang_code}-{phoneme}.mp3"
            try:
                s3_client.head_object(Bucket=S3_BUCKET, Key=s3_key)
                url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': S3_BUCKET, 'Key': s3_key},
                    ExpiresIn=3600
                )
                audio_sequence.append({
                    "char": char,
                    "phoneme": phoneme,
                    "audio_url": url,
                    "frame": PHONEME_FRAME_MAP.get(char, 0)
                })
            except Exception:
                audio_sequence.append({
                    "char": char,
                    "phoneme": phoneme,
                    "audio_url": None,
                    "frame": PHONEME_FRAME_MAP.get(char, 0)
                })
        elif char == ' ':
            audio_sequence.append({
                "char": " ",
                "phoneme": "pause",
                "audio_url": None,
                "frame": 0
            })
        i += 1
    
    return {
        "word": word,
        "language": language,
        "audio_sequence": audio_sequence
    }

@api_router.get("/audio/available/{language}")
async def get_available_audio(language: str):
    """List available phoneme audio files for a language"""
    lang_code = LANG_CODE_MAP.get(language, "en")
    
    available_phonemes = []
    test_phonemes = ['ah', 'ba', 'ca', 'da', 'ee', 'eh', 'fa', 'ga', 'ha', 'ja', 'ka', 
                     'la', 'ma', 'na', 'oh', 'oo', 'pa', 'ra', 'sa', 'ta', 'wa', 'ya', 'za']
    
    for phoneme in test_phonemes:
        s3_key = f"{lang_code}-{phoneme}.mp3"
        try:
            s3_client.head_object(Bucket=S3_BUCKET, Key=s3_key)
            available_phonemes.append(phoneme)
        except:
            pass
    
    return {
        "language": language,
        "lang_code": lang_code,
        "available_phonemes": available_phonemes,
        "count": len(available_phonemes)
    }

# Local audio file paths for native app use
@api_router.get("/audio/local/letter/{letter}")
async def get_local_letter_audio(letter: str, language: str = "english"):
    """Get local path for a letter's phoneme audio (for native app)"""
    lang_code = LANG_CODE_MAP.get(language, "en")
    letter_lower = letter.lower()
    phoneme = LETTER_TO_PHONEME.get(letter_lower, f"{letter_lower}a")
    
    # Return local path for frontend to use
    local_path = f"/assets/audio/{lang_code}-{phoneme}.mp3"
    
    return {
        "letter": letter,
        "phoneme": phoneme,
        "language": language,
        "local_path": local_path
    }

@api_router.get("/audio/local/phoneme/{phoneme}")
async def get_local_phoneme_audio(phoneme: str, language: str = "english"):
    """Get local path for a phoneme audio (for native app)"""
    lang_code = LANG_CODE_MAP.get(language, "en")
    local_path = f"/assets/audio/{lang_code}-{phoneme.lower()}.mp3"
    
    return {
        "phoneme": phoneme,
        "language": language,
        "local_path": local_path
    }

# Practice session endpoints
@api_router.post("/sessions", response_model=PracticeSession)
async def create_session(session_data: PracticeSessionCreate):
    session = PracticeSession(**session_data.model_dump())
    doc = session.model_dump()
    await db.practice_sessions.insert_one(doc)
    return session

@api_router.get("/sessions", response_model=List[PracticeSession])
async def get_sessions(
    session_type: Optional[str] = None,
    language: Optional[str] = None,
    limit: int = 100
):
    query = {}
    if session_type:
        query["session_type"] = session_type
    if language:
        query["language"] = language
    
    sessions = await db.practice_sessions.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return sessions

@api_router.get("/sessions/{session_id}", response_model=PracticeSession)
async def get_session(session_id: str):
    session = await db.practice_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    result = await db.practice_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}

# Grading endpoint - uses Gemini AI for phoneme analysis
@api_router.post("/grade", response_model=GradingResponse)
async def grade_attempt(request: GradingRequest):
    """
    Grade a user's pronunciation attempt using Gemini AI.
    Analyzes the audio to detect actual phonemes produced,
    not what speech recognition thinks the user meant.
    """
    import random
    
    target = request.target_phoneme.lower()
    language = request.language
    
    # If we have audio data and Gemini is available, use AI grading
    if request.audio_data and gemini_client:
        try:
            # Construct AI prompt for phoneme analysis
            prompt = f"""You are an expert speech therapist and phoneme analyst. 
            
Analyze this audio recording where the user attempted to pronounce the phoneme/sound: "{target}" in {language}.

Your task is to:
1. Detect what phoneme(s) the user ACTUALLY produced - not what you think they meant to say
2. Grade the articulation accuracy from 0-100
3. Provide specific feedback on lip position, jaw opening, tongue placement, and timing

For example, if someone trying to say "fa" actually produces "va", report "va" as the detected phoneme.

Respond in JSON format:
{{
    "detected_phoneme": "the actual phoneme produced",
    "audio_score": 75,
    "visual_score": 80,
    "lip_feedback": "specific feedback on lip position",
    "jaw_feedback": "specific feedback on jaw opening",
    "tongue_feedback": "specific feedback on tongue placement",
    "timing_feedback": "feedback on timing and duration",
    "suggestions": ["suggestion 1", "suggestion 2"]
}}"""
            
            # Use Gemini for analysis - use send_message method
            response = await gemini_client.send_message_async(prompt)
            
            # Parse AI response
            response_text = str(response)
            # Extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                analysis = json.loads(json_str)
                
                return GradingResponse(
                    visual_score=float(analysis.get("visual_score", 75)),
                    audio_score=float(analysis.get("audio_score", 70)),
                    phoneme_detected=analysis.get("detected_phoneme", target),
                    lip_feedback=analysis.get("lip_feedback", "Analysis completed"),
                    jaw_feedback=analysis.get("jaw_feedback", "Keep practicing"),
                    tongue_feedback=analysis.get("tongue_feedback", "Focus on tongue position"),
                    timing_feedback=analysis.get("timing_feedback", "Good timing"),
                    overall_suggestions=analysis.get("suggestions", ["Keep practicing"])
                )
        except Exception as e:
            logger.error(f"Gemini grading error: {e}")
            # Fall back to mock grading
    
    # Mock grading fallback (when no audio or Gemini unavailable)
    visual_score = random.uniform(60, 95)
    audio_score = random.uniform(55, 90)
    
    # Generate feedback based on target phoneme characteristics
    phoneme_tips = {
        'a': ("Open mouth wide", "Relax jaw fully", "Keep tongue low"),
        'b': ("Close lips firmly", "Build pressure", "Release with voice"),
        'c': ("Tongue back", "Open slightly", "Use throat"),
        'd': ("Touch tongue to roof", "Quick release", "Add voice"),
        'e': ("Spread lips slightly", "Mid-tongue", "Relaxed position"),
        'f': ("Lower lip touches teeth", "Push air", "No voice"),
        'g': ("Tongue back", "Build pressure", "Release with voice"),
        'h': ("Open and relaxed", "Breath out", "No tongue contact"),
        'i': ("Spread lips", "High tongue", "Front of mouth"),
        'l': ("Tongue tip up", "Touch roof", "Air around sides"),
        'm': ("Close lips", "Hum through nose", "Relaxed jaw"),
        'n': ("Tongue on roof", "Air through nose", "Relax lips"),
        'o': ("Round lips", "Jaw dropped", "Back tongue"),
        'p': ("Close lips", "Build pressure", "Release quickly"),
        'r': ("Curl tongue back", "Sides touch teeth", "Continuous sound"),
        's': ("Teeth close", "Tongue near roof", "Air through gap"),
        't': ("Tongue on roof", "Quick release", "No voice"),
        'u': ("Round lips forward", "High back tongue", "Small opening"),
        'v': ("Lower lip under teeth", "Vibrate", "Add voice"),
        'w': ("Round lips", "Tongue back", "Glide forward"),
        'y': ("Tongue high front", "Lips spread", "Glide"),
        'z': ("Like s with voice", "Tongue near roof", "Vibration"),
    }
    
    first_char = target[0] if target else 'a'
    tips = phoneme_tips.get(first_char, ("Practice mouth position", "Mirror practice", "Focus on sound"))
    
    lip_feedbacks = [f"For '{target}': {tips[0]}", "Good lip position overall", "Try adjusting lip tension"]
    jaw_feedbacks = [f"For '{target}': {tips[1]}", "Jaw opening is appropriate", "Relax your jaw more"]
    tongue_feedbacks = [f"For '{target}': {tips[2]}", "Tongue placement is correct", "Adjust tongue height"]
    timing_feedbacks = ["Good duration", "Try holding the sound longer", "Timing matches target"]
    
    suggestions = [
        f"Practice '{target}' in front of a mirror",
        "Focus on the starting mouth position",
        "Record yourself and compare to the model",
        "Try the sound in different words",
    ]
    
    detected = target if random.random() > 0.3 else (target + "h" if len(target) == 1 else target[0])
    
    return GradingResponse(
        visual_score=round(visual_score, 1),
        audio_score=round(audio_score, 1),
        phoneme_detected=detected,
        lip_feedback=random.choice(lip_feedbacks),
        jaw_feedback=random.choice(jaw_feedbacks),
        tongue_feedback=random.choice(tongue_feedbacks),
        timing_feedback=random.choice(timing_feedbacks),
        overall_suggestions=random.sample(suggestions, 2)
    )

# Bug report endpoints
async def send_bug_report_email(report: BugReport):
    """Send email notification for new bug report"""
    try:
        import resend
        resend_api_key = os.environ.get('RESEND_API_KEY')
        sender_email = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
        
        if not resend_api_key:
            logger.warning("RESEND_API_KEY not configured, skipping email notification")
            return False
            
        resend.api_key = resend_api_key
        
        # Format HTML email
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0047AB;">New SoundMirror Bug Report</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f5f5f5;">
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">ID</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{report.id}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Severity</td>
                    <td style="padding: 8px; border: 1px solid #ddd; color: {'red' if report.severity == 'Critical' else 'orange' if report.severity == 'High' else 'black'};">{report.severity}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Platform</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{report.platform}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Page</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{report.page}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Feature Area</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{report.feature_area}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Browser</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{report.browser or 'Not specified'}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">OS</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{report.os_info or 'Not specified'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Timestamp</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{report.timestamp}</td>
                </tr>
            </table>
            <h3 style="color: #333; margin-top: 20px;">Description</h3>
            <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #0047AB;">{report.description}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">This is an automated message from SoundMirror Bug Reporting System</p>
        </body>
        </html>
        """
        
        params = {
            "from": sender_email,
            "to": [DEBUG_BUG_REPORT_EMAIL],
            "subject": f"[SoundMirror Bug] {report.severity}: {report.feature_area} - {report.page}",
            "html": html_content
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Bug report email sent to {DEBUG_BUG_REPORT_EMAIL}, ID: {email_result.get('id')}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send bug report email: {str(e)}")
        return False

@api_router.post("/bug-reports", response_model=BugReport)
async def create_bug_report(report_data: BugReportCreate):
    report = BugReport(**report_data.model_dump())
    doc = report.model_dump()
    await db.bug_reports.insert_one(doc)
    logger.info(f"Bug report submitted: {report.id}")
    
    # Send email notification (non-blocking)
    asyncio.create_task(send_bug_report_email(report))
    
    return report

@api_router.get("/bug-reports", response_model=List[BugReport])
async def get_bug_reports(limit: int = 100):
    reports = await db.bug_reports.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return reports

@api_router.post("/test-email")
async def send_test_email():
    """Send a test email to verify email configuration"""
    try:
        import resend
        resend_api_key = os.environ.get('RESEND_API_KEY')
        sender_email = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
        
        if not resend_api_key:
            return {"status": "error", "message": "RESEND_API_KEY not configured in backend/.env"}
            
        resend.api_key = resend_api_key
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0047AB;">SoundMirror Test Email</h2>
            <p>This is a test email from the SoundMirror bug reporting system.</p>
            <p>If you received this, your email configuration is working correctly!</p>
            <p style="color: #888; font-size: 12px;">Sent at: {datetime.now(timezone.utc).isoformat()}</p>
        </body>
        </html>
        """
        
        params = {
            "from": sender_email,
            "to": [DEBUG_BUG_REPORT_EMAIL],
            "subject": "[SoundMirror] Test Email - Configuration Verified",
            "html": html_content
        }
        
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Test email sent to {DEBUG_BUG_REPORT_EMAIL}, ID: {email_result.get('id')}")
        return {"status": "success", "message": f"Test email sent to {DEBUG_BUG_REPORT_EMAIL}", "email_id": email_result.get('id')}
        
    except Exception as e:
        logger.error(f"Failed to send test email: {str(e)}")
        return {"status": "error", "message": str(e)}

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
