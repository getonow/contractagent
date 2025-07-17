from dotenv import load_dotenv
load_dotenv()
import os
import time
import psutil
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

# Load environment variables FIRST
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import uvicorn

from app.routes import contract_routes, health_routes
from app.services.health_service import check_database_connections

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

class ContractAnalysisResponse(BaseModel):
    success: bool
    partNumber: str
    timestamp: str
    analysis: dict

class ErrorResponse(BaseModel):
    error: str
    message: str
    partNumber: Optional[str] = None
    suggestions: Optional[List[str]] = None

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
    allow_origins=["*"] if os.getenv("NODE_ENV") != "production" else [
        "https://preview-05fcvr4e--ai-procure-optimize-5.deploypad.app",
        "https://preview-22p47wvh--ai-procure-optimize-5.deploypad.app",
        "https://*.deploypad.app",  # All deploypad subdomains
        "https://*.railway.app",   # Railway domains
        "https://*.vercel.app",    # Vercel domains
        "https://*.netlify.app",   # Netlify domains
        "https://*.herokuapp.com"  # Heroku domains
    ],
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
    
    # Don't read the body in middleware - let FastAPI handle it
    # This prevents interference with JSON parsing
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    print(f"📤 RESPONSE: {response.status_code} - Processed in {process_time:.4f} seconds")
    print(f"{'='*60}\n")
    
    return response

# Include routers
app.include_router(contract_routes.router, prefix="/api/contracts", tags=["contracts"])

# Direct health endpoint for Railway health checks
@app.get("/api/health", tags=["health"])
async def direct_health_check():
    """Direct health check endpoint for Railway"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "CONTRACTEXTRACT AI Agent",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    return {
        "message": "CONTRACTEXTRACT AI Agent API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "contractAnalysis": "/api/contracts/analyze"
        }
    }



# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global error handler: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Server error",
            "message": "Internal server error" if os.getenv("NODE_ENV") == "production" else str(exc)
        }
    )

# 404 handler
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "Endpoint not found",
            "message": f"The requested endpoint {request.url.path} does not exist",
            "availableEndpoints": ["/api/health", "/api/contracts/analyze"]
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True if os.getenv("NODE_ENV") != "production" else False,
        log_level="info"
    ) 