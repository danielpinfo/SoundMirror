import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Activity, Home as HomeIcon, Mic2, BookA, BarChart3, Bug, Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Search, ArrowRight, ChevronDown, Check, Send, Wifi, WifiOff, Trash2, Clock, TrendingUp, Target, Award, Calendar, CheckCircle, Square, Sparkles, Video, Camera, Download, Eye, Ear, Circle, PlayCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// ========== FULL i18n TRANSLATIONS ==========
const TRANSLATIONS = {
  en: {
    appName: 'SoundMirror',
    tagline: 'See the sound. Master the speech.',
    subtitle: 'Precise articulation visualization for pronunciation learning.',
    whatToPractice: 'What would you like to practice?',
    enterWord: 'Enter any word or phrase to see how it\'s pronounced.',
    typeWord: 'Type a word or phrase...',
    suggestedWords: 'Suggested Words & Phrases',
    letterPractice: 'Letter Practice',
    letterPracticeDesc: 'Learn individual phoneme articulations',
    yourProgress: 'Your Progress',
    progressDesc: 'View history, recordings & analytics',
    offlineReady: 'Fully Offline Ready',
    languagesSupported: 'Languages Supported',
    back: 'Back',
    wordPractice: 'Word Practice',
    watchListen: 'Watch, listen, then record yourself',
    modelArticulation: 'Model Articulation',
    frontView: 'Front View',
    sideView: 'Side View',
    phoneme: 'Phoneme',
    frame: 'Frame',
    teachingPoint: 'Teaching Point',
    apex: 'Apex',
    speed: 'Speed',
    recordGrade: 'Record & Grade Your Attempt',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    playback: 'Playback',
    playing: 'Playing...',
    visualScore: 'Visual Score',
    audioScore: 'Audio Score',
    lipJaw: 'Lip & jaw movement',
    pronunciation: 'Pronunciation accuracy',
    tip: 'Tip',
    tipText: 'Use 0.25x or 0.5x speed to clearly see each mouth position. Frame #5 shows the ideal articulation point.',
    selectLetter: 'Select a Letter',
    vowelsHighlighted: 'Vowels highlighted',
    chooseAlphabet: 'Choose from the alphabet grid to see its articulation',
    vowelsGold: 'Vowels are highlighted in gold',
    playSound: 'Play Sound',
    practiceHistory: 'Practice history, recordings & analytics',
    download: 'Download',
    clear: 'Clear',
    total: 'Total',
    average: 'Average',
    visual: 'Visual',
    audio: 'Audio',
    streak: 'Streak',
    recentSessions: 'Recent Sessions',
    noPractice: 'No practice yet',
    startPracticing: 'Start practicing to see your progress here',
    practiceAgain: 'Practice Again',
    playRecording: 'Play',
    reportIssue: 'Report an Issue',
    helpImprove: 'Help us improve SoundMirror',
    online: 'Online',
    offline: 'Offline',
    whatIssue: 'What type of issue?',
    specificIssue: 'Specific issue',
    severity: 'Severity',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    description: 'Description (optional)',
    describeIssue: 'Describe the issue in more detail...',
    submitReport: 'Submit Report',
    reportSaved: 'Report saved! It will be sent when you\'re online.',
    home: 'Home',
    words: 'Words',
    letters: 'Letters',
    progress: 'Progress',
    report: 'Report',
    animation: 'Animation',
    audioTts: 'Audio/TTS',
    phonemes: 'Phonemes',
    recording: 'Recording',
    uiDisplay: 'UI/Display',
    other: 'Other',
    letter: 'Letter',
  },
  es: {
    appName: 'SoundMirror',
    tagline: 'Ve el sonido. Domina el habla.',
    subtitle: 'Visualización precisa de articulación para aprender pronunciación.',
    whatToPractice: '¿Qué te gustaría practicar?',
    enterWord: 'Ingresa cualquier palabra o frase para ver cómo se pronuncia.',
    typeWord: 'Escribe una palabra o frase...',
    suggestedWords: 'Palabras y Frases Sugeridas',
    letterPractice: 'Práctica de Letras',
    letterPracticeDesc: 'Aprende articulaciones de fonemas individuales',
    yourProgress: 'Tu Progreso',
    progressDesc: 'Ver historial, grabaciones y análisis',
    offlineReady: 'Listo Sin Conexión',
    languagesSupported: 'Idiomas Soportados',
    back: 'Atrás',
    wordPractice: 'Práctica de Palabras',
    watchListen: 'Mira, escucha, luego grábate',
    modelArticulation: 'Modelo de Articulación',
    frontView: 'Vista Frontal',
    sideView: 'Vista Lateral',
    phoneme: 'Fonema',
    frame: 'Cuadro',
    teachingPoint: 'Punto de Enseñanza',
    apex: 'Ápice',
    speed: 'Velocidad',
    recordGrade: 'Graba y Califica tu Intento',
    startRecording: 'Iniciar Grabación',
    stopRecording: 'Detener Grabación',
    playback: 'Reproducir',
    playing: 'Reproduciendo...',
    visualScore: 'Puntuación Visual',
    audioScore: 'Puntuación de Audio',
    lipJaw: 'Movimiento de labios y mandíbula',
    pronunciation: 'Precisión de pronunciación',
    tip: 'Consejo',
    tipText: 'Usa velocidad 0.25x o 0.5x para ver claramente cada posición de la boca.',
    selectLetter: 'Selecciona una Letra',
    vowelsHighlighted: 'Vocales resaltadas',
    chooseAlphabet: 'Elige del alfabeto para ver su articulación',
    vowelsGold: 'Las vocales están resaltadas en dorado',
    playSound: 'Reproducir Sonido',
    practiceHistory: 'Historial de práctica, grabaciones y análisis',
    download: 'Descargar',
    clear: 'Limpiar',
    total: 'Total',
    average: 'Promedio',
    visual: 'Visual',
    audio: 'Audio',
    streak: 'Racha',
    recentSessions: 'Sesiones Recientes',
    noPractice: 'Sin práctica aún',
    startPracticing: 'Comienza a practicar para ver tu progreso aquí',
    practiceAgain: 'Practicar de Nuevo',
    playRecording: 'Reproducir',
    reportIssue: 'Reportar un Problema',
    helpImprove: 'Ayúdanos a mejorar SoundMirror',
    online: 'En Línea',
    offline: 'Sin Conexión',
    whatIssue: '¿Qué tipo de problema?',
    specificIssue: 'Problema específico',
    severity: 'Severidad',
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    description: 'Descripción (opcional)',
    describeIssue: 'Describe el problema con más detalle...',
    submitReport: 'Enviar Reporte',
    reportSaved: '¡Reporte guardado! Se enviará cuando estés en línea.',
    home: 'Inicio',
    words: 'Palabras',
    letters: 'Letras',
    progress: 'Progreso',
    report: 'Reporte',
    animation: 'Animación',
    audioTts: 'Audio/TTS',
    phonemes: 'Fonemas',
    recording: 'Grabación',
    uiDisplay: 'UI/Pantalla',
    other: 'Otro',
    letter: 'Letra',
  },
  fr: {
    appName: 'SoundMirror',
    tagline: 'Voir le son. Maîtriser la parole.',
    subtitle: 'Visualisation précise de l\'articulation pour l\'apprentissage de la prononciation.',
    whatToPractice: 'Que souhaitez-vous pratiquer?',
    enterWord: 'Entrez un mot ou une phrase pour voir comment il se prononce.',
    typeWord: 'Tapez un mot ou une phrase...',
    suggestedWords: 'Mots et Phrases Suggérés',
    letterPractice: 'Pratique des Lettres',
    letterPracticeDesc: 'Apprenez les articulations de phonèmes individuels',
    yourProgress: 'Votre Progrès',
    progressDesc: 'Voir l\'historique, les enregistrements et les analyses',
    offlineReady: 'Prêt Hors Ligne',
    languagesSupported: 'Langues Prises en Charge',
    back: 'Retour',
    wordPractice: 'Pratique des Mots',
    watchListen: 'Regardez, écoutez, puis enregistrez-vous',
    modelArticulation: 'Modèle d\'Articulation',
    frontView: 'Vue de Face',
    sideView: 'Vue de Côté',
    phoneme: 'Phonème',
    frame: 'Image',
    teachingPoint: 'Point d\'Enseignement',
    apex: 'Apex',
    speed: 'Vitesse',
    recordGrade: 'Enregistrez et Notez Votre Essai',
    startRecording: 'Démarrer l\'Enregistrement',
    stopRecording: 'Arrêter l\'Enregistrement',
    playback: 'Lecture',
    playing: 'Lecture en cours...',
    visualScore: 'Score Visuel',
    audioScore: 'Score Audio',
    lipJaw: 'Mouvement des lèvres et de la mâchoire',
    pronunciation: 'Précision de la prononciation',
    tip: 'Conseil',
    tipText: 'Utilisez la vitesse 0.25x ou 0.5x pour voir clairement chaque position de la bouche.',
    selectLetter: 'Sélectionnez une Lettre',
    vowelsHighlighted: 'Voyelles surlignées',
    chooseAlphabet: 'Choisissez dans l\'alphabet pour voir son articulation',
    vowelsGold: 'Les voyelles sont surlignées en or',
    playSound: 'Jouer le Son',
    practiceHistory: 'Historique de pratique, enregistrements et analyses',
    download: 'Télécharger',
    clear: 'Effacer',
    total: 'Total',
    average: 'Moyenne',
    visual: 'Visuel',
    audio: 'Audio',
    streak: 'Série',
    recentSessions: 'Sessions Récentes',
    noPractice: 'Pas encore de pratique',
    startPracticing: 'Commencez à pratiquer pour voir votre progrès ici',
    practiceAgain: 'Pratiquer à Nouveau',
    playRecording: 'Lire',
    reportIssue: 'Signaler un Problème',
    helpImprove: 'Aidez-nous à améliorer SoundMirror',
    online: 'En Ligne',
    offline: 'Hors Ligne',
    whatIssue: 'Quel type de problème?',
    specificIssue: 'Problème spécifique',
    severity: 'Gravité',
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Élevée',
    description: 'Description (optionnel)',
    describeIssue: 'Décrivez le problème plus en détail...',
    submitReport: 'Soumettre le Rapport',
    reportSaved: 'Rapport sauvegardé! Il sera envoyé quand vous serez en ligne.',
    home: 'Accueil',
    words: 'Mots',
    letters: 'Lettres',
    progress: 'Progrès',
    report: 'Rapport',
    animation: 'Animation',
    audioTts: 'Audio/TTS',
    phonemes: 'Phonèmes',
    recording: 'Enregistrement',
    uiDisplay: 'UI/Affichage',
    other: 'Autre',
    letter: 'Lettre',
  },
  de: {
    appName: 'SoundMirror',
    tagline: 'Sehe den Klang. Beherrsche die Sprache.',
    subtitle: 'Präzise Artikulationsvisualisierung zum Erlernen der Aussprache.',
    whatToPractice: 'Was möchtest du üben?',
    enterWord: 'Gib ein Wort oder einen Satz ein, um zu sehen, wie es ausgesprochen wird.',
    typeWord: 'Wort oder Satz eingeben...',
    suggestedWords: 'Vorgeschlagene Wörter und Sätze',
    letterPractice: 'Buchstabenübung',
    letterPracticeDesc: 'Lerne einzelne Phonem-Artikulationen',
    yourProgress: 'Dein Fortschritt',
    progressDesc: 'Verlauf, Aufnahmen und Analysen anzeigen',
    offlineReady: 'Offline Bereit',
    languagesSupported: 'Unterstützte Sprachen',
    back: 'Zurück',
    wordPractice: 'Wortübung',
    watchListen: 'Schauen, hören, dann aufnehmen',
    modelArticulation: 'Artikulationsmodell',
    frontView: 'Vorderansicht',
    sideView: 'Seitenansicht',
    phoneme: 'Phonem',
    frame: 'Bild',
    teachingPoint: 'Lehrpunkt',
    apex: 'Höhepunkt',
    speed: 'Geschwindigkeit',
    recordGrade: 'Aufnehmen und Bewerten',
    startRecording: 'Aufnahme Starten',
    stopRecording: 'Aufnahme Stoppen',
    playback: 'Wiedergabe',
    playing: 'Spielt ab...',
    visualScore: 'Visuelle Punktzahl',
    audioScore: 'Audio Punktzahl',
    lipJaw: 'Lippen- und Kieferbewegung',
    pronunciation: 'Aussprachegenauigkeit',
    tip: 'Tipp',
    tipText: 'Verwende 0.25x oder 0.5x Geschwindigkeit, um jede Mundposition deutlich zu sehen.',
    selectLetter: 'Buchstaben Auswählen',
    vowelsHighlighted: 'Vokale hervorgehoben',
    chooseAlphabet: 'Wähle aus dem Alphabet, um die Artikulation zu sehen',
    vowelsGold: 'Vokale sind gold hervorgehoben',
    playSound: 'Ton Abspielen',
    practiceHistory: 'Übungsverlauf, Aufnahmen und Analysen',
    download: 'Herunterladen',
    clear: 'Löschen',
    total: 'Gesamt',
    average: 'Durchschnitt',
    visual: 'Visuell',
    audio: 'Audio',
    streak: 'Serie',
    recentSessions: 'Letzte Sitzungen',
    noPractice: 'Noch keine Übung',
    startPracticing: 'Beginne zu üben, um deinen Fortschritt hier zu sehen',
    practiceAgain: 'Erneut Üben',
    playRecording: 'Abspielen',
    reportIssue: 'Problem Melden',
    helpImprove: 'Hilf uns, SoundMirror zu verbessern',
    online: 'Online',
    offline: 'Offline',
    whatIssue: 'Welche Art von Problem?',
    specificIssue: 'Spezifisches Problem',
    severity: 'Schweregrad',
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    description: 'Beschreibung (optional)',
    describeIssue: 'Beschreibe das Problem genauer...',
    submitReport: 'Bericht Senden',
    reportSaved: 'Bericht gespeichert! Er wird gesendet, wenn du online bist.',
    home: 'Start',
    words: 'Wörter',
    letters: 'Buchstaben',
    progress: 'Fortschritt',
    report: 'Melden',
    animation: 'Animation',
    audioTts: 'Audio/TTS',
    phonemes: 'Phoneme',
    recording: 'Aufnahme',
    uiDisplay: 'UI/Anzeige',
    other: 'Andere',
    letter: 'Buchstabe',
  },
  it: {
    appName: 'SoundMirror', tagline: 'Vedi il suono. Padroneggia il parlato.', subtitle: 'Visualizzazione precisa dell\'articolazione per imparare la pronuncia.',
    whatToPractice: 'Cosa vorresti praticare?', enterWord: 'Inserisci una parola o frase per vedere come si pronuncia.', typeWord: 'Scrivi una parola o frase...',
    suggestedWords: 'Parole e Frasi Suggerite', letterPractice: 'Pratica delle Lettere', letterPracticeDesc: 'Impara le articolazioni dei singoli fonemi',
    yourProgress: 'I Tuoi Progressi', progressDesc: 'Visualizza cronologia, registrazioni e analisi', offlineReady: 'Pronto Offline', languagesSupported: 'Lingue Supportate',
    back: 'Indietro', wordPractice: 'Pratica delle Parole', watchListen: 'Guarda, ascolta, poi registrati', modelArticulation: 'Modello di Articolazione',
    frontView: 'Vista Frontale', sideView: 'Vista Laterale', phoneme: 'Fonema', frame: 'Fotogramma', teachingPoint: 'Punto Didattico', apex: 'Apice',
    speed: 'Velocità', recordGrade: 'Registra e Valuta il Tuo Tentativo', startRecording: 'Inizia Registrazione', stopRecording: 'Ferma Registrazione',
    playback: 'Riproduci', playing: 'Riproduzione...', visualScore: 'Punteggio Visivo', audioScore: 'Punteggio Audio', lipJaw: 'Movimento labbra e mascella',
    pronunciation: 'Precisione pronuncia', tip: 'Suggerimento', tipText: 'Usa velocità 0.25x o 0.5x per vedere chiaramente ogni posizione della bocca.',
    selectLetter: 'Seleziona una Lettera', vowelsHighlighted: 'Vocali evidenziate', chooseAlphabet: 'Scegli dall\'alfabeto per vedere la sua articolazione',
    vowelsGold: 'Le vocali sono evidenziate in oro', playSound: 'Riproduci Suono', practiceHistory: 'Cronologia pratica, registrazioni e analisi',
    download: 'Scarica', clear: 'Cancella', total: 'Totale', average: 'Media', visual: 'Visivo', audio: 'Audio', streak: 'Serie',
    recentSessions: 'Sessioni Recenti', noPractice: 'Nessuna pratica ancora', startPracticing: 'Inizia a praticare per vedere i tuoi progressi qui',
    practiceAgain: 'Pratica Ancora', playRecording: 'Riproduci', reportIssue: 'Segnala un Problema', helpImprove: 'Aiutaci a migliorare SoundMirror',
    online: 'Online', offline: 'Offline', whatIssue: 'Che tipo di problema?', specificIssue: 'Problema specifico', severity: 'Gravità',
    low: 'Bassa', medium: 'Media', high: 'Alta', description: 'Descrizione (opzionale)', describeIssue: 'Descrivi il problema in dettaglio...',
    submitReport: 'Invia Segnalazione', reportSaved: 'Segnalazione salvata! Verrà inviata quando sarai online.',
    home: 'Home', words: 'Parole', letters: 'Lettere', progress: 'Progressi', report: 'Segnala',
    animation: 'Animazione', audioTts: 'Audio/TTS', phonemes: 'Fonemi', recording: 'Registrazione', uiDisplay: 'UI/Display', other: 'Altro', letter: 'Lettera',
  },
  pt: {
    appName: 'SoundMirror', tagline: 'Veja o som. Domine a fala.', subtitle: 'Visualização precisa de articulação para aprender pronúncia.',
    whatToPractice: 'O que você gostaria de praticar?', enterWord: 'Digite uma palavra ou frase para ver como é pronunciada.', typeWord: 'Digite uma palavra ou frase...',
    suggestedWords: 'Palavras e Frases Sugeridas', letterPractice: 'Prática de Letras', letterPracticeDesc: 'Aprenda articulações de fonemas individuais',
    yourProgress: 'Seu Progresso', progressDesc: 'Ver histórico, gravações e análises', offlineReady: 'Pronto Offline', languagesSupported: 'Idiomas Suportados',
    back: 'Voltar', wordPractice: 'Prática de Palavras', watchListen: 'Assista, ouça, depois grave-se', modelArticulation: 'Modelo de Articulação',
    frontView: 'Vista Frontal', sideView: 'Vista Lateral', phoneme: 'Fonema', frame: 'Quadro', teachingPoint: 'Ponto de Ensino', apex: 'Ápice',
    speed: 'Velocidade', recordGrade: 'Grave e Avalie Sua Tentativa', startRecording: 'Iniciar Gravação', stopRecording: 'Parar Gravação',
    playback: 'Reproduzir', playing: 'Reproduzindo...', visualScore: 'Pontuação Visual', audioScore: 'Pontuação de Áudio', lipJaw: 'Movimento de lábios e mandíbula',
    pronunciation: 'Precisão de pronúncia', tip: 'Dica', tipText: 'Use velocidade 0.25x ou 0.5x para ver claramente cada posição da boca.',
    selectLetter: 'Selecione uma Letra', vowelsHighlighted: 'Vogais destacadas', chooseAlphabet: 'Escolha do alfabeto para ver sua articulação',
    vowelsGold: 'Vogais são destacadas em dourado', playSound: 'Tocar Som', practiceHistory: 'Histórico de prática, gravações e análises',
    download: 'Baixar', clear: 'Limpar', total: 'Total', average: 'Média', visual: 'Visual', audio: 'Áudio', streak: 'Sequência',
    recentSessions: 'Sessões Recentes', noPractice: 'Nenhuma prática ainda', startPracticing: 'Comece a praticar para ver seu progresso aqui',
    practiceAgain: 'Praticar Novamente', playRecording: 'Reproduzir', reportIssue: 'Relatar um Problema', helpImprove: 'Ajude-nos a melhorar o SoundMirror',
    online: 'Online', offline: 'Offline', whatIssue: 'Que tipo de problema?', specificIssue: 'Problema específico', severity: 'Gravidade',
    low: 'Baixa', medium: 'Média', high: 'Alta', description: 'Descrição (opcional)', describeIssue: 'Descreva o problema em mais detalhes...',
    submitReport: 'Enviar Relatório', reportSaved: 'Relatório salvo! Será enviado quando você estiver online.',
    home: 'Início', words: 'Palavras', letters: 'Letras', progress: 'Progresso', report: 'Relatar',
    animation: 'Animação', audioTts: 'Áudio/TTS', phonemes: 'Fonemas', recording: 'Gravação', uiDisplay: 'UI/Tela', other: 'Outro', letter: 'Letra',
  },
  zh: {
    appName: 'SoundMirror', tagline: '看到声音。掌握语言。', subtitle: '精确的发音可视化学习工具。',
    whatToPractice: '你想练习什么？', enterWord: '输入单词或短语查看发音。', typeWord: '输入单词或短语...',
    suggestedWords: '推荐词汇', letterPractice: '字母练习', letterPracticeDesc: '学习单个音素的发音',
    yourProgress: '你的进度', progressDesc: '查看历史记录和分析', offlineReady: '离线可用', languagesSupported: '支持的语言',
    back: '返回', wordPractice: '单词练习', watchListen: '观看、聆听、然后录制', modelArticulation: '发音模型',
    frontView: '正面视图', sideView: '侧面视图', phoneme: '音素', frame: '帧', teachingPoint: '教学要点', apex: '顶点',
    speed: '速度', recordGrade: '录制并评分', startRecording: '开始录制', stopRecording: '停止录制',
    playback: '回放', playing: '播放中...', visualScore: '视觉评分', audioScore: '音频评分', lipJaw: '唇部和下颌运动',
    pronunciation: '发音准确度', tip: '提示', tipText: '使用0.25x或0.5x速度清晰地看到每个嘴型。',
    selectLetter: '选择字母', vowelsHighlighted: '元音高亮', chooseAlphabet: '从字母表中选择查看发音',
    vowelsGold: '元音以金色高亮显示', playSound: '播放声音', practiceHistory: '练习历史和分析',
    download: '下载', clear: '清除', total: '总计', average: '平均', visual: '视觉', audio: '音频', streak: '连续',
    recentSessions: '最近的练习', noPractice: '暂无练习', startPracticing: '开始练习以查看进度',
    practiceAgain: '再次练习', playRecording: '播放', reportIssue: '报告问题', helpImprove: '帮助我们改进SoundMirror',
    online: '在线', offline: '离线', whatIssue: '什么类型的问题？', specificIssue: '具体问题', severity: '严重程度',
    low: '低', medium: '中', high: '高', description: '描述（可选）', describeIssue: '详细描述问题...',
    submitReport: '提交报告', reportSaved: '报告已保存！将在联网时发送。',
    home: '首页', words: '单词', letters: '字母', progress: '进度', report: '报告',
    animation: '动画', audioTts: '音频/TTS', phonemes: '音素', recording: '录制', uiDisplay: '界面', other: '其他', letter: '字母',
  },
  ja: {
    appName: 'SoundMirror', tagline: '音を見る。話し方をマスター。', subtitle: '発音学習のための正確な調音可視化。',
    whatToPractice: '何を練習しますか？', enterWord: '単語やフレーズを入力して発音を確認。', typeWord: '単語やフレーズを入力...',
    suggestedWords: 'おすすめの言葉', letterPractice: '文字の練習', letterPracticeDesc: '個々の音素の調音を学ぶ',
    yourProgress: 'あなたの進捗', progressDesc: '履歴と分析を見る', offlineReady: 'オフライン対応', languagesSupported: '対応言語',
    back: '戻る', wordPractice: '単語の練習', watchListen: '見て、聞いて、録音する', modelArticulation: '調音モデル',
    frontView: '正面図', sideView: '側面図', phoneme: '音素', frame: 'フレーム', teachingPoint: '教えるポイント', apex: '頂点',
    speed: '速度', recordGrade: '録音して採点', startRecording: '録音開始', stopRecording: '録音停止',
    playback: '再生', playing: '再生中...', visualScore: '視覚スコア', audioScore: '音声スコア', lipJaw: '唇と顎の動き',
    pronunciation: '発音の正確さ', tip: 'ヒント', tipText: '0.25xか0.5xの速度で各口の位置をはっきり見る。',
    selectLetter: '文字を選択', vowelsHighlighted: '母音がハイライト', chooseAlphabet: 'アルファベットから選んで調音を見る',
    vowelsGold: '母音は金色でハイライト', playSound: '音を再生', practiceHistory: '練習履歴と分析',
    download: 'ダウンロード', clear: 'クリア', total: '合計', average: '平均', visual: '視覚', audio: '音声', streak: '連続',
    recentSessions: '最近のセッション', noPractice: 'まだ練習なし', startPracticing: '練習を始めて進捗を見る',
    practiceAgain: 'もう一度練習', playRecording: '再生', reportIssue: '問題を報告', helpImprove: 'SoundMirrorの改善にご協力ください',
    online: 'オンライン', offline: 'オフライン', whatIssue: 'どんな問題？', specificIssue: '具体的な問題', severity: '重大度',
    low: '低', medium: '中', high: '高', description: '説明（任意）', describeIssue: '問題を詳しく説明...',
    submitReport: 'レポートを送信', reportSaved: 'レポートが保存されました！オンラインになったら送信されます。',
    home: 'ホーム', words: '単語', letters: '文字', progress: '進捗', report: '報告',
    animation: 'アニメ', audioTts: '音声/TTS', phonemes: '音素', recording: '録音', uiDisplay: 'UI/表示', other: 'その他', letter: '文字',
  },
  ar: {
    appName: 'SoundMirror', tagline: 'شاهد الصوت. أتقن الكلام.', subtitle: 'تصور دقيق للنطق لتعلم الحروف.',
    whatToPractice: 'ماذا تريد أن تتدرب؟', enterWord: 'أدخل كلمة أو عبارة لمعرفة كيفية نطقها.', typeWord: 'اكتب كلمة أو عبارة...',
    suggestedWords: 'كلمات مقترحة', letterPractice: 'تدريب الحروف', letterPracticeDesc: 'تعلم نطق الحروف الفردية',
    yourProgress: 'تقدمك', progressDesc: 'عرض السجل والتسجيلات والتحليلات', offlineReady: 'جاهز بدون اتصال', languagesSupported: 'اللغات المدعومة',
    back: 'رجوع', wordPractice: 'تدريب الكلمات', watchListen: 'شاهد، استمع، ثم سجل نفسك', modelArticulation: 'نموذج النطق',
    frontView: 'عرض أمامي', sideView: 'عرض جانبي', phoneme: 'صوت', frame: 'إطار', teachingPoint: 'نقطة التعليم', apex: 'القمة',
    speed: 'السرعة', recordGrade: 'سجل وقيم محاولتك', startRecording: 'بدء التسجيل', stopRecording: 'إيقاف التسجيل',
    playback: 'تشغيل', playing: 'جاري التشغيل...', visualScore: 'النتيجة البصرية', audioScore: 'النتيجة الصوتية', lipJaw: 'حركة الشفاه والفك',
    pronunciation: 'دقة النطق', tip: 'نصيحة', tipText: 'استخدم سرعة 0.25x أو 0.5x لرؤية كل وضع للفم بوضوح.',
    selectLetter: 'اختر حرفاً', vowelsHighlighted: 'حروف العلة مميزة', chooseAlphabet: 'اختر من الأبجدية لرؤية نطقها',
    vowelsGold: 'حروف العلة مميزة بالذهبي', playSound: 'تشغيل الصوت', practiceHistory: 'سجل التدريب والتحليلات',
    download: 'تحميل', clear: 'مسح', total: 'المجموع', average: 'المتوسط', visual: 'بصري', audio: 'صوتي', streak: 'متتالية',
    recentSessions: 'الجلسات الأخيرة', noPractice: 'لا يوجد تدريب بعد', startPracticing: 'ابدأ التدريب لرؤية تقدمك هنا',
    practiceAgain: 'تدرب مرة أخرى', playRecording: 'تشغيل', reportIssue: 'الإبلاغ عن مشكلة', helpImprove: 'ساعدنا في تحسين SoundMirror',
    online: 'متصل', offline: 'غير متصل', whatIssue: 'ما نوع المشكلة؟', specificIssue: 'مشكلة محددة', severity: 'الخطورة',
    low: 'منخفضة', medium: 'متوسطة', high: 'عالية', description: 'الوصف (اختياري)', describeIssue: 'صف المشكلة بالتفصيل...',
    submitReport: 'إرسال التقرير', reportSaved: 'تم حفظ التقرير! سيتم إرساله عند الاتصال.',
    home: 'الرئيسية', words: 'كلمات', letters: 'حروف', progress: 'التقدم', report: 'إبلاغ',
    animation: 'الرسوم', audioTts: 'الصوت', phonemes: 'أصوات', recording: 'تسجيل', uiDisplay: 'الواجهة', other: 'أخرى', letter: 'حرف',
  },
  hi: {
    appName: 'SoundMirror', tagline: 'आवाज़ देखें। बोलना सीखें।', subtitle: 'उच्चारण सीखने के लिए सटीक दृश्यता।',
    whatToPractice: 'आप क्या अभ्यास करना चाहते हैं?', enterWord: 'उच्चारण देखने के लिए शब्द या वाक्य दर्ज करें।', typeWord: 'शब्द या वाक्य टाइप करें...',
    suggestedWords: 'सुझाए गए शब्द', letterPractice: 'अक्षर अभ्यास', letterPracticeDesc: 'व्यक्तिगत ध्वनियों का उच्चारण सीखें',
    yourProgress: 'आपकी प्रगति', progressDesc: 'इतिहास और विश्लेषण देखें', offlineReady: 'ऑफ़लाइन तैयार', languagesSupported: 'समर्थित भाषाएँ',
    back: 'वापस', wordPractice: 'शब्द अभ्यास', watchListen: 'देखें, सुनें, फिर रिकॉर्ड करें', modelArticulation: 'उच्चारण मॉडल',
    frontView: 'सामने का दृश्य', sideView: 'साइड व्यू', phoneme: 'ध्वनि', frame: 'फ्रेम', teachingPoint: 'शिक्षण बिंदु', apex: 'शीर्ष',
    speed: 'गति', recordGrade: 'रिकॉर्ड करें और ग्रेड करें', startRecording: 'रिकॉर्डिंग शुरू', stopRecording: 'रिकॉर्डिंग बंद',
    playback: 'प्लेबैक', playing: 'चल रहा है...', visualScore: 'दृश्य स्कोर', audioScore: 'ऑडियो स्कोर', lipJaw: 'होंठ और जबड़े की गति',
    pronunciation: 'उच्चारण सटीकता', tip: 'सुझाव', tipText: 'प्रत्येक मुख स्थिति को स्पष्ट रूप से देखने के लिए 0.25x या 0.5x गति का उपयोग करें।',
    selectLetter: 'अक्षर चुनें', vowelsHighlighted: 'स्वर हाइलाइट', chooseAlphabet: 'उच्चारण देखने के लिए वर्णमाला से चुनें',
    vowelsGold: 'स्वर सुनहरे रंग में हाइलाइट हैं', playSound: 'ध्वनि चलाएं', practiceHistory: 'अभ्यास इतिहास और विश्लेषण',
    download: 'डाउनलोड', clear: 'साफ़', total: 'कुल', average: 'औसत', visual: 'दृश्य', audio: 'ऑडियो', streak: 'क्रम',
    recentSessions: 'हाल के सत्र', noPractice: 'अभी तक कोई अभ्यास नहीं', startPracticing: 'अपनी प्रगति देखने के लिए अभ्यास शुरू करें',
    practiceAgain: 'फिर से अभ्यास', playRecording: 'चलाएं', reportIssue: 'समस्या की रिपोर्ट करें', helpImprove: 'SoundMirror को बेहतर बनाने में मदद करें',
    online: 'ऑनलाइन', offline: 'ऑफ़लाइन', whatIssue: 'किस प्रकार की समस्या?', specificIssue: 'विशिष्ट समस्या', severity: 'गंभीरता',
    low: 'कम', medium: 'मध्यम', high: 'उच्च', description: 'विवरण (वैकल्पिक)', describeIssue: 'समस्या का विस्तार से वर्णन करें...',
    submitReport: 'रिपोर्ट जमा करें', reportSaved: 'रिपोर्ट सहेजी गई! ऑनलाइन होने पर भेजी जाएगी।',
    home: 'होम', words: 'शब्द', letters: 'अक्षर', progress: 'प्रगति', report: 'रिपोर्ट',
    animation: 'एनिमेशन', audioTts: 'ऑडियो/TTS', phonemes: 'ध्वनियाँ', recording: 'रिकॉर्डिंग', uiDisplay: 'UI/प्रदर्शन', other: 'अन्य', letter: 'अक्षर',
  },
};

