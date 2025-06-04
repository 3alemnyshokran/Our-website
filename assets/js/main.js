// Theme handling
let currentTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', currentTheme);

// Authentication Check
document.addEventListener('DOMContentLoaded', function() {
    // Check if cookie consent has been given - if not, don't redirect yet
    if (typeof hasConsentedToCookies === 'function' && !hasConsentedToCookies()) {
        // Wait for cookie consent before proceeding with auth check
        return;
    }
    
    // Check if this is a page that requires authentication
    if (!window.location.pathname.includes('/pages/auth/')) {
        // If not authenticated, redirect to login
        if (!isAuthenticated()) {
            // Store the current page URL to redirect back after login
            localStorage.setItem('redirect_after_login', window.location.href);
            window.location.href = '/pages/auth/login.html';
            return;
        }
        
        // If authenticated but privacy policy not accepted, show privacy prompt
        if (!isPrivacyAccepted()) {
            showPrivacyModal().then(() => {
                // Continue with page initialization after privacy policy is accepted
                initializeUI();
            });
        } else {
            // Already authenticated and privacy policy accepted
            initializeUI();
        }
    }
});

// Initialize UI components after authentication
function initializeUI() {
    // Set username if element exists
    const usernameElement = document.getElementById('welcomeUser');
    if (usernameElement) {
        usernameElement.textContent = getCurrentUsername() || 'Guest';
    }
    
    // Initialize theme
    initializeTheme();
    
    // Initialize language
    initializeLanguage();
}

// Sync theme across tabs
window.addEventListener('storage', (event) => {
    if (event.key === 'theme') {
        const newTheme = event.newValue || 'light';
        document.body.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon(currentTheme);

    // Update theme icon and text
    const themeButton = document.querySelector('.theme-btn');
    if (themeButton) {
        themeButton.setAttribute('aria-label', translations[currentLanguage]?.[`${currentTheme}Mode`] || currentTheme);
    }
}

function updateThemeIcon(theme) {
    const lightIcon = document.querySelector('.light-icon');
    const darkIcon = document.querySelector('.dark-icon');
    
    if (lightIcon && darkIcon) {
        if (theme === 'light') {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'block';
        } else {
            lightIcon.style.display = 'block';
            darkIcon.style.display = 'none';
        }
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
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

async function registerUser(username, password, ip, device) {
  const res = await fetch(`${BACKEND_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, ip, device })
  });
  return res.json();
}

async function loginUser(username, password) {
  const res = await fetch(`${BACKEND_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
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
    const result = await loginUser(username, password);
    if (result.success) {
        // Save username in sessionStorage for session tracking
        sessionStorage.setItem('tutor_username', username);
        hideLogin();
        document.getElementById('welcomeUser').textContent = username;
    } else {
        alert(result.error || 'Login failed');
    }
});

// Registration handler (if you have a registration form)
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    let ip = '';
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        ip = (await res.json()).ip;
    } catch { ip = 'Unavailable'; }
    const device = navigator.userAgent;
    const result = await registerUser(username, password, ip, device);
    if (result.success) {
        sessionStorage.setItem('tutor_username', username);
        window.location.href = 'home-screen.html';
    } else {
        alert(result.error || 'Registration failed');
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

// Call initializations when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    initializeTheme();
    await loadTranslations(currentLanguage);
    applyTranslations(currentLanguage);
    updateProgressIndicators();
    setupAccessibility();
    setupKeyboardShortcuts();
    setupFocusManagement();

    // Add event listener for theme toggle button
    const themeButton = document.querySelector('.theme-btn');
    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
        updateThemeIcon(currentTheme);
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

    // Announce language switch for screen readers
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = `Language changed to ${selectedOption.text}`;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        });
    }

    // Load saved profile picture on page load
    const savedPic = localStorage.getItem('profilePicture');
    const preview = document.getElementById('profile-preview');
    if (savedPic && preview) {
        preview.src = savedPic;
        preview.classList.remove('empty');
    }

    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
});