// main.js - Core functionality for the educational platform
// Set light theme only
document.body.setAttribute('data-theme', 'light');

// Initialize UI components after authentication
function initializeUI() {
    // Set username if element exists
    const usernameElement = document.getElementById('welcomeUser');
    if (usernameElement) {
        usernameElement.textContent = getCurrentUsername() || 'Guest';
    }
}

// Course rendering function
function renderCourses(coursesData) {
    const container = document.getElementById('courseContainer');
    if (!container || !coursesData) return;
    
    let html = '<h2>Available Courses</h2><div class="course-grid">';
    
    coursesData.forEach(course => {
        html += `
            <div class="course-card">
                <div class="course-icon"><i class="fas ${course.icon}"></i></div>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
                    </div>
                    <span>${course.progress || 0}% Complete</span>
                </div>
                <a href="${course.url}" class="btn">Continue Learning</a>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Quiz/Exercise System
function checkAnswer(exerciseId, correctAnswer) {
    const userAnswer = document.querySelector(`#${exerciseId}`).value.trim().toLowerCase();
    const feedbackElement = document.querySelector(`#${exerciseId}-feedback`);
    const stepByStepElement = document.querySelector(`#${exerciseId}-steps`);

    if (userAnswer === correctAnswer.toLowerCase()) {
        feedbackElement.className = 'feedback correct';
        feedbackElement.textContent = 'Correct! Well done!';
    } else {
        feedbackElement.className = 'feedback incorrect';
        feedbackElement.textContent = 'Not quite right. Try again!';
        if (stepByStepElement) {
            stepByStepElement.style.display = 'block';
        }
    }
}

// Backend API integration
const BACKEND_URL = 'http://localhost:3001';

async function saveUserProgress(analytics) {
    const username = getCurrentUsername();
    if (!username) return;
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/progress/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: getCurrentUserId(),
                ...analytics
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

// Update progress indicators
function updateProgressIndicators() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const courseId = bar.getAttribute('data-course-id');
        if (courseId) {
            getUserProgress(courseId).then(progress => {
                if (progress) {
                    bar.style.width = `${progress}%`;
                    bar.parentElement.nextElementSibling.textContent = `${progress}% Complete`;
                }
            });
        }
    });
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Skip for auth pages
    if (window.location.pathname.includes('/auth/')) return;
    
    // Authentication Check handled by auth-protection.js
    if (isAuthenticated()) {
        updateProgressIndicators();
    }
});