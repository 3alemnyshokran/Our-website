// Quiz API routes
const express = require('express');
const router = express.Router();
const { db, userQueries, quizQueries } = require('../database');

// Save quiz result
router.post('/save', (req, res) => {
  try {
    const { userId, course, chapter, quizId, score, correctAnswers, totalQuestions } = req.body;
    
    // Validate required fields
    if (!userId || !course || !chapter || !quizId || score === undefined || 
        !correctAnswers || !totalQuestions) {
      return res.status(400).json({ error: 'Missing required quiz data' });
    }
    
    // Validate user exists
    const user = userQueries.getUserByUsername.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Save quiz result
    quizQueries.saveQuizResult.run(
      user.id,
      course,
      chapter,
      quizId,
      score,
      correctAnswers,
      totalQuestions
    );
    
    // Return success
    res.json({ 
      success: true,
      message: 'Quiz result saved successfully'
    });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get quiz results for a user in a specific course and chapter
router.get('/:userId/:course/:chapter', (req, res) => {
  try {
    const { userId, course, chapter } = req.params;
    
    // Validate user exists
    const user = userQueries.getUserByUsername.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get quiz results
    const results = quizQueries.getChapterQuizResults.all(user.id, course, chapter);
    
    // Return quiz results
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error getting quiz results:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all quiz results for a user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user exists
    const user = userQueries.getUserByUsername.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get all quiz results
    const results = quizQueries.getUserQuizResults.all(user.id);
    
    // Group by course and chapter
    const groupedResults = {};
    results.forEach(result => {
      if (!groupedResults[result.course]) {
        groupedResults[result.course] = {};
      }
      
      if (!groupedResults[result.course][result.chapter]) {
        groupedResults[result.course][result.chapter] = [];
      }
      
      groupedResults[result.course][result.chapter].push({
        quizId: result.quiz_id,
        score: result.score,
        correctAnswers: result.correct_answers,
        totalQuestions: result.total_questions,
        completedAt: result.completed_at
      });
    });
    
    // Return grouped quiz results
    res.json({
      success: true,
      results: groupedResults
    });
  } catch (error) {
    console.error('Error getting quiz results:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get quiz leaderboard
router.get('/leaderboard/:course/:chapter/:quizId', (req, res) => {
  try {
    const { course, chapter, quizId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get top performers for this quiz
    const leaderboard = db.prepare(`
      SELECT u.username, qr.score, qr.correct_answers, qr.total_questions, qr.completed_at
      FROM quiz_results qr
      JOIN users u ON qr.user_id = u.id
      WHERE qr.course = ? AND qr.chapter = ? AND qr.quiz_id = ?
      ORDER BY qr.score DESC, qr.correct_answers DESC
      LIMIT ?
    `).all(course, chapter, quizId, limit);
    
    res.json({ 
      success: true, 
      course,
      chapter,
      quizId,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        score: entry.score,
        correctAnswers: entry.correct_answers,
        totalQuestions: entry.total_questions,
        completedAt: entry.completed_at
      }))
    });
  } catch (error) {
    console.error('Error fetching quiz leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
