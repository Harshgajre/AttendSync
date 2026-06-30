@echo off
REM Start AttendSync Application on Windows

echo.
echo =====================================
echo   AttendSync - Startup Script
echo =====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Checking MongoDB...
REM This is a simple check, actual MongoDB status check would need mongo client

echo.
echo Starting Backend Server...
echo.
start "AttendSync Backend" cmd /k "cd backend && npm install && npm run dev"

timeout /t 3

echo Starting Frontend Server...
echo.
start "AttendSync Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo =====================================
echo   Servers Starting...
echo =====================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo IMPORTANT:
echo - Make sure MongoDB is running
echo - Check .env file is configured properly
echo - Open http://localhost:5173 in your browser
echo.
pause
