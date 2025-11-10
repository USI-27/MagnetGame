@echo off
echo.
echo ========================================
echo   Push Magnet Force Game to GitHub
echo ========================================
echo.

REM Initialize git if needed
if not exist ".git" (
    echo [1/5] Initializing Git repository...
    git init
    echo.
) else (
    echo [1/5] Git already initialized
    echo.
)

REM Add all files
echo [2/5] Adding files to Git...
git add .
echo.

REM Commit
echo [3/5] Creating commit...
git commit -m "Initial commit: Magnet Force multiplayer game"
echo.

REM Ask for GitHub repo URL
echo [4/5] Enter your GitHub repository URL:
echo Example: https://github.com/yourusername/magnet-force-game.git
echo.
set /p REPO_URL="Repository URL: "
echo.

REM Add remote and push
echo [5/5] Pushing to GitHub...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   Successfully pushed to GitHub!
echo ========================================
echo.
echo View your repo at: %REPO_URL%
echo.
pause
