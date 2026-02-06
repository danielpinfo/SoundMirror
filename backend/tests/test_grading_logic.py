"""
Test script for the grading logic implementation.
This tests the articulatory feature comparison algorithm.
"""

import sys
import json

# Test cases for grading logic validation
# Format: (target_symbol, target_features, detected_symbol, detected_features, expected_score_range)

TEST_CASES = [
    # Test 1: Exact match should score 100%
    {
        "name": "Exact consonant match (p)",
        "target": {"symbol": "p", "features": {"type": "consonant", "place": "bilabial", "manner": "plosive", "voicing": False}},
        "detected": {"symbol": "p", "features": {"type": "consonant", "place": "bilabial", "manner": "plosive", "voicing": False}},
        "expected_min": 100,
        "expected_max": 100
    },
    
    # Test 2: Voicing difference only (p vs b)
    {
        "name": "Voicing difference (p vs b)",
        "target": {"symbol": "p", "features": {"type": "consonant", "place": "bilabial", "manner": "plosive", "voicing": False}},
        "detected": {"symbol": "b", "features": {"type": "consonant", "place": "bilabial", "manner": "plosive", "voicing": True}},
        "expected_min": 70,  # Place and manner match, only voicing differs
        "expected_max": 90
    },
    
    # Test 3: Place difference (p vs t - bilabial vs alveolar)
    {
        "name": "Place difference (p vs t)",
        "target": {"symbol": "p", "features": {"type": "consonant", "place": "bilabial", "manner": "plosive", "voicing": False}},
        "detected": {"symbol": "t", "features": {"type": "consonant", "place": "alveolar", "manner": "plosive", "voicing": False}},
        "expected_min": 50,
        "expected_max": 80
    },
    
    # Test 4: Exact vowel match
    {
        "name": "Exact vowel match (i)",
        "target": {"symbol": "i", "features": {"type": "vowel", "height": "close", "backness": "front", "rounding": False}},
        "detected": {"symbol": "i", "features": {"type": "vowel", "height": "close", "backness": "front", "rounding": False}},
        "expected_min": 100,
        "expected_max": 100
    },
    
    # Test 5: Vowel height difference (i vs e)
    {
        "name": "Vowel height difference (i vs e)",
        "target": {"symbol": "i", "features": {"type": "vowel", "height": "close", "backness": "front", "rounding": False}},
        "detected": {"symbol": "e", "features": {"type": "vowel", "height": "close-mid", "backness": "front", "rounding": False}},
        "expected_min": 60,
        "expected_max": 85
    },
    
    # Test 6: Type mismatch (consonant vs vowel)
    {
        "name": "Type mismatch (p vs a)",
        "target": {"symbol": "p", "features": {"type": "consonant", "place": "bilabial", "manner": "plosive", "voicing": False}},
        "detected": {"symbol": "a", "features": {"type": "vowel", "height": "open", "backness": "front", "rounding": False}},
        "expected_min": 0,
        "expected_max": 30
    },
]

def simulate_feature_comparison(target_features, detected_features):
    """
    Simplified version of the frontend grading logic for testing.
    This mimics the compareFeatures function from phonemeAnalysis.js
    """
    FEATURE_WEIGHTS = {
        "place": 30,
        "manner": 30,
        "voicing": 20,
        "nasal": 10,
        "height": 30,
        "backness": 30,
        "rounding": 20,
        "typeMatch": 10
    }
    
    score = 0
    max_possible = 0
    
    target_type = target_features.get("type")
    detected_type = detected_features.get("type")
    
    # Type match
    max_possible += FEATURE_WEIGHTS["typeMatch"]
    if target_type == detected_type:
        score += FEATURE_WEIGHTS["typeMatch"]
    
    if target_type == "consonant":
        # Place
        max_possible += FEATURE_WEIGHTS["place"]
        if target_features.get("place") == detected_features.get("place"):
            score += FEATURE_WEIGHTS["place"]
        else:
            # Partial credit for adjacent places
            place_order = ['bilabial', 'labiodental', 'dental', 'alveolar', 'postalveolar', 'palatal', 'velar', 'uvular', 'glottal']
            try:
                target_idx = place_order.index(target_features.get("place", ""))
                detected_idx = place_order.index(detected_features.get("place", ""))
                distance = abs(target_idx - detected_idx)
                if distance == 1:
                    score += int(FEATURE_WEIGHTS["place"] * 0.7)
                elif distance == 2:
                    score += int(FEATURE_WEIGHTS["place"] * 0.4)
            except ValueError:
                pass
        
        # Manner
        max_possible += FEATURE_WEIGHTS["manner"]
        if target_features.get("manner") == detected_features.get("manner"):
            score += FEATURE_WEIGHTS["manner"]
        
        # Voicing
        max_possible += FEATURE_WEIGHTS["voicing"]
        if target_features.get("voicing") == detected_features.get("voicing"):
            score += FEATURE_WEIGHTS["voicing"]
            
    elif target_type == "vowel":
        # Height
        max_possible += FEATURE_WEIGHTS["height"]
        if target_features.get("height") == detected_features.get("height"):
            score += FEATURE_WEIGHTS["height"]
        else:
            height_order = ['close', 'near-close', 'close-mid', 'mid', 'open-mid', 'near-open', 'open']
            try:
                target_idx = height_order.index(target_features.get("height", ""))
                detected_idx = height_order.index(detected_features.get("height", ""))
                distance = abs(target_idx - detected_idx)
                if distance == 1:
                    score += int(FEATURE_WEIGHTS["height"] * 0.7)
                elif distance == 2:
                    score += int(FEATURE_WEIGHTS["height"] * 0.4)
            except ValueError:
                pass
        
        # Backness
        max_possible += FEATURE_WEIGHTS["backness"]
        if target_features.get("backness") == detected_features.get("backness"):
            score += FEATURE_WEIGHTS["backness"]
        
        # Rounding
        max_possible += FEATURE_WEIGHTS["rounding"]
        if target_features.get("rounding") == detected_features.get("rounding"):
            score += FEATURE_WEIGHTS["rounding"]
    
    if max_possible == 0:
        return 0
    
    return round((score / max_possible) * 100)

def run_tests():
    """Run all test cases and report results."""
    print("=" * 60)
    print("GRADING LOGIC TEST SUITE")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test in TEST_CASES:
        target = test["target"]
        detected = test["detected"]
        
        # Check for exact match first
        if target["symbol"] == detected["symbol"]:
            score = 100
        else:
            score = simulate_feature_comparison(target["features"], detected["features"])
        
        in_range = test["expected_min"] <= score <= test["expected_max"]
        status = "PASS" if in_range else "FAIL"
        
        if in_range:
            passed += 1
        else:
            failed += 1
        
        print(f"\n[{status}] {test['name']}")
        print(f"  Target: {target['symbol']} | Detected: {detected['symbol']}")
        print(f"  Score: {score}% | Expected: {test['expected_min']}-{test['expected_max']}%")
    
    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 60)
    
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
