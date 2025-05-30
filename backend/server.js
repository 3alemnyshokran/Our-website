const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3001;

// Import routes
const progressRoutes = require('./routes/progress');

app.use(cors());
app.use(express.json());

const DB_FILE = './users.json';

// Helper functions
function readDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Register user
app.post('/api/register', async (req, res) => {
  const { username, password, ip, device } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  const db = readDB();
  if (db[username]) return res.status(409).json({ error: 'User already exists' });
  const hash = await bcrypt.hash(password, 10);
  db[username] = { password: hash, ip, device, analytics: {} };
  writeDB(db);
  res.json({ success: true });
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db[username];
  if (!user) return res.status(404).json({ error: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid password' });
  res.json({ success: true });
});

// Use progress routes
app.use('/api/progress', progressRoutes);

// Save analytics (progress, grades, time, test results)
app.post('/api/analytics', (req, res) => {
  const { username, analytics } = req.body;
  if (!username || !analytics) return res.status(400).json({ error: 'Missing username or analytics' });
  const db = readDB();
  if (!db[username]) return res.status(404).json({ error: 'User not found' });
  db[username].analytics = { ...db[username].analytics, ...analytics };
  writeDB(db);
  res.json({ success: true });
});

// Get all users (admin)
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db);
});

// Get single user (admin)
app.get('/api/user/:username', (req, res) => {
  const db = readDB();
  const user = db[req.params.username];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
