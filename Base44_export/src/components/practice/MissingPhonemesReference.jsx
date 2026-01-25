/**
 * MISSING PHONEMES REFERENCE
 * Guide for creating additional viseme JPGs in DAZ Studio
 * 
 * Current Status: 30 visemes complete (English + Spanish)
 * Total needed: ~106 visemes for all 10 languages
 * Missing: ~76 visemes
 */

export const MISSING_PHONEMES = {
  // ✅ COMPLETE
  en: [], // 26 visemes (a-z)
  es: ['rr'], // 28 visemes (ñ/ll already mapped to nye/ya)
  
  // 🟡 PHASE 1: Western Languages (13 new visemes)
  fr: [
    'eu',  // œ sound in "peu" - rounded lips, mid-front
    'on',  // nasal ɔ̃ in "bon" - rounded, nasalized
    'an',  // nasal ɑ̃ in "dans" - open, nasalized
    'in',  // nasal ɛ̃ in "vin" - spread lips, nasalized
    'un',  // nasal œ̃ in "un" - rounded, nasalized
    'u_fr' // French "u" - different from English (lips very rounded, tongue forward)
  ],
  
  de: [
    'ü',   // rounded ü in "über" - lips rounded, tongue high front
    'ö',   // rounded ö in "schön" - lips rounded, tongue mid front
    'ch',  // ich-laut (soft palatal fricative)
    'ach'  // ach-laut (velar fricative, back of throat)
  ],
  
  pt: [
    'ão',  // nasal diphthong (common in Portuguese)
    'õe',  // nasal diphthong
    'lh'   // palatal lateral (like Spanish ll but slightly different)
  ],
  
  // ✅ MOSTLY COMPLETE
  it: [], // Can reuse ñ for "gn", ll for "gli"
  
  // 🔴 PHASE 2: Asian Languages (25 new visemes)
  ja: [
    'tsu', // つ affricate (lips slightly protruded)
    'chi', // ち palatal (tongue raised to hard palate)
    'shi', // し palatal fricative
    'fu',  // ふ bilabial fricative (NOT labiodental like English f)
    'ryo', // りょ palatalized r + o
    'ryu', // りゅ palatalized r + u
    'rya', // りゃ palatalized r + a
    'kyo', // きょ palatalized k + o
    'nyo', // にょ palatalized n + o
    'hyo'  // ひょ palatalized h + o
  ],
  
  zh: [
    'zh',   // retroflex (tongue curled back)
    'ch_zh',// retroflex aspirated ch (different from English ch)
    'sh_zh',// retroflex sh (tongue back)
    'r_zh', // retroflex approximant (very different from English r)
    'q',    // palatal aspirated
    'x_zh', // palatal fricative
    'j_zh', // palatal affricate
    'z_c',  // dental sibilant z/c
    'üe',   // rounded front + e diphthong
    'ü_zh', // rounded high front vowel
    'ian',  // palatal glide + an
    'iang', // palatal glide + ang
    'iong', // palatal + rounded back
    'ua',   // back glide + a
    'uo'    // back glide + rounded o
  ],
  
  // 🔴 PHASE 3: Complex Scripts (38 new visemes)
  hi: [
    'ट',    // retroflex t (tongue curled back)
    'ड',    // retroflex d
    'ण',    // retroflex n
    'kh',   // aspirated k
    'gh',   // aspirated g
    'ch',   // aspirated c
    'jh',   // aspirated j
    'th',   // aspirated t
    'dh',   // aspirated d
    'ph',   // aspirated p
    'bh',   // aspirated b
    'ड़',   // flap/tap sound
    'ढ़',   // flap/tap sound
    'ã',    // nasalized a
    'ẽ',    // nasalized e
    'ĩ',    // nasalized i
    'õ',    // nasalized o
    'ũ',    // nasalized u
    'sh_hi',// palatoalveolar
    'ष'     // retroflex
  ],
  
  ar: [
    'ح',    // voiceless pharyngeal fricative (throat)
    'ع',    // voiced pharyngeal fricative
    'خ',    // voiceless velar fricative
    'غ',    // voiced velar fricative
    'ق',    // uvular stop (deep throat)
    'ط',    // emphatic t (pharyngealized)
    'ض',    // emphatic d
    'ص',    // emphatic s
    'ظ',    // emphatic dh
    'ء',    // glottal stop
    'ā',    // long a
    'ī',    // long i
    'ū',    // long u
    'ay',   // diphthong
    'aw',   // diphthong
    'ة',    // ta marbuta
    'shadda', // gemination (doubled consonant)
    'r_ar'  // rolled r (different from Spanish)
  ]
};

