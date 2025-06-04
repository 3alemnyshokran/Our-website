/**
 * Network Connectivity Helper
 * Provides utilities to check network connectivity, retry failed requests,
 * and optimize for mobile connections
 */

// Network status tracking
const NetworkStatus = {
  // Current connection status
  isOnline: navigator.onLine,
  
  // Connection type detection (if available)
  connectionType: null,
  
  // Connection quality estimation
  connectionQuality: 'unknown',
  
  // Last ping time in ms
  lastPingTime: null,
  
  // Initialize network status detection
  init() {
    // Set initial online status
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      document.dispatchEvent(new CustomEvent('network-status-change', { 
        detail: { isOnline: true }
      }));
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      document.dispatchEvent(new CustomEvent('network-status-change', { 
        detail: { isOnline: false }
      }));
    });
    
    // Try to get connection information if available
    if (navigator.connection) {
      this.connectionType = navigator.connection.type;
      
      // Listen for connection changes
      navigator.connection.addEventListener('change', () => {
        this.connectionType = navigator.connection.type;
      });
    }
    
    // Initial connection quality check
    this.checkConnectionQuality();
    
    return this;
  },
  
  // Check if we're online
  checkOnlineStatus() {
    return this.isOnline;
  },
  
  // Test connection quality by pinging the API
  async checkConnectionQuality() {
    if (!this.isOnline) {
      this.connectionQuality = 'offline';
      this.lastPingTime = null;
      return 'offline';
    }
    
    try {
      const startTime = performance.now();
      
      // Try to fetch a small endpoint to test connection
      const response = await fetch(`${this.getTestEndpoint()}?_=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(5000)
      });
      
      const endTime = performance.now();
      const pingTime = endTime - startTime;
      
      this.lastPingTime = pingTime;
      
      // Determine connection quality based on ping time
      if (pingTime < 300) {
        this.connectionQuality = 'excellent';
      } else if (pingTime < 1000) {
        this.connectionQuality = 'good';
      } else if (pingTime < 3000) {
        this.connectionQuality = 'fair';
      } else {
        this.connectionQuality = 'poor';
      }
      
      return this.connectionQuality;
    } catch (error) {
      console.warn('Connection quality check failed:', error);
      this.connectionQuality = 'poor';
      return 'poor';
    }
  },
  
  // Get a lightweight endpoint to test connection
  getTestEndpoint() {
    // First try the status endpoint
    const currentHost = window.location.hostname;
    
    // If running locally via file:// protocol
    if (window.location.protocol === 'file:') {
      return 'https://our-fucking-project-5yrcg4w98-shdwflxres-projects.vercel.app/api/status';
    }
    
    // If running on localhost
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://localhost:3001/api/status';
    }
    
    // For production/deployed environments
    return '/api/status';
  }
};

// Retry logic for network requests
const NetworkRetry = {
  // Retry a function with exponential backoff
  async retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let retries = 0;
    let delay = initialDelay;
    
    while (retries < maxRetries) {
      try {
        return await fn();
      } catch (error) {
        retries++;
        
        // Stop retrying if we've hit the max
        if (retries >= maxRetries) {
          throw error;
        }
        
        console.log(`Retry attempt ${retries} after ${delay}ms...`);
        
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Exponential backoff
        delay = delay * 2;
      }
    }
  },
  
  // Check if an error is retry-able
  isRetryableError(error) {
    // Network errors are usually retry-able
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return true;
    }
    
    // Timeout errors
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return true;
    }
    
    // Server errors (5xx) are retry-able
    if (error.status && error.status >= 500 && error.status < 600) {
      return true;
    }
    
    return false;
  }
};

// Initialize network status detection
NetworkStatus.init();
