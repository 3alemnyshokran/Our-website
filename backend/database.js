// database.js - SQLite Database Implementation
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Ensure the database directory exists
const DB_DIR = path.join(__dirname, 'db');
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
}

// Initialize the database
const db = new Database(path.join(DB_DIR, 'tutor.db'), { verbose: console.log });

// Initialize tables
function initDatabase() {
    // Create users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_trusted INTEGER DEFAULT 0
        )
    `);
    
    // Create user_progress table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course TEXT NOT NULL,
            chapter TEXT NOT NULL,
            progress REAL DEFAULT 0,
            completed INTEGER DEFAULT 0,
            last_accessed TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, course, chapter)
        )
    `);
    
    // Create course_stats table for overall course progress
    db.exec(`
        CREATE TABLE IF NOT EXISTS course_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course TEXT NOT NULL,
            progress REAL DEFAULT 0,
            completed_chapters INTEGER DEFAULT 0,
            total_time_spent INTEGER DEFAULT 0,
            last_accessed TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, course)
        )
    `);
    
    // Create quiz_results table
    db.exec(`
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course TEXT NOT NULL,
            chapter TEXT NOT NULL,
            quiz_id TEXT NOT NULL,
            score REAL NOT NULL,
            correct_answers INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);
    
    console.log('Database initialized successfully');
}

// Initialize the database
initDatabase();

// User-related queries
const userQueries = {
    // Create a new user
    createUser: db.prepare('INSERT INTO users (username) VALUES (?)'),
    
    // Get a user by username
    getUserByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
    
    // Update user's last login
    updateLastLogin: db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'),
    
    // Set user as trusted
    setUserTrusted: db.prepare('UPDATE users SET is_trusted = ? WHERE id = ?'),
    
    // Delete a user
    deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),
    
    // Get all users
    getAllUsers: db.prepare('SELECT * FROM users')
};

// Progress-related queries
const progressQueries = {
    // Save or update chapter progress
    saveProgress: db.prepare(`
        INSERT INTO user_progress (user_id, course, chapter, progress, completed, last_accessed)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, course, chapter) 
        DO UPDATE SET 
            progress = excluded.progress,
            completed = excluded.completed,
            last_accessed = CURRENT_TIMESTAMP
    `),
    
    // Get progress for a specific chapter
    getChapterProgress: db.prepare(`
        SELECT * FROM user_progress 
        WHERE user_id = ? AND course = ? AND chapter = ?
    `),
    
    // Get all progress for a course
    getCourseProgress: db.prepare(`
        SELECT * FROM user_progress 
        WHERE user_id = ? AND course = ?
    `),
    
    // Get all progress for a user
    getUserProgress: db.prepare(`
        SELECT * FROM user_progress 
        WHERE user_id = ?
    `),
    
    // Update course stats
    updateCourseStats: db.prepare(`
        INSERT INTO course_stats (user_id, course, progress, completed_chapters, total_time_spent, last_accessed)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, course) 
        DO UPDATE SET 
            progress = excluded.progress,
            completed_chapters = excluded.completed_chapters,
            total_time_spent = total_time_spent + excluded.total_time_spent,
            last_accessed = CURRENT_TIMESTAMP
    `),
    
    // Get course stats
    getCourseStats: db.prepare(`
        SELECT * FROM course_stats 
        WHERE user_id = ? AND course = ?
    `),
    
    // Get all course stats for a user
    getAllCourseStats: db.prepare(`
        SELECT * FROM course_stats 
        WHERE user_id = ?
    `)
};

// Quiz results queries
const quizQueries = {
    // Save quiz result
    saveQuizResult: db.prepare(`
        INSERT INTO quiz_results (user_id, course, chapter, quiz_id, score, correct_answers, total_questions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `),
    
    // Get quiz results for a chapter
    getChapterQuizResults: db.prepare(`
        SELECT * FROM quiz_results 
        WHERE user_id = ? AND course = ? AND chapter = ?
    `),
    
    // Get all quiz results for a user
    getUserQuizResults: db.prepare(`
        SELECT * FROM quiz_results 
        WHERE user_id = ?
    `)
};

// Leaderboard queries
const leaderboardQueries = {
    // Get top performers for a course
    getCourseLeaderboard: db.prepare(`
        SELECT u.username, cs.progress, cs.completed_chapters, cs.last_accessed
        FROM course_stats cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.course = ?
        ORDER BY cs.progress DESC, cs.completed_chapters DESC
        LIMIT ?
    `)
};

module.exports = {
    db,
    userQueries,
    progressQueries,
    quizQueries,
    leaderboardQueries
};
