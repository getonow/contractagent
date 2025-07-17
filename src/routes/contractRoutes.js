const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { analyzeContract } = require('../services/contractService');
const { validatePartNumber } = require('../utils/validation');

// Validation schema for contract analysis request
const contractAnalysisSchema = Joi.object({
  partNumber: Joi.string()
    .pattern(/^PA-\d{5}$/)
    .required()
    .messages({
      'string.pattern.base': 'Part number must be in format PA-XXXXX where XXXXX is a 5-digit number',
      'any.required': 'Part number is required'
    })
});

// Main contract analysis endpoint
router.post('/analyze', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = contractAnalysisSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
    }

    const { partNumber } = value;

    // Validate part number format
    const validationResult = validatePartNumber(partNumber);
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Invalid part number format',
        message: validationResult.message,
        expectedFormat: 'PA-XXXXX (where XXXXX is a 5-digit number)'
      });
    }

    console.log(`🔍 Starting contract analysis for part number: ${partNumber}`);

    // Perform contract analysis
    const analysisResult = await analyzeContract(partNumber);

    console.log(`✅ Contract analysis completed for part number: ${partNumber}`);

    res.json({
      success: true,
      partNumber,
      timestamp: new Date().toISOString(),
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Contract analysis error:', error);
    
    // Handle specific error types
    if (error.code === 'PART_NOT_FOUND') {
      return res.status(404).json({
        error: 'Part not found',
        message: error.message,
        partNumber: req.body.partNumber,
        suggestions: [
          'Verify the part number is correct',
          'Check if the part number exists in the MASTER_FILE table',
          'Ensure the format is PA-XXXXX where XXXXX is a 5-digit number'
        ]
      });
    }

    if (error.code === 'SUPPLIER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Supplier information not found',
        message: error.message,
        partNumber: req.body.partNumber
      });
    }

    if (error.code === 'CONTRACTS_NOT_FOUND') {
      return res.status(404).json({
        error: 'No contracts found',
        message: error.message,
        partNumber: req.body.partNumber,
        supplier: error.supplier
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Contract analysis failed',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred during contract analysis' 
        : error.message,
      partNumber: req.body.partNumber
    });
  }
});

// Get analysis status endpoint
router.get('/status/:partNumber', async (req, res) => {
  try {
    const { partNumber } = req.params;
    
    // Validate part number format
    const validationResult = validatePartNumber(partNumber);
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Invalid part number format',
        message: validationResult.message
      });
    }

    // This could be extended to check analysis status from a cache or database
    res.json({
      partNumber,
      status: 'completed', // This would be dynamic in a real implementation
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
});

// Get supported part number formats
router.get('/formats', (req, res) => {
  res.json({
    supportedFormats: [
      {
        pattern: 'PA-XXXXX',
        description: 'Company part numbers where XXXXX is a 5-digit number',
        examples: ['PA-10183', 'PA-20045', 'PA-99999']
      }
    ],
    validationRules: {
      prefix: 'PA-',
      suffix: '5-digit number',
      totalLength: 8,
      regex: '/^PA-\\d{5}$/'
    }
  });
});

module.exports = router; 