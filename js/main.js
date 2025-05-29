// Theme handling
let currentTheme = localStorage.getItem('theme') || 'light';

// Sync theme across tabs
window.addEventListener('storage', (event) => {
    if (event.key === 'theme') {
        const newTheme = event.newValue || 'light';
        initializeTheme(newTheme);
    }
});

// Initialize theme
function initializeTheme(forcedTheme) {
    const savedTheme = forcedTheme || localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    
    // Set on HTML element for Tailwind Dark Mode
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Set on body for backwards compatibility with [data-theme] selectors
    document.body.setAttribute('data-theme', savedTheme);
    
    updateThemeIcon(savedTheme);
    
    // Update theme-color meta tag for mobile browsers
    updateMobileThemeColor(savedTheme);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    const newTheme = isDark ? 'dark' : 'light';
    
    // Update our theme state
    currentTheme = newTheme;
    
    // Store in localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update body attribute for [data-theme] selectors
    document.body.setAttribute('data-theme', newTheme);
    
    // Update icons
    updateThemeIcon(newTheme);
    
    // Update theme-color meta tag for mobile browsers
    updateMobileThemeColor(newTheme);
}

function updateThemeIcon(theme) {
    const lightIcon = document.querySelector('.light-icon');
    const darkIcon = document.querySelector('.dark-icon');

    if (theme === 'light') {
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
    } else {
        lightIcon.classList.remove('hidden');
        darkIcon.classList.add('hidden');
    }
}

// Language handling
let translations = {};
let currentLanguage = localStorage.getItem('language') || 'en';

async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error('Translation file not found');
        translations[lang] = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading translations:', error);
        return false;
    }
}

// Enhanced language change function
async function changeLanguage(lang) {
    // Dispatch event before language change
    document.dispatchEvent(new Event('beforeLanguageChange'));
    
    const indicator = document.createElement('div');
    indicator.className = 'loading-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    indicator.textContent = 'Loading translations...';
    document.body.appendChild(indicator);

    try {
        if (!translations[lang]) {
            const success = await loadTranslations(lang);
            if (!success) {
                throw new Error('Failed to load translations');
            }
        }
        
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        
        applyTranslations(lang);
        currentLanguage = lang;
        localStorage.setItem('language', lang);

        // Update ARIA labels
        updateAriaLabels(lang);
        
        // Dispatch event after language change
        document.dispatchEvent(new Event('afterLanguageChange'));
    } catch (error) {
        console.error('Error changing language:', error);
        const errorMsg = translations[currentLanguage]?.loadError || 'Failed to load translations. Please try again.';
        alert(errorMsg);
    } finally {
        indicator.remove();
    }
}

function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang]?.[key]) {
            if (element.hasAttribute('placeholder')) {
                element.placeholder = translations[lang][key];
            } else if (element.hasAttribute('aria-label')) {
                element.setAttribute('aria-label', translations[lang][key]);
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
}

// Update ARIA labels based on current language
function updateAriaLabels(lang) {
    // Update button labels
    document.querySelectorAll('button[data-i18n]').forEach(button => {
        const key = button.getAttribute('data-i18n');
        if (translations[lang]?.[key]) {
            button.setAttribute('aria-label', translations[lang][key]);
        }
    });

    // Update input labels
    document.querySelectorAll('input[data-i18n-placeholder]').forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        if (translations[lang]?.[key]) {
            input.setAttribute('aria-label', translations[lang][key]);
        }
    });
}

// Quiz/Exercise System
function checkAnswerWithFeedback(questionId, userAnswer, correctAnswer) {
    const container = document.getElementById(questionId);
    const feedbackDiv = container.querySelector('.feedback');
    
    // Remove any existing feedback
    if (feedbackDiv) {
        feedbackDiv.remove();
    }
    
    // Create new feedback element
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    
    // Compare answers (case-insensitive)
    if (userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
        feedback.className += ' correct';
        feedback.textContent = 'Correct! Well done!';
        container.querySelector('.step-by-step').style.display = 'none';
    } else {
        feedback.className += ' incorrect';
        feedback.textContent = 'Try again!';
        container.querySelector('.step-by-step').style.display = 'block';
    }
    
    container.appendChild(feedback);
}

