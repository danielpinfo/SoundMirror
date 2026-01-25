import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Pronunciation Scoring Service
 * 
 * Scores user pronunciation attempts against target phonemes.
 * Pure stateless function: input JSON, output JSON.
 * 
 * Uses rule-based scoring (v1) that is transparent and explainable.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      word, 
      lang = "en-US", 
      targetPhonemes, 
      attemptPhonemes, 
      rawPhones = null,
      alignConfidence = 1.0 
    } = await req.json();

    if (!targetPhonemes || !Array.isArray(targetPhonemes) || targetPhonemes.length === 0) {
      return Response.json({ error: 'targetPhonemes is required' }, { status: 400 });
    }

    // Define consonants (weighted higher than vowels)
    const consonants = new Set([
      "P", "B", "T", "D", "K", "G", 
      "F", "V", "TH", "DH", 
      "S", "Z", "SH", "ZH", 
      "CH", "JH", 
      "M", "N", "NG", 
      "L", "R", "W", "Y", "HH"
    ]);

    const vowelWeight = 0.5;
    const consonantWeight = 1.0;

    // Expected durations (seconds) - rough estimates, can be tuned
    const expectedDurations = {
      vowel: 0.15,
      consonant: 0.08,
      default: 0.12
    };

    // Phoneme bucket mapping for substitution detection
    const bucketMap = {
      // TH sounds (voiced vs voiceless)
      "TH": "TH", "DH": "TH",
      // Sibilants
      "S": "S", "Z": "S",
      "SH": "SH", "ZH": "SH",
      // Affricates
      "CH": "CH", "JH": "CH",
      // Stops (voiced vs voiceless pairs)
      "P": "P", "B": "P",
      "T": "T", "D": "T",
      "K": "K", "G": "K",
      // Fricatives
      "F": "F", "V": "F",
      // Nasals
      "M": "M", "N": "N", "NG": "N"
    };

    const normalizeToBucket = (symbol) => bucketMap[symbol] || symbol;

    const overlaps = (a, b) => {
      return !(a.end <= b.start || b.end <= a.start);
    };

    const samePhonemeBucket = (target, raw) => {
      return normalizeToBucket(target) === normalizeToBucket(raw);
    };

    // Process each target phoneme
    const phonemeScores = [];
    let totalWeight = 0;
    let weightedSum = 0;
    let totalDuration = 0;

    for (let i = 0; i < targetPhonemes.length; i++) {
      const targetSymbol = targetPhonemes[i].toUpperCase();
      const issues = [];

      // Determine weight
      const isConsonant = consonants.has(targetSymbol);
      const weight = isConsonant ? consonantWeight : vowelWeight;

      // Get corresponding attempt segment
      const attempt = attemptPhonemes && i < attemptPhonemes.length ? attemptPhonemes[i] : null;

      let score = 100;

      if (!attempt) {
        // Missing segment
        score = 20;
        issues.push("missing");
      } else {
        // Track duration for meta
        const duration = attempt.end - attempt.start;
        totalDuration = Math.max(totalDuration, attempt.end);

        // Get raw symbol for substitution check
        let rawSymbol = attempt.symbol?.toUpperCase() || targetSymbol;

        // If rawPhones provided, find overlapping raw phone for more accurate detection
        if (rawPhones && Array.isArray(rawPhones)) {
          for (const rp of rawPhones) {
            if (overlaps(rp, attempt)) {
              rawSymbol = rp.symbol?.toUpperCase() || rawSymbol;
              break;
            }
          }
        }

        // Check for substitution
        if (!samePhonemeBucket(targetSymbol, rawSymbol)) {
          // More severe penalty for key sounds like TH, R, L
          const keySounds = new Set(["TH", "R", "L", "S", "SH"]);
          const penalty = keySounds.has(targetSymbol) ? 35 : 30;
          score -= penalty;
          issues.push("substitution");
        }

        // Duration check
        const expectedDuration = isConsonant ? expectedDurations.consonant : expectedDurations.vowel;
        const ratio = duration / expectedDuration;

        if (ratio < 0.3) {
          // Way too short
          score -= 20;
          issues.push("too_short");
        } else if (ratio < 0.5) {
          score -= 10;
          issues.push("short");
        } else if (ratio > 3.0) {
          // Way too long
          score -= 15;
          issues.push("too_long");
        } else if (ratio > 2.0) {
          score -= 8;
          issues.push("long");
        }

        // Use confidence from alignment if available
        if (attempt.confidence !== undefined && attempt.confidence < 0.5) {
          score -= Math.round((0.5 - attempt.confidence) * 20);
          issues.push("low_confidence");
        }

        // Floor and cap
        score = Math.max(0, Math.min(100, score));
      }

      phonemeScores.push({
        symbol: targetSymbol,
        score,
        issues,
        weight
      });

      totalWeight += weight;
      weightedSum += score * weight;
    }

    // Calculate overall score
    let overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    // Adjust by alignment confidence if very low
    if (alignConfidence !== null && alignConfidence < 0.6) {
      overallScore = Math.round(overallScore * (0.5 + alignConfidence / 2.0));
    }

    // Identify problem sounds (score < 70)
    const problemSounds = phonemeScores
      .filter(p => p.score < 70)
      .map(p => ({
        symbol: p.symbol,
        score: p.score,
        issues: p.issues
      }));

    return Response.json({
      word,
      lang,
      overallScore,
      phonemeScores,
      problemSounds,
      meta: {
        alignConfidence,
        duration: totalDuration,
        targetLen: targetPhonemes.length,
        attemptLen: attemptPhonemes?.length || 0
      }
    });

  } catch (error) {
    console.error('Scoring error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});