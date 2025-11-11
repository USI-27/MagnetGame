@echo off
title Deploy to Cloud
color 0A

echo.
echo ========================================
echo   Deploy Magnet Force Game to Cloud
echo ========================================
echo.

echo [1/2] Pushing to GitHub...
echo.

git add .
git commit -m "Deploy to cloud"
git push

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to push to GitHub
    echo.
    echo Make sure you have:
    echo 1. Created a GitHub repository
    echo 2. Added it as remote: git remote add origin YOUR_URL
    echo 3. Have internet connection
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   GitHub Push Complete!
echo ========================================
echo.

echo [2/2] Now deploy on a platform:
echo.
echo Choose one (easiest to hardest):
echo.
echo 1. Railway.app (RECOMMENDED - Easiest!)
echo    https://railway.app
echo    - Sign up with GitHub
echo    - Click "New Project" -^> "Deploy from GitHub"
echo    - Select your repo
echo    - Done! Auto-deploys
echo.
echo 2. Vercel (Fast!)
echo    https://vercel.com
echo    - Sign up with GitHub
echo    - Click "Add New..." -^> "Project"
echo    - Import your repo
echo    - Deploy!
echo.
echo 3. Render.com (Free Forever)
echo    https://render.com
echo    - Sign up with GitHub
echo    - Click "New +" -^> "Web Service"
echo    - Select repo
echo    - Build: npm install ^&^& npm run build
echo    - Start: npm start
echo    - Add env var: NPM_CONFIG_PRODUCTION = false
echo    - Deploy!
echo.
echo ========================================
echo.
echo Your code is on GitHub!
echo Now go to one of the platforms above to deploy.
echo.
echo After deployment, you'll get a URL like:
echo https://magnet-force-game.railway.app
echo.
echo Share that URL with anyone! 🌍
echo.
pause