function checkAnswer(exerciseId, correctAnswer) {
    const userAnswer = document.querySelector(`#${exerciseId}`).value.trim().toLowerCase();
    const feedbackElement = document.querySelector(`#${exerciseId}-feedback`);
    const stepByStepElement = document.querySelector(`#${exerciseId}-steps`);

    if (userAnswer === correctAnswer.toLowerCase()) {
        feedbackElement.className = 'feedback correct';
        feedbackElement.textContent = 'Correct! Well done!';
    } else {
        feedbackElement.className = 'feedback incorrect';
        feedbackElement.textContent = 'Not quite right. Try again!';
        if (stepByStepElement) {
            stepByStepElement.style.display = 'block';
        }
    }
}

// --- BACKEND API INTEGRATION ---
const BACKEND_URL = 'http://localhost:3001';

async function registerUser(username, password, ip, device, browser, os) {
  const res = await fetch(`${BACKEND_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username, 
      password, 
      ip: ip || 'unknown', 
      device: device || navigator.userAgent,
      browser: browser || getBrowserName(),
      os: os || getOperatingSystem()
    })
  });
  return res.json();
}

// Device info helper functions
function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Firefox") > -1) return "Mozilla Firefox";
  else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) return "Opera";
  else if (userAgent.indexOf("Edge") > -1) return "Microsoft Edge";
  else if (userAgent.indexOf("Chrome") > -1) return "Google Chrome";
  else if (userAgent.indexOf("Safari") > -1) return "Safari";
  else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer";
  else return "Unknown browser";
}

function getOperatingSystem() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Win") > -1) return "Windows";
  else if (userAgent.indexOf("Mac") > -1) return "MacOS";
  else if (userAgent.indexOf("Linux") > -1) return "Linux";
  else if (userAgent.indexOf("Android") > -1) return "Android";
  else if (userAgent.indexOf("iOS") > -1) return "iOS";
  else return "Unknown OS";
}

async function getIpAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'unknown';
  }
}

async function loginUser(username, password, deviceInfo = {}) {
  const res = await fetch(`${BACKEND_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username, 
      password,
      ip: deviceInfo.ip || 'unknown',
      device: deviceInfo.device || navigator.userAgent,
      browser: deviceInfo.browser || 'unknown',
      os: deviceInfo.os || 'unknown'
    })
  });
  return res.json();
}

