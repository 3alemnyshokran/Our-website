/**
 * Database Connectivity Checker
 * This script checks if the database server is running and provides a simple UI indicator
 */

// API URL
const API_BASE_URL = 'http://localhost:3001/api';

// Check server connection on page load
document.addEventListener('DOMContentLoaded', function() {
    checkDatabaseConnection();
    
    // Add server status indicator to page if not already present
    if (!document.getElementById('server-status')) {
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'server-status';
        statusIndicator.className = 'server-status';
        statusIndicator.innerHTML = `
            <span class="status-icon">⚫</span>
            <span class="status-text">Checking database connection...</span>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .server-status {
                position: fixed;
                bottom: 10px;
                left: 10px;
                background: var(--card-bg);
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 5px;
                z-index: 1000;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                opacity: 0.7;
                transition: opacity 0.3s;
            }
            
            .server-status:hover {
                opacity: 1;
            }
            
            .status-icon {
                font-size: 10px;
            }
            
            .status-icon.online {
                color: #2ecc71;
            }
            
            .status-icon.offline {
                color: #e74c3c;
            }
        `;
        document.head.appendChild(style);
        
        // Only add to pages that use database features
        if (document.body.hasAttribute('data-course-id') || 
            window.location.pathname.includes('/profile/') ||
            window.location.pathname.includes('/auth/')) {
            document.body.appendChild(statusIndicator);
        }
    }
});

// Check if database server is running
async function checkDatabaseConnection() {
    const statusElement = document.getElementById('server-status');
    if (!statusElement) return;
    
    const iconElement = statusElement.querySelector('.status-icon');
    const textElement = statusElement.querySelector('.status-text');
    
    try {
        const response = await fetch(`${API_BASE_URL}/status`, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Short timeout to avoid blocking the page
            signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
            // Server is online
            iconElement.textContent = '⚫';
            iconElement.classList.add('online');
            iconElement.classList.remove('offline');
            textElement.textContent = 'Database connected';
            
            // Hide status after 5 seconds
            setTimeout(() => {
                statusElement.style.opacity = '0.3';
            }, 5000);
        } else {
            // Server returned an error
            setOfflineStatus(iconElement, textElement);
        }
    } catch (error) {
        // Connection failed
        setOfflineStatus(iconElement, textElement);
        console.error('Database connection check failed:', error);
    }
}

// Set status to offline
function setOfflineStatus(iconElement, textElement) {
    iconElement.textContent = '⚫';
    iconElement.classList.add('offline');
    iconElement.classList.remove('online');
    textElement.textContent = 'Database offline - start server';
    
    // Add click handler to start server
    const statusElement = document.getElementById('server-status');
    if (statusElement) {
        statusElement.style.cursor = 'pointer';
        statusElement.onclick = function() {
            const confirmation = confirm('Would you like to start the database server?');
            if (confirmation) {
                window.open('/start-db-server.bat', '_blank');
            }
        };
    }
}
