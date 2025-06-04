# Update All HTML Files with Enhanced API
# This script adds the network helper and enhanced API to all HTML files

Write-Host "Updating HTML files with enhanced API and network helper..." -ForegroundColor Cyan

# Counter for modified files
$fileCount = 0

# Get all HTML files
$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw

    # Check if file already has the enhanced API
    if ($content -match "enhanced-api.js") {
        Write-Host "File already updated: $($file.FullName)" -ForegroundColor Gray
        continue
    }

    # Check if file has the old API configuration
    if ($content -match "api-config.js") {
        Write-Host "Updating file: $($file.FullName)" -ForegroundColor Yellow

        # Replace API Configuration with Network Helper and Enhanced API
        $updatedContent = $content -replace '<!-- Load API Configuration -->\s*<script src=".*?api-config.js".*?></script>', '<!-- Load Network Helper -->' + "`r`n" + '    <script src="../../assets/js/network-helper.js" defer></script>' + "`r`n" + '    <!-- Load Enhanced API Manager -->' + "`r`n" + '    <script src="../../assets/js/enhanced-api.js" defer></script>'
        
        # Also remove mobile API if present
        $updatedContent = $updatedContent -replace '<!-- Load Mobile API Fallback -->\s*<script src=".*?mobile-api.js".*?></script>', ''
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $updatedContent
        
        $fileCount++
    }
}

Write-Host "Updated $fileCount HTML files with enhanced API." -ForegroundColor Green

# Create a verification file
$verificationContent = @"
# Enhanced API Implementation

This file confirms that the enhanced API implementation has been applied to the website.

## Changes Made:
- Added network-helper.js for improved connectivity detection
- Added enhanced-api.js for better API reliability and mobile support
- Updated HTML files to use the new API system
- Removed deprecated api-config.js and mobile-api.js references

## Files Updated:
- $fileCount HTML files updated with new API references

## Benefits:
- Better error handling for mobile connections
- Improved reliability with multiple API endpoints
- Automatic failover if one endpoint is unavailable
- Connection quality detection and adaptive timeouts
- Better offline handling and user feedback

## Next Steps:
- Test on various mobile devices and network conditions
- Monitor API connection success rates
- Consider implementing a service worker for offline support
"@

Set-Content -Path "ENHANCED-API-IMPLEMENTATION.md" -Value $verificationContent

Write-Host "Created verification file: ENHANCED-API-IMPLEMENTATION.md" -ForegroundColor Green
Write-Host "API enhancement update complete!" -ForegroundColor Cyan
