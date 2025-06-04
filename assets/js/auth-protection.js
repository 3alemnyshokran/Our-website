/**
 * Auth Protection Module
 * This script adds authentication protection to any page that includes it.
 * Include this script in every page that should be protected by authentication.
 */

// Immediately check authentication status
(function() {
    // Skip auth check for login and register pages
    const isAuthPage = window.location.pathname.includes('/pages/auth/');
    if (isAuthPage) return;
    
    // Function to load the auth.js script if it's not already loaded
    function loadAuthScript() {
        return new Promise((resolve, reject) => {
            // Check if auth.js is already loaded
            if (typeof isAuthenticated === 'function') {
                resolve();
                return;
            }
            
            // Create script element and load auth.js
            const script = document.createElement('script');
            script.src = '/assets/js/auth.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load auth.js'));
            document.head.appendChild(script);
        });
    }
    
    // Function to load the tracking.js script for course pages
    function loadTrackingScript() {
        return new Promise((resolve, reject) => {
            // Check if we're on a course page that needs tracking
            const body = document.body;
            const isCourse = body.hasAttribute('data-course-id');
            
            if (!isCourse) {
                resolve();
                return;
            }
            
            // Check if tracking.js is already loaded
            if (typeof trackCourseProgress === 'function') {
                resolve();
                return;
            }
            
            // Create script element and load tracking.js
            const script = document.createElement('script');
            script.src = '/assets/js/tracking.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load tracking.js'));
            document.head.appendChild(script);
        });
    }
    
    // Main function to check authentication
    async function checkAuth() {
        try {
            // Load auth.js if needed
            await loadAuthScript();
            
            // If not authenticated, redirect to login
            if (!isAuthenticated()) {
                // Store current page URL for redirect after login
                localStorage.setItem('redirect_after_login', window.location.href);
                window.location.href = '/pages/auth/login.html';
                return;
            }
            
            // If authenticated but privacy not accepted, show privacy policy
            if (!isPrivacyAccepted()) {
                showPrivacyModal().then(() => {
                    // Privacy policy accepted, update UI
                    updatePageWithUserInfo();
                    // Load tracking script for course pages
                    loadTrackingScript();
                });
            } else {
                // Already authenticated and privacy accepted, update UI
                updatePageWithUserInfo();
                // Load tracking script for course pages
                loadTrackingScript();
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            // Fallback to login page if something goes wrong
            window.location.href = '/pages/auth/login.html';
        }
    }
    
    // Update the page with user information
    function updatePageWithUserInfo() {
        // Set username if element exists
        const usernameElement = document.getElementById('welcomeUser') || 
                               document.getElementById('username') ||
                               document.querySelector('[data-user="username"]');
        
        if (usernameElement) {
            usernameElement.textContent = getCurrentUsername() || 'Guest';
        }
        
        // Add logout button if it doesn't exist
        if (!document.getElementById('logoutBtn')) {
            const headerControls = document.querySelector('.header-controls');
            if (headerControls) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logoutBtn';
                logoutBtn.className = 'logout-btn';
                logoutBtn.textContent = 'Logout';
                logoutBtn.onclick = function() {
                    logout();
                };
                headerControls.appendChild(logoutBtn);
            }
        }
    }
    
    // Run the authentication check
    checkAuth();
})();
