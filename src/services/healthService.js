const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Check all database connections
 */
async function checkDatabaseConnections() {
  const results = {
    supabase: { status: 'unknown', error: null },
    astra: { status: 'unknown', error: null }
  };

  // Check Supabase connection
  try {
    const { data, error } = await supabase
      .from('MASTER_FILE')
      .select('count')
      .limit(1);
    
    if (error) {
      results.supabase = { status: 'error', error: error.message };
    } else {
      results.supabase = { status: 'connected', error: null };
    }
  } catch (error) {
    results.supabase = { status: 'error', error: error.message };
  }

  // Check DataStax Astra connection
  try {
    const response = await axios.get(
      `${process.env.ASTRA_DB_ENDPOINT}/api/rest/v2/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/collections/${process.env.ASTRA_DB_COLLECTION}`,
      {
        headers: {
          'X-Cassandra-Token': process.env.ASTRA_DB_TOKEN,
          'Content-Type': 'application/json'
        },
        params: {
          'page-size': 1
        },
        timeout: 5000
      }
    );
    
    if (response.status === 200) {
      results.astra = { status: 'connected', error: null };
    } else {
      results.astra = { status: 'error', error: `HTTP ${response.status}` };
    }
  } catch (error) {
    results.astra = { status: 'error', error: error.message };
  }

  return results;
}

module.exports = {
  checkDatabaseConnections
}; 