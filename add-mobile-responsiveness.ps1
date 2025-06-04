# Add viewport meta tag and responsive CSS to all chapter files
$chapterFiles = Get-ChildItem -Path "c:\Users\felix\Downloads\Our-website-master-20250603T202110Z-1-001\Our-website-master\pages\courses\*\chapters\*.html" -Recurse

foreach ($file in $chapterFiles) {
    Write-Host "Processing $($file.FullName)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file already has the viewport meta tag
    if ($content -match '<meta name="viewport"') {
        Write-Host "File already has viewport meta tag."
    } else {
        # Add viewport meta tag
        $content = $content -replace '<meta charset="UTF-8">', '<meta charset="UTF-8">' + "`n    " + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        Write-Host "Added viewport meta tag."
    }
    
    # Check if the file already has the responsive CSS
    if ($content -match 'responsive\.css') {
        Write-Host "File already has responsive CSS."
    } else {
        # Add responsive CSS link after styles.css
        $content = $content -replace '<link rel="stylesheet" href="/assets/css/styles.css">', '<link rel="stylesheet" href="/assets/css/styles.css">' + "`n    " + '<link rel="stylesheet" href="/assets/css/responsive.css">'
        Write-Host "Added responsive CSS."
    }
    
    # Write the updated content back to the file
    $content | Set-Content -Path $file.FullName
    
    Write-Host "Updated $($file.Name) successfully."
}

Write-Host "All chapter files have been updated with mobile-responsive elements."