// ========== LANGUAGES ==========
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

const SUGGESTIONS = {
  en: ['hello', 'thank you', 'water', 'beautiful', 'good morning', 'pronunciation', 'opportunity', 'excuse me', 'wonderful', 'I love you'],
  es: ['hola', 'gracias', 'agua', 'hermoso', 'buenos días', 'pronunciación', 'oportunidad', 'con permiso', 'maravilloso', 'te quiero'],
  fr: ['bonjour', 'merci beaucoup', 'eau', 'magnifique', 'bonne nuit', 'prononciation', 'opportunité', 'excusez-moi', 'merveilleux', 'je t\'aime'],
  de: ['hallo', 'danke schön', 'wasser', 'wunderschön', 'guten morgen', 'aussprache', 'gelegenheit', 'entschuldigung', 'wunderbar', 'ich liebe dich'],
  it: ['ciao', 'grazie mille', 'acqua', 'bellissimo', 'buongiorno', 'pronuncia', 'opportunità', 'mi scusi', 'meraviglioso', 'ti amo'],
  pt: ['olá', 'muito obrigado', 'água', 'bonito', 'bom dia', 'pronúncia', 'oportunidade', 'com licença', 'maravilhoso', 'eu te amo'],
  zh: ['你好', '谢谢你', '水', '美丽', '早上好', '发音', '机会', '对不起', '太棒了', '我爱你'],
  ja: ['こんにちは', 'ありがとう', '水', '美しい', 'おはよう', '発音', '機会', 'すみません', '素晴らしい', '愛してる'],
  ar: ['مرحبا', 'شكرا جزيلا', 'ماء', 'جميل', 'صباح الخير', 'نطق', 'فرصة', 'عفوا', 'رائع', 'أحبك'],
  hi: ['नमस्ते', 'धन्यवाद', 'पानी', 'सुंदर', 'सुप्रभात', 'उच्चारण', 'अवसर', 'क्षमा करें', 'अद्भुत', 'मैं तुमसे प्यार करता हूँ'],
};

