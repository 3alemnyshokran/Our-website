/**
 * Enhanced API Manager
 * Provides a centralized way to manage API endpoints with failover
 * and better handling of mobile connectivity issues
 */

// API Endpoints Configuration
const API_ENDPOINTS = {
    PRIMARY: 'https://our-fucking-project-ae8ynbm03-shdwflxres-projects.vercel.app/api',
    FALLBACK1: 'https://our-website-master.vercel.app/api',
    FALLBACK2: 'https://tutor-platform.vercel.app/api',
    LOCAL: 'http://localhost:3001/api',
    RELATIVE: '/api'
};

// Detect if the app is running from a file:// URL (common in mobile testing)
const isFileProtocol = window.location.protocol === 'file:';

// Detect if running on localhost
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

// Singleton API Manager
const APIManager = {
    // Store current working endpoint index
    currentEndpointIndex: 0,
    
    // Last successfully used endpoint
    lastWorkingEndpoint: null,
    
    // Available endpoints ordered by priority
    endpoints: [
        API_ENDPOINTS.PRIMARY,
        API_ENDPOINTS.FALLBACK1,
        API_ENDPOINTS.FALLBACK2
    ],
    
    // Timeout durations based on device type
    timeouts: {
        default: 10000,    // 10 seconds
        mobile: 30000,     // 30 seconds
        poor: 45000,       // 45 seconds for poor connections
    },
    
    // Initialize with stored preferences if available
    init() {
        // Try to load last successful endpoint from localStorage
        const storedEndpoint = localStorage.getItem('last_successful_api_endpoint');
        if (storedEndpoint) {
            this.lastWorkingEndpoint = storedEndpoint;
            console.log('Using stored API endpoint:', storedEndpoint);
        }
        
        // If running locally, use local endpoint
        if (isLocalhost && !isFileProtocol) {
            this.endpoints.unshift(API_ENDPOINTS.LOCAL);
        }
        
        // If running on production server, try relative URL first
        if (!isLocalhost && !isFileProtocol) {
            this.endpoints.unshift(API_ENDPOINTS.RELATIVE);
        }
        
        return this;
    },
    
    // Get the current API URL to use
    getCurrentEndpoint() {
        // If we have a known working endpoint, use it first
        if (this.lastWorkingEndpoint) {
            return this.lastWorkingEndpoint;
        }
        
        return this.endpoints[this.currentEndpointIndex];
    },
    
    // Move to the next endpoint in the list
    switchToNextEndpoint() {
        this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length;
        const newEndpoint = this.endpoints[this.currentEndpointIndex];
        console.log(`Switching to alternate API endpoint: ${newEndpoint}`);
        return newEndpoint;
    },
    
    // Get appropriate timeout based on connection and device
    getTimeout() {
        // Use longer timeout for mobile devices
        if (typeof isMobileDevice === 'function' && isMobileDevice()) {
            // Use even longer timeout for poor connections
            if (typeof NetworkStatus !== 'undefined' && 
                NetworkStatus.connectionQuality === 'poor') {
                return this.timeouts.poor;
            }
            return this.timeouts.mobile;
        }
        return this.timeouts.default;
    },
    
    // Make an API request with retry logic across multiple endpoints
    async fetch(endpoint, options = {}) {
        // Check if we're offline first
        if (typeof NetworkStatus !== 'undefined' && !NetworkStatus.isOnline) {
            console.warn('Device is offline, cannot make API request');
            return {
                success: false,
                status: 0,
                data: null,
                error: 'You appear to be offline. Please check your internet connection and try again.',
                isOffline: true
            };
        }
        
        // Add default timeout if not specified
        if (!options.signal) {
            const timeout = this.getTimeout();
            options.signal = AbortSignal.timeout(timeout);
        }
        
        // Function to execute a fetch with given base URL
        const executeFetch = async (baseUrl) => {
            const url = `${baseUrl}${endpoint}`;
            console.log(`API request to: ${url}`);
            
            try {
                const response = await fetch(url, options);
                  // Try to parse JSON response
                let data;
                try {
                    const text = await response.text();
                    try {
                        data = JSON.parse(text);
                    } catch (parseError) {
                        console.error('Failed to parse JSON response:', parseError, 'Response text:', text);
                        // If response is empty or not valid JSON, create a default response object
                        data = {
                            success: response.ok,
                            message: response.ok ? 'Operation successful' : 'Invalid response from server'
                        };
                    }
                } catch (textError) {
                    console.error('Failed to read response text:', textError);
                    return {
                        success: false,
                        status: response.status,
                        data: null,
                        error: 'Invalid response format from server'
                    };
                }
                
                // If successful, remember this working endpoint
                if (response.ok) {
                    this.lastWorkingEndpoint = baseUrl;
                    localStorage.setItem('last_successful_api_endpoint', baseUrl);
                }
                
                return { 
                    success: response.ok,
                    status: response.status,
                    data,
                    error: !response.ok ? (data.error || 'Unknown error occurred') : null
                };
            } catch (error) {
                console.error(`API Error (${url}):`, error);
                
                // Check for specific error types
                const isCorsError = error.message && (
                    error.message.includes('CORS') || 
                    error.message.includes('Cross-Origin') ||
                    error.message.includes('blocked by CORS policy')
                );
                
                const isTimeout = error.name === 'TimeoutError' || 
                                 (error.name === 'AbortError' && options.signal);
                
                const isNetworkError = error instanceof TypeError && 
                                     error.message.includes('Failed to fetch');
                
                let errorMessage = 'Network error. Please check your connection.';
                
                if (isTimeout) {
                    errorMessage = 'Request timed out. Please check your internet connection and try again.';
                } else if (isCorsError) {
                    errorMessage = 'Cross-origin error. Please try again later.';
                } else if (isNetworkError) {
                    errorMessage = 'Network error. The server may be offline or unreachable.';
                }
                
                // This error will be caught by the retry logic
                throw {
                    message: errorMessage,
                    originalError: error,
                    isTimeout,
                    isCorsError,
                    isNetworkError,
                    isRetryable: isTimeout || isNetworkError
                };
            }
        };
        
        // Try multiple endpoints with retry logic
        try {
            // First try with the current/preferred endpoint
            let currentEndpoint = this.getCurrentEndpoint();
            
            try {
                return await executeFetch(currentEndpoint);
            } catch (error) {
                // If this is a retryable error, try other endpoints
                if (error.isRetryable) {
                    console.log(`Retrying with alternate endpoint due to error: ${error.message}`);
                    
                    // Try each remaining endpoint
                    const initialIndex = this.currentEndpointIndex;
                    let retryAttempts = 0;
                    
                    while (retryAttempts < this.endpoints.length - 1) {
                        currentEndpoint = this.switchToNextEndpoint();
                        
                        // Don't retry the same endpoint we started with
                        if (this.currentEndpointIndex === initialIndex) {
                            break;
                        }
                        
                        try {
                            // Add exponential backoff between retries
                            const delay = Math.min(1000 * Math.pow(2, retryAttempts), 10000);
                            await new Promise(resolve => setTimeout(resolve, delay));
                            
                            return await executeFetch(currentEndpoint);
                        } catch (retryError) {
                            if (!retryError.isRetryable) {
                                throw retryError; // Non-retryable error
                            }
                            // Otherwise continue to the next endpoint
                        }
                        
                        retryAttempts++;
                    }
                    
                    // If we've exhausted all endpoints, throw the last error
                    throw error;
                } else {
                    // Not a retryable error
                    throw error;
                }
            }
        } catch (finalError) {
            // All retries failed
            return {
                success: false,
                status: 0,
                data: null,
                error: finalError.message || 'Network error. Please try again later.',
                originalError: finalError,
                isOffline: finalError.isNetworkError || false
            };
        }
    },
      // Simplified login function
    async login(username, rememberMe) {
        try {
            console.log('Using enhanced login function');
            
            // Pre-login check for connectivity
            if (typeof NetworkStatus !== 'undefined') {
                if (!NetworkStatus.isOnline) {
                    return {
                        success: false,
                        message: 'You appear to be offline. Please check your internet connection and try again.',
                        isOffline: true
                    };
                }
                
                // Check connection quality before login
                const connectionQuality = await NetworkStatus.checkConnectionQuality();
                if (connectionQuality === 'poor') {
                    console.warn('Poor connection quality detected, continuing with login but may be slow');
                }
            }
            
            // Add additional retry logic for mobile devices
            const loginRequest = async () => {
                return await this.fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, rememberMe })
                });
            };
            
            // Use retry with backoff for mobile devices
            let result;
            if (typeof isMobileDevice === 'function' && isMobileDevice()) {
                // Use NetworkRetry if available, otherwise fallback to direct request
                if (typeof NetworkRetry !== 'undefined') {
                    result = await NetworkRetry.retryWithBackoff(loginRequest, 3, 1000);
                } else {
                    result = await loginRequest();
                }
            } else {
                result = await loginRequest();
            }
            
            if (result.success) {
                // Store auth data in localStorage
                localStorage.setItem('tutor_authenticated', 'true');
                localStorage.setItem('tutor_username', username);
                localStorage.setItem('tutor_user_id', result.data?.userId || 'user_' + Math.random().toString(36).substr(2, 9));
                
                if (rememberMe) {
                    // Generate a device token
                    const deviceToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    localStorage.setItem('tutor_device_token', deviceToken);
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
                    message: result.error || 'Login failed. Please check your username.',
                    isOffline: result.isOffline || false
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // More detailed error message based on the error type
            let errorMessage = 'Network error. Please try on WiFi or check your signal strength.';
            
            if (error.isOffline) {
                errorMessage = 'You appear to be offline. Please check your internet connection and try again.';
            } else if (error.isTimeout) {
                errorMessage = 'Connection timed out. Please try again with a better signal or WiFi.';
            } else if (error.originalError && error.originalError.message) {
                errorMessage = `Error: ${error.originalError.message}`;
            }
            
            return {
                success: false,
                message: errorMessage,
                isOffline: error.isOffline || false
            };
        }
    },
    
    // Simplified registration function
    async register(username) {
        try {
            console.log('Using enhanced registration function');
            
            // Pre-registration check for connectivity
            if (typeof NetworkStatus !== 'undefined') {
                if (!NetworkStatus.isOnline) {
                    return {
                        success: false,
                        message: 'You appear to be offline. Please check your internet connection and try again.',
                        isOffline: true
                    };
                }
                
                // Check connection quality before registration
                const connectionQuality = await NetworkStatus.checkConnectionQuality();
                if (connectionQuality === 'poor') {
                    console.warn('Poor connection quality detected, continuing with registration but may be slow');
                }
            }
            
            const result = await this.fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });
            
            if (result.success) {
                // Store auth data in localStorage
                localStorage.setItem('tutor_authenticated', 'true');
                localStorage.setItem('tutor_username', username);
                localStorage.setItem('tutor_user_id', result.data.userId);
                
                // Generate a device token
                const deviceToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
                localStorage.setItem('tutor_device_token', deviceToken);
                localStorage.setItem('tutor_trusted', 'true');
                
                return {
                    success: true
                };
            } else {
                return {
                    success: false,
                    message: result.error || 'Registration failed. Username may already exist.',
                    isOffline: result.isOffline || false
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            // More detailed error message based on the error type
            let errorMessage = 'Network error. Please try on WiFi or check your signal strength.';
            
            if (error.isOffline) {
                errorMessage = 'You appear to be offline. Please check your internet connection and try again.';
            } else if (error.isTimeout) {
                errorMessage = 'Connection timed out. Please try again with a better signal or WiFi.';
            }
            
            return {
                success: false,
                message: errorMessage,
                isOffline: error.isOffline || false
            };
        }
    }
};

// Initialize API Manager
APIManager.init();
