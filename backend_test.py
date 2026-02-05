#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class SoundMirrorAPITester:
    def __init__(self, base_url="https://speakvision.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, data: Dict[Any, Any] = None, params: Dict[str, str] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}" if not endpoint.startswith('/') else f"{self.base_url}{endpoint}"
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, params=params, timeout=15)
            elif method == 'POST':
                response = self.session.post(url, json=data, params=params, timeout=15)
            elif method == 'PUT':
                response = self.session.put(url, json=data, params=params, timeout=15)
            elif method == 'DELETE':
                response = self.session.delete(url, params=params, timeout=15)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:500]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n=== TESTING HEALTH ENDPOINTS ===")
        
        # Test root endpoint
        self.run_test("Root API", "GET", "", 200)
        
        # Test health check
        self.run_test("Health Check", "GET", "health", 200)

    def test_language_endpoints(self):
        """Test language-related endpoints"""
        print("\n=== TESTING LANGUAGE ENDPOINTS ===")
        
        # Test languages list
        success, response = self.run_test("Get Languages", "GET", "languages", 200)
        if success and 'languages' in response:
            languages = response['languages']
            print(f"   Found {len(languages)} languages")
            
            # Test first few languages
            for lang in languages[:3]:
                lang_code = lang['code']
                
                # Test translations
                self.run_test(f"Translations for {lang_code}", "GET", f"translations/{lang_code}", 200)
                
                # Test alphabet
                self.run_test(f"Alphabet for {lang_code}", "GET", f"alphabet/{lang_code}", 200)
                
                # Test practice words
                self.run_test(f"Practice words for {lang_code}", "GET", f"practice-words/{lang_code}", 200)

    def test_phoneme_endpoints(self):
        """Test phoneme-related endpoints"""
        print("\n=== TESTING PHONEME ENDPOINTS ===")
        
        # Test phoneme map
        self.run_test("Get Phoneme Map", "GET", "phoneme-map", 200)
        
        # Test frame info
        self.run_test("Get Frame Info", "GET", "frame-info", 200)
        
        # Test specific phoneme
        self.run_test("Get Phoneme Frame for 'a'", "GET", "phoneme-to-frame/a", 200)
        
        # Test word to frames
        word_data = {"word": "hello"}
        self.run_test("Word to Frames", "POST", "word-to-frames", 200, word_data)

    def test_session_endpoints(self):
        """Test practice session endpoints"""
        print("\n=== TESTING SESSION ENDPOINTS ===")
        
        # Test get sessions (empty initially)
        self.run_test("Get Sessions (empty)", "GET", "sessions", 200)
        
        # Create a test session
        session_data = {
            "session_type": "letter",
            "target": "A",
            "language": "english",
            "visual_score": 85.5,
            "audio_score": 78.2,
            "phoneme_detected": "a",
            "suggestions": ["Practice more", "Good job"]
        }
        
        success, response = self.run_test("Create Session", "POST", "sessions", 200, session_data)
        
        if success and 'id' in response:
            session_id = response['id']
            print(f"   Created session with ID: {session_id}")
            
            # Test get specific session
            self.run_test("Get Specific Session", "GET", f"sessions/{session_id}", 200)
            
            # Test get sessions with filters
            self.run_test("Get Sessions by Type", "GET", "sessions?session_type=letter", 200)
            self.run_test("Get Sessions by Language", "GET", "sessions?language=english", 200)
            
            # Test delete session
            self.run_test("Delete Session", "DELETE", f"sessions/{session_id}", 200)

    def test_grading_endpoint(self):
        """Test grading endpoint"""
        print("\n=== TESTING GRADING ENDPOINT ===")
        
        grading_data = {
            "target_phoneme": "a",
            "language": "english"
        }
        
        self.run_test("Grade Attempt", "POST", "grade", 200, grading_data)

    def test_bug_report_endpoints(self):
        """Test bug report endpoints"""
        print("\n=== TESTING BUG REPORT ENDPOINTS ===")
        
        # Test get bug reports (empty initially)
        self.run_test("Get Bug Reports (empty)", "GET", "bug-reports", 200)
        
        # Create a test bug report
        bug_data = {
            "platform": "Windows",
            "page": "Home",
            "severity": "Medium",
            "feature_area": "UI",
            "description": "Test bug report for API testing",
            "browser": "Chrome 120",
            "os_info": "Windows 11"
        }
        
        success, response = self.run_test("Create Bug Report", "POST", "bug-reports", 200, bug_data)
        
        if success:
            print(f"   Created bug report with ID: {response.get('id', 'unknown')}")

    def test_error_cases(self):
        """Test error handling"""
        print("\n=== TESTING ERROR CASES ===")
        
        # Test non-existent language
        self.run_test("Non-existent Language", "GET", "translations/nonexistent", 404)
        
        # Test non-existent session
        self.run_test("Non-existent Session", "GET", "sessions/nonexistent-id", 404)
        
        # Test invalid phoneme
        self.run_test("Invalid Phoneme", "GET", "phoneme-to-frame/xyz123", 200)  # Should return frame 0

def main():
    print("🚀 Starting SoundMirror API Tests")
    print("=" * 50)
    
    tester = SoundMirrorAPITester()
    
    # Run all test suites
    tester.test_health_endpoints()
    tester.test_language_endpoints()
    tester.test_phoneme_endpoints()
    tester.test_session_endpoints()
    tester.test_grading_endpoint()
    tester.test_bug_report_endpoints()
    tester.test_error_cases()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['name']}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
            else:
                print(f"   Expected: {test['expected']}, Got: {test['actual']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())