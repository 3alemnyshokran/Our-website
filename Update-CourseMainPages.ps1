# Script to update all course main pages with Back to Home button and enhanced styles

# Function to add navigation bar and scripts to HTML files
function Update-CourseMainPages {
    param (
        [string]$filePath
    )
    
    Write-Host "Processing $filePath..."
    
    # Read the file content
    $content = Get-Content -Path $filePath -Raw
      # 1. Add enhanced-styles.css link if not already present
    if ($content -notmatch "enhanced-styles.css") {
        $cssLink = '<link rel="stylesheet" href="../css/enhanced-styles.css">'
        $content = $content -replace '<head>', "<head>`n    $cssLink"
    }
      # 2. Add the Back to Home navigation bar if not already present
    if ($content -notmatch "back-to-home") {
        $navbar = @"
    <nav class="fixed top-0 w-full bg-slate-800 dark:bg-slate-900 shadow-md z-10">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="../index.html" class="back-to-home">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
            </a>
            <div class="flex items-center gap-3">
                <span id="username-display" class="text-white text-sm font-medium"></span>
            </div>
        </div>
    </nav>
    
    <!-- Add margin-top to accommodate the fixed nav -->
    <div style="margin-top: 70px;"></div>
"@
        $content = $content -replace '<body([^>]*)>', "<body`$1>`n$navbar"
    }
    
    # 3. Add the username display and theme toggle JavaScript if not already present
    if ($content -notmatch "username-display") {
        $script = @"
    <script>
        // Add theme toggle functionality
        document.addEventListener("DOMContentLoaded", function() {
            // Theme toggle functionality
            const themeToggleBtn = document.getElementById("theme-toggle");
            if (themeToggleBtn) {
                themeToggleBtn.addEventListener("click", function() {
                    document.documentElement.classList.toggle("dark");
                    
                    if (document.documentElement.classList.contains("dark")) {
                        localStorage.setItem("theme", "dark");
                    } else {
                        localStorage.setItem("theme", "light");
                    }
                });
            }
            
            // Set theme based on saved preference
            if (localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            
            // Check for saved username and display it
            const savedUsername = localStorage.getItem("username");
            const usernameDisplay = document.getElementById("username-display");
            
            if (savedUsername && usernameDisplay) {
                usernameDisplay.textContent = "Logged in as: " + savedUsername;
            } else if (!savedUsername) {
                // Redirect to login if no username found
                window.location.href = "../auth/username-login.html";
            }
        });
    </script>
"@
        $content = $content -replace '</body>', "$script`n</body>"
    }
    
    # Write the updated content back to the file
    Set-Content -Path $filePath -Value $content
}

# Find all course main pages
$coursePages = @(
    "c:\Users\felix\OneDrive\Desktop\our fucking project\courses\english\english-course.html",
    "c:\Users\felix\OneDrive\Desktop\our fucking project\courses\german\german-course.html",
    "c:\Users\felix\OneDrive\Desktop\our fucking project\courses\math\math-course.html",
    "c:\Users\felix\OneDrive\Desktop\our fucking project\courses\science\science-course.html",
    "c:\Users\felix\OneDrive\Desktop\our fucking project\courses\arabic\arabic-course.html"
)

# Process each file
foreach ($file in $coursePages) {
    if (Test-Path $file) {
        Update-CourseMainPages -filePath $file
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "Course main pages updates completed successfully!" -ForegroundColor Green
