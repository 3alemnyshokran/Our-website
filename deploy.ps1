# Deployment script for the tutoring website

Write-Host "Preparing for Vercel deployment..." -ForegroundColor Cyan

# Install dependencies if any
if (Test-Path "package.json") {
  Write-Host "Installing dependencies..." -ForegroundColor Yellow
  npm install
}

# Check for Vercel CLI
try {
  $vercelVersion = vercel --version
  Write-Host "Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
  Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
  npm install -g vercel
}

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Your site with the new authentication system should now be live." -ForegroundColor Cyan
Write-Host "Remember to test the authentication flow on all pages." -ForegroundColor Yellow
