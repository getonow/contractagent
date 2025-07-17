require('dotenv').config();
const axios = require('axios');

async function testAstraConnection() {
  console.log('🔍 Testing DataStax Astra connection...');
  console.log('Endpoint:', process.env.ASTRA_DB_ENDPOINT);
  console.log('Token:', process.env.ASTRA_DB_TOKEN ? 'Present' : 'Missing');
  console.log('Keyspace:', process.env.ASTRA_DB_KEYSPACE);
  console.log('Collection:', process.env.ASTRA_DB_COLLECTION);
  
  // Use the working Document API endpoint (POST without /find)
  const endpoint = `${process.env.ASTRA_DB_ENDPOINT}/api/json/v1/${process.env.ASTRA_DB_KEYSPACE}/${process.env.ASTRA_DB_COLLECTION}`;
  
  try {
    console.log(`\n🔧 Testing working Document API endpoint (POST): ${endpoint}`);
    const response = await axios.post(endpoint, {}, {
      headers: {
        'X-Cassandra-Token': process.env.ASTRA_DB_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Astra connection successful!');
    console.log('Status:', response.status);
    console.log('Working endpoint:', endpoint);
    
    let data = response.data;
    if (data.data) {
      data = data.data;
    }
    
    console.log('Data count:', Array.isArray(data) ? data.length : 'unknown');
    console.log('Sample data:', Array.isArray(data) ? data.length : 0, 'records');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('Sample record:', JSON.stringify(data[0], null, 2));
    }
    
  } catch (error) {
    console.log(`❌ Endpoint failed: ${endpoint}`);
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.description || error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 401 Unauthorized - Token issues:');
      console.log('1. Check if the token is expired');
      console.log('2. Verify the token format is correct');
      console.log('3. Ensure the token has proper permissions');
      console.log('4. Try regenerating the token in Astra dashboard');
    }
  }
}

testAstraConnection(); 