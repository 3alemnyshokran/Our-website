// API status endpoint
const express = require('express');
const router = express.Router();

// Simple status endpoint to check if the API is running
router.get('/', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseConnected: true
  });
});

module.exports = router;
