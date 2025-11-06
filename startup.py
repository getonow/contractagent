#!/usr/bin/env python3
"""
Startup script for CONTRACTEXTRACT AI Agent
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Main startup function"""
    print("🚀 Starting CONTRACTEXTRACT AI Agent...")
    
    # Get configuration from environment
    # Railway automatically sets PORT, default to 8080 if not set (Railway standard)
    port = int(os.getenv("PORT", 8080))
    host = os.getenv("HOST", "0.0.0.0")
    # Disable reload in production for Railway
    reload = os.getenv("NODE_ENV", "production") != "production"
    
    print(f"📊 Environment: {os.getenv('NODE_ENV', 'production')}")
    print(f"🔗 Server will run on: http://{host}:{port}")
    print(f"🔄 Auto-reload: {reload}")
    print(f"✅ Health check endpoint: http://{host}:{port}/api/health")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    main() 