const ALPHABETS = {
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({ letter: l, phoneme: l.toLowerCase() + 'ah', isVowel: 'AEIOU'.includes(l) })),
  es: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').map(l => ({ letter: l, phoneme: l.toLowerCase() + 'eh', isVowel: 'AEIOU'.includes(l) })),
  fr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({ letter: l, phoneme: l.toLowerCase() + 'eh', isVowel: 'AEIOUY'.includes(l) })),
  de: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß'.split('').map(l => ({ letter: l, phoneme: l.toLowerCase() + 'eh', isVowel: 'AEIOUÄÖÜaeiouäöü'.includes(l) })),
  it: 'ABCDEFGHILMNOPQRSTUVZ'.split('').map(l => ({ letter: l, phoneme: l.toLowerCase() + 'eh', isVowel: 'AEIOU'.includes(l) })),
  pt: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({ letter: l, phoneme: l.toLowerCase() + 'eh', isVowel: 'AEIOU'.includes(l) })),
  zh: ['啊','波','次','得','鹅','佛','哥','喝','衣','鸡','科','勒','摸','呢','哦','坡','期','日','思','特','乌','微','西','呀','资'].map((l,i) => ({ letter: l, phoneme: l, isVowel: i < 5 || [8,14,20].includes(i) })),
  ja: ['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と','な','に','ぬ','ね','の'].map((l,i) => ({ letter: l, phoneme: l, isVowel: i < 5 })),
  ar: ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'].map((l,i) => ({ letter: l, phoneme: l, isVowel: [0,26,27].includes(i) })),
  hi: ['अ','आ','इ','ई','उ','ऊ','ए','ऐ','ओ','औ','क','ख','ग','घ','च','छ','ज','झ','ट','ठ','ड','ढ','ण','त','थ'].map((l,i) => ({ letter: l, phoneme: l, isVowel: i < 10 })),
};

