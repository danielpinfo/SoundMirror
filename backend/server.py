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

# Create the main app
app = FastAPI(title="SoundMirror API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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

# Grading endpoint (simplified - in production would use Gemini AI)
@api_router.post("/grade", response_model=GradingResponse)
async def grade_attempt(request: GradingRequest):
    """
    Grade a user's pronunciation attempt.
    In production, this would use Gemini AI for actual analysis.
    Currently returns mock grading for demo purposes.
    """
    import random
    
    # Mock grading - in production, integrate Gemini for real analysis
    visual_score = random.uniform(60, 95)
    audio_score = random.uniform(55, 90)
    
    # Generate mock feedback based on target phoneme
    target = request.target_phoneme.lower()
    
    lip_feedbacks = [
        "Good lip rounding observed",
        "Try to round your lips more",
        "Lips should be more relaxed",
        "Excellent lip position"
    ]
    
    jaw_feedbacks = [
        "Jaw opening is appropriate",
        "Open your jaw slightly more",
        "Try to relax your jaw",
        "Good jaw movement"
    ]
    
    tongue_feedbacks = [
        "Tongue position looks correct",
        "Try positioning tongue higher",
        "Keep tongue relaxed at bottom",
        "Good tongue placement"
    ]
    
    timing_feedbacks = [
        "Good timing with the target",
        "Try to extend the sound longer",
        "Sound was slightly rushed",
        "Excellent timing match"
    ]
    
    suggestions = [
        f"Practice the '{target}' sound in front of a mirror",
        "Focus on the starting mouth position",
        "Try slowing down your articulation",
        "Good progress! Keep practicing",
    ]
    
    # Simulate detected phoneme (sometimes correct, sometimes slightly off)
    detected = target if random.random() > 0.3 else target + "h" if len(target) == 1 else target[0]
    
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
@api_router.post("/bug-reports", response_model=BugReport)
async def create_bug_report(report_data: BugReportCreate):
    report = BugReport(**report_data.model_dump())
    doc = report.model_dump()
    await db.bug_reports.insert_one(doc)
    logger.info(f"Bug report submitted: {report.id}")
    return report

@api_router.get("/bug-reports", response_model=List[BugReport])
async def get_bug_reports(limit: int = 100):
    reports = await db.bug_reports.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return reports

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
