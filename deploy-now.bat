@echo off
echo ========================================
echo   Deploy to Netlify - Quick Script
echo ========================================
echo.

echo Step 1: Adding all changes...
git add .

echo Step 2: Committing changes...
git commit -m "Fix Netlify build errors - Ready for deployment"

echo Step 3: Pushing to GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Successfully Pushed to GitHub!
    echo ========================================
    echo.
    echo Netlify will now automatically:
    echo 1. Detect your changes
    echo 2. Start building your site
    echo 3. Deploy when build completes
    echo.
    echo Monitor your deployment at:
    echo https://app.netlify.com
    echo.
    echo Your site will be live in 3-5 minutes!
    echo.
) else (
    echo.
    echo ========================================
    echo   Push Failed!
    echo ========================================
    echo.
    echo Make sure you have:
    echo 1. Created a GitHub repository
    echo 2. Added remote: git remote add origin YOUR_REPO_URL
    echo 3. Have internet connection
    echo.
    echo Or deploy using Netlify CLI:
    echo   netlify deploy --prod
    echo.
)

pause