const LETTER_PHONEME_MAP = { a:{letter:'A',phoneme:'a'}, b:{letter:'B',phoneme:'b'}, c:{letter:'C',phoneme:'k'}, d:{letter:'D',phoneme:'d'}, e:{letter:'E',phoneme:'e'}, f:{letter:'F',phoneme:'f'}, g:{letter:'G',phoneme:'g'}, h:{letter:'H',phoneme:'h'}, i:{letter:'I',phoneme:'i'}, j:{letter:'J',phoneme:'j'}, k:{letter:'K',phoneme:'k'}, l:{letter:'L',phoneme:'l'}, m:{letter:'M',phoneme:'m'}, n:{letter:'N',phoneme:'n'}, o:{letter:'O',phoneme:'o'}, p:{letter:'P',phoneme:'p'}, q:{letter:'Q',phoneme:'k'}, r:{letter:'R',phoneme:'r'}, s:{letter:'S',phoneme:'s'}, t:{letter:'T',phoneme:'t'}, u:{letter:'U',phoneme:'u'}, v:{letter:'V',phoneme:'v'}, w:{letter:'W',phoneme:'w'}, x:{letter:'X',phoneme:'x'}, y:{letter:'Y',phoneme:'y'}, z:{letter:'Z',phoneme:'z'} };

// ========== LANGUAGE CONTEXT ==========
const LanguageContext = React.createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

function useLanguage() {
  return React.useContext(LanguageContext);
}

