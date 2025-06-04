// Reset Users Script
// This script will clear all user data from the database

const { db } = require('./database');

// Function to reset all database tables related to users
function resetDatabase() {
    console.log('Starting database reset...');
    
    try {
        // Begin transaction
        db.prepare('BEGIN TRANSACTION').run();
        
        // Delete all quiz results
        const deleteQuizResults = db.prepare('DELETE FROM quiz_results');
        const quizResultsDeleted = deleteQuizResults.run();
        console.log(`Deleted ${quizResultsDeleted.changes} quiz results`);
        
        // Delete all course stats
        const deleteCourseStats = db.prepare('DELETE FROM course_stats');
        const courseStatsDeleted = deleteCourseStats.run();
        console.log(`Deleted ${courseStatsDeleted.changes} course stats entries`);
        
        // Delete all user progress
        const deleteUserProgress = db.prepare('DELETE FROM user_progress');
        const userProgressDeleted = deleteUserProgress.run();
        console.log(`Deleted ${userProgressDeleted.changes} user progress entries`);
        
        // Delete all users
        const deleteUsers = db.prepare('DELETE FROM users');
        const usersDeleted = deleteUsers.run();
        console.log(`Deleted ${usersDeleted.changes} users`);
        
        // Reset auto-increment counters
        db.prepare('DELETE FROM sqlite_sequence WHERE name IN (\'users\', \'user_progress\', \'course_stats\', \'quiz_results\')').run();
        console.log('Reset auto-increment counters');
        
        // Commit transaction
        db.prepare('COMMIT').run();
        
        console.log('Database reset completed successfully');
    } catch (error) {
        // Rollback transaction if there was an error
        db.prepare('ROLLBACK').run();
        console.error('Error resetting database:', error);
    }
}

// Execute the reset function
resetDatabase();
