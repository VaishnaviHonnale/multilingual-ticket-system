@echo off
echo ========================================
echo   Safe Build Script
echo   Multilingual Ticket System
echo ========================================
echo.

echo Step 1: Stopping any running processes...
taskkill /F /IM node.exe >nul 2>&1
echo Waiting for processes to close...
timeout /t 3 /nobreak >nul

echo Step 2: Cleaning previous build...
if exist ".next" (
    echo Removing .next directory...
    rmdir /s /q ".next" 2>nul
    timeout /t 2 /nobreak >nul
)

echo Step 3: Cleaning cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" 2>nul
)

echo Step 4: Building project...
echo This may take a few minutes...
echo.
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Build Successful!
    echo ========================================
    echo.
    echo Your project is ready for deployment!
    echo.
    echo Next steps:
    echo 1. Deploy to Netlify using one of these methods:
    echo    - Push to GitHub and connect to Netlify
    echo    - Run: netlify deploy --prod --dir=.next
    echo    - Drag .next folder to netlify.com/drop
    echo.
    echo 2. See DEPLOY_TO_NETLIFY_NOW.md for details
    echo.
) else (
    echo.
    echo ========================================
    echo   Build Failed!
    echo ========================================
    echo.
    echo Try these fixes:
    echo 1. Run as Administrator
    echo 2. Close all editors and terminals
    echo 3. Run: fix-build-error.bat
    echo 4. Or deploy directly to Netlify (they'll build it)
    echo.
    echo See FIX_BUILD_PERMISSION_ERROR.md for help
    echo.
)

pause