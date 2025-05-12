# Educational Platform Project

## Project Structure

The project follows a well-organized structure:

```
eduproject/
├── index.html                    # Main landing page
├── assets/                       # Static assets
│   ├── css/                      # Stylesheets
│   │   ├── styles.css            # Main CSS
│   │   ├── test-styles.css       # Test page styles
│   │   └── [language]/           # Language-specific styles
│   ├── js/                       # JavaScript files
│   │   ├── main.js               # Main JavaScript
│   │   └── test-functions.js     # Test page functions
│   └── images/                   # Image assets
├── pages/                        # HTML pages
│   ├── admin/                    # Admin pages
│   │   └── dashboard.html        # Admin dashboard
│   ├── auth/                     # Authentication pages
│   │   ├── login.html            # Login page
│   │   └── register.html         # Registration page
│   ├── courses/                  # Course content
│   │   ├── arabic/               # Arabic course
│   │   │   ├── arabic-course.html
│   │   │   └── chapters/         # Course chapters
│   │   ├── english/              # English course
│   │   │   ├── english-course.html
│   │   │   └── chapters/         # Course chapters
│   │   ├── german/               # German course
│   │   │   ├── german-course.html
│   │   │   └── chapters/         # Course chapters
│   │   ├── math/                 # Math course
│   │   │   ├── math-course.html
│   │   │   └── chapters/         # Course chapters
│   │   └── science/              # Science course
│   │       ├── science-course.html
│   │       └── chapters/         # Course chapters
│   ├── profile/                  # User profile pages
│   │   └── profile-setup.html    # Profile setup page
│   └── tests/                    # Assessment tests
│       └── placement-test.html   # Placement test
├── backend/                      # Server-side code
│   ├── server.js                 # Main server file
│   ├── package.json              # Dependencies
│   └── public/                   # Public server files
└── locales/                      # Translations
    ├── ar.json                   # Arabic translations
    ├── de.json                   # German translations
    ├── en.json                   # English translations
    ├── es.json                   # Spanish translations
    └── fr.json                   # French translations
```

## About the Project

This educational platform offers courses in multiple languages (German, English, Arabic) and subjects (Math, Science). The platform includes:

- Interactive learning experiences across multiple subjects
- User authentication system
- User profiles with progress tracking
- Multilingual support with full RTL capability for Arabic
- Placement tests to determine user skill level
- Admin dashboard for content management

## Development

To run the project locally:

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Start the server: `node server.js`
5. Open `index.html` in your browser

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- Database: MongoDB (configured in server.js)
