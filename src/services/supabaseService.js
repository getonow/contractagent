const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Get part information from MASTER_FILE table
 * @param {string} partNumber - The part number to search for
 * @returns {object|null} Part information or null if not found
 */
async function getPartInformation(partNumber) {
  try {
    console.log(`🔍 Querying MASTER_FILE for part number: ${partNumber}`);

    const { data, error } = await supabase
      .from('MASTER_FILE')
      .select(`
        suppliernumber,
        suppliername,
        suppliercontactname,
        suppliercontactemail,
        suppliermanufacturinglocation,
        PartNumber,
        partname,
        material,
        currency,
        voljan2023, volfeb2023, volmar2023, volapr2023, volmay2023, voljun2023,
        voljul2023, volaug2023, volsep2023, voloct2023, volnov2023, voldec2023,
        voljan2024, volfeb2024, volmar2024, volapr2024, volmay2024, voljun2024,
        voljul2024, volaug2024, volsep2024, voloct2024, volnov2024, voldec2024,
        voljan2025, volfeb2025, volmar2025, volapr2025, volmay2025, voljun2025,
        voljul2025, volaug2025, volsep2025, voloct2025, volnov2025, voldec2025,
        pricejan2023, pricefeb2023, pricemar2023, priceapr2023, pricemay2023, pricejun2023,
        pricejul2023, priceaug2023, pricesep2023, priceoct2023, pricenov2023, pricedec2023,
        pricejan2024, pricefeb2024, pricemar2024, priceapr2024, pricemay2024, pricejun2024,
        pricejul2024, priceaug2024, pricesep2024, priceoct2024, pricenov2024, pricedec2024,
        pricejan2025, pricefeb2025, pricemar2025, priceapr2025, pricemay2025, pricejun2025,
        pricejul2025, priceaug2025, pricesep2025, priceoct2025, pricenov2025, pricedec2025
      `)
      .eq('PartNumber', partNumber)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    if (!data) {
      console.log(`❌ Part number ${partNumber} not found in MASTER_FILE`);
      return null;
    }

    console.log(`✅ Found part information for ${partNumber}: ${data.suppliername}`);

    // Process and structure the data
    const processedData = {
      ...data,
      // Calculate current pricing and volume trends
      currentPricing: extractCurrentPricing(data),
      volumeTrends: extractVolumeTrends(data),
      pricingTrends: extractPricingTrends(data)
    };

    return processedData;

  } catch (error) {
    console.error('Error getting part information:', error);
    throw error;
  }
}

/**
 * Extract current pricing information
 * @param {object} data - Raw data from MASTER_FILE
 * @returns {object} Current pricing information
 */
function extractCurrentPricing(data) {
  const currentMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();
  
  // Get the most recent actual price (not forecast)
  let latestPrice = null;
  let latestPriceDate = null;

  // Check 2025 prices first (current year)
  for (let month = 0; month <= currentMonth; month++) {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const priceKey = `price${monthNames[month]}2025`;
    
    if (data[priceKey] && data[priceKey] > 0) {
      latestPrice = data[priceKey];
      latestPriceDate = `${monthNames[month]}2025`;
    }
  }

  // If no 2025 price, check 2024
  if (!latestPrice) {
    for (let month = 11; month >= 0; month--) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const priceKey = `price${monthNames[month]}2024`;
      
      if (data[priceKey] && data[priceKey] > 0) {
        latestPrice = data[priceKey];
        latestPriceDate = `${monthNames[month]}2024`;
        break;
      }
    }
  }

  return {
    latestPrice,
    latestPriceDate,
    currency: data.currency
  };
}

/**
 * Extract volume trends
 * @param {object} data - Raw data from MASTER_FILE
 * @returns {object} Volume trend information
 */
function extractVolumeTrends(data) {
  const volumes = {};
  const years = [2023, 2024, 2025];
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  years.forEach(year => {
    volumes[year] = {};
    months.forEach(month => {
      const key = `vol${month}${year}`;
      if (data[key] && data[key] > 0) {
        volumes[year][month] = data[key];
      }
    });
  });

  return volumes;
}

/**
 * Extract pricing trends
 * @param {object} data - Raw data from MASTER_FILE
 * @returns {object} Pricing trend information
 */
function extractPricingTrends(data) {
  const prices = {};
  const years = [2023, 2024, 2025];
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  years.forEach(year => {
    prices[year] = {};
    months.forEach(month => {
      const key = `price${month}${year}`;
      if (data[key] && data[key] > 0) {
        prices[year][month] = data[key];
      }
    });
  });

  return prices;
}

/**
 * Search for parts by supplier name
 * @param {string} supplierName - The supplier name to search for
 * @returns {array} Array of parts from the supplier
 */
async function getPartsBySupplier(supplierName) {
  try {
    const { data, error } = await supabase
      .from('MASTER_FILE')
      .select('PartNumber, partname, material, currency')
      .ilike('suppliername', `%${supplierName}%`);

    if (error) {
      console.error('Error searching parts by supplier:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPartsBySupplier:', error);
    throw error;
  }
}

/**
 * Get supplier statistics
 * @param {string} supplierName - The supplier name
 * @returns {object} Supplier statistics
 */
async function getSupplierStatistics(supplierName) {
  try {
    const { data, error } = await supabase
      .from('MASTER_FILE')
      .select('PartNumber, material, currency')
      .ilike('suppliername', `%${supplierName}%`);

    if (error) {
      console.error('Error getting supplier statistics:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const stats = {
      totalParts: data.length,
      materials: [...new Set(data.map(item => item.material).filter(Boolean))],
      currencies: [...new Set(data.map(item => item.currency).filter(Boolean))],
      partNumbers: data.map(item => item.PartNumber)
    };

    return stats;
  } catch (error) {
    console.error('Error in getSupplierStatistics:', error);
    throw error;
  }
}

module.exports = {
  getPartInformation,
  getPartsBySupplier,
  getSupplierStatistics
}; 