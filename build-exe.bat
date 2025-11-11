@echo off
title Building Magnet Force Game Executable
color 0A

echo.
echo ========================================
echo   Building Standalone Executable
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Building the game...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo.
echo [3/3] Creating executable...
call npm run build:exe
if errorlevel 1 (
    echo [ERROR] Failed to create executable
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Executable created: MagnetForceGame.exe
echo.
echo To run: Double-click MagnetForceGame.exe
echo The game will start on http://localhost:5000
echo.
pause
