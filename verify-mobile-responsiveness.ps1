# Verify mobile responsiveness across all HTML files
$htmlFiles = Get-ChildItem -Path "c:\Users\felix\Downloads\Our-website-master-20250603T202110Z-1-001\Our-website-master" -Include "*.html" -Recurse

$missingViewport = @()
$missingResponsiveCSS = @()
$fileCount = 0

foreach ($file in $htmlFiles) {
    $fileCount++
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check for viewport meta tag
    if (-not ($content -match '<meta name="viewport"')) {
        $missingViewport += $file.FullName
    }
    
    # Check for responsive CSS
    if (-not ($content -match 'responsive\.css')) {
        $missingResponsiveCSS += $file.FullName
    }
}

Write-Host ""
Write-Host "== Mobile Responsiveness Verification Report =="
Write-Host ""
Write-Host "Files missing viewport meta tag ($($missingViewport.Count)):"
if ($missingViewport.Count -eq 0) {
    Write-Host "  None - All files have viewport meta tags! ✓"
} else {
    foreach ($file in $missingViewport) {
        Write-Host "  - $file"
    }
}

Write-Host ""
Write-Host "Files missing responsive CSS link ($($missingResponsiveCSS.Count)):"
if ($missingResponsiveCSS.Count -eq 0) {
    Write-Host "  None - All files have responsive CSS links! ✓"
} else {
    foreach ($file in $missingResponsiveCSS) {
        Write-Host "  - $file"
    }
}

Write-Host ""
Write-Host "Total HTML files checked: $fileCount"
Write-Host "Mobile-ready files: $($fileCount - ($missingViewport.Count + $missingResponsiveCSS.Count))"
