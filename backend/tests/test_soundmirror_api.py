"""
SoundMirror API Tests - Testing animation, grading, and core endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Test health check and basic API endpoints"""
    
    def test_health_check(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_root_endpoint(self):
        """Test /api/ root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "SoundMirror" in data["message"]
        print("✓ Root endpoint passed")


class TestLanguageEndpoints:
    """Test language-related endpoints"""
    
    def test_get_languages(self):
        """Test /api/languages endpoint"""
        response = requests.get(f"{BASE_URL}/api/languages")
        assert response.status_code == 200
        data = response.json()
        assert "languages" in data
        assert len(data["languages"]) >= 10
        # Check for expected languages
        lang_codes = [l["code"] for l in data["languages"]]
        assert "english" in lang_codes
        assert "spanish" in lang_codes
        print(f"✓ Languages endpoint returned {len(data['languages'])} languages")
    
    def test_get_translations_english(self):
        """Test /api/translations/english endpoint"""
        response = requests.get(f"{BASE_URL}/api/translations/english")
        assert response.status_code == 200
        data = response.json()
        assert "home" in data
        assert "letter_practice" in data
        assert "word_practice" in data
        print("✓ English translations loaded")
    
    def test_get_translations_invalid(self):
        """Test /api/translations with invalid language"""
        response = requests.get(f"{BASE_URL}/api/translations/invalid_lang")
        assert response.status_code == 404
        print("✓ Invalid language returns 404")
    
    def test_get_alphabet_english(self):
        """Test /api/alphabet/english endpoint"""
        response = requests.get(f"{BASE_URL}/api/alphabet/english")
        assert response.status_code == 200
        data = response.json()
        assert "alphabet" in data
        assert "A" in data["alphabet"]
        assert "Z" in data["alphabet"]
        # Check for digraphs
        assert "CH" in data["alphabet"]
        assert "SH" in data["alphabet"]
        assert "TH" in data["alphabet"]
        print(f"✓ English alphabet has {len(data['alphabet'])} characters")
    
    def test_get_practice_words(self):
        """Test /api/practice-words/english endpoint"""
        response = requests.get(f"{BASE_URL}/api/practice-words/english")
        assert response.status_code == 200
        data = response.json()
        assert "words" in data
        assert len(data["words"]) > 0
        print(f"✓ Practice words returned {len(data['words'])} words")


class TestPhonemeEndpoints:
    """Test phoneme-related endpoints"""
    
    def test_get_phoneme_map(self):
        """Test /api/phoneme-map endpoint"""
        response = requests.get(f"{BASE_URL}/api/phoneme-map")
        assert response.status_code == 200
        data = response.json()
        assert "phoneme_map" in data
        # Check some expected phoneme mappings
        phoneme_map = data["phoneme_map"]
        assert "a" in phoneme_map
        assert "b" in phoneme_map
        assert "sh" in phoneme_map
        print(f"✓ Phoneme map has {len(phoneme_map)} entries")
    
    def test_get_frame_info(self):
        """Test /api/frame-info endpoint"""
        response = requests.get(f"{BASE_URL}/api/frame-info")
        assert response.status_code == 200
        data = response.json()
        assert "frames" in data
        assert len(data["frames"]) >= 19  # Should have at least 19 frames (0-18)
        # Check frame structure
        first_frame = data["frames"][0]
        assert "frame" in first_frame
        assert "name" in first_frame
        assert "phonemes" in first_frame
        print(f"✓ Frame info has {len(data['frames'])} frames")
    
    def test_phoneme_to_frame(self):
        """Test /api/phoneme-to-frame/{phoneme} endpoint"""
        # Test vowel
        response = requests.get(f"{BASE_URL}/api/phoneme-to-frame/a")
        assert response.status_code == 200
        data = response.json()
        assert "phoneme" in data
        assert "frame" in data
        assert data["frame"] == 1  # 'a' maps to frame 1
        
        # Test consonant
        response = requests.get(f"{BASE_URL}/api/phoneme-to-frame/sh")
        assert response.status_code == 200
        data = response.json()
        assert data["frame"] == 12  # 'sh' maps to frame 12
        print("✓ Phoneme to frame mapping works correctly")
    
    def test_word_to_frames(self):
        """Test /api/word-to-frames endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/word-to-frames",
            json={"word": "hello"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "word" in data
        assert "frames" in data
        assert len(data["frames"]) > 0
        # Check frame structure
        for frame in data["frames"]:
            assert "char" in frame
            assert "frame" in frame
        print(f"✓ Word 'hello' converted to {len(data['frames'])} frames")


class TestGradingAPI:
    """Test the grading API - core feature for pronunciation assessment"""
    
    def test_grade_basic_phoneme(self):
        """Test /api/grade with basic phoneme"""
        response = requests.post(
            f"{BASE_URL}/api/grade",
            json={
                "target_phoneme": "a",
                "language": "english"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check all required fields are present
        assert "visual_score" in data
        assert "audio_score" in data
        assert "phoneme_detected" in data
        assert "lip_feedback" in data
        assert "jaw_feedback" in data
        assert "tongue_feedback" in data
        assert "timing_feedback" in data
        assert "overall_suggestions" in data
        
        # Check score ranges
        assert 0 <= data["visual_score"] <= 100
        assert 0 <= data["audio_score"] <= 100
        
        # Check suggestions is a list
        assert isinstance(data["overall_suggestions"], list)
        print(f"✓ Grading API returned visual_score={data['visual_score']}, audio_score={data['audio_score']}")
    
    def test_grade_consonant(self):
        """Test grading with consonant phoneme"""
        response = requests.post(
            f"{BASE_URL}/api/grade",
            json={
                "target_phoneme": "sh",
                "language": "english"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "phoneme_detected" in data
        assert "lip_feedback" in data
        print(f"✓ Consonant 'sh' grading: detected={data['phoneme_detected']}")
    
    def test_grade_different_languages(self):
        """Test grading with different languages"""
        languages = ["english", "spanish", "french"]
        for lang in languages:
            response = requests.post(
                f"{BASE_URL}/api/grade",
                json={
                    "target_phoneme": "a",
                    "language": lang
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert "visual_score" in data
            print(f"✓ Grading works for language: {lang}")
    
    def test_grade_with_audio_data(self):
        """Test grading with mock audio data (base64)"""
        # Mock audio data (empty base64)
        mock_audio = "SGVsbG8gV29ybGQ="  # "Hello World" in base64
        response = requests.post(
            f"{BASE_URL}/api/grade",
            json={
                "target_phoneme": "b",
                "audio_data": mock_audio,
                "language": "english"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "audio_score" in data
        print(f"✓ Grading with audio data works: audio_score={data['audio_score']}")


class TestAudioEndpoints:
    """Test audio-related endpoints"""
    
    def test_get_letter_audio(self):
        """Test /api/audio/letter/{letter} endpoint"""
        response = requests.get(f"{BASE_URL}/api/audio/letter/a?language=english")
        # May return 404 if audio file doesn't exist in S3
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert "letter" in data
            assert "phoneme" in data
            assert "audio_url" in data
            print(f"✓ Letter audio URL retrieved for 'a'")
        else:
            print("✓ Letter audio endpoint returns 404 (audio file not in S3)")
    
    def test_get_available_audio(self):
        """Test /api/audio/available/{language} endpoint"""
        response = requests.get(f"{BASE_URL}/api/audio/available/english")
        assert response.status_code == 200
        data = response.json()
        assert "language" in data
        assert "available_phonemes" in data
        assert "count" in data
        print(f"✓ Available audio: {data['count']} phonemes for English")


class TestSessionEndpoints:
    """Test practice session CRUD endpoints"""
    
    def test_create_and_get_session(self):
        """Test creating and retrieving a practice session"""
        # Create session
        session_data = {
            "session_type": "letter",
            "target": "TEST_A",
            "language": "english",
            "visual_score": 85.5,
            "audio_score": 78.2,
            "phoneme_detected": "a",
            "suggestions": ["Practice more", "Good progress"]
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/sessions",
            json=session_data
        )
        assert create_response.status_code == 200
        created = create_response.json()
        assert "id" in created
        session_id = created["id"]
        
        # Verify data
        assert created["target"] == "TEST_A"
        assert created["visual_score"] == 85.5
        print(f"✓ Session created with id: {session_id}")
        
        # Get session
        get_response = requests.get(f"{BASE_URL}/api/sessions/{session_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["id"] == session_id
        assert fetched["target"] == "TEST_A"
        print(f"✓ Session retrieved successfully")
        
        # Delete session (cleanup)
        delete_response = requests.delete(f"{BASE_URL}/api/sessions/{session_id}")
        assert delete_response.status_code == 200
        print(f"✓ Session deleted successfully")
    
    def test_get_sessions_list(self):
        """Test getting list of sessions"""
        response = requests.get(f"{BASE_URL}/api/sessions?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Sessions list returned {len(data)} sessions")


class TestBugReportEndpoints:
    """Test bug report endpoints"""
    
    def test_create_bug_report(self):
        """Test creating a bug report"""
        report_data = {
            "platform": "Windows",
            "page": "Letter Practice",
            "severity": "Low",
            "feature_area": "Animation",
            "description": "TEST_BUG: This is a test bug report",
            "browser": "Chrome",
            "os_info": "Windows 10"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bug-reports",
            json=report_data
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["description"] == "TEST_BUG: This is a test bug report"
        print(f"✓ Bug report created with id: {data['id']}")
    
    def test_get_bug_reports(self):
        """Test getting bug reports list"""
        response = requests.get(f"{BASE_URL}/api/bug-reports?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Bug reports list returned {len(data)} reports")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
