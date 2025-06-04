/**
 * Cookie Consent Manager
 * Shows a cookie consent popup on first visit
 */

// Check if cookie consent has been given
function hasConsentedToCookies() {
    return localStorage.getItem('cookieConsent') === 'true';
}

// Show cookie consent banner
function showCookieConsent() {
    if (hasConsentedToCookies()) {
        return;
    }
    
    const consentBanner = document.createElement('div');
    consentBanner.className = 'cookie-consent';
    consentBanner.innerHTML = `
        <div class="cookie-content">
            <div class="cookie-text">
                <h3>Cookie Notice</h3>
                <p>We use cookies to remember your device and provide a better experience. 
                By continuing to use this site, you consent to our use of cookies.</p>
            </div>
            <div class="cookie-buttons">
                <button class="btn-accept">Accept</button>
                <button class="btn-settings">Settings</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(consentBanner);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .cookie-consent {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--card-bg, #fff);
            padding: 15px;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            z-index: 9999;
            border-top: 1px solid var(--border-color, #ddd);
        }
        
        .cookie-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .cookie-text {
            flex: 1;
        }
        
        .cookie-text h3 {
            margin-top: 0;
            margin-bottom: 5px;
        }
        
        .cookie-text p {
            margin: 0;
            font-size: 14px;
        }
        
        .cookie-buttons {
            display: flex;
            gap: 10px;
        }
        
        .btn-accept {
            background: var(--primary-color, #4a6cf7);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .btn-settings {
            background: transparent;
            border: 1px solid var(--border-color, #ddd);
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        @media (max-width: 768px) {
            .cookie-content {
                flex-direction: column;
            }
            
            .cookie-buttons {
                margin-top: 10px;
                width: 100%;
                justify-content: center;
            }
        }
    `;
    
    document.head.appendChild(style);
      // Handle accept button
    consentBanner.querySelector('.btn-accept').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        consentBanner.remove();
        
        // Redirect to register page if not authenticated and we're on the homepage
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
                window.location.href = '/pages/auth/register.html';
            }
        }
    });
    
    // Handle settings button (just show privacy policy for now)
    consentBanner.querySelector('.btn-settings').addEventListener('click', () => {
        showPrivacyModal().then(() => {
            localStorage.setItem('cookieConsent', 'true');
            consentBanner.remove();
        });
    });
}

// Initialize cookie consent
document.addEventListener('DOMContentLoaded', () => {
    // Short delay to let page load first
    setTimeout(showCookieConsent, 500);
});
