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

// Create course_progress table to track user progress in courses
db.run(`CREATE TABLE IF NOT EXISTS course_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  course TEXT NOT NULL,
  chapter TEXT NOT NULL,
  status TEXT DEFAULT 'started', /* started, in-progress, completed */
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  time_spent INTEGER DEFAULT 0, /* in seconds */
  completed_on DATETIME,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES users(username)
)`);

// Create course_activity table to track all user interactions with courses
db.run(`CREATE TABLE IF NOT EXISTS course_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  course TEXT NOT NULL,
  chapter TEXT NOT NULL,
  action TEXT NOT NULL, /* started, continued, completed, quiz-attempt */
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
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

// Track course progress
app.post('/api/progress', (req, res) => {
  const { username, course, chapter, status, score, maxScore, timeSpent } = req.body;
  
  if (!username || !course || !chapter) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if record exists
  db.get(
    'SELECT * FROM course_progress WHERE username = ? AND course = ? AND chapter = ?',
    [username, course, chapter],
    (err, progress) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      const completedOn = status === 'completed' ? new Date().toISOString() : null;
      
      if (progress) {
        // Update existing progress
        db.run(
          `UPDATE course_progress 
           SET status = ?, score = ?, max_score = ?, time_spent = time_spent + ?, 
               completed_on = COALESCE(?, completed_on), last_accessed = CURRENT_TIMESTAMP
           WHERE username = ? AND course = ? AND chapter = ?`,
          [
            status || progress.status,
            score !== undefined ? score : progress.score,
            maxScore !== undefined ? maxScore : progress.max_score,
            timeSpent || 0,
            completedOn,
            username, course, chapter
          ],
          (err) => {
            if (err) return res.status(500).json({ error: 'DB error on update' });
            
            // Log this activity
            db.run(
              'INSERT INTO course_activity (username, course, chapter, action, details) VALUES (?, ?, ?, ?, ?)',
              [username, course, chapter, status === 'completed' ? 'completed' : 'continued', JSON.stringify({ score, timeSpent })],
              (err) => {
                if (err) console.error('Failed to log course activity:', err);
              }
            );
            
            res.json({ success: true, action: 'updated' });
          }
        );
      } else {
        // Insert new progress
        db.run(
          `INSERT INTO course_progress 
           (username, course, chapter, status, score, max_score, time_spent, completed_on)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            username, course, chapter,
            status || 'started',
            score || 0,
            maxScore || 100,
            timeSpent || 0,
            completedOn
          ],
          (err) => {
            if (err) return res.status(500).json({ error: 'DB error on insert' });
            
            // Log this activity
            db.run(
              'INSERT INTO course_activity (username, course, chapter, action, details) VALUES (?, ?, ?, ?, ?)',
              [username, course, chapter, 'started', JSON.stringify({ score, timeSpent })],
              (err) => {
                if (err) console.error('Failed to log course activity:', err);
              }
            );
            
            res.json({ success: true, action: 'created' });
          }
        );
      }
    }
  );
});

// Get user progress for a specific course
app.get('/api/progress/:username/:course', (req, res) => {
  const { username, course } = req.params;
  
  db.all(
    'SELECT * FROM course_progress WHERE username = ? AND course = ? ORDER BY last_accessed DESC',
    [username, course],
    (err, progress) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      // Calculate overall course progress
      const totalChapters = progress.length;
      const completedChapters = progress.filter(p => p.status === 'completed').length;
      const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      
      res.json({
        success: true,
        progress,
        stats: {
          totalChapters,
          completedChapters,
          overallProgress
        }
      });
    }
  );
});

// Get all user progress (for admin dashboard)
app.get('/api/admin/all-progress', (req, res) => {
  // In a real app, you would authenticate this endpoint for admins only
  db.all(
    `SELECT 
      cp.username, 
      cp.course, 
      COUNT(cp.chapter) as total_chapters,
      SUM(CASE WHEN cp.status = 'completed' THEN 1 ELSE 0 END) as completed_chapters,
      AVG(cp.score) as average_score,
      SUM(cp.time_spent) as total_time_spent,
      MAX(cp.last_accessed) as last_activity
     FROM course_progress cp
     GROUP BY cp.username, cp.course
     ORDER BY cp.username, cp.course`,
    [],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      // Calculate overall progress for each user-course combination
      const progressData = results.map(item => ({
        ...item,
        progress_percentage: Math.round((item.completed_chapters / item.total_chapters) * 100)
      }));
      
      res.json({ success: true, data: progressData });
    }
  );
});