// Production priority for viseme generation
export const VISEME_PRIORITY = [
  // Phase 1: Western (13) - highest business value
  { lang: 'fr', phoneme: 'eu', ipa: 'œ', example: 'peu', priority: 1 },
  { lang: 'fr', phoneme: 'u_fr', ipa: 'y', example: 'tu', priority: 1 },
  { lang: 'fr', phoneme: 'on', ipa: 'ɔ̃', example: 'bon', priority: 1 },
  { lang: 'fr', phoneme: 'an', ipa: 'ɑ̃', example: 'dans', priority: 1 },
  { lang: 'fr', phoneme: 'in', ipa: 'ɛ̃', example: 'vin', priority: 1 },
  { lang: 'fr', phoneme: 'un', ipa: 'œ̃', example: 'un', priority: 1 },
  
  { lang: 'de', phoneme: 'ü', ipa: 'y', example: 'über', priority: 1 },
  { lang: 'de', phoneme: 'ö', ipa: 'ø', example: 'schön', priority: 1 },
  { lang: 'de', phoneme: 'ch', ipa: 'ç', example: 'ich', priority: 1 },
  { lang: 'de', phoneme: 'ach', ipa: 'x', example: 'Bach', priority: 1 },
  
  { lang: 'pt', phoneme: 'ão', ipa: 'ɐ̃w̃', example: 'pão', priority: 1 },
  { lang: 'pt', phoneme: 'õe', ipa: 'õj̃', example: 'põe', priority: 1 },
  { lang: 'pt', phoneme: 'lh', ipa: 'ʎ', example: 'filho', priority: 1 },
  
  { lang: 'es', phoneme: 'rr', ipa: 'r', example: 'perro', priority: 1 },
  
  // Phase 2: Asian (25) - medium priority
  // ... (Japanese, Chinese)
  
  // Phase 3: Complex (38) - lower priority
  // ... (Hindi, Arabic)
];

// Helper: Get missing phonemes for a language
export function getMissingPhonemes(lang) {
  return MISSING_PHONEMES[lang] || [];
}

// Helper: Check if phoneme has viseme available
export function hasViseme(phoneme) {
  // This would check against your uploaded visemes
  // For now, returns true for English letters a-z
  const normalized = String(phoneme || '').toLowerCase().trim();
  return /^[a-z]$/.test(normalized) || 
         normalized === 'ñ' || 
         normalized === 'll' ||
         normalized === 'ba' ||
         normalized === 'ca' ||
         normalized === 'da';
}

export default function MissingPhonemesReference() {
  return (
    <div className="p-6 bg-slate-900 text-slate-100 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">Missing Phonemes Reference</h1>
      <p className="mb-4 text-slate-300">
        This reference shows which viseme JPGs need to be created for complete 10-language support.
      </p>
      
      {Object.entries(MISSING_PHONEMES).map(([lang, phonemes]) => (
        <div key={lang} className="mb-6">
          <h2 className="text-lg font-bold text-indigo-400 mb-2">
            {lang.toUpperCase()} - {phonemes.length === 0 ? '✅ Complete' : `🔴 Missing ${phonemes.length}`}
          </h2>
          {phonemes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-4">
              {phonemes.map(p => (
                <div key={p} className="bg-slate-800 px-3 py-1 rounded border border-slate-700">
                  {p}
                </div>
              ))}
            </div>
          ) : (
            <p className="ml-4 text-green-400">All phonemes have viseme frames!</p>
          )}
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-blue-900/30 border border-blue-700 rounded">
        <h3 className="font-bold text-blue-300 mb-2">Next Steps:</h3>
        <ol className="list-decimal ml-6 space-y-1 text-slate-300">
          <li>Generate Phase 1 visemes (Western languages) - 14 total</li>
          <li>Test with French, German, Portuguese speakers</li>
          <li>Generate Phase 2 (Japanese, Chinese) - 25 total</li>
          <li>Generate Phase 3 (Hindi, Arabic) - 38 total</li>
        </ol>
      </div>
    </div>
  );
}