# Script to add authentication protection to all HTML files

Write-Host "Adding authentication protection to all course pages..." -ForegroundColor Cyan

# Find all HTML files in the pages directory (excluding auth pages)
$htmlFiles = Get-ChildItem -Path "pages" -Filter "*.html" -Recurse | 
    Where-Object { $_.FullName -notmatch "pages[\\/]auth" }

# Counter for modified files
$modified = 0

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)"
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file already includes auth-protection.js
    if ($content -match "auth-protection\.js") {
        Write-Host "  Already protected, skipping." -ForegroundColor Yellow
        continue
    }
    
    # Get the relative path to the root
    $relativePath = ""
    $depth = ($file.FullName.Split([IO.Path]::DirectorySeparatorChar) | 
        Where-Object { $_ -ne "" }).Count - ($pwd.Path.Split([IO.Path]::DirectorySeparatorChar) | 
        Where-Object { $_ -ne "" }).Count - 1
    
    for ($i = 0; $i -lt $depth; $i++) {
        $relativePath += "../"
    }
    
    # Add auth.js reference in the head if not already there
    if ($content -notmatch "auth\.js") {
        $content = $content -replace "(<head>.*?)", "`$1`n    <!-- Add auth.js -->`n    <script src=`"${relativePath}assets/js/auth.js`"></script>"
    }
    
    # Add auth-protection.js at the end of body
    $content = $content -replace "(<\/body>)", "    <!-- Add auth-protection.js -->`n    <script src=`"${relativePath}assets/js/auth-protection.js`"></script>`n`$1"
    
    # Write modified content back to file
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "  Added authentication protection." -ForegroundColor Green
    $modified++
}

Write-Host "Done! Protected $modified HTML files." -ForegroundColor Cyan