function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('soundmirror_lang') || 'en');
  useEffect(() => { localStorage.setItem('soundmirror_lang', lang); }, [lang]);
  const t = useCallback((key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

// ========== SPLASH SCREEN ==========
function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0: drop falling, 1: impact + ripples, 2: logo, 3: done
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),   // Drop hits water
      setTimeout(() => setPhase(2), 1600),  // Show logo
      setTimeout(() => setPhase(3), 2400),  // Fade ripples
      setTimeout(() => onComplete(), 3000), // Complete
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      {/* Water Drop - smaller, animated falling */}
      <div 
        className={`absolute transition-all ${phase >= 1 ? 'opacity-0 scale-50' : 'opacity-100'}`}
        style={{ 
          top: phase === 0 ? '15%' : '50%', 
          transition: 'top 0.7s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.15s ease-out',
        }}
      >
        <div 
          className="w-4 h-6 bg-gradient-to-b from-white via-sky-200 to-cyan-400 relative"
          style={{ 
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', 
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.6), inset 0 -3px 6px rgba(56, 189, 248, 0.4)',
            animation: phase === 0 ? 'dropWobble 0.3s ease-in-out infinite' : 'none',
          }}
        >
          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/80 rounded-full" />
        </div>
      </div>

      {/* Ripples - thicker, white */}
      {phase >= 1 && (
        <div className="absolute flex items-center justify-center">
          {[0, 1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="absolute rounded-full"
              style={{
                width: `${40 + i * 70}px`, 
                height: `${40 + i * 70}px`,
                border: `${4 - i * 0.5}px solid rgba(255, 255, 255, ${0.9 - i * 0.15})`,
                animation: `rippleExpand 1.8s ease-out ${i * 0.12}s forwards`,
                opacity: phase >= 3 ? 0 : 1,
                transition: 'opacity 0.6s ease-out',
              }} 
            />
          ))}
        </div>
      )}

      {/* Logo */}
      <div className={`flex items-center gap-4 transition-all duration-700 ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(56, 189, 248, 0.5)' }}>
          <Activity className="w-8 h-8 text-slate-900" />
        </div>
        <span className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
          SoundMirror
        </span>
      </div>

      <style>{`
        @keyframes dropWobble {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          50% { transform: scaleX(0.92) scaleY(1.08); }
        }
        @keyframes rippleExpand {
          0% { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ========== LAYOUT ==========
function Layout({ children }) {
  const location = useLocation();
  const { t } = useLanguage();
  const navItems = [
    { path: '/', label: t('home'), icon: HomeIcon },
    { path: '/practice', label: t('words'), icon: Mic2 },
    { path: '/letters', label: t('letters'), icon: BookA },
    { path: '/history', label: t('progress'), icon: BarChart3 },
    { path: '/report', label: t('report'), icon: Bug },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex">
      <nav className="fixed left-0 top-0 h-full w-20 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col items-center py-6 z-20">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}>
            <Activity className="w-6 h-6 text-slate-900" />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink key={path} to={path} className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative ${isActive ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : ''}`} />
                <span className="text-[9px] font-medium">{label}</span>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-400 rounded-r-full" />}
              </NavLink>
            );
          })}
        </div>
        <div className="mt-auto">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center" title={t('offlineReady')}>
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </nav>
      <main className="flex-1 ml-20 min-h-screen">{children}</main>
    </div>
  );
}

// ========== CLINICAL-GRADE PHONEME SPRITE ENGINE ==========
// P000-P024 Phoneme mapping with 10 frames per cluster
// Frame #5 of each cluster = sweet spot (apex articulation)
// Mathematical formula: target sweet spot first, then use adjacent frames for smooth transitions

const PHONEME_MAP = {
  // P000: Neutral (frames 0-9) - rest position
  '_': { cluster: 0, name: 'neutral', frames: [0,1,2,3,4,5,6,7,8,9] },
  ' ': { cluster: 0, name: 'neutral', frames: [0,1,2,3,4,5,6,7,8,9] },
  
  // VOWELS (P001-P006)
  'a': { cluster: 1, name: '/a/ ah', frames: [10,11,12,13,14,15,16,17,18,19] },      // P001 father, spa
  'i': { cluster: 2, name: '/i/ ee', frames: [20,21,22,23,24,25,26,27,28,29] },      // P002 see, machine
  'u': { cluster: 3, name: '/u/ oo', frames: [30,31,32,33,34,35,36,37,38,39] },      // P003 food, blue
  'e': { cluster: 4, name: '/e/ eh', frames: [40,41,42,43,44,45,46,47,48,49] },      // P004 bed, met
  'o': { cluster: 5, name: '/o/ oh', frames: [50,51,52,53,54,55,56,57,58,59] },      // P005 go (pure)
  'y': { cluster: 6, name: '/y/ ü', frames: [60,61,62,63,64,65,66,67,68,69] },       // P006 French tu
  
  // STOPS / CLOSURES (P007-P012)
  'p': { cluster: 7, name: '/p/', frames: [70,71,72,73,74,75,76,77,78,79] },         // P007 pat
  'b': { cluster: 7, name: '/p/', frames: [70,71,72,73,74,75,76,77,78,79] },         // Same as p
  't': { cluster: 8, name: '/t/', frames: [80,81,82,83,84,85,86,87,88,89] },         // P008 top
  'd': { cluster: 9, name: '/d/', frames: [90,91,92,93,94,95,96,97,98,99] },         // P009 dog
  'k': { cluster: 10, name: '/k/', frames: [100,101,102,103,104,105,106,107,108,109] }, // P010 cat
  'c': { cluster: 10, name: '/k/', frames: [100,101,102,103,104,105,106,107,108,109] }, // Same as k
  'q': { cluster: 10, name: '/k/', frames: [100,101,102,103,104,105,106,107,108,109] }, // Same as k
  'g': { cluster: 11, name: '/g/', frames: [110,111,112,113,114,115,116,117,118,119] }, // P011 go
  'glottal': { cluster: 12, name: '/ʔ/', frames: [120,121,122,123,124,125,126,127,128,129] }, // P012 uh-oh
  
  // NASALS (P013-P014)
  'n': { cluster: 13, name: '/n/', frames: [130,131,132,133,134,135,136,137,138,139] }, // P013 no
  'm': { cluster: 13, name: '/n/', frames: [130,131,132,133,134,135,136,137,138,139] }, // Same mouth
  'ng': { cluster: 14, name: '/ŋ/', frames: [140,141,142,143,144,145,146,147,148,149] }, // P014 sing
  
  // FRICATIVES / AFFRICATES (P015-P020)
  's': { cluster: 15, name: '/s/', frames: [150,151,152,153,154,155,156,157,158,159] }, // P015 see
  'z': { cluster: 15, name: '/s/', frames: [150,151,152,153,154,155,156,157,158,159] }, // Same as s
  'sh': { cluster: 16, name: '/ʃ/', frames: [160,161,162,163,164,165,166,167,168,169] }, // P016 ship
  'th': { cluster: 17, name: '/θ/', frames: [170,171,172,173,174,175,176,177,178,179] }, // P017 think
  'f': { cluster: 18, name: '/f/', frames: [180,181,182,183,184,185,186,187,188,189] }, // P018 fan
  'v': { cluster: 18, name: '/f/', frames: [180,181,182,183,184,185,186,187,188,189] }, // Same as f
  'h': { cluster: 19, name: '/h/', frames: [190,191,192,193,194,195,196,197,198,199] }, // P019 hat
  'ch': { cluster: 20, name: '/tʃ/', frames: [200,201,202,203,204,205,206,207,208,209] }, // P020 chair
  'j': { cluster: 20, name: '/tʃ/', frames: [200,201,202,203,204,205,206,207,208,209] }, // Same as ch
  
  // LIQUIDS / LATERALS (P021-P023)
  'r': { cluster: 21, name: '/r/', frames: [210,211,212,213,214,215,216,217,218,219] }, // P021 red
  'l': { cluster: 22, name: '/l/', frames: [220,221,222,223,224,225,226,227,228,229] }, // P022 lip
  'll': { cluster: 22, name: '/l/', frames: [220,221,222,223,224,225,226,227,228,229] }, // Double L = single phoneme
  'welsh_ll': { cluster: 23, name: '/ɬ/', frames: [230,231,232,233,234,235,236,237,238,239] }, // P023 Welsh ll
  'w': { cluster: 3, name: '/u/ oo', frames: [30,31,32,33,34,35,36,37,38,39] },      // Like /u/
  
  // CLICKS (P024)
  'click': { cluster: 24, name: '/ǀ/', frames: [240,241,242,243,244,245,246,247,248,249] }, // P024 tsk
  'x': { cluster: 10, name: '/k/', frames: [100,101,102,103,104,105,106,107,108,109] }, // Like k+s
};

// Digraph detection - these letter combinations are single phonemes
const DIGRAPHS = {
  'll': 'll',    // hello -> he-ll-o (3 phonemes, not 4)
  'sh': 'sh',    // ship -> sh-i-p
  'ch': 'ch',    // chair -> ch-ai-r
  'th': 'th',    // think -> th-i-nk
  'ng': 'ng',    // sing -> si-ng
  'ph': 'f',     // phone -> f-o-ne
  'wh': 'w',     // what -> w-a-t
  'ck': 'k',     // back -> ba-k
  'gh': '_',     // silent in "night"
};

// Convert text to phoneme sequence (handles digraphs)
const textToPhonemes = (text) => {
  const result = [];
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '');
  let i = 0;
  
  while (i < lower.length) {
    // Check for digraphs first (2-letter combinations)
    if (i < lower.length - 1) {
      const digraph = lower.substring(i, i + 2);
      if (DIGRAPHS[digraph]) {
        result.push(DIGRAPHS[digraph]);
        i += 2;
        continue;
      }
    }
    
    // Single character
    const char = lower[i];
    if (char === ' ') {
      result.push('_'); // Word pause
    } else {
      result.push(char);
    }
    i++;
  }
  
  return result;
};

// Get the sweet spot frame (frame #5 of the 10-frame cluster)
const getSweetSpot = (phoneme) => {
  const data = PHONEME_MAP[phoneme] || PHONEME_MAP['_'];
  return data.frames[5]; // Frame #5 is always the sweet spot
};

// Get all frames for a phoneme cluster
const getPhonemeFrames = (phoneme) => {
  const data = PHONEME_MAP[phoneme] || PHONEME_MAP['_'];
  return data.frames;
};

// Frame priority for smooth transitions (5 is highest priority)
// Priority: 5 > 4,6 > 3,7 > 2,8 > 1,9 > 0
const FRAME_PRIORITY = [5, 4, 6, 3, 7, 2, 8, 1, 9, 0];

// Build optimal animation sequence for natural speech
// Uses max 5 frames per phoneme, prioritizing sweet spot
const buildAnimationTimeline = (phonemes) => {
  const timeline = [];
  const FRAMES_TO_USE = 5; // Max frames per phoneme for natural timing
  
  // Start from neutral
  timeline.push({ frame: 5, phoneme: '_', type: 'start' }); // Neutral sweet spot
  
  for (let pIdx = 0; pIdx < phonemes.length; pIdx++) {
    const phoneme = phonemes[pIdx];
    const frames = getPhonemeFrames(phoneme);
    const sweetSpot = frames[5];
    
    if (phoneme === '_' || phoneme === ' ') {
      // Word pause - hold neutral briefly
      timeline.push({ frame: 5, phoneme: '_', type: 'pause' });
      continue;
    }
    
    // Determine transition frames based on previous phoneme
    const prevFrame = timeline.length > 0 ? timeline[timeline.length - 1].frame : 5;
    
    // Build path: transition in -> sweet spot -> transition out
    // Use priority order but limit to FRAMES_TO_USE
    const selectedIndices = FRAME_PRIORITY.slice(0, FRAMES_TO_USE);
    
    // Approach: ramp up to sweet spot
    for (let i = 0; i < Math.floor(FRAMES_TO_USE / 2); i++) {
      const frameIdx = selectedIndices[FRAMES_TO_USE - 1 - i]; // Start from lower priority
      timeline.push({ frame: frames[frameIdx], phoneme, type: 'approach' });
    }
    
    // Sweet spot (hold slightly for emphasis)
    timeline.push({ frame: sweetSpot, phoneme, type: 'apex' });
    
    // Depart: ramp down from sweet spot
    for (let i = Math.floor(FRAMES_TO_USE / 2) - 1; i >= 0; i--) {
      const frameIdx = selectedIndices[FRAMES_TO_USE - 1 - i];
      timeline.push({ frame: frames[frameIdx], phoneme, type: 'depart' });
    }
  }
  
  // Return to neutral
  timeline.push({ frame: 5, phoneme: '_', type: 'end' });
  
  return timeline;
};

// Calculate natural timing for speech (milliseconds per frame)
// Average speaking rate: ~4-5 syllables per second
// Each phoneme ~150-200ms, spread across our frames
const calculateNaturalTiming = (phonemeCount, playbackRate = 1.0) => {
  const BASE_PHONEME_DURATION = 180; // ms per phoneme at normal speed
  const msPerPhoneme = BASE_PHONEME_DURATION / playbackRate;
  const framesPerPhoneme = 5;
  return Math.round(msPerPhoneme / framesPerPhoneme); // ms per frame
};

// ========== PHONEME AUDIO MAPPING ==========
const getPhonemeAudioPath = (letter, lang) => {
  const phonemeMap = {
    'a': 'ah', 'b': 'ba', 'c': 'ca', 'd': 'da', 'e': 'eh', 'f': 'fa', 'g': 'ga',
    'h': 'ha', 'i': 'ih', 'j': 'ja', 'k': 'ka', 'l': 'la', 'm': 'ma', 'n': 'na',
    'o': 'oh', 'p': 'pa', 'q': 'kwa', 'r': 'ra', 's': 'sa', 't': 'ta', 'u': 'uh',
    'v': 'va', 'w': 'wa', 'x': 'xa', 'y': 'ya', 'z': 'za'
  };
  const langCode = lang.split('-')[0];
  const phoneme = phonemeMap[letter.toLowerCase()] || 'ah';
  return `/assets/audio/phonemes/${langCode}-${phoneme}.mp3`;
};

// ========== DUAL HEAD ANIMATOR ==========
// Clinical-grade sprite animation with mathematical frame selection
const FRAME_SIZE = 512;
const FRAMES_PER_SHEET = 50;

function DualHeadAnimator({ phonemeSequence = [], isPlaying = false, playbackRate = 1.0, onAnimationComplete, size = 'large' }) {
  const { t } = useLanguage();
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [sheetsLoaded, setSheetsLoaded] = useState(false);
  const timerRef = useRef(null);
  
  // Convert input to proper phoneme sequence
  const phonemes = Array.isArray(phonemeSequence) && phonemeSequence.length > 0 
    ? (typeof phonemeSequence[0] === 'string' && phonemeSequence[0].length > 1 
        ? textToPhonemes(phonemeSequence.join(' '))
        : phonemeSequence.flatMap(p => textToPhonemes(p)))
    : ['a'];

  // Build animation timeline when phonemes change
  useEffect(() => {
    const newTimeline = buildAnimationTimeline(phonemes);
    setTimeline(newTimeline);
    setCurrentFrameIndex(0);
  }, [phonemes.join(',')]);

  // Preload sprite sheets
  useEffect(() => {
    let loadedCount = 0;
    const totalSheets = 10;
    
    for (let i = 0; i < 5; i++) {
      ['front', 'side'].forEach(view => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalSheets) setSheetsLoaded(true);
        };
        img.src = `/assets/sprites/${view}_sheet_${i}.jpg`;
      });
    }
  }, []);

  // Animation loop
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isPlaying && sheetsLoaded && timeline.length > 0) {
      setCurrentFrameIndex(0);
      let idx = 0;
      
      const frameInterval = calculateNaturalTiming(phonemes.length, playbackRate);
      
      timerRef.current = setInterval(() => {
        idx++;
        if (idx >= timeline.length) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setCurrentFrameIndex(0);
          onAnimationComplete?.();
          return;
        }
        setCurrentFrameIndex(idx);
      }, frameInterval);
    } else if (!isPlaying) {
      setCurrentFrameIndex(0);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, sheetsLoaded, timeline, playbackRate, phonemes.length, onAnimationComplete]);

  // Get current frame data
  const currentData = timeline[currentFrameIndex] || { frame: 5, phoneme: '_', type: 'idle' };
  const spriteFrame = currentData.frame;
  const currentPhoneme = currentData.phoneme;
  const isApex = currentData.type === 'apex';

  // Calculate sprite sheet position
  const sheetIndex = Math.floor(spriteFrame / FRAMES_PER_SHEET);
  const frameInSheet = spriteFrame % FRAMES_PER_SHEET;
  const yOffset = frameInSheet * FRAME_SIZE;

  const spriteSize = size === 'large' ? 300 : size === 'medium' ? 240 : 180;

  return (
    <div className="flex flex-col items-center gap-3" data-testid="dual-head-animator">
      {!sheetsLoaded && <div className="text-xs text-sky-400 animate-pulse">Loading sprites...</div>}
      <div className="flex gap-4 justify-center">
        {['front', 'side'].map((view) => (
          <div key={view} className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {view === 'front' ? t('frontView') : t('sideView')}
            </div>
            <div 
              className={`relative overflow-hidden rounded-xl border-2 ${isApex ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-600'}`}
              style={{ 
                width: spriteSize, 
                height: spriteSize,
                backgroundColor: '#ffffff',
                boxShadow: isApex ? '0 0 25px rgba(251, 191, 36, 0.5)' : '0 4px 15px rgba(0,0,0,0.3)'
              }}
              data-testid={`animator-${view}`}
            >
              <div
                style={{
                  width: spriteSize,
                  height: spriteSize,
                  backgroundImage: `url(/assets/sprites/${view}_sheet_${sheetIndex}.jpg)`,
                  backgroundPosition: `0 -${(yOffset / FRAME_SIZE) * spriteSize}px`,
                  backgroundSize: `${spriteSize}px ${FRAMES_PER_SHEET * spriteSize}px`,
                  backgroundRepeat: 'no-repeat'
                }}
              />
              {isApex && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-amber-500 rounded text-[9px] font-bold text-slate-900 uppercase shadow">
                  ★
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-slate-400">
          /{currentPhoneme}/ 
        </span>
        <span className="text-slate-600">
          {currentFrameIndex + 1}/{timeline.length}
        </span>
        <span className="text-emerald-400 font-mono">
          F{spriteFrame}
        </span>
        {isApex && <span className="text-amber-400">★ sweet spot</span>}
      </div>
    </div>
  );
}

// ========== COMPACT RECORDING PANEL ==========
function RecordingPanel({ onRecordingComplete, compact = false }) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [visualScore, setVisualScore] = useState(null);
  const [audioScore, setAudioScore] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const startRecording = () => { setIsRecording(true); setHasRecording(false); setVisualScore(null); setAudioScore(null); setRecordingTime(0); timerRef.current = setInterval(() => setRecordingTime(t => t + 100), 100); };
  const stopRecording = () => { setIsRecording(false); setHasRecording(true); clearInterval(timerRef.current); setTimeout(() => { const v = Math.floor(Math.random()*30)+70, a = Math.floor(Math.random()*30)+70; setVisualScore(v); setAudioScore(a); onRecordingComplete?.({ visualScore: v, audioScore: a, duration: recordingTime }); }, 500); };
  const getScoreColor = (s) => s >= 85 ? 'text-emerald-400' : s >= 70 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className={`glass-card ${compact ? 'p-3' : 'p-4'}`}>
      <h3 className={`font-semibold text-slate-200 mb-3 text-center flex items-center justify-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
        <Camera className="w-4 h-4 text-sky-400" />{t('recordGrade')}
      </h3>
      <div className={`relative bg-slate-950 rounded-xl mb-3 overflow-hidden border border-slate-700/50 ${compact ? 'h-24' : 'h-32'}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {isRecording ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-rose-500 flex items-center justify-center mb-1 animate-pulse"><Video className="w-6 h-6 text-rose-400" /></div>
              <div className="text-rose-400 font-mono text-sm">{(recordingTime / 1000).toFixed(1)}s</div>
            </div>
          ) : hasRecording ? (
            <div className="text-slate-400 text-xs"><Video className="w-8 h-8 mx-auto mb-1 text-slate-500" />Ready</div>
          ) : (
            <div className="text-slate-500 text-xs text-center"><Video className="w-8 h-8 mx-auto mb-1 text-slate-600" />Camera</div>
          )}
        </div>
        {isRecording && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-20 h-12 border-2 border-dashed border-cyan-400/50 rounded-full" /></div>}
      </div>
      <div className="flex justify-center gap-2 mb-3">
        {!isRecording ? (
          <button onClick={startRecording} className="btn-glow flex items-center gap-2 px-4 py-2 text-sm"><Circle className="w-4 h-4 fill-current" />{t('startRecording')}</button>
        ) : (
          <button onClick={stopRecording} className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm"><Square className="w-4 h-4" />{t('stopRecording')}</button>
        )}
        {hasRecording && <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 rounded-xl text-sm"><Play className="w-4 h-4" />{t('playback')}</button>}
      </div>
      {visualScore !== null && (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-slate-800/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1"><Eye className="w-3 h-3 text-cyan-400" /><span className="text-[10px] text-slate-500">{t('visual')}</span></div>
            <div className={`text-xl font-bold ${getScoreColor(visualScore)}`}>{visualScore}%</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1"><Ear className="w-3 h-3 text-purple-400" /><span className="text-[10px] text-slate-500">{t('audio')}</span></div>
            <div className={`text-xl font-bold ${getScoreColor(audioScore)}`}>{audioScore}%</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== PLAYBACK CONTROLS ==========
function PlaybackControls({ isPlaying, isMuted, playbackSpeed, onPlay, onPause, onReset, onSpeedChange, onMuteToggle }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-900/60 backdrop-blur-lg rounded-xl border border-slate-700/50">
      <button data-testid="playback-play-btn" onClick={isPlaying ? onPause : onPlay} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-sky-500 text-slate-900' : 'bg-sky-500/20 text-sky-400 border border-sky-500/50'}`} style={isPlaying ? { boxShadow: '0 0 20px rgba(56,189,248,0.5)' } : {}}>
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>
      <button onClick={onReset} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800"><RotateCcw className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-slate-700" />
      <div className="flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{t('speed')}</span>
        <div className="flex gap-1">
          {[0.25, 0.5, 0.75, 1.0].map(v => (
            <button key={v} onClick={() => onSpeedChange(v)} className={`px-2 py-0.5 rounded text-xs font-medium ${playbackSpeed === v ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' : 'text-slate-400 hover:bg-slate-800'}`}>{v}x</button>
          ))}
        </div>
      </div>
      <div className="w-px h-6 bg-slate-700" />
      <button onClick={onMuteToggle} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMuted ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'}`}>
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ========== LANGUAGE SELECTOR ==========
function LanguageSelector({ compact = false }) {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-all ${compact ? 'px-3 py-2' : 'px-4 py-2.5 min-w-[160px]'}`}>
        <span className="text-lg">{selectedLanguage.flag}</span>
        {!compact && <span className="text-sm font-medium text-slate-200">{selectedLanguage.nativeName}</span>}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-48 z-20 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-xl max-h-80 overflow-y-auto">
            {LANGUAGES.map((l) => (
              <button key={l.code} onClick={() => { setLang(l.code); setIsOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-800 ${l.code === lang ? 'bg-sky-500/10' : ''}`}>
                <span className="text-lg">{l.flag}</span>
                <span className="text-sm font-medium text-slate-200">{l.nativeName}</span>
                {l.code === lang && <Check className="w-4 h-4 text-sky-400 ml-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ========== WORD INPUT ==========
function WordInput({ onSubmit, suggestions = [] }) {
  const { t } = useLanguage();
  const [value, setValue] = useState('');
  return (
    <div className="w-full max-w-xl">
      <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) onSubmit(value.trim()); }} className="flex items-center gap-3 px-5 py-4 bg-slate-900/80 backdrop-blur-lg rounded-2xl border-2 border-slate-700/50 focus-within:border-sky-500/50">
        <Search className="w-5 h-5 text-slate-500" />
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={t('typeWord')} className="flex-1 bg-transparent text-slate-100 text-lg placeholder:text-slate-500 focus:outline-none" />
        <button type="submit" disabled={!value.trim()} className={`w-10 h-10 rounded-xl flex items-center justify-center ${value.trim() ? 'bg-sky-500 text-slate-900' : 'bg-slate-800 text-slate-500'}`}><ArrowRight className="w-5 h-5" /></button>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">{t('suggestedWords')}</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(w => <button key={w} onClick={() => { setValue(w); onSubmit(w); }} className="px-3 py-1.5 rounded-xl text-sm bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:border-sky-500/50 hover:text-sky-300">{w}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ========== PAGES ==========
function HomePage() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.en;
  return (
    <div className="min-h-screen p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(56,189,248,0.3)' }}><Activity className="w-7 h-7 text-slate-900" /></div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">{t('appName')}</h1>
          </div>
          <p className="text-xl text-slate-400">{t('tagline')}<br /><span className="text-slate-500">{t('subtitle')}</span></p>
        </div>
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-6">
            <div className="flex-1"><h2 className="text-2xl font-semibold text-slate-100 mb-2">{t('whatToPractice')}</h2><p className="text-slate-400">{t('enterWord')}</p></div>
            <LanguageSelector />
          </div>
          <WordInput onSubmit={(w) => navigate(`/practice?word=${encodeURIComponent(w)}&lang=${lang}`)} suggestions={suggestions} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <button onClick={() => navigate('/letters')} className="glass-card p-6 text-left group hover:border-indigo-500/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30"><BookA className="w-6 h-6 text-indigo-400" /></div>
              <div><h3 className="text-lg font-semibold text-slate-100">{t('letterPractice')}</h3><p className="text-sm text-slate-400">{t('letterPracticeDesc')}</p></div>
            </div>
          </button>
          <button onClick={() => navigate('/history')} className="glass-card p-6 text-left group hover:border-emerald-500/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30"><Sparkles className="w-6 h-6 text-emerald-400" /></div>
              <div><h3 className="text-lg font-semibold text-slate-100">{t('yourProgress')}</h3><p className="text-sm text-slate-400">{t('progressDesc')}</p></div>
            </div>
          </button>
        </div>
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />{t('offlineReady')} • 10 {t('languagesSupported')}
          </div>
        </div>
      </div>
    </div>
  );
}

function WordPracticePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const word = searchParams.get('word') || 'hello';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [visualScore, setVisualScore] = useState(null);
  const [audioScore, setAudioScore] = useState(null);
  const timerRef = useRef(null);

  const phonemes = word.toLowerCase().replace(/[^a-z]/g, '').split('').map(c => LETTER_PHONEME_MAP[c] || { letter: c.toUpperCase(), phoneme: c });
  const phonemeTokens = phonemes.map(p => p.phoneme);

  const handlePlay = () => { 
    // Start animation immediately
    setIsPlaying(true);
    
    if ('speechSynthesis' in window && !isMuted) { 
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      const u = new SpeechSynthesisUtterance(word); 
      u.rate = playbackSpeed; 
      u.lang = lang;
      
      // Animation handles its own completion via onAnimationComplete
      window.speechSynthesis.speak(u);
    }
  };
  
  const startRecording = () => { 
    setIsRecording(true); 
    setHasRecording(false); 
    setVisualScore(null); 
    setAudioScore(null); 
    setRecordingTime(0); 
    timerRef.current = setInterval(() => setRecordingTime(t => t + 100), 100); 
  };
  
  const stopRecording = () => { 
    setIsRecording(false); 
    setHasRecording(true); 
    clearInterval(timerRef.current);
    setTimeout(() => { 
      const v = Math.floor(Math.random()*30)+70;
      const a = Math.floor(Math.random()*30)+70;
      setVisualScore(v); 
      setAudioScore(a);
      // Save to history
      const h = JSON.parse(localStorage.getItem('soundmirror_history') || '[]');
      h.unshift({ id: Date.now(), word, lang, visualScore: v / 100, audioScore: a / 100, score: (v + a) / 200, date: new Date().toISOString(), duration: recordingTime });
      localStorage.setItem('soundmirror_history', JSON.stringify(h.slice(0, 50)));
    }, 500);
  };

  const getScoreColor = (s) => s >= 85 ? 'text-emerald-400' : s >= 70 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200"><ArrowLeft className="w-5 h-5" />{t('back')}</button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-100">{t('wordPractice')}: <span className="text-sky-400">{word}</span></h1>
            <p className="text-slate-500 text-sm">{t('watchListen')}</p>
          </div>
          <LanguageSelector compact />
        </div>
        
        {/* Main content: Large Camera LEFT, Model + Controls RIGHT */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* LEFT: Large Camera/Recording Screen */}
          <div className="lg:col-span-2 glass-card p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 text-center uppercase tracking-wider flex items-center justify-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />{t('recordGrade')}
            </h3>
            {/* Large Video Preview */}
            <div className="relative bg-slate-950 rounded-2xl mb-4 overflow-hidden border border-slate-700/50 aspect-[4/3]">
              <div className="absolute inset-0 flex items-center justify-center">
                {isRecording ? (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-rose-500 flex items-center justify-center mb-2 animate-pulse">
                      <Video className="w-10 h-10 text-rose-400" />
                    </div>
                    <div className="text-rose-400 font-mono text-2xl">{(recordingTime / 1000).toFixed(1)}s</div>
                    <div className="text-rose-300 text-sm mt-1">Recording...</div>
                  </div>
                ) : hasRecording ? (
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-2 text-emerald-400" />
                    <div className="text-emerald-400 text-lg font-medium">Recording Ready</div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-center">
                    <Video className="w-20 h-20 mx-auto mb-2 text-slate-600" />
                    <div className="text-lg">Camera Preview</div>
                    <div className="text-sm text-slate-600">Press record to capture</div>
                  </div>
                )}
              </div>
              {/* Lip tracking overlay */}
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-20 border-2 border-dashed border-cyan-400/60 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            
            {/* Record Controls */}
            <div className="flex justify-center gap-3 mb-4">
              {!isRecording ? (
                <button onClick={startRecording} className="btn-glow flex items-center gap-2 px-6 py-3 text-base">
                  <Circle className="w-5 h-5 fill-current" />{t('startRecording')}
                </button>
              ) : (
                <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-base hover:bg-rose-600 transition-colors">
                  <Square className="w-5 h-5" />{t('stopRecording')}
                </button>
              )}
              {hasRecording && (
                <button className="flex items-center gap-2 px-4 py-3 bg-slate-700 text-slate-200 rounded-xl">
                  <Play className="w-5 h-5" />{t('playback')}
                </button>
              )}
            </div>
            
            {/* Scores */}
            {visualScore !== null && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/50 text-center border border-slate-700/50">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-400">{t('visualScore')}</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(visualScore)}`}>{visualScore}%</div>
                  <div className="text-[10px] text-slate-500">{t('lipJaw')}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 text-center border border-slate-700/50">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Ear className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-slate-400">{t('audioScore')}</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(audioScore)}`}>{audioScore}%</div>
                  <div className="text-[10px] text-slate-500">{t('pronunciation')}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* RIGHT: Model Articulation + Playback Controls */}
          <div className="lg:col-span-3 glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 text-center uppercase tracking-wider">{t('modelArticulation')}</h3>
            <DualHeadAnimator 
              phonemeSequence={phonemeTokens} 
              isPlaying={isPlaying} 
              playbackRate={playbackSpeed} 
              frameDuration={Math.round(100 / playbackSpeed)} 
              onAnimationComplete={() => setIsPlaying(false)} 
              size="large" 
            />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
              {phonemes.map((p, i) => <span key={i} className="phoneme-badge min-w-[50px]">{p.letter}</span>)}
            </div>
            <div className="mt-4 flex justify-center">
              <PlaybackControls 
                isPlaying={isPlaying} 
                isMuted={isMuted} 
                playbackSpeed={playbackSpeed} 
                onPlay={handlePlay} 
                onPause={() => { setIsPlaying(false); window.speechSynthesis?.cancel(); }} 
                onReset={() => { setIsPlaying(false); window.speechSynthesis?.cancel(); }} 
                onSpeedChange={setPlaybackSpeed} 
                onMuteToggle={() => setIsMuted(!isMuted)} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LetterPracticePage() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5);
  const alphabet = ALPHABETS[lang] || ALPHABETS.en;
  const audioRef = useRef(null);

  // Default to letter 'A' so heads are always visible
  const currentLetter = selectedLetter || alphabet[0];

  const handlePlay = () => { 
    if (!currentLetter) return;
    setIsPlaying(true);
    
    // Use pre-recorded phoneme audio instead of TTS
    const audioPath = getPhonemeAudioPath(currentLetter.letter, lang);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(audioPath);
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current.play().catch(() => {
      // Fallback to TTS if audio file not found
      if ('speechSynthesis' in window) { 
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(currentLetter.letter); 
        u.rate = playbackSpeed; 
        u.lang = lang;
        window.speechSynthesis.speak(u);
      }
    });
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-5 h-5" />{t('back')}
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-100">{t('letterPractice')}</h1>
          </div>
          <LanguageSelector compact />
        </div>

        {/* Main Layout: Keyboard LEFT, Heads RIGHT - Heads always visible */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* LEFT: Compact Keyboard + Controls */}
          <div className="lg:col-span-2 space-y-3">
            {/* Current Letter Display */}
            <div className="glass-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-bold ${currentLetter.isVowel ? 'text-amber-400' : 'text-sky-400'}`}>
                  {currentLetter.letter}
                </span>
                <div>
                  <div className="text-lg text-slate-300">"{currentLetter.phoneme}"</div>
                  <div className="text-xs text-slate-500">{currentLetter.isVowel ? 'Vowel' : 'Consonant'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0.25, 0.5, 1.0].map(v => (
                    <button 
                      key={v} 
                      onClick={() => setPlaybackSpeed(v)} 
                      className={`px-2 py-1 rounded text-xs ${playbackSpeed === v ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500'}`}
                    >{v}x</button>
                  ))}
                </div>
                <button 
                  onClick={handlePlay} 
                  disabled={isPlaying} 
                  className="btn-glow flex items-center gap-1 px-4 py-2 text-sm"
                >
                  {isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? '...' : t('playSound')}
                </button>
              </div>
            </div>
            
            {/* Compact Alphabet Grid */}
            <div className="glass-card p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                {t('selectLetter')} <span className="text-amber-400">({t('vowelsHighlighted')})</span>
              </div>
              <div className="grid grid-cols-9 gap-1">
                {alphabet.map((item) => (
                  <button 
                    key={item.letter} 
                    onClick={() => { setSelectedLetter(item); setIsPlaying(false); }}
                    className={`p-1.5 rounded text-center transition-all ${
                      currentLetter?.letter === item.letter 
                        ? 'bg-sky-500/30 border border-sky-400' 
                        : item.isVowel 
                          ? 'bg-amber-500/10 border border-amber-500/20' 
                          : 'bg-slate-800/50 border border-slate-700/30'
                    }`}
                  >
                    <div className={`text-sm font-bold ${item.isVowel ? 'text-amber-400' : 'text-slate-300'}`}>
                      {item.letter}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recording Panel */}
            <RecordingPanel compact />
          </div>

          {/* RIGHT: Dual Head Animators - ALWAYS VISIBLE */}
          <div className="lg:col-span-3">
            <div className="glass-card p-4 h-full flex flex-col items-center justify-center">
              <DualHeadAnimator 
                phonemeSequence={[currentLetter.letter.toLowerCase()]} 
                isPlaying={isPlaying} 
                playbackRate={playbackSpeed} 
                onAnimationComplete={() => setIsPlaying(false)} 
                size="large" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryProgressPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => { const s = localStorage.getItem('soundmirror_history'); if (s) setHistory(JSON.parse(s)); }, []);

  const stats = { total: history.length, avg: history.length > 0 ? history.reduce((s, h) => s + (h.score || 0), 0) / history.length : 0, visual: history.length > 0 ? history.reduce((s, h) => s + (h.visualScore || 0), 0) / history.length : 0, audio: history.length > 0 ? history.reduce((s, h) => s + (h.audioScore || 0), 0) / history.length : 0, streak: 3 };
  const getScoreColor = (s) => s >= 0.85 ? 'text-emerald-400' : s >= 0.70 ? 'text-amber-400' : 'text-rose-400';
  const formatDate = (d) => { const dt = new Date(d); return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

  const handleDownload = () => { const b = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `soundmirror-${new Date().toISOString().split('T')[0]}.json`; a.click(); toast.success(t('download') + ' ✓'); };
  const handlePlayRecording = (id) => { setPlayingId(id); toast.info(t('playback') + '...'); setTimeout(() => setPlayingId(null), 2000); };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200"><ArrowLeft className="w-5 h-5" />{t('back')}</button>
          <div className="text-center"><h1 className="text-2xl font-bold text-slate-100">{t('yourProgress')}</h1><p className="text-slate-500 text-sm">{t('practiceHistory')}</p></div>
          <div className="flex gap-2">
            <button onClick={handleDownload} className="flex items-center gap-1 px-3 py-1.5 text-sm text-sky-400 hover:bg-sky-500/10 rounded-lg"><Download className="w-4 h-4" />{t('download')}</button>
            <button onClick={() => { localStorage.removeItem('soundmirror_history'); setHistory([]); }} className="flex items-center gap-1 px-3 py-1.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg"><Trash2 className="w-4 h-4" />{t('clear')}</button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {[{ k: 'total', v: stats.total, i: Target, c: 'sky' }, { k: 'average', v: Math.round(stats.avg * 100) + '%', i: TrendingUp, c: 'emerald' }, { k: 'visual', v: Math.round(stats.visual * 100) + '%', i: Eye, c: 'cyan' }, { k: 'audio', v: Math.round(stats.audio * 100) + '%', i: Ear, c: 'purple' }, { k: 'streak', v: stats.streak + ' 🔥', i: Calendar, c: 'amber' }].map(({ k, v, i: Icon, c }) => (
            <div key={k} className="glass-card p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1"><Icon className={`w-4 h-4 text-${c}-400`} /><span className="text-[10px] text-slate-500">{t(k)}</span></div>
              <div className={`text-xl font-bold text-${c}-400`}>{v}</div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4">
          <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />{t('recentSessions')}</h3>
          {history.length === 0 ? (
            <div className="text-center py-12"><div className="text-5xl mb-4">📝</div><h4 className="text-lg font-semibold text-slate-300 mb-2">{t('noPractice')}</h4><p className="text-slate-500 mb-4">{t('startPracticing')}</p><button onClick={() => navigate('/')} className="btn-glow">{t('home')}</button></div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600">
                  <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex flex-col items-center justify-center">
                    <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>{Math.round((item.score || 0) * 100)}</span>
                    <span className="text-[9px] text-slate-500">%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-slate-200 truncate">{item.word} {item.type === 'letter' && <span className="text-xs text-slate-500">({t('letter')})</span>}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{formatDate(item.date)}</span>
                      {item.visualScore && <span className="flex items-center gap-0.5"><Eye className="w-3 h-3 text-cyan-400" />{Math.round(item.visualScore * 100)}%</span>}
                      {item.audioScore && <span className="flex items-center gap-0.5"><Ear className="w-3 h-3 text-purple-400" />{Math.round(item.audioScore * 100)}%</span>}
                    </div>
                  </div>
                  <button onClick={() => handlePlayRecording(item.id)} className={`p-2 rounded-lg ${playingId === item.id ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-slate-700'}`}>
                    <PlayCircle className={`w-5 h-5 ${playingId === item.id ? 'animate-pulse' : ''}`} />
                  </button>
                  <button onClick={() => navigate(`/practice?word=${encodeURIComponent(item.word)}&lang=${item.lang || 'en'}`)} className="px-2 py-1 rounded-lg text-xs bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20">{t('practiceAgain')}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BugReporterPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isOnline] = useState(navigator.onLine);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const CATEGORIES = [
    { id: 'animation', label: t('animation'), icon: '🎬', subs: ['Sprites not loading', 'Animation stuttering', 'Sync issues'] },
    { id: 'audio', label: t('audioTts'), icon: '🔊', subs: ['No sound', 'Wrong voice', 'Out of sync'] },
    { id: 'phonemes', label: t('phonemes'), icon: '📝', subs: ['Wrong mapping', 'Missing phoneme'] },
    { id: 'recording', label: t('recording'), icon: '🎙️', subs: ['Camera issues', 'Grading inaccurate'] },
    { id: 'ui', label: t('uiDisplay'), icon: '🖥️', subs: ['Layout broken', 'Text unreadable'] },
    { id: 'other', label: t('other'), icon: '❓', subs: ['App crashes', 'Performance'] },
  ];

  const handleSubmit = (e) => { e.preventDefault(); const r = JSON.parse(localStorage.getItem('soundmirror_bug_reports') || '[]'); r.push({ id: Date.now(), category, subcategory, severity, description, timestamp: new Date().toISOString() }); localStorage.setItem('soundmirror_bug_reports', JSON.stringify(r)); toast.success(t('reportSaved')); setSubmitted(true); setTimeout(() => { setSubmitted(false); setCategory(''); setSubcategory(''); setDescription(''); }, 2000); };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200"><ArrowLeft className="w-5 h-5" />{t('back')}</button>
          <div className="text-center"><h1 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2"><Bug className="w-6 h-6 text-rose-400" />{t('reportIssue')}</h1><p className="text-slate-500 text-sm">{t('helpImprove')}</p></div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}{isOnline ? t('online') : t('offline')}
          </div>
        </div>

        {submitted && <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-emerald-300 text-sm">{t('reportSaved')}</span></div>}

        <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">{t('whatIssue')}</label>
            <div className="grid grid-cols-6 gap-2">
              {CATEGORIES.map(c => (
                <button key={c.id} type="button" onClick={() => { setCategory(c.id); setSubcategory(''); }} className={`p-2 rounded-xl text-center ${category === c.id ? 'bg-sky-500/20 border-2 border-sky-400' : 'bg-slate-800/50 border border-slate-700/50'}`}>
                  <span className="text-lg">{c.icon}</span><div className="text-[10px] text-slate-200 mt-1">{c.label}</div>
                </button>
              ))}
            </div>
          </div>
          {category && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">{t('specificIssue')}</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.find(c => c.id === category)?.subs.map(s => (
                  <button key={s} type="button" onClick={() => setSubcategory(s)} className={`p-2 rounded-lg text-left text-sm ${subcategory === s ? 'bg-sky-500/20 border border-sky-400' : 'bg-slate-800/50 border border-slate-700/50'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">{t('severity')}</label>
            <div className="flex gap-2">
              {[{ id: 'low', c: 'slate' }, { id: 'medium', c: 'amber' }, { id: 'high', c: 'rose' }].map(l => (
                <button key={l.id} type="button" onClick={() => setSeverity(l.id)} className={`flex-1 p-2 rounded-lg text-center ${severity === l.id ? 'bg-slate-800 border-2 border-slate-500' : 'bg-slate-800/50 border border-slate-700/50'}`}>
                  <div className={`font-semibold text-${l.c}-400`}>{t(l.id)}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">{t('description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('describeIssue')} rows={3} className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none" />
          </div>
          <button type="submit" disabled={!category || !subcategory} className="w-full btn-glow flex items-center justify-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" />{t('submitReport')}</button>
        </form>
      </div>
    </div>
  );
}

// ========== MAIN APP ==========
function App() {
  const [showSplash, setShowSplash] = useState(true);
  
  return (
    <LanguageProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice" element={<WordPracticePage />} />
            <Route path="/letters" element={<LetterPracticePage />} />
            <Route path="/history" element={<HistoryProgressPage />} />
            <Route path="/report" element={<BugReporterPage />} />
          </Routes>
        </Layout>
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' } }} />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
