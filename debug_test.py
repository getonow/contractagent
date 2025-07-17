#!/usr/bin/env python3
"""
Debug test script to isolate where the hanging occurs
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_supabase_connection():
    """Test Supabase connection"""
    print("🔍 Testing Supabase connection...")
    
    try:
        from app.services.supabase_service import get_part_information
        
        print("✅ Supabase service imported successfully")
        print(f"🔑 Supabase URL: {os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'NOT SET')}")
        print(f"🔑 Supabase Key: {os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NOT SET')[:20]}...")
        
        print("🔍 Calling get_part_information...")
        result = await get_part_information("PA-10183")
        
        if result:
            print(f"✅ Supabase query successful: {result['suppliername']}")
        else:
            print("❌ Supabase query returned None")
            
    except Exception as e:
        print(f"❌ Supabase test failed: {e}")
        import traceback
        traceback.print_exc()

async def test_astra_connection():
    """Test Astra connection"""
    print("\n🔍 Testing Astra connection...")
    
    try:
        from app.services.astra_service import get_contract_information
        
        print("✅ Astra service imported successfully")
        print(f"🔑 Astra Endpoint: {os.getenv('ASTRA_DB_ENDPOINT', 'NOT SET')}")
        print(f"🔑 Astra Token: {os.getenv('ASTRA_DB_TOKEN', 'NOT SET')[:20]}...")
        
        print("🔍 Calling get_contract_information...")
        result = await get_contract_information("Test Supplier")
        
        print(f"✅ Astra query successful: {len(result) if result else 0} contracts found")
            
    except Exception as e:
        print(f"❌ Astra test failed: {e}")
        import traceback
        traceback.print_exc()

async def test_ai_service():
    """Test AI service"""
    print("\n🔍 Testing AI service...")
    
    try:
        from app.services.ai_service import analyze_with_ai
        
        print("✅ AI service imported successfully")
        print(f"🔑 OpenAI Key: {os.getenv('OPENAI_API_KEY', 'NOT SET')[:20]}...")
        
        # Mock data for testing
        mock_part_info = {
            'suppliername': 'Test Supplier',
            'PartNumber': 'PA-10183',
            'partname': 'Test Part'
        }
        mock_contract_info = [{'content': 'Test contract content'}]
        
        print("🔍 Calling analyze_with_ai...")
        result = await analyze_with_ai(mock_part_info, mock_contract_info)
        
        print(f"✅ AI analysis successful: {type(result)}")
            
    except Exception as e:
        print(f"❌ AI test failed: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """Run all tests"""
    print("🧪 Starting debug tests...")
    print("=" * 50)
    
    # Test each service individually
    await test_supabase_connection()
    await test_astra_connection()
    await test_ai_service()
    
    print("\n" + "=" * 50)
    print("🏁 Debug tests completed")

if __name__ == "__main__":
    asyncio.run(main()) 