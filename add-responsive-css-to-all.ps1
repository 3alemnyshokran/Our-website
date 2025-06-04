# Add responsive CSS to all HTML files that don't have it yet
$htmlFiles = Get-ChildItem -Path "c:\Users\felix\Downloads\Our-website-master-20250603T202110Z-1-001\Our-website-master" -Include "*.html" -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file already has the responsive CSS
    if ($content -match 'responsive\.css') {
        Write-Host "File already has responsive CSS."
    } else {
        # Determine the relative path to the CSS file based on the file's location
        $depth = ($file.FullName.Split("\") | Where-Object { $_ -ne "" }).Count - ($file.FullName.Split("\") | Where-Object { $_ -eq "Our-website-master" }).Count
        $relativePath = "../" * ($depth - 1)
        if ($depth -eq 1) {
            $relativePath = ""
        }
        
        $cssPath = $relativePath + "assets/css/responsive.css"
        
        # Add responsive CSS link after styles.css
        if ($content -match '<link rel="stylesheet" href="[^"]*styles.css">') {
            $content = $content -replace '(<link rel="stylesheet" href="[^"]*styles.css">)', "`$1`n    <link rel=""stylesheet"" href=""$cssPath"">"
            Write-Host "Added responsive CSS with path: $cssPath"
            
            # Write the updated content back to the file
            $content | Set-Content -Path $file.FullName
            
            Write-Host "Updated $($file.Name) successfully."
        } else {
            Write-Host "Could not find styles.css link in $($file.Name), skipping."
        }
    }
}

Write-Host "All HTML files have been updated with mobile-responsive CSS where applicable."
