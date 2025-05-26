/**
 * Progress Utilities for 3alemny Shokran Platform
 * This file contains utilities for tracking and displaying user progress
 * across various courses and chapters.
 */

// Display progress for each chapter with the given prefix
function displayCourseProgress(coursePrefix, progressMapping) {
  // Update all progress elements
  progressMapping.forEach(item => {
    // Get progress value (default to 0 if not found)
    const progress = localStorage.getItem(item.key) || '0';
    
    // Get the DOM elements
    const textElement = document.getElementById(item.textId);
    const barElement = document.getElementById(item.barId);
    
    // Update if elements exist
    if (textElement) textElement.textContent = progress + '%';
    if (barElement) barElement.style.width = progress + '%';
  });
  
  // Apply mobile-specific optimizations for progress bars
  optimizeProgressBarsForMobile();
}

// Display progress for English course
function displayEnglishProgress() {
  // Define the mapping of progress keys to DOM elements
  const progressMapping = [
    { key: 'english_a1_chapter1_progress', textId: 'a1-progress', barId: 'a1-progress-bar' },
    { key: 'english_a2_chapter1_progress', textId: 'a2-progress', barId: 'a2-progress-bar' },
    { key: 'english_b1_chapter1_progress', textId: 'b1-progress', barId: 'b1-progress-bar' },
    { key: 'english_b2_chapter1_progress', textId: 'b2-progress', barId: 'b2-progress-bar' },
    { key: 'english_c1_chapter1_progress', textId: 'c1-progress', barId: 'c1-progress-bar' },
    { key: 'english_c2_chapter1_progress', textId: 'c2-progress', barId: 'c2-progress-bar' }
  ];
  
  displayCourseProgress('english', progressMapping);
}

// Display progress for Math course
function displayMathProgress() {
  // Define the mapping of progress keys to DOM elements
  const progressMapping = [
    { key: 'math_basic_chapter1_progress', textId: 'basic-progress', barId: 'basic-progress-bar' },
    { key: 'math_algebra_chapter1_progress', textId: 'algebra-progress', barId: 'algebra-progress-bar' },
    { key: 'math_geometry_chapter1_progress', textId: 'geometry-progress', barId: 'geometry-progress-bar' },
    { key: 'math_calculus_chapter1_progress', textId: 'calculus-progress', barId: 'calculus-progress-bar' },
    { key: 'math_statistics_chapter1_progress', textId: 'statistics-progress', barId: 'statistics-progress-bar' }
  ];
  
  displayCourseProgress('math', progressMapping);
}

// Display progress for Science course
function displayScienceProgress() {
  // Define the mapping of progress keys to DOM elements
  const progressMapping = [
    { key: 'science_biology_chapter1_progress', textId: 'biology-progress', barId: 'biology-progress-bar' },
    { key: 'science_chemistry_chapter1_progress', textId: 'chemistry-progress', barId: 'chemistry-progress-bar' },
    { key: 'science_physics_chapter1_progress', textId: 'physics-progress', barId: 'physics-progress-bar' },
    { key: 'science_astronomy_chapter1_progress', textId: 'astronomy-progress', barId: 'astronomy-progress-bar' }
  ];
  
  displayCourseProgress('science', progressMapping);
}

// Display progress for German course
function displayGermanProgress() {
  // Define the mapping of progress keys to DOM elements
  const progressMapping = [
    { key: 'german_a1_chapter1_progress', textId: 'german-a1-progress', barId: 'german-a1-progress-bar' },
    { key: 'german_a2_chapter1_progress', textId: 'german-a2-progress', barId: 'german-a2-progress-bar' },
    { key: 'german_b1_chapter1_progress', textId: 'german-b1-progress', barId: 'german-b1-progress-bar' },
    { key: 'german_b2_chapter1_progress', textId: 'german-b2-progress', barId: 'german-b2-progress-bar' }
  ];
  
  displayCourseProgress('german', progressMapping);
}

// Display progress for Arabic course
function displayArabicProgress() {
  // Define the mapping of progress keys to DOM elements
  const progressMapping = [
    { key: 'arabic_beginner_chapter1_progress', textId: 'arabic-beginner-progress', barId: 'arabic-beginner-progress-bar' },
    { key: 'arabic_intermediate_chapter1_progress', textId: 'arabic-intermediate-progress', barId: 'arabic-intermediate-progress-bar' },
    { key: 'arabic_advanced_chapter1_progress', textId: 'arabic-advanced-progress', barId: 'arabic-advanced-progress-bar' }
  ];
  
  displayCourseProgress('arabic', progressMapping);
}

/**
 * Mobile Optimization Functions
 */

