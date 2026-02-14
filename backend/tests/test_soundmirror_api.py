"""
SoundMirror API Tests
Tests backend API endpoints for speech practice application
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://phonetic-overhaul.preview.emergentagent.com').rstrip('/')


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """API health check should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("PASS: Health check returns 200 with status 'healthy'")


class TestLanguageEndpoints:
    """Test language-related endpoints"""
    
    def test_get_languages(self):
        """Should return list of supported languages"""
        response = requests.get(f"{BASE_URL}/api/languages")
        assert response.status_code == 200
        data = response.json()
        assert "languages" in data
        assert len(data["languages"]) >= 10
        print(f"PASS: Languages endpoint returns {len(data['languages'])} languages")
    
    def test_get_english_translations(self):
        """Should return English translations"""
        response = requests.get(f"{BASE_URL}/api/translations/english")
        assert response.status_code == 200
        data = response.json()
        assert "home" in data
        assert "letter_practice" in data
        assert "word_practice" in data
        print("PASS: English translations endpoint works")
    
    def test_get_alphabet(self):
        """Should return English alphabet"""
        response = requests.get(f"{BASE_URL}/api/alphabet/english")
        assert response.status_code == 200
        data = response.json()
        assert "alphabet" in data
        assert len(data["alphabet"]) >= 26  # At least A-Z
        assert "CH" in data["alphabet"]  # Digraphs included
        print(f"PASS: Alphabet endpoint returns {len(data['alphabet'])} letters/digraphs")
    
    def test_get_practice_words(self):
        """Should return practice words for language"""
        response = requests.get(f"{BASE_URL}/api/practice-words/english")
        assert response.status_code == 200
        data = response.json()
        assert "words" in data
        assert "Hello" in data["words"]
        print(f"PASS: Practice words endpoint returns {len(data['words'])} words")


