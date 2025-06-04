# Final deployment script - git add, commit, and deploy to Vercel

# Check for Git
$gitInstalled = $null
try {
    $gitInstalled = git --version
} catch {
    Write-Host "Git not found. Please install Git before running this script." -ForegroundColor Red
    exit 1
}

Write-Host "Git found: $gitInstalled" -ForegroundColor Green

# Check for network helper file
$networkHelperFile = "./assets/js/network-helper.js"
if (-not (Test-Path $networkHelperFile)) {
    Write-Host "Warning: Network helper file not found. Mobile login fix may not be complete." -ForegroundColor Red
    $proceed = Read-Host "Do you want to proceed anyway? (y/n)"
    if ($proceed -ne "y") {
        Write-Host "Deployment aborted." -ForegroundColor Red
        exit 1
    }
}

# Check login page for network status code
$loginFile = "./pages/auth/login.html"
$loginContent = Get-Content $loginFile -Raw
if (-not $loginContent.Contains("network-status")) {
    Write-Host "Warning: Login page does not contain network status indicator. Mobile login fix may not be complete." -ForegroundColor Red
    $proceed = Read-Host "Do you want to proceed anyway? (y/n)"
    if ($proceed -ne "y") {
        Write-Host "Deployment aborted." -ForegroundColor Red
        exit 1
    }
}

# Add all changes to Git
Write-Host "Adding changes to Git..." -ForegroundColor Cyan
git add .

# Commit changes
$commitMessage = "Fixed mobile login network issues with enhanced error handling and connectivity detection"
Write-Host "Committing with message: $commitMessage" -ForegroundColor Cyan
git commit -m $commitMessage

# Push changes to remote repository
Write-Host "Pushing changes to remote repository..." -ForegroundColor Cyan
git push

# Run deployment script
Write-Host "Running deployment script..." -ForegroundColor Cyan
& .\deploy.ps1

Write-Host "All changes have been added to Git and deployed to Vercel." -ForegroundColor Green
Write-Host "Your website is now live with improved mobile network handling and login functionality!" -ForegroundColor Cyan
Write-Host "Please test the mobile login functionality on various devices and connection types." -ForegroundColor Yellow
