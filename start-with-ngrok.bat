@echo off
title Magnet Force Game - ngrok Setup
color 0A

echo.
echo ========================================
echo   Magnet Force Game - ngrok Setup
echo ========================================
echo.

REM Check if ngrok exists
if not exist "ngrok.exe" (
    echo [ERROR] ngrok.exe not found!
    echo.
    echo Please download ngrok:
    echo 1. Go to: https://ngrok.com/download
    echo 2. Download for Windows
    echo 3. Extract ngrok.exe to this folder
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking if game server is running...
echo.
echo IMPORTANT: Make sure you have started the game server first!
echo Run this command in another terminal: npm run dev
echo.
echo Press any key when the server is running...
pause >nul

echo.
echo [2/3] Starting ngrok tunnel...
echo.
echo This will create a public URL for your game.
echo.

REM Start ngrok
ngrok http 5000

echo.
echo [3/3] ngrok stopped.
echo.
pause
