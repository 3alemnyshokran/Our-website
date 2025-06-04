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

# Add all changes to Git
Write-Host "Adding changes to Git..." -ForegroundColor Cyan
git add .

# Commit changes
$commitMessage = "Updated to start with sign-up screen and added visible privacy notice"
Write-Host "Committing with message: $commitMessage" -ForegroundColor Cyan
git commit -m $commitMessage

# Push changes to remote repository
Write-Host "Pushing changes to remote repository..." -ForegroundColor Cyan
git push

# Run deployment script
Write-Host "Running deployment script..." -ForegroundColor Cyan
& .\deploy.ps1

Write-Host "All changes have been added to Git and deployed to Vercel." -ForegroundColor Green
Write-Host "Your website is now live with username-only authentication and database system!" -ForegroundColor Cyan
