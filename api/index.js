// Main API router for Vercel serverless functions
const express = require('express');
const cors = require('cors');
const app = express();

// Import status handler
const statusHandler = require('./status');

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/status', (req, res) => statusHandler(req, res));

// Fallback route
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    availableEndpoints: [
      '/api/status'
    ]
  });
});

// Export as Vercel serverless function
module.exports = app;