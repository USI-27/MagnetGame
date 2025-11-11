@echo off
title Server Status Check
color 0A

echo.
echo ========================================
echo   Magnet Force Game - Server Status
echo ========================================
echo.

echo [1] Checking if server is running on port 5000...
echo.

powershell -Command "if (Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue) { Write-Host '[OK] Server is running on port 5000' -ForegroundColor Green } else { Write-Host '[ERROR] Server is NOT running!' -ForegroundColor Red; Write-Host ''; Write-Host 'Start the server with: npm run dev' -ForegroundColor Yellow }"

echo.
echo [2] Your local URL:
echo    http://localhost:5000
echo.

echo [3] Your network URLs:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    echo    http://%%a:5000
)

echo.
echo ========================================
echo.
echo To start the server: npm run dev
echo To use ngrok: .\ngrok http 5000
echo.
pause
