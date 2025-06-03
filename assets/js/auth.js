/**
 * Authentication and user management system
 * Handles login, registration, session persistence, and privacy policy consent
 */

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
                <p>This platform collects and stores information about your learning progress and preferences using browser local storage. Your data is kept on your device and is not transmitted to our servers.</p>
                <p>We use this information to provide personalized learning experiences, track your progress, and save your preferences.</p>
                <p>By clicking "Accept", you consent to our privacy policy and allow us to store this information.</p>
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
function handleLogin(username, password, rememberMe) {
    const savedUsername = localStorage.getItem('tutor_username');
    const savedPassword = localStorage.getItem('tutor_password');
    const trusted = localStorage.getItem('tutor_trusted') === 'true';
    
    if (username === savedUsername && (btoa(password) === savedPassword || trusted)) {
        // Set authentication state
        localStorage.setItem('tutor_authenticated', 'true');
        
        // Update trusted device if remember me is checked
        if (rememberMe) {
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
            message: 'Incorrect username or password'
        };
    }
}

// Handle registration logic
function handleRegistration(username, email, password) {
    // Store user data
    localStorage.setItem('tutor_username', username);
    localStorage.setItem('tutor_email', email);
    localStorage.setItem('tutor_password', btoa(password)); // Base64 encoding (not secure, just for demo)
    localStorage.setItem('tutor_authenticated', 'true');
    localStorage.setItem('tutor_trusted', 'false');
    
    return {
        success: true
    };
}

// Logout function
function logout() {
    localStorage.removeItem('tutor_authenticated');
    localStorage.removeItem('tutor_trusted');
    window.location.href = '/pages/auth/login.html';
}

// Get current username
function getCurrentUsername() {
    return localStorage.getItem('tutor_username');
}
