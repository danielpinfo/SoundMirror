/**
 * DIRECT MP3 PLAYBACK - NO SPRITE ENGINE
 * 
 * S3 Bucket: soundmirror-phoneme-audio
 * Base URL: https://soundmirror-phoneme-audio.s3.us-east-1.amazonaws.com/
 */

const S3_BASE_URL = 'https://soundmirror-phoneme-audio.s3.us-east-1.amazonaws.com';

/**
 * Play a single phoneme - DIRECT S3 MP3 PLAYBACK
 * Comprehensive diagnostic logging for troubleshooting
 * 
 * @param {string} phoneme - Phoneme string
 * @param {string} lang - Language code (en, es, fr, de, it, pt, zh, ja, ar, hi)
 * @returns {Promise<void>}
 */
export async function playSinglePhoneme(phoneme, lang = 'en') {
  const timestamp = new Date().toISOString();
  const phonemeLower = String(phoneme || '').toLowerCase();
  const filename = `${lang}-${phonemeLower}.mp3`;
  const url = `${S3_BASE_URL}/${filename}`;
  
  console.log(`\n[PHONEME_PLAY] ========================================`);
  console.log(`[PHONEME_PLAY] Timestamp: ${timestamp}`);
  console.log(`[PHONEME_PLAY] Language: "${lang}"`);
  console.log(`[PHONEME_PLAY] Phoneme: "${phoneme}" -> normalized: "${phonemeLower}"`);
  console.log(`[PHONEME_PLAY] Filename: ${filename}`);
  console.log(`[PHONEME_PLAY] Full S3 URL: ${url}`);
  console.log(`[PHONEME_PLAY] ========================================\n`);
  
  const MINIMUM_DURATION_MS = 1200;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio();
      let audioEnded = false;
      let canPlayThrough = false;
      
      audio.onloadstart = () => {
        console.log(`[PHONEME_PLAY] Audio.onloadstart triggered`);
      };
      
      audio.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          console.log(`[PHONEME_PLAY] Audio progress: ${percent}% (${e.loaded}/${e.total} bytes)`);
        }
      };
      
      audio.oncanplay = () => {
        console.log(`[PHONEME_PLAY] ✅ Audio.oncanplay - can start playback`);
      };
      
      audio.oncanplaythrough = () => {
        console.log(`[PHONEME_PLAY] ✅ Audio.oncanplaythrough - fully buffered`);
        canPlayThrough = true;
      };
      
      audio.onplaying = () => {
        console.log(`[PHONEME_PLAY] ▶️ Audio.onplaying - playback started`);
      };
      
      audio.onended = () => {
        console.log(`[PHONEME_PLAY] ✅ Audio.onended - playback complete`);
        audioEnded = true;
        
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MINIMUM_DURATION_MS - elapsed);
        
        console.log(`[PHONEME_PLAY] Elapsed: ${elapsed}ms, enforcing minimum ${MINIMUM_DURATION_MS}ms, waiting ${remaining}ms more`);
        
        setTimeout(() => {
          console.log(`[PHONEME_PLAY] ✅ Minimum duration enforced, resolving`);
          resolve();
        }, remaining);
      };
      
      audio.onpause = () => {
        console.log(`[PHONEME_PLAY] ⏸️ Audio.onpause`);
      };
      
      audio.onerror = (e) => {
        console.error(`\n[PHONEME_PLAY] ❌ AUDIO ERROR ❌`);
        console.error(`[PHONEME_PLAY] URL: ${url}`);
        console.error(`[PHONEME_PLAY] Audio.error.code: ${audio.error?.code}`);
        console.error(`[PHONEME_PLAY] Audio.error.message: ${audio.error?.message}`);
        console.error(`[PHONEME_PLAY] NetworkState: ${audio.networkState} (0=empty, 1=idle, 2=loading, 3=loaded)`);
        console.error(`[PHONEME_PLAY] ReadyState: ${audio.readyState} (0=uninitialized, 1=metadata, 2=current data, 3=future data, 4=enough data)`);
        console.error(`[PHONEME_PLAY] ❌ ❌ ❌\n`);
        reject(new Error(`Audio playback failed for ${lang}-${phoneme}: ${audio.error?.message || 'Unknown error'}`));
      };
      
      audio.onloadedmetadata = () => {
        console.log(`[PHONEME_PLAY] ✅ Audio.onloadedmetadata - duration: ${audio.duration}s`);
      };
      
      // Set source and attempt to load
      console.log(`[PHONEME_PLAY] Setting audio.src to: ${url}`);
      audio.src = url;

      console.log(`[PHONEME_PLAY] Calling audio.load()`);
      audio.load();

      // Wait for sufficient buffering before playing
      const attemptPlay = async () => {
        // Wait for canplaythrough or timeout
        const bufferTimeout = setTimeout(() => {
          if (!canPlayThrough) {
            console.log(`[PHONEME_PLAY] ⚠️ Proceeding without full buffer after 500ms`);
          }
        }, 500);

        // Small delay to ensure buffering starts
        await new Promise(r => setTimeout(r, 100));
        clearTimeout(bufferTimeout);

        console.log(`[PHONEME_PLAY] Calling audio.play()`);
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`[PHONEME_PLAY] ▶️ play() promise resolved - audio is playing`);
            })
            .catch(playErr => {
              console.error(`[PHONEME_PLAY] ❌ play() promise rejected:`, playErr.message);
              reject(playErr);
            });
        }
      };

      attemptPlay();
      
    } catch (err) {
      console.error(`[PHONEME_PLAY] ❌ Exception in playSinglePhoneme:`, err);
      reject(err);
    }
  });
}