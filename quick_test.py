#!/usr/bin/env python3
"""
Quick test to verify contract analysis works
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services.contract_service import analyze_contract

async def test_contract_analysis():
    """Test the contract analysis function"""
    print("🧪 Testing contract analysis...")
    
    try:
        result = await analyze_contract("PA-10183")
        print("✅ Contract analysis completed successfully!")
        print(f"📊 Result type: {type(result)}")
        print(f"📊 Result keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
        return True
    except Exception as e:
        print(f"❌ Contract analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_contract_analysis())
    if success:
        print("\n🎉 Test passed! The API should now work.")
    else:
        print("\n💥 Test failed! There's still an issue.") 