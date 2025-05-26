# PowerShell script to apply mobile optimizations to all course chapter pages
# Apply-MobileOptimizations.ps1

# Define course folders
$courseDirectories = @(
    "courses\english",
    "courses\german",
    "courses\arabic",
    "courses\math",
    "courses\science"
)

# Define chapters to process
$chapterLevels = @("a1", "a2", "b1", "b2", "c1", "c2")

# Create mobile-styles.css for each course chapter if it doesn't exist
foreach ($courseDir in $courseDirectories) {
    $courseName = $courseDir.Split('\')[-1]
    Write-Host "Processing $courseName course..." -ForegroundColor Cyan
    
    foreach ($level in $chapterLevels) {
        $chapterDir = "$courseDir\chapters\$level"
        
        # Skip if directory doesn't exist
        if (-not (Test-Path $chapterDir)) {
            Write-Host "  Skipping $level (directory not found)" -ForegroundColor Yellow
            continue
        }
        
        $mobileStylesPath = "$chapterDir\mobile-styles.css"
        
        # Check if mobile-styles.css already exists
        if (-not (Test-Path $mobileStylesPath)) {
            Write-Host "  Creating mobile-styles.css for $level..." -ForegroundColor Green
            
            # Define basic mobile styles template with course-specific adjustments
            $mobileStyles = @"
/* Mobile optimization styles for $courseName $level chapter pages */

/* Base mobile styles */
@media (max-width: 640px) {
    .chapter-container {
        margin: 20px auto 80px; /* Add bottom margin for mobile nav */
        padding: 15px;
        border-radius: 8px;
    }
    
    .content-section {
        padding: 15px;
        margin-bottom: 20px;
    }
    
    .lesson-title {
        font-size: 1.4rem;
    }
    
    /* Improve touch targets */
    .action-button, 
    button,
    .nav-button,
    .skill-btn,
    .check-answer-btn {
        min-height: 44px;
        width: 100%;
        padding: 14px 20px; /* Larger touch target */
        margin-bottom: 10px;
    }
    
    /* Make forms more mobile-friendly */
    .answer-input {
        padding: 14px; /* Larger touch target */
        font-size: 16px; /* Prevent iOS zoom on input focus */
    }
    
    /* Improve spacing for mobile */
    .navigation {
        flex-direction: column;
        gap: 10px;
        margin-bottom: 70px; /* Space for mobile nav bar */
    }
    
    /* Add tap highlight color for mobile */
    a, button, input[type="button"], input[type="submit"] {
        -webkit-tap-highlight-color: rgba(59, 130, 246, 0.5);
    }
    
    /* Tables need to be responsive */
    table {
        display: block;
        overflow-x: auto;
        width: 100%;
    }
    
    /* Mobile navigation */
    .mobile-nav {
        display: flex;
        justify-content: space-around;
        align-items: center;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #1f2937;
        border-top: 1px solid #374151;
        padding: 8px 0;
        z-index: 1000;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }
}
"@
            
            # Add course-specific styles
            switch ($courseName) {
                "english" {
                    # Nothing additional needed, basic styles are sufficient
                }
                "german" {
                    $mobileStyles += @"

/* German-specific mobile styles */
@media (max-width: 640px) {
    .vocab-list {
        overflow-x: auto;
    }
    
    .vocab-item {
        display: flex;
        flex-direction: column;
        padding: 10px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .vocab-german {
        font-weight: bold;
        margin-bottom: 5px;
    }
}
"@
                }
                "arabic" {
                    $mobileStyles += @"

/* Arabic-specific mobile styles */
@media (max-width: 640px) {
    .arabic-text {
        font-size: 1.2rem;
        line-height: 1.8;
        direction: rtl;
        text-align: right;
    }
    
    .vocab-arabic {
        font-weight: bold;
        margin-bottom: 5px;
        direction: rtl;
        text-align: right;
    }
}
"@
                }
                "math" {
                    $mobileStyles += @"

/* Math-specific mobile styles */
@media (max-width: 640px) {
    .math-formula {
        overflow-x: auto;
        padding: 10px;
        margin: 10px 0;
        font-size: 1rem;
    }
    
    .calculator-container {
        max-width: 100%;
        overflow-x: auto;
    }
    
    .calculator-button {
        min-width: 44px;
        min-height: 44px;
        margin: 2px;
    }
}
"@
                }
                "science" {
                    $mobileStyles += @"

/* Science-specific mobile styles */
@media (max-width: 640px) {
    .experiment-container {
        padding: 12px;
        margin-bottom: 15px;
    }
    
    .diagram-container {
        overflow-x: auto;
        max-width: 100%;
        margin: 15px 0;
    }
    
    .chemical-equation {
        overflow-x: auto;
        padding: 10px;
        white-space: nowrap;
    }
}
"@
                }
            }
            
            # Create the file
            Set-Content -Path $mobileStylesPath -Value $mobileStyles
            Write-Host "    Created mobile-styles.css for $courseName $level" -ForegroundColor Green
        } else {
            Write-Host "  mobile-styles.css already exists for $level" -ForegroundColor Blue
        }
        
        # Now process all HTML files in this chapter directory
        $htmlFiles = Get-ChildItem -Path $chapterDir -Filter "*.html"
        
        foreach ($htmlFile in $htmlFiles) {
            Write-Host "  Processing $($htmlFile.Name)..." -ForegroundColor White
            
            $content = Get-Content -Path $htmlFile.FullName -Raw
            $updated = $false
            
            # Add CSS links if not present
            if (-not ($content -match "global-mobile\.css")) {
                $content = $content -replace '<link rel="stylesheet" href="[^"]+styles\.css">', '<link rel="stylesheet" href="../../../../css/styles.css">' + "`n    " + '<link rel="stylesheet" href="../../../../css/global-mobile.css">' + "`n    " + '<link rel="stylesheet" href="mobile-styles.css">'
                $updated = $true
            }
            
            # Add theme-color meta tag if not present
            if (-not ($content -match '<meta name="theme-color"')) {
                $content = $content -replace '<meta name="viewport"[^>]+>', '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' + "`n    " + '<meta name="theme-color" content="#1f2937">'
                $updated = $true
            }
            
            # Add mobile-utils.js script if not present
            if (-not ($content -match "mobile-utils\.js")) {
                $content = $content -replace '</body>', '    <script src="../../../../js/mobile-utils.js"></script>' + "`n    " + 
                '<script>' + "`n        " + 
                'document.addEventListener("DOMContentLoaded", function() {' + "`n            " + 
                '// Apply mobile optimizations' + "`n            " + 
                'if (typeof applyMobileOptimizations === "function") {' + "`n                " + 
                'applyMobileOptimizations();' + "`n            " + 
                '}' + "`n        " + 
                '});' + "`n    " + 
                '</script>' + "`n    " + 
                '<!-- Mobile Navigation Bar -->' + "`n    " + 
                '<div class="mobile-nav hidden">' + "`n        " + 
                '<a href="../../../../index.html" class="mobile-nav-item">' + "`n            " + 
                '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">' + "`n                " + 
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />' + "`n            " + 
                '</svg>' + "`n            " + 
                '<span>Home</span>' + "`n        " + 
                '</a>' + "`n        " + 
                '<a href="../../' + $courseName + '-course.html" class="mobile-nav-item">' + "`n            " + 
                '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">' + "`n                " + 
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />' + "`n            " + 
                '</svg>' + "`n            " + 
                '<span>Course</span>' + "`n        " + 
                '</a>' + "`n        " + 
                '<button id="mobile-prev" class="mobile-nav-item">' + "`n            " + 
                '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">' + "`n                " + 
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />' + "`n            " + 
                '</svg>' + "`n            " + 
                '<span>Prev</span>' + "`n        " + 
                '</button>' + "`n        " + 
                '<button id="mobile-next" class="mobile-nav-item">' + "`n            " + 
                '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">' + "`n                " + 
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />' + "`n            " + 
                '</svg>' + "`n            " + 
                '<span>Next</span>' + "`n        " + 
                '</button>' + "`n    " + 
                '</div>' + "`n</body>"
                $updated = $true
            }
            
            # Save the file if updated
            if ($updated) {
                Set-Content -Path $htmlFile.FullName -Value $content
                Write-Host "    Updated $($htmlFile.Name) with mobile optimizations" -ForegroundColor Green
            } else {
                Write-Host "    No changes needed for $($htmlFile.Name)" -ForegroundColor Blue
            }
        }
    }
}

Write-Host "`nMobile optimization process completed!" -ForegroundColor Green
Write-Host "All course chapters have been updated with mobile-friendly styles and navigation."
