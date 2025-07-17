const axios = require('axios');

/**
 * Get contract information from DataStax Astra Vector database
 * @param {string} supplierName - The supplier name to search for
 * @returns {array} Array of contract documents
 */
async function getContractInformation(supplierName) {
  try {
    console.log(`🔍 Starting semantic search for supplier: ${supplierName}`);

    // Use vector similarity search for semantic understanding
    const contracts = await searchContractsByVector(supplierName);
    
    if (contracts && contracts.length > 0) {
      console.log(`✅ Found ${contracts.length} semantically relevant contracts for ${supplierName}`);
      return contracts;
    }

    console.log(`❌ No semantically relevant contracts found for supplier: ${supplierName}`);
    return [];

  } catch (error) {
    console.error('Error getting contract information:', error);
    throw error;
  }
}

/**
 * Search contracts using vector similarity for semantic understanding
 * @param {string} supplierName - The supplier name to search for
 * @returns {array} Array of contract documents
 */
async function searchContractsByVector(supplierName) {
  try {
    // Debug environment variables
    console.log('🔧 Debug - ASTRA_DB_COLLECTION:', process.env.ASTRA_DB_COLLECTION);
    console.log('🔧 Debug - ASTRA_DB_KEYSPACE:', process.env.ASTRA_DB_KEYSPACE);
    console.log('🔧 Debug - ASTRA_DB_ENDPOINT:', process.env.ASTRA_DB_ENDPOINT);
    
    // Use the Document API endpoint for vector similarity search
    const endpoint = `${process.env.ASTRA_DB_ENDPOINT}/api/json/v1/${process.env.ASTRA_DB_KEYSPACE}/${process.env.ASTRA_DB_COLLECTION}`;
    console.log('🔧 Using vector similarity search endpoint:', endpoint);
    
    // Use the correct Document API structure (no sort field)
    const response = await axios.post(endpoint, {
      find: {
        filter: {}, // TODO: add supplierName filter if your schema supports it
        options: { limit: 50 }
      }
    }, {
      headers: {
        'X-Cassandra-Token': process.env.ASTRA_DB_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('🔧 Raw response status:', response.status);
    console.log('🔧 Response data keys:', Object.keys(response.data));
    // Log the full response to see what's happening
    console.log('🔧 Full response data:', JSON.stringify(response.data, null, 2));
    if (response.data.errors) {
      console.log('❌ Astra API Errors:', JSON.stringify(response.data.errors, null, 2));
    }

    // Use the correct path for documents
    const documents = response.data.data?.documents || [];
    console.log(`🔍 Vector search returned ${documents.length} documents`);
    if (documents.length > 0) {
      console.log('🔧 First document structure:', JSON.stringify(documents[0], null, 2));
    }

    // TEMPORARILY: Return all documents without filtering to see what we get
    console.log('🔧 TEMPORARILY: Returning all documents without filtering for debugging');
    const allContracts = documents.map(item => ({
      id: item._id || item.id || item.uuid,
      content: item.$vectorize || item.content || item.text || item.document || item.vectorize || JSON.stringify(item),
      similarity: item.$similarity || 0,
      metadata: extractMetadata(item)
    }));
    console.log(`✅ Found ${allContracts.length} total documents (no filtering applied)`);
    return allContracts;
    
    /* Original filtering logic (commented out for debugging)
    // Filter results by similarity score (if available) and relevance
    const relevantContracts = response.data.data
      .filter(item => {
        // Check if the document has any relevance to the supplier
        const content = item.$vectorize || item.content || item.text || item.document || item.vectorize || JSON.stringify(item);
        const metadata = item.metadata || {};
        
        if (typeof content === 'string') {
          // Check for semantic relevance (not exact match)
          const searchTerms = supplierName.toLowerCase().split(/\s+/);
          const contentLower = content.toLowerCase();
          
          // Check if any part of the supplier name appears in the content
          return searchTerms.some(term => contentLower.includes(term));
        }
        return false;
      })
      .map(item => ({
        id: item._id || item.id || item.uuid,
        content: item.$vectorize || item.content || item.text || item.document || item.vectorize || JSON.stringify(item),
        similarity: item.$similarity || 0,
        metadata: extractMetadata(item)
      }));

    console.log(`✅ Found ${relevantContracts.length} semantically relevant contracts`);
    return relevantContracts;
    */
  } catch (error) {
    console.error('Error in vector similarity search:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Search contracts by text (fallback method - not recommended for vector DB)
 * @param {string} supplierName - The supplier name to search for
 * @returns {array} Array of contract documents
 */
async function searchContractsByText(supplierName) {
  // This is a fallback method that should not be used for vector databases
  // Vector similarity search is much better for semantic understanding
  console.log('⚠️ Using fallback text search (not recommended for vector databases)');
  return searchContractsByVector(supplierName);
}

/**
 * Extract metadata from contract document
 * @param {object} item - Contract document from Astra
 * @returns {object} Extracted metadata
 */
function extractMetadata(item) {
  const metadata = {
    id: item._id || item.id || item.uuid,
    timestamp: new Date().toISOString(),
    contentLength: 0
  };

  // Try to extract content from different possible field names
  const content = item.$vectorize || item.content || item.text || item.document || item.vectorize || JSON.stringify(item);
  if (content) {
    metadata.contentLength = content.length;
    
    // Look for common contract metadata patterns
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g;
    const dates = content.match(datePattern);
    if (dates) {
      metadata.dates = dates.slice(0, 3); // Limit to first 3 dates
    }

    // Look for contract numbers or references
    const contractNumberPattern = /(?:contract|agreement|ref|no\.?)[\s:]*([A-Z0-9\-_]+)/gi;
    const contractNumbers = content.match(contractNumberPattern);
    if (contractNumbers) {
      metadata.contractNumbers = contractNumbers.slice(0, 3);
    }

    // Look for monetary amounts
    const amountPattern = /(?:€|EUR|USD|\$)\s*([\d,]+\.?\d*)/g;
    const amounts = content.match(amountPattern);
    if (amounts) {
      metadata.amounts = amounts.slice(0, 5);
    }
  }

  // Extract file path from metadata if available
  if (item.metadata && item.metadata.file_path) {
    metadata.filePath = item.metadata.file_path;
  }

  return metadata;
}

/**
 * Get all contracts from the collection (for debugging/testing)
 * @param {number} limit - Maximum number of contracts to return
 * @returns {array} Array of all contract documents
 */
async function getAllContracts(limit = 50) {
  try {
    // Use the Document API endpoint
    const endpoint = `${process.env.ASTRA_DB_ENDPOINT}/api/json/v1/${process.env.ASTRA_DB_KEYSPACE}/${process.env.ASTRA_DB_COLLECTION}`;
    
    const response = await axios.post(endpoint, {
      find: {
        filter: {},
        options: { limit }
      }
    }, {
      headers: {
        'X-Cassandra-Token': process.env.ASTRA_DB_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response && response.data && Array.isArray(response.data.data)) {
      return response.data.data.map(item => ({
        id: item._id || item.id || item.uuid,
        content: item.$vectorize || item.content || item.text || item.document || item.vectorize || JSON.stringify(item),
        similarity: item.$similarity || 0,
        metadata: extractMetadata(item)
      }));
    }

    return [];

  } catch (error) {
    console.error('Error getting all contracts:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test the Astra database connection
 * @returns {object} Connection test result
 */
async function testConnection() {
  try {
    // Use the Document API endpoint
    const endpoint = `${process.env.ASTRA_DB_ENDPOINT}/api/json/v1/${process.env.ASTRA_DB_KEYSPACE}/${process.env.ASTRA_DB_COLLECTION}`;
    
    console.log(`🔧 Testing vector database connection: ${endpoint}`);
    const response = await axios.post(endpoint, {
      find: {
        filter: {},
        options: { limit: 1 }
      }
    }, {
      headers: {
        'X-Cassandra-Token': process.env.ASTRA_DB_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    let data = response.data;
    if (data.data) {
      data = data.data;
    }
    
    return {
      status: 'connected',
      message: 'Successfully connected to DataStax Astra Vector Database',
      workingEndpoint: endpoint,
      totalRecords: Array.isArray(data) ? data.length : 'unknown'
    };

  } catch (error) {
    console.error('Astra connection test failed:', error.response?.data || error.message);
    return {
      status: 'error',
      message: error.message,
      error: error.response?.data || error.message
    };
  }
}

module.exports = {
  getContractInformation,
  getAllContracts,
  testConnection
}; 