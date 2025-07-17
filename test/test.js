const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_PART_NUMBER = 'PA-10183';

/**
 * Test health endpoint
 */
async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', response.data.status);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

/**
 * Test part number format validation
 */
async function testPartNumberFormats() {
  try {
    console.log('🔢 Testing part number formats...');
    const response = await axios.get(`${BASE_URL}/api/contracts/formats`);
    console.log('✅ Part number formats:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Part number formats test failed:', error.message);
    return false;
  }
}

/**
 * Test contract analysis
 */
async function testContractAnalysis() {
  try {
    console.log(`🔍 Testing contract analysis for ${TEST_PART_NUMBER}...`);
    const response = await axios.post(`${BASE_URL}/api/contracts/analyze`, {
      partNumber: TEST_PART_NUMBER
    });
    
    console.log('✅ Contract analysis completed');
    console.log('📊 Analysis summary:');
    console.log(`   - Supplier: ${response.data.analysis.supplierOverview.supplierName}`);
    console.log(`   - Contracts found: ${response.data.analysis.supplierOverview.numberOfContractsFound}`);
    console.log(`   - Part: ${response.data.analysis.partInformation.partName}`);
    
    return true;
  } catch (error) {
    if (error.response) {
      console.error('❌ Contract analysis failed:', error.response.data);
    } else {
      console.error('❌ Contract analysis failed:', error.message);
    }
    return false;
  }
}

/**
 * Test invalid part number
 */
async function testInvalidPartNumber() {
  try {
    console.log('🚫 Testing invalid part number...');
    await axios.post(`${BASE_URL}/api/contracts/analyze`, {
      partNumber: 'INVALID-123'
    });
    console.error('❌ Should have failed with invalid part number');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Invalid part number correctly rejected');
      return true;
    } else {
      console.error('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting CONTRACTEXTRACT Agent Tests\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealth },
    { name: 'Part Number Formats', fn: testPartNumberFormats },
    { name: 'Invalid Part Number', fn: testInvalidPartNumber },
    { name: 'Contract Analysis', fn: testContractAnalysis }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    const result = await test.fn();
    if (result) {
      passed++;
    }
    console.log(`   ${result ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! CONTRACTEXTRACT Agent is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration and try again.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testHealth,
  testPartNumberFormats,
  testContractAnalysis,
  testInvalidPartNumber,
  runTests
}; 