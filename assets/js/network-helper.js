/**
 * Network Connectivity Helper
 * Provides utilities to check network connectivity, retry failed requests,
 * and optimize for mobile connections
 */

// Detect if running on a mobile device
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4))
  );
}

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
      this.updateNetworkStatusUI();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      document.dispatchEvent(new CustomEvent('network-status-change', { 
        detail: { isOnline: false }
      }));
      this.updateNetworkStatusUI();
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
    
    // Update UI
    this.updateNetworkStatusUI();
    
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
      this.updateNetworkStatusUI();
      return 'offline';
    }
    
    try {
      const startTime = performance.now();
      
      // Try to fetch a small endpoint to test connection
      const testUrl = `${this.getTestEndpoint()}?_=${Date.now()}`;
      console.log(`Testing connection quality with: ${testUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-store',
        redirect: 'error',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const endTime = performance.now();
      const pingTime = endTime - startTime;
      
      this.lastPingTime = pingTime;
      
      console.log(`Network ping time: ${pingTime.toFixed(0)}ms`);
      
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
      
      // Update UI if networkStatus element exists
      this.updateNetworkStatusUI();
      
      return this.connectionQuality;
    } catch (error) {
      console.warn('Connection quality check failed:', error);
      
      // Check if it's an abort error (timeout)
      if (error.name === 'AbortError') {
        console.warn('Connection test timed out after 5 seconds');
      }
      
      this.connectionQuality = 'poor';
      
      // Update UI if networkStatus element exists
      this.updateNetworkStatusUI();
      
      return 'poor';
    }
  },
  
  // Update network status UI element if it exists
  updateNetworkStatusUI() {
    const networkStatusEl = document.getElementById('networkStatus');
    if (networkStatusEl) {
      // Remove existing status classes
      networkStatusEl.classList.remove('online', 'offline', 'poor');
      
      // Set appropriate icon and text
      const iconEl = networkStatusEl.querySelector('i');
      const textEl = networkStatusEl.querySelector('span');
      
      if (!this.isOnline) {
        networkStatusEl.classList.add('offline');
        if (iconEl) iconEl.className = 'fas fa-wifi-slash';
        if (textEl) textEl.textContent = 'Offline';
      } else if (this.connectionQuality === 'poor') {
        networkStatusEl.classList.add('poor');
        if (iconEl) iconEl.className = 'fas fa-wifi';
        if (textEl) textEl.textContent = 'Poor Connection';
      } else {
        networkStatusEl.classList.add('online');
        if (iconEl) iconEl.className = 'fas fa-wifi';
        if (textEl) textEl.textContent = 'Online';
      }
    }
  },
  
  // Get a lightweight endpoint to test connection
  getTestEndpoint() {
    // First try the status endpoint
    const currentHost = window.location.hostname;
    
    // If running locally via file:// protocol
    if (window.location.protocol === 'file:') {
      return 'https://our-fucking-project-ae8ynbm03-shdwflxres-projects.vercel.app/api/status';
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
