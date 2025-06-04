# Add API configuration script to all HTML files
Write-Host "== API Configuration Update Script =="
Write-Host "Adding API configuration to HTML files..."

# Get list of HTML files
$htmlFiles = Get-ChildItem -Path "c:\Users\felix\Downloads\Our-website-master-20250603T202110Z-1-001\Our-website-master" -Include "*.html" -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Skip if file already has api-config.js
    if ($content -match 'api-config\.js') {
        Write-Host "  - File already has API config, skipping."
        continue
    }
    
    # Calculate path to root based on file location
    $relativePath = [regex]::Match($file.FullName, '.*?Our-website-master\\(.*)').Groups[1].Value
    $depth = ($relativePath.Split("\") | Where-Object { $_ -ne "" }).Count
    $pathToRoot = "../" * $depth
    
    # For files in the root folder
    if ($depth -eq 0) {
        $pathToRoot = ""
    }
    
    $apiConfigPath = $pathToRoot + "assets/js/api-config.js"
    
    # Define the pattern to match - look for auth.js
    $authJsPattern = '<script src="[^"]*auth\.js"[^>]*><\/script>'
    
    if ($content -match $authJsPattern) {
        # Add API config before auth.js
        $newContent = $content -replace "($authJsPattern)", "<!-- Load API Configuration -->`n    <script src=""$apiConfigPath"" defer></script>`n    `$1"
        
        # Write the updated content back to the file
        $newContent | Set-Content -Path $file.FullName
        Write-Host "  - Added API config script before auth.js"
    } else {
        # If auth.js is not found, look for other script tags
        $scriptPattern = '<script src="[^"]*\.js"[^>]*><\/script>'
        
        if ($content -match $scriptPattern) {
            # Add API config before the first script
            $newContent = $content -replace "($scriptPattern)", "<!-- Load API Configuration -->`n    <script src=""$apiConfigPath"" defer></script>`n    `$1"
            
            # Write the updated content back to the file
            $newContent | Set-Content -Path $file.FullName
            Write-Host "  - Added API config script before first script tag"
        } else {
            Write-Host "  - No suitable script tag found to insert API config"
        }
    }
}

Write-Host "API configuration update complete."
