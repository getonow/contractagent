const axios = require('axios');
require('dotenv').config();

async function testAstraAPI() {
  try {
    console.log('🔧 Testing Astra API directly...');
    console.log('🔧 ASTRA_DB_COLLECTION:', process.env.ASTRA_DB_COLLECTION);
    console.log('🔧 ASTRA_DB_KEYSPACE:', process.env.ASTRA_DB_KEYSPACE);
    console.log('🔧 ASTRA_DB_ENDPOINT:', process.env.ASTRA_DB_ENDPOINT);
    
    const endpoint = `${process.env.ASTRA_DB_ENDPOINT}/api/json/v1/${process.env.ASTRA_DB_KEYSPACE}/${process.env.ASTRA_DB_COLLECTION}`;
    console.log('🔧 Using endpoint:', endpoint);
    
    // Try different command structures
    console.log('\n🔧 Testing find command...');
    const response = await axios.post(endpoint, {
      find: {
        filter: {},
        options: { limit: 10 }
      }
    }, {
      headers: {
        'X-Cassandra-Token': process.env.ASTRA_DB_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Response status:', response.status);
    console.log('✅ Response headers:', response.headers);
    console.log('✅ Response data keys:', Object.keys(response.data));
    console.log('✅ Full response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.errors) {
      console.log('❌ Errors found:', JSON.stringify(response.data.errors, null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing Astra API:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAstraAPI(); 