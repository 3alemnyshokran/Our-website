# Educational Platform Project

## Authentication System

The platform now includes a comprehensive authentication system that:

1. Ensures every HTML page starts with a login screen for unauthenticated users
2. Displays a privacy policy prompt that users must accept
3. Collects and stores user data including username
4. Redirects users to the home screen after successful authentication

## How Authentication Works

- **auth.js**: Core authentication module with functions for login, registration, and session management
- **auth-protection.js**: Protection script that can be included in any page to enforce authentication
- **Privacy Policy**: Shown after login if not previously accepted
- **Remember Me**: Option to stay logged in on trusted devices

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
│   │   ├── auth.js               # Authentication system
│   │   ├── auth-protection.js    # Page protection script
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
    └── en.json                   # English translations

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

## Security Note

This implementation uses browser localStorage for demonstration purposes. In a production environment, consider:

- Using secure HTTP-only cookies for authentication tokens
- Implementing proper server-side authentication with JWT or sessions
- Adding CSRF protection
- Using HTTPS for all connections
```
