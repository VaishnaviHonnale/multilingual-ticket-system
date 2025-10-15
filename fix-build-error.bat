@echo off
echo ========================================
echo   Fixing Build Permission Error
echo ========================================
echo.

echo Step 1: Closing any running processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Step 2: Removing .next directory...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    timeout /t 2 /nobreak >nul
)

echo Step 3: Cleaning cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" 2>nul
)

echo Step 4: Clearing npm cache...
call npm cache clean --force

echo.
echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo Now try building again:
echo   npm run build
echo.
pause