/**
 * Authentication and user management system
 * Handles login, registration, session persistence, and privacy policy consent
 */

// API URL
const API_BASE_URL = 'http://localhost:3001/api';

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('tutor_authenticated') === 'true' &&
           localStorage.getItem('tutor_username') !== null;
}

// Check if privacy policy is accepted
function isPrivacyAccepted() {
    return localStorage.getItem('privacyAccepted') === 'true';
}

// Redirect to login page if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        // Store the current page URL to redirect back after login
        localStorage.setItem('redirect_after_login', window.location.href);
        window.location.href = '/pages/auth/login.html';
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
                <p>We use this information to improve our educational content, analyze learning patterns, and offer features like personalized recommendations and leaderboards.</p>
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
            
            if (data.trusted || rememberMe) {
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
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Network error. Please try again later.'
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
