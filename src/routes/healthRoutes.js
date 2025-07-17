const express = require('express');
const router = express.Router();
const { checkDatabaseConnections } = require('../services/healthService');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthStatus = await checkDatabaseConnections();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'CONTRACTEXTRACT AI Agent',
      version: '1.0.0',
      databases: healthStatus,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'CONTRACTEXTRACT AI Agent',
      error: error.message,
      uptime: process.uptime()
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const healthStatus = await checkDatabaseConnections();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'CONTRACTEXTRACT AI Agent',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      databases: healthStatus,
      system: {
        uptime: process.uptime(),
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        },
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    console.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'CONTRACTEXTRACT AI Agent',
      error: error.message,
      uptime: process.uptime()
    });
  }
});

module.exports = router; 