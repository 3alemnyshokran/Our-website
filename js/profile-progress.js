// User Profile Progress Visualization
// This script fetches and displays user progress on the profile page

// Load the progress-tracker.js script
const progressTrackerScript = document.createElement('script');
progressTrackerScript.src = '../js/progress-tracker.js';
progressTrackerScript.defer = true;
document.head.appendChild(progressTrackerScript);

/**
 * Formats time spent in seconds into a human-readable format
 * @param {number} seconds - The time in seconds
 * @returns {string} - The formatted time
 */
function formatTimeSpent(seconds) {
    if (!seconds || seconds === 0) return '0 min';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes} min`;
    }
}

/**
 * Creates a progress card for a specific course
 * @param {string} courseName - The name of the course
 * @param {Object} courseData - The progress data for the course
 * @returns {HTMLElement} - The course progress card element
 */
function createCourseProgressCard(courseName, courseData) {
    const displayName = courseName.charAt(0).toUpperCase() + courseName.slice(1);
    const progress = Math.round(courseData.progress || 0);
    const completedChapters = courseData.completedChapters || 0;
    const totalChapters = courseData.totalChapters || 0;
    const timeSpent = formatTimeSpent(courseData.timeSpent || 0);
    
    // Determine the color theme based on the course
    let colorTheme = {
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-50',
        bgDark: 'bg-blue-900/30',
        text: 'text-blue-600',
        textDark: 'text-blue-400'
    };
    
    switch (courseName) {
        case 'english':
            // Default blue theme
            break;
        case 'german':
            colorTheme = {
                bg: 'bg-yellow-500',
                bgLight: 'bg-yellow-50',
                bgDark: 'bg-yellow-900/30',
                text: 'text-yellow-600',
                textDark: 'text-yellow-400'
            };
            break;
        case 'arabic':
            colorTheme = {
                bg: 'bg-green-500',
                bgLight: 'bg-green-50',
                bgDark: 'bg-green-900/30',
                text: 'text-green-600',
                textDark: 'text-green-400'
            };
            break;
        case 'math':
            colorTheme = {
                bg: 'bg-pink-500',
                bgLight: 'bg-pink-50',
                bgDark: 'bg-pink-900/30',
                text: 'text-pink-600',
                textDark: 'text-pink-400'
            };
            break;
        case 'science':
            colorTheme = {
                bg: 'bg-purple-500',
                bgLight: 'bg-purple-50',
                bgDark: 'bg-purple-900/30',
                text: 'text-purple-600',
                textDark: 'text-purple-400'
            };
            break;
    }
    
    const card = document.createElement('div');
    card.className = `bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700`;
    
    card.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h4 class="text-md font-semibold ${colorTheme.text} dark:${colorTheme.textDark}">${displayName} Course</h4>
            <span class="text-sm font-medium ${colorTheme.text} dark:${colorTheme.textDark}">${progress}%</span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
            <div class="${colorTheme.bg} h-2 rounded-full" style="width: ${progress}%"></div>
        </div>
        <div class="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>${completedChapters}/${totalChapters} chapters</span>
            <span>${timeSpent}</span>
        </div>
        ${completedChapters > 0 ? `
        <div class="mt-3">
            <a href="../courses/${courseName}/${courseName}-course.html" class="text-sm ${colorTheme.text} dark:${colorTheme.textDark} hover:underline">
                Continue Learning →
            </a>
        </div>
        ` : ''}
    `;
    
    return card;
}

/**
 * Loads and displays the user's progress on the profile page
 */
async function loadUserProgress() {
    const username = localStorage.getItem('username');
    if (!username) {
        console.error('User not logged in');
        return;
    }
    
    // Get the progress data container
    const courseProgressCards = document.getElementById('course-progress-cards');
    if (!courseProgressCards) {
        console.error('Course progress cards container not found');
        return;
    }
    
    // Show loading indicator
    courseProgressCards.innerHTML = `
        <div class="text-center text-slate-500 dark:text-slate-400 py-4">
            Loading your progress data...
        </div>
    `;
    
    try {
        // Wait for the progress-tracker.js script to load
        await new Promise(resolve => {
            if (typeof getUserProgress === 'function') {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (typeof getUserProgress === 'function') {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            }
        });
        
        // Fetch progress data for each course
        const courses = ['english', 'german', 'arabic', 'math', 'science'];
        const progressData = {};
        let totalProgress = 0;
        let totalCourses = 0;
        let totalChaptersCompleted = 0;
        let totalTimeSpent = 0;
        let coursesStarted = 0;
        
        for (const course of courses) {
            const courseData = await getUserProgress(course);
            if (courseData.success) {
                progressData[course] = courseData.stats;
                
                if (courseData.stats.progress > 0) {
                    totalProgress += courseData.stats.progress;
                    totalCourses++;
                    coursesStarted++;
                }
                
                totalChaptersCompleted += courseData.stats.completedChapters;
                totalTimeSpent += courseData.stats.timeSpent;
            }
        }
        
        // Calculate overall progress
        const overallProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
        
        // Update overall progress statistics
        document.getElementById('overall-progress-percent').textContent = `${overallProgress}%`;
        document.getElementById('overall-progress-bar').style.width = `${overallProgress}%`;
        document.getElementById('courses-started-count').textContent = coursesStarted;
        document.getElementById('chapters-completed-count').textContent = totalChaptersCompleted;
        document.getElementById('total-time-spent').textContent = formatTimeSpent(totalTimeSpent);
        
        // Clear the container
        courseProgressCards.innerHTML = '';
        
        // Create and add course cards
        let hasProgress = false;
        
        for (const [course, data] of Object.entries(progressData)) {
            if (data.progress > 0) {
                hasProgress = true;
                const card = createCourseProgressCard(course, data);
                courseProgressCards.appendChild(card);
            }
        }
        
        // If no progress in any course, show a message
        if (!hasProgress) {
            courseProgressCards.innerHTML = `
                <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <div class="text-slate-600 dark:text-slate-400 mb-3">You haven't started any courses yet.</div>
                    <a href="../index.html" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                        Browse Courses
                    </a>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading progress data:', error);
        courseProgressCards.innerHTML = `
            <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-center text-red-500">
                Error loading progress data. Please try again later.
            </div>
        `;
    }
}

// Load user progress when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('username')) {
        loadUserProgress();
    } else {
        // Show a message for non-logged in users
        const userProgressOverview = document.getElementById('user-progress-overview');
        const courseProgressCards = document.getElementById('course-progress-cards');
        
        if (userProgressOverview) {
            userProgressOverview.innerHTML = `
                <div class="text-center text-slate-600 dark:text-slate-400 py-4">
                    You need to be logged in to view your progress.
                </div>
            `;
        }
        
        if (courseProgressCards) {
            courseProgressCards.innerHTML = `
                <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <div class="text-slate-600 dark:text-slate-400 mb-3">Please log in to track your learning progress.</div>
                    <a href="../auth/login.html" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                        Log In
                    </a>
                </div>
            `;
        }
    }
});
