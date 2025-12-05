@echo off
echo Copying Purely Plutonic files to local repository...

set SOURCE=C:\Users\sbthm\OneDrive\Desktop\bolt\purelyplutonicnew
set DEST=C:\Users\sbthm\OneDrive\Desktop\bolt\purelyplutonicnew

REM Copy root files
copy /Y package.json "%DEST%\"
copy /Y package-lock.json "%DEST%\"
copy /Y tsconfig.json "%DEST%\"
copy /Y tsconfig.app.json "%DEST%\"
copy /Y tsconfig.node.json "%DEST%\"
copy /Y vite.config.ts "%DEST%\"
copy /Y tailwind.config.js "%DEST%\"
copy /Y postcss.config.js "%DEST%\"
copy /Y eslint.config.js "%DEST%\"
copy /Y index.html "%DEST%\"
copy /Y .gitignore "%DEST%\"
copy /Y vercel.json "%DEST%\"
copy /Y capacitor.config.ts "%DEST%\"

REM Create directories
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

echo Copying source files...
copy /Y src\*.* "%DEST%\src\"
copy /Y src\components\*.* "%DEST%\src\components\"
copy /Y src\context\*.* "%DEST%\src\context\"
copy /Y src\hooks\*.* "%DEST%\src\hooks\"
copy /Y src\lib\*.* "%DEST%\src\lib\"
copy /Y src\services\*.* "%DEST%\src\services\"
copy /Y src\stores\*.* "%DEST%\src\stores\"

echo Copying public files...
copy /Y public\*.* "%DEST%\public\"

echo Copying Supabase files...
copy /Y supabase\migrations\*.* "%DEST%\supabase\migrations\"
copy /Y supabase\functions\send-push-notification\*.* "%DEST%\supabase\functions\send-push-notification\"

echo Copying Android files...
copy /Y android\app\src\main\AndroidManifest.xml "%DEST%\android\app\src\main\"
copy /Y android\app\src\main\res\values\strings.xml "%DEST%\android\app\src\main\res\values\"

echo.
echo Files copied successfully!
echo.
echo Next steps:
echo 1. cd C:\Users\sbthm\OneDrive\Desktop\bolt\purelyplutonicnew
echo 2. git add .
echo 3. git commit -m "Initial commit"
echo 4. git push origin main
echo.
pause
