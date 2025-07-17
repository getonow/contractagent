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
    port = int(os.getenv("PORT", 3000))
    host = os.getenv("HOST", "0.0.0.0")
    reload = os.getenv("NODE_ENV") != "production"
    
    print(f"📊 Environment: {os.getenv('NODE_ENV', 'development')}")
    print(f"🔗 Server will run on: http://{host}:{port}")
    print(f"🔄 Auto-reload: {reload}")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

if __name__ == "__main__":
    main() 