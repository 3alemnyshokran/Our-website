#!/bin/bash

# A script to update all chapter pages with the Back to Home button and enhanced styles

# Find all HTML files in the courses directory
find ./courses -name "*.html" | while read file; do
    echo "Processing $file..."
    
    # 1. Add enhanced-styles.css link
    sed -i 's|<link rel="stylesheet" href=".*css/styles.css">|<link rel="stylesheet" href="../../../../css/styles.css">\n    <link rel="stylesheet" href="../../../../css/enhanced-styles.css">|' "$file"
    
    # 2. Add the Back to Home navigation bar
    NAVBAR='    <nav class="fixed top-0 w-full bg-slate-800 dark:bg-slate-900 shadow-md z-10">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="../../../../index.html" class="back-to-home">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
            </a>
            <div class="flex items-center gap-3">
                <button id="theme-toggle" class="theme-btn bg-white dark:bg-slate-800 text-blue-600 dark:text-yellow-400 px-3 py-2 rounded-lg shadow hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle Theme">
                    <span class="light-icon">☀️</span> <!-- Sun icon for light mode -->
                    <span class="dark-icon">🌙</span> <!-- Moon icon for dark mode -->
                </button>
                <span id="username-display" class="text-white text-sm font-medium"></span>
            </div>
        </div>
    </nav>
    
    <!-- Add margin-top to accommodate the fixed nav -->
    <div style="margin-top: 70px;"></div>'
    
    # Insert navbar after the opening <body> tag
    sed -i "/<body/a\\
$NAVBAR" "$file"
    
    # 3. Add the username display and theme toggle JavaScript
    SCRIPT='    <script>
        // Add theme toggle functionality
        document.addEventListener("DOMContentLoaded", function() {
            // Theme toggle functionality
            const themeToggleBtn = document.getElementById("theme-toggle");
            themeToggleBtn.addEventListener("click", function() {
                document.documentElement.classList.toggle("dark");
                
                if (document.documentElement.classList.contains("dark")) {
                    localStorage.setItem("theme", "dark");
                } else {
                    localStorage.setItem("theme", "light");
                }
            });
            
            // Set theme based on saved preference
            if (localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            
            // Check for saved username and display it
            const savedUsername = localStorage.getItem("username");
            const usernameDisplay = document.getElementById("username-display");
            
            if (savedUsername) {
                usernameDisplay.textContent = `Logged in as: ${savedUsername}`;
            } else {
                // Redirect to login if no username found
                window.location.href = "../../../../auth/username-login.html";
            }
        });
    </script>'
    
    # Insert script before the closing </body> tag
    sed -i "/<\/body>/i\\
$SCRIPT" "$file"
    
done

echo "Updates completed successfully!"
