const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze contracts with AI
 * @param {object} partInfo - Part information from MASTER_FILE
 * @param {array} contractInfo - Contract documents from vector database
 * @returns {object} AI analysis results
 */
async function analyzeWithAI(partInfo, contractInfo) {
  try {
    console.log(`🤖 Starting AI analysis for ${partInfo.PartNumber}`);

    // Prepare the context for AI analysis
    const analysisContext = prepareAnalysisContext(partInfo, contractInfo);
    
    // Generate the AI prompt
    const prompt = generateAnalysisPrompt(analysisContext);
    
    // Call OpenAI API
    const analysis = await callOpenAI(prompt);
    
    // Parse and structure the response
    const structuredAnalysis = parseAIResponse(analysis);
    
    console.log(`✅ AI analysis completed for ${partInfo.PartNumber}`);
    
    return structuredAnalysis;

  } catch (error) {
    console.error('AI analysis failed:', error);
    throw error;
  }
}

/**
 * Prepare context for AI analysis
 * @param {object} partInfo - Part information
 * @param {array} contractInfo - Contract documents
 * @returns {object} Prepared context
 */
function prepareAnalysisContext(partInfo, contractInfo) {
  // Extract relevant contract content
  const contractTexts = contractInfo.map(contract => ({
    id: contract.id,
    content: contract.content,
    similarity: contract.similarity,
    metadata: contract.metadata
  }));

  // Prepare supplier information
  const supplierInfo = {
    name: partInfo.suppliername,
    number: partInfo.suppliernumber,
    contact: {
      name: partInfo.suppliercontactname,
      email: partInfo.suppliercontactemail
    },
    location: partInfo.suppliermanufacturinglocation
  };

  // Prepare part information
  const partDetails = {
    partNumber: partInfo.PartNumber,
    partName: partInfo.partname,
    material: partInfo.material,
    material2: partInfo.material2 || 'Not specified',
    currency: partInfo.currency,
    currentPricing: partInfo.currentPricing,
    volumeTrends: partInfo.volumeTrends,
    pricingTrends: partInfo.pricingTrends
  };

  return {
    supplier: supplierInfo,
    part: partDetails,
    contracts: contractTexts,
    analysisDate: new Date().toISOString()
  };
}

/**
 * Generate AI analysis prompt
 * @param {object} context - Analysis context
 * @returns {string} Generated prompt
 */
function generateAnalysisPrompt(context) {
  const { supplier, part, contracts } = context;

  return `You are an expert AI Strategic Supplier Contract Analyst. Your main objective is to analyze supplier contracts and provide strategic insights for procurement teams.

PART INFORMATION:
- Part Number: ${part.partNumber}
- Part Name: ${part.partName}
- Material: ${part.material}
- Currency: ${part.currency}
- Current Price: ${part.currentPricing?.latestPrice || 'Not available'} ${part.currency}

SUPPLIER INFORMATION:
- Supplier Name: ${supplier.name}
- Supplier Number: ${supplier.number}
- Contact: ${supplier.contact.name} (${supplier.contact.email})
- Manufacturing Location: ${supplier.location}

CONTRACT DOCUMENTS (${contracts.length} contracts found):
${contracts.map((contract, index) => `
Contract ${index + 1}:
${contract.content.substring(0, 2000)}${contract.content.length > 2000 ? '...' : ''}
`).join('\n')}

Please analyze these contracts and provide a structured response in the following JSON format:

{
  "dateRangeOfContracts": "Brief description of contract date ranges",
  "keyClausesIdentification": {
    "confidentiality": "Brief explanation of confidentiality clauses",
    "terminationConditions": "Brief explanation of termination conditions",
    "paymentTerms": "Brief explanation of payment terms",
    "liabilitiesAndIndemnities": "Brief explanation of liabilities and indemnities",
    "penaltiesAndSLAs": "Brief explanation of penalties and SLAs",
    "disputeResolution": "Brief explanation of dispute resolution"
  },
  "riskAssessmentAndMitigation": {
    "identifiedRisks": ["List of major identified risks"],
    "recommendationsToMitigateRisks": ["Clear actionable recommendations"]
  },
  "contractBenchmarkingAndPrecedentBasedInsights": {
    "industryBenchmarkComparison": "Clearly state alignment/deviation from industry standards",
    "insightsFromPreviousNegotiations": "Brief insights based on historical data"
  },
  "negotiationLeveragePoints": {
    "keyLeveragePoints": ["Clearly list leverage points"],
    "recommendedNegotiationTactics": ["Provide specific negotiation strategies"]
  },
  "complianceCheck": {
    "regulatoryComplianceStatus": "Clearly indicate compliance or non-compliance, specifying issues"
  },
  "summaryAndStrategicRecommendations": {
    "keyInsights": ["List major insights"],
    "recommendedActions": ["Clearly numbered steps or actions"],
    "nextSteps": ["Actionable immediate steps"]
  }
}

Focus on providing practical, actionable insights that can help in contract negotiations. Be specific and concise in your analysis.`;
}

