from typing import Dict, Any, Optional

def validate_part_number(part_number: str) -> Dict[str, Any]:
    """
    Validate part number format
    """
    if not part_number or not isinstance(part_number, str):
        return {
            "is_valid": False,
            "message": "Part number must be a non-empty string"
        }

    # Check if part number starts with PA-
    if not part_number.startswith('PA-'):
        return {
            "is_valid": False,
            "message": 'Part number must start with "PA-" prefix'
        }

    # Check if the part number has the correct length (PA-XXXXX = 8 characters)
    if len(part_number) != 8:
        return {
            "is_valid": False,
            "message": f"Part number must be exactly 8 characters long (got {len(part_number)})"
        }

    # Check if the suffix is a 5-digit number
    suffix = part_number[3:]  # Remove "PA-" prefix
    if not suffix.isdigit() or len(suffix) != 5:
        return {
            "is_valid": False,
            "message": "Part number suffix must be exactly 5 digits"
        }

    return {
        "is_valid": True,
        "message": "Part number format is valid"
    }

def sanitize_part_number(part_number: str) -> Optional[str]:
    """
    Sanitize part number (remove extra spaces, convert to uppercase)
    """
    if not part_number or not isinstance(part_number, str):
        return None

    # Remove extra spaces and convert to uppercase
    return part_number.strip().upper()

def extract_part_number_numeric(part_number: str) -> Optional[int]:
    """
    Extract numeric part from part number
    """
    validation = validate_part_number(part_number)
    if not validation["is_valid"]:
        return None

    suffix = part_number[3:]
    return int(suffix)

def generate_part_number(numeric_value: int) -> str:
    """
    Generate part number from numeric value
    """
    if not isinstance(numeric_value, int) or numeric_value < 0 or numeric_value > 99999:
        raise ValueError('Numeric value must be an integer between 0 and 99999')

    return f"PA-{numeric_value:05d}" 