# Update all chapter files to include lesson section and "Understood" button
$chapterFiles = Get-ChildItem -Path "c:\Users\felix\Downloads\Our-website-master-20250603T202110Z-1-001\Our-website-master\pages\courses\english\chapters\*-chapter1.html"

foreach ($file in $chapterFiles) {
    Write-Host "Processing $($file.Name)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file has already been updated
    if ($content -match 'id="understood-btn"') {
        Write-Host "File already updated. Skipping..."
        continue
    }
    
    # Find and replace the main section
    $pattern = '(?s)(<main class="chapter-container">.*?<div class="level-badge">.*?</div>)\s*(<div class="content-section">.*?</div>)\s*(<div class="progress-container">.*?<div class="navigation-buttons">.*?</div>\s*</main>)'
    
    $replacement = '$1

        <div id="lesson-section" class="content-section">
$2
            <div style="text-align: center; margin-top: 30px;">
                <button id="understood-btn" style="background: var(--primary-color); color: white; border: none; padding: 12px 25px; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: background 0.3s ease;">I''ve Understood - Take Me to the Questions</button>
            </div>
        </div>

        <div id="questions-section" style="display: none;">
$3'
    
    $updatedContent = $content -replace $pattern, $replacement
    
    # Add the event listener for the understood button
    $scriptPattern = '(?s)(<script>)\s*(// Question data)'
    $scriptReplacement = '$1
        // Handle the "Understood" button click
        document.getElementById(''understood-btn'').addEventListener(''click'', function() {
            document.getElementById(''lesson-section'').style.display = ''none'';
            document.getElementById(''questions-section'').style.display = ''block'';
            // Scroll to the top of the questions section
            window.scrollTo(0, 0);
        });
        
        $2'
    
    $updatedContent = $updatedContent -replace $scriptPattern, $scriptReplacement
    
    # Write the updated content back to the file
    $updatedContent | Set-Content -Path $file.FullName
    
    Write-Host "Updated $($file.Name) successfully."
}

Write-Host "All chapter files have been updated."
