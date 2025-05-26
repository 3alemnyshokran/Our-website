/**
 * Mobile Utilities for 3alemny Shokran Platform
 * This file contains mobile-specific utilities and enhancements
 * for improving the experience on smartphones and tablets.
 */

// Main mobile detection function
function isMobileDevice() {
  return (window.innerWidth <= 640) || 
         (navigator.maxTouchPoints > 0) || 
         /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Apply global mobile optimizations
function applyMobileOptimizations() {
  if (!isMobileDevice()) return;
  
  // Add mobile class to body
  document.body.classList.add('mobile-device');
  
  // Enhance touch targets
  optimizeTouchTargets();
  
  // Add viewport meta tag if missing
  ensureViewportMeta();
  
  // Add mobile navigation if not present
  ensureMobileNavigation();
  
  // Add haptic feedback to buttons
  addHapticFeedback();
  
  // Optimize forms for mobile
  optimizeForms();
  
  // Disable hover effects on mobile
  disableHoverEffects();
}

// Make sure viewport meta tag is properly set
function ensureViewportMeta() {
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    document.head.appendChild(viewportMeta);
  }
  
  viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  
  // Add theme-color meta for browser UI
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  
  const isDarkMode = document.documentElement.classList.contains('dark');
  themeColorMeta.content = isDarkMode ? '#0f172a' : '#1e40af';
}

// Optimize form inputs for mobile
function optimizeForms() {
  // Set font size to 16px to prevent iOS zoom
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea, select')
    .forEach(input => {
      input.style.fontSize = '16px';
      input.style.padding = '12px';
      
      // Add "Done" button to numeric inputs on iOS
      if (input.type === 'number' || input.type === 'tel') {
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('pattern', '[0-9]*');
      }
    });
  
  // Fix button sizing
  document.querySelectorAll('button, .btn, input[type="submit"], input[type="button"]')
    .forEach(button => {
      button.style.minHeight = '44px';
    });
}

// Ensure minimum touch target sizes
function optimizeTouchTargets() {
  // Minimum touch size according to WCAG guidelines
  const minSize = 44; // in pixels
  
  document.querySelectorAll('a, button, input, select, textarea, [role="button"]')
    .forEach(el => {
      const rect = el.getBoundingClientRect();
      
      // Only apply to visible elements that are too small
      if (el.offsetParent !== null && (rect.width < minSize || rect.height < minSize)) {
        // Don't modify layout elements or icons
        if (getComputedStyle(el).display !== 'none' && !el.classList.contains('icon-only')) {
          if (rect.width < minSize) {
            el.style.minWidth = `${minSize}px`;
          }
          if (rect.height < minSize) {
            el.style.minHeight = `${minSize}px`;
          }
        }
      }
    });
}

// Disable hover effects on mobile
function disableHoverEffects() {
  // Add class to body for CSS targeting
  document.body.classList.add('no-hover');
  
  // Add touch feedback styles
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 640px) {
      .no-hover * { 
        transition: none !important; 
      }
      .course-card:hover, a:hover, button:hover { 
        transform: none !important; 
      }
      .course-card:active, a:active, button:active { 
        background-color: rgba(0,0,0,0.05);
      }
    }
  `;
  document.head.appendChild(style);
}

// Add haptic feedback using Vibration API
function addHapticFeedback() {
  // Check if device supports vibration
  if ('vibrate' in navigator) {
    // Add vibration to all buttons and interactive elements
    document.querySelectorAll('button, .btn, input[type="submit"], .course-card, a.nav-button')
      .forEach(el => {
        el.addEventListener('click', () => {
          navigator.vibrate(15); // Short vibration (15ms)
        });
      });
  }
}

// Generate and insert mobile navigation
function ensureMobileNavigation() {
  // Check if mobile nav already exists
  if (document.querySelector('.mobile-nav')) return;
  
  // Get current page path
  const currentPath = window.location.pathname;
  
  // Create mobile navigation bar
  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav';
  
  // Define navigation items based on page context
  const isInCourse = currentPath.includes('/courses/');
  const courseType = isInCourse ? currentPath.split('/courses/')[1].split('/')[0] : '';
  const isInChapter = currentPath.includes('/chapters/');
  
  // Set up default navigation items
  const navItems = [
    {
      icon: '🏠',
      text: 'Home',
      link: getRelativePath('index.html'),
      active: currentPath.endsWith('index.html') || currentPath === '/'
    },
    {
      icon: '📚',
      text: 'Courses',
      link: isInCourse ? getRelativePath(`courses/${courseType}/${courseType}-course.html`) : getRelativePath('index.html#courses'),
      active: currentPath.includes(`${courseType}-course.html`)
    },
    {
      icon: isInChapter ? '📝' : '👤',
      text: isInChapter ? 'Chapter' : 'Profile',
      link: isInChapter ? getCurrentChapterLink() : getRelativePath('profile/profile-setup.html'),
      active: isInChapter || currentPath.includes('profile')
    },
    {
      icon: '⚙️',
      text: 'Settings',
      link: getRelativePath('auth/username-login.html'),
      active: currentPath.includes('auth/')
    }
  ];
  
  // Generate navigation HTML
  navItems.forEach(item => {
    const navItem = document.createElement('a');
    navItem.href = item.link;
    navItem.className = `mobile-nav-item${item.active ? ' active' : ''}`;
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'mobile-nav-icon';
    iconDiv.textContent = item.icon;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'mobile-nav-text';
    textDiv.textContent = item.text;
    
    navItem.appendChild(iconDiv);
    navItem.appendChild(textDiv);
    mobileNav.appendChild(navItem);
  });
  
  // Add to document
  document.body.appendChild(mobileNav);
}

// Helper function to get current chapter link
function getCurrentChapterLink() {
  const path = window.location.pathname;
  const parts = path.split('/');
  const chapterIndex = parts.findIndex(part => part === 'chapters');
  
  if (chapterIndex !== -1 && parts.length > chapterIndex + 2) {
    const courseType = parts[parts.findIndex(part => part === 'courses') + 1];
    return getRelativePath(`courses/${courseType}/${courseType}-course.html`);
  }
  
  return getRelativePath('index.html');
}

// Helper function to calculate relative paths
function getRelativePath(targetPath) {
  const currentPath = window.location.pathname;
  const currentDepth = (currentPath.match(/\//g) || []).length;
  
  // Base case for root
  if (currentDepth <= 1) return targetPath;
  
  // Calculate relative path based on current depth
  let prefix = '';
  for (let i = 1; i < currentDepth; i++) {
    prefix += '../';
  }
  
  return prefix + targetPath;
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  applyMobileOptimizations();
  
  // Re-apply on orientation change or resize
  window.addEventListener('resize', applyMobileOptimizations);
  window.addEventListener('orientationchange', applyMobileOptimizations);
});