async function saveAnalytics(username, analytics) {
  const res = await fetch(`${BACKEND_URL}/api/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, analytics })
  });
  return res.json();
}

// Save analytics example (call this when saving progress, grades, etc.)
async function saveUserProgress(analytics) {
    const username = sessionStorage.getItem('tutor_username');
    if (!username) return;
    await saveAnalytics(username, analytics);
}

// Password reset (request)
async function requestPasswordReset(username) {
  // This is a placeholder. In a real app, you'd send an email or code.
  alert('Password reset is not implemented in this demo.');
}

// Admin authentication (simple example)
async function adminLogin(adminUser, adminPass) {
  // You can add a special admin user in your backend or check here
  if (adminUser === 'admin' && adminPass === 'admin123') {
    sessionStorage.setItem('isAdmin', 'true');
    return true;
  }
  alert('Invalid admin credentials');
  return false;
}

// Real-time updates (polling example)
function startRealtimeUserPolling(callback, interval = 5000) {
  setInterval(async () => {
    const res = await fetch('http://localhost:3001/api/users');
    const users = await res.json();
    callback(users);
  }, interval);
}

// --- LOGIN/REGISTER HANDLERS ---
// Replace localStorage logic with backend API

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('usernameInput')?.value;
    const password = document.getElementById('passwordInput')?.value;
    if (!username || !password) return alert('Please enter username and password.');
    
    try {
        // Get device information
        const deviceInfo = {
            device: navigator.userAgent,
            browser: getBrowserName(),
            os: getOperatingSystem(),
            ip: await getIpAddress()
        };
        
        const result = await loginUser(username, password, deviceInfo);
        if (result.success) {
            // Save username in sessionStorage for session tracking
            sessionStorage.setItem('tutor_username', username);
            if (result.token) {
                localStorage.setItem('authToken', result.token);
            }
            hideLogin();
            document.getElementById('welcomeUser').textContent = username;
        } else {
            alert(result.error || 'Login failed');
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Network error. Please try again.');
    }
});

// Registration handler (if you have a registration form)
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    try {
        // Get device information
        const deviceInfo = {
            device: navigator.userAgent,
            browser: getBrowserName(),
            os: getOperatingSystem(),
            ip: await getIpAddress()
        };
        
        const result = await registerUser(
            username, 
            password, 
            deviceInfo.ip, 
            deviceInfo.device,
            deviceInfo.browser,
            deviceInfo.os
        );
    if (result.success) {
        sessionStorage.setItem('tutor_username', username);
        window.location.href = 'home-screen.html';
    } else {
        alert(result.error || 'Registration failed');
    }
  } catch (err) {
    console.error('Registration error:', err);
    alert('Network error. Please try again.');
  }
});

function saveProgress(courseId, chapterId, exerciseId, completed) {
    const username = sessionStorage.getItem('tutor_username');
    if (!username) return;

    const analyticsData = { courseId, chapterId, exerciseId, completed };
    saveUserProgress(analyticsData);
}

function updateProgressDisplay(courseId) {
    const progressElement = document.querySelector(`#${courseId}-progress`);
    if (progressElement) {
        // Fetch progress from backend or sessionStorage
        const percentage = sessionStorage.getItem(`progress-${courseId}`) || 0;
        progressElement.style.width = `${percentage}%`;
        progressElement.setAttribute('aria-valuenow', percentage);
        progressElement.textContent = `${percentage}%`;
    }
}

// Accessibility improvements
function setupAccessibility() {
    // Add keyboard navigation for interactive elements
    document.querySelectorAll('.question-container').forEach(container => {
        const input = container.querySelector('.answer-input');
        const checkButton = container.querySelector('.check-answer-btn');
        const hintButton = container.querySelector('.hint-button');

        if (input && checkButton) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkButton.click();
                }
            });
        }

        if (hintButton) {
            hintButton.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    hintButton.click();
                }
            });
        }
    });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + T to toggle theme
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Alt + L to focus language selector
        if (e.altKey && e.key === 'l') {
            e.preventDefault();
            const langSelect = document.getElementById('languageSelect');
            if (langSelect) {
                langSelect.focus();
            }
        }

        // Alt + numbers to quickly answer questions
        if (e.altKey && /^[1-9]$/.test(e.key)) {
            e.preventDefault();
            const questionNumber = parseInt(e.key);
            const input = document.getElementById(`q${questionNumber}-input`);
            if (input) {
                input.focus();
            }
        }
    });
}

// Focus Management
function setupFocusManagement() {
    // Track last focused element before language change
    let lastFocusedElement = null;

    // Store focus before loading translations
    document.addEventListener('beforeLanguageChange', () => {
        lastFocusedElement = document.activeElement;
    });

    // Restore focus after translations are loaded
    document.addEventListener('afterLanguageChange', () => {
        if (lastFocusedElement && document.contains(lastFocusedElement)) {
            lastFocusedElement.focus();
        }
    });

    // Handle focus for hint buttons
    document.querySelectorAll('.hint-button').forEach(button => {
        button.addEventListener('click', function() {
            const stepsDiv = this.closest('.question-container').querySelector('.step-by-step');
            if (stepsDiv && stepsDiv.classList.contains('show')) {
                const firstStep = stepsDiv.querySelector('.step');
                if (firstStep) {
                    firstStep.setAttribute('tabindex', '-1');
                    firstStep.focus();
                }
            }
        });
    });
}

