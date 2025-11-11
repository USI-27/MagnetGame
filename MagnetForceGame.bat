@echo off
title Magnet Force Game
color 0A

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo.
    echo ========================================
    echo   First Time Setup
    echo ========================================
    echo.
    echo [1/2] Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    
    echo.
    echo [2/2] Building the game...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Build failed
        pause
        exit /b 1
    )
)

cls
echo.
echo ========================================
echo   Magnet Force Game
echo ========================================
echo.
echo Starting game server...
echo.
echo The game will open in your browser at:
echo   http://localhost:5000
echo.
echo To play with friends:
echo   1. Share your local IP: http://YOUR_IP:5000
echo   2. Or use ngrok for internet access
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Start the game
start http://localhost:5000
npm run dev
