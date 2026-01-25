import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, Play, GraduationCap, Search } from "lucide-react";
import { base44 } from '@/api/base44Client';
import UnifiedRecorder from '../components/practice/UnifiedRecorder';
import VisemeAnimator from '../components/practice/VisemeAnimator';
import DualHeadAnimator from '../components/practice/DualHeadAnimator';
import { getVisemeUrl, hasVisemeFrames, getPhonemeFrames } from '../components/practice/visemeUrls';
import { warmup as warmupTTS, speak as speakText } from '../components/practice/base44Speech';
import { useTranslations } from '../components/practice/translations';
import { auditVisemes } from '../components/practice/visemeAudit';

// Alphabet data for each supported language
export const ALPHABET_BY_LANG = {
  en: [
    { letter: 'A', phonetic: 'ah', token: 'ah', type: 'vowel',     example: 'Apple' },
    { letter: 'B', phonetic: 'ba', token: 'ba', type: 'consonant', example: 'Ball' },
    { letter: 'C', phonetic: 'ca', token: 'ca', type: 'consonant', example: 'Cat' },
    { letter: 'D', phonetic: 'da', token: 'da', type: 'consonant', example: 'Dog' },
    { letter: 'E', phonetic: 'eh', token: 'eh', type: 'vowel',     example: 'Egg' },
    { letter: 'F', phonetic: 'fa', token: 'fa', type: 'consonant', example: 'Fish' },
    { letter: 'G', phonetic: 'ga', token: 'ga', type: 'consonant', example: 'Go' },
    { letter: 'H', phonetic: 'ha', token: 'ha', type: 'consonant', example: 'Hat' },
    { letter: 'I', phonetic: 'ih', token: 'ih', type: 'vowel',     example: 'Igloo' },
    { letter: 'J', phonetic: 'ja', token: 'ja', type: 'consonant', example: 'Jump' },
    { letter: 'K', phonetic: 'ka', token: 'ka', type: 'consonant', example: 'Kite' },
    { letter: 'L', phonetic: 'la', token: 'la', type: 'consonant', example: 'Lion' },
    { letter: 'M', phonetic: 'ma', token: 'ma', type: 'consonant', example: 'Moon' },
    { letter: 'N', phonetic: 'na', token: 'na', type: 'consonant', example: 'Nose' },
    { letter: 'O', phonetic: 'oh', token: 'oh', type: 'vowel',     example: 'Orange' },
    { letter: 'P', phonetic: 'pa', token: 'pa', type: 'consonant', example: 'Pig' },
    { letter: 'Q', phonetic: 'kwa', token: 'kwa', type: 'consonant', example: 'Queen' },
    { letter: 'R', phonetic: 'ra', token: 'ra', type: 'consonant', example: 'Run' },
    { letter: 'S', phonetic: 'sa', token: 'sa', type: 'consonant', example: 'Sun' },
    { letter: 'T', phonetic: 'ta', token: 'ta', type: 'consonant', example: 'Tree' },
    { letter: 'U', phonetic: 'uh', token: 'uh', type: 'vowel',     example: 'Umbrella' },
    { letter: 'V', phonetic: 'va', token: 'va', type: 'consonant', example: 'Van' },
    { letter: 'W', phonetic: 'wa', token: 'wa', type: 'consonant', example: 'Water' },
    { letter: 'X', phonetic: 'za', token: 'za', type: 'consonant', example: 'Box' },
    { letter: 'Y', phonetic: 'ya', token: 'ya', type: 'consonant', example: 'Yellow' },
    { letter: 'Z', phonetic: 'za', token: 'za', type: 'consonant', example: 'Zebra' },
  ],
  es: [
    { letter: 'A',  phonetic: 'ah', token: 'ah', type: 'vowel',     example: 'Agua' },
    { letter: 'B',  phonetic: 'ba', token: 'ba', type: 'consonant', example: 'Bueno' },
    { letter: 'C',  phonetic: 'ca', token: 'ca', type: 'consonant', example: 'Casa' },
    { letter: 'D',  phonetic: 'da', token: 'da', type: 'consonant', example: 'Día' },
    { letter: 'E',  phonetic: 'eh', token: 'eh', type: 'vowel',     example: 'Estrella' },
    { letter: 'F',  phonetic: 'fa', token: 'fa', type: 'consonant', example: 'Flor' },
    { letter: 'G',  phonetic: 'ga', token: 'ga', type: 'consonant', example: 'Gato' },
    { letter: 'H',  phonetic: '', token: '', type: 'consonant', example: 'Hola' },    // silent
    { letter: 'I',  phonetic: 'ih', token: 'ih', type: 'vowel',     example: 'Iglesia' },
    { letter: 'J',  phonetic: 'ja', token: 'ja', type: 'consonant', example: 'Jugar' },
    { letter: 'K',  phonetic: 'ka', token: 'ka', type: 'consonant', example: 'Kilo' },
    { letter: 'L',  phonetic: 'la', token: 'la', type: 'consonant', example: 'Luna' },
    { letter: 'M',  phonetic: 'ma', token: 'ma', type: 'consonant', example: 'Mesa' },
    { letter: 'N',  phonetic: 'na', token: 'na', type: 'consonant', example: 'Noche' },
    { letter: 'Ñ',  phonetic: 'ña', token: 'ña', type: 'consonant', example: 'Niño' },
    { letter: 'LL', phonetic: 'ia', token: 'll', type: 'consonant', example: 'Llave' },
    { letter: 'O',  phonetic: 'o', token: 'oh', type: 'vowel',     example: 'Oso' },
    { letter: 'P',  phonetic: 'pa', token: 'pa', type: 'consonant', example: 'Perro' },
    { letter: 'Q',  phonetic: 'ka', token: 'ka', type: 'consonant', example: 'Queso' },
    { letter: 'R',  phonetic: 'ra', token: 'ra', type: 'consonant', example: 'Rosa' },
    { letter: 'S',  phonetic: 'sa', token: 'sa', type: 'consonant', example: 'Sol' },
    { letter: 'T',  phonetic: 'ta', token: 'ta', type: 'consonant', example: 'Taza' },
    { letter: 'U',  phonetic: 'u', token: 'uh', type: 'vowel',     example: 'Uva' },
    { letter: 'V',  phonetic: 'va', token: 'va', type: 'consonant', example: 'Verde' },
    { letter: 'W',  phonetic: 'wa', token: 'wa', type: 'consonant', example: 'Poco Común' },
    { letter: 'X',  phonetic: 'za', token: 'za', type: 'consonant', example: 'Xilófono' },
    { letter: 'Y',  phonetic: 'ya', token: 'ya', type: 'consonant', example: 'Yo' },
    { letter: 'Z',  phonetic: 'za', token: 'za', type: 'consonant', example: 'Zapato' },
  ],
  fr: [
    { letter: 'A', phonetic: 'ah', token: 'ah', type: 'vowel', example: 'Amour' },
    { letter: 'B', phonetic: 'beh', token: 'ba', type: 'consonant', example: 'Bonjour' },
    { letter: 'C', phonetic: 'cuh', token: 'ca', type: 'consonant', example: 'Cafe' },
    { letter: 'D', phonetic: 'deh', token: 'da', type: 'consonant', example: 'Demain' },
    { letter: 'E', phonetic: 'uh', token: 'eh', type: 'vowel', example: 'Eau' },
    { letter: 'F', phonetic: 'eff', token: 'fa', type: 'consonant', example: 'Fleur' },
    { letter: 'G', phonetic: 'zheh', token: 'ga', type: 'consonant', example: 'Grand' },
    { letter: 'H', phonetic: 'ash', token: 'ha', type: 'consonant', example: 'Homme' },
    { letter: 'I', phonetic: 'ee', token: 'ih', type: 'vowel', example: 'Île' },
    { letter: 'J', phonetic: 'zhee', token: 'ja', type: 'consonant', example: 'Jour' },
    { letter: 'K', phonetic: 'kah', token: 'ka', type: 'consonant', example: 'Kilo' },
    { letter: 'L', phonetic: 'luh', token: 'la', type: 'consonant', example: 'Lune' },
    { letter: 'M', phonetic: 'em', token: 'ma', type: 'consonant', example: 'Maison' },
    { letter: 'N', phonetic: 'en', token: 'na', type: 'consonant', example: 'Nuit' },
    { letter: 'O', phonetic: 'oh', token: 'oh', type: 'vowel', example: 'Orange' },
    { letter: 'P', phonetic: 'pah', token: 'pa', type: 'consonant', example: 'Paris' },
    { letter: 'Q', phonetic: 'kew', token: 'kwa', type: 'consonant', example: 'Quatre' },
    { letter: 'R', phonetic: 'rr', token: 'ra', type: 'consonant', example: 'Rouge' },
    { letter: 'S', phonetic: 'ss', token: 'sa', type: 'consonant', example: 'Soleil' },
    { letter: 'T', phonetic: 'tah', token: 'ta', type: 'consonant', example: 'Table' },
    { letter: 'U', phonetic: 'ew', token: 'uh', type: 'vowel', example: 'Une' },
    { letter: 'V', phonetic: 'veh', token: 'va', type: 'consonant', example: 'Vert' },
    { letter: 'W', phonetic: 'wu', token: 'wa', type: 'consonant', example: 'Whisky' },
    { letter: 'X', phonetic: 'eks', token: 'za', type: 'consonant', example: 'Exemple' },
    { letter: 'Y', phonetic: 'ee', token: 'ya', type: 'consonant', example: 'Yeux' },
    { letter: 'Z', phonetic: 'ze', token: 'za', type: 'consonant', example: 'Zéro' },
  ],
  de: [
    { letter: 'A', phonetic: 'ah', token: 'ah', type: 'vowel', example: 'Apfel' },
    { letter: 'B', phonetic: 'beh', token: 'ba', type: 'consonant', example: 'Buch' },
    { letter: 'C', phonetic: 'tseh', token: 'ca', type: 'consonant', example: 'Computer' },
    { letter: 'D', phonetic: 'deh', token: 'da', type: 'consonant', example: 'Danke' },
    { letter: 'E', phonetic: 'eh', token: 'eh', type: 'vowel', example: 'Essen' },
    { letter: 'F', phonetic: 'eff', token: 'fa', type: 'consonant', example: 'Freund' },
    { letter: 'G', phonetic: 'geh', token: 'ga', type: 'consonant', example: 'Gut' },
    { letter: 'H', phonetic: 'hah', token: 'ha', type: 'consonant', example: 'Haus' },
    { letter: 'I', phonetic: 'ee', token: 'ih', type: 'vowel', example: 'Ich' },
    { letter: 'J', phonetic: 'yot', token: 'ja', type: 'consonant', example: 'Ja' },
    { letter: 'K', phonetic: 'kah', token: 'ka', type: 'consonant', example: 'Kaffee' },
    { letter: 'L', phonetic: 'ell', token: 'la', type: 'consonant', example: 'Liebe' },
    { letter: 'M', phonetic: 'em', token: 'ma', type: 'consonant', example: 'Morgen' },
    { letter: 'N', phonetic: 'en', token: 'na', type: 'consonant', example: 'Nacht' },
    { letter: 'O', phonetic: 'oh', token: 'oh', type: 'vowel', example: 'Opa' },
    { letter: 'P', phonetic: 'peh', token: 'pa', type: 'consonant', example: 'Papa' },
    { letter: 'Q', phonetic: 'koo', token: 'kwa', type: 'consonant', example: 'Quelle' },
    { letter: 'R', phonetic: 'err', token: 'ra', type: 'consonant', example: 'Rot' },
    { letter: 'S', phonetic: 'ess', token: 'sa', type: 'consonant', example: 'Sonne' },
    { letter: 'T', phonetic: 'teh', token: 'ta', type: 'consonant', example: 'Tag' },
    { letter: 'U', phonetic: 'oo', token: 'uh', type: 'vowel', example: 'Uhr' },
    { letter: 'V', phonetic: 'fow', token: 'va', type: 'consonant', example: 'Vater' },
    { letter: 'W', phonetic: 'veh', token: 'wa', type: 'consonant', example: 'Wasser' },
    { letter: 'X', phonetic: 'iks', token: 'za', type: 'consonant', example: 'Xylophon' },
    { letter: 'Y', phonetic: 'ypsilon', token: 'ya', type: 'consonant', example: 'Yacht' },
    { letter: 'Z', phonetic: 'tset', token: 'za', type: 'consonant', example: 'Zeit' },
    { letter: 'Ä', phonetic: 'eh', token: 'eh', type: 'vowel', example: 'Äpfel' },
    { letter: 'Ö', phonetic: 'er', token: 'oh', type: 'vowel', example: 'Öl' },
    { letter: 'Ü', phonetic: 'ew', token: 'uh', type: 'vowel', example: 'Über' },
    { letter: 'ß', phonetic: 'ess-tset', token: 'sa', type: 'consonant', example: 'Straße' },
  ],
  it: [
    { letter: 'A', phonetic: 'ah', token: 'ah', type: 'vowel', example: 'Amore' },
    { letter: 'B', phonetic: 'bee', token: 'ba', type: 'consonant', example: 'Bello' },
    { letter: 'C', phonetic: 'chee', token: 'ca', type: 'consonant', example: 'Ciao' },
    { letter: 'D', phonetic: 'dee', token: 'da', type: 'consonant', example: 'Dolce' },
    { letter: 'E', phonetic: 'eh', token: 'eh', type: 'vowel', example: 'Estate' },
    { letter: 'F', phonetic: 'effe', token: 'fa', type: 'consonant', example: 'Fiore' },
    { letter: 'G', phonetic: 'gee', token: 'ga', type: 'consonant', example: 'Grande' },
    { letter: 'H', phonetic: 'acca', token: 'ha', type: 'consonant', example: 'Hotel' },
    { letter: 'I', phonetic: 'ee', token: 'ih', type: 'vowel', example: 'Italia' },
    { letter: 'L', phonetic: 'elle', token: 'la', type: 'consonant', example: 'Luna' },
    { letter: 'M', phonetic: 'emme', token: 'ma', type: 'consonant', example: 'Mare' },
    { letter: 'N', phonetic: 'enne', token: 'na', type: 'consonant', example: 'Notte' },
    { letter: 'O', phonetic: 'oh', token: 'oh', type: 'vowel', example: 'Oro' },
    { letter: 'P', phonetic: 'pee', token: 'pa', type: 'consonant', example: 'Pizza' },
    { letter: 'Q', phonetic: 'koo', token: 'kwa', type: 'consonant', example: 'Quattro' },
    { letter: 'R', phonetic: 'erre', token: 'ra', type: 'consonant', example: 'Roma' },
    { letter: 'S', phonetic: 'esse', token: 'sa', type: 'consonant', example: 'Sole' },
    { letter: 'T', phonetic: 'tee', token: 'ta', type: 'consonant', example: 'Terra' },
    { letter: 'U', phonetic: 'oo', token: 'uh', type: 'vowel', example: 'Uno' },
    { letter: 'V', phonetic: 'vee', token: 'va', type: 'consonant', example: 'Vita' },
    { letter: 'Z', phonetic: 'dzeta', token: 'za', type: 'consonant', example: 'Zero' },
  ],
  pt: [
    { letter: 'A', phonetic: 'ah', token: 'ah', type: 'vowel', example: 'Amor' },
    { letter: 'B', phonetic: 'beh', token: 'ba', type: 'consonant', example: 'Bom' },
    { letter: 'C', phonetic: 'seh', token: 'ca', type: 'consonant', example: 'Casa' },
    { letter: 'D', phonetic: 'deh', token: 'da', type: 'consonant', example: 'Dia' },
    { letter: 'E', phonetic: 'eh', token: 'eh', type: 'vowel', example: 'Escola' },
    { letter: 'F', phonetic: 'effe', token: 'fa', type: 'consonant', example: 'Flor' },
    { letter: 'G', phonetic: 'zheh', token: 'ga', type: 'consonant', example: 'Gato' },
    { letter: 'H', phonetic: 'agah', token: 'ha', type: 'consonant', example: 'Hora' },
    { letter: 'I', phonetic: 'ee', token: 'ih', type: 'vowel', example: 'Ilha' },
    { letter: 'J', phonetic: 'zhota', token: 'ja', type: 'consonant', example: 'Janela' },
    { letter: 'K', phonetic: 'kah', token: 'ka', type: 'consonant', example: 'Kilo' },
    { letter: 'L', phonetic: 'elle', token: 'la', type: 'consonant', example: 'Lua' },
    { letter: 'M', phonetic: 'emme', token: 'ma', type: 'consonant', example: 'Mar' },
    { letter: 'N', phonetic: 'enne', token: 'na', type: 'consonant', example: 'Noite' },
    { letter: 'O', phonetic: 'oh', token: 'oh', type: 'vowel', example: 'Olho' },
    { letter: 'P', phonetic: 'peh', token: 'pa', type: 'consonant', example: 'Pão' },
    { letter: 'Q', phonetic: 'keh', token: 'kwa', type: 'consonant', example: 'Queijo' },
    { letter: 'R', phonetic: 'erre', token: 'ra', type: 'consonant', example: 'Rio' },
    { letter: 'S', phonetic: 'esse', token: 'sa', type: 'consonant', example: 'Sol' },
    { letter: 'T', phonetic: 'teh', token: 'ta', type: 'consonant', example: 'Terra' },
    { letter: 'U', phonetic: 'oo', token: 'uh', type: 'vowel', example: 'Uva' },
    { letter: 'V', phonetic: 'veh', token: 'va', type: 'consonant', example: 'Verde' },
    { letter: 'W', phonetic: 'dahblio', token: 'wa', type: 'consonant', example: 'Web' },
    { letter: 'X', phonetic: 'shees', token: 'za', type: 'consonant', example: 'Xícara' },
    { letter: 'Y', phonetic: 'ipsilon', token: 'ya', type: 'consonant', example: 'Yoga' },
    { letter: 'Z', phonetic: 'zeh', token: 'za', type: 'consonant', example: 'Zero' },
  ],
  zh: [
    { letter: '啊', phonetic: 'ā', token: 'ah', type: 'vowel', example: '阿姨' },
    { letter: '波', phonetic: 'bō', token: 'ba', type: 'consonant', example: '爸爸' },
    { letter: '次', phonetic: 'cì', token: 'ca', type: 'consonant', example: '吃饭' },
    { letter: '得', phonetic: 'dé', token: 'da', type: 'consonant', example: '大家' },
    { letter: '鹅', phonetic: 'é', token: 'eh', type: 'vowel', example: '饿了' },
    { letter: '佛', phonetic: 'fó', token: 'fa', type: 'consonant', example: '飞机' },
    { letter: '哥', phonetic: 'gē', token: 'ga', type: 'consonant', example: '工作' },
    { letter: '喝', phonetic: 'hē', token: 'ha', type: 'consonant', example: '好的' },
    { letter: '衣', phonetic: 'yī', token: 'ih', type: 'vowel', example: '一个' },
    { letter: '鸡', phonetic: 'jī', token: 'ja', type: 'consonant', example: '家人' },
    { letter: '科', phonetic: 'kē', token: 'ka', type: 'consonant', example: '开心' },
    { letter: '勒', phonetic: 'lè', token: 'la', type: 'consonant', example: '老师' },
    { letter: '摸', phonetic: 'mō', token: 'ma', type: 'consonant', example: '妈妈' },
    { letter: '讷', phonetic: 'nè', token: 'na', type: 'consonant', example: '你好' },
    { letter: '哦', phonetic: 'ó', token: 'oh', type: 'vowel', example: '欧洲' },
    { letter: '坡', phonetic: 'pō', token: 'pa', type: 'consonant', example: '朋友' },
    { letter: '七', phonetic: 'qī', token: 'kwa', type: 'consonant', example: '请问' },
    { letter: '日', phonetic: 'rì', token: 'ra', type: 'consonant', example: '人民' },
    { letter: '思', phonetic: 'sī', token: 'sa', type: 'consonant', example: '三个' },
    { letter: '特', phonetic: 'tè', token: 'ta', type: 'consonant', example: '天气' },
    { letter: '乌', phonetic: 'wū', token: 'uh', type: 'vowel', example: '我们' },
    { letter: '西', phonetic: 'xī', token: 'za', type: 'consonant', example: '谢谢' },
    { letter: '鱼', phonetic: 'yú', token: 'ya', type: 'vowel', example: '月亮' },
    { letter: '资', phonetic: 'zī', token: 'za', type: 'consonant', example: '中国' },
  ],
  ja: [
    { letter: 'あ', phonetic: 'a', token: 'ah', type: 'vowel', example: 'あさ (朝)' },
    { letter: 'い', phonetic: 'i', token: 'ih', type: 'vowel', example: 'いぬ (犬)' },
    { letter: 'う', phonetic: 'u', token: 'uh', type: 'vowel', example: 'うみ (海)' },
    { letter: 'え', phonetic: 'e', token: 'eh', type: 'vowel', example: 'えき (駅)' },
    { letter: 'お', phonetic: 'o', token: 'oh', type: 'vowel', example: 'おか (丘)' },
    { letter: 'か', phonetic: 'ka', token: 'ka', type: 'consonant', example: 'かさ (傘)' },
    { letter: 'き', phonetic: 'ki', token: 'ka', type: 'consonant', example: 'きく (菊)' },
    { letter: 'く', phonetic: 'ku', token: 'ka', type: 'consonant', example: 'くも (雲)' },
    { letter: 'け', phonetic: 'ke', token: 'ka', type: 'consonant', example: 'けむり (煙)' },
    { letter: 'こ', phonetic: 'ko', token: 'ka', type: 'consonant', example: 'こえ (声)' },
    { letter: 'さ', phonetic: 'sa', token: 'sa', type: 'consonant', example: 'さくら (桜)' },
    { letter: 'し', phonetic: 'shi', token: 'sa', type: 'consonant', example: 'しお (塩)' },
    { letter: 'す', phonetic: 'su', token: 'sa', type: 'consonant', example: 'すし (寿司)' },
    { letter: 'せ', phonetic: 'se', token: 'sa', type: 'consonant', example: 'せかい (世界)' },
    { letter: 'そ', phonetic: 'so', token: 'sa', type: 'consonant', example: 'そら (空)' },
    { letter: 'た', phonetic: 'ta', token: 'ta', type: 'consonant', example: 'たべる (食べる)' },
    { letter: 'ち', phonetic: 'chi', token: 'ta', type: 'consonant', example: 'ちず (地図)' },
    { letter: 'つ', phonetic: 'tsu', token: 'ta', type: 'consonant', example: 'つき (月)' },
    { letter: 'て', phonetic: 'te', token: 'ta', type: 'consonant', example: 'てがみ (手紙)' },
    { letter: 'と', phonetic: 'to', token: 'ta', type: 'consonant', example: 'とり (鳥)' },
    { letter: 'な', phonetic: 'na', token: 'na', type: 'consonant', example: 'なつ (夏)' },
    { letter: 'に', phonetic: 'ni', token: 'na', type: 'consonant', example: 'にほん (日本)' },
    { letter: 'ぬ', phonetic: 'nu', token: 'na', type: 'consonant', example: 'ぬの (布)' },
    { letter: 'ね', phonetic: 'ne', token: 'na', type: 'consonant', example: 'ねこ (猫)' },
    { letter: 'の', phonetic: 'no', token: 'na', type: 'consonant', example: 'のり (海苔)' },
    { letter: 'は', phonetic: 'ha', token: 'ha', type: 'consonant', example: 'はな (花)' },
    { letter: 'ひ', phonetic: 'hi', token: 'ha', type: 'consonant', example: 'ひと (人)' },
    { letter: 'ふ', phonetic: 'fu', token: 'ha', type: 'consonant', example: 'ふゆ (冬)' },
    { letter: 'へ', phonetic: 'he', token: 'ha', type: 'consonant', example: 'へや (部屋)' },
    { letter: 'ほ', phonetic: 'ho', token: 'ha', type: 'consonant', example: 'ほし (星)' },
    { letter: 'ま', phonetic: 'ma', token: 'ma', type: 'consonant', example: 'まち (町)' },
    { letter: 'み', phonetic: 'mi', token: 'ma', type: 'consonant', example: 'みず (水)' },
    { letter: 'む', phonetic: 'mu', token: 'ma', type: 'consonant', example: 'むし (虫)' },
    { letter: 'め', phonetic: 'me', token: 'ma', type: 'consonant', example: 'め (目)' },
    { letter: 'も', phonetic: 'mo', token: 'ma', type: 'consonant', example: 'もり (森)' },
    { letter: 'や', phonetic: 'ya', token: 'ya', type: 'consonant', example: 'やま (山)' },
    { letter: 'ゆ', phonetic: 'yu', token: 'ya', type: 'consonant', example: 'ゆき (雪)' },
    { letter: 'よ', phonetic: 'yo', token: 'ya', type: 'consonant', example: 'よる (夜)' },
    { letter: 'ら', phonetic: 'ra', token: 'ra', type: 'consonant', example: 'らいねん (来年)' },
    { letter: 'り', phonetic: 'ri', token: 'ra', type: 'consonant', example: 'りんご (林檎)' },
    { letter: 'る', phonetic: 'ru', token: 'ra', type: 'consonant', example: 'るす (留守)' },
    { letter: 'れ', phonetic: 're', token: 'ra', type: 'consonant', example: 'れきし (歴史)' },
    { letter: 'ろ', phonetic: 'ro', token: 'ra', type: 'consonant', example: 'ろうそく (蝋燭)' },
    { letter: 'わ', phonetic: 'wa', token: 'wa', type: 'consonant', example: 'わたし (私)' },
    { letter: 'を', phonetic: 'wo', token: 'wa', type: 'consonant', example: 'を (particle)' },
    { letter: 'ん', phonetic: 'n', token: 'na', type: 'consonant', example: 'にほん (日本)' },
  ],
  ar: [
    { letter: 'ا', phonetic: 'ah', token: 'ah', type: 'vowel', example: 'أسد' },
    { letter: 'ب', phonetic: 'ba', token: 'ba', type: 'consonant', example: 'بيت' },
    { letter: 'ت', phonetic: 'ta', token: 'ta', type: 'consonant', example: 'تفاح' },
    { letter: 'ث', phonetic: 'sa', token: 'sa', type: 'consonant', example: 'ثعلب' },
    { letter: 'ج', phonetic: 'ja', token: 'ja', type: 'consonant', example: 'جمل' },
    { letter: 'ح', phonetic: 'ha', token: 'ha', type: 'consonant', example: 'حصان' },
    { letter: 'خ', phonetic: 'ka', token: 'ka', type: 'consonant', example: 'خروف' },
    { letter: 'د', phonetic: 'da', token: 'da', type: 'consonant', example: 'دب' },
    { letter: 'ذ', phonetic: 'za', token: 'za', type: 'consonant', example: 'ذئب' },
    { letter: 'ر', phonetic: 'ra', token: 'ra', type: 'consonant', example: 'رمان' },
    { letter: 'ز', phonetic: 'za', token: 'za', type: 'consonant', example: 'زهرة' },
    { letter: 'س', phonetic: 'sa', token: 'sa', type: 'consonant', example: 'سمك' },
    { letter: 'ش', phonetic: 'sa', token: 'sa', type: 'consonant', example: 'شمس' },
    { letter: 'ص', phonetic: 'sa', token: 'sa', type: 'consonant', example: 'صقر' },
    { letter: 'ض', phonetic: 'da', token: 'da', type: 'consonant', example: 'ضفدع' },
    { letter: 'ط', phonetic: 'ta', token: 'ta', type: 'consonant', example: 'طائر' },
    { letter: 'ظ', phonetic: 'za', token: 'za', type: 'consonant', example: 'ظبي' },
    { letter: 'ع', phonetic: 'ah', token: 'ah', type: 'consonant', example: 'عنب' },
    { letter: 'غ', phonetic: 'ga', token: 'ga', type: 'consonant', example: 'غراب' },
    { letter: 'ف', phonetic: 'fa', token: 'fa', type: 'consonant', example: 'فيل' },
    { letter: 'ق', phonetic: 'ka', token: 'ka', type: 'consonant', example: 'قطة' },
    { letter: 'ك', phonetic: 'ka', token: 'ka', type: 'consonant', example: 'كلب' },
    { letter: 'ل', phonetic: 'la', token: 'la', type: 'consonant', example: 'ليمون' },
    { letter: 'م', phonetic: 'ma', token: 'ma', type: 'consonant', example: 'ماء' },
    { letter: 'ن', phonetic: 'na', token: 'na', type: 'consonant', example: 'نمر' },
    { letter: 'ه', phonetic: 'ha', token: 'ha', type: 'consonant', example: 'هدهد' },
    { letter: 'و', phonetic: 'wa', token: 'wa', type: 'vowel', example: 'ورد' },
    { letter: 'ي', phonetic: 'ya', token: 'ya', type: 'vowel', example: 'يد' },
  ],
  hi: [
    { letter: 'अ', phonetic: 'a', token: 'ah', type: 'vowel', example: 'अनार' },
    { letter: 'आ', phonetic: 'aa', token: 'ah', type: 'vowel', example: 'आम' },
    { letter: 'इ', phonetic: 'i', token: 'ih', type: 'vowel', example: 'इमली' },
    { letter: 'ई', phonetic: 'ii', token: 'ih', type: 'vowel', example: 'ईख' },
    { letter: 'उ', phonetic: 'u', token: 'uh', type: 'vowel', example: 'उल्लू' },
    { letter: 'ऊ', phonetic: 'uu', token: 'uh', type: 'vowel', example: 'ऊन' },
    { letter: 'ए', phonetic: 'e', token: 'eh', type: 'vowel', example: 'एक' },
    { letter: 'ऐ', phonetic: 'ai', token: 'eh', type: 'vowel', example: 'ऐनक' },
    { letter: 'ओ', phonetic: 'o', token: 'oh', type: 'vowel', example: 'ओखली' },
    { letter: 'औ', phonetic: 'au', token: 'oh', type: 'vowel', example: 'औरत' },
    { letter: 'क', phonetic: 'ka', token: 'ka', type: 'consonant', example: 'कमल' },
    { letter: 'ख', phonetic: 'kha', token: 'ka', type: 'consonant', example: 'खरगोश' },
    { letter: 'ग', phonetic: 'ga', token: 'ga', type: 'consonant', example: 'गाय' },
    { letter: 'घ', phonetic: 'gha', token: 'ga', type: 'consonant', example: 'घर' },
    { letter: 'च', phonetic: 'cha', token: 'ca', type: 'consonant', example: 'चाय' },
    { letter: 'छ', phonetic: 'chha', token: 'ca', type: 'consonant', example: 'छत' },
    { letter: 'ज', phonetic: 'ja', token: 'ja', type: 'consonant', example: 'जल' },
    { letter: 'झ', phonetic: 'jha', token: 'ja', type: 'consonant', example: 'झंडा' },
    { letter: 'ट', phonetic: 'ta', token: 'ta', type: 'consonant', example: 'टमाटर' },
    { letter: 'ठ', phonetic: 'tha', token: 'ta', type: 'consonant', example: 'ठंडा' },
    { letter: 'ड', phonetic: 'da', token: 'da', type: 'consonant', example: 'डाक' },
    { letter: 'ढ', phonetic: 'dha', token: 'da', type: 'consonant', example: 'ढोल' },
    { letter: 'ण', phonetic: 'na', token: 'na', type: 'consonant', example: 'गणेश' },
    { letter: 'त', phonetic: 'ta', token: 'ta', type: 'consonant', example: 'ताला' },
    { letter: 'थ', phonetic: 'tha', token: 'ta', type: 'consonant', example: 'थाली' },
    { letter: 'द', phonetic: 'da', token: 'da', type: 'consonant', example: 'दवा' },
    { letter: 'ध', phonetic: 'dha', token: 'da', type: 'consonant', example: 'धन' },
    { letter: 'न', phonetic: 'na', token: 'na', type: 'consonant', example: 'नल' },
    { letter: 'प', phonetic: 'pa', token: 'pa', type: 'consonant', example: 'पानी' },
    { letter: 'फ', phonetic: 'pha', token: 'fa', type: 'consonant', example: 'फल' },
    { letter: 'ब', phonetic: 'ba', token: 'ba', type: 'consonant', example: 'बकरी' },
    { letter: 'भ', phonetic: 'bha', token: 'ba', type: 'consonant', example: 'भालू' },
    { letter: 'म', phonetic: 'ma', token: 'ma', type: 'consonant', example: 'मछली' },
    { letter: 'य', phonetic: 'ya', token: 'ya', type: 'consonant', example: 'यज्ञ' },
    { letter: 'र', phonetic: 'ra', token: 'ra', type: 'consonant', example: 'रथ' },
    { letter: 'ल', phonetic: 'la', token: 'la', type: 'consonant', example: 'लड्डू' },
    { letter: 'व', phonetic: 'va', token: 'va', type: 'consonant', example: 'वन' },
    { letter: 'श', phonetic: 'sha', token: 'sa', type: 'consonant', example: 'शेर' },
    { letter: 'ष', phonetic: 'sha', token: 'sa', type: 'consonant', example: 'षट्कोण' },
    { letter: 'स', phonetic: 'sa', token: 'sa', type: 'consonant', example: 'सब' },
    { letter: 'ह', phonetic: 'ha', token: 'ha', type: 'consonant', example: 'हाथी' },
    { letter: 'क्ष', phonetic: 'ksha', token: 'ka', type: 'consonant', example: 'क्षत्रिय' },
    { letter: 'त्र', phonetic: 'tra', token: 'ta', type: 'consonant', example: 'त्रिशूल' },
    { letter: 'ज्ञ', phonetic: 'gya', token: 'ga', type: 'consonant', example: 'ज्ञान' },
  ],
};

