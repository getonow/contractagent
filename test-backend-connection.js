const axios = require('axios');

// Test different backend URLs
const testUrls = [
  'http://localhost:3000',
  'https://your-backend-url.herokuapp.com', // Replace with your actual backend URL
  'https://your-backend-url.onrender.com',  // Replace with your actual backend URL
  'https://your-backend-url.railway.app'    // Replace with your actual backend URL
];

async function testBackendConnection() {
  console.log('🔍 Testing backend connectivity...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(`${url}/api/health`, {
        timeout: 5000,
        headers: {
          'Origin': 'https://preview-22p47wvh--ai-procure-optimize-5.deploypad.app'
        }
      });
      console.log(`✅ SUCCESS: ${url} - Status: ${response.status}`);
      console.log(`Response:`, response.data);
      console.log('');
    } catch (error) {
      console.log(`❌ FAILED: ${url}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Headers:`, error.response.headers);
      } else if (error.request) {
        console.log(`   Network Error: ${error.message}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }
}

// Also test CORS preflight
async function testCorsPreflight() {
  console.log('🔍 Testing CORS preflight...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing CORS preflight: ${url}`);
      const response = await axios.options(`${url}/api/contracts/analyze`, {
        timeout: 5000,
        headers: {
          'Origin': 'https://preview-22p47wvh--ai-procure-optimize-5.deploypad.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log(`✅ CORS SUCCESS: ${url} - Status: ${response.status}`);
      console.log(`CORS Headers:`, response.headers);
      console.log('');
    } catch (error) {
      console.log(`❌ CORS FAILED: ${url}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Headers:`, error.response.headers);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }
}

// Run tests
async function runTests() {
  await testBackendConnection();
  await testCorsPreflight();
}

runTests().catch(console.error); 