// Optimize progress bars for mobile devices
function optimizeProgressBarsForMobile() {
  // Check if we're on a mobile device
  if (window.innerWidth <= 640) {
    // Find all progress bars
    const progressBars = document.querySelectorAll('[id$="-progress-bar"]');
    const progressTexts = document.querySelectorAll('[id$="-progress"]');
    
    // Adjust progress bars for better mobile display
    progressBars.forEach(bar => {
      // Add touch feedback
      bar.style.height = '12px'; // Slightly taller for better visibility
      
      // Add a slight animation for visual feedback when tapped
      bar.addEventListener('touchstart', function() {
        this.style.opacity = '0.8';
      });
      
      bar.addEventListener('touchend', function() {
        this.style.opacity = '1';
      });
    });
    
    // Make progress text more visible on mobile
    progressTexts.forEach(text => {
      text.style.fontSize = '14px';
      text.style.fontWeight = 'bold';
    });
  }
}

// Check if device is mobile
function isMobileDevice() {
  return (window.innerWidth <= 640) || 
         (navigator.maxTouchPoints > 0) || 
         /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Apply mobile-specific optimizations
function applyMobileOptimizations() {
  if (isMobileDevice()) {
    // Add mobile-specific body class
    document.body.classList.add('mobile-device');
    
    // Optimize form inputs for mobile
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]')
      .forEach(input => {
        // Set minimum height for better touch targets
        input.style.minHeight = '44px';
        // Set font size to prevent iOS zoom
        input.style.fontSize = '16px';
      });
    
    // Improve button touch targets
    document.querySelectorAll('button, .action-button, .nav-button')
      .forEach(button => {
        button.style.minHeight = '44px';
        button.style.minWidth = '44px';
      });
      
    // Improve link targets
    document.querySelectorAll('a')
      .forEach(link => {
        // Only apply to links that are meant to be clicked (not layout links)
        if (link.textContent.trim() !== '') {
          link.style.padding = '8px';
          link.style.display = 'inline-block';
        }
      });
  }
}

// Initialize mobile optimizations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  applyMobileOptimizations();
  optimizeProgressBarsForMobile();
  
  // Reapply on resize
  window.addEventListener('resize', function() {
    applyMobileOptimizations();
    optimizeProgressBarsForMobile();
  });
});

// Add mobile-specific optimizations for progress bars
function optimizeProgressBarsForMobile() {
  // Check if we're on a mobile device
  const isMobile = window.innerWidth < 768;
  
  // Get all progress bars
  const progressBars = document.querySelectorAll('.progress-bar');
  const progressContainers = document.querySelectorAll('.progress');
  
  if (isMobile) {
    // Optimize for mobile - thinner progress bars with better touch feedback
    progressBars.forEach(bar => {
      bar.style.height = '10px';
      bar.style.borderRadius = '5px';
    });
    
    progressContainers.forEach(container => {
      container.style.height = '10px';
      container.style.marginBottom = '15px';
      container.style.borderRadius = '5px';
    });
  } else {
    // Reset to desktop defaults
    progressBars.forEach(bar => {
      bar.style.height = '';
      bar.style.borderRadius = '';
    });
    
    progressContainers.forEach(container => {
      container.style.height = '';
      container.style.marginBottom = '';
      container.style.borderRadius = '';
    });
  }
}

// Migrate old progress keys to new namespaced format
function migrateProgressKeys(coursePrefix, oldToNewKeys) {
  for (const [oldKey, newKey] of Object.entries(oldToNewKeys)) {
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue !== null) {
      // Only set the new key if it doesn't already exist
      if (localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldValue);
        console.log(`Migrated ${oldKey} to ${newKey}`);
      }
    }
  }
}

// Initialize progress values with proper namespacing
function initializeProgress(coursePrefix, progressKeys) {
  // Check if progress values exist, if not, initialize them to 0
  progressKeys.forEach(key => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, '0');
    } else {
      // Ensure the progress value is valid (between 0 and 100)
      const progress = parseFloat(localStorage.getItem(key));
      if (isNaN(progress) || progress < 0 || progress > 100) {
        localStorage.setItem(key, '0');
        console.log(`Reset invalid progress value for ${key}`);
      }
    }
  });
}

// Generic function to apply course locks based on completed prerequisites
function applyCourseSequentialLocks(courseLevels, completionThreshold = 100) {
  // First level is always unlocked
  if (courseLevels.length > 0 && courseLevels[0].element) {
    courseLevels[0].element.classList.remove('locked');
  }
  
  // For each subsequent level, check if the previous level is completed
  for (let i = 1; i < courseLevels.length; i++) {
    const previousProgress = parseFloat(localStorage.getItem(courseLevels[i-1].progressKey)) || 0;
    const isPreviousCompleted = previousProgress >= completionThreshold;
    
    if (courseLevels[i].element) {
      if (!isPreviousCompleted) {
        courseLevels[i].element.classList.add('locked');
      } else {
        courseLevels[i].element.classList.remove('locked');
      }
    }
  }
}

// Handler for window resize events to optimize progress bars
window.addEventListener('resize', function() {
  optimizeProgressBarsForMobile();
});

// Export the functions to make them available
window.ProgressUtils = {
  displayEnglishProgress,
  displayMathProgress,
  displayScienceProgress,
  displayGermanProgress,
  displayArabicProgress,
  optimizeProgressBarsForMobile,
  migrateProgressKeys,
  initializeProgress,
  applyCourseSequentialLocks
};