// Use the exact same speech language codes as Practice (Word Practice)
const LANG_SPEECH_CODES = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-BR',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ar: 'ar-SA',
  hi: 'hi-IN'
};

// Direct S3 audio playback - pure and simple, no fallbacks

// ---------- VISIMES ----------

function getVisemeFrameUrl(token, _letterUpper, frameIndex0to15) {
  return getVisemeUrl(token, frameIndex0to15 + 1);
}

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

function resolveVisemeToken(sound) {
  const token = String(sound?.token || sound?.phonetic || "").trim().toLowerCase();
  if (token && token.length > 0 && hasVisemeFrames(token)) return token;
  
  const letter = String(sound?.letter || "").trim().toLowerCase();
  if (letter && hasVisemeFrames(letter)) return letter;
  
  // Try first letter
  if (letter && hasVisemeFrames(letter[0])) return letter[0];
  
  return 'neutral';
}

// ---------- IPA / VISUAL MATCHING (UNCHANGED FROM YOUR FILE) ----------

function getBaseLanguage(lang) {
  if (!lang) return 'en';
  return lang.toLowerCase().slice(0, 2);
}

const VOWEL_SETS = {
  en: new Set(['a','e','i','o','u','y']),
  es: new Set(['a','e','i','o','u']),
  fr: new Set(['a','e','i','o','u','y']),
  de: new Set(['a','e','i','o','u','y']),
  it: new Set(['a','e','i','o','u']),
  pt: new Set(['a','e','i','o','u']),
  zh: new Set(['a','e','i','o','u','y']),
  ja: new Set(['a','e','i','o','u']),
  ar: new Set(['a','e','i','o','u']),
  hi: new Set(['a','e','i','o','u'])
};

