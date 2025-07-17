import os
from typing import Dict, Any, List, Optional
from supabase import create_client, Client

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
)

async def get_part_information(part_number: str) -> Optional[Dict[str, Any]]:
    """
    Get part information from MASTER_FILE table
    """
    try:
        print(f"🔍 Querying MASTER_FILE for part number: {part_number}")

        response = supabase.table('MASTER_FILE').select("""
            suppliernumber,
            suppliername,
            suppliercontactname,
            suppliercontactemail,
            suppliermanufacturinglocation,
            PartNumber,
            partname,
            material,
            currency,
            voljan2023, volfeb2023, volmar2023, volapr2023, volmay2023, voljun2023,
            voljul2023, volaug2023, volsep2023, voloct2023, volnov2023, voldec2023,
            voljan2024, volfeb2024, volmar2024, volapr2024, volmay2024, voljun2024,
            voljul2024, volaug2024, volsep2024, voloct2024, volnov2024, voldec2024,
            voljan2025, volfeb2025, volmar2025, volapr2025, volmay2025, voljun2025,
            voljul2025, volaug2025, volsep2025, voloct2025, volnov2025, voldec2025,
            pricejan2023, pricefeb2023, pricemar2023, priceapr2023, pricemay2023, pricejun2023,
            pricejul2023, priceaug2023, pricesep2023, priceoct2023, pricenov2023, pricedec2023,
            pricejan2024, pricefeb2024, pricemar2024, priceapr2024, pricemay2024, pricejun2024,
            pricejul2024, priceaug2024, pricesep2024, priceoct2024, pricenov2024, pricedec2024,
            pricejan2025, pricefeb2025, pricemar2025, priceapr2025, pricemay2025, pricejun2025,
            pricejul2025, priceaug2025, pricesep2025, priceoct2025, pricenov2025, pricedec2025
        """).eq('PartNumber', part_number).execute()

        if not response.data or len(response.data) == 0:
            print(f"❌ Part number {part_number} not found in MASTER_FILE")
            return None

        data = response.data[0]
        print(f"✅ Found part information for {part_number}: {data['suppliername']}")

        # Process and structure the data
        processed_data = {
            **data,
            # Calculate current pricing and volume trends
            "currentPricing": extract_current_pricing(data),
            "volumeTrends": extract_volume_trends(data),
            "pricingTrends": extract_pricing_trends(data)
        }

        return processed_data

    except Exception as error:
        print(f"Error getting part information: {error}")
        raise error

def extract_current_pricing(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract current pricing information
    """
    from datetime import datetime
    
    current_month = datetime.now().month - 1  # 0-11
    current_year = datetime.now().year
    
    # Get the most recent actual price (not forecast)
    latest_price = None
    latest_price_date = None

    # Check 2025 prices first (current year)
    for month in range(current_month + 1):
        month_names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        price_key = f"price{month_names[month]}2025"
        
        if data.get(price_key) and data[price_key] > 0:
            latest_price = data[price_key]
            latest_price_date = f"{month_names[month]}2025"

    # If no 2025 price, check 2024
    if not latest_price:
        for month in range(11, -1, -1):
            month_names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            price_key = f"price{month_names[month]}2024"
            
            if data.get(price_key) and data[price_key] > 0:
                latest_price = data[price_key]
                latest_price_date = f"{month_names[month]}2024"
                break

    return {
        "latestPrice": latest_price,
        "latestPriceDate": latest_price_date,
        "currency": data.get('currency')
    }

def extract_volume_trends(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract volume trends
    """
    volumes = {}
    years = [2023, 2024, 2025]
    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

    for year in years:
        volumes[year] = {}
        for month in months:
            key = f"vol{month}{year}"
            if data.get(key) and data[key] > 0:
                volumes[year][month] = data[key]

    return volumes

def extract_pricing_trends(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract pricing trends
    """
    prices = {}
    years = [2023, 2024, 2025]
    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

    for year in years:
        prices[year] = {}
        for month in months:
            key = f"price{month}{year}"
            if data.get(key) and data[key] > 0:
                prices[year][month] = data[key]

    return prices

async def get_parts_by_supplier(supplier_name: str) -> List[Dict[str, Any]]:
    """
    Search for parts by supplier name
    """
    try:
        response = supabase.table('MASTER_FILE').select(
            'PartNumber, partname, material, currency'
        ).ilike('suppliername', f'%{supplier_name}%').execute()

        return response.data or []
    except Exception as error:
        print(f"Error searching parts by supplier: {error}")
        raise error

async def get_supplier_statistics(supplier_name: str) -> Optional[Dict[str, Any]]:
    """
    Get supplier statistics
    """
    try:
        response = supabase.table('MASTER_FILE').select(
            'PartNumber, material, currency'
        ).ilike('suppliername', f'%{supplier_name}%').execute()

        data = response.data
        if not data or len(data) == 0:
            return None

        stats = {
            "totalParts": len(data),
            "materials": list(set([item['material'] for item in data if item.get('material')])),
            "currencies": list(set([item['currency'] for item in data if item.get('currency')])),
            "partNumbers": [item['PartNumber'] for item in data]
        }

        return stats
    except Exception as error:
        print(f"Error in get_supplier_statistics: {error}")
        raise error 