from typing import Dict, Any, Optional
from app.services.supabase_service import get_part_information
from app.services.astra_service import get_contract_information
from app.services.ai_service import analyze_with_ai
from app.utils.validation import sanitize_part_number
from app.utils.exceptions import ContractAnalysisError

async def analyze_contract(part_number: str) -> Dict[str, Any]:
    """
    Main contract analysis function
    """
    try:
        # Step 1: Sanitize and validate part number
        sanitized_part_number = sanitize_part_number(part_number)
        if not sanitized_part_number:
            raise ContractAnalysisError("Invalid part number format")

        print(f"📋 Step 1: Retrieving part information for {sanitized_part_number}")
        print(f"🔍 About to call get_part_information...")

        # Step 2: Get part information from Supabase
        part_info = await get_part_information(sanitized_part_number)
        print(f"✅ get_part_information completed")
        if not part_info:
            raise ContractAnalysisError(
                f"Part number {sanitized_part_number} not found in MASTER_FILE table",
                code="PART_NOT_FOUND"
            )

        print(f"🏭 Step 2: Found supplier: {part_info['suppliername']}")
        print(f"🔍 About to call get_contract_information...")

        # Step 3: Get contract information from DataStax Astra
        contract_info = await get_contract_information(part_info['suppliername'])
        print(f"✅ get_contract_information completed")
        if not contract_info or len(contract_info) == 0:
            raise ContractAnalysisError(
                f"No contracts found for supplier: {part_info['suppliername']}",
                code="CONTRACTS_NOT_FOUND",
                supplier=part_info['suppliername']
            )

        print(f"📄 Step 3: Found {len(contract_info)} contracts for analysis")
        print(f"🔍 About to call analyze_with_ai...")

        # Step 4: Analyze with AI
        print(f"🤖 Step 4: Starting AI analysis")
        ai_analysis = await analyze_with_ai(part_info, contract_info)
        print(f"✅ analyze_with_ai completed")

        # Step 5: Structure the final response
        analysis_result = {
            "supplierOverview": {
                "supplierName": part_info['suppliername'],
                "supplierNumber": part_info['suppliernumber'],
                "supplierContact": {
                    "name": part_info['suppliercontactname'],
                    "email": part_info['suppliercontactemail']
                },
                "manufacturingLocation": part_info['suppliermanufacturinglocation'],
                "numberOfContractsFound": len(contract_info),
                "dateRangeOfContracts": ai_analysis.get('dateRangeOfContracts', 'Not specified')
            },
            "partInformation": {
                "partNumber": part_info['PartNumber'],
                "partName": part_info['partname'],
                "material": part_info['material'],
                "material2": part_info.get('material2'),
                "currency": part_info['currency']
            },
            "keyClausesIdentification": ai_analysis.get('keyClausesIdentification', {}),
            "riskAssessmentAndMitigation": ai_analysis.get('riskAssessmentAndMitigation', {}),
            "contractBenchmarkingAndPrecedentBasedInsights": ai_analysis.get('contractBenchmarkingAndPrecedentBasedInsights', {}),
            "negotiationLeveragePoints": ai_analysis.get('negotiationLeveragePoints', {}),
            "complianceCheck": ai_analysis.get('complianceCheck', {}),
            "summaryAndStrategicRecommendations": ai_analysis.get('summaryAndStrategicRecommendations', {})
        }

        print(f"✅ Analysis completed successfully for {sanitized_part_number}")

        return analysis_result

    except ContractAnalysisError:
        raise
    except Exception as error:
        print(f"Contract analysis failed: {error}")
        raise ContractAnalysisError(f"Analysis failed: {str(error)}")

async def get_analysis_metadata(part_number: str) -> Optional[Dict[str, Any]]:
    """
    Get analysis metadata for a part number
    """
    try:
        sanitized_part_number = sanitize_part_number(part_number)
        if not sanitized_part_number:
            return None
            
        part_info = await get_part_information(sanitized_part_number)
        
        if not part_info:
            return None

        return {
            "partNumber": sanitized_part_number,
            "supplierName": part_info['suppliername'],
            "lastUpdated": "2024-01-01T00:00:00Z",  # TODO: Get actual timestamp
            "analysisStatus": "available"
        }
    except Exception as error:
        print(f"Error getting analysis metadata: {error}")
        raise ContractAnalysisError(f"Failed to get metadata: {str(error)}") 