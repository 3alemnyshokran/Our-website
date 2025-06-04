// Registration logic for register.html

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value.trim();
            const privacyAccepted = document.getElementById('privacy-accept').checked;

            if (!username) {
                showMessage('Username is required', 'error');
                return;
            }

            if (!privacyAccepted) {
                showMessage('You must accept the privacy policy', 'error');
                return;
            }

            // Disable submit button
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;

            try {
                // Call handleRegistration from auth.js
                const result = await handleRegistration(username);
                if (result.success) {
                    showMessage('Registration successful!', 'success');
                    localStorage.setItem('privacyAccepted', 'true');
                    const deviceToken = generateDeviceToken();
                    localStorage.setItem('tutor_device_token', deviceToken);
                    // Redirect to intended page if available, else home
                    const redirectUrl = localStorage.getItem('redirect_after_login') || '/index.html';
                    localStorage.removeItem('redirect_after_login');
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 1000);
                } else {
                    showMessage(result.message || 'Registration failed', 'error');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Registration error:', error);
                showMessage('An error occurred. Please try again.', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

function showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-circle-exclamation' : (type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation')}"></i>
        <span>${message}</span>
    `;
    document.querySelector('.auth-box').appendChild(messageEl);
    setTimeout(() => {
        messageEl.classList.add('fade-out');
        setTimeout(() => {
            messageEl.remove();
        }, 300);
    }, 4700);
}
