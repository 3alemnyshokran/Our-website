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

// Register user
app.post('/api/register', async (req, res) => {
  const { username, password, ip, device } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  db.get('SELECT username FROM users WHERE username = ?', [username], async (err, row) => {
    if (row) return res.status(409).json({ error: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, ip, device, analytics) VALUES (?, ?, ?, ?, ?)',
      [username, hash, ip, device, JSON.stringify({})],
      (err) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ success: true });
      }
    );
  });
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });
    res.json({ success: true, username });
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

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
