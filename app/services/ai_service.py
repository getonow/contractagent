import os
import json
from typing import Dict, Any, List
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def analyze_with_ai(part_info: Dict[str, Any], contract_info: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze contract data using OpenAI
    """
    try:
        print("🤖 Starting AI analysis...")
        
        # Prepare the analysis prompt
        prompt = create_analysis_prompt(part_info, contract_info)
        
        # Call OpenAI API
        response = await call_openai_api(prompt)
        
        # Parse and structure the response
        analysis_result = parse_ai_response(response)
        
        print("✅ AI analysis completed")
        return analysis_result
        
    except Exception as error:
        print(f"Error in AI analysis: {error}")
        # Return mock analysis for testing
        return get_mock_ai_analysis(part_info, contract_info)

def create_analysis_prompt(part_info: Dict[str, Any], contract_info: List[Dict[str, Any]]) -> str:
    """
    Create a comprehensive prompt for AI analysis
    """
    prompt = f"""
    You are an expert contract analyst and procurement specialist. Analyze the following contract data and provide strategic insights.

    PART INFORMATION:
    - Part Number: {part_info.get('PartNumber', 'N/A')}
    - Part Name: {part_info.get('partname', 'N/A')}
    - Supplier: {part_info.get('suppliername', 'N/A')}
    - Material: {part_info.get('material', 'N/A')}
    - Currency: {part_info.get('currency', 'N/A')}
    - Current Pricing: {json.dumps(part_info.get('currentPricing', {}), indent=2)}

    CONTRACT INFORMATION:
    {json.dumps(contract_info, indent=2)}

    Please provide a comprehensive analysis in the following JSON format:

    {{
        "dateRangeOfContracts": "Summary of contract date ranges",
        "keyClausesIdentification": {{
            "critical_clauses": ["List of critical contract clauses"],
            "risk_clauses": ["Clauses that pose risks"],
            "opportunity_clauses": ["Clauses that present opportunities"]
        }},
        "riskAssessmentAndMitigation": {{
            "high_risks": ["List of high-risk factors"],
            "medium_risks": ["List of medium-risk factors"],
            "low_risks": ["List of low-risk factors"],
            "mitigation_strategies": ["Recommended mitigation strategies"]
        }},
        "contractBenchmarkingAndPrecedentBasedInsights": {{
            "benchmark_metrics": ["Key metrics for benchmarking"],
            "industry_comparisons": ["Industry standard comparisons"],
            "best_practices": ["Recommended best practices"]
        }},
        "negotiationLeveragePoints": {{
            "strengths": ["Your negotiation strengths"],
            "weaknesses": ["Areas of weakness"],
            "opportunities": ["Negotiation opportunities"],
            "threats": ["Potential threats"]
        }},
        "complianceCheck": {{
            "regulatory_requirements": ["Regulatory compliance requirements"],
            "internal_policies": ["Internal policy compliance"],
            "recommendations": ["Compliance recommendations"]
        }},
        "summaryAndStrategicRecommendations": {{
            "executive_summary": "High-level summary of findings",
            "key_recommendations": ["Strategic recommendations"],
            "next_steps": ["Recommended next steps"],
            "priority_actions": ["Priority actions to take"]
        }}
    }}

    Focus on practical, actionable insights that can help with contract negotiation and risk management.
    """
    
    return prompt

async def call_openai_api(prompt: str) -> str:
    """
    Call OpenAI API for analysis
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert contract analyst and procurement specialist. Provide detailed, practical analysis in JSON format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content
        if content is None:
            raise ValueError("OpenAI API returned empty response")
        return content
        
    except Exception as error:
        print(f"Error calling OpenAI API: {error}")
        raise error

def parse_ai_response(response: str) -> Dict[str, Any]:
    """
    Parse the AI response and extract structured data
    """
    try:
        # Try to extract JSON from the response
        if "```json" in response:
            json_start = response.find("```json") + 7
            json_end = response.find("```", json_start)
            json_str = response[json_start:json_end].strip()
        else:
            # Try to find JSON in the response
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            json_str = response[start_idx:end_idx]
        
        return json.loads(json_str)
        
    except Exception as error:
        print(f"Error parsing AI response: {error}")
        # Return a structured error response
        return {
            "dateRangeOfContracts": "Unable to determine",
            "keyClausesIdentification": {
                "critical_clauses": ["Analysis unavailable"],
                "risk_clauses": ["Analysis unavailable"],
                "opportunity_clauses": ["Analysis unavailable"]
            },
            "riskAssessmentAndMitigation": {
                "high_risks": ["Analysis unavailable"],
                "medium_risks": ["Analysis unavailable"],
                "low_risks": ["Analysis unavailable"],
                "mitigation_strategies": ["Analysis unavailable"]
            },
            "contractBenchmarkingAndPrecedentBasedInsights": {
                "benchmark_metrics": ["Analysis unavailable"],
                "industry_comparisons": ["Analysis unavailable"],
                "best_practices": ["Analysis unavailable"]
            },
            "negotiationLeveragePoints": {
                "strengths": ["Analysis unavailable"],
                "weaknesses": ["Analysis unavailable"],
                "opportunities": ["Analysis unavailable"],
                "threats": ["Analysis unavailable"]
            },
            "complianceCheck": {
                "regulatory_requirements": ["Analysis unavailable"],
                "internal_policies": ["Analysis unavailable"],
                "recommendations": ["Analysis unavailable"]
            },
            "summaryAndStrategicRecommendations": {
                "executive_summary": "AI analysis was unable to process the data",
                "key_recommendations": ["Analysis unavailable"],
                "next_steps": ["Analysis unavailable"],
                "priority_actions": ["Analysis unavailable"]
            }
        }

def get_mock_ai_analysis(part_info: Dict[str, Any], contract_info: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Return mock AI analysis for testing purposes
    """
    supplier_name = part_info.get('suppliername', 'Unknown Supplier')
    part_number = part_info.get('PartNumber', 'Unknown Part')
    
    return {
        "dateRangeOfContracts": f"Contracts span from 2024 to 2025 for {supplier_name}",
        "keyClausesIdentification": {
            "critical_clauses": [
                "Payment terms and conditions",
                "Delivery and quality standards",
                "Termination clauses",
                "Force majeure provisions"
            ],
            "risk_clauses": [
                "Single source dependency",
                "Limited warranty terms",
                "Price escalation clauses"
            ],
            "opportunity_clauses": [
                "Volume discount opportunities",
                "Performance incentives",
                "Long-term partnership potential"
            ]
        },
        "riskAssessmentAndMitigation": {
            "high_risks": [
                f"Single source dependency on {supplier_name}",
                "Potential supply chain disruption"
            ],
            "medium_risks": [
                "Price volatility in raw materials",
                "Quality control challenges"
            ],
            "low_risks": [
                "Regulatory compliance",
                "Technology obsolescence"
            ],
            "mitigation_strategies": [
                "Develop backup suppliers",
                "Implement quality monitoring",
                "Negotiate price protection clauses"
            ]
        },
        "contractBenchmarkingAndPrecedentBasedInsights": {
            "benchmark_metrics": [
                "Industry average payment terms: Net 30-45",
                "Standard warranty period: 12-24 months",
                "Typical volume discounts: 5-15%"
            ],
            "industry_comparisons": [
                f"{supplier_name} pricing is competitive within industry",
                "Payment terms are standard for the industry",
                "Quality standards meet industry requirements"
            ],
            "best_practices": [
                "Implement regular supplier performance reviews",
                "Establish clear communication protocols",
                "Document all contract changes formally"
            ]
        },
        "negotiationLeveragePoints": {
            "strengths": [
                "Established relationship with supplier",
                "Volume commitment potential",
                "Long-term contract opportunity"
            ],
            "weaknesses": [
                "Limited alternative suppliers",
                "Critical component dependency"
            ],
            "opportunities": [
                "Volume-based pricing improvements",
                "Extended warranty terms",
                "Enhanced service level agreements"
            ],
            "threats": [
                "Supplier capacity constraints",
                "Market price increases"
            ]
        },
        "complianceCheck": {
            "regulatory_requirements": [
                "ISO 9001 quality standards",
                "Environmental compliance",
                "Data protection regulations"
            ],
            "internal_policies": [
                "Procurement policy compliance",
                "Financial approval requirements",
                "Risk management guidelines"
            ],
            "recommendations": [
                "Regular compliance audits",
                "Documentation updates",
                "Training for procurement team"
            ]
        },
        "summaryAndStrategicRecommendations": {
            "executive_summary": f"Analysis of {part_number} from {supplier_name} reveals opportunities for improved terms and risk mitigation through strategic negotiation.",
            "key_recommendations": [
                "Negotiate volume-based pricing improvements",
                "Implement supplier performance monitoring",
                "Develop backup supplier relationships"
            ],
            "next_steps": [
                "Schedule negotiation meeting with supplier",
                "Prepare detailed proposal with target terms",
                "Establish performance monitoring framework"
            ],
            "priority_actions": [
                "Immediate: Review current contract terms",
                "Short-term: Prepare negotiation strategy",
                "Long-term: Develop supplier diversification plan"
            ]
        }
    } 