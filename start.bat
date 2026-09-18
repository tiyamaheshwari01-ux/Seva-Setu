@echo off
title SevaSetu - AI Merchant Teammate
echo ========================================================
echo        Starting SevaSetu Merchant AI Prototype
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo [1/2] Launching Backend Server on port 5000...
start "SevaSetu Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Frontend App on port 5173...
start "SevaSetu Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Opening SevaSetu in your browser...
start http://localhost:5173

echo.
echo ========================================================
echo  SevaSetu is running!
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://localhost:5000/api/health
echo.
echo  Keep the two terminal windows open while presenting.
echo ========================================================
pause
