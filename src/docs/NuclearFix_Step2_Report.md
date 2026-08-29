# Nuclear Fix — Step 2 (English Provider Ownership)

## Files changed
- pages/Practice.jsx
- components/languagepacks/en_us/provider/GoogleTTSProvider

## What authority was removed from shared app code
- Removed direct googleTTS invocation and payload construction from Practice.jsx; the page no longer decides language, voice, or speakingRate.

## What now owns live English synthesis
- The active English pack’s provider (EnglishUSTTSProvider) is the sole authority. Practice delegates via `activePracticePack.provider.synthesize()`.

## Exact path used at runtime from Play to backend
- User presses Play → Practice calls `synthesizeAudio()` → delegates to `activePracticePack.provider.synthesize(ttsText, 'en')` → provider invokes Base44 function `googleTTS` with pack-owned `{ text, language, speakingRate }` → returns audio → Practice binds audio to player at rate 1.0 and animates timeline.

## Remaining blockers, if any
- Provider still defaults to 0.4 if options are missing (aligned with English manifest but still a literal); long-term, rely solely on manifest-provided options.
- Browser speechSynthesis remains as a timeout fallback (kept intentionally); ensure it’s only used on provider failure.
- Multi-pack rollout and sprite URL ownership not addressed in this step by design; English-only lock remains.