// Profile picture handling
function handleProfilePicture(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const preview = document.getElementById('profile-preview');
            const uploadPreview = document.getElementById('upload-preview');
            const imageData = e.target.result;
            
            localStorage.setItem('profilePicture', imageData);
            
            if (preview) {
                preview.src = imageData;
                preview.classList.remove('empty');
            }
            
            if (uploadPreview) {
                uploadPreview.src = imageData;
                uploadPreview.classList.remove('empty');
            }
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Course progress handling
function updateProgress() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const progressId = bar.getAttribute('data-progress-id');
        const progress = sessionStorage.getItem(`progress-${progressId}`) || '0';
        bar.style.width = `${progress}%`;
    });
}

function setProgress(progressId, percentage) {
    sessionStorage.setItem(`progress-${progressId}`, percentage);
    updateProgress();
}

// User Authentication/Profile Functions

/**
 * Creates and inserts a user info/menu element into the header
 */
function initializeUserInfo() {
    const username = localStorage.getItem('username');
    const userInfoContainer = document.getElementById('user-info');
    
    if (!userInfoContainer) return;
    
    if (username) {
        // Create a dropdown menu for logged-in user
        userInfoContainer.innerHTML = `
            <div class="relative">
                <button id="userMenuBtn" class="flex items-center bg-blue-700 dark:bg-blue-800 text-white px-3 py-1 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors gap-2">
                    <span class="text-sm font-medium">${username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div id="userDropdown" class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 shadow-lg rounded-lg py-2 z-50 hidden">
                    <a href="../profile/profile-setup.html" class="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                        Profile Settings
                    </a>
                    <a href="#" id="headerSignOutBtn" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700">
                        Sign Out
                    </a>
                </div>
            </div>
        `;
        
        // Toggle dropdown when clicking the button
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('hidden');
            });
            
            // Hide dropdown when clicking outside
            document.addEventListener('click', (event) => {
                if (!userMenuBtn.contains(event.target) && !userDropdown.contains(event.target)) {
                    userDropdown.classList.add('hidden');
                }
            });
            
            // Handle sign out
            const headerSignOutBtn = document.getElementById('headerSignOutBtn');
            if (headerSignOutBtn) {                headerSignOutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.signOut(true, true);
                });
            }
        }
    } else {
        // Show login/register links for non-logged in users
        userInfoContainer.innerHTML = `
            <div class="flex gap-2">
                <a href="../auth/login.html" class="text-sm text-white bg-blue-700 dark:bg-blue-800 px-3 py-1 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors">
                    Login
                </a>
                <a href="../auth/register.html" class="text-sm text-white bg-green-600 dark:bg-green-700 px-3 py-1 rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors">
                    Register
                </a>
            </div>
        `;
    }
}

/**
 * Signs the user out by clearing localStorage and redirecting to home
 * @param {boolean} showConfirmation - Whether to show a confirmation dialog before signing out
 * @param {boolean} showSuccessMessage - Whether to show a success message in the URL
 */
window.signOut = function(showConfirmation = true, showSuccessMessage = true) {
    // Ask for confirmation if requested
    if (showConfirmation && !confirm('Are you sure you want to sign out?')) {
        return;
    }
    
    // Clear all user data from localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('adminLoggedIn');
    
    // Any other user-specific data that should be cleared
    const coursePrefixes = ['a1_', 'a2_', 'b1_', 'b2_', 'c1_', 'c2_', 
                           'german_', 'arabic_', 'math_', 'science_'];
    
    for (const key in localStorage) {
        // Remove any course progress data
        for (const prefix of coursePrefixes) {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        }
    }
    
    // Redirect to the home page with a success message if requested
    if (showSuccessMessage) {
        window.location.href = '../index.html?message=signout_success';
    } else {
        window.location.href = '../index.html';
    }
}

// Function to initialize all user interface elements
function initializeInterface() {
    initializeTheme(currentTheme);
    initializeLanguageSelector();
    initializeUserInfo();
    checkUrlParameters();
}

