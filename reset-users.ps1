# Reset users script for PowerShell
Write-Host "Resetting all users and user data..." -ForegroundColor Yellow

Set-Location -Path "backend"
node reset-users.js

Write-Host "User reset completed." -ForegroundColor Green
Set-Location -Path ".."
