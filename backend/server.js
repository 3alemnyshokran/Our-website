const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./users.db');

// Create users table if not exists
// username (unique), password (hashed), ip, device, analytics (JSON)
db.run(`CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  ip TEXT,
  device TEXT,
  analytics TEXT
)`);

// Create login_devices table to track all login information
db.run(`CREATE TABLE IF NOT EXISTS login_devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  ip TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  login_success BOOLEAN,
  FOREIGN KEY (username) REFERENCES users(username)
)`);

// Register user
app.post('/api/register', async (req, res) => {
  const { username, password, ip, device, browser, os } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  db.get('SELECT username FROM users WHERE username = ?', [username], async (err, row) => {
    if (row) return res.status(409).json({ error: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, ip, device, analytics) VALUES (?, ?, ?, ?, ?)',
      [username, hash, ip, device, JSON.stringify({})],
      (err) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        
        // Record the registration device info
        db.run('INSERT INTO login_devices (username, ip, device, browser, os, login_success) VALUES (?, ?, ?, ?, ?, ?)',
          [username, ip, device, browser, os, true], 
          (err) => {
            if (err) console.error('Failed to record device info:', err);
          }
        );
        
        res.json({ success: true });
      }
    );
  });
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password, ip, device, browser, os } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (!user) {
      // Record failed login attempt
      if (username) {
        db.run('INSERT INTO login_devices (username, ip, device, browser, os, login_success) VALUES (?, ?, ?, ?, ?, ?)',
          [username, ip || 'unknown', device || 'unknown', browser || 'unknown', os || 'unknown', false]
        );
      }
      return res.status(404).json({ error: 'User not found' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Record failed login attempt
      db.run('INSERT INTO login_devices (username, ip, device, browser, os, login_success) VALUES (?, ?, ?, ?, ?, ?)',
        [username, ip || 'unknown', device || 'unknown', browser || 'unknown', os || 'unknown', false]
      );
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Record successful login
    db.run('INSERT INTO login_devices (username, ip, device, browser, os, login_success) VALUES (?, ?, ?, ?, ?, ?)',
      [username, ip || 'unknown', device || 'unknown', browser || 'unknown', os || 'unknown', true]
    );
    
    // Return success along with a token that could be stored in cookies
    res.json({ 
      success: true, 
      username,
      token: Buffer.from(`${username}:${Date.now()}`).toString('base64')
    });
  });
});

// Save analytics (progress, grades, time, test results)
app.post('/api/analytics', (req, res) => {
  const { username, analytics } = req.body;
  if (!username || !analytics) return res.status(400).json({ error: 'Missing username or analytics' });
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (!user) return res.status(404).json({ error: 'User not found' });
    const mergedAnalytics = { ...JSON.parse(user.analytics || '{}'), ...analytics };
    db.run('UPDATE users SET analytics = ? WHERE username = ?', [JSON.stringify(mergedAnalytics), username], (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ success: true });
    });
  });
});

// Get all users (admin)
app.get('/api/users', (req, res) => {
  db.all('SELECT username, ip, device, analytics FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Get single user (admin)
app.get('/api/user/:username', (req, res) => {
  db.get('SELECT username, ip, device, analytics FROM users WHERE username = ?', [req.params.username], (err, user) => {
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

// Get all login devices for a user (for password recovery by admin)
app.get('/api/admin/user-devices/:username', (req, res) => {
  const { username } = req.params;
  // In a real app, you would authenticate this endpoint for admins only
  db.all('SELECT * FROM login_devices WHERE username = ? ORDER BY timestamp DESC', [username], (err, devices) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ devices });
  });
});

// Get all login attempts (for admin dashboard)
app.get('/api/admin/login-history', (req, res) => {
  // In a real app, you would authenticate this endpoint for admins only
  db.all('SELECT * FROM login_devices ORDER BY timestamp DESC LIMIT 100', [], (err, history) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ history });
  });
});

// Export login history as a text file
app.get('/api/admin/export-login-history', (req, res) => {
  // In a real app, you would authenticate this endpoint for admins only
  db.all('SELECT * FROM login_devices ORDER BY timestamp DESC', [], (err, history) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    
    // Format data as text
    let textContent = 'Login History Export\n';
    textContent += '===================\n\n';
    
    history.forEach(entry => {
      textContent += `Username: ${entry.username}\n`;
      textContent += `Timestamp: ${entry.timestamp}\n`;
      textContent += `IP Address: ${entry.ip}\n`;
      textContent += `Device: ${entry.device}\n`;
      textContent += `Browser: ${entry.browser}\n`;
      textContent += `OS: ${entry.os}\n`;
      textContent += `Login Success: ${entry.login_success ? 'Yes' : 'No'}\n`;
      textContent += '-------------------\n\n';
    });
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=login-history.txt');
    res.send(textContent);
  });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
