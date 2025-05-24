// Admin functionality script for 3alemny Shokran platform
// This script handles admin login detection and unlocking content

document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (adminLoggedIn) {
        // Add admin indicator to the header
        const header = document.querySelector('header');
        if (header) {
            const adminBadge = document.createElement('div');
            adminBadge.id = 'adminBadge';
            adminBadge.textContent = 'Admin Mode';
            adminBadge.className = 'bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold';
            
            // Add the badge to the header if it doesn't already exist
            if (!document.getElementById('adminBadge')) {
                const buttonsDiv = header.querySelector('.flex.items-center.gap-4');
                if (buttonsDiv) {
                    header.insertBefore(adminBadge, buttonsDiv);
                } else {
                    header.appendChild(adminBadge);
                }
            }
        }
        
        // Unlock all content by setting progress to 100%
        // English course progress
        localStorage.setItem('a1_chapter1_progress', 100);
        localStorage.setItem('a1_chapter2_progress', 100);
        localStorage.setItem('a1_chapter3_progress', 100);
        localStorage.setItem('a1_chapter4_progress', 100);
        localStorage.setItem('a2_chapter1_progress', 100);
        localStorage.setItem('a2_chapter2_progress', 100);
        localStorage.setItem('b1_chapter1_progress', 100);
        localStorage.setItem('b1_chapter2_progress', 100);
        localStorage.setItem('b1_ch3_unlocked', 'true');
        localStorage.setItem('b1_ch2_assessment_completed', 'true');
        
        // German course progress
        localStorage.setItem('german_a1_chapter1_progress', 100);
        localStorage.setItem('german_a2_chapter1_progress', 100);
        
        // Arabic course progress
        localStorage.setItem('arabic_a1_chapter1_progress', 100);
        localStorage.setItem('arabic_a2_chapter1_progress', 100);
        
        // Math course progress
        localStorage.setItem('math_a1_chapter1_progress', 100);
        localStorage.setItem('math_a2_chapter1_progress', 100);
        
        // Science course progress
        localStorage.setItem('science_a1_chapter1_progress', 100);
        localStorage.setItem('science_a2_chapter1_progress', 100);
        
        // Update progress bars if they exist on the page
        const progressBars = document.querySelectorAll('[id$="progressBar"]');
        progressBars.forEach(progressBar => {
            if (progressBar) progressBar.style.width = '100%';
        });
        
        // Update progress text if they exist
        const progressTexts = document.querySelectorAll('[id$="Progress"], [id$="Percentage"]');
        progressTexts.forEach(progressText => {
            if (progressText) progressText.textContent = '100%';
        });
        
        // Remove locks from any locked elements
        document.querySelectorAll('.locked').forEach(element => {
            element.classList.remove('locked');
        });
        
        // If this is an assessment page, auto-complete it
        if (window.location.href.includes('assessment')) {
            const resultsContainer = document.getElementById('resultsContainer');
            const assessmentContainer = document.getElementById('assessmentContainer');
            
            if (resultsContainer && assessmentContainer) {
                assessmentContainer.style.display = 'none';
                resultsContainer.classList.remove('hidden');
                
                const scoreResult = document.getElementById('scoreResult');
                const percentageResult = document.getElementById('percentageResult');
                const passFailMessage = document.getElementById('passFailMessage');
                
                if (scoreResult) scoreResult.textContent = '20/20';
                if (percentageResult) percentageResult.textContent = '100%';
                if (passFailMessage) {
                    passFailMessage.textContent = 'Congratulations! You passed the assessment!';
                    passFailMessage.className = 'text-xl mb-8 font-medium text-green-600 dark:text-green-400';
                }
            }
        }
    }
});
