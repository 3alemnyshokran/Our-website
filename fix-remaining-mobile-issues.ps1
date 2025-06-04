# Fix remaining mobile responsiveness issues in HTML files
Write-Host "== Mobile Responsiveness Fix Script =="
Write-Host "Updating remaining files with viewport meta tags and responsive CSS links..."

# Get list of course HTML files
$courseFiles = @(
    "pages\courses\arabic\arabic-course.html",
    "pages\courses\arabic\chapters\a1\a1-chapter1.html",
    "pages\courses\english\chapters\a1-chapter1.html",
    "pages\courses\english\chapters\b1-chapter1.html",
    "pages\courses\english\chapters\b2-chapter1.html",
    "pages\courses\english\chapters\c2-chapter1.html",
    "pages\courses\german\german-course.html",
    "pages\courses\german\chapters\a1\a1-chapter1.html",
    "pages\courses\science\science-course.html"
)

# Process each file
foreach ($relativeFilePath in $courseFiles) {
    $filePath = Join-Path -Path "c:\Users\felix\Downloads\Our-website-master-20250603T202110Z-1-001\Our-website-master" -ChildPath $relativeFilePath
    Write-Host "Processing $filePath..."
    
    if (Test-Path $filePath) {
        # Read the file content
        $content = Get-Content -Path $filePath -Raw
        $modified = $false
        
        # Check if the file already has the viewport meta tag
        if (-not ($content -match '<meta name="viewport"')) {
            # Add viewport meta tag
            $content = $content -replace '<meta charset="UTF-8">', '<meta charset="UTF-8">' + "`n    " + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            $modified = $true
            Write-Host "  - Added viewport meta tag"
        } else {
            Write-Host "  - Viewport meta tag already exists"
        }
        
        # Calculate relative path to css based on file path
        $depth = ($filePath.Split("\") | Where-Object { $_ -ne "" }).Count - ($filePath.Split("\") | Where-Object { $_ -eq "Our-website-master" }).Count
        $pathToRoot = "../" * ($depth - 1)
        if ($depth -eq 1) {
            $pathToRoot = ""
        }
        
        $cssPath = $pathToRoot + "assets/css/responsive.css"
        
        # Check if the file already has the responsive CSS
        if (-not ($content -match 'responsive\.css')) {
            # Add responsive CSS link after styles.css
            if ($content -match '<link rel="stylesheet" href="[^"]*styles.css">') {
                $content = $content -replace '(<link rel="stylesheet" href="[^"]*styles.css">)', "`$1`n    <link rel=""stylesheet"" href=""$cssPath"">"
                $modified = $true
                Write-Host "  - Added responsive CSS link with path: $cssPath"
            } else {
                Write-Host "  - Could not find styles.css link, trying alternative approach"
                
                # Try to add after the title tag
                if ($content -match '</title>') {
                    $content = $content -replace '</title>', '</title>' + "`n    " + "<link rel=""stylesheet"" href=""$cssPath"">"
                    $modified = $true
                    Write-Host "  - Added responsive CSS link after title tag"
                } else {
                    Write-Host "  - Could not find appropriate insertion point for responsive CSS"
                }
            }
        } else {
            Write-Host "  - Responsive CSS link already exists"
        }
        
        # Write changes back to file if modified
        if ($modified) {
            $content | Set-Content -Path $filePath
            Write-Host "  - File updated successfully"
        } else {
            Write-Host "  - No changes needed"
        }
    } else {
        Write-Host "  - File not found: $filePath"
    }
}

Write-Host "Mobile responsiveness update complete."
Write-Host "Run the verification script to confirm all files have been updated."
