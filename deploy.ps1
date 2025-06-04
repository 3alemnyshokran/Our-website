# Deployment script for the tutoring website

Write-Host "Preparing for deployment..." -ForegroundColor Cyan

# Check if backend exists and install dependencies
if (Test-Path "backend") {  Write-Host "Setting up backend and database..." -ForegroundColor Yellow
  Set-Location -Path "backend"
  npm install
  
  # Create database directory if it doesn't exist
  if (-not (Test-Path "db")) {
    New-Item -ItemType Directory -Path "db"
    Write-Host "Created database directory" -ForegroundColor Green
  }
  
  Write-Host "Database server setup complete." -ForegroundColor Green
  Set-Location -Path ".."
}

# Install frontend dependencies if any
if (Test-Path "package.json") {
  Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
  npm install
}

# Check for Vercel CLI
try {
  $vercelVersion = vercel --version
  Write-Host "Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
  Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
  npm install -g vercel
}

# Create Vercel configuration for database
Write-Host "Configuring Vercel for database support..." -ForegroundColor Yellow
if (-not (Test-Path "api")) {
  New-Item -ItemType Directory -Path "api"
  Write-Host "Created API directory for Vercel serverless functions" -ForegroundColor Green
}

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Your site with the new authentication and database system should now be live." -ForegroundColor Cyan
Write-Host "The site now includes username-only authentication with device remembering." -ForegroundColor Yellow
Write-Host "Users will be prompted for cookie consent on first visit." -ForegroundColor Yellow
Write-Host "The website now starts with the sign-up screen with visible privacy notice." -ForegroundColor Yellow
Write-Host "Remember to test the authentication flow and database functionality on all pages." -ForegroundColor Yellow

# Create a readme for the database setup
$readmeContent = @"
# Database Setup for Tutoring Website

This project uses a SQLite database for storing user information, progress, and quiz results.

## Setup Instructions

1. Make sure you have Node.js installed on your system
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Start the database server: `node server.js` or use the provided `start-db-server.bat` file

## Database Structure

- **Users Table**: Stores user information (username, last login, trusted status)
- **User Progress Table**: Tracks chapter-by-chapter progress for each user
- **Course Stats Table**: Maintains overall course progress for each user
- **Quiz Results Table**: Records quiz scores and performance data

## API Endpoints

- `/api/login` - User login (username only)
- `/api/register` - User registration (username only)
- `/api/progress/save` - Save user progress for a course/chapter
- `/api/progress/course/:userId/:course` - Get progress for a specific course
- `/api/quiz/save` - Save quiz results
- `/api/quiz/:userId` - Get all quiz results for a user
- `/api/status` - Check database server status

## Troubleshooting

If you encounter connection issues:
1. Check that the database server is running
2. Verify that port 3001 is not in use by another application
3. Check the console for error messages
"@

Set-Content -Path "README-DB.md" -Value $readmeContent
Write-Host "Created database setup documentation in README-DB.md" -ForegroundColor Green