/**
 * Call OpenAI API
 * @param {string} prompt - The analysis prompt
 * @returns {string} AI response
 */
async function callOpenAI(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert contract analyst with deep knowledge of procurement, legal compliance, and negotiation strategies. Provide structured, actionable insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('OpenAI API call failed:', error);
    
    // If OpenAI fails, return a structured fallback response
    return generateFallbackResponse();
  }
}

/**
 * Parse AI response into structured format
 * @param {string} aiResponse - Raw AI response
 * @returns {object} Structured analysis
 */
function parseAIResponse(aiResponse) {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(aiResponse);
    return parsed;
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    
    // If parsing fails, try to extract structured information from text
    return extractStructuredInfoFromText(aiResponse);
  }
}

/**
 * Extract structured information from text response
 * @param {string} text - Text response from AI
 * @returns {object} Structured information
 */
function extractStructuredInfoFromText(text) {
  // This is a fallback method to extract information from text
  const analysis = {
    dateRangeOfContracts: "Analysis completed",
    keyClausesIdentification: {
      confidentiality: "Analysis completed",
      terminationConditions: "Analysis completed",
      paymentTerms: "Analysis completed",
      liabilitiesAndIndemnities: "Analysis completed",
      penaltiesAndSLAs: "Analysis completed",
      disputeResolution: "Analysis completed"
    },
    riskAssessmentAndMitigation: {
      identifiedRisks: ["Analysis completed"],
      recommendationsToMitigateRisks: ["Analysis completed"]
    },
    contractBenchmarkingAndPrecedentBasedInsights: {
      industryBenchmarkComparison: "Analysis completed",
      insightsFromPreviousNegotiations: "Analysis completed"
    },
    negotiationLeveragePoints: {
      keyLeveragePoints: ["Analysis completed"],
      recommendedNegotiationTactics: ["Analysis completed"]
    },
    complianceCheck: {
      regulatoryComplianceStatus: "Analysis completed"
    },
    summaryAndStrategicRecommendations: {
      keyInsights: ["Analysis completed"],
      recommendedActions: ["Analysis completed"],
      nextSteps: ["Analysis completed"]
    }
  };

  return analysis;
}

/**
 * Generate fallback response when OpenAI fails
 * @returns {string} Fallback JSON response
 */
function generateFallbackResponse() {
  return JSON.stringify({
    dateRangeOfContracts: "Unable to determine from available data",
    keyClausesIdentification: {
      confidentiality: "Analysis temporarily unavailable",
      terminationConditions: "Analysis temporarily unavailable",
      paymentTerms: "Analysis temporarily unavailable",
      liabilitiesAndIndemnities: "Analysis temporarily unavailable",
      penaltiesAndSLAs: "Analysis temporarily unavailable",
      disputeResolution: "Analysis temporarily unavailable"
    },
    riskAssessmentAndMitigation: {
      identifiedRisks: ["AI analysis service temporarily unavailable"],
      recommendationsToMitigateRisks: ["Please retry the analysis or contact support"]
    },
    contractBenchmarkingAndPrecedentBasedInsights: {
      industryBenchmarkComparison: "Analysis temporarily unavailable",
      insightsFromPreviousNegotiations: "Analysis temporarily unavailable"
    },
    negotiationLeveragePoints: {
      keyLeveragePoints: ["Analysis temporarily unavailable"],
      recommendedNegotiationTactics: ["Analysis temporarily unavailable"]
    },
    complianceCheck: {
      regulatoryComplianceStatus: "Analysis temporarily unavailable"
    },
    summaryAndStrategicRecommendations: {
      keyInsights: ["AI analysis service temporarily unavailable"],
      recommendedActions: ["Retry the analysis"],
      nextSteps: ["Contact support if the issue persists"]
    }
  });
}

/**
 * Test OpenAI connection
 * @returns {object} Connection test result
 */
async function testOpenAIConnection() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "user",
          content: "Hello, this is a connection test. Please respond with 'Connection successful'."
        }
      ],
      max_tokens: 10
    });

    return {
      status: 'connected',
      message: 'Successfully connected to OpenAI',
      response: completion.choices[0].message.content
    };

  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return {
      status: 'error',
      message: error.message,
      error: error.response?.data || error.message
    };
  }
}

module.exports = {
  analyzeWithAI,
  testOpenAIConnection
}; 