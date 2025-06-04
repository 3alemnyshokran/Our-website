# Educational Platform Project

## Authentication System

The platform includes a comprehensive authentication system that:

1. Ensures every HTML page starts with a login screen for unauthenticated users
2. Displays a privacy policy prompt that users must accept
3. Collects and stores user data including username in a SQLite database
4. Redirects users to the home screen after successful authentication
5. Tracks and stores user progress for each course and chapter

## Database Features

The system now uses a SQLite database to store:

1. User accounts (username only, no password required)
2. Course progress for each user
3. Chapter completion status
4. Quiz results and scores
5. Time spent on each course

## How to Run the Project

### Start the Database Server

Before using the website, you need to start the database server:

#### Windows:
```
start-db-server.bat
```

#### Manual Setup:
1. Navigate to the backend folder:
```
cd backend
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
node server.js
```

### Using the Website

1. After starting the database server, open `index.html` in your browser
2. Register a new account or log in with an existing username
3. Accept the privacy policy
4. Navigate through the courses and your progress will be automatically saved

## Project Structure

The project follows a well-organized structure:

```
eduproject/
├── index.html                    # Main landing page
├── assets/                       # Static assets
│   ├── css/                      # Stylesheets
│   │   ├── styles.css            # Main CSS
│   │   └── test-styles.css       # Test page styles
│   ├── js/                       # JavaScript files
│   │   ├── main.js               # Main JavaScript
│   │   ├── auth.js               # Authentication system
│   │   ├── auth-protection.js    # Page protection script
│   │   ├── tracking.js           # Progress tracking
│   │   └── test-functions.js     # Test page functions
├── pages/                        # HTML pages
│   ├── admin/                    # Admin pages
│   │   └── dashboard.html        # Admin dashboard
│   ├── auth/                     # Authentication pages
│   │   ├── login.html            # Login page
│   │   └── register.html         # Registration page
│   ├── courses/                  # Course content
│   │   ├── arabic/               # Arabic course
│   │   ├── english/              # English course
│   │   ├── german/               # German course
│   │   ├── math/                 # Math course
│   │   └── science/              # Science course
│   ├── profile/                  # User profile pages
│   └── tests/                    # Assessment tests
├── backend/                      # Server-side code
│   ├── server.js                 # Main server file
│   ├── database.js               # Database module
│   ├── db/                       # SQLite database files
│   ├── routes/                   # API routes
│   └── package.json              # Dependencies
└── locales/                      # Translations
    ├── ar.json                   # Arabic translations
    ├── de.json                   # German translations
    ├── en.json                   # English translations
    ├── es.json                   # Spanish translations
    └── fr.json                   # French translations
```

## Deployment

### Deploy to Vercel

To deploy the project to Vercel, run one of the following commands:

#### Linux/macOS:
```bash
./deploy.sh
```

#### Windows:
```powershell
.\deploy.ps1
```

## Adding Authentication to New Pages

To add authentication protection to a new page:

1. Include the auth.js script in the head section:
```html
<script src="/assets/js/auth.js"></script>
```

2. Add the auth-protection.js script at the end of the body:
```html
<script src="/assets/js/auth-protection.js"></script>
```

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login with username

### Progress Tracking
- `POST /api/progress/save` - Save user progress for a course/chapter
- `GET /api/user/:userId/progress` - Get all progress for a user
- `GET /api/progress/course/:userId/:course` - Get progress for a specific course
- `POST /api/progress/reset/:userId/:course` - Reset progress for a course

### Leaderboards
- `GET /api/progress/leaderboard/:course` - Get leaderboard for a course

## Security Note

This implementation uses browser localStorage for demonstration purposes. In a production environment, consider:

- Using secure HTTP-only cookies for authentication tokens
- Implementing proper server-side authentication with JWT or sessions
- Adding CSRF protection
- Using HTTPS for all connections
```
