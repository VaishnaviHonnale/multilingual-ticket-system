@echo off
echo ========================================
echo   Push to GitHub - Deploy to Netlify
echo ========================================
echo.

echo Pushing changes to GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Successfully Pushed!
    echo ========================================
    echo.
    echo Netlify is now building your site...
    echo.
    echo Monitor your deployment:
    echo https://app.netlify.com
    echo.
    echo Your site will be live in 3-5 minutes!
    echo.
    echo What happens next:
    echo 1. Netlify detects your push
    echo 2. Builds your site (all errors fixed!)
    echo 3. Deploys to production
    echo 4. Gives you a live URL
    echo.
    echo After deployment:
    echo 1. Add environment variables in Netlify
    echo 2. Update Supabase redirect URLs
    echo 3. Test your live site
    echo.
) else (
    echo.
    echo ========================================
    echo   Push Failed!
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. No remote repository set
    echo 2. No internet connection
    echo 3. Authentication required
    echo.
    echo To set up remote:
    echo git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    echo.
    echo Or deploy using Netlify CLI:
    echo netlify deploy --prod
    echo.
)

pause