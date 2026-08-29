# Nuclear Fix Implementation Report (Phase 1 — English Only)

Date: 2026-03-31
Owner: Base44

Overview
- Goal: Transition to the pure delegation architecture where each Language Pack owns timing, assets, and TTS speed. Lock runtime to English-only until validated.
- Status: English pack is now the single source of truth for TTS speed (0.4). English-only lock is enforced at runtime. DualHeadAnimation already prefers pack-owned sprite URLs and falls back to the legacy global cache.

What Was Done
1) Pack-owned TTS speed (single source of truth)
   - Verified English manifest sets speechRate: 0.4 (components/languagepacks/en_us/manifest).
   - English pack exposes getTTSRate() which returns manifest.speechRate, matching 0.4.
   - Practice page uses only the active pack’s getTTSRate() (via __packRate()) for BOTH Google TTS requests and the browser fallback (SpeechSynthesisUtterance), ensuring identical speed.
   - googleTTS function docs updated to clarify speakingRate is required and must come from the active pack.

2) English-only runtime lock
   - PluginProvider keeps ENGLISH_ONLY set to true, forcing active practice pack to English regardless of UI/native selections. This guarantees validation on a single pack before enabling others.

3) Architecture alignment (no behavioral regressions)
   - DualHeadAnimation first attempts pack-owned getFrontFrameUrls()/getSideFrameUrls(), and only falls back to the legacy SpritePreloadContext cache if the pack doesn’t provide them yet.
   - Audio playback rate remains 1.0; the generated audio content already encodes the 0.4 speed from the pack, avoiding double-scaling.

Validation
- English TTS: speakingRate propagated as 0.4 to googleTTS and to fallback utterance.rate.
- Playback: Verified Play path uses the pack’s rate; no separate slow/fast toggles interfere.
- Language lock: Switching UI/practice language leaves English pack active.

Open Items (Next Steps to Complete the Nuclear Fix)
1) Asset ownership by pack (remove legacy preload fallback)
   - Implement getFrontFrameUrls()/getSideFrameUrls() in English pack to source frame URLs directly (e.g., from AnimationAsset entity) with light caching.
   - Once verified, deprecate SpritePreloadContext and remove the global preload path.

2) Contract hardening & telemetry
   - Add lightweight runtime assertion that speakingRate was supplied to googleTTS by the frontend.
   - Optional: log a warning if getTTSRate() is absent or non-numeric on any pack.

3) Multi-pack rollout (after English validation)
   - Replicate the 0.4 (or language-specific) speechRate in other packs’ manifests.
   - Re-enable non-English packs by disabling the ENGLISH_ONLY gate and validating each pack’s asset URLs and timing contract.

4) Provider options alignment
   - Ensure each pack’s Provider options reflect its speechRate and default voice and are not overridden by shared-layer guesses.

Cut Scope (Explicitly Not Done in This Phase)
- Migrating English sprite assets into pack getters (kept fallback intact to avoid breaking animation while we validate rate and lock).
- Enabling any non-English runtime.

Summary
English runtime is stable on the new architecture with 0.4 as the single source of truth for TTS speed across Google TTS and the fallback. The remaining work is to migrate sprite assets into the English pack (then remove the legacy preload), add safeguards, and only then re-open other packs.