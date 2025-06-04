# Database Setup for Tutoring Website

This project uses a SQLite database for storing user information, progress, and quiz results.

## Setup Instructions

1. Make sure you have Node.js installed on your system
2. Navigate to the backend directory: cd backend
3. Install dependencies: 
pm install
4. Start the database server: 
ode server.js or use the provided start-db-server.bat file

## Database Structure

- **Users Table**: Stores user information (username, last login, trusted status)
- **User Progress Table**: Tracks chapter-by-chapter progress for each user
- **Course Stats Table**: Maintains overall course progress for each user
- **Quiz Results Table**: Records quiz scores and performance data

## API Endpoints

- /api/login - User login (username only)
- /api/register - User registration (username only)
- /api/progress/save - Save user progress for a course/chapter
- /api/progress/course/:userId/:course - Get progress for a specific course
- /api/quiz/save - Save quiz results
- /api/quiz/:userId - Get all quiz results for a user
- /api/status - Check database server status

## Troubleshooting

If you encounter connection issues:
1. Check that the database server is running
2. Verify that port 3001 is not in use by another application
3. Check the console for error messages
