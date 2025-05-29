// User Account Settings Script
// Handles username change and sign out functionality

/**
 * Checks if a username is available
 * @param {string} username - The username to check
 * @returns {Promise<Object>} - Promise that resolves to availability data
 */
async function checkUsernameAvailability(username) {
    try {
        const response = await fetch(`http://localhost:3001/api/check-username/${encodeURIComponent(username)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking username availability:', error);
        return { available: false, error: error.message };
    }
}

/**
 * Updates a user's username
 * @param {string} currentUsername - The current username
 * @param {string} newUsername - The new username
 * @param {string} password - The user's password for verification
 * @returns {Promise<Object>} - Promise that resolves to the update result
 */
async function updateUsername(currentUsername, newUsername, password) {
    try {
        const response = await fetch('http://localhost:3001/api/update-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentUsername,
                newUsername,
                password
            }),
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating username:', error);
        return { success: false, error: error.message };
    }
}

// Sign-out functionality is now centralized in main.js
// This reference is kept for backward compatibility
function signOut() {
    // Check if signOut exists in the global scope (from main.js)
    if (typeof window.signOut === 'function') {
        window.signOut();
    } else {
        console.warn('Global signOut function not found, using local implementation');
        // Fallback implementation
        localStorage.removeItem('username');
        localStorage.removeItem('adminLoggedIn');
        window.location.href = '../index.html';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize username field with current username
    const currentUsernameField = document.getElementById('currentUsername');
    const newUsernameField = document.getElementById('newUsername');
    const passwordField = document.getElementById('passwordConfirmation');
    const usernameAvailabilityText = document.getElementById('usernameAvailability');
    const updateUsernameBtn = document.getElementById('updateUsernameBtn');
    const usernameChangeResult = document.getElementById('usernameChangeResult');
    const signOutBtn = document.getElementById('signOutBtn');
    
    // Get the current username from localStorage
    const username = localStorage.getItem('username');
    
    if (currentUsernameField && username) {
        currentUsernameField.value = username;
    }
    
    // Add debounce function to prevent too many API calls
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // Check username availability when typing
    if (newUsernameField) {        const checkUsername = debounce(async (value) => {
            // If the field is empty, hide the availability text
            if (!value.trim()) {
                usernameAvailabilityText.classList.add('invisible');
                return;
            }
            
            // If it's the same as the current username, show an appropriate message
            if (value === username) {
                usernameAvailabilityText.textContent = 'This is your current username';
                usernameAvailabilityText.className = 'text-xs mt-1 text-slate-600 dark:text-slate-400';
                usernameAvailabilityText.classList.remove('invisible');
                return;
            }
            
            // Show loading state
            usernameAvailabilityText.textContent = 'Checking availability...';
            usernameAvailabilityText.className = 'text-xs mt-1 text-slate-600 dark:text-slate-400';
            usernameAvailabilityText.classList.remove('invisible');
            
            const result = await checkUsernameAvailability(value);
            
            if (result.available) {
                usernameAvailabilityText.textContent = 'Username is available!';
                usernameAvailabilityText.className = 'text-xs mt-1 text-green-600 dark:text-green-400';
            } else if (result.error) {
                usernameAvailabilityText.textContent = result.error;
                usernameAvailabilityText.className = 'text-xs mt-1 text-red-600 dark:text-red-400';
            } else {
                usernameAvailabilityText.textContent = 'Username is already taken';
                usernameAvailabilityText.className = 'text-xs mt-1 text-red-600 dark:text-red-400';
            }
        }, 500);
        
        newUsernameField.addEventListener('input', (e) => checkUsername(e.target.value));
    }
    
    // Handle username update
    if (updateUsernameBtn) {
        updateUsernameBtn.addEventListener('click', async () => {
            const currentUsername = username;
            const newUsername = newUsernameField.value.trim();
            const password = passwordField.value;
            
            // Reset result display
            usernameChangeResult.innerHTML = '';
            usernameChangeResult.className = 'mt-3 hidden';
            
            // Validate inputs
            if (!newUsername) {
                showResultMessage('Please enter a new username', 'error');
                return;
            }
            
            if (newUsername === currentUsername) {
                showResultMessage('New username cannot be the same as your current username', 'error');
                return;
            }
            
            if (!password) {
                showResultMessage('Please enter your password', 'error');
                return;
            }
            
            // Show loading state
            updateUsernameBtn.disabled = true;
            updateUsernameBtn.textContent = 'Updating...';
            
            // Check availability one more time
            const availabilityCheck = await checkUsernameAvailability(newUsername);
            if (!availabilityCheck.available) {
                showResultMessage('This username is already taken. Please choose another.', 'error');
                updateUsernameBtn.disabled = false;
                updateUsernameBtn.textContent = 'Update Username';
                return;
            }
            
            // Send update request
            const result = await updateUsername(currentUsername, newUsername, password);
            
            if (result.success) {
                showResultMessage('Username updated successfully! You will be signed out in a moment.', 'success');
                  // Update localStorage with new username
                localStorage.setItem('username', newUsername);
                
                // After a delay, redirect to refresh the page with new username
                setTimeout(() => {
                    window.location.href = window.location.pathname + '?message=username_updated';
                }, 2000);
            } else {
                showResultMessage(result.error || 'Failed to update username. Please try again.', 'error');
                updateUsernameBtn.disabled = false;
                updateUsernameBtn.textContent = 'Update Username';
            }
        });
    }
    
    // Function to display result messages
    function showResultMessage(message, type) {
        usernameChangeResult.innerHTML = `
            <div class="p-3 rounded-lg ${type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}">
                ${message}
            </div>
        `;
        usernameChangeResult.classList.remove('hidden');
    }
    
    // Handle sign out
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            // Ask for confirmation
            if (confirm('Are you sure you want to sign out?')) {
                signOut();
            }
        });
    }
});
