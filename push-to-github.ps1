# Push to GitHub Script
# Run this after creating your GitHub repository

Write-Host "🚀 Pushing Magnet Force Game to GitHub..." -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Add all files
Write-Host ""
Write-Host "📝 Adding files to Git..." -ForegroundColor Yellow
git add .

# Commit
Write-Host ""
Write-Host "💾 Creating commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Magnet Force multiplayer game"

# Ask for GitHub repo URL
Write-Host ""
Write-Host "🔗 Enter your GitHub repository URL:" -ForegroundColor Cyan
Write-Host "   Example: https://github.com/yourusername/magnet-force-game.git" -ForegroundColor Gray
$repoUrl = Read-Host "Repository URL"

# Add remote
Write-Host ""
Write-Host "🔗 Adding remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $repoUrl

# Push to GitHub
Write-Host ""
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "🌐 View your repo at: $repoUrl" -ForegroundColor Cyan
