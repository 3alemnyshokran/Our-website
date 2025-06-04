/**
 * Authentication and user management system
 * Handles login, registration, session persistence, and privacy policy consent
 */

// Import API configuration
// API_BASE_URL will be initialized after the API config script loads
let API_BASE_URL;

// Set up to initialize API_BASE_URL once config is loaded
function initApiConfig() {
    if (typeof API !== 'undefined') {
        API_BASE_URL = API.getBaseUrl();
        console.log('API base URL initialized:', API_BASE_URL);
    } else {
        console.warn('API configuration not loaded yet');
    }
}

// Initialize when document is loaded or when API is available
document.addEventListener('DOMContentLoaded', initApiConfig);
// Also try to initialize immediately in case script is loaded after DOM
initApiConfig();

// Check if user is authenticated
function isAuthenticated() {
    // First check if we have a device token stored
    const deviceToken = localStorage.getItem('tutor_device_token');
    if (deviceToken) {
        // Device is remembered, auto-authenticate
        return true;
    }
    
    // Otherwise check standard authentication
    return localStorage.getItem('tutor_authenticated') === 'true' &&
           localStorage.getItem('tutor_username') !== null;
}

// Check if privacy policy is accepted
function isPrivacyAccepted() {
    return localStorage.getItem('privacyAccepted') === 'true';
}

// Redirect to register page if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        // Store the current page URL to redirect back after login
        localStorage.setItem('redirect_after_login', window.location.href);
        window.location.href = '/pages/auth/register.html';
        return false;
    }
    return true;
}

// Show privacy policy modal and return a promise that resolves when accepted
function showPrivacyModal() {
    return new Promise((resolve) => {
        // If already accepted, resolve immediately
        if (isPrivacyAccepted()) {
            resolve(true);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'privacy-modal';
        modal.innerHTML = `
            <div class="privacy-modal-content">
                <h2>Privacy Notice</h2>
                <p>This platform collects and stores information about your learning progress and preferences. Your data is stored in our database to provide personalized learning experiences and track your progress.</p>
                <p>We use cookies to remember your device and login status. This helps you avoid having to log in each time you visit.</p>
                <p>By clicking "Accept", you consent to our privacy policy and allow us to store and process this information.</p>
                <button class="privacy-accept-btn">Accept</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.classList.add('modal-open');
        
        modal.querySelector('.privacy-accept-btn').addEventListener('click', () => {
            localStorage.setItem('privacyAccepted', 'true');
            modal.remove();
            document.body.classList.remove('modal-open');
            resolve(true);
        });
    });
}

// Handle login logic
async function handleLogin(username, rememberMe) {
    try {
        // Make sure API is configured
        if (!API_BASE_URL && typeof API !== 'undefined') {
            API_BASE_URL = API.getBaseUrl();
        }
        
        // If we have the API helper available, use it for better error handling
        if (typeof API !== 'undefined' && API.fetch) {
            const result = await API.fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, rememberMe })
            });
            
            if (result.success) {
                // Store auth data in localStorage
                localStorage.setItem('tutor_authenticated', 'true');
                localStorage.setItem('tutor_username', username);
                localStorage.setItem('tutor_user_id', result.data.userId);
                
                if (rememberMe) {
                    // Generate and store a device token for automatic login
                    const deviceToken = generateDeviceToken();
                    localStorage.setItem('tutor_device_token', deviceToken);
                    localStorage.setItem('tutor_trusted', 'true');
                }
                
                // Get redirect URL if any
                const redirectUrl = localStorage.getItem('redirect_after_login') || '/index.html';
                localStorage.removeItem('redirect_after_login'); // Clear the redirect
                
                return {
                    success: true,
                    redirectUrl: redirectUrl
                };
            } else {
                return {
                    success: false,
                    message: result.error || 'Login failed. Please check your username.'
                };
            }
        } else {
            // Fallback to original implementation if API helper isn't available
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, rememberMe })
            });
            
            const data = await response.json();
            if (response.ok && data.success) {
                // Store auth data in localStorage
                localStorage.setItem('tutor_authenticated', 'true');
                localStorage.setItem('tutor_username', username);
                localStorage.setItem('tutor_user_id', data.userId);
                
                if (rememberMe) {
                    // Generate and store a device token for automatic login
                    const deviceToken = generateDeviceToken();
                    localStorage.setItem('tutor_device_token', deviceToken);
                    localStorage.setItem('tutor_trusted', 'true');
                }
                
                // Get redirect URL if any
                const redirectUrl = localStorage.getItem('redirect_after_login') || '/index.html';
                localStorage.removeItem('redirect_after_login'); // Clear the redirect
                
                return {
                    success: true,
                    redirectUrl: redirectUrl
                };
            } else {
                return {
                    success: false,
                    message: data.error || 'Login failed. Please check your username.'
                };
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Network error. Please check your internet connection and try again.'
        };
    }
}

// Handle registration logic
async function handleRegistration(username) {
    if (!username) {
        return {
            success: false,
            message: 'Username is required'
        };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        
        const data = await response.json();
          if (response.ok && data.success) {
            // Store auth data in localStorage
            localStorage.setItem('tutor_authenticated', 'true');
            localStorage.setItem('tutor_username', username);
            localStorage.setItem('tutor_user_id', data.userId);
            localStorage.setItem('tutor_trusted', 'false');
            
            // Clear any existing redirect to ensure we always go to home page
            localStorage.removeItem('redirect_after_login');
            
            return {
                success: true,
                message: 'Registration successful'
            };
        } else {
            return {
                success: false,
                message: data.error || 'Registration failed'
            };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: 'Network error. Please try again later.'
        };
    }
}

// Logout function
function logout() {
    localStorage.removeItem('tutor_authenticated');
    localStorage.removeItem('tutor_trusted');
    localStorage.removeItem('tutor_user_id');
    localStorage.removeItem('tutor_device_token');
    // Keep the username for easier re-login
    window.location.href = '/pages/auth/login.html';
}

// Get current username
function getCurrentUsername() {
    return localStorage.getItem('tutor_username');
}

// Get current user ID
function getCurrentUserId() {
    return localStorage.getItem('tutor_user_id');
}

// Generate a unique device token
function generateDeviceToken() {
    // Generate a random string to use as device token
    const tokenChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'device_';
    for (let i = 0; i < 32; i++) {
        token += tokenChars.charAt(Math.floor(Math.random() * tokenChars.length));
    }
    return token;
}

// Track user progress for a specific course and chapter
async function trackProgress(course, chapter, progress, completed, timeSpent = 0) {
    if (!isAuthenticated()) return;
    
    const userId = getCurrentUserId();
    
    try {
        const response = await fetch(`${API_BASE_URL}/progress/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                course,
                chapter,
                progress,
                completed,
                timeSpent
            })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error tracking progress:', error);
    }
}

// Get user progress for a specific course
async function getUserProgress(course) {
    if (!isAuthenticated()) return null;
    
    const userId = getCurrentUserId();
    
    try {
        const response = await fetch(`${API_BASE_URL}/progress/course/${userId}/${course}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            return data.progress;
        }
        return null;
    } catch (error) {
        console.error('Error fetching progress:', error);
        return null;
    }
}
