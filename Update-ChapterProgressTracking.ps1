# Update all chapter pages to include progress tracking
# This script adds progress tracking functionality to all course chapter pages

$projectRoot = "c:\Users\felix\OneDrive\Desktop\our fucking project"
$progressScriptTag = '<script src="../../../../js/progress-tracker.js" defer></script>'
$progressInitCode = @'

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Check if user is logged in
        if (localStorage.getItem('username')) {
            // Get course and chapter info from the URL
            const urlPath = window.location.pathname;
            const pathParts = urlPath.split('/');
            const course = pathParts[pathParts.indexOf('courses') + 1] || '';
            const chapterPath = pathParts[pathParts.length - 1].replace('.html', '');
            
            // Initialize time tracking
            const timeTracker = initTimeTracker(course, chapterPath);
            timeTracker.start();
            
            // Record that user started this chapter
            trackProgress(course, chapterPath, 'in-progress');
            
            // Add progress display to the page
            const progressContainer = document.createElement('div');
            progressContainer.id = 'chapter-progress-container';
            progressContainer.className = 'fixed bottom-4 right-4 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            progressContainer.innerHTML = `
                <div class="text-sm font-semibold">Progress Tracking Active</div>
                <div class="text-xs">Your progress is being saved</div>
            `;
            document.body.appendChild(progressContainer);
            
            // Add completion button at the end of the content
            const completeButton = document.createElement('button');
            completeButton.className = 'mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors';
            completeButton.textContent = 'Mark Chapter as Complete';
            completeButton.onclick = function() {
                completeChapter(course, chapterPath);
                this.disabled = true;
                this.textContent = 'Chapter Completed!';
                this.className = 'mt-8 w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold';
                
                // Update the progress display
                const progressContainer = document.getElementById('chapter-progress-container');
                if (progressContainer) {
                    progressContainer.className = 'fixed bottom-4 right-4 bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                    progressContainer.innerHTML = `
                        <div class="text-sm font-semibold">Chapter Completed!</div>
                        <div class="text-xs">Great job!</div>
                    `;
                    
                    // Make it disappear after 3 seconds
                    setTimeout(() => {
                        progressContainer.style.opacity = '0';
                        progressContainer.style.transition = 'opacity 0.5s ease-out';
                        setTimeout(() => progressContainer.remove(), 500);
                    }, 3000);
                }
            };
            
            // Add the completion button to the end of the content
            const contentSections = document.querySelectorAll('.content-section');
            if (contentSections.length > 0) {
                const lastSection = contentSections[contentSections.length - 1];
                lastSection.appendChild(completeButton);
            } else {
                // Fallback if no content sections found
                const chapterContainer = document.querySelector('.chapter-container');
                if (chapterContainer) {
                    chapterContainer.appendChild(completeButton);
                } else {
                    // Last resort - add to the end of the body
                    const container = document.createElement('div');
                    container.className = 'container mx-auto px-4 py-8 text-center';
                    container.appendChild(completeButton);
                    document.body.appendChild(container);
                }
            }
        }
    });
</script>
'@

# Get all HTML files in the courses directory structure
$courseDirectories = @("english", "german", "arabic", "math", "science")
$courseChapterFiles = @()

foreach ($courseDir in $courseDirectories) {
    $courseChapterFiles += Get-ChildItem -Path "$projectRoot\courses\$courseDir" -Recurse -Filter "*.html" | 
                         Where-Object { $_.Name -match "chapter|assessment|quiz" }
}

$updatedCount = 0
$skippedCount = 0

Write-Host "Found $($courseChapterFiles.Count) chapter files to process..."

foreach ($file in $courseChapterFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $updated = $false
    
    # Check if the progress script is already included
    if ($content -notmatch "progress-tracker\.js") {
        # Add the progress script before the closing </head> tag
        $content = $content -replace "</head>", "$progressScriptTag`n</head>"
        $updated = $true
    }
    
    # Check if the progress initialization code is already included
    if ($content -notmatch "initTimeTracker") {
        # Add the progress initialization code before the closing </body> tag
        $content = $content -replace "</body>", "$progressInitCode`n</body>"
        $updated = $true
    }
    
    if ($updated) {
        Set-Content -Path $file.FullName -Value $content
        $updatedCount++
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
    } else {
        $skippedCount++
        Write-Host "Skipped (already updated): $($file.FullName)" -ForegroundColor Yellow
    }
}

Write-Host "Progress tracking update complete."
Write-Host "Updated $updatedCount files, skipped $skippedCount files."
