/**
 * API Configuration
 * This file centralizes API endpoint configuration for the application
 */

// Determine the base URL for API requests
function getApiBaseUrl() {
    // Get the current host (domain) the app is running on
    const currentHost = window.location.hostname;
    
    // If running locally via file:// protocol (common in mobile testing)
    if (window.location.protocol === 'file:') {
        // Return the deployed API endpoint - use the actual Vercel URL from the deployment
        return 'https://our-fucking-project-5yrcg4w98-shdwflxres-projects.vercel.app/api';
    }
    
    // If running on localhost
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        // Use local development server
        return 'http://localhost:3001/api';
    }
    
    // For production/deployed environments, use relative URL
    // This ensures the API calls go to the same domain as the frontend
    return '/api';
}

// Export the API base URL
const API_CONFIG = {
    BASE_URL: getApiBaseUrl(),
    TIMEOUT: 10000, // 10 seconds timeout for API requests
};

// Export API helper functions
const API = {
    // Get the base URL
    getBaseUrl: () => API_CONFIG.BASE_URL,
    
    // Make an API request with better error handling
    async fetch(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        // Add default timeout if not specified
        if (!options.signal) {
            options.signal = AbortSignal.timeout(API_CONFIG.TIMEOUT);
        }
        
        try {
            const response = await fetch(url, options);
            
            // Parse JSON response
            const data = await response.json();
            
            // Return both response and data
            return { 
                success: response.ok,
                status: response.status,
                data,
                error: !response.ok ? (data.error || 'Unknown error occurred') : null
            };
        } catch (error) {
            // Handle network errors and timeouts
            console.error(`API Error (${endpoint}):`, error);
            
            // Determine if it's a timeout
            const isTimeout = error.name === 'TimeoutError' || 
                             (error.name === 'AbortError' && options.signal);
                
            return {
                success: false,
                status: 0,
                data: null,
                error: isTimeout 
                    ? 'Request timed out. Please check your internet connection and try again.' 
                    : 'Network error. The server may be offline or unreachable.'
            };
        }
    }
};