// Get detailed progress for a specific user (for admin dashboard)
app.get('/api/admin/user-progress/:username', (req, res) => {
  const { username } = req.params;
  
  db.all(
    'SELECT * FROM course_progress WHERE username = ? ORDER BY course, last_accessed DESC',
    [username],
    (err, progress) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      // Group by course
      const courseProgress = {};
      progress.forEach(item => {
        if (!courseProgress[item.course]) {
          courseProgress[item.course] = {
            chapters: [],
            totalChapters: 0,
            completedChapters: 0,
            averageScore: 0,
            totalTimeSpent: 0
          };
        }
        
        courseProgress[item.course].chapters.push(item);
        courseProgress[item.course].totalChapters++;
        if (item.status === 'completed') {
          courseProgress[item.course].completedChapters++;
        }
        courseProgress[item.course].averageScore += item.score;
        courseProgress[item.course].totalTimeSpent += item.time_spent;
      });
      
      // Calculate averages and percentages
      Object.keys(courseProgress).forEach(course => {
        const data = courseProgress[course];
        data.progressPercentage = Math.round((data.completedChapters / data.totalChapters) * 100);
        data.averageScore = Math.round(data.averageScore / data.totalChapters);
      });
      
      res.json({ success: true, username, courseProgress });
    }
  );
});

// Get recent course activity (for admin dashboard)
app.get('/api/admin/recent-activity', (req, res) => {
  const limit = req.query.limit || 20;
  
  db.all(
    `SELECT ca.*, u.username 
     FROM course_activity ca
     JOIN users u ON ca.username = u.username
     ORDER BY ca.timestamp DESC
     LIMIT ?`,
    [limit],
    (err, activity) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ success: true, activity });
    }
  );
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

// Check username availability
app.get('/api/check-username/:username', (req, res) => {
  const { username } = req.params;
  
  if (!username || username.trim() === '') {
    return res.status(400).json({ 
      available: false, 
      error: 'Username cannot be empty' 
    });
  }
  
  db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        available: false, 
        error: 'Database error occurred' 
      });
    }
    
    res.json({ 
      available: !row,
      exists: !!row
    });
  });
});

// Update username
app.post('/api/update-username', async (req, res) => {
  const { currentUsername, newUsername, password } = req.body;
  
  if (!currentUsername || !newUsername || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }
  
  // First, verify the user's password
  db.get('SELECT * FROM users WHERE username = ?', [currentUsername], async (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error occurred' 
      });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }
    
    // Check if new username is available
    db.get('SELECT username FROM users WHERE username = ?', [newUsername], (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Database error occurred' 
        });
      }
      
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          error: 'Username already taken' 
        });
      }
      
      // Update username in the users table
      db.run('UPDATE users SET username = ? WHERE username = ?', [newUsername, currentUsername], function(err) {
        if (err) {
          console.error('Failed to update username:', err);
          return res.status(500).json({ 
            success: false, 
            error: 'Failed to update username' 
          });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ 
            success: false, 
            error: 'User not found or no changes made' 
          });
        }
        
        // Update username in course_progress table
        db.run('UPDATE course_progress SET username = ? WHERE username = ?', [newUsername, currentUsername], (err) => {
          if (err) console.error('Failed to update username in course_progress:', err);
        });
        
        // Update username in course_activity table
        db.run('UPDATE course_activity SET username = ? WHERE username = ?', [newUsername, currentUsername], (err) => {
          if (err) console.error('Failed to update username in course_activity:', err);
        });
        
        // Update username in login_devices table
        db.run('UPDATE login_devices SET username = ? WHERE username = ?', [newUsername, currentUsername], (err) => {
          if (err) console.error('Failed to update username in login_devices:', err);
        });
        
        res.json({ 
          success: true, 
          message: 'Username updated successfully' 
        });
      });
    });
  });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
