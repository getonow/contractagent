/**
 * Validate part number format
 * @param {string} partNumber - The part number to validate
 * @returns {object} Validation result with isValid boolean and message
 */
function validatePartNumber(partNumber) {
  if (!partNumber || typeof partNumber !== 'string') {
    return {
      isValid: false,
      message: 'Part number must be a non-empty string'
    };
  }

  // Check if part number starts with PA-
  if (!partNumber.startsWith('PA-')) {
    return {
      isValid: false,
      message: 'Part number must start with "PA-" prefix'
    };
  }

  // Check if the part number has the correct length (PA-XXXXX = 8 characters)
  if (partNumber.length !== 8) {
    return {
      isValid: false,
      message: `Part number must be exactly 8 characters long (got ${partNumber.length})`
    };
  }

  // Check if the suffix is a 5-digit number
  const suffix = partNumber.substring(3); // Remove "PA-" prefix
  if (!/^\d{5}$/.test(suffix)) {
    return {
      isValid: false,
      message: 'Part number suffix must be exactly 5 digits'
    };
  }

  return {
    isValid: true,
    message: 'Part number format is valid'
  };
}

/**
 * Sanitize part number (remove extra spaces, convert to uppercase)
 * @param {string} partNumber - The part number to sanitize
 * @returns {string} Sanitized part number
 */
function sanitizePartNumber(partNumber) {
  if (!partNumber || typeof partNumber !== 'string') {
    return null;
  }

  // Remove extra spaces and convert to uppercase
  return partNumber.trim().toUpperCase();
}

/**
 * Extract numeric part from part number
 * @param {string} partNumber - The part number (e.g., "PA-10183")
 * @returns {number|null} The numeric part (e.g., 10183) or null if invalid
 */
function extractPartNumberNumeric(partNumber) {
  const validation = validatePartNumber(partNumber);
  if (!validation.isValid) {
    return null;
  }

  const suffix = partNumber.substring(3);
  return parseInt(suffix, 10);
}

/**
 * Generate part number from numeric value
 * @param {number} numericValue - The numeric value (e.g., 10183)
 * @returns {string} Formatted part number (e.g., "PA-10183")
 */
function generatePartNumber(numericValue) {
  if (!Number.isInteger(numericValue) || numericValue < 0 || numericValue > 99999) {
    throw new Error('Numeric value must be an integer between 0 and 99999');
  }

  return `PA-${numericValue.toString().padStart(5, '0')}`;
}

module.exports = {
  validatePartNumber,
  sanitizePartNumber,
  extractPartNumberNumeric,
  generatePartNumber
}; 