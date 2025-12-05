@echo off
echo Copying auth fixes to your project...

set DEST="C:\Users\sbthm\OneDrive\Desktop\bolt"

echo Copying supabase.ts (removed email redirect)...
copy /Y "src\lib\supabase.ts" %DEST%\src\lib\supabase.ts

echo Copying SignUpFlow.tsx (auto-login after signup)...
copy /Y "src\components\SignUpFlow.tsx" %DEST%\src\components\SignUpFlow.tsx

echo Copying App.tsx (refresh auth state after signup)...
copy /Y "src\App.tsx" %DEST%\src\App.tsx

echo.
echo Done! Files copied to your project.
echo.
echo Next steps:
echo 1. Open Command Prompt or PowerShell
echo 2. Run: cd "C:\Users\sbthm\OneDrive\Desktop\bolt"
echo 3. Run: git add .
echo 4. Run: git commit -m "Fix email verification - auto-login after signup"
echo 5. Run: git push
echo.
echo Vercel will automatically deploy your changes!
pause
