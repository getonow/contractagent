#!/usr/bin/env python3
"""
Test script to verify CORS configuration
"""

import requests
import json

def test_cors_configuration():
    """Test CORS configuration with various scenarios"""
    
    base_url = "http://localhost:3000"
    
    print("🧪 Testing CORS Configuration")
    print("=" * 50)
    
    # Test 1: OPTIONS preflight request
    print("\n1. Testing OPTIONS preflight request...")
    try:
        response = requests.options(f"{base_url}/api/contracts/analyze")
        print(f"✅ OPTIONS Response Status: {response.status_code}")
        print(f"📋 CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"   {header}: {value}")
    except Exception as e:
        print(f"❌ OPTIONS request failed: {e}")
    
    # Test 2: POST request with CORS headers
    print("\n2. Testing POST request with CORS headers...")
    try:
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'http://localhost:5173'
        }
        
        data = {
            "partNumber": "PA-10183"
        }
        
        response = requests.post(
            f"{base_url}/api/contracts/analyze",
            headers=headers,
            json=data
        )
        
        print(f"✅ POST Response Status: {response.status_code}")
        print(f"📋 CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"   {header}: {value}")
        
        if response.status_code == 200:
            print(f"📦 Response Body: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ Error Response: {response.text}")
            
    except Exception as e:
        print(f"❌ POST request failed: {e}")
    
    # Test 3: Root endpoint
    print("\n3. Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Root Response Status: {response.status_code}")
        if response.status_code == 200:
            print(f"📦 Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"❌ Root request failed: {e}")
    
    # Test 4: Health endpoint
    print("\n4. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"✅ Health Response Status: {response.status_code}")
        if response.status_code == 200:
            print(f"📦 Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"❌ Health request failed: {e}")

if __name__ == "__main__":
    test_cors_configuration() 