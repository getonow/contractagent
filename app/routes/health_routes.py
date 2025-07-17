import os
import sys
import time
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.health_service import check_database_connections

router = APIRouter()

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str
    version: str
    databases: dict
    uptime: float

class DetailedHealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str
    version: str
    environment: str
    databases: dict
    system: dict

@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Basic health check endpoint
    """
    try:
        health_status = await check_database_connections()
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now().isoformat(),
            service="CONTRACTEXTRACT AI Agent",
            version="1.0.0",
            databases=health_status,
            uptime=time.time()  # Simplified uptime calculation
        )
    except Exception as error:
        print(f"Health check failed: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "service": "CONTRACTEXTRACT AI Agent",
                "error": str(error),
                "uptime": time.time()  # Simplified uptime calculation
            }
        )

@router.get("/detailed", response_model=DetailedHealthResponse)
async def detailed_health_check():
    """
    Detailed health check with system information
    """
    try:
        health_status = await check_database_connections()
        # Use simple placeholders for memory and cpu
        memory_usage = {
            "total": "N/A",
            "available": "N/A",
            "percent": "N/A"
        }
        cpu_info = {
            "count": "N/A",
            "percent": "N/A"
        }
        return DetailedHealthResponse(
            status="healthy",
            timestamp=datetime.now().isoformat(),
            service="CONTRACTEXTRACT AI Agent",
            version="1.0.0",
            environment=os.getenv("NODE_ENV", "development"),
            databases=health_status,
            system={
                "uptime": time.time(),  # Simplified uptime calculation
                "memory": memory_usage,
                "cpu": cpu_info,
                "platform": os.name,
                "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
            }
        )
    except Exception as error:
        print(f"Detailed health check failed: {error}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "service": "CONTRACTEXTRACT AI Agent",
                "error": str(error),
                "uptime": time.time()  # Simplified uptime calculation
            }
        ) 