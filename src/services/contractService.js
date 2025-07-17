const { getPartInformation } = require('./supabaseService');
const { getContractInformation } = require('./astraService');
const { analyzeWithAI } = require('./aiService');
const { sanitizePartNumber } = require('../utils/validation');

/**
 * Main contract analysis function
 * @param {string} partNumber - The part number to analyze (e.g., "PA-10183")
 * @returns {object} Complete analysis result
 */
async function analyzeContract(partNumber) {
  try {
    // Step 1: Sanitize and validate part number
    const sanitizedPartNumber = sanitizePartNumber(partNumber);
    if (!sanitizedPartNumber) {
      throw new Error('Invalid part number format');
    }

    console.log(`📋 Step 1: Retrieving part information for ${sanitizedPartNumber}`);

    // Step 2: Get part information from Supabase
    const partInfo = await getPartInformation(sanitizedPartNumber);
    if (!partInfo) {
      const error = new Error(`Part number ${sanitizedPartNumber} not found in MASTER_FILE table`);
      error.code = 'PART_NOT_FOUND';
      throw error;
    }

    console.log(`🏭 Step 2: Found supplier: ${partInfo.suppliername}`);

    // Step 3: Get contract information from DataStax Astra
    const contractInfo = await getContractInformation(partInfo.suppliername);
    if (!contractInfo || contractInfo.length === 0) {
      const error = new Error(`No contracts found for supplier: ${partInfo.suppliername}`);
      error.code = 'CONTRACTS_NOT_FOUND';
      error.supplier = partInfo.suppliername;
      throw error;
    }

    console.log(`📄 Step 3: Found ${contractInfo.length} contracts for analysis`);

    // Step 4: Analyze with AI
    console.log(`🤖 Step 4: Starting AI analysis`);
    const aiAnalysis = await analyzeWithAI(partInfo, contractInfo);

    // Step 5: Structure the final response
    const analysisResult = {
      supplierOverview: {
        supplierName: partInfo.suppliername,
        supplierNumber: partInfo.suppliernumber,
        supplierContact: {
          name: partInfo.suppliercontactname,
          email: partInfo.suppliercontactemail
        },
        manufacturingLocation: partInfo.suppliermanufacturinglocation,
        numberOfContractsFound: contractInfo.length,
        dateRangeOfContracts: aiAnalysis.dateRangeOfContracts || 'Not specified'
      },
      partInformation: {
        partNumber: partInfo.PartNumber,
        partName: partInfo.partname,
        material: partInfo.material,
        material2: partInfo.material2 || null,
        currency: partInfo.currency
      },
      keyClausesIdentification: aiAnalysis.keyClausesIdentification || {},
      riskAssessmentAndMitigation: aiAnalysis.riskAssessmentAndMitigation || {},
      contractBenchmarkingAndPrecedentBasedInsights: aiAnalysis.contractBenchmarkingAndPrecedentBasedInsights || {},
      negotiationLeveragePoints: aiAnalysis.negotiationLeveragePoints || {},
      complianceCheck: aiAnalysis.complianceCheck || {},
      summaryAndStrategicRecommendations: aiAnalysis.summaryAndStrategicRecommendations || {}
    };

    console.log(`✅ Analysis completed successfully for ${sanitizedPartNumber}`);

    return analysisResult;

  } catch (error) {
    console.error('Contract analysis failed:', error);
    throw error;
  }
}

/**
 * Get analysis metadata for a part number
 * @param {string} partNumber - The part number
 * @returns {object} Analysis metadata
 */
async function getAnalysisMetadata(partNumber) {
  try {
    const sanitizedPartNumber = sanitizePartNumber(partNumber);
    const partInfo = await getPartInformation(sanitizedPartNumber);
    
    if (!partInfo) {
      return null;
    }

    return {
      partNumber: sanitizedPartNumber,
      supplierName: partInfo.suppliername,
      lastUpdated: new Date().toISOString(),
      analysisStatus: 'available'
    };
  } catch (error) {
    console.error('Error getting analysis metadata:', error);
    throw error;
  }
}

module.exports = {
  analyzeContract,
  getAnalysisMetadata
}; 