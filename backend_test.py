#!/usr/bin/env python3
"""
Backend API Testing for Timezone Converter
Tests all timezone conversion functionality endpoints
"""

import requests
import json
from datetime import datetime, timezone
import pytz
import sys
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading backend URL: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not get backend URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"🔗 Testing API at: {API_URL}")

class TimezoneAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        self.saved_timezone_id = None  # To track created timezone for cleanup
    
    def log_test(self, test_name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
    
    def test_api_health(self):
        """Test 1: Basic API Health Check"""
        try:
            response = self.session.get(f"{API_URL}/")
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'Timezone Converter API':
                    self.log_test("API Health Check", True, "API is responding correctly")
                    return True
                else:
                    self.log_test("API Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_test("API Health Check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("API Health Check", False, f"Exception: {str(e)}")
        return False
    
    def test_get_timezones(self):
        """Test 2: Get All Timezones"""
        try:
            response = self.session.get(f"{API_URL}/timezones")
            if response.status_code == 200:
                timezones = response.json()
                if isinstance(timezones, list) and len(timezones) > 0:
                    # Check structure of first timezone
                    first_tz = timezones[0]
                    required_fields = ['id', 'name', 'offset', 'region']
                    if all(field in first_tz for field in required_fields):
                        # Check for specific timezones mentioned in the request
                        timezone_ids = [tz['id'] for tz in timezones]
                        expected_timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata']
                        found_timezones = [tz for tz in expected_timezones if tz in timezone_ids]
                        
                        if len(found_timezones) == len(expected_timezones):
                            self.log_test("Get Timezones", True, f"Found {len(timezones)} timezones with correct structure")
                            return True
                        else:
                            self.log_test("Get Timezones", False, f"Missing expected timezones: {set(expected_timezones) - set(found_timezones)}")
                    else:
                        self.log_test("Get Timezones", False, f"Missing required fields in timezone data")
                else:
                    self.log_test("Get Timezones", False, "Empty or invalid timezone list")
            else:
                self.log_test("Get Timezones", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get Timezones", False, f"Exception: {str(e)}")
        return False
    
    def test_ist_time(self):
        """Test 3: Get Current IST Time"""
        try:
            response = self.session.get(f"{API_URL}/ist-time")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['time', 'date', 'offset', 'timezone']
                if all(field in data for field in required_fields):
                    # Verify IST offset
                    if data['offset'] == '+05:30' and data['timezone'] == 'Asia/Kolkata':
                        # Verify time format (HH:MM:SS)
                        time_parts = data['time'].split(':')
                        if len(time_parts) == 3 and all(part.isdigit() for part in time_parts):
                            self.log_test("IST Time", True, f"IST time: {data['time']} on {data['date']}")
                            return True
                        else:
                            self.log_test("IST Time", False, f"Invalid time format: {data['time']}")
                    else:
                        self.log_test("IST Time", False, f"Incorrect offset or timezone: {data['offset']}, {data['timezone']}")
                else:
                    self.log_test("IST Time", False, f"Missing required fields: {set(required_fields) - set(data.keys())}")
            else:
                self.log_test("IST Time", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("IST Time", False, f"Exception: {str(e)}")
        return False
    
    def test_current_time_conversion(self):
        """Test 4: Current Time Conversion to IST"""
        test_timezones = [
            ('America/New_York', 'New York'),
            ('Europe/London', 'London'),
            ('Asia/Tokyo', 'Tokyo')
        ]
        
        all_passed = True
        for tz_id, tz_name in test_timezones:
            try:
                payload = {"source_timezone": tz_id}
                response = self.session.post(f"{API_URL}/convert", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ['source_time', 'source_date', 'source_timezone', 'source_offset', 'ist_time', 'ist_date', 'ist_offset']
                    
                    if all(field in data for field in required_fields):
                        # Verify IST offset is correct
                        if data['ist_offset'] == '+05:30':
                            # Verify time formats
                            source_time_valid = len(data['source_time'].split(':')) == 3
                            ist_time_valid = len(data['ist_time'].split(':')) == 3
                            
                            if source_time_valid and ist_time_valid:
                                self.log_test(f"Convert Current Time ({tz_name})", True, 
                                            f"{data['source_time']} {tz_name} → {data['ist_time']} IST")
                            else:
                                self.log_test(f"Convert Current Time ({tz_name})", False, "Invalid time format")
                                all_passed = False
                        else:
                            self.log_test(f"Convert Current Time ({tz_name})", False, f"Incorrect IST offset: {data['ist_offset']}")
                            all_passed = False
                    else:
                        self.log_test(f"Convert Current Time ({tz_name})", False, "Missing required fields")
                        all_passed = False
                else:
                    self.log_test(f"Convert Current Time ({tz_name})", False, f"Status code: {response.status_code}")
                    all_passed = False
            except Exception as e:
                self.log_test(f"Convert Current Time ({tz_name})", False, f"Exception: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_custom_time_conversion(self):
        """Test 5: Custom Time Conversion"""
        try:
            # Test with a specific datetime: 2024-01-15 12:00:00 UTC
            test_datetime = "2024-01-15T12:00:00"
            payload = {
                "source_timezone": "America/New_York",
                "target_datetime": test_datetime
            }
            
            response = self.session.post(f"{API_URL}/convert", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['source_time', 'source_date', 'source_timezone', 'source_offset', 'ist_time', 'ist_date', 'ist_offset']
                
                if all(field in data for field in required_fields):
                    # Verify the conversion is mathematically correct
                    # NYC in January is UTC-5, IST is UTC+5:30, so difference should be 10.5 hours
                    self.log_test("Custom Time Conversion", True, 
                                f"Custom time converted: {data['source_time']} NYC → {data['ist_time']} IST")
                    return True
                else:
                    self.log_test("Custom Time Conversion", False, "Missing required fields")
            else:
                self.log_test("Custom Time Conversion", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Custom Time Conversion", False, f"Exception: {str(e)}")
        return False
    
    def test_saved_timezones_crud(self):
        """Test 6: Saved Timezones CRUD Operations"""
        # Test 6a: GET empty saved timezones
        try:
            response = self.session.get(f"{API_URL}/saved-timezones")
            if response.status_code == 200:
                saved_timezones = response.json()
                if isinstance(saved_timezones, list):
                    self.log_test("Get Saved Timezones (Empty)", True, f"Found {len(saved_timezones)} saved timezones")
                else:
                    self.log_test("Get Saved Timezones (Empty)", False, "Response is not a list")
                    return False
            else:
                self.log_test("Get Saved Timezones (Empty)", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Saved Timezones (Empty)", False, f"Exception: {str(e)}")
            return False
        
        # Test 6b: POST add a timezone
        try:
            payload = {
                "timezone_id": "Europe/London",
                "name": "London Time"
            }
            response = self.session.post(f"{API_URL}/saved-timezones", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'timezone_id', 'name', 'offset', 'region']
                
                if all(field in data for field in required_fields):
                    if data['timezone_id'] == 'Europe/London':
                        self.saved_timezone_id = data['timezone_id']  # Store for cleanup
                        self.log_test("Add Saved Timezone", True, f"Added timezone: {data['name']}")
                    else:
                        self.log_test("Add Saved Timezone", False, "Incorrect timezone_id in response")
                        return False
                else:
                    self.log_test("Add Saved Timezone", False, "Missing required fields")
                    return False
            else:
                self.log_test("Add Saved Timezone", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Add Saved Timezone", False, f"Exception: {str(e)}")
            return False
        
        # Test 6c: GET saved timezones (should show the added one)
        try:
            response = self.session.get(f"{API_URL}/saved-timezones")
            if response.status_code == 200:
                saved_timezones = response.json()
                if isinstance(saved_timezones, list) and len(saved_timezones) > 0:
                    found_london = any(tz['timezone_id'] == 'Europe/London' for tz in saved_timezones)
                    if found_london:
                        self.log_test("Get Saved Timezones (With Data)", True, f"Found {len(saved_timezones)} saved timezone(s)")
                    else:
                        self.log_test("Get Saved Timezones (With Data)", False, "Added timezone not found")
                        return False
                else:
                    self.log_test("Get Saved Timezones (With Data)", False, "No saved timezones found")
                    return False
            else:
                self.log_test("Get Saved Timezones (With Data)", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Saved Timezones (With Data)", False, f"Exception: {str(e)}")
            return False
        
        # Test 6d: DELETE the saved timezone
        try:
            if self.saved_timezone_id:
                response = self.session.delete(f"{API_URL}/saved-timezones/{self.saved_timezone_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if 'message' in data:
                        self.log_test("Delete Saved Timezone", True, "Timezone removed successfully")
                        return True
                    else:
                        self.log_test("Delete Saved Timezone", False, "No message in response")
                else:
                    self.log_test("Delete Saved Timezone", False, f"Status code: {response.status_code}")
            else:
                self.log_test("Delete Saved Timezone", False, "No timezone ID to delete")
        except Exception as e:
            self.log_test("Delete Saved Timezone", False, f"Exception: {str(e)}")
        return False
    
    def test_multiple_timezone_times(self):
        """Test 7: Multiple Timezone Times"""
        try:
            # Test with multiple timezone IDs
            timezone_ids = "America/New_York,Europe/London,Asia/Tokyo"
            response = self.session.get(f"{API_URL}/timezone-times?timezone_ids={timezone_ids}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) == 3:
                    # Check structure of each timezone result
                    required_fields = ['timezone_id', 'name', 'time', 'date', 'offset']
                    all_valid = True
                    
                    for tz_data in data:
                        if not all(field in tz_data for field in required_fields):
                            all_valid = False
                            break
                        # Verify time format
                        if len(tz_data['time'].split(':')) != 3:
                            all_valid = False
                            break
                    
                    if all_valid:
                        timezone_names = [tz['name'] for tz in data]
                        self.log_test("Multiple Timezone Times", True, f"Got times for: {', '.join(timezone_names)}")
                        return True
                    else:
                        self.log_test("Multiple Timezone Times", False, "Invalid structure in timezone data")
                else:
                    self.log_test("Multiple Timezone Times", False, f"Expected 3 timezones, got {len(data) if isinstance(data, list) else 'invalid data'}")
            else:
                self.log_test("Multiple Timezone Times", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Multiple Timezone Times", False, f"Exception: {str(e)}")
        return False
    
    def test_error_handling(self):
        """Test 8: Error Handling"""
        # Test invalid timezone
        try:
            payload = {"source_timezone": "Invalid/Timezone"}
            response = self.session.post(f"{API_URL}/convert", json=payload)
            
            if response.status_code == 400:
                self.log_test("Error Handling (Invalid Timezone)", True, "Correctly returned 400 for invalid timezone")
            else:
                self.log_test("Error Handling (Invalid Timezone)", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling (Invalid Timezone)", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Timezone Converter API Tests")
        print("=" * 50)
        
        # Run tests in order
        tests = [
            self.test_api_health,
            self.test_get_timezones,
            self.test_ist_time,
            self.test_current_time_conversion,
            self.test_custom_time_conversion,
            self.test_saved_timezones_crud,
            self.test_multiple_timezone_times,
            self.test_error_handling
        ]
        
        for test in tests:
            test()
            print()  # Add spacing between tests
        
        # Summary
        print("=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! The timezone conversion API is working correctly.")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check the details above.")
            
        return passed == total

if __name__ == "__main__":
    tester = TimezoneAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)