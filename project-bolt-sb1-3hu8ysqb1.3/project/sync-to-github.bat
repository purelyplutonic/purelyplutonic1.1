@echo off
echo ========================================
echo Purely Plutonic - Sync to GitHub
echo ========================================
echo.

REM UPDATE THIS PATH TO YOUR LOCAL REPOSITORY
set DEST=C:\Users\sbthm\OneDrive\Desktop\bolt\purelyplutonicnew

echo Syncing all files to: %DEST%
echo.

REM Copy root config files
echo [1/8] Copying configuration files...
copy /Y package.json "%DEST%\" >nul
copy /Y package-lock.json "%DEST%\" >nul
copy /Y tsconfig.json "%DEST%\" >nul
copy /Y tsconfig.app.json "%DEST%\" >nul
copy /Y tsconfig.node.json "%DEST%\" >nul
copy /Y vite.config.ts "%DEST%\" >nul
copy /Y tailwind.config.js "%DEST%\" >nul
copy /Y postcss.config.js "%DEST%\" >nul
copy /Y eslint.config.js "%DEST%\" >nul
copy /Y index.html "%DEST%\" >nul
copy /Y .gitignore "%DEST%\" >nul
copy /Y vercel.json "%DEST%\" >nul
copy /Y capacitor.config.ts "%DEST%\" >nul
copy /Y .env "%DEST%\" >nul

REM Create directories
echo [2/8] Creating directory structure...
mkdir "%DEST%\src" 2>nul
mkdir "%DEST%\src\components" 2>nul
mkdir "%DEST%\src\context" 2>nul
mkdir "%DEST%\src\hooks" 2>nul
mkdir "%DEST%\src\lib" 2>nul
mkdir "%DEST%\src\services" 2>nul
mkdir "%DEST%\src\stores" 2>nul
mkdir "%DEST%\public" 2>nul
mkdir "%DEST%\supabase" 2>nul
mkdir "%DEST%\supabase\migrations" 2>nul
mkdir "%DEST%\supabase\functions" 2>nul
mkdir "%DEST%\supabase\functions\send-push-notification" 2>nul
mkdir "%DEST%\android" 2>nul
mkdir "%DEST%\android\app" 2>nul
mkdir "%DEST%\android\app\src" 2>nul
mkdir "%DEST%\android\app\src\main" 2>nul
mkdir "%DEST%\android\app\src\main\res" 2>nul
mkdir "%DEST%\android\app\src\main\res\values" 2>nul

REM Copy source files
echo [3/8] Copying source files...
copy /Y src\*.* "%DEST%\src\" >nul

echo [4/8] Copying components...
copy /Y src\components\*.* "%DEST%\src\components\" >nul

echo [5/8] Copying hooks, context, lib, services, stores...
copy /Y src\context\*.* "%DEST%\src\context\" >nul
copy /Y src\hooks\*.* "%DEST%\src\hooks\" >nul
copy /Y src\lib\*.* "%DEST%\src\lib\" >nul
copy /Y src\services\*.* "%DEST%\src\services\" >nul
copy /Y src\stores\*.* "%DEST%\src\stores\" >nul

echo [6/8] Copying public files...
copy /Y public\*.* "%DEST%\public\" >nul

echo [7/8] Copying Supabase files...
copy /Y supabase\migrations\*.* "%DEST%\supabase\migrations\" >nul
copy /Y supabase\functions\send-push-notification\*.* "%DEST%\supabase\functions\send-push-notification\" >nul

echo [8/8] Copying Android files...
copy /Y android\app\src\main\AndroidManifest.xml "%DEST%\android\app\src\main\" >nul
copy /Y android\app\src\main\res\values\strings.xml "%DEST%\android\app\src\main\res\values\" >nul

echo.
echo ========================================
echo ✓ Sync Complete!
echo ========================================
echo.
echo Files have been copied to your local repository.
echo GitHub Desktop will now show all changes.
echo.
echo Next steps:
echo 1. Open GitHub Desktop
echo 2. Review the changes in the "Changes" tab
echo 3. Write a commit message
echo 4. Click "Commit to main"
echo 5. Click "Push origin"
echo.
pause