class TestPhonemeEndpoints:
    """Test phoneme-related endpoints"""
    
    def test_get_phoneme_map(self):
        """Should return phoneme to frame mapping"""
        response = requests.get(f"{BASE_URL}/api/phoneme-map")
        assert response.status_code == 200
        data = response.json()
        assert "phoneme_map" in data
        # Check some known phonemes
        pmap = data["phoneme_map"]
        assert "ah" in pmap or "a" in pmap
        print(f"PASS: Phoneme map endpoint returns {len(pmap)} phoneme mappings")
    
    def test_get_frame_info(self):
        """Should return frame information"""
        response = requests.get(f"{BASE_URL}/api/frame-info")
        assert response.status_code == 200
        data = response.json()
        assert "frames" in data
        assert len(data["frames"]) >= 19  # Expected 20 frames (0-19)
        print(f"PASS: Frame info endpoint returns {len(data['frames'])} frames")
    
    def test_phoneme_detection_endpoint(self):
        """Should accept phoneme detection request (Allosaurus bridge)"""
        # Send minimal PCM data to test endpoint availability
        payload = {
            "pcmData": [0.1, 0.2, 0.3, 0.4, 0.5] * 100,  # Short audio sample
            "sampleRate": 16000,
            "language": "english"
        }
        response = requests.post(f"{BASE_URL}/api/phoneme/detect", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "ipaSequence" in data
        assert "durationMs" in data
        print(f"PASS: Phoneme detection endpoint returns ipaSequence (length: {len(data['ipaSequence'])})")
    
    def test_phoneme_to_frame(self):
        """Should return frame for a phoneme"""
        response = requests.get(f"{BASE_URL}/api/phoneme-to-frame/ah")
        assert response.status_code == 200
        data = response.json()
        assert "phoneme" in data
        assert "frame" in data
        assert data["phoneme"] == "ah"
        print(f"PASS: Phoneme 'ah' maps to frame {data['frame']}")
    
    def test_word_to_frames(self):
        """Should return frame sequence for a word"""
        payload = {"word": "hello"}
        response = requests.post(f"{BASE_URL}/api/word-to-frames", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "word" in data
        assert "frames" in data
        assert len(data["frames"]) > 0
        print(f"PASS: Word 'hello' generates {len(data['frames'])} frames")


class TestAudioEndpoints:
    """Test audio-related endpoints"""
    
    def test_get_letter_audio(self):
        """Should return audio URL for a letter"""
        response = requests.get(f"{BASE_URL}/api/audio/letter/a", params={"language": "english"})
        assert response.status_code == 200
        data = response.json()
        assert "letter" in data
        assert "phoneme" in data
        assert "audio_url" in data
        print(f"PASS: Letter audio endpoint returns audio URL for 'a'")
    
    def test_get_phoneme_audio(self):
        """Should return audio URL for a phoneme"""
        response = requests.get(f"{BASE_URL}/api/audio/phoneme/ah", params={"language": "english"})
        assert response.status_code == 200
        data = response.json()
        assert "phoneme" in data
        assert "audio_url" in data
        print(f"PASS: Phoneme audio endpoint returns audio URL for 'ah'")


class TestSessionEndpoints:
    """Test practice session CRUD endpoints"""
    
    @pytest.fixture
    def created_session_id(self):
        """Create a test session and return its ID"""
        payload = {
            "session_type": "word",
            "target": "TEST_hello",
            "language": "english",
            "visual_score": 85.0,
            "audio_score": 90.0,
            "phoneme_detected": "h e l o",
            "suggestions": ["Keep practicing"]
        }
        response = requests.post(f"{BASE_URL}/api/sessions", json=payload)
        assert response.status_code == 200
        data = response.json()
        yield data["id"]
        
        # Cleanup: Delete test session
        requests.delete(f"{BASE_URL}/api/sessions/{data['id']}")
    
    def test_create_session(self, created_session_id):
        """Should create a practice session"""
        assert created_session_id is not None
        print(f"PASS: Session created with ID: {created_session_id}")
    
    def test_get_sessions(self, created_session_id):
        """Should retrieve list of sessions"""
        response = requests.get(f"{BASE_URL}/api/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Find our test session
        test_sessions = [s for s in data if s.get("target") == "TEST_hello"]
        assert len(test_sessions) > 0
        print(f"PASS: Retrieved sessions list, found {len(test_sessions)} test sessions")
    
    def test_get_session_by_id(self, created_session_id):
        """Should retrieve session by ID"""
        response = requests.get(f"{BASE_URL}/api/sessions/{created_session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == created_session_id
        assert data["target"] == "TEST_hello"
        print(f"PASS: Retrieved session by ID: {created_session_id}")
    
    def test_delete_session(self):
        """Should delete a session"""
        # First create a session to delete
        payload = {
            "session_type": "letter",
            "target": "TEST_delete_me",
            "language": "english"
        }
        create_response = requests.post(f"{BASE_URL}/api/sessions", json=payload)
        assert create_response.status_code == 200
        session_id = create_response.json()["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/sessions/{session_id}")
        assert delete_response.status_code == 200
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/sessions/{session_id}")
        assert get_response.status_code == 404
        print(f"PASS: Session deleted and verified")


class TestGradingEndpoint:
    """Test grading endpoint"""
    
    def test_grade_attempt(self):
        """Should return grading response (mock or AI)"""
        payload = {
            "target_phoneme": "hello",
            "language": "english"
        }
        response = requests.post(f"{BASE_URL}/api/grade", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "visual_score" in data
        assert "audio_score" in data
        assert "phoneme_detected" in data
        assert "overall_suggestions" in data
        print(f"PASS: Grading endpoint returns scores (visual: {data['visual_score']}, audio: {data['audio_score']})")


class TestBugReportEndpoints:
    """Test bug report endpoints"""
    
    def test_create_bug_report(self):
        """Should create a bug report (MOCKED email)"""
        payload = {
            "platform": "Windows",
            "page": "Word Practice",
            "severity": "Low",
            "feature_area": "UI",
            "description": "TEST_bug_report - This is a test bug report for API testing",
            "browser": "Chrome",
            "os_info": "Windows 10"
        }
        response = requests.post(f"{BASE_URL}/api/bug-reports", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["description"] == payload["description"]
        print(f"PASS: Bug report created with ID: {data['id']} (email is MOCKED)")
    
    def test_get_bug_reports(self):
        """Should retrieve bug reports list"""
        response = requests.get(f"{BASE_URL}/api/bug-reports")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Bug reports endpoint returns {len(data)} reports")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
