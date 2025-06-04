/**
 * Progress Tracking Module
 * 
 * This module handles tracking and synchronizing user progress with the server.
 * It interfaces with the auth.js module to get the current user.
 */

// Track user progress for the current course
async function trackCourseProgress(courseId, chapterId, progress, completed = false) {
    if (!isAuthenticated()) return;
    
    const userId = getCurrentUserId();
    const timeSpent = getSessionTime();
    
    try {
        const response = await fetch(`${API_BASE_URL}/progress/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                course: courseId,
                chapter: chapterId,
                progress,
                completed,
                timeSpent
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update UI if needed
            updateProgressUI(data.courseProgress, data.completedChapters);
        }
        
        return data;
    } catch (error) {
        console.error('Error tracking progress:', error);
        return null;
    }
}

// Get course progress
async function getCourseProgress(courseId) {
    if (!isAuthenticated()) return null;
    
    const userId = getCurrentUserId();
    
    try {
        const response = await fetch(`${API_BASE_URL}/progress/course/${userId}/${courseId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            return data.progress;
        }
        return null;
    } catch (error) {
        console.error('Error fetching course progress:', error);
        return null;
    }
}

// Track quiz completion
async function trackQuizCompletion(courseId, chapterId, quizId, score, correctAnswers, totalQuestions) {
    if (!isAuthenticated()) return;
    
    const userId = getCurrentUserId();
    
    try {
        const response = await fetch(`${API_BASE_URL}/quiz/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                course: courseId,
                chapter: chapterId,
                quizId,
                score,
                correctAnswers,
                totalQuestions
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error saving quiz results:', error);
        return false;
    }
}

// Track session time
let sessionStartTime = Date.now();

function getSessionTime() {
    const now = Date.now();
    const sessionTime = Math.floor((now - sessionStartTime) / 1000); // Time in seconds
    sessionStartTime = now; // Reset start time
    return sessionTime;
}

// Reset session timer
function resetSessionTimer() {
    sessionStartTime = Date.now();
}

// Update progress UI elements if they exist
function updateProgressUI(progress, completedChapters) {
    // Update progress bar if it exists
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
    }
    
    // Update completed chapters counter if it exists
    const chaptersCounter = document.querySelector('.completed-chapters');
    if (chaptersCounter) {
        chaptersCounter.textContent = completedChapters;
    }
}

// Initialize progress tracking
document.addEventListener('DOMContentLoaded', function() {
    // Reset session timer
    resetSessionTimer();
    
    // Track page exit
    window.addEventListener('beforeunload', function() {
        // Save progress before leaving
        const courseId = document.body.getAttribute('data-course-id');
        const chapterId = document.body.getAttribute('data-chapter-id');
        
        if (courseId && chapterId) {
            // Use sendBeacon for more reliable tracking on page exit
            const data = JSON.stringify({
                userId: getCurrentUserId(),
                course: courseId,
                chapter: chapterId,
                progress: getCurrentProgress(),
                completed: isChapterCompleted(),
                timeSpent: getSessionTime()
            });
            
            navigator.sendBeacon(`${API_BASE_URL}/progress/save`, data);
        }
    });
    
    // Helper functions to get current progress
    function getCurrentProgress() {
        // Implement based on your UI
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            return parseFloat(progressBar.style.width) / 100;
        }
        return 0;
    }
    
    function isChapterCompleted() {
        // Implement based on your UI
        const completedFlag = document.querySelector('.chapter-completed');
        return completedFlag ? completedFlag.value === 'true' : false;
    }
});// Track quiz completionasync function trackQuizCompletion(courseId, chapterId, quizId, score, correctAnswers, totalQuestions) {    if (!isAuthenticated()) return;        const userId = getCurrentUserId();        try {        const response = await fetch(`${API_BASE_URL}/quiz/save`, {            method: 'POST',            headers: {                'Content-Type': 'application/json'            },            body: JSON.stringify({                userId,                course: courseId,                chapter: chapterId,                quizId,                score,                correctAnswers,                totalQuestions            })        });                return response.ok;    } catch (error) {        console.error('Error saving quiz results:', error);        return false;    }}// Track session timelet sessionStartTime = Date.now();function getSessionTime() {    const now = Date.now();    const sessionTime = Math.floor((now - sessionStartTime) / 1000); // Time in seconds    sessionStartTime = now; // Reset start time    return sessionTime;}// Reset session timerfunction resetSessionTimer() {    sessionStartTime = Date.now();}// Update progress UI elements if they existfunction updateProgressUI(progress, completedChapters) {    // Update progress bar if it exists    const progressBar = document.querySelector('.progress-fill');    if (progressBar) {        progressBar.style.width = `${progress * 100}%`;    }        // Update completed chapters counter if it exists    const chaptersCounter = document.querySelector('.completed-chapters');    if (chaptersCounter) {        chaptersCounter.textContent = completedChapters;    }}// Initialize progress trackingdocument.addEventListener('DOMContentLoaded', function() {    // Reset session timer    resetSessionTimer();        // Track page exit    window.addEventListener('beforeunload', function() {        // Save progress before leaving        const courseId = document.body.getAttribute('data-course-id');        const chapterId = document.body.getAttribute('data-chapter-id');                if (courseId && chapterId) {            // Use sendBeacon for more reliable tracking on page exit            const data = JSON.stringify({                userId: getCurrentUserId(),                course: courseId,                chapter: chapterId,                progress: getCurrentProgress(),                completed: isChapterCompleted(),                timeSpent: getSessionTime()            });                        navigator.sendBeacon(`${API_BASE_URL}/progress/save`, data);        }    });        // Helper functions to get current progress    function getCurrentProgress() {        // Implement based on your UI        const progressBar = document.querySelector('.progress-fill');        if (progressBar) {            return parseFloat(progressBar.style.width) / 100;        }        return 0;    }        function isChapterCompleted() {        // Implement based on your UI        const completedFlag = document.querySelector('.chapter-completed');        return completedFlag ? completedFlag.value === 'true' : false;    }});