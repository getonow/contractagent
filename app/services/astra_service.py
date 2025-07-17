import os
from typing import Dict, Any, List, Optional
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider

# Astra DB configuration
ASTRA_DB_ENDPOINT = os.getenv("ASTRA_DB_ENDPOINT")
ASTRA_DB_CLIENT_ID = os.getenv("ASTRA_DB_CLIENT_ID")
ASTRA_DB_SECRET = os.getenv("ASTRA_DB_SECRET")
ASTRA_DB_TOKEN = os.getenv("ASTRA_DB_TOKEN")
ASTRA_DB_KEYSPACE = os.getenv("ASTRA_DB_KEYSPACE", "default_keyspace")
ASTRA_DB_COLLECTION = os.getenv("ASTRA_DB_COLLECTION", "contracts")

# Initialize Astra DB connection
def get_astra_client():
    """
    Get Astra DB client connection
    """
    try:
        # For now, return None to use mock data
        # The actual Astra connection needs proper configuration
        print("⚠️ Using mock data - Astra connection not properly configured")
        return None
    except Exception as error:
        print(f"Error connecting to Astra DB: {error}")
        return None

async def get_contract_information(supplier_name: str) -> List[Dict[str, Any]]:
    """
    Get contract information from DataStax Astra
    """
    try:
        print(f"🔍 Querying Astra DB for supplier: {supplier_name}")
        
        session = get_astra_client()
        
        # If session is None, use mock data
        if session is None:
            print("📋 Using mock contract data")
            return get_mock_contract_data(supplier_name)
        
        # Query contracts collection for the supplier
        query = f"""
        SELECT * FROM {ASTRA_DB_KEYSPACE}.{ASTRA_DB_COLLECTION} 
        WHERE supplier_name = %s ALLOW FILTERING
        """
        
        result = session.execute(query, [supplier_name])
        
        contracts = []
        for row in result:
            contract_data = {
                "id": getattr(row, 'id', None),
                "supplier_name": getattr(row, 'supplier_name', None),
                "contract_title": getattr(row, 'contract_title', None),
                "contract_type": getattr(row, 'contract_type', None),
                "start_date": getattr(row, 'start_date', None),
                "end_date": getattr(row, 'end_date', None),
                "value": getattr(row, 'value', None),
                "currency": getattr(row, 'currency', None),
                "terms": getattr(row, 'terms', None),
                "clauses": getattr(row, 'clauses', None),
                "risks": getattr(row, 'risks', None),
                "opportunities": getattr(row, 'opportunities', None)
            }
            contracts.append(contract_data)
        
        print(f"✅ Found {len(contracts)} contracts for supplier: {supplier_name}")
        
        return contracts
        
    except Exception as error:
        print(f"Error getting contract information: {error}")
        # For now, return mock data to allow testing
        return get_mock_contract_data(supplier_name)

def get_mock_contract_data(supplier_name: str) -> List[Dict[str, Any]]:
    """
    Return mock contract data for testing purposes
    """
    return [
        {
            "id": "contract_001",
            "supplier_name": supplier_name,
            "contract_title": f"Supply Agreement - {supplier_name}",
            "contract_type": "Supply Agreement",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "value": 500000,
            "currency": "USD",
            "terms": {
                "payment_terms": "Net 30",
                "delivery_terms": "FOB Destination",
                "quality_standards": "ISO 9001",
                "warranty": "12 months"
            },
            "clauses": {
                "force_majeure": "Standard force majeure clause included",
                "termination": "Either party may terminate with 30 days notice",
                "confidentiality": "Standard confidentiality terms apply",
                "intellectual_property": "Supplier retains IP rights to existing technology"
            },
            "risks": {
                "supply_chain": "Medium - Single source supplier",
                "quality": "Low - Established quality processes",
                "financial": "Low - Stable financial position",
                "regulatory": "Medium - Subject to industry regulations"
            },
            "opportunities": {
                "cost_savings": "Potential 5-10% savings through volume discounts",
                "process_improvement": "Opportunity to streamline ordering process",
                "relationship": "Strong partnership potential for long-term collaboration"
            }
        },
        {
            "id": "contract_002", 
            "supplier_name": supplier_name,
            "contract_title": f"Service Agreement - {supplier_name}",
            "contract_type": "Service Agreement",
            "start_date": "2024-06-01",
            "end_date": "2025-05-31",
            "value": 250000,
            "currency": "USD",
            "terms": {
                "payment_terms": "Net 45",
                "service_levels": "99.5% uptime guarantee",
                "response_time": "4 hours for critical issues",
                "maintenance": "Quarterly preventive maintenance"
            },
            "clauses": {
                "service_levels": "Detailed SLA with penalties for non-compliance",
                "change_management": "Process for scope changes and pricing adjustments",
                "dispute_resolution": "Escalation process defined",
                "data_protection": "GDPR compliance requirements"
            },
            "risks": {
                "service_delivery": "Medium - Dependent on supplier resources",
                "technology": "Low - Proven technology platform",
                "compliance": "Medium - Subject to data protection regulations",
                "business_continuity": "High - Critical service dependency"
            },
            "opportunities": {
                "efficiency": "Automation opportunities to reduce manual work",
                "innovation": "Access to supplier's latest technology",
                "scalability": "Flexible scaling based on business needs"
            }
        }
    ]

