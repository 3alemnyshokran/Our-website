// Progress Tracking API
const express = require('express');
const router = express.Router();
const { db, userQueries, progressQueries, leaderboardQueries } = require('../database');

// Get user progress for a specific course
router.get('/course/:userId/:course', (req, res) => {
  try {
    const { userId, course } = req.params;
    
    // Validate user exists
    const user = userQueries.getUserByUsername.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get course progress
    const courseProgress = progressQueries.getCourseProgress.all(user.id, course);
    const courseStats = progressQueries.getCourseStats.get(user.id, course);
    
    if (!courseStats) {
      return res.json({ 
        success: true, 
        progress: {
          overall: 0,
          completedChapters: 0,
          chapters: {}
        }
      });
    }
    
    // Format the response
    const chapterProgress = {};
    courseProgress.forEach(chapter => {
      chapterProgress[chapter.chapter] = {
        progress: chapter.progress,
        completed: chapter.completed === 1,
        lastAccessed: chapter.last_accessed
      };
    });
    
    res.json({ 
      success: true, 
      progress: {
        overall: courseStats.progress,
        completedChapters: courseStats.completed_chapters,
        totalTimeSpent: courseStats.total_time_spent,
        lastAccessed: courseStats.last_accessed,
        chapters: chapterProgress
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leaderboard for a specific course
router.get('/leaderboard/:course', (req, res) => {
  try {
    const { course } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get leaderboard data
    const leaderboard = leaderboardQueries.getCourseLeaderboard.all(course, limit);
    
    res.json({ 
      success: true, 
      course,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        progress: entry.progress,
        completedChapters: entry.completed_chapters,
        lastActive: entry.last_accessed
      }))
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset user progress (for testing or user requests)
router.post('/reset/:userId/:course', (req, res) => {
  try {
    const { userId, course } = req.params;
    
    // Validate user exists
    const user = userQueries.getUserByUsername.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete course progress and stats for this user
    db.prepare('DELETE FROM user_progress WHERE user_id = ? AND course = ?').run(user.id, course);
    db.prepare('DELETE FROM course_stats WHERE user_id = ? AND course = ?').run(user.id, course);
    
    res.json({ success: true, message: 'Progress reset successfully' });
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
