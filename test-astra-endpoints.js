require('dotenv').config();
const axios = require('axios');

async function testAstraEndpoints() {
  console.log('🔍 Testing different Astra DB endpoint variations...');
  console.log('Endpoint:', process.env.ASTRA_DB_ENDPOINT);
  console.log('Token:', process.env.ASTRA_DB_TOKEN ? 'Present' : 'Missing');
  console.log('Keyspace:', process.env.ASTRA_DB_KEYSPACE);
  console.log('Collection:', process.env.ASTRA_DB_COLLECTION);
  
  const baseUrl = process.env.ASTRA_DB_ENDPOINT;
  const keyspace = process.env.ASTRA_DB_KEYSPACE;
  const collection = process.env.ASTRA_DB_COLLECTION;
  const token = process.env.ASTRA_DB_TOKEN;

  // Define different endpoint variations to test
  const endpoints = [
    // Document API variations
    {
      name: 'Document API - Basic GET',
      method: 'GET',
      url: `${baseUrl}/api/json/v1/${keyspace}/${collection}`,
      body: null
    },
    {
      name: 'Document API - Find POST',
      method: 'POST',
      url: `${baseUrl}/api/json/v1/${keyspace}/${collection}/find`,
      body: { filter: {}, options: { limit: 5 } }
    },
    {
      name: 'Document API - Query POST',
      method: 'POST',
      url: `${baseUrl}/api/json/v1/${keyspace}/${collection}/query`,
      body: { filter: {}, options: { limit: 5 } }
    },
    {
      name: 'Document API - Search POST',
      method: 'POST',
      url: `${baseUrl}/api/json/v1/${keyspace}/${collection}/search`,
      body: { filter: {}, options: { limit: 5 } }
    },
    // REST API variations
    {
      name: 'REST API - Collections GET',
      method: 'GET',
      url: `${baseUrl}/api/rest/v2/keyspaces/${keyspace}/collections/${collection}`,
      body: null
    },
    {
      name: 'REST API - Tables GET',
      method: 'GET',
      url: `${baseUrl}/api/rest/v2/keyspaces/${keyspace}/tables/${collection}`,
      body: null
    },
    {
      name: 'REST API - Tables Rows GET',
      method: 'GET',
      url: `${baseUrl}/api/rest/v2/keyspaces/${keyspace}/tables/${collection}/rows`,
      body: null
    },
    // Namespaces variations
    {
      name: 'Namespaces API - Collections GET',
      method: 'GET',
      url: `${baseUrl}/api/rest/v2/namespaces/${keyspace}/collections/${collection}`,
      body: null
    },
    // Vector API variations
    {
      name: 'Vector API - Basic GET',
      method: 'GET',
      url: `${baseUrl}/api/vector/v1/${keyspace}/${collection}`,
      body: null
    },
    {
      name: 'Vector API - Find POST',
      method: 'POST',
      url: `${baseUrl}/api/vector/v1/${keyspace}/${collection}/find`,
      body: { filter: {}, options: { limit: 5 } }
    },
    // Alternative JSON API variations
    {
      name: 'JSON API v2 - Basic GET',
      method: 'GET',
      url: `${baseUrl}/api/json/v2/${keyspace}/${collection}`,
      body: null
    },
    {
      name: 'JSON API v2 - Find POST',
      method: 'POST',
      url: `${baseUrl}/api/json/v2/${keyspace}/${collection}/find`,
      body: { filter: {}, options: { limit: 5 } }
    }
  ];

  let workingEndpoint = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔧 Testing: ${endpoint.name}`);
      console.log(`URL: ${endpoint.url}`);
      console.log(`Method: ${endpoint.method}`);
      
      const config = {
        method: endpoint.method,
        url: endpoint.url,
        headers: {
          'X-Cassandra-Token': token,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };

      if (endpoint.body) {
        config.data = endpoint.body;
      }

      const response = await axios(config);
      
      console.log('✅ SUCCESS!');
      console.log('Status:', response.status);
      console.log('Response keys:', Object.keys(response.data));
      
      if (response.data.data) {
        console.log('Data count:', Array.isArray(response.data.data) ? response.data.data.length : 'N/A');
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          console.log('Sample record keys:', Object.keys(response.data.data[0]));
        }
      }
      
      workingEndpoint = endpoint;
      console.log('🎉 Found working endpoint!');
      break;
      
    } catch (error) {
      console.log('❌ Failed');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.description || error.response?.data?.message || error.message);
      
      // If it's a 405 Method Not Allowed, try the same URL with different method
      if (error.response?.status === 405) {
        console.log('🔄 405 Method Not Allowed - trying alternative method...');
        try {
          const altMethod = endpoint.method === 'GET' ? 'POST' : 'GET';
          const altConfig = {
            method: altMethod,
            url: endpoint.url,
            headers: {
              'X-Cassandra-Token': token,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          };

          if (altMethod === 'POST') {
            altConfig.data = { filter: {}, options: { limit: 5 } };
          }

          const altResponse = await axios(altConfig);
          console.log('✅ SUCCESS with alternative method!');
          console.log('Alternative method:', altMethod);
          console.log('Status:', altResponse.status);
          
          workingEndpoint = { ...endpoint, method: altMethod };
          console.log('🎉 Found working endpoint with alternative method!');
          break;
        } catch (altError) {
          console.log('❌ Alternative method also failed');
        }
      }
    }
  }

  if (workingEndpoint) {
    console.log('\n🎉 SUMMARY:');
    console.log('Working endpoint found!');
    console.log('Name:', workingEndpoint.name);
    console.log('URL:', workingEndpoint.url);
    console.log('Method:', workingEndpoint.method);
    console.log('Body:', workingEndpoint.body ? 'Yes' : 'No');
  } else {
    console.log('\n❌ SUMMARY:');
    console.log('No working endpoint found.');
    console.log('Please check your Astra DB configuration or try a different approach.');
  }
}

testAstraEndpoints().catch(console.error); 