// This is a simple API endpoint for testing that Vercel deployment works
// Also reports database status if available
let dbStatus = {
  connected: false,
  message: 'Database not initialized'
};

// Try to connect to the database if available (in Vercel environment this won't work,
// but for local development with vercel dev it will attempt to connect)
try {
  const { db } = require('../backend/database');
  if (db) {
    dbStatus = {
      connected: true,
      message: 'Database connected',
      version: db.pragma('user_version', { simple: true })
    };
  }
} catch (error) {
  dbStatus = {
    connected: false,
    message: 'Database connection failed',
    error: error.message
  };
}

module.exports = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
};
