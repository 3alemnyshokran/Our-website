const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

// Import database
const { db, userQueries, progressQueries, quizQueries, leaderboardQueries } = require('./database');

// Import routes
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quiz');
const statusRoutes = require('./routes/status');

app.use(cors());
app.use(express.json());

// Register user - username only authentication
app.post('/api/register', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });
  
  try {
    // Check if user exists
    const existingUser = userQueries.getUserByUsername.get(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Create the user
    const result = userQueries.createUser.run(username);
    
    res.json({ 
      success: true, 
      userId: result.lastInsertRowid,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user - username only authentication
app.post('/api/login', (req, res) => {
  const { username, rememberMe } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });
  
  try {
    // Find user by username
    const user = userQueries.getUserByUsername.get(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update last login time
    userQueries.updateLastLogin.run(user.id);
    
    // Set trusted status if remember me is checked
    if (rememberMe) {
      userQueries.setUserTrusted.run(1, user.id);
    }
    
    res.json({ 
      success: true, 
      userId: user.id,
      username: user.username,
      trusted: user.is_trusted === 1
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Use progress routes
app.use('/api/progress', progressRoutes);

// Use quiz routes
app.use('/api/quiz', quizRoutes);

// Use status routes
app.use('/api/status', statusRoutes);

// Save user progress for a specific course and chapter
app.post('/api/progress/save', (req, res) => {
  const { userId, course, chapter, progress, completed, timeSpent } = req.body;
  
  if (!userId || !course || !chapter) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // Save chapter progress
    progressQueries.saveProgress.run(
      userId, 
      course, 
      chapter, 
      progress || 0, 
      completed ? 1 : 0
    );
    
    // Calculate course progress
    const chapters = progressQueries.getCourseProgress.all(userId, course);
    const totalChapters = chapters.length;
    const completedChapters = chapters.filter(ch => ch.completed === 1).length;
    const averageProgress = chapters.reduce((sum, ch) => sum + ch.progress, 0) / (totalChapters || 1);
    
    // Update course stats
    progressQueries.updateCourseStats.run(
      userId,
      course,
      averageProgress,
      completedChapters,
      timeSpent || 0
    );
    
    res.json({ 
      success: true,
      courseProgress: averageProgress,
      completedChapters
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = userQueries.getAllUsers.all();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user progress summary
app.get('/api/user/:userId/progress', (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get all course stats for the user
    const courseStats = progressQueries.getAllCourseStats.all(userId);
    
    // Get detailed progress for each course
    const progress = {};
    courseStats.forEach(stat => {
      const courseProgress = progressQueries.getCourseProgress.all(userId, stat.course);
      progress[stat.course] = {
        overall: stat.progress,
        completedChapters: stat.completed_chapters,
        lastAccessed: stat.last_accessed,
        chapters: courseProgress.reduce((acc, ch) => {
          acc[ch.chapter] = {
            progress: ch.progress,
            completed: ch.completed === 1,
            lastAccessed: ch.last_accessed
          };
          return acc;
        }, {})
      };
    });
    
    res.json({
      success: true,
      userId,
      progress
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
