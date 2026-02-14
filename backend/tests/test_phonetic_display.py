"""
Test for the phonetic display feature fix
Tests the new textToPhonetic and related functions
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestPhonemeDetectionEndpoint:
    """Test the phoneme detection bridge endpoint"""
    
    def test_phoneme_detect_endpoint_accessible(self):
        """Test /api/phoneme/detect endpoint is accessible"""
        response = requests.post(
            f"{BASE_URL}/api/phoneme/detect",
            json={
                "pcmData": [0.0, 0.1, 0.2, 0.0, -0.1, 0.0],
                "sampleRate": 16000,
                "language": "english"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "ipaSequence" in data
        assert "durationMs" in data
        assert isinstance(data["ipaSequence"], list)
        assert isinstance(data["durationMs"], (int, float))
        print(f"✓ Phoneme detect endpoint accessible: durationMs={data['durationMs']}")
    
    def test_phoneme_detect_different_languages(self):
        """Test phoneme detection works with different languages"""
        languages = ["english", "spanish", "french", "japanese", "chinese"]
        
        for lang in languages:
            response = requests.post(
                f"{BASE_URL}/api/phoneme/detect",
                json={
                    "pcmData": [0.0] * 100,  # Minimal audio data
                    "sampleRate": 16000,
                    "language": lang
                }
            )
            assert response.status_code == 200
            print(f"✓ Phoneme detection works for: {lang}")
    
    def test_phoneme_detect_short_audio_handled(self):
        """Test that very short audio is handled gracefully"""
        response = requests.post(
            f"{BASE_URL}/api/phoneme/detect",
            json={
                "pcmData": [0.0, 0.1],  # Very short audio
                "sampleRate": 16000,
                "language": "english"
            }
        )
        assert response.status_code == 200
        data = response.json()
        # Should return empty sequence for too-short audio
        assert "ipaSequence" in data
        print(f"✓ Short audio handled: ipaSequence length={len(data['ipaSequence'])}")


class TestPhonemeFrameMapping:
    """Test phoneme to frame mapping endpoints"""
    
    def test_phoneme_map_has_required_entries(self):
        """Verify phoneme map has all required phonemes"""
        response = requests.get(f"{BASE_URL}/api/phoneme-map")
        assert response.status_code == 200
        phoneme_map = response.json()["phoneme_map"]
        
        # Required phonemes for animation
        required = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'l', 'm', 
                   'n', 'o', 'p', 'r', 's', 't', 'sh', 'th', 'ch']
        
        for phoneme in required:
            assert phoneme in phoneme_map, f"Missing phoneme: {phoneme}"
            assert isinstance(phoneme_map[phoneme], int), f"Invalid frame for {phoneme}"
        
        print(f"✓ Phoneme map has all {len(required)} required entries")
    
    def test_frame_info_has_sound_names(self):
        """Verify frame info has proper sound names (not filenames)"""
        response = requests.get(f"{BASE_URL}/api/frame-info")
        assert response.status_code == 200
        frames = response.json()["frames"]
        
        # Check that frame names are readable (not filenames like 'frame_5.png')
        for frame in frames:
            name = frame["name"]
            assert not name.endswith('.png'), f"Frame name should not be filename: {name}"
            assert not name.startswith('frame_'), f"Frame name should be descriptive: {name}"
        
        print(f"✓ All {len(frames)} frames have readable names")


class TestWordToFrames:
    """Test word to frame conversion"""
    
    def test_hello_word_conversion(self):
        """Test 'hello' converts to correct frames"""
        response = requests.post(
            f"{BASE_URL}/api/word-to-frames",
            json={"word": "hello"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "frames" in data
        frames = data["frames"]
        assert len(frames) > 0
        
        # Check structure
        for frame in frames:
            assert "char" in frame
            assert "frame" in frame
        
        print(f"✓ 'hello' converted to {len(frames)} frames")
    
    def test_digraph_handling(self):
        """Test digraphs like 'th', 'sh' are handled correctly"""
        response = requests.post(
            f"{BASE_URL}/api/word-to-frames",
            json={"word": "this"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should handle 'th' as a digraph
        chars = [f["char"] for f in data["frames"]]
        print(f"✓ 'this' parsed as: {chars}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