/**
 * Checks URL parameters for message codes and displays appropriate notifications
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'signout_success') {
        showNotification('You have been successfully signed out.', 'success');
    } else if (message === 'username_updated') {
        showNotification('Your username has been successfully updated.', 'success');
    }
    
    // Clean up the URL after displaying the message
    if (message) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}

/**
 * Shows a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, warning, info)
 * @param {number} duration - How long to show the message in milliseconds
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Check if notification container exists, create it if not
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-3';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification px-4 py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center ${
        type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200' :
        type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200' :
        type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200' :
        'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
    }`;
    
    // Add appropriate icon
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
            break;
        case 'error':
            icon = '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
            break;
        case 'warning':
            icon = '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
            break;
        default:
            icon = '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
    }
    
    notification.innerHTML = `
        ${icon}
        <div class="flex-grow">${message}</div>
        <button class="ml-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Close button functionality
    const closeButton = notification.querySelector('button');
    closeButton.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto-close after duration
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }
}

/**
 * Closes and removes a notification element
 * @param {HTMLElement} notification - The notification element to close
 */
function closeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Call initializations when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme first
    initializeTheme();
    
    // Load translations for current language
    await loadTranslations(currentLanguage);
    applyTranslations(currentLanguage);
    
    // Setup other functionalities
    if (typeof updateProgressIndicators === 'function') updateProgressIndicators();
    setupAccessibility();
    setupKeyboardShortcuts();
    setupFocusManagement();

    // Add event listener for theme toggle button
    const themeButton = document.querySelector('#theme-toggle, .theme-btn');
    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
    }

    // Set up language selection
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        // Set initial value from localStorage
        if (currentLanguage) {
            languageSelect.value = currentLanguage;
        }
        
        // Listen for changes
        languageSelect.addEventListener('change', function() {
            const selectedLanguage = this.value;
            changeLanguage(selectedLanguage);
            
            // Accessibility announcement
            const selectedOption = this.options[this.selectedIndex];
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = `Language changed to ${selectedOption.text}`;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        });
    }    // Load saved profile picture on page load
    const savedPic = localStorage.getItem('profilePicture');
    const preview = document.getElementById('profile-preview');
    if (savedPic && preview) {
        preview.src = savedPic;
        preview.classList.remove('empty');
    }

    // Privacy Notice Modal
    if (!localStorage.getItem('privacyAccepted')) {
        const modal = document.createElement('div');
        modal.className = 'privacy-modal';
        modal.innerHTML = `
            <div class="privacy-modal-content">
                <h2>Privacy Notice</h2>
                <p>We use local storage to save your progress and preferences. By continuing, you accept our privacy policy.</p>
                <button class="privacy-accept-btn">Accept</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.classList.add('modal-open');
        modal.querySelector('.privacy-accept-btn').addEventListener('click', () => {
            localStorage.setItem('privacyAccepted', 'true');
            modal.remove();
            document.body.classList.remove('modal-open');
        });
    }

    // Mobile-specific initializations
    initializeMobileFeatures();
});

function updateMobileThemeColor(theme) {
    // Update theme-color meta tag for mobile browsers
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    
    if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
    }
    
    themeColorMeta.content = theme === 'dark' ? '#0f172a' : '#1e40af';
}

// Detect if the user is on a mobile device
function isMobile() {
    return (window.innerWidth <= 640) || 
           (navigator.maxTouchPoints > 0) || 
           /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Mobile-specific optimizations
function initializeMobileFeatures() {
    if (!isMobile()) return;
    
    // Ensure viewport meta is set correctly
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    
    // Add mobile device class to body
    document.body.classList.add('mobile-device');
    
    // Optimize touch targets
    document.querySelectorAll('button, a, input[type="submit"], .course-card')
        .forEach(el => {
            if (el.offsetHeight < 44) {
                el.style.minHeight = '44px';
            }
        });
        
    // Collect analytics about mobile usage
    if (localStorage.getItem('mobile_device_info') === null) {
        localStorage.setItem('mobile_device_info', JSON.stringify({
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio,
            orientation: window.screen.orientation ? window.screen.orientation.type : 'unknown',
            timestamp: new Date().toISOString()
        }));
    }
}