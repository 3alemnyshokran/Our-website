// Progress Tracking API
const express = require('express');
const router = express.Router();
const fs = require('fs');

const PROGRESS_DB_FILE = './progress.json';

// Helper functions
function readProgressDB() {
  if (!fs.existsSync(PROGRESS_DB_FILE)) {
    const initialData = {};
    fs.writeFileSync(PROGRESS_DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(PROGRESS_DB_FILE, 'utf8'));
}

function writeProgressDB(data) {
  fs.writeFileSync(PROGRESS_DB_FILE, JSON.stringify(data, null, 2));
}

// Get user progress
router.get('/user/:username', (req, res) => {
  try {
    const { username } = req.params;
    const db = readProgressDB();
    
    if (!db[username]) {
      return res.json({ 
        success: true, 
        progress: {
          languages: {},
          lastUpdated: new Date().toISOString()
        }
      });
    }
    
    res.json({ success: true, progress: db[username] });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sync user progress (two-way sync)
router.post('/sync', (req, res) => {
  try {
    const { username, progress } = req.body;
    
    if (!username || !progress) {
      return res.status(400).json({ error: 'Missing username or progress data' });
    }
    
    const db = readProgressDB();
    
    // Check if there's server data for this user
    let serverProgress = null;
    if (db[username]) {
      serverProgress = db[username];
      
      // Compare dates to determine which is newer
      const clientDate = new Date(progress.lastUpdated);
      const serverDate = new Date(serverProgress.lastUpdated);
      
      if (clientDate > serverDate) {
        // Client data is newer, update server data
        db[username] = progress;
        writeProgressDB(db);
      }
    } else {
      // No server data, just save client data
      db[username] = progress;
      writeProgressDB(db);
    }
    
    // Return server progress for client to merge
    res.json({ 
      success: true, 
      serverProgress: db[username]
    });
  } catch (error) {
    console.error('Error syncing progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset user progress (for testing)
router.post('/reset/:username', (req, res) => {
  try {
    const { username } = req.params;
    const db = readProgressDB();
    
    if (db[username]) {
      db[username] = {
        languages: {},
        lastUpdated: new Date().toISOString()
      };
      writeProgressDB(db);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leaderboard data (optional)
router.get('/leaderboard/:language', (req, res) => {
  try {
    const { language } = req.params;
    const db = readProgressDB();
    
    const leaderboard = [];
    
    // Generate leaderboard data
    Object.entries(db).forEach(([username, userData]) => {
      if (userData.languages && userData.languages[language]) {
        leaderboard.push({
          username,
          progress: userData.languages[language].progress || 0,
          lastActive: userData.languages[language].lastAccessed || null
        });
      }
    });
    
    // Sort by progress (descending)
    leaderboard.sort((a, b) => b.progress - a.progress);
    
    res.json({ success: true, leaderboard: leaderboard.slice(0, 20) });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