function getVowelsForLang(lang) {
  const base = getBaseLanguage(lang);
  return VOWEL_SETS[base] || VOWEL_SETS.en;
}

function splitOnsetNucleusCoda(token, vowelsSet) {
  const t = String(token || '').toLowerCase();
  let onset = '';
  let nucleus = '';
  let coda = '';

  let i = 0;
  while (i < t.length && !vowelsSet.has(t[i])) {
    onset += t[i];
    i++;
  }
  while (i < t.length && vowelsSet.has(t[i])) {
    nucleus += t[i];
    i++;
  }
  if (i < t.length) {
    coda = t.slice(i);
  }

  return { onset, nucleus, coda };
}

function letterTokenMatchesConsonantLetter(targetLetter, token, lang) {
  const vowels = getVowelsForLang(lang);
  const { onset } = splitOnsetNucleusCoda(token, vowels);

  const letter = String(targetLetter || '').toLowerCase();
  const o = String(onset || '').toLowerCase();

  if (!letter || !o) return false;
  if (o === letter) return true;
  if (o.startsWith(letter)) return true;
  if (letter.startsWith(o)) return true;
  return false;
}

function normalizeIPA(ipa) {
  return String(ipa)
    .toLowerCase()
    .replace(/[ːˑ]/g, '')
    .replace(/[ˈˌ]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function ipaMatches(detected, expected) {
  const d = normalizeIPA(detected);
  const e = normalizeIPA(expected);
  if (d === e) return true;

  const variants = [
    ['g', 'ɡ'],
    ['ð', 'd'],
    ['β', 'b'],
    ['ɣ', 'g'],
  ];

  for (const [v1, v2] of variants) {
    if ((d === v1 && e === v2) || (d === v2 && e === v1)) return true;
  }

  const dStripped = d.replace(/h$/i, '');
  const eStripped = e.replace(/h$/i, '');
  if (dStripped === eStripped && dStripped.length > 0) return true;

  if (d.length > 1 && d.startsWith(e) && e.length === 1) return true;
  if (dStripped.length > 1 && dStripped.startsWith(e) && e.length === 1) return true;

  return false;
}

function analyzeVisualFeatures(blendshapes) {
  if (!blendshapes || blendshapes.length === 0) return null;

  const avgShapes = {};
  const shapeNames = Object.keys(blendshapes[0].blendshapes || {});

  shapeNames.forEach(name => {
    const values = blendshapes.map(b => b.blendshapes[name] || 0);
    avgShapes[name] = values.reduce((sum, v) => sum + v, 0) / values.length;
  });

  return {
    jawOpen: avgShapes.jawOpen > 0.3 ? 'high' : avgShapes.jawOpen > 0.15 ? 'medium' : 'low',
    lipsClosed: avgShapes.mouthClose > 0.5,
    lipPucker: avgShapes.mouthPucker > 0.3 ? 'high' : avgShapes.mouthPucker > 0.15 ? 'slight' : 'none',
    lipRound: avgShapes.mouthFunnel > 0.3 ? 'high' : avgShapes.mouthFunnel > 0.15 ? 'slight' : 'none',
    lipSpread: avgShapes.mouthSmile > 0.2 || avgShapes.mouthStretch > 0.2,
    lipBite: avgShapes.mouthUpperUp > 0.3,
    tongueUp: avgShapes.tongueOut > 0.2,
    tongueBack: avgShapes.jawForward < 0.1,
    teethClose: avgShapes.jawOpen < 0.1,
    breathOut: avgShapes.jawOpen > 0.2 && avgShapes.mouthClose < 0.1
  };
}

function calculateVisualMatch(detected, expected) {
  if (!detected || !expected) return 0;

  let matches = 0;
  let total = 0;

  for (const [key, expectedValue] of Object.entries(expected)) {
    total++;
    const detectedValue = detected[key];

    if (typeof expectedValue === 'boolean') {
      if (detectedValue === expectedValue) matches++;
    } else if (typeof expectedValue === 'string') {
      if (detectedValue === expectedValue) {
        matches++;
      } else if (
        expectedValue === 'medium' &&
        (detectedValue === 'low' || detectedValue === 'high')
      ) {
        matches += 0.5;
      }
    }
  }

  return total > 0 ? matches / total : 0;
}

const LETTER_TARGETS = {
  en: {
    A: { ipa: ['æ', 'eɪ', 'ɑː', 'a'], visual: { jawOpen: 'high', lipRound: 'none' } },
    B: { ipa: ['b'], visual: { lipsClosed: true, lipPucker: 'none' } },
    C: { ipa: ['k', 's'], visual: { jawOpen: 'low', tongueBack: true } },
    D: { ipa: ['d'], visual: { jawOpen: 'medium', tongueUp: true, lipsClosed: false } },
    E: { ipa: ['iː', 'ɛ', 'e'], visual: { jawOpen: 'medium', lipSpread: true } },
    F: { ipa: ['f'], visual: { lipBite: true, jawOpen: 'low' } },
    G: { ipa: ['ɡ', 'g', 'dʒ'], visual: { jawOpen: 'medium', tongueBack: true, lipsClosed: false } },
    H: { ipa: ['h'], visual: { jawOpen: 'medium', breathOut: true } },
    I: { ipa: ['aɪ', 'ɪ', 'i'], visual: { jawOpen: 'low', lipSpread: true } },
    J: { ipa: ['j', 'dʒ', 'ʒ'], visual: { jawOpen: 'medium', lipRound: 'slight' } },
    K: { ipa: ['k'], visual: { jawOpen: 'low', tongueBack: true } },
    L: { ipa: ['l'], visual: { tongueUp: true, jawOpen: 'medium' } },
    M: { ipa: ['m'], visual: { lipsClosed: true, lipPucker: 'none' } },
    N: { ipa: ['n'], visual: { tongueUp: true, lipsClosed: false } },
    O: { ipa: ['oʊ', 'ɒ', 'ɑː', 'o'], visual: { jawOpen: 'high', lipRound: 'high' } },
    P: { ipa: ['p'], visual: { lipsClosed: true, lipPucker: 'slight' } },
    Q: { ipa: ['k'], visual: { jawOpen: 'low', tongueBack: true } },
    R: { ipa: ['ɹ', 'r'], visual: { lipRound: 'slight', tongueBack: true } },
    S: { ipa: ['s', 'z'], visual: { jawOpen: 'low', lipSpread: true, teethClose: true } },
    T: { ipa: ['t'], visual: { tongueUp: true, jawOpen: 'low', lipsClosed: false } },
    U: { ipa: ['uː', 'ʌ', 'juː', 'u'], visual: { jawOpen: 'medium', lipRound: 'high' } },
    V: { ipa: ['v'], visual: { lipBite: true, jawOpen: 'low' } },
    W: { ipa: ['w'], visual: { lipRound: 'high', lipPucker: 'high' } },
    X: { ipa: ['ks', 'gz'], visual: { jawOpen: 'low', tongueBack: true } },
    Y: { ipa: ['j', 'aɪ', 'ɪ'], visual: { jawOpen: 'low', lipSpread: true } },
    Z: { ipa: ['z', 's'], visual: { jawOpen: 'low', lipSpread: true, teethClose: true } },
  },
  es: {
    A: { ipa: ['a'], visual: { jawOpen: 'high', lipRound: 'none' } },
    B: { ipa: ['b', 'β'], visual: { lipsClosed: true, lipPucker: 'none' } },
    C: { ipa: ['k', 'θ', 's'], visual: { jawOpen: 'low', tongueBack: true } },
    D: { ipa: ['d', 'ð'], visual: { jawOpen: 'medium', tongueUp: true, lipsClosed: false } },
    E: { ipa: ['e'], visual: { jawOpen: 'medium', lipSpread: true } },
    F: { ipa: ['f'], visual: { lipBite: true, jawOpen: 'low' } },
    G: { ipa: ['g', 'ɣ', 'x'], visual: { jawOpen: 'medium', tongueBack: true, lipsClosed: false } },
    H: { ipa: [], behavior: 'silent', visual: { jawOpen: 'low' } },
    I: { ipa: ['i'], visual: { jawOpen: 'low', lipSpread: true } },
    J: { ipa: ['x'], visual: { jawOpen: 'medium', tongueBack: true } },
    K: { ipa: ['k'], visual: { jawOpen: 'low', tongueBack: true } },
    L: { ipa: ['l'], visual: { tongueUp: true, jawOpen: 'medium' } },
    LL: { ipa: ['ʎ', 'ʝ', 'j'], visual: { tongueUp: true, lipSpread: true } },
    M: { ipa: ['m'], visual: { lipsClosed: true, lipPucker: 'none' } },
    N: { ipa: ['n'], visual: { tongueUp: true, lipsClosed: false } },
    Ñ: { ipa: ['ɲ'], visual: { tongueUp: true, jawOpen: 'medium' } },
    O: { ipa: ['o'], visual: { jawOpen: 'high', lipRound: 'high' } },
    P: { ipa: ['p'], visual: { lipsClosed: true, lipPucker: 'slight' } },
    Q: { ipa: ['k'], visual: { jawOpen: 'low', tongueBack: true } },
    R: { ipa: ['ɾ', 'r'], visual: { tongueUp: true, jawOpen: 'medium' } },
    S: { ipa: ['s'], visual: { jawOpen: 'low', lipSpread: true } },
    T: { ipa: ['t'], visual: { tongueUp: true, jawOpen: 'low', lipsClosed: false } },
    U: { ipa: ['u'], visual: { jawOpen: 'medium', lipRound: 'high' } },
    V: { ipa: ['b', 'β'], visual: { lipsClosed: true, lipPucker: 'none' } },
    W: { ipa: ['w'], visual: { lipRound: 'high', lipPucker: 'high' } },
    X: { ipa: ['ks', 's', 'x'], visual: { jawOpen: 'low' } },
    Y: { ipa: ['i', 'j'], visual: { jawOpen: 'low', lipSpread: true } },
    Z: { ipa: ['s', 'θ'], visual: { jawOpen: 'low', lipSpread: true } },
  },
};

function isLetterAttemptPass({ phonemeResult, targetLetter, lang, blendshapes }) {
  if (!phonemeResult) return false;

  const baseLang = getBaseLanguage(lang || 'en');
  const letterKey = String(targetLetter || '').toUpperCase();

  const langTargets = LETTER_TARGETS[baseLang] || LETTER_TARGETS.en;
  const letterConfig = langTargets[letterKey];

  if (!letterConfig) {
    console.warn('[isLetterAttemptPass] No letterConfig for', baseLang, letterKey);
    return true;
  }

  const ipaUnits = Array.isArray(phonemeResult.ipa_units) ? phonemeResult.ipa_units : [];
  const phonemeList = Array.isArray(phonemeResult.phoneme_list) ? phonemeResult.phoneme_list : [];
  const tokensFromResult = Array.isArray(phonemeResult.tokens) ? phonemeResult.tokens : [];
  const primary = phonemeResult.primary || phonemeResult.syllable?.primary || '';

  let tokens = [];
  if (tokensFromResult.length > 0) tokens = tokensFromResult;
  else if (primary) tokens = [primary];
  else if (phonemeList.length > 0) tokens = phonemeList;
  else if (ipaUnits.length > 0) tokens = ipaUnits;

  const hasAnyToken = tokens && tokens.length > 0;

  if (letterConfig.behavior === 'silent') {
    const hasAnySound =
      hasAnyToken ||
      (typeof phonemeResult.phonemes === 'string' && phonemeResult.phonemes.trim().length > 0);
    return !hasAnySound;
  }

  let audioMatch = false;
  const expectedIpaList = Array.isArray(letterConfig.ipa) ? letterConfig.ipa : [];

  if (hasAnyToken) {
    outer: for (const token of tokens) {
      if (letterTokenMatchesConsonantLetter(letterKey, token, baseLang)) {
        audioMatch = true;
        break outer;
      }
      if (expectedIpaList.length > 0) {
        for (const exp of expectedIpaList) {
          if (ipaMatches(token, exp)) {
            audioMatch = true;
            break outer;
          }
        }
      }
    }
  }

  let visualScore = 0;
  if (blendshapes && blendshapes.length > 0 && letterConfig.visual) {
    const detectedVisual = analyzeVisualFeatures(blendshapes);
    visualScore = calculateVisualMatch(detectedVisual, letterConfig.visual) || 0;
  }

  const PASS_VISUAL_THRESHOLD = 0.7;
  return audioMatch || visualScore >= PASS_VISUAL_THRESHOLD;
}

// ---------- COMPONENT ----------

export default function LetterPractice() {
  const [selectedSound, setSelectedSound] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [mouthAnimationKey, setMouthAnimationKey] = useState(undefined);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // viseme preload state
  const [isVisemeReady, setIsVisemeReady] = useState(false);
  const [isVisemeLoading, setIsVisemeLoading] = useState(false);
  const visemePreloadReqId = useRef(0);

  // phonetics
  const [customPhonetics, setCustomPhonetics] = useState({});
  const [isLoadingPhonetics, setIsLoadingPhonetics] = useState(true);

  // audit
  const [auditResults, setAuditResults] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // audio ref
  const isPlayingRef = useRef(false);

  const t = useTranslations(selectedLang);
  const ALPHABET_SOUNDS = ALPHABET_BY_LANG[selectedLang] || ALPHABET_BY_LANG.en;
  const attemptCount = attempts.length;

  useEffect(() => {
    const lang = localStorage.getItem('soundmirror_lang') || 'en';
    setSelectedLang(lang);
  }, []);

  // Load custom phonetics (display-only; must not break tokens)
  useEffect(() => {
    const loadCustomPhonetics = async () => {
      setIsLoadingPhonetics(true);
      try {
        const customs = await base44.entities.CustomPhonetic.filter({ language: selectedLang });
        const map = {};
        customs.forEach(c => {
          map[c.letter] = c.custom_phonetic;
        });
        setCustomPhonetics(map);
        console.log('[LetterPractice] Loaded custom phonetics:', map);
      } catch (err) {
        console.warn('Failed to load custom phonetics:', err);
      } finally {
        setIsLoadingPhonetics(false);
      }
    };

    loadCustomPhonetics();
  }, [selectedLang]);

  // Warm up TTS voices (helps any fallback systems, even if MP3 is primary)
  useEffect(() => {
    const code =
      selectedLang === 'es' ? 'es-ES' :
      selectedLang === 'fr' ? 'fr-FR' :
      selectedLang === 'de' ? 'de-DE' :
      selectedLang === 'it' ? 'it-IT' :
      selectedLang === 'pt' ? 'pt-BR' :
      selectedLang === 'zh' ? 'zh-CN' :
      selectedLang === 'ja' ? 'ja-JP' :
      selectedLang === 'ar' ? 'ar-SA' :
      selectedLang === 'hi' ? 'hi-IN' :
      'en-US';

    warmupTTS(code);
  }, [selectedLang]);

  // Preload viseme frames silently in background
  useEffect(() => {
    if (!selectedSound) return;

    setFrameIndex(0);
    setIsVisemeReady(false);

    const reqId = ++visemePreloadReqId.current;
    const token = resolveVisemeToken(selectedSound);
    let cancelled = false;

    async function runPreload() {
        try {
          setIsVisemeLoading(true);

          if (!token) {
            setIsVisemeReady(true);
            setIsVisemeLoading(false);
            return;
          }

          // Import getPhonemeFrames to get all frames for a token
          const { getPhonemeFrames } = await import('../components/practice/visemeUrls');
          const phonemeData = getPhonemeFrames(token);

          if (!phonemeData || !Array.isArray(phonemeData.front) || phonemeData.front.length === 0) {
            setIsVisemeReady(true);
            setIsVisemeLoading(false);
            return;
          }

          // Take first 8 frames for preload (or all available)
          const urls = phonemeData.front.slice(0, 8);
          if (Array.isArray(urls) && urls.length > 0) {
            await Promise.all(urls.map(preloadImage));
          }

        if (cancelled) return;
        if (reqId !== visemePreloadReqId.current) return;

        setIsVisemeReady(true);
      } catch (e) {
        console.warn('[LetterPractice] Viseme preload failed:', e?.message || e);
        setIsVisemeReady(true); // allow UI to proceed even if preload fails
      } finally {
        if (!cancelled) setIsVisemeLoading(false);
      }
    }

    runPreload();
    return () => { cancelled = true; };
  }, [selectedSound?.letter, selectedLang]);

  const ensureVisemeReadyNow = async () => {
    if (isVisemeReady) return true;
    await new Promise(r => setTimeout(r, 80));
    return true;
  };

  // ---------- CLEAN SPEAK (MP3 USING audioSpriteEngine) ----------
  const speakSound = async (soundObj) => {
    try {
      if (!soundObj) return;

      if (isPlayingRef.current) {
        console.log("[Audio] Already playing, ignoring request");
        return;
      }
      isPlayingRef.current = true;

      await ensureVisemeReadyNow();

      const letter = soundObj?.letter;

      const hasToken = soundObj?.token || soundObj?.audioToken || soundObj?.phonetic;
      if (!hasToken) {
        console.log("[Audio] Silent letter, no audio:", letter);
        setIsPlayingSound(true);
        setMouthAnimationKey(Date.now());
        setFrameIndex(0);
        await new Promise(r => setTimeout(r, 800));
        setIsPlayingSound(false);
        setTimeout(() => setFrameIndex(0), 100);
        isPlayingRef.current = false;
        return;
      }

      const phoneme = soundObj.token || soundObj.phonetic || letter.toLowerCase();
      console.log("[LetterPractice] Playing phoneme:", phoneme, "lang:", selectedLang);

      setIsPlayingSound(true);
      setMouthAnimationKey(Date.now());
      setFrameIndex(0);

      // Animate frames during audio playback
      const AUDIO_DURATION_MS = 1200; // matches minimum duration in audioSpriteEngine
      const TOTAL_FRAMES = 8; // 0-7
      const startTime = Date.now();
      let animationFrameId;

      const animateFrames = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / AUDIO_DURATION_MS, 1);

        // Frame sequence: 0 (closed) -> 1-6 (open/sweet spots) -> 7 (closed)
        let currentFrame;
        if (progress < 0.1) {
          currentFrame = 0; // Start closed
        } else if (progress > 0.9) {
          currentFrame = 7; // End closed
        } else {
          // Map middle 80% of time to frames 1-6
          const middleProgress = (progress - 0.1) / 0.8;
          currentFrame = Math.floor(middleProgress * 6) + 1;
          currentFrame = Math.max(1, Math.min(6, currentFrame));
        }

        setFrameIndex(currentFrame);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animateFrames);
        } else {
          setFrameIndex(0); // Ensure we end closed
        }
      };

      animateFrames();

      try {
        const { playSinglePhoneme } = await import('../components/practice/audioSpriteEngine');
        await playSinglePhoneme(phoneme, selectedLang);
        console.log("[LetterPractice] Playback complete");
      } catch (e) {
        console.error("[LetterPractice] ❌ MP3 playback failed:", e?.message);
        throw e;
      } finally {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        setIsPlayingSound(false);
        setTimeout(() => setFrameIndex(0), 100);
        isPlayingRef.current = false;
      }
    } catch (e) {
      setIsPlayingSound(false);
      isPlayingRef.current = false;
      console.error("[Audio] Error:", e);
    }
  };

  const handleRecording = async (audioBlob, blendshapes) => {
    if (!selectedSound) return;

    setIsProcessing(true);
    try {
      const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      console.log('[LetterPractice] Calling getPhonemes with:', file_url);
      const response = await base44.functions.invoke('getPhonemes', {
        audioFileUrl: file_url,
        lang: getBaseLanguage(selectedLang),
        targetText: selectedSound.letter
      });

      const phonemeResult = response.data || response;

      if (phonemeResult.error) throw new Error(phonemeResult.error);

      const ipaUnits = phonemeResult.ipa_units || [];
      const rawList = phonemeResult.phoneme_list || [];

      const primarySyllable = phonemeResult.syllable?.primary || phonemeResult.primary || '';
      const firstIpa = Array.isArray(phonemeResult.ipa_units) && phonemeResult.ipa_units.length > 0
        ? phonemeResult.ipa_units[0]
        : phonemeResult.ipa || '';
      const rawTranscription = phonemeResult.raw_transcription || '';
      const fallbackPhonemes = phonemeResult.phonemes || '';

      let heardPhones = primarySyllable || firstIpa || rawTranscription || fallbackPhonemes || t('nothingDetected') || '...';

      if (heardPhones.length === 1 && heardPhones === heardPhones.toUpperCase()) {
        heardPhones = firstIpa || primarySyllable || rawTranscription || '?';
      }
      if (heardPhones.length > 3) heardPhones = heardPhones.substring(0, 3);

      const isPass = isLetterAttemptPass({
        phonemeResult,
        targetLetter: selectedSound.letter,
        lang: selectedLang,
        blendshapes: blendshapes
      });

      const attempt = {
        id: Date.now(),
        heard: heardPhones,
        heardPhonetic: heardPhones,
        backend: phonemeResult.backend || '',
        rawPhonemeList: rawList,
        ipaUnits: ipaUnits,
        timestamp: new Date().toISOString(),
        isPass: isPass,
      };

      setCurrentResult(attempt);
      setIsShowingResult(true);
      setAttempts((prev) => [...prev, attempt]);
    } catch (error) {
      console.error('Error analyzing sound:', error);
      alert(`Failed to analyze: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectLetter = async (sound) => {
    // Display phonetic can be overridden, but token MUST remain stable
    const customPhon = customPhonetics[sound.letter];
    const soundWithCustom = customPhon ? { ...sound, phonetic: customPhon } : sound;

    console.log('[LetterPractice] Selected:', sound.letter, 'phonetic:', soundWithCustom.phonetic, 'custom:', !!customPhon);

    setSelectedSound(soundWithCustom);
    setAttempts([]);
    setIsShowingResult(false);
    setCurrentResult(null);
    setIsVisemeReady(false);
    setFrameIndex(0);
    setMouthAnimationKey(undefined);

    // Preload TTS for this letter - don't play yet
    try {
      const langCode = LANG_SPEECH_CODES[selectedLang] || 'en-US';
      console.log('[LetterPractice] Preloading TTS for letter:', sound.letter);
      await warmupTTS(langCode);
      // Do a silent dummy speak to warm up the synthesis engine
      console.log('[LetterPractice] Warming up synthesis engine with dummy speak');
      await speakText(' ', { lang: langCode, rate: 0.85, volume: 0 });
    } catch (e) {
      console.error('[LetterPractice] TTS preload error:', e);
    }
  };

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const results = await auditVisemes();
      setAuditResults(results);
    } catch (err) {
      console.error('Audit failed:', err);
      alert('Audit failed: ' + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="container mx-auto px-2 py-2 md:px-6 md:py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-2 md:mb-6">
          <Link to={createPageUrl('Home')} className="inline-block p-3">
            <Button variant="ghost" className="gap-1 md:gap-2 text-slate-300 hover:text-slate-100 h-7 md:h-auto text-xs md:text-base">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              {t('backToHome')}
            </Button>
          </Link>

          <Link to={createPageUrl('TeachLetters')} className="inline-block p-3">
            <Button variant="outline" className="gap-1 md:gap-2 border-emerald-500 text-emerald-400 hover:bg-emerald-950 h-7 md:h-auto text-xs md:text-base">
              <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
              {t('teacherTraining')}
            </Button>
          </Link>

          <Button
            onClick={runAudit}
            disabled={isAuditing}
            variant="outline"
            className="gap-1 md:gap-2 border-cyan-500 text-cyan-400 hover:bg-cyan-950 h-7 md:h-auto text-xs md:text-base"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5" />
            {isAuditing ? 'Auditing...' : 'Audit Visemes'}
          </Button>
        </div>

        {auditResults && (
          <Card className="mb-4 border-cyan-700 bg-slate-800/90">
            <CardHeader className="py-2">
              <CardTitle className="text-sm text-cyan-300">Viseme Audit Results</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-xs text-slate-300 space-y-1">
                <p>Total tokens: <b className="text-white">{auditResults.totalTokens}</b></p>
                <p>Present: <b className="text-green-400">{auditResults.presentTokens.length}</b></p>
                <p>Missing: <b className="text-red-400">{auditResults.missingTokens.length}</b></p>

                {auditResults.missingTokens.length > 0 && (
                  <div className="mt-3 p-2 bg-slate-900/70 rounded border border-red-700/50 max-h-48 overflow-y-auto">
                    <p className="font-semibold text-red-300 mb-1">Missing tokens:</p>
                    {auditResults.missingTokens.map(({ token, fallback }) => (
                      <div key={token} className="text-[10px] font-mono py-0.5">
                        <span className="text-red-400">"{token}"</span>
                        {fallback ? (
                          <span className="text-slate-400"> → fallback: <span className="text-cyan-300">"{fallback}"</span></span>
                        ) : (
                          <span className="text-orange-400"> → NEEDS_NEW_RECORDING</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedSound ? (
          <Card className="border border-indigo-800 bg-gradient-to-br from-slate-800 to-indigo-900">
            <CardHeader className="py-2 md:py-6">
              <CardTitle className="text-center text-base md:text-2xl text-slate-100">
                {t('chooseLetterToPractice') || 'Choose a letter to practice'}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 md:py-6">
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1 md:gap-3">
                {ALPHABET_SOUNDS.map((s) => (
                  <Button
                    key={s.letter}
                    onClick={() => handleSelectLetter(s)}
                    variant="outline"
                    className={`h-10 w-10 md:h-16 md:w-16 text-lg md:text-2xl font-bold ${
                      s.type === 'vowel'
                        ? 'border-amber-500 text-amber-400 hover:bg-amber-900/50'
                        : 'border-blue-500 text-blue-400 hover:bg-blue-900/50'
                    }`}
                  >
                    {s.letter}
                  </Button>
                ))}
              </div>

              <div className="flex justify-center gap-3 md:gap-6 mt-2 md:mt-4 text-[10px] md:text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-4 md:h-4 rounded bg-amber-500" /> {t('vowels') || 'Vowels'}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-4 md:h-4 rounded bg-blue-500" /> {t('consonants') || 'Consonants'}
                </span>
              </div>

              <div className="mt-2 md:mt-6 pt-2 md:pt-6 border-t border-indigo-700/50">
                <h1 className="text-base md:text-2xl font-bold text-center text-slate-100">{t('practiceLetters')}</h1>
                <p className="text-slate-400 mt-1 md:mt-3 text-center text-[10px] md:text-base">
                  {t('learnLetterSounds') || 'Learn how each letter sounds with camera and microphone feedback'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:gap-4">
            <Card className="border border-indigo-800 bg-gradient-to-br from-slate-800 to-indigo-900">
              <CardHeader className="py-2 md:py-4">
                <CardTitle className="text-center text-sm md:text-xl text-slate-100">
                  {t('practice')} <span className="text-indigo-400">{selectedSound.letter}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 py-1 md:py-2">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                  <div className="flex gap-2 md:gap-3 items-start">
                    <div className={`inline-block p-2 md:p-3 bg-slate-700 rounded-lg shadow-lg border-2 transition-all duration-300 ${
                      isPlayingSound
                        ? 'border-yellow-400 shadow-yellow-400/50 shadow-2xl scale-105'
                        : 'border-indigo-700'
                    }`}>
                      <span className={`text-3xl md:text-4xl font-bold transition-all duration-300 ${
                        isPlayingSound ? 'text-yellow-300 animate-pulse' : 'text-indigo-400'
                      }`}>
                        {selectedSound.letter}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 justify-center">
                      <div className="space-y-0.5">
                        <p className="text-sm md:text-base font-semibold text-slate-200">
                          {t('soundsLike')}: {selectedSound.phonetic}
                        </p>
                        <p className="text-xs md:text-sm text-slate-400">
                          {t('asIn') || 'As in'} "<span className="font-semibold text-slate-300">{selectedSound.example}</span>"
                        </p>
                      </div>
                      <Button
                        onClick={() => speakSound(selectedSound)}
                        size="sm"
                        disabled={!isVisemeReady}
                        className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 p-0 disabled:opacity-60 mt-16"
                        title={isVisemeLoading ? "Loading visemes..." : "Play"}
                      >
                        <Play className="h-6 w-6 md:h-7 md:w-7 ml-0.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row-reverse gap-3 md:gap-6 items-center md:items-start">
                    <div className="border border-slate-700 bg-slate-800/50 rounded-lg p-3 md:p-4">
                      <div className="text-xs md:text-sm text-slate-400 mb-2">
                        {t('chooseLetterToPractice') || 'Choose a letter'}
                      </div>
                      <div className="grid grid-cols-6 md:grid-cols-5 gap-1 md:gap-1.5">
                        {ALPHABET_SOUNDS.map((s) => (
                          <button
                            key={s.letter}
                            onClick={() => handleSelectLetter(s)}
                            className={`h-9 w-9 md:h-12 md:w-12 text-sm md:text-base font-bold rounded transition-all ${
                              s.letter === selectedSound.letter
                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                                : s.type === 'vowel'
                                  ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-800/50'
                                  : 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50'
                            }`}
                          >
                            {s.letter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <div className="text-xs md:text-sm text-slate-300 mb-1">
                        Target mouth (Master & Slave)
                      </div>

                      <DualHeadAnimator
                        phonemeTokens={[resolveVisemeToken(selectedSound)]}
                        isPlaying={isPlayingSound}
                        playbackRate={1.0}
                        frameDuration={100}
                        onAnimationComplete={() => setIsPlayingSound(false)}
                        maxWidth={712}
                      />
                    </div>
                  </div>
                </div>

                <UnifiedRecorder
                  targetWord={selectedSound.letter}
                  targetPhonemes={{ phonetic: selectedSound.phonetic, phonemes: [selectedSound] }}
                  onRecordingComplete={handleRecording}
                  isProcessing={isProcessing}
                />

                {isShowingResult && currentResult && (
                  <Card className="border border-indigo-600 bg-slate-800/70">
                    <CardContent className="py-2">
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-1">
                          <Volume2 className="h-4 w-4 text-indigo-300 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-indigo-200">
                              {t('phoneticAnalysis') || 'Phonetic analysis'}
                            </p>

                            <div className="mt-1 grid grid-cols-2 gap-1">
                              <div className="p-1.5 bg-slate-700 rounded border border-blue-700">
                                <p className="text-[9px] font-semibold text-blue-300 mb-0.5">
                                  {selectedLang === 'es'
                                    ? 'Debería sonar como'
                                    : selectedLang === 'en'
                                      ? 'Should sound like'
                                      : (t('shouldSound') || 'Should sound like')}
                                  :
                                </p>
                                <div className="text-sm font-bold text-blue-400">
                                  "{selectedSound.phonetic}"
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {selectedSound.letter}
                                </p>
                              </div>

                              <div className="p-1.5 bg-slate-700 rounded border border-purple-700">
                                <p className="text-[9px] font-semibold text-purple-300 mb-0.5">
                                  {selectedLang === 'es'
                                    ? 'Lo que escuchamos'
                                    : selectedLang === 'en'
                                      ? 'What we heard'
                                      : (t('whatWeHeard') || 'What we heard')}
                                  :
                                </p>
                                <div className="text-sm font-bold text-purple-400 break-words">
                                  "{currentResult.heardPhonetic || currentResult.heard}"
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  /{currentResult.heard || '—'}/
                                </p>
                                {'isPass' in currentResult && (
                                  <p className="text-[9px] mt-0.5">
                                    {currentResult.isPass ? (
                                      <span className="text-green-400 font-semibold">
                                        ✓ Great job! This counts as a good {selectedSound.letter} sound.
                                      </span>
                                    ) : (
                                      <span className="text-red-400">
                                        ✗ Not quite there yet — try the {selectedSound.phonetic} sound again.
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {attempts.length > 0 && (
                          <div className="mt-1">
                            <p className="text-[9px] font-semibold text-slate-300 mb-0.5">
                              {t('attemptHistory') || 'Attempt history (debug view)'}
                            </p>
                            <div className="max-h-24 overflow-y-auto rounded bg-slate-900/70 border border-slate-700 p-1 text-[9px] font-mono text-slate-200">
                              {attempts.map((a, idx) => (
                                <div
                                  key={a.id || idx}
                                  className={`py-1 ${
                                    idx < attempts.length - 1 ? 'border-b border-slate-700/70' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold">
                                      #{idx + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {'isPass' in a && (
                                        <span
                                          className={`px-2 py-[1px] rounded-full text-[10px] ${
                                            a.isPass
                                              ? 'bg-green-700/60 text-green-100'
                                              : 'bg-red-700/60 text-red-100'
                                          }`}
                                        >
                                          {a.isPass ? 'PASS' : 'TRY AGAIN'}
                                        </span>
                                      )}
                                      <span className="text-slate-400">
                                        {a.backend || 'backend: ?'}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    heard: "<span className="text-indigo-300">{a.heard}</span>"
                                  </div>
                                  <div className="text-slate-400">
                                    phoneme_list: [
                                    {Array.isArray(a.rawPhonemeList)
                                      ? a.rawPhonemeList.join(', ')
                                      : ''}
                                    ]
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center justify-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i < attemptCount
                          ? 'bg-green-500 scale-110'
                          : 'bg-slate-600'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-[9px] text-slate-400">
                    {attemptCount}/3 {t('attempts') || 'attempts'}
                  </span>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}