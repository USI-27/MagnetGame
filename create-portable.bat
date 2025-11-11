@echo off
title Create Portable Magnet Force Game
color 0A

echo.
echo ========================================
echo   Create Portable Game Package
echo ========================================
echo.
echo This will create a portable folder that can be
echo copied to any Windows PC and run without installation.
echo.
pause

echo.
echo [1/5] Building the game...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo.
echo [2/5] Creating portable folder...
if exist "MagnetForce-Portable" rmdir /s /q "MagnetForce-Portable"
mkdir "MagnetForce-Portable"

echo.
echo [3/5] Copying files...
xcopy /E /I /Y "dist" "MagnetForce-Portable\dist"
xcopy /E /I /Y "node_modules" "MagnetForce-Portable\node_modules"
copy /Y "package.json" "MagnetForce-Portable\"

echo.
echo [4/5] Creating launcher...
(
echo @echo off
echo title Magnet Force Game
echo color 0A
echo.
echo echo ========================================
echo echo   Magnet Force Game
echo echo ========================================
echo echo.
echo echo Starting game server...
echo echo.
echo echo Open in browser: http://localhost:5000
echo echo.
echo echo Press Ctrl+C to stop
echo echo ========================================
echo echo.
echo.
echo start http://localhost:5000
echo node dist/index.js
) > "MagnetForce-Portable\START-GAME.bat"

echo.
echo [5/5] Creating README...
(
echo # Magnet Force Game - Portable Edition
echo.
echo ## How to Run
echo.
echo 1. Make sure Node.js is installed on the target PC
echo    Download from: https://nodejs.org
echo.
echo 2. Double-click START-GAME.bat
echo.
echo 3. Game opens at http://localhost:5000
echo.
echo ## Share with Friends
echo.
echo - Same WiFi: Share http://YOUR_IP:5000
echo - Internet: Use ngrok ^(see main README^)
echo.
echo ## Requirements
echo.
echo - Windows 10/11
echo - Node.js 18 or higher
echo.
echo Enjoy!
) > "MagnetForce-Portable\README.txt"

echo.
echo ========================================
echo   Portable Package Created!
echo ========================================
echo.
echo Location: MagnetForce-Portable\
echo.
echo You can now:
echo 1. Copy this folder to any Windows PC
echo 2. Install Node.js on that PC
echo 3. Run START-GAME.bat
echo.
echo Note: The folder is large because it includes
echo all dependencies. This is normal.
echo.
pause
