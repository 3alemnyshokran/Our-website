// Progress tracking utility functions for 3alemny Shokran platform
// filepath: c:\Users\felix\OneDrive\Desktop\our fucking project\js\progress-tracker.js

/**
 * Tracks the user's progress in a course chapter
 * @param {string} course - Course identifier (e.g., 'english', 'math')
 * @param {string} chapter - Chapter identifier (e.g., 'a1-chapter1')
 * @param {string} status - Status of completion ('started', 'in-progress', 'completed')
 * @param {number} score - Score achieved (if applicable)
 * @param {number} maxScore - Maximum possible score
 * @param {number} timeSpent - Time spent in seconds
 * @returns {Promise} - Promise that resolves to the server response
 */
async function trackProgress(course, chapter, status, score = 0, maxScore = 100, timeSpent = 0) {
  // Get the username from localStorage
  const username = localStorage.getItem('username');
  if (!username) {
    console.error('User not logged in');
    return { success: false, error: 'User not logged in' };
  }

  try {
    const response = await fetch('http://localhost:3001/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        course,
        chapter,
        status,
        score,
        maxScore,
        timeSpent
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error tracking progress:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get the user's progress for a specific course
 * @param {string} course - Course identifier (e.g., 'english', 'math')
 * @returns {Promise} - Promise that resolves to the user's progress data
 */
async function getUserProgress(course) {
  const username = localStorage.getItem('username');
  if (!username) {
    console.error('User not logged in');
    return { success: false, error: 'User not logged in' };
  }

  try {
    const response = await fetch(`http://localhost:3001/api/progress/${username}/${course}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting progress:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Initialize a timer to track time spent on a page
 * @param {string} course - Course identifier
 * @param {string} chapter - Chapter identifier
 * @returns {object} - Timer object with start and stop methods
 */
function initTimeTracker(course, chapter) {
  let startTime = Date.now();
  let isRunning = true;
  let timeSpentSeconds = 0;
  let updateInterval;

  // Update the server every minute with the current time spent
  updateInterval = setInterval(() => {
    if (isRunning) {
      const currentTimeSpent = Math.floor((Date.now() - startTime) / 1000);
      const newSeconds = currentTimeSpent - timeSpentSeconds;
      if (newSeconds > 0) {
        timeSpentSeconds = currentTimeSpent;
        trackProgress(course, chapter, 'in-progress', null, null, newSeconds);
      }
    }
  }, 60000); // Every minute

  // When the user leaves the page, send final update
  window.addEventListener('beforeunload', () => {
    if (isRunning) {
      const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
      const newSeconds = finalTimeSpent - timeSpentSeconds;
      if (newSeconds > 0) {
        // Using navigator.sendBeacon for reliable data sending when page unloads
        const data = JSON.stringify({
          username: localStorage.getItem('username'),
          course,
          chapter,
          status: 'in-progress',
          timeSpent: newSeconds
        });
        
        navigator.sendBeacon('http://localhost:3001/api/progress', data);
      }
    }
  });

  return {
    start: () => {
      if (!isRunning) {
        startTime = Date.now() - (timeSpentSeconds * 1000);
        isRunning = true;
      }
    },
    stop: () => {
      if (isRunning) {
        const currentTimeSpent = Math.floor((Date.now() - startTime) / 1000);
        const newSeconds = currentTimeSpent - timeSpentSeconds;
        if (newSeconds > 0) {
          timeSpentSeconds = currentTimeSpent;
          trackProgress(course, chapter, 'in-progress', null, null, newSeconds);
        }
        isRunning = false;
      }
      clearInterval(updateInterval);
    },
    getTimeSpent: () => {
      if (isRunning) {
        return Math.floor((Date.now() - startTime) / 1000);
      }
      return timeSpentSeconds;
    }
  };
}

/**
 * Display a progress indicator on the page
 * @param {string} courseId - Course identifier
 * @param {string} targetElementId - ID of the HTML element to display progress in
 */
async function displayCourseProgress(courseId, targetElementId) {
  const progressData = await getUserProgress(courseId);
  const targetElement = document.getElementById(targetElementId);
  
  if (!targetElement) {
    console.error(`Target element with ID ${targetElementId} not found`);
    return;
  }
  
  if (progressData.success) {
    const { stats } = progressData;
    
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'course-progress-container';
    progressBar.innerHTML = `
      <div class="progress-label">Course Progress: ${stats.overallProgress}%</div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${stats.overallProgress}%"></div>
      </div>
      <div class="progress-details">
        <span>${stats.completedChapters}/${stats.totalChapters} chapters completed</span>
      </div>
    `;
    
    // Apply styles
    const style = document.createElement('style');
    style.textContent = `
      .course-progress-container {
        background: #f0f4f8;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .progress-label {
        font-weight: 600;
        margin-bottom: 8px;
        color: #2d3748;
      }
      .progress-bar-container {
        height: 10px;
        background: #e2e8f0;
        border-radius: 5px;
        overflow: hidden;
      }
      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #3182ce, #63b3ed);
        border-radius: 5px;
        transition: width 0.5s ease-in-out;
      }
      .progress-details {
        font-size: 0.875rem;
        color: #718096;
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
      }
    `;
    
    document.head.appendChild(style);
    targetElement.appendChild(progressBar);
  } else {
    targetElement.innerHTML = `<div class="alert">Could not load progress data.</div>`;
  }
}

/**
 * Mark a chapter as completed
 * @param {string} course - Course identifier
 * @param {string} chapter - Chapter identifier
 * @param {number} score - Score achieved
 * @param {number} maxScore - Maximum possible score
 * @returns {Promise} - Promise that resolves to the server response
 */
async function completeChapter(course, chapter, score = 100, maxScore = 100) {
  const result = await trackProgress(course, chapter, 'completed', score, maxScore, 0);
  if (result.success) {
    // Show completion message
    alert(`Congratulations! You have completed this chapter with a score of ${score}/${maxScore}.`);
  }
  return result;
}

// Make functions available globally
window.trackProgress = trackProgress;
window.getUserProgress = getUserProgress;
window.initTimeTracker = initTimeTracker;
window.displayCourseProgress = displayCourseProgress;
window.completeChapter = completeChapter;
