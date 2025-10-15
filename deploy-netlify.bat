@echo off
echo ========================================
echo   Netlify Deployment Script
echo   Multilingual Ticket System
echo ========================================
echo.

echo Step 1: Checking if Netlify CLI is installed...
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Netlify CLI not found. Installing...
    npm install -g netlify-cli
) else (
    echo Netlify CLI is already installed!
)
echo.

echo Step 2: Building the project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b 1
)
echo Build successful!
echo.

echo Step 3: Logging in to Netlify...
call netlify login
echo.

echo Step 4: Deploying to Netlify...
echo Choose deployment option:
echo 1. Deploy to production
echo 2. Deploy preview (draft)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo Deploying to production...
    call netlify deploy --prod --dir=.next
) else (
    echo Deploying preview...
    call netlify deploy --dir=.next
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy your Netlify URL from above
echo 2. Update Supabase redirect URLs
echo 3. Add environment variables in Netlify dashboard
echo 4. Test your deployed site!
echo.
echo See DEPLOY_TO_NETLIFY_NOW.md for detailed instructions
echo.
pause