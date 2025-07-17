from dotenv import load_dotenv
load_dotenv()
import os
import time
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import uvicorn

# Uncomment router imports
default_imports = True
from app.routes import contract_routes, health_routes
# from app.services.health_service import check_database_connections

# Pydantic models for request/response validation
class ContractAnalysisRequest(BaseModel):
    partNumber: str = Field(..., description="Part number in format PA-XXXXX")
    
    @validator('partNumber')
    def validate_part_number(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError('Part number must be a non-empty string')
        
        if not v.startswith('PA-'):
            raise ValueError('Part number must start with "PA-" prefix')
        
        if len(v) != 8:
            raise ValueError(f'Part number must be exactly 8 characters long (got {len(v)})')
        
        suffix = v[3:]  # Remove "PA-" prefix
        if not suffix.isdigit() or len(suffix) != 5:
            raise ValueError('Part number suffix must be exactly 5 digits')
        
        return v.upper().strip()

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting CONTRACTEXTRACT AI Agent server...")
    yield
    # Shutdown
    print("🛑 Shutting down CONTRACTEXTRACT AI Agent server...")

# Create FastAPI app
app = FastAPI(
    title="CONTRACTEXTRACT AI Agent API",
    description="AI-powered contract analysis and risk assessment",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request details
    print(f"\n{'='*60}")
    print(f"📥 INCOMING REQUEST: {datetime.now().isoformat()}")
    print(f"🌐 Method: {request.method}")
    print(f"🔗 URL: {request.url}")
    print(f"👤 Origin: {request.headers.get('origin', 'Unknown')}")
    print(f"🔑 User-Agent: {request.headers.get('user-agent', 'Unknown')}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    print(f"📤 RESPONSE: {response.status_code} - Processed in {process_time:.4f} seconds")
    print(f"{'='*60}\n")
    
    return response

# Include routers
app.include_router(contract_routes.router, prefix="/api/contracts", tags=["contracts"])
app.include_router(health_routes.router, prefix="/api/health", tags=["health"])

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    return {
        "message": "CONTRACTEXTRACT AI Agent API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "contractAnalysis": "/api/contracts/analyze"
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(
        "main_debug:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload for debugging
        log_level="info"
    ) 