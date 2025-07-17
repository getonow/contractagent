#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 CONTRACTEXTRACT AI Agent - Startup Script\n');

/**
 * Check if Node.js version is compatible
 */
function checkNodeVersion() {
  const version = process.version;
  const majorVersion = parseInt(version.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required');
    console.error(`   Current version: ${version}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version: ${version}`);
}

/**
 * Check if .env file exists
 */
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found');
    console.log('📝 Creating .env file from template...');
    
    const envExamplePath = path.join(__dirname, 'env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created from template');
      console.log('🔧 Please edit .env file with your API keys before starting the server');
    } else {
      console.error('❌ env.example file not found');
      process.exit(1);
    }
  } else {
    console.log('✅ .env file found');
  }
}

/**
 * Check if package.json exists
 */
function checkPackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.error('❌ package.json not found');
    console.error('   Please run this script from the project root directory');
    process.exit(1);
  }
  
  console.log('✅ package.json found');
}

/**
 * Install dependencies
 */
function installDependencies() {
  console.log('📦 Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    console.error('   Please run "npm install" manually');
    process.exit(1);
  }
}

/**
 * Check if node_modules exists
 */
function checkNodeModules() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 node_modules not found, installing dependencies...');
    installDependencies();
  } else {
    console.log('✅ node_modules found');
  }
}

/**
 * Validate environment variables
 */
function validateEnvVariables() {
  console.log('🔍 Validating environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ASTRA_DB_ENDPOINT',
    'ASTRA_DB_TOKEN',
    'ASTRA_DB_KEYSPACE',
    'ASTRA_DB_COLLECTION',
    'OPENAI_API_KEY'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName] === 'your_openai_api_key_here') {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing or default environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n🔧 Please update your .env file with the correct values');
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}

/**
 * Test database connections
 */
async function testConnections() {
  console.log('🔗 Testing database connections...');
  
  try {
    // Load environment variables
    require('dotenv').config();
    
    // Test Supabase connection
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase
      .from('MASTER_FILE')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
    
    // Test Astra connection
    const axios = require('axios');
    try {
      const response = await axios.get(
        `${process.env.ASTRA_DB_ENDPOINT}/api/rest/v2/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/collections/${process.env.ASTRA_DB_COLLECTION}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.ASTRA_DB_TOKEN}`,
            'Content-Type': 'application/json'
          },
          params: { 'page-size': 1 },
          timeout: 5000
        }
      );
      console.log('✅ DataStax Astra connection successful');
    } catch (error) {
      console.log('⚠️  DataStax Astra connection test failed:', error.message);
    }
    
  } catch (error) {
    console.log('⚠️  Connection tests failed:', error.message);
  }
}

/**
 * Start the server
 */
function startServer() {
  console.log('\n🚀 Starting CONTRACTEXTRACT AI Agent server...');
  console.log('📡 Server will be available at: http://localhost:3000');
  console.log('🔗 Health check: http://localhost:3000/api/health');
  console.log('📊 API documentation: http://localhost:3000/');
  console.log('\nPress Ctrl+C to stop the server\n');
  
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to start server');
    process.exit(1);
  }
}

/**
 * Main startup function
 */
async function startup() {
  try {
    // Pre-flight checks
    checkNodeVersion();
    checkPackageJson();
    checkEnvFile();
    checkNodeModules();
    
    // Load environment variables
    require('dotenv').config();
    
    // Validate environment
    const envValid = validateEnvVariables();
    
    if (!envValid) {
      console.log('\n⚠️  Please configure your environment variables and run the script again');
      process.exit(1);
    }
    
    // Test connections
    await testConnections();
    
    // Start server
    startServer();
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

// Run startup if this file is executed directly
if (require.main === module) {
  startup();
}

module.exports = { startup }; 