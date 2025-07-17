import os
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.contract_service import analyze_contract, get_analysis_metadata
from app.utils.validation import validate_part_number, sanitize_part_number
from app.utils.exceptions import ContractAnalysisError

router = APIRouter()

# Pydantic models
class ContractAnalysisRequest(BaseModel):
    partNumber: str

class StatusResponse(BaseModel):
    partNumber: str
    status: str
    timestamp: str

class FormatsResponse(BaseModel):
    supportedFormats: List[dict]
    validationRules: dict

@router.post("/analyze")
async def analyze_contract_endpoint(request: ContractAnalysisRequest):
    """
    Analyze contract for a given part number
    """
    try:
        # Validate part number format
        validation_result = validate_part_number(request.partNumber)
        if not validation_result["is_valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Invalid part number format",
                    "message": validation_result["message"],
                    "partNumber": request.partNumber,
                    "suggestions": [
                        "Ensure part number starts with 'PA-'",
                        "Ensure part number is exactly 8 characters long",
                        "Ensure suffix is exactly 5 digits"
                    ]
                }
            )

        print(f"🔍 Starting analysis for part number: {request.partNumber}")
        
        # Perform the analysis
        analysis_result = await analyze_contract(request.partNumber)
        
        return {
            "success": True,
            "partNumber": request.partNumber,
            "timestamp": datetime.now().isoformat(),
            "analysis": analysis_result
        }

    except ContractAnalysisError as error:
        print(f"Contract analysis error: {error}")
        
        # Handle specific error codes
        if hasattr(error, 'code') and error.code == "PART_NOT_FOUND":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "Part not found",
                    "message": str(error),
                    "partNumber": request.partNumber,
                    "suggestions": [
                        "Verify the part number is correct",
                        "Check if the part exists in the system"
                    ]
                }
            )
        elif hasattr(error, 'code') and error.code == "CONTRACTS_NOT_FOUND":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "No contracts found",
                    "message": str(error),
                    "partNumber": request.partNumber,
                    "supplier": getattr(error, 'supplier', 'Unknown'),
                    "suggestions": [
                        "Check if contracts exist for this supplier",
                        "Verify supplier information"
                    ]
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "Analysis failed",
                    "message": str(error),
                    "partNumber": request.partNumber
                }
            )
            
    except HTTPException:
        raise
    except Exception as error:
        print(f"Unexpected error during analysis: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal server error",
                "message": "An unexpected error occurred during analysis",
                "partNumber": request.partNumber
            }
        )

@router.get("/status/{part_number}", response_model=StatusResponse)
async def get_analysis_status(part_number: str):
    """
    Get analysis status for a part number
    """
    try:
        # Validate part number format
        validation_result = validate_part_number(part_number)
        if not validation_result["is_valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Invalid part number format",
                    "message": validation_result["message"]
                }
            )

        # This could be extended to check analysis status from a cache or database
        return StatusResponse(
            partNumber=part_number,
            status="completed",  # This would be dynamic in a real implementation
            timestamp=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as error:
        print(f"Status check error: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Status check failed",
                "message": str(error)
            }
        )

@router.get("/formats", response_model=FormatsResponse)
async def get_supported_formats():
    """
    Get supported part number formats
    """
    return FormatsResponse(
        supportedFormats=[
            {
                "pattern": "PA-XXXXX",
                "description": "Company part numbers where XXXXX is a 5-digit number",
                "examples": ["PA-10183", "PA-20045", "PA-99999"]
            }
        ],
        validationRules={
            "prefix": "PA-",
            "suffix": "5-digit number",
            "totalLength": 8,
            "regex": "/^PA-\\d{5}$/"
        }
    )

@router.post("/test-simple")
async def test_simple_endpoint():
    """
    Simple test endpoint to verify server responsiveness
    """
    print("🧪 Simple test endpoint called")
    return {"message": "Simple test successful", "timestamp": "2025-07-16T03:45:00"} 