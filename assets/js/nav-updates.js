// Navigation updates for user achievements and progress
const addNavigationLinks = () => {
  const navLinks = document.querySelector('.nav-links');
  
  // Only proceed if we found the nav links container 
  if (!navLinks) return;
  
  // Check if there's already a progress link (to avoid duplicates)
  const existingProgressLink = navLinks.querySelector('a[href*="progress-dashboard"]');
  
  if (!existingProgressLink) {
    // Create progress dashboard link
    const progressLi = document.createElement('li');
    const progressLink = document.createElement('a');
    progressLink.href = '/pages/profile/progress-dashboard.html';
    progressLink.setAttribute('data-i18n', 'progress');
    progressLink.textContent = translations[currentLanguage]?.progress || 'Progress';
    progressLi.appendChild(progressLink);
    
    // Find where to insert (usually before the login/register link)
    const loginLi = navLinks.querySelector('a[href*="login"]')?.parentElement;
    if (loginLi) {
      navLinks.insertBefore(progressLi, loginLi);
    } else {
      navLinks.appendChild(progressLi);
    }
  }

  // Check if there's already an achievements link
  const existingAchievementsLink = navLinks.querySelector('a[href*="achievements"]');
  
  if (!existingAchievementsLink) {
    // Create achievements link
    const achievementsLi = document.createElement('li');
    const achievementsLink = document.createElement('a');
    achievementsLink.href = '/pages/profile/achievements.html';
    achievementsLink.setAttribute('data-i18n', 'achievements');
    achievementsLink.textContent = translations[currentLanguage]?.achievements || 'Achievements';
    achievementsLi.appendChild(achievementsLink);
    
    // Insert before login link or at the end
    const loginLi = navLinks.querySelector('a[href*="login"]')?.parentElement;
    if (loginLi) {
      navLinks.insertBefore(achievementsLi, loginLi);
    } else {
      navLinks.appendChild(achievementsLi);
    }
  }

  // Update login link text based on login status
  const loginLink = navLinks.querySelector('a[href*="login"]');
  if (loginLink) {
    const username = localStorage.getItem('tutor_username');
    if (username) {
      loginLink.textContent = translations[currentLanguage]?.logout || 'Logout';
      loginLink.href = '#';
      loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('tutor_username');
        localStorage.removeItem('tutor_password');
        window.location.href = '/index.html';
      });
    } else {
      loginLink.textContent = translations[currentLanguage]?.login || 'Login';
      loginLink.href = '/pages/auth/login.html';
    }
  }
};

// Run once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure all other scripts have loaded
  setTimeout(addNavigationLinks, 500);
});
