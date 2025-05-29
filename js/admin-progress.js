// Admin Progress Dashboard functionality
// This script handles fetching and displaying user progress data

/**
 * Fetches all users' progress data from the server
 * @returns {Promise} - Promise that resolves to the users' progress data
 */
async function fetchAllUsersProgress() {
    try {
        const response = await fetch('http://localhost:3001/api/admin/all-progress');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching all users progress:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches recent activity data from the server
 * @returns {Promise} - Promise that resolves to the recent activity data
 */
async function fetchRecentActivity() {
    try {
        const response = await fetch('http://localhost:3001/api/admin/recent-activity');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches detailed progress data for a specific user
 * @param {string} username - The username to fetch progress for
 * @returns {Promise} - Promise that resolves to the user's detailed progress data
 */
async function fetchUserDetailedProgress(username) {
    try {
        const response = await fetch(`http://localhost:3001/api/admin/user-progress/${username}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching detailed progress for user ${username}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Formats a timestamp into a human-readable format
 * @param {string} timestamp - The timestamp to format
 * @returns {string} - The formatted timestamp
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

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
 * Updates the overall progress statistics in the dashboard
 * @param {Object} progressData - The progress data from the server
 */
function updateOverallStats(progressData) {
    if (!progressData.success || !progressData.stats) {
        console.error('Invalid progress data for stats update');
        return;
    }
    
    const { stats } = progressData;
    
    // Update the overall statistics
    document.getElementById('total-users-count').textContent = stats.totalUsers || 0;
    document.getElementById('total-chapters-count').textContent = stats.totalCompletedChapters || 0;
    document.getElementById('avg-completion').textContent = `${Math.round(stats.averageCompletion || 0)}%`;
    document.getElementById('active-today-count').textContent = stats.activeToday || 0;
    
    // Update the total progress bar
    const totalProgressPercent = Math.round(stats.platformWideProgress || 0);
    document.getElementById('total-progress-percent').textContent = `${totalProgressPercent}%`;
    document.getElementById('total-progress-bar').style.width = `${totalProgressPercent}%`;
    
    // Update course comparison
    if (stats.courseProgress) {
        const courses = ['english', 'german', 'arabic', 'math', 'science'];
        
        courses.forEach(course => {
            const courseProgress = stats.courseProgress[course] || 0;
            const roundedProgress = Math.round(courseProgress);
            
            document.getElementById(`${course}-progress-percent`).textContent = `${roundedProgress}%`;
            document.getElementById(`${course}-progress-bar`).style.width = `${roundedProgress}%`;
        });
    }
}

/**
 * Populates the user progress table in the dashboard
 * @param {Object} progressData - The progress data from the server
 * @param {number} page - The page number to display
 * @param {number} pageSize - The number of users per page
 */
function populateUserProgressTable(progressData, page = 1, pageSize = 10) {
    if (!progressData.success || !progressData.users || !Array.isArray(progressData.users)) {
        console.error('Invalid progress data for table population');
        return;
    }
    
    const { users } = progressData;
    const tableBody = document.getElementById('user-progress-table');
    
    // Clear the table
    tableBody.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, users.length);
    const usersToDisplay = users.slice(startIndex, endIndex);
    
    // Update pagination info
    document.getElementById('shown-users-count').textContent = usersToDisplay.length;
    document.getElementById('total-users-table-count').textContent = users.length;
    
    // Enable/disable pagination buttons
    document.getElementById('prev-page-btn').disabled = page <= 1;
    document.getElementById('next-page-btn').disabled = endIndex >= users.length;
    
    // If no users, show a message
    if (usersToDisplay.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                No user progress data available
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    // Add users to the table
    usersToDisplay.forEach(user => {
        const row = document.createElement('tr');
        
        // Calculate the average progress across all courses
        const totalProgress = user.courses ? 
            Object.values(user.courses).reduce((sum, course) => sum + (course.progress || 0), 0) / Object.keys(user.courses).length : 0;
        
        const roundedProgress = Math.round(totalProgress);
        
        // Get the most recent activity
        let lastActivity = 'Never';
        let mostRecentTimestamp = null;
        
        if (user.courses) {
            Object.values(user.courses).forEach(course => {
                if (course.lastAccessed && (!mostRecentTimestamp || new Date(course.lastAccessed) > new Date(mostRecentTimestamp))) {
                    mostRecentTimestamp = course.lastAccessed;
                }
            });
            
            if (mostRecentTimestamp) {
                lastActivity = formatTimestamp(mostRecentTimestamp);
            }
        }
        
        // Calculate total time spent
        const totalTimeSpent = user.courses ? 
            Object.values(user.courses).reduce((sum, course) => sum + (course.timeSpent || 0), 0) : 0;
        
        // Get the course with the most progress
        let topCourse = 'N/A';
        let topCourseProgress = 0;
        
        if (user.courses) {
            Object.entries(user.courses).forEach(([courseName, course]) => {
                if (course.progress > topCourseProgress) {
                    topCourse = courseName.charAt(0).toUpperCase() + courseName.slice(1);
                    topCourseProgress = course.progress;
                }
            });
        }
        
        row.innerHTML = `
            <td class="px-4 py-4">
                <div class="font-medium text-gray-800 dark:text-gray-200">${user.username}</div>
            </td>
            <td class="px-4 py-4">
                <div class="text-gray-700 dark:text-gray-300">${topCourse}</div>
            </td>
            <td class="px-4 py-4">
                <div class="flex items-center">
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${roundedProgress}%"></div>
                    </div>
                    <span class="text-gray-700 dark:text-gray-300">${roundedProgress}%</span>
                </div>
            </td>
            <td class="px-4 py-4">
                <div class="text-gray-700 dark:text-gray-300">${lastActivity}</div>
            </td>
            <td class="px-4 py-4">
                <div class="text-gray-700 dark:text-gray-300">${formatTimeSpent(totalTimeSpent)}</div>
            </td>
            <td class="px-4 py-4">
                <button class="view-details-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs" 
                        data-username="${user.username}">
                    View Details
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to the "View Details" buttons
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const username = button.getAttribute('data-username');
            const detailedData = await fetchUserDetailedProgress(username);
            
            if (detailedData.success) {
                showUserDetailsModal(username, detailedData);
            } else {
                alert(`Error fetching details for ${username}: ${detailedData.error}`);
            }
        });
    });
}

/**
 * Shows a modal with detailed user progress information
 * @param {string} username - The username
 * @param {Object} detailedData - The detailed progress data
 */
function showUserDetailsModal(username, detailedData) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('user-details-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'user-details-modal';
        modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50';
        
        document.body.appendChild(modal);
    }
    
    // Format the courses data for display
    const coursesHtml = detailedData.courses 
        ? Object.entries(detailedData.courses).map(([courseName, courseData]) => {
            const chapters = courseData.chapters || [];
            
            const chaptersHtml = chapters.map(chapter => `
                <div class="mb-2 pl-6">
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-slate-600 dark:text-slate-400">
                            ${chapter.chapter}
                        </div>
                        <div class="text-sm font-medium ${chapter.status === 'completed' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-yellow-600 dark:text-yellow-400'}">
                            ${chapter.status === 'completed' ? 'Completed' : 'In Progress'}
                        </div>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                        <div class="${chapter.status === 'completed' 
                            ? 'bg-green-500' 
                            : 'bg-yellow-500'} h-1.5 rounded-full" 
                            style="width: ${chapter.status === 'completed' ? '100' : '50'}%">
                        </div>
                    </div>
                    <div class="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-500">
                        <span>Time: ${formatTimeSpent(chapter.timeSpent || 0)}</span>
                        <span>Last: ${formatTimestamp(chapter.lastAccessed || null)}</span>
                    </div>
                </div>
            `).join('');
            
            return `
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="text-md font-semibold text-slate-700 dark:text-slate-300 capitalize">
                            ${courseName} Course
                        </h4>
                        <div class="text-sm">
                            Progress: <span class="font-medium text-blue-600 dark:text-blue-400">
                                ${Math.round(courseData.progress || 0)}%
                            </span>
                        </div>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                        <div class="bg-blue-500 h-2 rounded-full" 
                            style="width: ${Math.round(courseData.progress || 0)}%">
                        </div>
                    </div>
                    <div class="bg-slate-100 dark:bg-slate-850 p-3 rounded-md">
                        ${chaptersHtml || '<div class="text-sm text-center text-slate-500 dark:text-slate-400">No chapters started yet</div>'}
                    </div>
                </div>
            `;
        }).join('') 
        : '<div class="text-center text-slate-500 dark:text-slate-400">No course data available</div>';
    
    // Create modal content
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300">
                    User Progress Details: ${username}
                </h3>
                <button id="close-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="p-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-center">
                        <div class="text-sm text-slate-600 dark:text-slate-400">Total Time Spent</div>
                        <div class="text-xl font-bold text-blue-600 dark:text-blue-400">
                            ${formatTimeSpent(detailedData.totalTimeSpent || 0)}
                        </div>
                    </div>
                    <div class="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg text-center">
                        <div class="text-sm text-slate-600 dark:text-slate-400">Chapters Completed</div>
                        <div class="text-xl font-bold text-green-600 dark:text-green-400">
                            ${detailedData.completedChapters || 0}
                        </div>
                    </div>
                    <div class="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg text-center">
                        <div class="text-sm text-slate-600 dark:text-slate-400">Last Activity</div>
                        <div class="text-xl font-bold text-purple-600 dark:text-purple-400">
                            ${formatTimestamp(detailedData.lastActivity || null)}
                        </div>
                    </div>
                </div>
                
                <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-6">
                    <h4 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Course Progress</h4>
                    ${coursesHtml}
                </div>
                
                <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                    <h4 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Recent Activity</h4>
                    <div class="divide-y divide-gray-200 dark:divide-gray-700">
                        ${detailedData.recentActivity && detailedData.recentActivity.length > 0 
                            ? detailedData.recentActivity.map(activity => `
                                <div class="py-3 flex justify-between">
                                    <div>
                                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${activity.action}</span>
                                        <span class="text-sm text-slate-600 dark:text-slate-400"> - ${activity.course} ${activity.chapter}</span>
                                    </div>
                                    <div class="text-sm text-slate-500 dark:text-slate-500">${formatTimestamp(activity.timestamp)}</div>
                                </div>
                            `).join('')
                            : '<div class="text-center py-4 text-slate-500 dark:text-slate-400">No recent activity</div>'
                        }
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
                <button id="close-details-btn" class="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to close the modal
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('close-details-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

/**
 * Updates the recent activity table in the dashboard
 * @param {Object} activityData - The activity data from the server
 */
function updateRecentActivity(activityData) {
    if (!activityData.success || !activityData.activities || !Array.isArray(activityData.activities)) {
        console.error('Invalid activity data');
        return;
    }
    
    const { activities } = activityData;
    const tableBody = document.querySelector('.recent-activity-table-container tbody');
    
    // Clear the table
    tableBody.innerHTML = '';
    
    // If no activities, show a message
    if (activities.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                No recent activity
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    // Add activities to the table (limited to first 5)
    activities.slice(0, 5).forEach(activity => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap">${activity.username}</td>
            <td class="px-4 py-4 whitespace-nowrap">${activity.action}</td>
            <td class="px-4 py-4 whitespace-nowrap">${activity.course} ${activity.chapter}</td>
            <td class="px-4 py-4 whitespace-nowrap">${formatTimestamp(activity.timestamp)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Initializes the admin dashboard by fetching and displaying data
 */
async function initAdminDashboard() {
    // Fetch all progress data
    const progressData = await fetchAllUsersProgress();
    if (progressData.success) {
        updateOverallStats(progressData);
        populateUserProgressTable(progressData);
    } else {
        console.error('Failed to fetch progress data:', progressData.error);
    }
    
    // Fetch recent activity
    const activityData = await fetchRecentActivity();
    if (activityData.success) {
        updateRecentActivity(activityData);
    } else {
        console.error('Failed to fetch activity data:', activityData.error);
    }
    
    // Add event listeners for pagination
    document.getElementById('prev-page-btn').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('prev-page-btn').getAttribute('data-current-page') || '1');
        if (currentPage > 1) {
            populateUserProgressTable(progressData, currentPage - 1);
            document.getElementById('prev-page-btn').setAttribute('data-current-page', (currentPage - 1).toString());
            document.getElementById('next-page-btn').setAttribute('data-current-page', (currentPage - 1).toString());
        }
    });
    
    document.getElementById('next-page-btn').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('next-page-btn').getAttribute('data-current-page') || '1');
        populateUserProgressTable(progressData, currentPage + 1);
        document.getElementById('prev-page-btn').setAttribute('data-current-page', (currentPage + 1).toString());
        document.getElementById('next-page-btn').setAttribute('data-current-page', (currentPage + 1).toString());
    });
    
    // Add event listener for refresh button
    document.getElementById('refresh-progress-btn').addEventListener('click', async () => {
        const refreshedData = await fetchAllUsersProgress();
        if (refreshedData.success) {
            updateOverallStats(refreshedData);
            populateUserProgressTable(refreshedData);
        } else {
            console.error('Failed to refresh progress data:', refreshedData.error);
        }
        
        const refreshedActivity = await fetchRecentActivity();
        if (refreshedActivity.success) {
            updateRecentActivity(refreshedActivity);
        } else {
            console.error('Failed to refresh activity data:', refreshedActivity.error);
        }
    });
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminDashboard);