async def search_contracts_by_criteria(criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Search contracts by various criteria
    """
    try:
        session = get_astra_client()
        
        # If session is None, return empty list
        if session is None:
            print("📋 Using mock data for contract search")
            return []
        
        # Build dynamic query based on criteria
        query_parts = [f"SELECT * FROM {ASTRA_DB_KEYSPACE}.{ASTRA_DB_COLLECTION}"]
        where_conditions = []
        params = []
        
        if criteria.get("supplier_name"):
            where_conditions.append("supplier_name = %s")
            params.append(criteria["supplier_name"])
        
        if criteria.get("contract_type"):
            where_conditions.append("contract_type = %s")
            params.append(criteria["contract_type"])
        
        if criteria.get("min_value"):
            where_conditions.append("value >= %s")
            params.append(criteria["min_value"])
        
        if criteria.get("max_value"):
            where_conditions.append("value <= %s")
            params.append(criteria["max_value"])
        
        if where_conditions:
            query_parts.append("WHERE " + " AND ".join(where_conditions))
        
        query_parts.append("ALLOW FILTERING")
        query = " ".join(query_parts)
        
        result = session.execute(query, params)
        
        contracts = []
        for row in result:
            contract_data = {
                "id": getattr(row, 'id', None),
                "supplier_name": getattr(row, 'supplier_name', None),
                "contract_title": getattr(row, 'contract_title', None),
                "contract_type": getattr(row, 'contract_type', None),
                "start_date": getattr(row, 'start_date', None),
                "end_date": getattr(row, 'end_date', None),
                "value": getattr(row, 'value', None),
                "currency": getattr(row, 'currency', None)
            }
            contracts.append(contract_data)
        
        return contracts
        
    except Exception as error:
        print(f"Error searching contracts: {error}")
        return []

async def get_contract_statistics() -> Dict[str, Any]:
    """
    Get contract statistics and analytics
    """
    try:
        session = get_astra_client()
        
        # If session is None, return mock statistics
        if session is None:
            print("📋 Using mock statistics data")
            return {
                "total_contracts": 2,
                "total_value": 750000,
                "contracts_by_type": {"Supply Agreement": 1, "Service Agreement": 1},
                "average_value": 375000
            }
        
        # Get total contracts
        total_query = f"SELECT COUNT(*) as total FROM {ASTRA_DB_KEYSPACE}.{ASTRA_DB_COLLECTION}"
        total_result = session.execute(total_query)
        total_contracts = total_result.one().total if total_result.one() else 0
        
        # Get contracts by type
        type_query = f"SELECT contract_type, COUNT(*) as count FROM {ASTRA_DB_KEYSPACE}.{ASTRA_DB_COLLECTION} GROUP BY contract_type"
        type_result = session.execute(type_query)
        
        contracts_by_type = {}
        for row in type_result:
            contracts_by_type[row.contract_type] = row.count
        
        # Get total value
        value_query = f"SELECT SUM(value) as total_value FROM {ASTRA_DB_KEYSPACE}.{ASTRA_DB_COLLECTION}"
        value_result = session.execute(value_query)
        total_value = value_result.one().total_value if value_result.one() else 0
        
        return {
            "total_contracts": total_contracts,
            "total_value": total_value,
            "contracts_by_type": contracts_by_type,
            "average_value": total_value / total_contracts if total_contracts > 0 else 0
        }
        
    except Exception as error:
        print(f"Error getting contract statistics: {error}")
        return {
            "total_contracts": 0,
            "total_value": 0,
            "contracts_by_type": {},
            "average_value": 0
        } 