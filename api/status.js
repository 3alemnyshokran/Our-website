// This is a simple API endpoint for testing that Vercel deployment works
module.exports = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
};
